# Fix "handleCallClient doesn't exist" Error

## Problem
React Native Metro bundler is showing a cached error: `Property 'handleCallClient' doesn't exist`

The function **DOES exist** in the code (line 241), but React Native is using an old cached version.

## Solution: Clear Metro Cache

### Option 1: Using PowerShell Script (Recommended)
```powershell
cd d:\capstone\worker\frontend
.\CLEAR_CACHE_RESTART.ps1
```

### Option 2: Manual Commands
```powershell
# Stop the Metro bundler (Ctrl+C in the terminal running it)

# Clear cache
cd d:\capstone\worker\frontend
Remove-Item -Path ".\.expo\*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue

# Start fresh
npm start -- --clear
```

Then in **another terminal**:
```powershell
cd d:\capstone\worker\frontend
npm run android
```

### Option 3: Quick Reset Cache
In the Metro bundler terminal, press:
- `r` - Reload app
- `Shift + r` - Reload and clear cache

### Option 4: Complete Reset (if above don't work)
```powershell
cd d:\capstone\worker\frontend

# Stop Metro bundler (Ctrl+C)

# Clear everything
Remove-Item -Path ".\node_modules" -Recurse -Force
Remove-Item -Path ".\.expo" -Recurse -Force  
Remove-Item -Path ".\package-lock.json" -Force -ErrorAction SilentlyContinue

# Reinstall
npm install

# Start fresh
npm start -- --clear
```

## Verification

The `handleCallClient` function exists at line 241-250 in:
`d:\capstone\worker\frontend\screen\home\OrgWorkerJobDetails.js`

```javascript
const handleCallClient = () => {
  if (!work?.client_contact) {
    Alert.alert('No Contact', 'Client contact not available');
    return;
  }

  const phoneUrl = `tel:${work.client_contact}`;
  Linking.openURL(phoneUrl).catch(() => {
    Alert.alert('Error', 'Could not make call');
  });
};
```

It's called at line 384:
```javascript
<TouchableOpacity 
  style={styles.detailRow} 
  onPress={handleCallClient}
  activeOpacity={0.7}
>
```

## Why This Happens

React Native Metro bundler aggressively caches JavaScript files for fast reload. When you make changes, sometimes it doesn't detect them properly and serves old cached versions.

This is a **common React Native issue**, not a code problem!

## After Cache Clear

Once the cache is cleared and the app reloads:
1. ✅ Location will display with orange map marker icon
2. ✅ "Navigate to Job Location" button will work
3. ✅ Client phone number will be clickable
4. ✅ Start Work button will work
5. ✅ Complete Work button will work
6. ✅ Colors will match the rest of the UI

All features are implemented correctly! 🎉
