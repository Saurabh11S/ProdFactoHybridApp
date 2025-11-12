# Building Android APK for Facto User Web App

## Prerequisites

### 1. Install Java JDK (Required)
You need Java JDK 17 or 21 to build the APK.

**Option A: Install JDK 21 (Recommended)**
1. Download from: https://adoptium.net/temurin/releases/?version=21
2. Install the Windows x64 JDK
3. Set JAVA_HOME environment variable:
   - Open System Properties → Environment Variables
   - Add new System Variable:
     - Variable name: `JAVA_HOME`
     - Variable value: `C:\Program Files\Eclipse Adoptium\jdk-21.x.x-hotspot` (or your installation path)
   - Add to PATH: `%JAVA_HOME%\bin`

**Option B: Use Android Studio's JDK**
If you have Android Studio installed:
- JDK is usually at: `C:\Program Files\Android\Android Studio\jbr`
- Set JAVA_HOME to this path

### 2. Verify Java Installation
```powershell
java -version
```
Should show Java version 17 or 21.

## Building the APK

### Step 1: Build Web App
```powershell
cd FactoUserWebApp
npm run build
```

### Step 2: Sync with Capacitor
```powershell
npx cap sync android
```

### Step 3: Build Debug APK (No signing required)
```powershell
cd android
.\gradlew.bat assembleDebug
```

The APK will be created at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Step 4: Build Release APK (Requires signing)

**First, create a keystore:**
```powershell
keytool -genkey -v -keystore facto-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias facto
```

**Create keystore.properties file:**
```properties
storeFile=../facto-release-key.jks
storePassword=your_password_here
keyAlias=facto
keyPassword=your_password_here
```

**Then build release APK:**
```powershell
.\gradlew.bat assembleRelease
```

The APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Quick Build Script

You can also use the npm scripts:

**Debug APK:**
```powershell
npm run android:build:debug
```

**Release APK:**
```powershell
npm run android:build:release
```

**Android App Bundle (AAB) for Play Store:**
```powershell
npm run android:build:aab
```

## Troubleshooting

### JAVA_HOME not set
- Make sure JAVA_HOME points to JDK installation (not JRE)
- Restart terminal after setting environment variables

### Gradle build fails
- Make sure you have internet connection (Gradle downloads dependencies)
- Check if Android SDK is properly configured

### APK not found
- Check: `android/app/build/outputs/apk/`
- Clean and rebuild: `.\gradlew.bat clean assembleDebug`

## APK Location

After successful build:
- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`

## Installing APK

**Using ADB (if device connected):**
```powershell
npm run android:install
```

**Or manually:**
- Transfer APK to Android device
- Enable "Install from Unknown Sources" in device settings
- Open APK file and install

