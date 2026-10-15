# SAHAYAK Apps Testing Guide

## 🎯 Quick Test Summary

Both **Client** and **Worker** apps are **ready to run immediately**. They have complete code with existing UI screens.

---

## ⚡ TL;DR - Run in 3 Steps

### Step 1: Client App
```bash
cd d:\capstone\client\frontend
npm install
npm start
```
Then **scan QR code** in Expo Go app

### Step 2: Worker App (New Terminal)
```bash
cd d:\capstone\worker\frontend
npm install
npm start
```
Then **scan QR code** in Expo Go app

### Step 3: Test Both
Open both on same Android device - both apps run simultaneously! 

---

## 📱 What You'll See When Running

### Client App Features (Already Coded)
✅ Splash Screen  
✅ Language Selection  
✅ Onboarding Screens  
✅ Login/Register  
✅ Home Dashboard  
✅ Service Categories (Plumbing, Painting, Electrician, etc.)  
✅ Worker Search & Filtering  
✅ Service Request Creation  
✅ Booking Management  
✅ Payment Screen  
✅ Worker Tracking  
✅ Notifications  
✅ Profile Management  
✅ Chatbot Integration  
✅ Help & Support  

### Worker App Features (Already Coded)
✅ Splash Screen  
✅ Language Selection  
✅ Worker Welcome  
✅ Login/Register  
✅ Dashboard  
✅ Available Jobs List  
✅ Job Details  
✅ Accept/Reject Jobs  
✅ Job Status Updates  
✅ Earnings Tracking  
✅ Profile Management  
✅ Settings  
✅ Voice Assistant  
✅ Chatbot  
✅ Organization Module  

---

## 📋 App Configuration Status

### Client App (✅ Updated)
```json
{
  "name": "SAHAYAK Client",
  "slug": "sahayak-client",
  "version": "1.0.0",
  "expo": "~57.0.0",
  "package": "com.sahayak.client"
}
```

### Worker App (✅ Updated)
```json
{
  "name": "SAHAYAK Worker", 
  "slug": "sahayak-worker",
  "version": "1.0.0",
  "expo": "~57.0.0",
  "package": "com.sahayak.worker"
}
```

---

## 🧪 Testing Scenarios

### Test 1: Client App Startup
1. Run client app
2. You should see:
   - Splash screen (2 seconds)
   - Language selection
   - Onboarding screens
   - Login/Register screen
   - Home dashboard
3. Navigate through bottom tabs
4. ✅ Pass if all screens load without errors

### Test 2: Worker App Startup  
1. Run worker app (separate terminal)
2. You should see:
   - Splash screen
   - Language selection
   - Worker login
   - Dashboard
   - Jobs list
3. Tap "Available Jobs"
4. ✅ Pass if screens navigate smoothly

### Test 3: Both Apps Together
1. Both apps running on same device
2. Open Client app
3. Switch to Worker app
4. Switch back to Client
5. ✅ Pass if both work without crashing

### Test 4: Navigation
**Client App:**
- [ ] Home → Browse services
- [ ] Service selection → Create request
- [ ] Booking list → View booking details
- [ ] Profile → Edit profile
- [ ] Settings → Change language/theme

**Worker App:**
- [ ] Home → View available jobs
- [ ] Job detail → Accept job
- [ ] Dashboard → Earnings
- [ ] Profile → Update skills
- [ ] Settings → Change settings

### Test 5: User Interactions
- [ ] Click buttons - responsive
- [ ] Navigate screens - smooth transitions
- [ ] No crashes or errors
- [ ] Bottom navigation works
- [ ] Modals/alerts work

---

## 🔧 Pre-Testing Checklist

Before running tests, verify:

```bash
# Check Node.js installed
node --version
# Expected: v18.x.x or higher

# Check npm installed
npm --version
# Expected: 9.x.x or higher

# Install Expo CLI if needed
npm install -g expo-cli

# Verify Expo
expo --version
# Expected: 57.x.x compatible version
```

---

## 📊 Expected Performance

| Metric | Expected |
|--------|----------|
| App startup time | 10-30 seconds |
| Screen transition | <500ms |
| Button responsiveness | Immediate |
| Memory usage | 100-200MB per app |
| CPU usage | Low (5-10%) when idle |

---

## 🐛 What to Look For

### Good Signs ✅
- App loads without errors
- All screens display properly
- Text is readable
- Images load
- Buttons are clickable
- Navigation smooth
- No console errors
- Hot reload works (save file, app updates)

### Issues to Report ❌
- App crashes on load
- Blank screens
- Text overlapping
- Images not loading
- Buttons not responding
- Navigation errors
- Red error screens
- Performance lag

---

## 🚀 Step-by-Step Test Execution

### Prerequisites (5 minutes)

1. **Install Node.js**
   ```bash
   # From https://nodejs.org/ (LTS)
   # Verify: node --version
   ```

2. **Install Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

3. **Download Expo Go**
   - Android: Google Play Store
   - Search "Expo Go"
   - Install free app

---

### Run Client App (5 minutes)

```bash
# Terminal 1
cd d:\capstone\client\frontend
npm install
npm start

# You'll see:
# exp://192.168.0.100:8081

# In Expo Go:
# Tap "Scan QR code" (or camera icon)
# Point at QR code in terminal
# App loads!
```

---

### Run Worker App (5 minutes)

```bash
# Terminal 2 (NEW WINDOW - keep Terminal 1 open)
cd d:\capstone\worker\frontend
npm install  
npm start

# You'll see:
# exp://192.168.0.100:8082

# In Expo Go:
# Can scan this code too (or paste URL)
# Worker app loads!
```

---

### Test Both Apps (10 minutes)

On your Android device with both apps open:

1. **Client App**
   - Tap home button
   - Swipe through categories
   - Try service request flow
   - Check worker list

2. **Worker App**
   - View available jobs
   - Check job details
   - View dashboard
   - Check earnings

3. **Switching**
   - Alt-tab between apps
   - Use app switcher
   - Verify smooth transitions

---

## 📈 Test Results Template

Use this to track your testing:

```markdown
## Test Results - Date: [TODAY]

### Environment
- [ ] Node.js v18+
- [ ] npm 9+
- [ ] Expo CLI installed
- [ ] Expo Go on device
- [ ] USB debugging enabled

### Client App
- [ ] Installed successfully
- [ ] Startup without errors
- [ ] All screens load
- [ ] Navigation works
- [ ] Responsive UI
- [ ] No crashes

### Worker App
- [ ] Installed successfully
- [ ] Startup without errors
- [ ] All screens load
- [ ] Navigation works
- [ ] Responsive UI
- [ ] No crashes

### Both Apps Together
- [ ] Can run simultaneously
- [ ] Can switch between
- [ ] No interference
- [ ] Stable performance

### Issues Found
- [ ] Issue 1: ...
- [ ] Issue 2: ...
- [ ] Issue 3: ...

### Overall Status
- [ ] ✅ READY FOR DEVELOPMENT
- [ ] ⚠️ MINOR ISSUES
- [ ] ❌ BLOCKING ISSUES
```

---

## 🎯 Next Steps After Testing

Once both apps are running successfully:

1. **Phase 2: API Integration**
   - Connect to backend
   - See NEXT_STEPS.md

2. **Phase 3: Feature Testing**
   - Test with real backend data
   - Full end-to-end flows

3. **Phase 4: Bug Fixes**
   - Fix any issues found
   - Optimize performance

---

## 💡 Pro Tips

1. **Use Chrome DevTools**
   - Press `Shift + M` in Expo Go
   - Or press `d` in terminal
   - View console logs

2. **Hot Reload**
   - Save file changes
   - App reloads automatically
   - No need to restart

3. **Multiple Devices**
   - Run same app on 2 devices
   - Test multi-user scenarios
   - Verify data syncing

4. **Use Emulator**
   - Android Studio → Virtual Device
   - Press `a` in terminal
   - App opens in emulator
   - Faster than scanning

5. **Check Logs**
   - Terminal shows all errors
   - Look for red text
   - Copy errors for debugging

---

## 📞 Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| "Port already in use" | `expo start --port 8085` |
| App won't load | `npm cache clean --force && npm install` |
| Blank screen | Press `r` to reload or `expo prebuild --clean` |
| Scanner won't work | Paste tunnel URL from terminal instead |
| Permission errors | Enable USB debugging on device |
| "Module not found" | `npm install && expo prebuild --clean` |

---

## ✅ Success = Everything Works!

Once you can:
✅ Launch Client app  
✅ Launch Worker app  
✅ Navigate both apps  
✅ See all screens  
✅ Click buttons  
✅ No crashes  

**You're ready for Phase 2: Backend Integration!**

---

**Ready to test?** 

Start with: `cd d:\capstone\client\frontend && npm install && npm start`

See HOW_TO_RUN_APPS.md for detailed instructions!
