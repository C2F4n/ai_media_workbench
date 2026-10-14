param([string]$NginxHome)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
if (-not $NginxHome) {
    $workspaceParent = Split-Path -Parent $projectRoot
    foreach ($candidate in Get-ChildItem -LiteralPath $workspaceParent -Directory -Filter 'nginx-*') {
        if (Test-Path -LiteralPath (Join-Path $candidate.FullName 'nginx.exe')) {
            $NginxHome = $candidate.FullName
            break
        }
        foreach ($nested in Get-ChildItem -LiteralPath $candidate.FullName -Directory) {
            if (Test-Path -LiteralPath (Join-Path $nested.FullName 'nginx.exe')) {
                $NginxHome = $nested.FullName
                break
            }
        }
        if ($NginxHome) { break }
    }
}
if (-not $NginxHome) { throw 'Nginx was not found; specify -NginxHome.' }
$NginxHome = (Resolve-Path -LiteralPath $NginxHome).Path
$nginxExe = Join-Path $NginxHome 'nginx.exe'
$configSource = Join-Path $PSScriptRoot 'nginx\nginx.conf'
$configTarget = Join-Path $NginxHome 'conf\ai-media-workbench.conf'
Copy-Item -LiteralPath $configSource -Destination $configTarget
$originalDirectory = (Get-Location).Path
try {
    Set-Location -LiteralPath $NginxHome
    & $nginxExe -p './' -c 'conf/ai-media-workbench.conf' -t
    if ($LASTEXITCODE -ne 0) { throw 'Nginx configuration validation failed.' }
    $pidPath = Join-Path $NginxHome 'logs\ai-media-workbench.pid'
    $nginxProcessId = 0
    $running = $null
    if (Test-Path -LiteralPath $pidPath) {
        $pidContents = Get-Content -LiteralPath $pidPath -TotalCount 1
        if ($pidContents -match '^\s*([0-9]+)\s*$') {
            $nginxProcessId = [int]$Matches[1]
            $running = Get-CimInstance Win32_Process -Filter "ProcessId = $nginxProcessId"
        }
    }
    if ($running) {
        if ($running.Name -ne 'nginx.exe' -or -not $running.CommandLine.Contains('ai-media-workbench.conf')) {
            throw 'The recorded PID belongs to another process.'
        }
        & $nginxExe -p './' -c 'conf/ai-media-workbench.conf' -s reload
        if ($LASTEXITCODE -ne 0) { throw 'Nginx reload failed.' }
    } else {
        Start-Process -FilePath $nginxExe -ArgumentList @('-p', './', '-c', 'conf/ai-media-workbench.conf') `
            -WorkingDirectory $NginxHome -WindowStyle Hidden
    }
    Write-Output 'Account page: http://127.0.0.1:8088'
} finally {
    Set-Location -LiteralPath $originalDirectory
}
