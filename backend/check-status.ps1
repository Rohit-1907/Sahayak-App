# Django Server Status Check
# Usage: .\check-status.ps1

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " SAHAYAK - Server Status Check" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$port = 8000

# Check if server is running
Write-Host "[1] Checking Django Server..." -ForegroundColor Yellow
$serverConnection = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

if ($serverConnection) {
    $bindAddress = $serverConnection.LocalAddress
    Write-Host "    [OK] Server is RUNNING on ${bindAddress}:${port}" -ForegroundColor Green
    
    if ($bindAddress -eq "0.0.0.0") {
        Write-Host "    [OK] Accepting network connections" -ForegroundColor Green
    } elseif ($bindAddress -eq "127.0.0.1") {
        Write-Host "    [ERROR] Only accepting LOCAL connections" -ForegroundColor Red
        Write-Host "    Fix: Restart with 'python manage.py runserver 0.0.0.0:8000'" -ForegroundColor Yellow
    }
} else {
    Write-Host "    [ERROR] Server is NOT running" -ForegroundColor Red
    Write-Host "    Start with: python manage.py runserver 0.0.0.0:8000" -ForegroundColor Yellow
}
Write-Host ""

# Check network IP
Write-Host "[2] Network IP Addresses..." -ForegroundColor Yellow
$networkAdapters = Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*" }

if ($networkAdapters) {
    foreach ($adapter in $networkAdapters) {
        Write-Host "    IP: $($adapter.IPAddress) ($($adapter.InterfaceAlias))" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "    Use this in mobile app: http://$($networkAdapters[0].IPAddress):${port}" -ForegroundColor Cyan
} else {
    Write-Host "    [ERROR] No network connection found" -ForegroundColor Red
}
Write-Host ""

# Check firewall
Write-Host "[3] Checking Firewall..." -ForegroundColor Yellow
$firewallCheck = netsh advfirewall firewall show rule name="Django Development Server" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "    [OK] Firewall rule exists" -ForegroundColor Green
} else {
    Write-Host "    [ERROR] Firewall rule NOT found" -ForegroundColor Red
    Write-Host "    Run 'setup-firewall.ps1' as Administrator" -ForegroundColor Yellow
}
Write-Host ""

# Test API
Write-Host "[4] Testing API..." -ForegroundColor Yellow
if ($serverConnection) {
    try {
        $testUrl = "http://127.0.0.1:${port}/api/v1/auth/login/"
        $jsonBody = @{username="testworker"; password="test123456"} | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri $testUrl -Method POST `
            -Headers @{"Content-Type"="application/json"} `
            -Body $jsonBody `
            -UseBasicParsing -TimeoutSec 5
        
        Write-Host "    [OK] API responding (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "    [ERROR] API test failed" -ForegroundColor Red
    }
} else {
    Write-Host "    [SKIP] Server not running" -ForegroundColor Gray
}
Write-Host ""

# Summary
Write-Host "==================================================" -ForegroundColor Cyan
if ($serverConnection -and $networkAdapters -and ($LASTEXITCODE -eq 0) -and ($serverConnection.LocalAddress -eq "0.0.0.0")) {
    Write-Host " Status: ALL CHECKS PASSED" -ForegroundColor Green
    Write-Host " Mobile apps should be able to connect!" -ForegroundColor Green
} else {
    Write-Host " Status: ISSUES FOUND - Review above" -ForegroundColor Red
}
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
