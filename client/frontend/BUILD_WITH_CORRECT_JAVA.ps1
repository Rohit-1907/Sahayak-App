# ================================================================
# BUILD NATIVE APP WITH CORRECT JAVA_HOME
# ================================================================

Write-Host "`n🔧 FIXING JAVA_HOME AND BUILDING APP...`n" -ForegroundColor Yellow -BackgroundColor Black

# Set correct JAVA_HOME for this session
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.12"

Write-Host "✅ JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Green

# Verify Java
Write-Host "`n📋 Verifying Java installation..." -ForegroundColor Cyan
& "$env:JAVA_HOME\bin\java.exe" -version

Write-Host "`n═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
Write-Host "🚀 Starting build with correct Java..." -ForegroundColor Yellow
Write-Host "   This will take 3-5 minutes...`n" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Run the build
npx expo run:android

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
    Write-Host "✅ BUILD SUCCESSFUL!`n" -ForegroundColor Green -BackgroundColor Black
    Write-Host "🗺️  Test navigation now - map should appear!`n" -ForegroundColor White
    Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
} else {
    Write-Host "`n═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
    Write-Host "❌ BUILD FAILED!`n" -ForegroundColor Red -BackgroundColor Black
    Write-Host "Check error messages above.`n" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
}
