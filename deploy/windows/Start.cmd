@echo off
setlocal
pushd "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\FrameFlow.ps1" -Action Start %*
set "result=%errorlevel%"
if not "%result%"=="0" pause
popd
exit /b %result%
