# PowerShell script to sync web app to Android
# Usage: .\sync-to-android.ps1

Write-Host "🚀 Starting Android Sync Process..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Build the web app
Write-Host "📦 Step 1: Building web app..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please fix errors and try again." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Sync to Android
Write-Host "🔄 Step 2: Syncing to Android..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Sync failed! Please check errors and try again." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Sync completed successfully!" -ForegroundColor Green
Write-Host ""

# Step 3: Summary
Write-Host "✨ Android sync completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Open Android Studio: npm run cap:open:android" -ForegroundColor White
Write-Host "  2. Or build APK: npm run android:build:debug" -ForegroundColor White
Write-Host ""
Write-Host "📱 All web app features are now available in Android!" -ForegroundColor Green

