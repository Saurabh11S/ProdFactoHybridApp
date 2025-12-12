#!/usr/bin/env node

/**
 * Watch script to automatically sync mobile changes to Android
 * Monitors changes in src/components/mobile folder and automatically runs:
 * 1. npm run build
 * 2. npx cap sync android
 * 
 * Usage:
 *   npm run watch:mobile:sync
 *   or
 *   node scripts/watch-mobile-sync.js
 */

const { watch } = require('fs');
const { exec } = require('child_process');
const path = require('path');

const MOBILE_FOLDER = path.join(__dirname, '..', 'src', 'components', 'mobile');
const DEBOUNCE_DELAY = 2000; // Wait 2 seconds after last change before syncing
let syncTimeout = null;
let isSyncing = false;

console.log('🔍 Watching mobile folder for changes...');
console.log(`📁 Watching: ${MOBILE_FOLDER}`);
console.log('⏳ Changes will be synced to Android automatically\n');

function syncToAndroid() {
  if (isSyncing) {
    console.log('⏸️  Sync already in progress, skipping...');
    return;
  }

  isSyncing = true;
  console.log('\n🔄 Detected changes in mobile folder. Starting sync...\n');

  // Step 1: Build
  console.log('📦 Step 1/2: Building React app...');
  exec('npm run build', { cwd: path.join(__dirname, '..') }, (buildError, buildStdout, buildStderr) => {
    if (buildError) {
      console.error('❌ Build failed:', buildError.message);
      console.error(buildStderr);
      isSyncing = false;
      return;
    }

    console.log('✅ Build completed successfully\n');

    // Step 2: Sync to Android
    console.log('📱 Step 2/2: Syncing to Android...');
    exec('npx cap sync android', { cwd: path.join(__dirname, '..') }, (syncError, syncStdout, syncStderr) => {
      if (syncError) {
        console.error('❌ Sync failed:', syncError.message);
        console.error(syncStderr);
        isSyncing = false;
        return;
      }

      console.log('✅ Sync completed successfully');
      console.log('📱 Android app updated!\n');
      console.log('💡 Tip: Run "npm run android:build:debug" to build APK\n');
      isSyncing = false;
    });
  });
}

function debouncedSync(filePath) {
  // Clear existing timeout
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  // Set new timeout
  syncTimeout = setTimeout(() => {
    syncToAndroid();
  }, DEBOUNCE_DELAY);

  console.log(`📝 Change detected: ${path.relative(MOBILE_FOLDER, filePath)}`);
}

// Watch the mobile folder recursively
watch(
  MOBILE_FOLDER,
  { recursive: true },
  (eventType, filename) => {
    if (filename) {
      const filePath = path.join(MOBILE_FOLDER, filename);
      // Only sync on file changes (not directory changes)
      if (eventType === 'change' || eventType === 'rename') {
        debouncedSync(filePath);
      }
    }
  }
);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Stopping watch...');
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  process.exit(0);
});

console.log('✨ Watch started! Press Ctrl+C to stop.\n');

