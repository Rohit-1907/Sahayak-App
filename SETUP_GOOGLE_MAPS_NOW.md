# 🗺️ Setup Google Maps API Key - Quick Guide

## ⚡ Quick Steps (5 minutes)

### 1. Get Your API Key
1. Go to: **https://console.cloud.google.com/**
2. Sign in with Google
3. Create new project: "Sahayak"
4. Go to **APIs & Services → Library**
5. Enable: **Maps SDK for Android**
6. Go to **APIs & Services → Credentials**
7. Click **+ CREATE CREDENTIALS → API key**
8. **Copy the API key** that appears

### 2. Add API Key to Apps

Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key in both files:

#### Client App
**File:** `d:\capstone\client\frontend\app.json`

```json
"config": {
  "googleMaps": {
    "apiKey": "AIzaSy...YOUR_ACTUAL_KEY_HERE"
  }
}
```

#### Worker App  
**File:** `d:\capstone\worker\frontend\app.json`

```json
"config": {
  "googleMaps": {
    "apiKey": "AIzaSy...YOUR_ACTUAL_KEY_HERE"
  }
}
```

### 3. Rebuild Apps
```bash
# Stop current Metro bundler (Ctrl+C)

# Client app
cd d:\capstone\client\frontend
npx expo start -c

# Worker app  
cd d:\capstone\worker\frontend
npx expo start -c
```

## ✅ Done!

The map will now:
- ✅ Open **inside your app** (not external Google Maps)
- ✅ Show **custom markers** (client, worker, job locations)
- ✅ Draw **blue route** between locations
- ✅ Display **distance & duration**
- ✅ Use **OpenStreetMap routing** (free, no key needed)

## 🆓 Cost: FREE!

- Google gives **$200 free credit/month**
- Your usage will be well within this limit
- OpenStreetMap routing is completely free

## 🔒 Security (Do Later)

For production, restrict your API key:
1. Go to Cloud Console → Credentials
2. Click your API key
3. Under "Application restrictions":
   - Select "Android apps"
   - Add package: `com.sahayak.client`
   - Add package: `com.sahayak.worker`
4. Save

## ❓ Troubleshooting

**"Authorization failure"**
- Wait 5 minutes after creating API key
- Check API key is copied correctly
- Rebuild app after adding key

**"Module not found"**
- Run: `npx expo install react-native-maps`
- Rebuild with: `npx expo start -c`

**Need Help?**
- Full guide: `GOOGLE_MAPS_API_SETUP.md`
- Or just message me! 😊

---

**Remember:** Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual key in both app.json files!
