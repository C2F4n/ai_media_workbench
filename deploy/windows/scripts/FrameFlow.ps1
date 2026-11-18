param(
    [ValidateSet('Start', 'Stop', 'Status', 'Check')][string]$Action = 'Start',
    [switch]$NoBrowser
)
$ErrorActionPreference = 'Stop'
$packageRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Set-Location -LiteralPath $packageRoot
$statePath = Join-Path $packageRoot 'run/processes.json'
$settingsPath = Join-Path $packageRoot 'config/launcher.json'
$javaExe = Join-Path $packageRoot 'runtime/java/bin/java.exe'
$nginxExe = Join-Path $packageRoot 'tools/nginx/nginx.exe'
$jarPath = Join-Path $packageRoot 'app/frameflow.jar'
$utf8 = New-Object Text.UTF8Encoding($false)

# Quote arguments for CreateProcess (Start-Process joins ArgumentList on Windows).
function Quote-Argument([string]$Value) {
    '"' + [regex]::Replace([regex]::Replace($Value, '(\\*)"', '$1$1\"'), '(\\+)$', '$1$1') + '"'
}
function Start-Hidden([string]$Executable, [string[]]$Arguments, [string]$LogName) {
    $joined = ($Arguments | ForEach-Object { Quote-Argument $_ }) -join ' '
    $process = Start-Process -FilePath $Executable -ArgumentList $joined -WorkingDirectory $packageRoot `
        -WindowStyle Hidden -PassThru -RedirectStandardOutput "logs/$LogName.stdout.log" `
        -RedirectStandardError "logs/$LogName.stderr.log"
    # Cache the native handle before a short-lived command exits (Windows PowerShell 5.1).
    $null = $process.Handle
    return $process
}
function Get-Identity($Process) {
    @{ pid = $Process.Id; started = $Process.StartTime.ToUniversalTime().Ticks.ToString(); executable = $Process.Path }
}
# A saved PID alone is unsafe: Windows may have reused it for another application.
function Get-OwnedProcess($Identity, [string]$ExpectedPath) {
    if ($null -eq $Identity) { return $null }
    $candidate = Get-Process -Id ([int]$Identity.pid) -ErrorAction SilentlyContinue
    if ($null -eq $candidate) { return $null }
    try {
        if ($candidate.Path -ieq $ExpectedPath -and $Identity.executable -ieq $ExpectedPath -and
            $candidate.StartTime.ToUniversalTime().Ticks.ToString() -eq [string]$Identity.started) { return $candidate }
    } catch { return $null }
    return $null
}
function Save-State { [IO.File]::WriteAllText($statePath, ($script:state | ConvertTo-Json -Depth 5), $utf8) }
function Wait-Exit($Process, [int]$Milliseconds) {
    if ($null -ne $Process -and -not $Process.WaitForExit($Milliseconds)) {
        Stop-Process -Id $Process.Id -ErrorAction SilentlyContinue
        $null = $Process.WaitForExit(5000)
    }
}
function Stop-Owned {
    $nginxProcess = Get-OwnedProcess $script:state.nginx $nginxExe
    if ($null -ne $nginxProcess) {
        $quit = Start-Hidden $nginxExe @('-p', ($packageRoot.Replace('\', '/') + '/'), '-c', 'run/nginx.conf', '-s', 'quit') 'nginx-stop'
        $null = $quit.WaitForExit(5000)
        Wait-Exit $nginxProcess 12000
        # Workers share this package's unique executable path; other Nginx installs are untouched.
        Get-Process -Name nginx -ErrorAction SilentlyContinue | Where-Object {
            try { $_.Path -ieq $nginxExe } catch { $false }
        } | Stop-Process -ErrorAction SilentlyContinue
    }
    $javaProcess = Get-OwnedProcess $script:state.backend $javaExe
    if ($null -ne $javaProcess) {
        Stop-Process -Id $javaProcess.Id -ErrorAction SilentlyContinue
        $null = $javaProcess.WaitForExit(10000)
    }
    if (Test-Path -LiteralPath $statePath) { Remove-Item -LiteralPath $statePath }
}
function Assert-FreePort([string]$Address, [int]$Port) {
    $listener = New-Object Net.Sockets.TcpListener([Net.IPAddress]::Parse($Address), $Port)
    try { $listener.Start() } catch { throw "Port $Address`:$Port is in use. Change config/launcher.json; no existing process was stopped." }
    finally { $listener.Stop() }
}
function Write-Properties([string]$Path, [string]$Value) {
    # Properties files are ASCII with Java Unicode escapes, including relocated Chinese paths.
    $escaped = New-Object Text.StringBuilder
    foreach ($character in $Value.ToCharArray()) {
        if ([int]$character -gt 127) { $null = $escaped.Append(('\u{0:x4}' -f [int]$character)) }
        else { $null = $escaped.Append($character) }
    }
    [IO.File]::WriteAllText($Path, $escaped.ToString(), [Text.Encoding]::ASCII)
}
function Test-Ready([string]$Url) {
    try {
        $request = [Net.WebRequest]::Create("$Url/api/system/capabilities")
        $request.Proxy = $null
        $request.Timeout = 3000
        $response = $request.GetResponse()
        try {
            $reader = New-Object IO.StreamReader($response.GetResponseStream())
            try { return (($reader.ReadToEnd() | ConvertFrom-Json).code -eq 'SUCCESS') } finally { $reader.Dispose() }
        } finally { $response.Dispose() }
    } catch { return $false }
}
function Wait-Ready([string]$Url, $Process, [int]$TimeoutSeconds) {
    $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
    do {
        $Process.Refresh()
        if ($Process.HasExited) { throw 'Backend exited. Check logs/backend.log and logs/backend.stderr.log (database/password/permissions).' }
        if (Test-Ready $Url) { return }
        Start-Sleep -Milliseconds 500
    } while ([DateTime]::UtcNow -lt $deadline)
    throw "Startup timed out at $Url. See logs/backend.log."
}

$controlLock = $null
$startedHere = $false
try {
    foreach ($directory in @('run', 'logs', 'data/storage', 'data/keys', 'data/nginx-cache/client_body', 'data/nginx-cache/proxy')) {
        $null = New-Item -ItemType Directory -Path (Join-Path $packageRoot $directory) -Force
    }
    $controlLock = [IO.File]::Open((Join-Path $packageRoot 'run/control.lock'), 'OpenOrCreate', 'ReadWrite', 'None')
    $script:state = @{ backend = $null; nginx = $null }
    if (Test-Path -LiteralPath $statePath) { $script:state = Get-Content -LiteralPath $statePath -Raw -Encoding UTF8 | ConvertFrom-Json }
    if ($Action -eq 'Stop') {
        Stop-Owned
        Write-Host 'FrameFlow stopped. Your MySQL service and other applications were not stopped.'
        exit 0
    }
    if ($Action -eq 'Status') {
        Write-Host ('Backend: ' + $(if ($null -ne (Get-OwnedProcess $script:state.backend $javaExe)) { 'RUNNING' } else { 'STOPPED' }))
        Write-Host ('Nginx:   ' + $(if ($null -ne (Get-OwnedProcess $script:state.nginx $nginxExe)) { 'RUNNING' } else { 'STOPPED' }))
        if ($script:state.url) { Write-Host $script:state.url }
        exit 0
    }
    foreach ($required in @($javaExe, $nginxExe, $jarPath, $settingsPath, 'tools/ffmpeg/bin/ffmpeg.exe', 'tools/ffmpeg/bin/ffprobe.exe')) {
        if (-not (Test-Path -LiteralPath $required -PathType Leaf)) { throw "Missing file: $required" }
    }
    $settings = Get-Content -LiteralPath $settingsPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($settings.listenAddress -notin @('127.0.0.1', '0.0.0.0')) { throw 'listenAddress must be 127.0.0.1 or 0.0.0.0.' }
    foreach ($port in @($settings.httpPort, $settings.backendPort)) {
        if ($port -isnot [int] -and $port -isnot [long]) { throw 'Ports must be integer JSON values.' }
        if ($port -lt 1024 -or $port -gt 65535) { throw 'Ports must be between 1024 and 65535.' }
    }
    if ($settings.backendPort -eq $settings.httpPort) { throw 'HTTP and backend ports must be different.' }
    if ($settings.startupTimeoutSeconds -lt 10 -or $settings.startupTimeoutSeconds -gt 600) { throw 'startupTimeoutSeconds must be between 10 and 600.' }
    $url = "http://127.0.0.1:$($settings.httpPort)"
    $ownedJava = Get-OwnedProcess $script:state.backend $javaExe
    $ownedNginx = Get-OwnedProcess $script:state.nginx $nginxExe
    if ($null -ne $ownedJava -or $null -ne $ownedNginx) {
        if ($null -ne $ownedJava -and $null -ne $ownedNginx -and (Test-Ready $script:state.url)) {
            Write-Host "Already running: $($script:state.url). Restart to apply config changes."
            if ($Action -eq 'Start' -and -not $NoBrowser -and $settings.openBrowser) { Start-Process $script:state.url }
            exit 0
        }
        throw 'A previous start is incomplete. Run Stop.cmd, then Start.cmd.'
    }
    # A placeholder is rejected without logging any secret values.
    $databaseConfig = Get-Content -LiteralPath 'config/database.properties' -Raw
    if (-not $env:DB_USERNAME -and $databaseConfig -match '(?m)^DB_USERNAME\s*=\s*(your_database_user)?\s*$') {
        throw 'Fill DB_USERNAME and DB_PASSWORD in config/database.properties first. MySQL must be running.'
    }
    Assert-FreePort $settings.listenAddress $settings.httpPort
    Assert-FreePort '127.0.0.1' $settings.backendPort
    if ($Action -eq 'Check') {
        & $javaExe -version
        if ($LASTEXITCODE -ne 0) { throw 'Bundled Java cannot run.' }
        & (Join-Path $packageRoot 'tools/ffmpeg/bin/ffprobe.exe') -version | Select-Object -First 1
        if ($LASTEXITCODE -ne 0) { throw 'Bundled FFprobe cannot run.' }
        Write-Host "Files and ports OK. Start.cmd will verify the MySQL connection. URL: $url"
        exit 0
    }
    $prefix = $packageRoot.Replace('\', '/')
    # Command-line properties keep executable/data paths independent of the installation directory.
    $runtimeConfig = @"
server.address=127.0.0.1
server.port=$($settings.backendPort)
app.media-tool.ffprobe=$prefix/tools/ffmpeg/bin/ffprobe.exe
app.transcode.ffmpeg=$prefix/tools/ffmpeg/bin/ffmpeg.exe
app.storage.root=$prefix/data/storage
app.cloud-credentials.key-file=$prefix/data/keys/cloud-credentials.key
logging.file.name=$prefix/logs/backend.log
"@
    Write-Properties (Join-Path $packageRoot 'run/runtime.properties') $runtimeConfig
    # Nginx uses a fixed prefix so its config works when the folder is moved.
    $nginxConfig = @'
worker_processes 1;
worker_shutdown_timeout 10s;
error_log logs/nginx.error.log warn;
pid run/nginx.pid;
events { worker_connections 512; }
http {
    include ../tools/nginx/conf/mime.types;
    default_type application/octet-stream;
    access_log off;
    server_tokens off;
    client_max_body_size 3073m;
    client_body_temp_path data/nginx-cache/client_body;
    proxy_temp_path data/nginx-cache/proxy;
    fastcgi_temp_path data/nginx-cache/fastcgi;
    uwsgi_temp_path data/nginx-cache/uwsgi;
    scgi_temp_path data/nginx-cache/scgi;
    server {
        listen __ADDRESS__:__HTTP_PORT__;
        server_name _;
        location / {
            proxy_pass http://127.0.0.1:__BACKEND_PORT__;
            proxy_http_version 1.1;
            proxy_set_header Host $http_host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $remote_addr;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Forwarded "";
            proxy_set_header X-Forwarded-Host "";
            proxy_set_header X-Forwarded-Port "";
            proxy_set_header Connection "";
            proxy_connect_timeout 5s;
            proxy_read_timeout 180s;
            proxy_send_timeout 180s;
            proxy_next_upstream off;
        }
    }
}
'@
    $nginxConfig = $nginxConfig.Replace('__ADDRESS__', [string]$settings.listenAddress).Replace('__HTTP_PORT__', [string]$settings.httpPort).Replace('__BACKEND_PORT__', [string]$settings.backendPort)
    [IO.File]::WriteAllText((Join-Path $packageRoot 'run/nginx.conf'), $nginxConfig, $utf8)
    # Nginx initially opens its built-in error log before reading the custom config.
    $null = New-Item -ItemType Directory -Path 'tools/nginx/logs' -Force
    $configTest = Start-Hidden $nginxExe @('-p', "$prefix/", '-c', 'run/nginx.conf', '-t') 'nginx-check'
    if (-not $configTest.WaitForExit(10000)) { throw 'Nginx config validation timed out.' }
    if ($configTest.ExitCode -ne 0) { throw 'Nginx config validation failed. See logs/nginx-check.stderr.log.' }
    $script:state = @{ backend = $null; nginx = $null; url = $url }
    $startedHere = $true
    Write-Host 'Starting FrameFlow; first startup creates the database and tables...'
    $javaArguments = @($settings.javaOptions) + @('-jar', $jarPath, '--spring.config.additional-location=file:./config/application.properties,file:./run/runtime.properties')
    $backend = Start-Hidden $javaExe $javaArguments 'backend'
    $script:state.backend = Get-Identity $backend
    Save-State
    Wait-Ready "http://127.0.0.1:$($settings.backendPort)" $backend $settings.startupTimeoutSeconds
    $nginxProcess = Start-Hidden $nginxExe @('-p', "$prefix/", '-c', 'run/nginx.conf') 'nginx'
    $script:state.nginx = Get-Identity $nginxProcess
    Save-State
    Wait-Ready $url $backend 15
    Write-Host "FrameFlow ready: $url"
    Write-Host 'Use Stop.cmd before moving the folder or editing configuration.'
    if (-not $NoBrowser -and $settings.openBrowser) { Start-Process $url }
} catch {
    if ($startedHere) { try { Stop-Owned } catch { Write-Warning 'Automatic cleanup failed; run Stop.cmd.' } }
    Write-Host ("ERROR: " + $_.Exception.Message) -ForegroundColor Red
    Write-Host "Logs: $packageRoot\logs"
    exit 1
} finally {
    if ($null -ne $controlLock) { $controlLock.Dispose() }
}
