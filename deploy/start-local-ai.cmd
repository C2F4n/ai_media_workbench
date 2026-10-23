@echo off
setlocal
set "RUNTIME=%~dp0..\..\llama.cpp\b11669-vulkan-x64\llama-server.exe"
if not defined MODEL_ROOT set "MODEL_ROOT=%~dp0..\..\models"
rem Default: Qwen3.5-9B UD-Q5_K_XL (about 6.3GB). Fits a 12GB card with room for 32K context.
set "MODEL=%MODEL_ROOT%\Qwen3.5-9B\Qwen3.5-9B-UD-Q5_K_XL.gguf"
set "DEFAULT_MODEL_NAME=qwen3.5-9b"
set "CTX=32768"
rem Fall back to the smaller 4B model when the 9B file is absent.
if not exist "%MODEL%" (
  set "MODEL=%MODEL_ROOT%\Qwen3.5-4B\Qwen3.5-4B-Q4_K_M.gguf"
  set "DEFAULT_MODEL_NAME=qwen3.5-4b"
  set "CTX=8192"
)
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
if not defined LOCAL_AI_MODEL set "LOCAL_AI_MODEL=%DEFAULT_MODEL_NAME%"
echo Local AI: http://127.0.0.1:%LOCAL_AI_PORT% - model "%MODEL%" - ctx %CTX% - press Ctrl+C to stop.
if defined LOCAL_AI_API_KEY (
  "%RUNTIME%" --model "%MODEL%" --device Vulkan0 --split-mode none --gpu-layers all --fit off --ctx-size %CTX% --parallel 1 --batch-size 1024 --ubatch-size 512 --flash-attn on --threads 4 --threads-batch 4 --prio -1 --poll 0 --host 127.0.0.1 --port %LOCAL_AI_PORT% --alias "%LOCAL_AI_MODEL%" --api-key "%LOCAL_AI_API_KEY%" --timeout 180 --no-webui --offline --reasoning off
) else (
  "%RUNTIME%" --model "%MODEL%" --device Vulkan0 --split-mode none --gpu-layers all --fit off --ctx-size %CTX% --parallel 1 --batch-size 1024 --ubatch-size 512 --flash-attn on --threads 4 --threads-batch 4 --prio -1 --poll 0 --host 127.0.0.1 --port %LOCAL_AI_PORT% --alias "%LOCAL_AI_MODEL%" --timeout 180 --no-webui --offline --reasoning off
)
if errorlevel 1 pause
