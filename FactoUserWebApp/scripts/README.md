# Mobile Sync Scripts

This directory contains scripts to automatically sync changes from the mobile folder to Android.

## Available Scripts

### Watch Script (Node.js)
Automatically watches the `src/components/mobile` folder and syncs changes to Android.

**Usage:**
```bash
npm run watch:mobile:sync
```

**What it does:**
1. Watches for file changes in `src/components/mobile`
2. Waits 2 seconds after the last change (debounce)
3. Runs `npm run build`
4. Runs `npx cap sync android`
5. Updates Android app with latest changes

### Watch Script (PowerShell - Windows)
PowerShell version for Windows users.

**Usage:**
```bash
npm run watch:mobile:sync:ps
```

**What it does:**
Same as Node.js version, but uses PowerShell's FileSystemWatcher.

## Manual Sync

If you prefer to sync manually:

```bash
# Build and sync
npm run build
npx cap sync android

# Or use the combined command
npm run build:mobile
```

## Building APK

After syncing, build the APK:

```bash
# Debug APK
npm run android:build:debug

# Release APK
npm run android:build:release

# Android App Bundle (AAB)
npm run android:build:aab
```

## Notes

- The watch script uses a 2-second debounce to avoid multiple syncs during rapid file changes
- Only files in `src/components/mobile` are monitored
- The script will skip sync if one is already in progress
- Press `Ctrl+C` to stop the watch script

