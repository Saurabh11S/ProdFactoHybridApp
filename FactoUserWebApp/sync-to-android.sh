#!/bin/bash
# Bash script to sync web app to Android
# Usage: ./sync-to-android.sh

echo "🚀 Starting Android Sync Process..."
echo ""

# Step 1: Build the web app
echo "📦 Step 1: Building web app..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi
echo "✅ Build completed successfully!"
echo ""

# Step 2: Sync to Android
echo "🔄 Step 2: Syncing to Android..."
npx cap sync android
if [ $? -ne 0 ]; then
    echo "❌ Sync failed! Please check errors and try again."
    exit 1
fi
echo "✅ Sync completed successfully!"
echo ""

# Step 3: Summary
echo "✨ Android sync completed!"
echo ""
echo "Next steps:"
echo "  1. Open Android Studio: npm run cap:open:android"
echo "  2. Or build APK: npm run android:build:debug"
echo ""
echo "📱 All web app features are now available in Android!"

