# Android App Rebuild Instructions

## Issue: Logo Not Showing in Android Studio

The logo file (`NewLOGO.png`) has been synced to Android, but you need to rebuild the app to see the changes.

## Steps to Fix:

### 1. Clean Build (Recommended)
In Android Studio:
- Go to **Build** → **Clean Project**
- Wait for clean to complete
- Go to **Build** → **Rebuild Project**

### 2. Sync Gradle Files
- Click **File** → **Sync Project with Gradle Files**
- Wait for sync to complete

### 3. Clear App Data (If app is already installed)
On your device/emulator:
- Go to **Settings** → **Apps** → **Facto**
- Tap **Storage** → **Clear Data**
- Or uninstall and reinstall the app

### 4. Rebuild and Run
- Click **Run** → **Run 'app'** (or press Shift+F10)
- Or use the green play button

### 5. Alternative: Command Line Build
```powershell
cd FactoUserWebApp
npm run build
npx cap sync android
cd android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
```

## Verification

The logo file should be located at:
```
android/app/src/main/assets/public/logo/NewLOGO.png
```

## If Logo Still Doesn't Show:

1. **Check Browser Console** (if using Chrome DevTools):
   - Open Chrome DevTools
   - Check Console for 404 errors on `/logo/NewLOGO.png`

2. **Verify File Path**:
   - The logo path in code is: `/logo/NewLOGO.png`
   - This maps to: `assets/public/logo/NewLOGO.png` in Android

3. **Hard Refresh**:
   - In Android Studio, go to **Build** → **Clean Project**
   - Then **Build** → **Rebuild Project**
   - Uninstall app from device/emulator
   - Reinstall fresh build

4. **Check Capacitor Config**:
   - Verify `capacitor.config.ts` has `webDir: 'dist'`
   - Run `npx cap sync android` again

## Current Status

✅ Logo file exists: `public/logo/NewLOGO.png`
✅ Web build completed: `dist/` folder updated
✅ Capacitor sync completed: Android assets updated
⏳ **Next Step**: Rebuild Android app in Android Studio

