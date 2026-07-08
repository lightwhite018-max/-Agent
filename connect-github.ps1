$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repo

$remoteUrl = "https://github.com/lightwhite018-max/-Agent.git"

function Invoke-Git {
    git @args
    if ($LASTEXITCODE -ne 0) {
        throw "Git command failed: git $args"
    }
}

Write-Host "Checking Git..." -ForegroundColor Cyan
Invoke-Git --version | Out-Host

Write-Host "Preparing local repository..." -ForegroundColor Cyan
Invoke-Git config --global --add safe.directory $repo

if (-not (Test-Path -LiteralPath ".git")) {
    Invoke-Git init -b main
}

Invoke-Git branch -M main
Invoke-Git config core.quotepath false

$gitUserName = git config user.name
$gitUserEmail = git config user.email

if ([string]::IsNullOrWhiteSpace($gitUserName)) {
    $gitUserName = Read-Host "Enter your Git commit name, for example lightwhite018-max"
    Invoke-Git config user.name $gitUserName
}

if ([string]::IsNullOrWhiteSpace($gitUserEmail)) {
    $gitUserEmail = Read-Host "Enter your Git commit email, for example your GitHub email"
    Invoke-Git config user.email $gitUserEmail
}

$originExists = (git remote) -contains "origin"
if ($originExists) {
    Invoke-Git remote set-url origin $remoteUrl
} else {
    Invoke-Git remote add origin $remoteUrl
}

Write-Host "Creating commit if there are local changes..." -ForegroundColor Cyan
Invoke-Git add -A

$hasStagedChanges = $true
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
    $hasStagedChanges = $false
}

if ($hasStagedChanges) {
    Invoke-Git commit -m "Initial commit"
} else {
    Write-Host "No new files to commit."
}

Write-Host "Uploading to GitHub..." -ForegroundColor Cyan
Invoke-Git push -u origin main

Write-Host "Done. Repository is connected to $remoteUrl" -ForegroundColor Green
