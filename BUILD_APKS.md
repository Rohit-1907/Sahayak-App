# 📦 Building Development APKs

## 🎯 Commands to Build APKs

### **Client App APK:**
```bash
cd d:\capstone\client\frontend
npx eas build --profile development --platform android --local
```

### **Worker App APK:**
```bash
cd d:\capstone\worker\frontend
npx eas build --profile development --platform android --local
```

---

## ⚡ Quick Build (Without EAS - Faster)

### **Option 1: Using Expo prebuild + Gradle**

#### Client App:
```bash
cd d:\capstone\client\frontend
npx expo prebuild --platform android
cd android
.\gradlew assembleDebug
# APK will be at: android\app\build\outputs\apk\debug\app-debug.apk
```

#### Worker App:
```bash
cd d:\capstone\worker\frontend
npx expo prebuild --platform android
cd android
.\gradlew assembleDebug
# APK will be at: android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 🚀 Easiest Method: Direct Install to Phone

Instead of building APK, directly install to phone via USB:

### Client App:
```bash
cd d:\capstone\client\frontend
npx expo run:android
```

### Worker App:
```bash
cd d:\capstone\worker\frontend
npx expo run:android
```

**This will:**
- Build the app
- Install on connected Android device
- Start the app automatically

---

## 📋 Prerequisites

1. **Android SDK installed** (comes with Android Studio)
2. **USB Debugging enabled** on phone
3. **Phone connected** via USB
4. **ADB working**: Test with `adb devices`

---

## ⏱️ Build Times

- **EAS Build (cloud):** 15-20 minutes
- **Local Gradle build:** 5-10 minutes (first time), 2-3 minutes (subsequent)
- **Direct install:** 3-5 minutes

---

## 🎯 Recommended Approach

**For development/testing:** Use `npx expo run:android` (fastest, easiest)

**For sharing APK:** Use `npx expo prebuild` + `gradlew assembleDebug`
