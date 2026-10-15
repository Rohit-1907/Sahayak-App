# Clear React Native Cache and Restart Worker App
Write-Host "🧹 Clearing Metro Bundler Cache..." -ForegroundColor Cyan

# Stop any running Metro processes
Write-Host "⏹️  Stopping Metro processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*worker\frontend*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Clear Metro cache
Write-Host "🗑️  Clearing Metro cache..." -ForegroundColor Yellow
Remove-Item -Path ".\.expo\*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue

# Clear watchman if installed
Write-Host "👀 Clearing Watchman cache..." -ForegroundColor Yellow
& watchman watch-del-all 2>$null

Write-Host "✅ Cache cleared!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting Worker App with cleared cache..." -ForegroundColor Cyan
Write-Host "   Run: npm start -- --clear" -ForegroundColor White
Write-Host ""
Write-Host "   Then in another terminal:" -ForegroundColor White
Write-Host "   npm run android" -ForegroundColor White
Write-Host ""

# Start with clear cache
npm start -- --clear
