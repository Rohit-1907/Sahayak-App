# ===================================================================
# Django Server Firewall Setup Script
# ===================================================================
# This script configures Windows Firewall to allow Django development
# server to accept incoming connections from mobile devices.
#
# USAGE:
#   Right-click PowerShell → "Run as Administrator"
#   cd D:\capstone\backend
#   .\setup-firewall.ps1
# ===================================================================

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  SAHAYAK - Django Server Firewall Setup" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "HOW TO RUN AS ADMINISTRATOR:" -ForegroundColor Yellow
    Write-Host "1. Right-click on PowerShell" -ForegroundColor Yellow
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host "3. Navigate to: cd D:\capstone\backend" -ForegroundColor Yellow
    Write-Host "4. Run: .\setup-firewall.ps1" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "✅ Running with Administrator privileges" -ForegroundColor Green
Write-Host ""

# Define variables
$pythonPath = "D:\capstone\backend\venv\Scripts\python.exe"
$ruleName = "Django Development Server"
$port = 8000

# Check if Python exists
Write-Host "📍 Checking Python installation..." -ForegroundColor Cyan
if (Test-Path $pythonPath) {
    Write-Host "✅ Python found: $pythonPath" -ForegroundColor Green
} else {
    Write-Host "❌ Python not found at: $pythonPath" -ForegroundColor Red
    Write-Host "   Please check if virtual environment exists" -ForegroundColor Yellow
    pause
    exit 1
}
Write-Host ""

# Check for existing firewall rule
Write-Host "📍 Checking existing firewall rules..." -ForegroundColor Cyan
$existingRule = netsh advfirewall firewall show rule name="$ruleName" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "⚠️  Firewall rule already exists: $ruleName" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Do you want to remove and recreate it? (y/n)"
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host ""
        Write-Host "🗑️  Removing existing rule..." -ForegroundColor Yellow
        netsh advfirewall firewall delete rule name="$ruleName" | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Old rule removed successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to remove old rule" -ForegroundColor Red
            pause
            exit 1
        }
    } else {
        Write-Host ""
        Write-Host "ℹ️  Keeping existing rule. Exiting..." -ForegroundColor Cyan
        Write-Host ""
        pause
        exit 0
    }
} else {
    Write-Host "ℹ️  No existing rule found. Will create new one." -ForegroundColor Cyan
}
Write-Host ""

# Create firewall rule
Write-Host "🔧 Creating firewall rule..." -ForegroundColor Cyan
Write-Host "   Rule Name: $ruleName" -ForegroundColor Gray
Write-Host "   Port: $port" -ForegroundColor Gray
Write-Host "   Program: $pythonPath" -ForegroundColor Gray
Write-Host ""

$result = netsh advfirewall firewall add rule `
    name="$ruleName" `
    dir=in `
    action=allow `
    protocol=TCP `
    localport=$port `
    program="$pythonPath" `
    enable=yes 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Firewall rule created successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create firewall rule" -ForegroundColor Red
    Write-Host "   Error: $result" -ForegroundColor Red
    pause
    exit 1
}
Write-Host ""

# Verify the rule was created
Write-Host "📍 Verifying firewall rule..." -ForegroundColor Cyan
$verifyRule = netsh advfirewall firewall show rule name="$ruleName" verbose

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Firewall rule verified and active!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Rule Details:" -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host $verifyRule
    Write-Host "----------------------------------------" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Could not verify rule, but it may still be created" -ForegroundColor Yellow
}
Write-Host ""

# Get network information
Write-Host "📍 Network Information:" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

$networkAdapters = Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*" } |
    Select-Object IPAddress, InterfaceAlias

if ($networkAdapters) {
    Write-Host "Your computer's IP addresses:" -ForegroundColor Yellow
    foreach ($adapter in $networkAdapters) {
        Write-Host "   $($adapter.IPAddress) ($($adapter.InterfaceAlias))" -ForegroundColor White
    }
} else {
    Write-Host "⚠️  No network adapters found" -ForegroundColor Yellow
}
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# Check if server is running
Write-Host "📍 Checking if Django server is running..." -ForegroundColor Cyan
$serverRunning = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

if ($serverRunning) {
    $bindAddress = $serverRunning.LocalAddress
    Write-Host "✅ Django server is running on: $bindAddress`:$port" -ForegroundColor Green
    
    if ($bindAddress -eq "0.0.0.0") {
        Write-Host "✅ Server is accepting connections from all interfaces" -ForegroundColor Green
    } elseif ($bindAddress -eq "127.0.0.1") {
        Write-Host "⚠️  Server is only accepting local connections (127.0.0.1)" -ForegroundColor Yellow
        Write-Host "   You need to start server with: python manage.py runserver 0.0.0.0:8000" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Django server is NOT running on port $port" -ForegroundColor Yellow
    Write-Host "   Start it with: python manage.py runserver 0.0.0.0:8000" -ForegroundColor Yellow
}
Write-Host ""

# Final instructions
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  ✅ FIREWALL SETUP COMPLETE!" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Make sure Django server is running:" -ForegroundColor White
Write-Host "   cd D:\capstone\backend" -ForegroundColor Gray
Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "   python manage.py runserver 0.0.0.0:8000" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Make sure phone and computer are on same WiFi" -ForegroundColor White
Write-Host ""
Write-Host "3. Use one of these IP addresses in your mobile app:" -ForegroundColor White
if ($networkAdapters) {
    foreach ($adapter in $networkAdapters) {
        Write-Host "   http://$($adapter.IPAddress):8000" -ForegroundColor Cyan
    }
}
Write-Host ""
Write-Host "4. Test the connection from your phone's browser:" -ForegroundColor White
if ($networkAdapters -and $networkAdapters.Count -gt 0) {
    $firstIP = $networkAdapters[0].IPAddress
    Write-Host "   http://$firstIP`:8000/api/v1/auth/login/" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

pause
