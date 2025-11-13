# APK Build Instructions

## Quick Start (If Java is Already Installed)

Simply run:
```powershell
cd FactoUserWebApp
.\build-apk.ps1
```

## Prerequisites: Installing Java JDK

**You need Java JDK 17 or 21 to build the APK.**

### Option 1: Install Eclipse Temurin JDK 21 (Recommended)

1. **Download JDK 21:**
   - Visit: https://adoptium.net/temurin/releases/?version=21
   - Download: **Windows x64 JDK** (`.msi` installer)

2. **Install JDK:**
   - Run the downloaded `.msi` file
   - Follow the installation wizard
   - **Important:** Check "Set JAVA_HOME variable" during installation

3. **Verify Installation:**
   ```powershell
   java -version
   ```
   Should show: `openjdk version "21.x.x"`

4. **If JAVA_HOME is not set automatically:**
   - Open System Properties → Environment Variables
   - Add new System Variable:
     - Variable name: `JAVA_HOME`
     - Variable value: `C:\Program Files\Eclipse Adoptium\jdk-21.x.x-hotspot` (check your actual path)
   - Add to PATH: `%JAVA_HOME%\bin`
   - **Restart your terminal/PowerShell**

### Option 2: Use Android Studio's JDK (If you have Android Studio)

If you have Android Studio installed, you can use its bundled JDK:

1. **Set JAVA_HOME:**
   ```powershell
   $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
   ```

2. **Add to PATH (temporarily for this session):**
   ```powershell
   $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
   ```

3. **Verify:**
   ```powershell
   java -version
   ```

## Building the APK

### Method 1: Using the Build Script (Recommended)

```powershell
cd FactoUserWebApp
.\build-apk.ps1
```

This script will:
- ✅ Check for Java installation
- ✅ Build the web app
- ✅ Sync Capacitor
- ✅ Build the debug APK
- ✅ Show you the APK location

### Method 2: Using NPM Scripts

```powershell
cd FactoUserWebApp
npm run android:build:debug
```

### Method 3: Manual Build

```powershell
# 1. Build web app
cd FactoUserWebApp
npm run build

# 2. Sync Capacitor
npx cap sync android

# 3. Build APK
cd android
.\gradlew.bat assembleDebug
```

## APK Location

After successful build, your APK will be at:
```
FactoUserWebApp/android/app/build/outputs/apk/debug/app-debug.apk
```

## Installing the APK

### Option 1: Using ADB (Android Debug Bridge)

If you have ADB installed and your device connected:

```powershell
cd FactoUserWebApp
npm run android:install
```

### Option 2: Manual Installation

1. Transfer the APK file to your Android device (via USB, email, cloud storage, etc.)
2. On your Android device:
   - Go to Settings → Security
   - Enable "Install from Unknown Sources" or "Allow installation from unknown sources"
3. Open the APK file on your device and tap "Install"

## Building Release APK (For Production)

To build a signed release APK for production:

1. **Create a keystore:**
   ```powershell
   keytool -genkey -v -keystore facto-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias facto
   ```
   - Enter a password (remember it!)
   - Fill in the certificate information

2. **Create `keystore.properties` file in `android/` folder:**
   ```properties
   storeFile=../facto-release-key.jks
   storePassword=your_password_here
   keyAlias=facto
   keyPassword=your_password_here
   ```

3. **Build release APK:**
   ```powershell
   cd FactoUserWebApp/android
   .\gradlew.bat assembleRelease
   ```

   Release APK will be at:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

## Troubleshooting

### "JAVA_HOME is not set"
- Make sure Java JDK is installed (not just JRE)
- Set JAVA_HOME environment variable
- Restart your terminal after setting environment variables

### "Gradle build failed"
- Make sure you have internet connection (Gradle downloads dependencies)
- Check if Android SDK is properly configured
- Try: `.\gradlew.bat clean assembleDebug`

### "APK not found"
- Check: `android/app/build/outputs/apk/debug/`
- Clean and rebuild: `.\gradlew.bat clean assembleDebug`

### Build takes too long
- First build downloads Gradle and dependencies (this is normal)
- Subsequent builds will be faster

## Next Steps

After building the APK:
1. Test it on a physical Android device or emulator
2. For production, build a signed release APK
3. For Google Play Store, build an Android App Bundle (AAB):
   ```powershell
   npm run android:build:aab
   ```


