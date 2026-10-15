# Force clean restart of Expo app

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "="*69 -ForegroundColor Cyan
Write-Host "  FORCE CLEAN RESTART - CLIENT APP" -ForegroundColor Yellow
Write-Host "="*70 -ForegroundColor Cyan

# Step 1: Kill all node processes
Write-Host "`n[1/5] Killing all Node processes..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Step 2: Delete .expo folder
Write-Host "[2/5] Deleting .expo cache..." -ForegroundColor Cyan
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force .expo
    Write-Host "  ✓ .expo deleted" -ForegroundColor Green
}

# Step 3: Delete metro cache
Write-Host "[3/5] Deleting metro cache..." -ForegroundColor Cyan
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force node_modules\.cache
    Write-Host "  ✓ Metro cache deleted" -ForegroundColor Green
}

# Step 4: Clear watchman (if exists)
Write-Host "[4/5] Clearing watchman..." -ForegroundColor Cyan
watchman watch-del-all 2>$null
if ($?) {
    Write-Host "  ✓ Watchman cleared" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Watchman not installed (OK)" -ForegroundColor Yellow
}

# Step 5: Start Expo with clear cache
Write-Host "[5/5] Starting Expo with --clear flag..." -ForegroundColor Cyan
Write-Host ""
Write-Host "="*70 -ForegroundColor Cyan
Write-Host "  IMPORTANT: After bundling completes:" -ForegroundColor Yellow
Write-Host "  1. Shake your phone" -ForegroundColor White
Write-Host "  2. Tap 'Reload'" -ForegroundColor White
Write-Host "  3. Or press 'r' in this terminal" -ForegroundColor White
Write-Host "="*70 -ForegroundColor Cyan
Write-Host ""

npx expo start --clear
