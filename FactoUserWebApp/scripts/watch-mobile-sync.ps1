# Watch script to automatically sync mobile changes to Android (PowerShell version)
# Monitors changes in src/components/mobile folder and automatically runs:
# 1. npm run build
# 2. npx cap sync android
# 
# Usage:
#   npm run watch:mobile:sync:ps
#   or
#   .\scripts\watch-mobile-sync.ps1

$ErrorActionPreference = "Stop"

$mobileFolder = Join-Path $PSScriptRoot "..\src\components\mobile"
$projectRoot = Join-Path $PSScriptRoot ".."
$debounceDelay = 2000 # Wait 2 seconds after last change before syncing
$syncTimeout = $null
$isSyncing = $false

Write-Host "🔍 Watching mobile folder for changes..." -ForegroundColor Cyan
Write-Host "📁 Watching: $mobileFolder" -ForegroundColor Gray
Write-Host "⏳ Changes will be synced to Android automatically`n" -ForegroundColor Yellow

function Sync-ToAndroid {
    if ($isSyncing) {
        Write-Host "⏸️  Sync already in progress, skipping..." -ForegroundColor Yellow
        return
    }

    $script:isSyncing = $true
    Write-Host "`n🔄 Detected changes in mobile folder. Starting sync...`n" -ForegroundColor Cyan

    # Step 1: Build
    Write-Host "📦 Step 1/2: Building React app..." -ForegroundColor Blue
    try {
        Push-Location $projectRoot
        $buildOutput = npm run build 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Build failed!" -ForegroundColor Red
            Write-Host $buildOutput -ForegroundColor Red
            $script:isSyncing = $false
            return
        }
        Write-Host "✅ Build completed successfully`n" -ForegroundColor Green

        # Step 2: Sync to Android
        Write-Host "📱 Step 2/2: Syncing to Android..." -ForegroundColor Blue
        $syncOutput = npx cap sync android 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Sync failed!" -ForegroundColor Red
            Write-Host $syncOutput -ForegroundColor Red
            $script:isSyncing = $false
            return
        }

        Write-Host "✅ Sync completed successfully" -ForegroundColor Green
        Write-Host "📱 Android app updated!`n" -ForegroundColor Green
        Write-Host "💡 Tip: Run 'npm run android:build:debug' to build APK`n" -ForegroundColor Cyan
    }
    catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
    }
    finally {
        Pop-Location
        $script:isSyncing = $false
    }
}

function Debounced-Sync {
    param([string]$FilePath)
    
    # Clear existing timeout
    if ($syncTimeout) {
        Remove-Job $syncTimeout -Force -ErrorAction SilentlyContinue
    }

    $relativePath = $FilePath.Replace($mobileFolder, "").TrimStart("\")
    Write-Host "📝 Change detected: $relativePath" -ForegroundColor Gray

    # Set new timeout using Start-Job
    $script:syncTimeout = Start-Job -ScriptBlock {
        param($delay)
        Start-Sleep -Milliseconds $delay
    } -ArgumentList $debounceDelay

    Register-ObjectEvent -InputObject $syncTimeout -EventName StateChanged -Action {
        if ($Event.Sender.State -eq "Completed") {
            Sync-ToAndroid
            Unregister-Event -SourceIdentifier $Event.SourceIdentifier
        }
    } | Out-Null
}

# Use FileSystemWatcher to monitor the mobile folder
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $mobileFolder
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

# Register event handlers
Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action {
    if ($Event.SourceEventArgs.ChangeType -eq "Changed") {
        Debounced-Sync -FilePath $Event.SourceEventArgs.FullPath
    }
} | Out-Null

Register-ObjectEvent -InputObject $watcher -EventName "Created" -Action {
    Debounced-Sync -FilePath $Event.SourceEventArgs.FullPath
} | Out-Null

Register-ObjectEvent -InputObject $watcher -EventName "Renamed" -Action {
    Debounced-Sync -FilePath $Event.SourceEventArgs.FullPath
} | Out-Null

Write-Host "✨ Watch started! Press Ctrl+C to stop.`n" -ForegroundColor Green

# Keep script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    Write-Host "`n👋 Stopping watch..." -ForegroundColor Yellow
    if ($syncTimeout) {
        Remove-Job $syncTimeout -Force -ErrorAction SilentlyContinue
    }
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Get-EventSubscriber | Unregister-Event
}

