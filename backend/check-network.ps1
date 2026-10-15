# ===================================================================
# Django Server Network Diagnostic Script
# ===================================================================
# This script checks the network configuration and server status
# WITHOUT requiring Administrator privileges.
#
# USAGE:
#   cd D:\capstone\backend
#   .\check-network.ps1
# ===================================================================

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  SAHAYAK - Network Diagnostics" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

$port = 8000
$pythonPath = "D:\capstone\backend\venv\Scripts\python.exe"

# Check 1: Python Virtual Environment
Write-Host "1️⃣  Checking Python Virtual Environment..." -ForegroundColor Cyan
Write-Host "   Path: $pythonPath" -ForegroundColor Gray

if (Test-Path $pythonPath) {
    Write-Host "   ✅ Virtual environment found" -ForegroundColor Green
    
    # Get Python version
    $pythonVersion = & $pythonPath --version 2>&1
    Write-Host "   📍 Version: $pythonVersion" -ForegroundColor Gray
} else {
    Write-Host "   ❌ Virtual environment NOT found" -ForegroundColor Red
    Write-Host "   Create it with: python -m venv venv" -ForegroundColor Yellow
}
Write-Host ""

# Check 2: Django Server Status
Write-Host "2️⃣  Checking Django Server Status..." -ForegroundColor Cyan
$serverConnection = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

if ($serverConnection) {
    $bindAddress = $serverConnection.LocalAddress
    Write-Host "   ✅ Server is RUNNING" -ForegroundColor Green
    Write-Host "   📍 Listening on: $bindAddress`:$port" -ForegroundColor Gray
    
    if ($bindAddress -eq "0.0.0.0") {
        Write-Host "   ✅ Accepting connections from ALL network interfaces" -ForegroundColor Green
    } elseif ($bindAddress -eq "127.0.0.1") {
        Write-Host "   ⚠️  Only accepting LOCAL connections (127.0.0.1)" -ForegroundColor Yellow
        Write-Host "   ❌ Mobile apps CANNOT connect!" -ForegroundColor Red
        Write-Host "" 
        Write-Host "   FIX: Restart server with:" -ForegroundColor Yellow
        Write-Host "   python manage.py runserver 0.0.0.0:8000" -ForegroundColor Cyan
    } else {
        Write-Host "   📍 Listening on specific IP: $bindAddress" -ForegroundColor Gray
    }
    
    # Check process details
    $pythonProcesses = Get-Process python -ErrorAction SilentlyContinue | 
        Where-Object { $_.Path -like "*capstone*" }
    
    if ($pythonProcesses) {
        Write-Host "   📍 Python processes running: $($pythonProcesses.Count)" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ Server is NOT RUNNING" -ForegroundColor Red
    Write-Host ""
    Write-Host "   START SERVER:" -ForegroundColor Yellow
    Write-Host "   cd D:\capstone\backend" -ForegroundColor Cyan
    Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor Cyan
    Write-Host "   python manage.py runserver 0.0.0.0:8000" -ForegroundColor Cyan
}
Write-Host ""

# Check 3: Network Adapters & IP Addresses
Write-Host "3️⃣  Network Adapters & IP Addresses..." -ForegroundColor Cyan

$networkAdapters = Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object { 
        $_.InterfaceAlias -notlike "*Loopback*" -and 
        $_.IPAddress -notlike "169.254.*" -and
        $_.PrefixOrigin -ne "WellKnown"
    } |
    Select-Object IPAddress, InterfaceAlias, PrefixOrigin

if ($networkAdapters) {
    foreach ($adapter in $networkAdapters) {
        $status = if ($adapter.PrefixOrigin -eq "Dhcp") { "DHCP" } else { "Static" }
        Write-Host "   📡 $($adapter.IPAddress) - $($adapter.InterfaceAlias) ($status)" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "   USE THIS IN YOUR MOBILE APP CONFIG:" -ForegroundColor Yellow
    $primaryIP = $networkAdapters[0].IPAddress
    Write-Host "   export const API_BASE_URL = 'http://$primaryIP`:8000';" -ForegroundColor Cyan
} else {
    Write-Host "   No active network adapters found" -ForegroundColor Red
    Write-Host "   Make sure WiFi/Ethernet is connected" -ForegroundColor Yellow
}
Write-Host ""

# Check 4: Firewall Status (may fail without admin)
Write-Host "4️⃣  Checking Firewall Rules..." -ForegroundColor Cyan

try {
    $firewallCheck = netsh advfirewall firewall show rule name="Django Development Server" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Firewall rule exists: 'Django Development Server'" -ForegroundColor Green
        
        # Check if rule is enabled
        if ($firewallCheck -match "Enabled:\s+Yes") {
            Write-Host "   ✅ Rule is ENABLED" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Rule exists but may be DISABLED" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ Firewall rule NOT found" -ForegroundColor Red
        Write-Host ""
        Write-Host "   FIX: Run setup-firewall.ps1 as Administrator:" -ForegroundColor Yellow
        Write-Host "   Right-click PowerShell → 'Run as Administrator'" -ForegroundColor Cyan
        Write-Host "   cd D:\capstone\backend" -ForegroundColor Cyan
        Write-Host "   .\setup-firewall.ps1" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ⚠️  Cannot check firewall (requires admin)" -ForegroundColor Yellow
    Write-Host "   Run setup-firewall.ps1 as Administrator to configure" -ForegroundColor Yellow
}
Write-Host ""

# Check 5: Test Local Connection
Write-Host "5️⃣  Testing Local API Connection..." -ForegroundColor Cyan

if ($serverConnection) {
    try {
        $testUrl = "http://127.0.0.1:$port/api/v1/auth/login/"
        Write-Host "   Testing: $testUrl" -ForegroundColor Gray
        
        $jsonBody = '{"username":"testworker","password":"test123456"}'
        $response = Invoke-WebRequest -Uri $testUrl -Method POST `
            -Headers @{'Content-Type'='application/json'} `
            -Body $jsonBody `
            -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        
        Write-Host "   ✅ API responding successfully (Status: $($response.StatusCode))" -ForegroundColor Green
        
        # Parse response
        $data = $response.Content | ConvertFrom-Json
        if ($data.user) {
            Write-Host "   ✅ Authentication working (User: $($data.user.username))" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ❌ API test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "   ⏭️  Skipped (server not running)" -ForegroundColor Gray
}
Write-Host ""

# Check 6: Common Issues
Write-Host "6️⃣  Common Issues Check..." -ForegroundColor Cyan

$issues = @()

# Check if server running on wrong address
if ($serverConnection -and $serverConnection.LocalAddress -eq "127.0.0.1") {
    $issues += "Server only listening on localhost (127.0.0.1)"
}

# Check if no network connection
if (-not $networkAdapters) {
    $issues += "No active network connection"
}

# Check if firewall rule missing
$firewallExists = (netsh advfirewall firewall show rule name="Django Development Server" 2>&1) -and ($LASTEXITCODE -eq 0)
if (-not $firewallExists) {
    $issues += "Firewall rule not configured"
}

# Check if server not running
if (-not $serverConnection) {
    $issues += "Django server not running"
}

if ($issues.Count -gt 0) {
    Write-Host "   ⚠️  Found $($issues.Count) issue(s):" -ForegroundColor Yellow
    foreach ($issue in $issues) {
        Write-Host "      • $issue" -ForegroundColor Red
    }
} else {
    Write-Host "   ✅ No common issues detected!" -ForegroundColor Green
}
Write-Host ""

# Summary
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  📋 SUMMARY" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

if ($serverConnection -and $networkAdapters -and $firewallExists -and $serverConnection.LocalAddress -eq "0.0.0.0") {
    Write-Host "✅ EVERYTHING LOOKS GOOD!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your mobile app should be able to connect using:" -ForegroundColor White
    if ($networkAdapters -and $networkAdapters.Count -gt 0) {
        $primaryIP = $networkAdapters[0].IPAddress
        Write-Host "http://$primaryIP`:8000" -ForegroundColor Cyan
    }
} else {
    Write-Host "⚠️  ISSUES FOUND - Follow the fixes above" -ForegroundColor Yellow
    Write-Host ""
    
    if (-not $serverConnection) {
        Write-Host "1. Start Django server: python manage.py runserver 0.0.0.0:8000" -ForegroundColor Yellow
    }
    
    if (-not $firewallExists) {
        Write-Host "2. Configure firewall: .\setup-firewall.ps1 (as Administrator)" -ForegroundColor Yellow
    }
    
    if ($serverConnection -and $serverConnection.LocalAddress -eq "127.0.0.1") {
        Write-Host "3. Restart server on 0.0.0.0:8000 instead of localhost" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""
