# PowerShell script to view Android app logs
# Usage: .\view-logs.ps1

Write-Host "📱 Android Log Viewer for Facto App" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if adb is available
$adbPath = Get-Command adb -ErrorAction SilentlyContinue
if (-not $adbPath) {
    Write-Host "❌ ADB not found. Please install Android SDK Platform Tools." -ForegroundColor Red
    Write-Host "   Or add it to your PATH." -ForegroundColor Yellow
    exit 1
}

# Check if device is connected
$devices = adb devices
if ($devices -match "device$") {
    Write-Host "✅ Device connected" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "❌ No device connected. Please connect your Android device or start an emulator." -ForegroundColor Red
    exit 1
}

Write-Host "Available log filters:" -ForegroundColor Yellow
Write-Host "  1. All logs (Verbose)"
Write-Host "  2. API calls only"
Write-Host "  3. Errors only"
Write-Host "  4. Backend wake-up logs"
Write-Host "  5. Service loading logs"
Write-Host "  6. JavaScript console logs"
Write-Host "  7. Custom filter"
Write-Host ""

$choice = Read-Host "Select option (1-7)"

switch ($choice) {
    "1" {
        Write-Host "📋 Showing all logs..." -ForegroundColor Cyan
        adb logcat -s *:V
    }
    "2" {
        Write-Host "📋 Showing API calls..." -ForegroundColor Cyan
        adb logcat -s chromium:I ReactNativeJS:I SystemWebChromeClient:I | Select-String -Pattern "API|📤|📡|✅|❌"
    }
    "3" {
        Write-Host "📋 Showing errors only..." -ForegroundColor Cyan
        adb logcat *:E
    }
    "4" {
        Write-Host "📋 Showing backend wake-up logs..." -ForegroundColor Cyan
        adb logcat -s chromium:I ReactNativeJS:I SystemWebChromeClient:I | Select-String -Pattern "Wake-up|🏥|backend"
    }
    "5" {
        Write-Host "📋 Showing service loading logs..." -ForegroundColor Cyan
        adb logcat -s chromium:I ReactNativeJS:I SystemWebChromeClient:I | Select-String -Pattern "Load Services|📡|services"
    }
    "6" {
        Write-Host "📋 Showing JavaScript console logs..." -ForegroundColor Cyan
        adb logcat -s chromium:I ReactNativeJS:I SystemWebChromeClient:I
    }
    "7" {
        $filter = Read-Host "Enter custom filter text"
        Write-Host "📋 Filtering logs for: $filter" -ForegroundColor Cyan
        adb logcat -s chromium:I ReactNativeJS:I SystemWebChromeClient:I | Select-String -Pattern $filter
    }
    default {
        Write-Host "Invalid option. Showing all logs..." -ForegroundColor Yellow
        adb logcat
    }
}

