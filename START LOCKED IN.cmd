@echo off
setlocal
title LOCKED IN Launcher

cd /d "%~dp0"

set "LOCKED_NODE=C:\Users\Andrei\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "LOCKED_NEXT=%~dp0node_modules\next\dist\bin\next"

if not exist "%LOCKED_NODE%" (
  echo.
  echo [LOCKED IN] The bundled Node.js runtime could not be found.
  echo Expected: %LOCKED_NODE%
  echo.
  echo Open this project in Codex and ask it to restore the runtime.
  pause
  exit /b 1
)

if not exist "%LOCKED_NEXT%" (
  echo.
  echo [LOCKED IN] Project dependencies are missing.
  echo Open this project in Codex and ask it to reinstall dependencies.
  pause
  exit /b 1
)

if /I "%~1"=="--check" (
  echo LOCKED IN launcher ready.
  echo Project: %CD%
  echo Runtime: %LOCKED_NODE%
  exit /b 0
)

if /I "%~1"=="--foreground" (
  "%LOCKED_NODE%" "%LOCKED_NEXT%" dev
  exit /b %errorlevel%
)

echo.
echo ==================================================
echo   LOCKED IN
echo   Build the life. Track the proof.
echo ==================================================
echo.
echo Starting at http://localhost:3000
echo Keep this window open while using the app.
echo Press Ctrl+C when you want to stop it.
echo.

start "" powershell.exe -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 4; Start-Process 'http://localhost:3000'"
"%LOCKED_NODE%" "%LOCKED_NEXT%" dev

endlocal
