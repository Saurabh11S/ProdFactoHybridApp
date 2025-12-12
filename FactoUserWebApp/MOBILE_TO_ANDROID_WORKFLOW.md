# Mobile to Android Workflow Guide

## Why Changes Don't Show in APK Immediately

When you make changes to files in `src/components/mobile/`, they **do NOT automatically appear** in the Android APK. Here's why:

### The Build Process

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Source Files (React/TypeScript)                         │
│    📁 src/components/mobile/MobileHeader.tsx               │
│    📁 src/components/mobile/MobileHomeScreen.tsx           │
│    ...                                                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ npm run build
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Built Assets (JavaScript/CSS)                          │
│    📁 dist/index.html                                      │
│    📁 dist/assets/index-*.js                               │
│    📁 dist/assets/index-*.css                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ npx cap sync android
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Android Assets                                           │
│    📁 android/app/src/main/assets/public/index.html         │
│    📁 android/app/src/main/assets/public/assets/            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ gradlew assembleDebug
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. APK File                                                 │
│    📁 android/app/build/outputs/apk/debug/app-debug.apk    │
└─────────────────────────────────────────────────────────────┘
```

## Step-by-Step Workflow

### Option 1: Manual Build (Recommended for Testing)

```bash
# Step 1: Build React app
npm run build

# Step 2: Sync to Android
npx cap sync android

# Step 3: Build APK
cd android
.\gradlew.bat assembleDebug

# Step 4: Install APK (optional)
cd ..
npm run android:install
```

### Option 2: One Command Build

```bash
# Build, sync, and create APK in one command
npm run android:build:debug
```

### Option 3: Automatic Watch (For Development)

```bash
# Terminal 1: Watch for changes and auto-sync
npm run watch:mobile:sync

# Terminal 2: Make your changes to MobileHeader.tsx, etc.
# Changes will automatically build and sync!

# When ready, build APK:
cd android && .\gradlew.bat assembleDebug
```

## Important Notes

### ✅ DO THIS:
1. **Always build** after making changes: `npm run build`
2. **Always sync** after building: `npx cap sync android`
3. **Always rebuild APK** after syncing: `cd android && .\gradlew.bat assembleDebug`
4. **Use watch script** during development for automatic syncing

### ❌ DON'T DO THIS:
1. ❌ Edit files directly in `android/app/src/main/assets/` - they will be overwritten!
2. ❌ Skip the build step - changes won't be compiled
3. ❌ Skip the sync step - Android won't have the latest files
4. ❌ Use old APK - it won't have your changes

## Quick Reference Commands

| Task | Command |
|------|---------|
| Build React app | `npm run build` |
| Sync to Android | `npx cap sync android` |
| Build Debug APK | `cd android && .\gradlew.bat assembleDebug` |
| Build Release APK | `cd android && .\gradlew.bat assembleRelease` |
| Build AAB | `cd android && .\gradlew.bat bundleRelease` |
| All-in-one Debug | `npm run android:build:debug` |
| Watch & Auto-sync | `npm run watch:mobile:sync` |
| Install APK | `npm run android:install` |

## File Locations

### Source Files (Edit These)
```
FactoUserWebApp/
└── src/
    └── components/
        └── mobile/
            ├── MobileHeader.tsx      ← Edit here
            ├── MobileHomeScreen.tsx   ← Edit here
            └── ...
```

### Built Files (Auto-generated)
```
FactoUserWebApp/
└── dist/
    ├── index.html
    └── assets/
        ├── index-*.js
        └── index-*.css
```

### Android Assets (Auto-synced)
```
FactoUserWebApp/
└── android/
    └── app/
        └── src/
            └── main/
                └── assets/
                    └── public/        ← Synced from dist/
```

### APK Output
```
FactoUserWebApp/
└── android/
    └── app/
        └── build/
            └── outputs/
                └── apk/
                    └── debug/
                        └── app-debug.apk  ← Install this!
```

## Troubleshooting

### Changes Not Showing in APK?

1. ✅ Did you run `npm run build`?
2. ✅ Did you run `npx cap sync android`?
3. ✅ Did you rebuild the APK with `gradlew assembleDebug`?
4. ✅ Did you uninstall the old APK and install the new one?
5. ✅ Check console logs: `adb logcat | grep -i "MobileHeader"`

### Still Not Working?

```bash
# Clean build
npm run build
npx cap sync android
cd android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
```

## Development Workflow Tips

1. **Use watch script** during development:
   ```bash
   npm run watch:mobile:sync
   ```
   This automatically builds and syncs when you save files.

2. **Test in browser first** (faster iteration):
   ```bash
   npm run dev
   ```
   Then test on Android once it works.

3. **Check sync output** - Look for:
   ```
   √ Copying web assets from dist to android\app\src\main\assets\public
   ```

4. **Verify APK timestamp** - Make sure the APK file was just created:
   ```bash
   dir android\app\build\outputs\apk\debug\app-debug.apk
   ```

## Summary

**Remember:** 
- 📝 Edit → `src/components/mobile/`
- 🔨 Build → `npm run build`
- 📱 Sync → `npx cap sync android`
- 📦 APK → `cd android && .\gradlew.bat assembleDebug`

Your changes are now in the APK! 🎉

