param(
    [string]$OutputDirectory,
    [string]$JavaHome = 'C:\Program Files\Java\jdk-21',
    [string]$NginxDirectory,
    [string]$FfmpegDirectory,
    [switch]$SkipBuild
)
$ErrorActionPreference = 'Stop'
$repository = Split-Path -Parent $PSScriptRoot
$outer = Split-Path -Parent $repository
if (-not $OutputDirectory) { $OutputDirectory = Join-Path $outer 'FrameFlow-Windows' }
if (-not $NginxDirectory) { $NginxDirectory = Join-Path $outer 'nginx-1.30.5/nginx-1.30.5' }
if (-not $FfmpegDirectory) { $FfmpegDirectory = Join-Path $outer 'ffmpeg' }
$output = [IO.Path]::GetFullPath($OutputDirectory)
if (Test-Path -LiteralPath $output) {
    if (@(Get-ChildItem -LiteralPath $output -Force).Count -gt 0) {
        throw 'Output directory is not empty. Choose a new directory to preserve user configuration/data.'
    }
}
foreach ($source in @("$JavaHome/bin/jlink.exe", "$JavaHome/jmods/java.base.jmod", "$NginxDirectory/nginx.exe", "$FfmpegDirectory/bin/ffmpeg.exe", "$FfmpegDirectory/bin/ffprobe.exe")) {
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw "Missing dependency: $source" }
}
Push-Location -LiteralPath $repository
try {
    if (-not $SkipBuild) {
        & '.\gradlew.bat' bootJar
        if ($LASTEXITCODE -ne 0) { throw 'Gradle bootJar failed.' }
    }
    $jar = Get-ChildItem -LiteralPath 'build/libs' -Filter '*.jar' | Where-Object { $_.Name -notlike '*-plain.jar' } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $jar) { throw 'No Spring Boot JAR found. Run gradlew.bat bootJar first.' }
    foreach ($folder in @('app', 'runtime', 'tools/nginx/conf', 'tools/nginx/logs', 'tools/ffmpeg/bin', 'logs', 'run', 'data/storage', 'data/keys')) {
        $null = New-Item -ItemType Directory -Path (Join-Path $output $folder) -Force
    }
    Copy-Item -Path (Join-Path $PSScriptRoot 'windows/*') -Destination $output -Recurse
    Copy-Item -LiteralPath $jar.FullName -Destination (Join-Path $output 'app/frameflow.jar')
    Copy-Item -LiteralPath "$NginxDirectory/nginx.exe" -Destination (Join-Path $output 'tools/nginx/nginx.exe')
    Copy-Item -LiteralPath "$NginxDirectory/conf/mime.types" -Destination (Join-Path $output 'tools/nginx/conf/mime.types')
    Copy-Item -LiteralPath "$NginxDirectory/docs" -Destination (Join-Path $output 'tools/nginx/docs') -Recurse
    foreach ($file in @('bin/ffmpeg.exe', 'bin/ffprobe.exe', 'LICENSE', 'README.txt')) {
        Copy-Item -LiteralPath (Join-Path $FfmpegDirectory $file) -Destination (Join-Path $output "tools/ffmpeg/$file")
    }
    Write-Host 'Creating bundled Java 21 runtime...'
    & "$JavaHome/bin/jlink.exe" --module-path "$JavaHome/jmods" `
        --add-modules 'java.se,jdk.crypto.ec,jdk.unsupported,jdk.charsets,jdk.localedata,jdk.zipfs,jdk.management,jdk.attach' `
        --bind-services --strip-debug --no-header-files --no-man-pages --compress=2 `
        --output (Join-Path $output 'runtime/java')
    if ($LASTEXITCODE -ne 0) { throw 'jlink failed.' }
    foreach ($file in @('LICENSE', 'README')) {
        if (Test-Path -LiteralPath "$JavaHome/$file") { Copy-Item -LiteralPath "$JavaHome/$file" -Destination (Join-Path $output "runtime/java/$file") }
    }
    # Keep Windows CRT dependencies beside java.exe for machines without a JDK installed.
    foreach ($dll in (Get-ChildItem -LiteralPath "$JavaHome/bin" -Filter '*140*.dll')) {
        Copy-Item -LiteralPath $dll.FullName -Destination (Join-Path $output "runtime/java/bin/$($dll.Name)") -Force
    }
    # Windows PowerShell 5.1 needs BOM for Chinese documentation and .ps1 source.
    $bom = New-Object Text.UTF8Encoding($true)
    Get-ChildItem -LiteralPath $output -Recurse -File | Where-Object { $_.Extension -eq '.ps1' -or $_.Name -eq 'README.txt' -and $_.DirectoryName -eq $output } | ForEach-Object {
        $body = [IO.File]::ReadAllText($_.FullName)
        [IO.File]::WriteAllText($_.FullName, $body, $bom)
    }
    $startAlias = Join-Path $output (([string][char]0x542f) + [char]0x52a8 + '.cmd')
    Copy-Item -LiteralPath (Join-Path $output 'Start.cmd') -Destination $startAlias
    $manifest = Get-ChildItem -LiteralPath $output -Recurse -File | Sort-Object FullName | ForEach-Object {
        $relative = $_.FullName.Substring($output.Length + 1).Replace('\', '/')
        '{0}  {1}' -f (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant(), $relative
    }
    [IO.File]::WriteAllLines((Join-Path $output 'SHA256SUMS.txt'), [string[]]$manifest, (New-Object Text.UTF8Encoding($false)))
    Write-Host "Package complete: $output"
    Write-Host 'Fill config/database.properties, then double-click Start.cmd.'
} finally { Pop-Location }
