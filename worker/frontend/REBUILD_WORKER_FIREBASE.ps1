# Clean Rebuild Worker App with Firebase
Write-Host "🧹 Cleaning previous build..." -ForegroundColor Cyan
Remove-Item -Path "android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\.gradle" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "✅ Clean complete" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Building worker app..." -ForegroundColor Cyan
Write-Host "This will take 2-3 minutes..." -ForegroundColor Yellow
Write-Host ""

# Build
npx expo run:android --no-install

Write-Host ""
Write-Host "✅ Build complete! Now install manually:" -ForegroundColor Green
Write-Host "adb install -r android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Cyan
