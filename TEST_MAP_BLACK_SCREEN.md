# 🧪 Test Google Maps - Black Screen Debug

## Current Situation
- Map shows black screen when clicking "Navigate to Worker"
- react-native-maps is installed (v1.27.2)
- Google Maps API key is configured
- App has been rebuilt with plugin

## 🔍 Debugging Steps

### Step 1: Test Basic Map First

I've created a simple test map screen to isolate the issue.

**To access the test map, temporarily add this button in HomeScreen.js:**

Open `d:\capstone\client\frontend\screens\Homescreen.js` and add this button near the top (after the header):

```javascript
{/* TEST MAP BUTTON - Remove after debugging */}
<Pressable
  style={{
    backgroundColor: '#FF6B6B',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  }}
  onPress={() => {
    console.log('🧪 Opening test map');
    if (props.onNavigate) {
      props.onNavigate('testMap');
    }
  }}
>
  <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>
    🧪 TEST MAP (Debug)
  </Text>
</Pressable>
```

**Alternative: Modify App.js temporarily**

Or you can temporarily change the home screen navigation in App.js:

Find the line around line 1775 where HomeScreen is rendered and add:

```javascript
if (screen === 'home') {
  return (
    <HomeScreen
      onNavigate={(nextScreen) => {
        console.log(`🧭 Navigation: "home" → "${nextScreen}"`);
        setScreen(nextScreen);
      }}
      // ... rest of props
    />
  );
}
```

Then you can call `setScreen('testMap')` from anywhere.

### Step 2: What to Look For

**If Test Map Shows (has Google branding):**
✅ Google Maps is working!
❌ Issue is in NavigationMapScreen.js (coordinates, region, or route loading)

**If Test Map is also Black:**
❌ Google Maps not initialized properly
- Check AndroidManifest.xml has API key
- Check Google Cloud Console API is enabled
- Try with a different device/emulator

### Step 3: Check Console Logs

When you open the test map or navigation map, look for:

```
🗺️ TestMapScreen rendered
📍 Test Location: {latitude: 18.5204, longitude: 73.8567}
✅ Test Map Ready!
```

Or errors:
```
❌ Test Map Error: [error details]
❌ MapView error: Authorization failure
```

## 🔧 Quick Fixes to Try

### Fix 1: Remove Provider (Use Default)

I've already updated NavigationMapScreen.js to remove `PROVIDER_GOOGLE`. This might help if Google provider isn't initializing.

### Fix 2: Check AndroidManifest.xml

Run prebuild to generate native code:

```bash
cd d:\capstone\client\frontend
npx expo prebuild --clean
```

Then check if `android/app/src/main/AndroidManifest.xml` has:

```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="AIzaSyC7pA_4_cuuBw_dtRUjJ7tIAFXUeJ8hBIA"/>
```

### Fix 3: Try Development Client

Instead of Expo Go, try building a development client:

```bash
cd d:\capstone\client\frontend
npx expo run:android
```

This creates a native build with the map properly compiled.

### Fix 4: Check Google API Key

1. Go to: https://console.cloud.google.com/google/maps-apis/credentials
2. Find your key: `AIzaSyC7pA_4_cuuBw_dtRUjJ7tIAFXUeJ8hBIA`
3. Click "Edit"
4. Under "API restrictions", ensure these are checked:
   - ✅ Maps SDK for Android
   - ✅ Maps SDK for iOS
5. Under "Application restrictions":
   - Set to "None" (for testing)
6. Save and wait 5-10 minutes

### Fix 5: Alternative - Use Expo's MapView

If Google Maps keeps failing, try Expo's default map (doesn't need API key):

In NavigationMapScreen.js, change:
```javascript
import MapView from 'react-native-maps';
// Remove PROVIDER_GOOGLE
```

And in the MapView component:
```javascript
<MapView
  style={styles.map}
  // Remove provider prop completely
  initialRegion={region}
  ...
>
```

## 📋 Debug Checklist

Run through this list:

- [ ] react-native-maps installed? (`npm list react-native-maps`)
- [ ] app.json has react-native-maps plugin?
- [ ] App rebuilt with clean cache? (`npx expo start -c`)
- [ ] API key valid in Google Cloud Console?
- [ ] Maps SDK for Android enabled?
- [ ] Test map also black or working?
- [ ] Console shows map errors or just blank?
- [ ] Worker coordinates exist in database?
- [ ] Client coordinates passed to screen?

## 🎯 Most Likely Causes

Based on "black screen" symptom:

1. **Google Maps API Key Issue (70% likely)**
   - Not activated yet (5-10 min delay)
   - Wrong restrictions
   - Wrong API enabled

2. **Native Build Issue (20% likely)**
   - Plugin not compiled into native code
   - Need `npx expo run:android` instead of Expo Go
   - AndroidManifest missing API key

3. **Map Component Issue (10% likely)**
   - Invalid coordinates (NaN, null, undefined)
   - Region calculation error
   - PROVIDER_GOOGLE not available

## 🚨 Emergency Fallback

If nothing works, use external Google Maps URL instead of embedded map:

```javascript
// In Bookingsummary.js, replace handleNavigateToWorker with:
const handleNavigateToWorker = () => {
  const url = `https://www.google.com/maps/dir/?api=1&origin=${clientLocation.latitude},${clientLocation.longitude}&destination=${workerLocation.latitude},${workerLocation.longitude}`;
  Linking.openURL(url);
};
```

This opens external Google Maps app, which always works.

## 📞 Next Steps

1. Try the test map button first
2. Share console logs here (especially any ❌ errors)
3. Check if test map is black or shows map
4. Then we can pinpoint the exact issue

The test map file is created at:
`d:\capstone\client\frontend\screens\TestMapScreen.js`
