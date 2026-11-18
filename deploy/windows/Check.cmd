@echo off
setlocal
pushd "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\FrameFlow.ps1" -Action Check
set "result=%errorlevel%"
pause
popd
exit /b %result%
