# BUILD WITH CORRECT JAVA_HOME

Write-Host ""
Write-Host "Fixing JAVA_HOME..." -ForegroundColor Yellow
Write-Host ""

[System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Java\jdk-21.0.12', 'User')
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21.0.12'

Write-Host "JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Green
Write-Host ""

Write-Host "Verifying Java..." -ForegroundColor Cyan
& "$env:JAVA_HOME\bin\java.exe" -version

Write-Host ""
Write-Host "Starting build..." -ForegroundColor Yellow
Write-Host ""

npx expo run:android

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "BUILD SUCCESSFUL!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "BUILD FAILED" -ForegroundColor Red
}
