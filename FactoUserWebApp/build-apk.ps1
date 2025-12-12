# Build APK Script for Facto Mobile App
# Usage: .\build-apk.ps1 [debug|release]

param(
    [Parameter(Position=0)]
    [ValidateSet("debug", "release")]
    [string]$BuildType = "debug"
)

Write-Host "Building Facto Mobile App APK..." -ForegroundColor Green
Write-Host "Build Type: $BuildType" -ForegroundColor Cyan

# Set JAVA_HOME to Android Studio's bundled JDK
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'

# Step 1: Build web app
Write-Host "`n[1/3] Building web app..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Web build failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Sync Capacitor
Write-Host "`n[2/3] Syncing Capacitor..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "Capacitor sync failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Build APK
Write-Host "`n[3/3] Building Android APK..." -ForegroundColor Yellow
Set-Location android
.\gradlew.bat "assemble$($BuildType.Substring(0,1).ToUpper() + $BuildType.Substring(1))"
if ($LASTEXITCODE -ne 0) {
    Write-Host "APK build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

# Show APK location
$apkPath = "android\app\build\outputs\apk\$BuildType\app-$BuildType.apk"
if (Test-Path $apkPath) {
    $apkInfo = Get-Item $apkPath
    Write-Host "`n✓ APK built successfully!" -ForegroundColor Green
    Write-Host "Location: $($apkInfo.FullName)" -ForegroundColor Cyan
    Write-Host "Size: $([math]::Round($apkInfo.Length/1MB, 2)) MB" -ForegroundColor Cyan
} else {
    Write-Host "`n✗ APK file not found at expected location!" -ForegroundColor Red
    exit 1
}

