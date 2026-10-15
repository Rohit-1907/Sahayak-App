# 📱 Responsive Design - Quick Reference Card

## Import Statement
```javascript
import { scale, verticalScale, moderateScale, wp, hp } from '../utils/responsive';
```

## Common Patterns

### ✅ Buttons
```javascript
// ❌ Before
button: { height: 54 }

// ✅ After
button: {
  minHeight: verticalScale(54),
  paddingVertical: verticalScale(14),
}
```

### ✅ Inputs
```javascript
// ❌ Before
input: { height: 50 }

// ✅ After  
input: {
  minHeight: verticalScale(50),
  paddingVertical: verticalScale(12),
}
```

### ✅ Circles/Avatars
```javascript
// ❌ Before
avatar: {
  width: 100,
  height: 100,
  borderRadius: 50,
}

// ✅ After
avatar: {
  width: scale(100),
  height: scale(100),
  borderRadius: scale(50),
}
```

### ✅ Text
```javascript
// ❌ Before
text: { fontSize: 16 }

// ✅ After
text: { fontSize: moderateScale(16) }
```

### ✅ Spacing
```javascript
// ❌ Before
container: {
  marginTop: 20,
  paddingHorizontal: 16,
}

// ✅ After
container: {
  marginTop: verticalScale(20),
  paddingHorizontal: moderateScale(16),
}
```

### ✅ MaxWidth
```javascript
// ❌ Before
container: { maxWidth: 350 }

// ✅ After
container: { maxWidth: wp(90) }
```

### ✅ Icons
```javascript
// ❌ Before
<Icon size={24} />

// ✅ After
<Icon size={moderateScale(24)} />
```

## Function Guide

| Function | Use For | Example |
|----------|---------|---------|
| `scale(n)` | Widths, horizontal dimensions | `width: scale(100)` |
| `verticalScale(n)` | Heights, vertical spacing | `height: verticalScale(50)` |
| `moderateScale(n)` | Font sizes, border radius, icons | `fontSize: moderateScale(16)` |
| `wp(%)` | Width percentage | `maxWidth: wp(90)` |
| `hp(%)` | Height percentage | `height: hp(50)` |

## Device Detection
```javascript
import { isSmallDevice, isMediumDevice, isLargeDevice } from '../utils/responsive';

if (isSmallDevice()) {
  // < 375px width
}

if (isMediumDevice()) {
  // 375-414px width  
}

if (isLargeDevice()) {
  // ≥ 414px width
}
```

## Screen Sizes

| Size | Width | Example Devices |
|------|-------|-----------------|
| Small | 360-374px | Galaxy S10e, iPhone SE |
| Medium | 375-413px | iPhone 12, Galaxy S21 |
| Large | 414px+ | iPhone 14 Pro Max, Galaxy S22 Ultra |

## Testing Command
```bash
# Worker App
cd d:\capstone\worker\frontend && npx expo start

# Client App  
cd d:\capstone\client\frontend && npx expo start
```

## Debug Helper
```javascript
import { logDeviceInfo } from '../utils/responsive';

// In component:
useEffect(() => {
  logDeviceInfo(); // Logs device info to console
}, []);
```

## Code Review Checklist
- [ ] No `width: number` → Use `scale(number)`
- [ ] No `height: number` → Use `verticalScale(number)` or `minHeight`
- [ ] No `fontSize: number` → Use `moderateScale(number)`
- [ ] Buttons have `minHeight` + `paddingVertical`
- [ ] Icons use `moderateScale(size)`
- [ ] No `maxWidth: 350` → Use `wp(90)`

## Files Modified ✅
```
Worker App:
✓ screen/welcome.js
✓ screen/login.js
✓ screen/RegisterScreen.js
✓ screen/OrganizationRegistrationScreen.js
✓ screen/dashboard.js
✓ screen/home/IndividualWorkerHome.js
✓ screen/home/OrganizationAdminHome.js
✓ screen/home/OrganizationWorkerHome.js

Client App:
✓ screens/Welcomescreen.js
✓ screens/Loginscreen.js

Utilities:
✓ worker/frontend/utils/responsive.js
✓ client/frontend/utils/responsive.js
```

## Status
**✅ COMPLETE** - Ready for device testing
