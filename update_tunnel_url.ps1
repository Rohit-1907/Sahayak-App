param (
    [string]$TunnelUrl
)

if (-not $TunnelUrl) {
    $TunnelUrl = Read-Host "Paste your Cloudflare Tunnel URL (e.g. https://xyz.trycloudflare.com)"
}

$TunnelUrl = $TunnelUrl.Trim().TrimEnd('/')

if (-not ($TunnelUrl -match '^https?://')) {
    Write-Host "Error: URL must start with https:// or http://" -ForegroundColor Red
    exit 1
}

$clientApi = "$PSScriptRoot\client\frontend\config\api.js"
$workerApi = "$PSScriptRoot\worker\frontend\config\api.js"

if (Test-Path $clientApi) {
    (Get-Content $clientApi) -replace "export const API_BASE_URL\s*=\s*['`"][^'`"]*['`"];", "export const API_BASE_URL = '$TunnelUrl';" | Set-Content $clientApi
    Write-Host " Updated Client App: $clientApi" -ForegroundColor Green
    Write-Host "    -> $TunnelUrl" -ForegroundColor Cyan
}

if (Test-Path $workerApi) {
    (Get-Content $workerApi) -replace "export const API_BASE_URL\s*=\s*['`"][^'`"]*['`"];", "export const API_BASE_URL = '$TunnelUrl/api/v1';" | Set-Content $workerApi
    Write-Host " Updated Worker App: $workerApi" -ForegroundColor Green
    Write-Host "    -> $TunnelUrl/api/v1" -ForegroundColor Cyan
}

Write-Host "`n All apps are now connected to your Cloudflare Tunnel!" -ForegroundColor Green
