@echo off
setlocal
set "RUNTIME=%~dp0..\..\llama.cpp\b11669-vulkan-x64\llama-server.exe"
set "MODEL=%~dp0..\..\models\Qwen3.5-4B\Qwen3.5-4B-Q4_K_M.gguf"
if not exist "%RUNTIME%" (
  echo Missing llama.cpp runtime: "%RUNTIME%"
  pause
  exit /b 1
)
if not exist "%MODEL%" (
  echo Missing model: "%MODEL%"
  pause
  exit /b 1
)
if not defined LOCAL_AI_PORT set "LOCAL_AI_PORT=18565"
if not defined LOCAL_AI_MODEL set "LOCAL_AI_MODEL=qwen3.5-4b"
echo Local AI: http://127.0.0.1:%LOCAL_AI_PORT% - press Ctrl+C to stop.
if defined LOCAL_AI_API_KEY (
  "%RUNTIME%" --model "%MODEL%" --device Vulkan0 --split-mode none --gpu-layers all --fit off --ctx-size 8192 --parallel 1 --batch-size 128 --ubatch-size 128 --threads 4 --threads-batch 4 --prio -1 --poll 0 --host 127.0.0.1 --port %LOCAL_AI_PORT% --alias "%LOCAL_AI_MODEL%" --api-key "%LOCAL_AI_API_KEY%" --timeout 35 --no-webui --offline --reasoning off
) else (
  "%RUNTIME%" --model "%MODEL%" --device Vulkan0 --split-mode none --gpu-layers all --fit off --ctx-size 8192 --parallel 1 --batch-size 128 --ubatch-size 128 --threads 4 --threads-batch 4 --prio -1 --poll 0 --host 127.0.0.1 --port %LOCAL_AI_PORT% --alias "%LOCAL_AI_MODEL%" --timeout 35 --no-webui --offline --reasoning off
)
if errorlevel 1 pause
