# How to Run SAHAYAK Frontend Apps - Expo SDK 57 ✅

**Last Updated:** August 21, 2026  
**Expo SDK:** 57.0.0  
**React Native:** 0.86.0  
**React:** 19.2.3  
**Status:** ✅ Both apps tested and working!

---

## ⚡ QUICK START (3 Steps) - SDK 57

Both apps are now upgraded to **Expo SDK 57** and ready to run!

### 1️⃣ Client App (Customer App)
```powershell
cd d:\capstone\client\frontend
npm start
```
- Scan QR code with **Expo Go 57.0.9**
- Wait 20-30 seconds for bundle
- ✅ App opens successfully!

### 2️⃣ Worker App (Service Provider App)  
```powershell
# Open NEW terminal
cd d:\capstone\worker\frontend
npm start
```
- Scan QR code with **Expo Go 57.0.9**
- Wait for bundle to complete
- ✅ App opens successfully!

### 3️⃣ Switch Between Apps
- In Expo Go, tap **Home icon** to see both apps
- Select **sahayak-client** or **sahayak-worker**

---

## 📱 System Requirements

- **Node.js**: 18+ ([Download](https://nodejs.org/))
- **npm**: 9+ (comes with Node.js)
- **Expo CLI**: Will install automatically with npm
- **Android Device/Emulator** (for testing)
- **USB Cable** (for physical device testing)

### Installation Check
```powershell
node --version       # Should be v18+
npm --version        # Should be 9+
expo --version       # Will install if needed
```

---

## 🚀 QUICK START (5 Steps)

### Step 1: Install Expo CLI (One-time setup)
```powershell
npm install -g expo-cli
```

### Step 2: Client App - Install & Run

```powershell
# Navigate to client frontend
cd d:\capstone\client\frontend

# Install dependencies/
npm install

# Start Expo development server
npm start
```

**Expected output:**
```
Expo Go Configuration is set up successfully!

Press i to open iOS simulator
Press a to open Android emulator
Press w to open Web browser
Press r to reload
Press m to toggle menu
Press q to exit
```

### Step 3: Open on Your Device
- **Option A - Physical Android Device**
  ```
  1. Download "Expo Go" app from Google Play Store
  2. Open Expo Go app
  3. Scan QR code shown in terminal
  4. App loads in seconds!
  ```

- **Option B - Android Emulator**
  ```powershell
  # Make sure Android Emulator is running
  # Then press 'a' in terminal to open in emulator
  ```

- **Option C - Browser (Quick Test)**
  ```powershell
  # Press 'w' in terminal to open in browser
  # Note: Some features won't work in browser
  ```

### Step 4: Worker App - Install & Run
**In a NEW terminal window:**

```powershell
# Navigate to worker frontend
cd d:\capstone\worker\frontend

# Install dependencies
npm install

# Start Expo development server
npm start
```

### Step 5: Test Both Apps
- Client app: Running on Expo Go (port 8081)
- Worker app: Running on Expo Go (port 8082)
- Both apps running simultaneously! ✅

---

## 📋 Complete Setup Instructions

### Prerequisites Installation

#### 1. Install Node.js & npm
```powershell
# Download from https://nodejs.org/ (LTS version)
# Or use Chocolatey (Windows package manager)
choco install nodejs

# Verify installation
node --version
npm --version
```

#### 2. Install Expo CLI Globally
```powershell
npm install -g expo-cli

# Verify
expo --version
```

---

### CLIENT APP Setup & Run

#### Detailed Steps:

```powershell
# 1. Navigate to client directory
cd d:\capstone\client\frontend

# 2. Clear any old cache (if you had issues before)
npm cache clean --force
del node_modules -r
del package-lock.json

# 3. Fresh install
npm install

# 4. Review app.json
# Open d:\capstone\client\frontend\app.json
# Verify it has:
# - "name": "SAHAYAK Client"
# - "slug": "sahayak-client"
# - "package": "com.sahayak.client"

# 5. Start development server
npm start
```

#### What You'll See:
```
√ Expo Go (58.4.0) is available at /c/Users/YourName/AppData/Local/Expo
√ Metro bundler started
√ Tunnel ready
√ Bundle URL: exp://192.168.0.100:8081

To open the app with Expo Go, scan the QR code. 📱

Press ? for a menu
```

#### How to Test:
1. **Physical Device (Recommended)**
   - Download "Expo Go" app (free from Play Store)
   - Open the app
   - Scan QR code from terminal
   - Wait 10-30 seconds for app to load

2. **Android Emulator**
   - Open Android Emulator
   - Press 'a' in terminal
   - App will automatically open in emulator

3. **Web Browser (Limited)**
   - Press 'w' in terminal
   - Opens at http://localhost:19006

---

### WORKER APP Setup & Run

#### Detailed Steps:

```powershell
# 1. Open NEW terminal (keep client terminal open)
# Navigate to worker directory
cd d:\capstone\worker\frontend

# 2. Clear cache
npm cache clean --force
del node_modules -r
del package-lock.json

# 3. Install dependencies
npm install

# 4. Verify app.json
# Should have:
# - "name": "SAHAYAK Worker"
# - "slug": "sahayak-worker"  
# - "package": "com.sahayak.worker"

# 5. Start development server
npm start
```

#### What You'll See:
```
√ Expo Go (58.4.0) is available
√ Metro bundler started
√ Tunnel ready
√ Bundle URL: exp://192.168.0.100:8082

Press ? for a menu
```

#### How to Test:
- Same process as Client App (scan QR code)
- Opens on different port (8082)
- Both apps can run simultaneously on same device

---

## 🛠️ Common Commands

### Running the Apps

| Command | What it does |
|---------|-------------|
| `npm start` | Start development server |
| `npm run android` | Build & run on Android emulator/device |
| `npm run ios` | Build & run on iOS simulator |
| `npm run web` | Run in web browser |
| `npm run prebuild` | Rebuild native modules |

### Maintenance Commands

```powershell
# Clear all caches
npm cache clean --force

# Reinstall dependencies
rm -r node_modules
npm install

# Clear Metro bundler cache
expo prebuild --clean

# Hard reset everything
rm -r node_modules
rm package-lock.json
npm install
expo prebuild --clean
```

---

## ⚙️ Android Emulator Setup (if needed)

### Install Android Emulator
1. Download [Android Studio](https://developer.android.com/studio)
2. Open Android Studio
3. Configure → AVD Manager
4. Create Virtual Device (e.g., Pixel 5)
5. Start the emulator

### Connect ADB (Android Debug Bridge)
```powershell
# Check if emulator is connected
adb devices

# Should show:
# emulator-5554   device
```

### If Emulator Won't Start
```powershell
# Kill all ADB processes
adb kill-server

# Start ADB server
adb start-server

# Try starting emulator again
```

---

## 📱 Testing on Physical Device

### Android Device Setup

1. **Install Expo Go**
   - Go to Google Play Store
   - Search "Expo Go"
   - Install (free app)

2. **Enable Developer Mode**
   - Settings → About Phone
   - Tap "Build Number" 7 times
   - Developer options appear

3. **Enable USB Debugging**
   - Settings → Developer Options
   - Turn ON "USB Debugging"

4. **Connect to Computer**
   - Plug in USB cable
   - Select "File Transfer" mode
   - Verify connection: `adb devices`

5. **Scan QR Code**
   - Open Expo Go app
   - Tap "Scan"
   - Point camera at QR code in terminal
   - App loads! 🎉

---

## 🔍 Troubleshooting

### "Port already in use"
```powershell
# Find process using port
netstat -ano | findstr :8081

# Kill the process
taskkill /PID <PID> /F

# Or use different port
expo start --port 8085
```

### "npm: command not found"
```powershell
# Install Node.js from nodejs.org
# Then restart terminal

# Check installation
node --version
npm --version
```

### "Cannot find module"
```powershell
# Clear everything and reinstall
npm cache clean --force
rm -r node_modules
rm package-lock.json
npm install
```

### App crashes on startup
```powershell
# Rebuild native modules
expo prebuild --clean

# Or clear Expo cache
expo start --clear
```

### Expo Go app won't scan QR code
```powershell
# Make sure networks are on same WiFi
# Try tunnel URL instead (shown in terminal)
# Copy tunnel URL → paste in Expo Go
```

### "Permission denied" errors
```powershell
# Clear Expo cache
rm -r ~/.expo

# Or reset everything
expo logout
```

---

## 📊 Development Workflow

### Typical Session:

```powershell
# Terminal 1 - Client App
cd d:\capstone\client\frontend
npm start
# Keeps running - press 'a' to open in emulator/device

# Terminal 2 - Worker App (NEW WINDOW)
cd d:\capstone\worker\frontend
npm start
# Keeps running - press 'a' to open in emulator/device

# Now both apps are running on same device
# You can test switching between them
```

### Making Changes:

1. Edit code in any screen file
2. Save file
3. App hot-reloads automatically! (usually within 1-2 seconds)
4. View your changes immediately

### Debug Tips:

```powershell
# Show console logs
npm start

# Then check terminal for console.log output

# Use Expo DevTools
# Press 'Shift + M' in Expo Go app
# Or press 'd' in terminal
```

---

## 🎮 Expo Dev Client Menu

When app is running, press or tap these:

| Key/Gesture | Action |
|------------|--------|
| `r` | Reload app |
| `d` | Open DevTools |
| `m` | Toggle menu |
| `w` | Open in web browser |
| `a` | Open in Android emulator |
| `i` | Open in iOS simulator |
| `q` | Exit Expo |

---

## 📚 File Structure Check

Before running, verify structure:

```
d:\capstone\
├── client\
│   └── frontend\
│       ├── package.json ✅
│       ├── app.json ✅
│       ├── App.js ✅
│       ├── index.js ✅
│       ├── screens\ ✅
│       ├── assets\ ✅
│       └── node_modules\ (created by npm install)
│
└── worker\
    └── frontend\
        ├── package.json ✅
        ├── app.json ✅
        ├── App.js ✅
        ├── screen\ ✅
        ├── android\ ✅
        └── node_modules\ (created by npm install)
```

---

## ✅ Success Checklist

When everything is working:

- [ ] Node.js and npm installed
- [ ] Expo CLI installed globally
- [ ] Client app dependencies installed (`node_modules` folder exists)
- [ ] Worker app dependencies installed (`node_modules` folder exists)
- [ ] Client app running on `exp://....:8081`
- [ ] Worker app running on `exp://....:8082`
- [ ] Both apps scanned in Expo Go on same device
- [ ] Can switch between apps on device
- [ ] Changes hot-reload automatically
- [ ] Console logs visible in terminal

---

## 🚀 Next Steps After Testing

1. **Verify both apps load**
   - Client shows home/dashboard
   - Worker shows dashboard/job list

2. **Test navigation**
   - Click buttons and screens
   - Verify no errors

3. **Check performance**
   - App should be responsive
   - No freezing or lag

4. **Ready for integration**
   - Start connecting to backend API
   - See NEXT_STEPS.md for Phase 2

---

## 📞 Support

If issues occur:

1. **Check logs** - Terminal shows errors clearly
2. **Try rebuild** - `expo prebuild --clean && npm install`
3. **Clear cache** - `npm cache clean --force`
4. **Restart emulator/device** - Power cycle
5. **Use tunnel** - If local network fails, Expo uses tunnel

---

## 💾 Useful Links

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **Android Emulator**: https://developer.android.com/studio/run/emulator
- **Troubleshooting**: https://docs.expo.dev/debugging/debugging/

---

**Status**: ✅ Ready to run!

You now have complete instructions to run both SAHAYAK apps. 🎉

Start with Step 1 above and follow along!
