$ErrorActionPreference = "Stop"

$projectDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeExecutable = "C:\Users\Andrei\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$nextExecutable = Join-Path $projectDirectory "node_modules\next\dist\bin\next"

if (-not (Test-Path -LiteralPath $nodeExecutable)) {
    throw "The bundled Node.js runtime was not found at $nodeExecutable"
}

if (-not (Test-Path -LiteralPath $nextExecutable)) {
    throw "Project dependencies are missing. Ask Codex to reinstall them."
}

Set-Location -LiteralPath $projectDirectory
Write-Host ""
Write-Host "LOCKED IN" -ForegroundColor Cyan
Write-Host "Build the life. Track the proof."
Write-Host ""
Write-Host "Opening http://localhost:3000" -ForegroundColor Green
Write-Host "Keep this window open while using the app. Press Ctrl+C to stop."

Start-Process "http://localhost:3000"
& $nodeExecutable $nextExecutable dev
