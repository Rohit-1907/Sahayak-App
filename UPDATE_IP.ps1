# Update IP address from 192.168.1.7 to 192.168.1.5 in worker app

$files = @(
    "d:\capstone\worker\frontend\services\google-auth.service.js",
    "d:\capstone\worker\frontend\screens\OtpVerifyResetScreen.js",
    "d:\capstone\worker\frontend\screens\Forgotpassscreen.js",
    "d:\capstone\worker\frontend\screen\WorkRequestsScreen.js",
    "d:\capstone\worker\frontend\screen\WorkerCalendar.js",
    "d:\capstone\worker\frontend\screen\Performance.js",
    "d:\capstone\worker\frontend\screen\OtpEntryScreen.js",
    "d:\capstone\worker\frontend\screen\jobnear.js",
    "d:\capstone\worker\frontend\screen\JobDetailsScreen.js",
    "d:\capstone\worker\frontend\screen\home\OrganizationAdminHome.js",
    "d:\capstone\worker\frontend\screen\home\IndividualWorkerHome.js",
    "d:\capstone\worker\frontend\screen\EarningsScreen.js",
    "d:\capstone\worker\frontend\screen\dashboard.js",
    "d:\capstone\worker\frontend\components\AvailabilityToggle.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        (Get-Content $file) -replace '192\.168\.1\.7', '192.168.1.5' | Set-Content $file
        Write-Host "✅ Updated: $file"
    }
}

Write-Host "`n✅ All files updated!"
