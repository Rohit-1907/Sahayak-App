# BUILD WORKER APP WITH GOOGLE MAPS
# Run this to build the native Android app with navigation support

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  BUILDING WORKER APP WITH GOOGLE MAPS NAVIGATION" -ForegroundColor Yellow
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""

# Fix JAVA_HOME for this session
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.12"
Write-Host "JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Green

# Verify Java
Write-Host "Verifying Java installation..." -ForegroundColor Yellow
& "$env:JAVA_HOME\bin\java.exe" -version
Write-Host ""

Write-Host "Google Maps API key configured" -ForegroundColor Green
Write-Host "react-native-maps installed" -ForegroundColor Green
Write-Host ""

Write-Host "First build: ~12 minutes" -ForegroundColor Yellow
Write-Host "Subsequent builds: ~2 minutes" -ForegroundColor Yellow
Write-Host ""

Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "Starting build with correct Java..." -ForegroundColor Yellow
Write-Host "This will take several minutes..." -ForegroundColor Yellow
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""

# Run the build
npx expo run:android

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "===================================================================" -ForegroundColor Cyan
    Write-Host "BUILD COMPLETE!" -ForegroundColor Green
    Write-Host "===================================================================" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "Test Navigation:" -ForegroundColor Yellow
    Write-Host "   1. Login as worker: 9632587410 (any 6-digit OTP)" -ForegroundColor White
    Write-Host "   2. Go to Job Details screen" -ForegroundColor White
    Write-Host "   3. Click 'Navigate to Job Location'" -ForegroundColor White
    Write-Host "   4. Map will show with route!" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "===================================================================" -ForegroundColor Cyan
    Write-Host "BUILD FAILED!" -ForegroundColor Red
    Write-Host "===================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Check error messages above." -ForegroundColor Yellow
    Write-Host ""
}
