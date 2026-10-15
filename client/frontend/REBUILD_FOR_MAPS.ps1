# ================================================================
# REBUILD CLIENT APP FOR GOOGLE MAPS
# ================================================================
# This script rebuilds the app with the react-native-maps plugin
# Run this to fix the black map screen issue
# ================================================================

Write-Host "`n🔧 REBUILDING CLIENT APP FOR GOOGLE MAPS...`n" -ForegroundColor Yellow -BackgroundColor Black

# Step 1: Clean build artifacts
Write-Host "📦 Step 1/4: Cleaning build artifacts..." -ForegroundColor Cyan

if (Test-Path ".expo") {
    Remove-Item -Recurse -Force .expo
    Write-Host "   ✅ Removed .expo folder" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  .expo folder not found (OK)" -ForegroundColor Gray
}

if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "   ✅ Removed node_modules\.cache" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  node_modules\.cache not found (OK)" -ForegroundColor Gray
}

# Step 2: Check package.json for react-native-maps
Write-Host "`n📦 Step 2/4: Verifying react-native-maps installation..." -ForegroundColor Cyan

$packageJson = Get-Content "package.json" | ConvertFrom-Json
if ($packageJson.dependencies.'react-native-maps') {
    Write-Host "   ✅ react-native-maps found in dependencies" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  react-native-maps NOT found in dependencies!" -ForegroundColor Red
    Write-Host "   Installing react-native-maps..." -ForegroundColor Yellow
    npm install react-native-maps
}

# Step 3: Verify app.json configuration
Write-Host "`n📦 Step 3/4: Verifying app.json configuration..." -ForegroundColor Cyan

$appJson = Get-Content "app.json" | ConvertFrom-Json
$hasMapPlugin = $false

foreach ($plugin in $appJson.expo.plugins) {
    if ($plugin -is [Array] -and $plugin[0] -eq "react-native-maps") {
        $hasMapPlugin = $true
        Write-Host "   ✅ react-native-maps plugin configured" -ForegroundColor Green
        Write-Host "   ✅ API Key: $($plugin[1].googleMapsApiKey.Substring(0, 20))..." -ForegroundColor Green
        break
    }
}

if (-not $hasMapPlugin) {
    Write-Host "   ❌ react-native-maps plugin NOT configured!" -ForegroundColor Red
    Write-Host "   Please check app.json manually" -ForegroundColor Yellow
}

# Step 4: Start expo with clean cache
Write-Host "`n📦 Step 4/4: Starting Expo with clean cache..." -ForegroundColor Cyan
Write-Host "`n   Running: npx expo start -c`n" -ForegroundColor Gray

Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
Write-Host "✅ READY TO START!`n" -ForegroundColor Green
Write-Host "After Metro bundler starts:" -ForegroundColor Yellow
Write-Host "   1. Press 'a' to open on Android" -ForegroundColor White
Write-Host "   2. Wait for app to rebuild (may take 1-2 minutes)" -ForegroundColor White
Write-Host "   3. Login and test navigation`n" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Start expo
npx expo start -c
