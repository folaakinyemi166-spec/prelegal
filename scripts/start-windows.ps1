$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot)

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example - edit it before running in production."
}

docker compose up --build -d
Write-Host "Prelegal is running at http://localhost:8000"
