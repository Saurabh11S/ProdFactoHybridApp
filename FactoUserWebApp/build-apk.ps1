# Build APK Script for Facto User Web App
# This script builds a debug APK for Android

Write-Host "🚀 Starting APK Build Process..." -ForegroundColor Cyan

# Step 1: Check for Java
Write-Host "`n📋 Step 1: Checking for Java..." -ForegroundColor Yellow

$javaHome = $null
$javaPath = $null

# Check common Java installation paths
$possibleJavaPaths = @(
    "$env:JAVA_HOME",
    "C:\Program Files\Android\Android Studio\jbr",
    "C:\Program Files\Eclipse Adoptium\jdk-21*",
    "C:\Program Files\Eclipse Adoptium\jdk-17*",
    "C:\Program Files\Java\jdk-21*",
    "C:\Program Files\Java\jdk-17*",
    "C:\Program Files (x86)\Java\jdk-21*",
    "C:\Program Files (x86)\Java\jdk-17*"
)

foreach ($path in $possibleJavaPaths) {
    if ($path -and (Test-Path $path)) {
        $javaHome = $path
        $javaPath = Join-Path $path "bin\java.exe"
        if (Test-Path $javaPath) {
            Write-Host "✅ Found Java at: $javaHome" -ForegroundColor Green
            break
        }
    }
}

# Try to find Java in PATH
if (-not $javaHome) {
    try {
        $javaVersion = java -version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Found Java in PATH" -ForegroundColor Green
            $javaHome = (Get-Command java).Source | Split-Path -Parent | Split-Path -Parent
        }
    } catch {
        # Java not found
    }
}

if (-not $javaHome) {
    Write-Host "❌ Java JDK not found!" -ForegroundColor Red
    Write-Host "`n📥 Please install Java JDK 17 or 21:" -ForegroundColor Yellow
    Write-Host "   1. Download from: https://adoptium.net/temurin/releases/?version=21" -ForegroundColor White
    Write-Host "   2. Install the Windows x64 JDK" -ForegroundColor White
    Write-Host "   3. Set JAVA_HOME environment variable to the JDK installation path" -ForegroundColor White
    Write-Host "   4. Add %JAVA_HOME%\bin to your PATH" -ForegroundColor White
    Write-Host "   5. Restart your terminal and run this script again" -ForegroundColor White
    exit 1
}

# Set JAVA_HOME for this session
$env:JAVA_HOME = $javaHome
Write-Host "   JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Gray

# Step 2: Build web app
Write-Host "`n📦 Step 2: Building web app..." -ForegroundColor Yellow
Set-Location ..
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Web app build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Web app built successfully" -ForegroundColor Green

# Step 3: Sync Capacitor
Write-Host "`n🔄 Step 3: Syncing Capacitor..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Capacitor sync failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Capacitor synced successfully" -ForegroundColor Green

# Step 4: Build APK
Write-Host "`n🔨 Step 4: Building Android APK (Debug)..." -ForegroundColor Yellow
Set-Location android
.\gradlew.bat assembleDebug
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ APK build failed!" -ForegroundColor Red
    exit 1
}

# Step 5: Locate APK
Write-Host "`n✅ APK Build Complete!" -ForegroundColor Green
$apkPath = "app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    $fullPath = (Resolve-Path $apkPath).Path
    $fileSize = (Get-Item $fullPath).Length / 1MB
    Write-Host "`n📱 APK Location: $fullPath" -ForegroundColor Cyan
    Write-Host "📊 APK Size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
    Write-Host "`n✨ You can now install this APK on your Android device!" -ForegroundColor Green
} else {
    Write-Host "⚠️  APK file not found at expected location: $apkPath" -ForegroundColor Yellow
}


