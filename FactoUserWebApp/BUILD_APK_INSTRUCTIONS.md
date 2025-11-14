# Build APK for Testing - Quick Guide

## Option 1: Build Using Android Studio (Easiest)

### Steps:

1. **Open Android Studio**

2. **Open Project:**
   - Click "Open" or "File → Open"
   - Navigate to: `FactoUserWebApp/android`
   - Click "OK"

3. **Wait for Gradle Sync:**
   - Android Studio will automatically sync Gradle
   - Wait for "Gradle sync finished" message

4. **Build APK:**
   - Go to: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
   - Or use shortcut: `Ctrl + Shift + A` → type "Build APK"
   - Wait for build to complete (2-5 minutes)

5. **Locate APK:**
   - After build completes, click "locate" in the notification
   - Or navigate to: `FactoUserWebApp/android/app/build/outputs/apk/debug/app-debug.apk`

6. **Install APK:**
   - Transfer APK to your Android device
   - Enable "Install from Unknown Sources" in device settings
   - Tap the APK file to install

---

## Option 2: Build Using Command Line (Requires JAVA_HOME)

### Step 1: Find Android Studio's JDK

Android Studio includes a JDK. Find it using one of these methods:

**Method A: Check Android Studio Settings**
1. Open Android Studio
2. Go to: **File → Settings → Build, Execution, Deployment → Build Tools → Gradle**
3. Look for "Gradle JDK" - it shows the JDK path
4. Copy that path (usually something like: `C:\Program Files\Android\Android Studio\jbr`)

**Method B: Common Locations**
Check these locations:
- `C:\Program Files\Android\Android Studio\jbr`
- `C:\Program Files (x86)\Android\Android Studio\jbr`
- `%LOCALAPPDATA%\Android\Sdk\jbr`
- `%LOCALAPPDATA%\Programs\Android\Android Studio\jbr`

### Step 2: Set JAVA_HOME (Temporary for this session)

Open PowerShell in the project directory and run:

```powershell
# Replace with your actual JDK path from Step 1
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Verify Java is found
java -version
```

### Step 3: Build APK

```powershell
cd FactoUserWebApp
npm run android:build:debug
```

### Step 4: Find APK

The APK will be at:
```
FactoUserWebApp/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Option 3: Set JAVA_HOME Permanently

If you want to set JAVA_HOME permanently:

1. **Find JDK Path** (use Method A or B from Option 2)

2. **Set Environment Variable:**
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Go to "Advanced" tab → Click "Environment Variables"
   - Under "User variables", click "New"
   - Variable name: `JAVA_HOME`
   - Variable value: `C:\Program Files\Android\Android Studio\jbr` (your JDK path)
   - Click "OK"
   - Find "Path" variable, click "Edit"
   - Click "New", add: `%JAVA_HOME%\bin`
   - Click "OK" on all dialogs

3. **Restart PowerShell/Terminal**

4. **Verify:**
   ```powershell
   java -version
   ```

5. **Build APK:**
   ```powershell
   cd FactoUserWebApp
   npm run android:build:debug
   ```

---

## Quick Build Command (After JAVA_HOME is set)

```powershell
cd FactoUserWebApp
npm run android:build:debug
```

**APK Location:** `FactoUserWebApp/android/app/build/outputs/apk/debug/app-debug.apk`

---

## Troubleshooting

### "JAVA_HOME is not set"
- Use Option 1 (Android Studio GUI) - easiest
- Or set JAVA_HOME using Option 2 or 3

### "Gradle sync failed"
- Make sure you have internet connection
- Android Studio will download Gradle automatically
- Wait for sync to complete

### "Build failed"
- Check Android Studio's Build output for errors
- Make sure all dependencies are installed
- Try: **File → Invalidate Caches / Restart**

---

## Recommended: Use Android Studio

**Easiest method:** Open `FactoUserWebApp/android` in Android Studio and build from there. No need to set JAVA_HOME manually!

