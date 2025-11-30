# Quick Log Commands for Facto Android App

## View All Logs
```powershell
adb logcat
```

## View Logs for Facto App Only
```powershell
adb logcat | Select-String -Pattern "com.facto.userapp"
```

## View JavaScript Console Logs (Chrome/WebView)
```powershell
adb logcat -s chromium:I ReactNativeJS:I SystemWebChromeClient:I
```

## View API-Related Logs
```powershell
adb logcat -s chromium:I | Select-String -Pattern "API|📤|📡|✅|❌|🌐"
```

## View Backend Wake-up Logs
```powershell
adb logcat -s chromium:I | Select-String -Pattern "Wake-up|🏥|backend|Render"
```

## View Service Loading Logs
```powershell
adb logcat -s chromium:I | Select-String -Pattern "Load Services|services|fetchServices"
```

## View Errors Only
```powershell
adb logcat *:E
```

## View Errors and Warnings
```powershell
adb logcat *:W
```

## Clear Log Buffer
```powershell
adb logcat -c
```

## Save Logs to File
```powershell
adb logcat > app-logs.txt
```

## Filter by Log Level
- `*:V` - Verbose (all logs)
- `*:D` - Debug
- `*:I` - Info
- `*:W` - Warning
- `*:E` - Error
- `*:F` - Fatal

## Filter by Tag
```powershell
adb logcat -s TagName:I
```

## Common Tags for Capacitor Apps
- `chromium` - WebView/Chrome logs
- `ReactNativeJS` - React Native logs (if applicable)
- `SystemWebChromeClient` - WebView client logs
- `Capacitor` - Capacitor framework logs

## View Logs in Real-time with Timestamps
```powershell
adb logcat -v time
```

## View Logs with Process ID and Thread ID
```powershell
adb logcat -v threadtime
```

## Useful Combinations

### View API logs with timestamps
```powershell
adb logcat -v time -s chromium:I | Select-String -Pattern "API|📤|📡"
```

### View errors with timestamps
```powershell
adb logcat -v time *:E
```

### Monitor app startup
```powershell
adb logcat -c
adb logcat -v time | Select-String -Pattern "com.facto.userapp|MainActivity|Capacitor"
```

