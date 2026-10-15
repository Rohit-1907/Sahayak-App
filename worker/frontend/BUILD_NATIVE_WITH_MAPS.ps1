# ================================================================
# BUILD NATIVE WORKER APP WITH GOOGLE MAPS
# ================================================================
# This creates a development build with react-native-maps
# properly compiled into native Android code
# ================================================================

Write-Host "`n🏗️  BUILDING NATIVE WORKER APP WITH GOOGLE MAPS...`n" -ForegroundColor Yellow -BackgroundColor Black

Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Step 1: Check prerequisites
Write-Host "📦 Step 1/4: Checking prerequisites..." -ForegroundColor Cyan

# Check if Android SDK is available
$androidHome = $env:ANDROID_HOME
if (-not $androidHome) {
    $androidHome = "$env:LOCALAPPDATA\Android\Sdk"
}

if (Test-Path $androidHome) {
    Write-Host "   ✅ Android SDK found at: $androidHome" -ForegroundColor Green
} else {
    Write-Host "   ❌ Android SDK not found!" -ForegroundColor Red
    Write-Host "   Please install Android Studio first" -ForegroundColor Yellow
    exit 1
}

# Check if device is connected
Write-Host "`n   Checking for connected devices..." -ForegroundColor Gray
$adbPath = "$androidHome\platform-tools\adb.exe"
if (Test-Path $adbPath) {
    $devices = & $adbPath devices
    Write-Host "   $devices" -ForegroundColor Gray
} else {
    Write-Host "   ⚠️  ADB not found, but continuing..." -ForegroundColor Yellow
}

# Step 2: Clean previous builds
Write-Host "`n📦 Step 2/4: Cleaning previous builds..." -ForegroundColor Cyan

$foldersToRemove = @(".expo", "android", "ios", "node_modules\.cache")

foreach ($folder in $foldersToRemove) {
    if (Test-Path $folder) {
        Write-Host "   Removing $folder..." -ForegroundColor Gray
        Remove-Item -Recurse -Force $folder -ErrorAction SilentlyContinue
        Write-Host "   ✅ Removed $folder" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  $folder not found (OK)" -ForegroundColor Gray
    }
}

# Step 3: Generate native code
Write-Host "`n📦 Step 3/4: Generating native Android code with Google Maps..." -ForegroundColor Cyan
Write-Host "   This includes react-native-maps plugin configuration..." -ForegroundColor Gray
Write-Host "`n   Running: npx expo prebuild --platform android --clean`n" -ForegroundColor Gray

npx expo prebuild --platform android --clean

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n   ❌ Prebuild failed!" -ForegroundColor Red
    Write-Host "   Check errors above and try again" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n   ✅ Native code generated successfully!" -ForegroundColor Green

# Step 4: Build and install APK
Write-Host "`n📦 Step 4/4: Building APK and installing on device..." -ForegroundColor Cyan
Write-Host "   This will take 3-5 minutes on first build..." -ForegroundColor Yellow
Write-Host "`n   Running: npx expo run:android`n" -ForegroundColor Gray

Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
Write-Host "⏳ BUILDING... Please wait (this may take several minutes)`n" -ForegroundColor Yellow
Write-Host "What's happening:" -ForegroundColor White
Write-Host "   1. Gradle is downloading dependencies" -ForegroundColor Gray
Write-Host "   2. Compiling native code with Google Maps" -ForegroundColor Gray
Write-Host "   3. Building APK" -ForegroundColor Gray
Write-Host "   4. Installing on your device`n" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

npx expo run:android

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
    Write-Host "✅ BUILD SUCCESSFUL!`n" -ForegroundColor Green -BackgroundColor Black
    Write-Host "The app should now be running on your device with Google Maps support!" -ForegroundColor White
    Write-Host "`n🗺️  TEST NAVIGATION:" -ForegroundColor Yellow
    Write-Host "   1. Login to the app" -ForegroundColor White
    Write-Host "   2. Go to job details" -ForegroundColor White
    Write-Host "   3. Click 'Navigate to Job Location'" -ForegroundColor White
    Write-Host "   4. Map should now appear (not black)!`n" -ForegroundColor White
    Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
} else {
    Write-Host "`n═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
    Write-Host "❌ BUILD FAILED!`n" -ForegroundColor Red -BackgroundColor Black
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "   1. Device not connected - Connect phone via USB and enable USB debugging" -ForegroundColor White
    Write-Host "   2. Java/Android SDK not installed - Install Android Studio" -ForegroundColor White
    Write-Host "   3. Port conflicts - Close other apps using port 8081" -ForegroundColor White
    Write-Host "`nCheck error messages above for more details.`n" -ForegroundColor White
    Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
}
