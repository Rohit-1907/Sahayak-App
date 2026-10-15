# 🔐 OTP Verification for Worker Arrival - Implementation Guide

## ✅ Backend Complete

### Database ✅
- `arrival_otp` - 4-digit OTP code
- `arrival_otp_generated_at` - When OTP was created
- `arrival_verified` - Boolean flag
- `arrival_verified_at` - When verified

### API Endpoints ✅
1. **POST /api/v1/jobs/work-requests/{id}/arrived/**
   - Worker marks arrival
   - Generates 4-digit OTP
   - Status: ACCEPTED → WORKER_ARRIVED

2. **POST /api/v1/jobs/work-requests/{id}/verify-otp/**
   - Worker enters OTP from client
   - Validates OTP (15 min expiry)
   - Status: WORKER_ARRIVED → IN_PROGRESS

3. **GET /api/v1/jobs/work-requests/{id}/get-otp/**
   - Client retrieves OTP to share with worker
   - Shows worker name

---

## 📱 Frontend Implementation Needed

### Worker App Changes

#### 1. Job Detail Screen - Add "I Arrived" Button
**File:** `worker/frontend/screen/jobnear.js` (JobDetail component)

**Current Status:** ACCEPTED
**Add Button:**
```javascript
{jobStatus === 'ACCEPTED' && !arrivedAtLocation && (
  <TouchableOpacity
    style={styles.arrivedButton}
    onPress={handleArrived}
  >
    <MaterialCommunityIcons name="map-marker-check" size={20} color="#fff" />
    <Text style={styles.arrivedButtonText}>I Arrived at Location</Text>
  </TouchableOpacity>
)}
```

**Handler:**
```javascript
const handleArrived = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const response = await fetch(
      `${API_BASE_URL}/jobs/work-requests/${selectedJob}/arrived/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      setArrivedAtLocation(true);
      setShowOtpInput(true);
      Alert.alert(
        'Arrival Marked! 📍',
        'OTP has been sent to the client. Please ask the client for the OTP code to verify your arrival.'
      );
    }
  } catch (error) {
    console.error('Error marking arrival:', error);
    Alert.alert('Error', 'Failed to mark arrival');
  }
};
```

#### 2. OTP Input Screen
**Add after "I Arrived" button clicked:**

```javascript
{showOtpInput && !otpVerified && (
  <View style={styles.otpContainer}>
    <Text style={styles.otpTitle}>Enter OTP from Client</Text>
    <Text style={styles.otpSubtitle}>
      Ask the client to share the 4-digit verification code
    </Text>
    
    <TextInput
      style={styles.otpInput}
      placeholder="Enter 4-digit OTP"
      value={otpCode}
      onChangeText={(text) => setOtpCode(text.replace(/[^0-9]/g, '').slice(0, 4))}
      keyboardType="number-pad"
      maxLength={4}
    />
    
    <TouchableOpacity
      style={[
        styles.verifyButton,
        otpCode.length !== 4 && styles.verifyButtonDisabled
      ]}
      onPress={handleVerifyOtp}
      disabled={otpCode.length !== 4}
    >
      <Text style={styles.verifyButtonText}>Verify & Start Work</Text>
    </TouchableOpacity>
  </View>
)}
```

**Verify Handler:**
```javascript
const handleVerifyOtp = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const response = await fetch(
      `${API_BASE_URL}/jobs/work-requests/${selectedJob}/verify-otp/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp: otpCode }),
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      setOtpVerified(true);
      setJobStatus('IN_PROGRESS');
      Alert.alert(
        'Verified! ✅',
        'Your arrival has been verified. You can now start work.'
      );
    } else {
      Alert.alert('Invalid OTP', data.error || 'Please check and try again');
      setOtpCode('');
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    Alert.alert('Error', 'Failed to verify OTP');
  }
};
```

---

### Client App Changes

#### 1. Booking Detail Screen - Show OTP
**File:** `client/frontend/screens/Bookingdetails.js`

**Add OTP Display Section:**
```javascript
{bookingData.status === 'WORKER_ARRIVED' && !bookingData.arrival_verified && (
  <View style={styles.otpCard}>
    <View style={styles.otpHeader}>
      <MaterialCommunityIcons name="shield-check" size={32} color="#49769F" />
      <Text style={styles.otpTitle}>Worker has Arrived!</Text>
    </View>
    
    <Text style={styles.otpInstructions}>
      Share this code with {bookingData.worker_name} to verify their arrival:
    </Text>
    
    <View style={styles.otpCodeContainer}>
      <Text style={styles.otpCode}>{arrivalOtp}</Text>
    </View>
    
    <Text style={styles.otpNote}>
      ⏰ This code expires in 15 minutes
    </Text>
  </View>
)}
```

**Fetch OTP:**
```javascript
useEffect(() => {
  const fetchOtp = async () => {
    if (bookingData?.status === 'WORKER_ARRIVED' && !bookingData?.arrival_verified) {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const response = await fetch(
          `${API_URL}/api/v1/jobs/work-requests/${bookingId}/get-otp/`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        
        const data = await response.json();
        if (data.success && data.otp_available) {
          setArrivalOtp(data.otp);
        }
      } catch (error) {
        console.error('Error fetching OTP:', error);
      }
    }
  };
  
  fetchOtp();
  
  // Refresh OTP every 10 seconds while waiting
  const interval = setInterval(fetchOtp, 10000);
  return () => clearInterval(interval);
}, [bookingData?.status]);
```

---

## 🎨 Styling

### Worker App Styles
```javascript
arrivedButton: {
  backgroundColor: '#49769F',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  borderRadius: 12,
  marginVertical: 16,
  gap: 8,
},
arrivedButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
otpContainer: {
  backgroundColor: '#F8FAFC',
  padding: 20,
  borderRadius: 12,
  marginVertical: 16,
},
otpTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: '#111827',
  marginBottom: 8,
},
otpSubtitle: {
  fontSize: 14,
  color: '#6B7280',
  marginBottom: 20,
},
otpInput: {
  backgroundColor: '#fff',
  borderWidth: 2,
  borderColor: '#49769F',
  borderRadius: 12,
  padding: 16,
  fontSize: 24,
  fontWeight: '700',
  textAlign: 'center',
  letterSpacing: 8,
},
verifyButton: {
  backgroundColor: '#24935D',
  padding: 16,
  borderRadius: 12,
  alignItems: 'center',
  marginTop: 16,
},
verifyButtonDisabled: {
  backgroundColor: '#9CA3AF',
},
verifyButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
```

### Client App Styles
```javascript
otpCard: {
  backgroundColor: '#EEF4F8',
  padding: 20,
  borderRadius: 12,
  marginVertical: 16,
  borderWidth: 2,
  borderColor: '#49769F',
},
otpHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 12,
  gap: 12,
},
otpTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: '#111827',
},
otpInstructions: {
  fontSize: 14,
  color: '#6B7280',
  marginBottom: 16,
},
otpCodeContainer: {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 12,
  alignItems: 'center',
  borderWidth: 2,
  borderColor: '#49769F',
  borderStyle: 'dashed',
},
otpCode: {
  fontSize: 48,
  fontWeight: '700',
  color: '#49769F',
  letterSpacing: 12,
},
otpNote: {
  fontSize: 12,
  color: '#6B7280',
  textAlign: 'center',
  marginTop: 12,
},
```

---

## 📊 Status Flow

```
1. ACCEPTED
   ├─> Worker travels to location
   │
2. Worker clicks "I Arrived" ──> WORKER_ARRIVED
   ├─> OTP generated (4 digits)
   ├─> Client sees OTP
   │
3. Worker enters OTP
   ├─> Backend validates
   │   ├─> Correct → IN_PROGRESS ✅
   │   └─> Wrong → Try again ❌
   │
4. IN_PROGRESS
   └─> Work can begin
```

---

## 🔒 Security Features

- ✅ 4-digit OTP (random)
- ✅ 15-minute expiry
- ✅ Single use (cannot reuse after verification)
- ✅ Worker and client authorization checks
- ✅ Status validation at each step

---

## 📝 Next Steps

1. **Worker App:**
   - [ ] Add state variables (arrivedAtLocation, showOtpInput, otpCode, otpVerified)
   - [ ] Add "I Arrived" button to Job Detail
   - [ ] Add OTP input UI
   - [ ] Add handlers (handleArrived, handleVerifyOtp)
   - [ ] Add styling

2. **Client App:**
   - [ ] Add state variable (arrivalOtp)
   - [ ] Add OTP display card
   - [ ] Add fetchOtp function
   - [ ] Add auto-refresh logic
   - [ ] Add styling

3. **Testing:**
   - [ ] Worker accepts job
   - [ ] Worker clicks "I Arrived"
   - [ ] Client sees OTP
   - [ ] Worker enters correct OTP → Success
   - [ ] Worker enters wrong OTP → Error message
   - [ ] Test OTP expiry (15 mins)

---

**Ready to implement? Start with the worker app Job Detail screen!** 🚀
