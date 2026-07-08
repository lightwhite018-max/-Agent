$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repo

$localVite = Join-Path $repo "node_modules\.bin\vite.cmd"
$bundledPnpm = "C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\pnpm.cmd"

if (Test-Path -LiteralPath $localVite) {
    Write-Host "Starting development server with local Vite..." -ForegroundColor Cyan
    & $localVite --host 127.0.0.1 --port 5173
    exit $LASTEXITCODE
}

if (Test-Path -LiteralPath $bundledPnpm) {
    Write-Host "Dependencies are missing. Installing with bundled pnpm..." -ForegroundColor Cyan
    & $bundledPnpm install
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }

    Write-Host "Starting development server..." -ForegroundColor Cyan
    & $bundledPnpm dev -- --host 127.0.0.1 --port 5173
    exit $LASTEXITCODE
}

throw "Cannot find local Vite or pnpm. Please install Node.js and pnpm, then run pnpm install."
