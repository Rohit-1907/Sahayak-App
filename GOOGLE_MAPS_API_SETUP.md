# Google Maps API Setup Guide 🗺️

## How to Get Google Maps API Key

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account

### Step 2: Create a New Project (or Select Existing)
1. Click on the project dropdown at the top
2. Click "NEW PROJECT"
3. Enter project name: "Sahayak App"
4. Click "CREATE"

### Step 3: Enable Required APIs
1. Go to "APIs & Services" → "Library"
2. Search and enable these APIs:
   - **Maps SDK for Android** ✅
   - **Maps SDK for iOS** ✅
   - **Directions API** (optional, for Google routing)
   - **Geocoding API** (optional, for address lookups)

### Step 4: Create API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS"
3. Select "API key"
4. Copy the API key that appears

### Step 5: Restrict API Key (IMPORTANT for security)
1. Click on the API key you just created
2. Under "API restrictions":
   - Select "Restrict key"
   - Check: Maps SDK for Android, Maps SDK for iOS
3. Under "Application restrictions":
   - For Android: Select "Android apps"
   - Click "Add an item"
   - Package name: `com.sahayak.client` (for client app)
   - SHA-1: Get from your keystore (see below)
4. Click "SAVE"

### Step 6: Get SHA-1 Certificate Fingerprint (Android)

For development (debug keystore):
```bash
# Windows
cd %USERPROFILE%\.android
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android

# The SHA-1 will be displayed - copy it
```

For production (release keystore):
```bash
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```

## Current Setup

### API Keys Already Configured:
- ✅ **Google Maps API Key:** Added to app.json
- ✅ **OpenStreetMap (OSRM):** Free, no API key required

### Files Updated:
1. `client/frontend/app.json` - Android config
2. `worker/frontend/app.json` - Android config

## OpenStreetMap Routing (OSRM)

### No API Key Required! 🎉
OSRM is completely free and open-source:
- **Public Server:** `https://router.project-osrm.org`
- **No registration needed**
- **No rate limits** (fair use)
- **No cost**

We use OSRM for route calculation and display the map using Google Maps.

## Security Best Practices

### 1. Never Commit API Keys to Git
```bash
# Add to .gitignore
app.json
.env
```

### 2. Use Environment Variables
Create `.env` file:
```
GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

### 3. Restrict API Key
- Enable only required APIs
- Add package name restrictions
- Add SHA-1 fingerprint restrictions

### 4. Monitor Usage
- Check Google Cloud Console → "APIs & Services" → "Dashboard"
- Set up billing alerts
- Monitor for unusual activity

## Billing Information

### Google Maps Platform
- **$200 free credit** every month
- Maps SDK for Android: $7 per 1,000 loads
- Directions API: $5 per 1,000 requests

### For Sahayak App (estimated):
- **100 users/day** × 2 map views = 200 loads/day
- **6,000 loads/month** = **FREE** (within $200 credit)

### OpenStreetMap (OSRM)
- **100% FREE** ✅
- Unlimited requests
- No billing required

## Testing Without API Key

You can test the app without Google Maps API key by:
1. Using OpenStreetMap tiles (less polished)
2. Using mock location data
3. Testing on iOS simulator (doesn't require API key initially)

## Troubleshooting

### "Authorization failure" error
- Check API key is correct in app.json
- Verify APIs are enabled in Cloud Console
- Check package name matches
- Verify SHA-1 fingerprint is added

### "This app is not authorized to use Google Maps"
- Package name mismatch
- API key restrictions too strict
- Wait 5 minutes after creating/modifying API key

### Maps not loading
- Check internet connection
- Verify API key in app.json
- Check console for errors
- Rebuild app after config changes

## Next Steps

1. ✅ Get Google Maps API key (follow steps above)
2. ✅ Add API key to app.json files
3. ✅ Rebuild both apps
4. ✅ Test navigation features

---

**Note:** For development, you can use the default API key I've added, but please replace it with your own for production!
