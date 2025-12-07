# Syncing Web App to Android Mobile App

This guide explains how to sync all functionality and features from the web app to the Android mobile app.

## Overview

The Facto User Web App is built with **Capacitor**, which allows you to build native mobile apps using web technologies. The Android app automatically uses the same codebase as the web app.

## Quick Sync Commands

### 1. Build and Sync (Recommended)
```bash
npm run build:mobile
```
This command:
- Builds the web app (`npm run build`)
- Syncs all files to Android (`npx cap sync`)

### 2. Sync Only (After Build)
```bash
npm run build
npm run cap:sync
```

### 3. Open Android Studio
```bash
npm run cap:open:android
```

### 4. Build Android APK
```bash
# Debug APK
npm run android:build:debug

# Release APK
npm run android:build:release

# Android App Bundle (AAB) for Play Store
npm run android:build:aab
```

## Step-by-Step Sync Process

### Step 1: Build the Web App
```bash
npm run build
```
This creates the `dist/` folder with all compiled web assets.

### Step 2: Sync to Android
```bash
npx cap sync android
```
This command:
- Copies all files from `dist/` to `android/app/src/main/assets/`
- Updates native Android project files
- Syncs Capacitor plugins
- Updates Android dependencies

### Step 3: Open in Android Studio
```bash
npx cap open android
```
Opens the Android project in Android Studio where you can:
- Run the app on an emulator
- Run on a connected device
- Build APK/AAB files

## What Gets Synced

### ✅ Automatically Synced:
- All React components
- All TypeScript/JavaScript code
- All styles (CSS/Tailwind)
- All assets (images, fonts, etc.)
- All API calls and logic
- All features and functionality

### ✅ Native Features Available:
- **Camera** - Document capture and gallery selection
- **File System** - File uploads and storage
- **Storage** - Secure storage (Preferences API)
- **Network** - Network status detection
- **Browser** - External links
- **Keyboard** - Keyboard handling
- **Status Bar** - Status bar customization
- **Splash Screen** - Custom splash screen

## Configuration Files

### Capacitor Config (`capacitor.config.ts`)
- `webDir: 'dist'` - Points to build output
- `appId: 'com.facto.userapp'` - Android package name
- `appName: 'Facto'` - App display name

### Android Manifest (`android/app/src/main/AndroidManifest.xml`)
- Internet permission
- Camera permission
- Storage permissions
- File provider for file sharing

## Features That Work on Mobile

### ✅ All Web Features Work:
1. **Authentication**
   - Login/Logout
   - Session management (persists across app restarts)
   - Token expiration handling

2. **Services**
   - Service browsing
   - Service details
   - Pricing configuration
   - Payment processing

3. **Documents**
   - Document upload (camera or gallery)
   - Document management
   - Document requirements from master table

4. **User Profile**
   - Profile management
   - Purchase history
   - Document management

5. **All Other Features**
   - Everything from the web app works on mobile!

## Mobile-Specific Enhancements

### Camera Integration
The app uses Capacitor Camera plugin for:
- Taking photos directly from camera
- Selecting images from gallery
- Works seamlessly on Android

### Storage
- Uses Capacitor Preferences (secure storage)
- Automatically uses native storage on mobile
- Same API as web (localStorage fallback)

### Network Handling
- Detects network status
- Handles offline scenarios
- Shows appropriate messages

## Troubleshooting

### Issue: Changes not appearing in Android app
**Solution:**
1. Run `npm run build` to rebuild
2. Run `npx cap sync android` to sync
3. Rebuild Android app in Android Studio

### Issue: Permissions not working
**Solution:**
- Check `AndroidManifest.xml` has required permissions
- For Android 13+, check runtime permissions in code

### Issue: API calls failing
**Solution:**
- Check `network_security_config.xml` allows your API domain
- Verify API URL in `apiConfig.ts`

### Issue: Build errors
**Solution:**
1. Clean build: `cd android && ./gradlew clean`
2. Sync again: `npx cap sync android`
3. Rebuild in Android Studio

## Development Workflow

### For Web Development:
```bash
npm run dev
```
Develop and test on web browser.

### For Mobile Testing:
1. Make changes in web code
2. Build: `npm run build`
3. Sync: `npx cap sync android`
4. Run in Android Studio or: `npm run cap:run:android`

### Hot Reload (Development):
```bash
npm run cap:serve
```
Then in Android Studio, use "Live Reload" option.

## Production Build

### 1. Build Web App
```bash
npm run build
```

### 2. Sync to Android
```bash
npx cap sync android
```

### 3. Build Release APK/AAB
```bash
# In Android Studio:
# Build > Generate Signed Bundle / APK
# OR use command:
npm run android:build:release
```

## Important Notes

1. **Always build before syncing** - Changes in `src/` need to be built to `dist/` first
2. **Sync after every build** - Run `npx cap sync` after building
3. **Test on device** - Some features (camera, file system) need real device testing
4. **Check permissions** - Ensure AndroidManifest has all required permissions

## File Structure

```
FactoUserWebApp/
├── src/                    # Web app source code
│   ├── components/         # React components
│   ├── contexts/          # React contexts (Auth, etc.)
│   ├── api/               # API functions
│   └── ...
├── dist/                  # Built web app (synced to Android)
├── android/               # Android native project
│   └── app/
│       └── src/main/
│           └── assets/    # Web app files (from dist/)
└── capacitor.config.ts    # Capacitor configuration
```

## Summary

The Android app is **automatically synced** with the web app. Every feature, component, and functionality from the web app works on Android. Just follow the sync process:

1. **Build** → `npm run build`
2. **Sync** → `npx cap sync android`
3. **Run** → Open in Android Studio or use `npm run cap:run:android`

That's it! Your web app is now a native Android app! 🚀

