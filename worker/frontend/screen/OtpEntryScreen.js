import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../config/api';

const PURPLE = '#49769F';
const BG = '#F8FAFC';
const TEXT = '#111827';
const MUTED = '#6B7280';
const GREEN = '#24935D';
const RED = '#D94C4C';
const BORDER = '#E0E7ED';

export default function OtpEntryScreen({ go, requestId, clientName }) {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  console.log('[VIEW] OtpEntryScreen MOUNTED');
  console.log('   Request ID:', requestId);
  console.log('   Client:', clientName);

  const handlePinChange = (value, index) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (index === 5 && value) {
      const fullPin = newPin.join('');
      if (fullPin.length === 6) {
        Keyboard.dismiss();
        setTimeout(() => verifyOTP(fullPin), 300);
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async (fullPin = pin.join('')) => {
    if (fullPin.length !== 6) {
      Alert.alert('Invalid PIN', 'Please enter all 6 digits');
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'Please login to continue');
        return;
      }

      console.log('[REQ] Verifying OTP:', fullPin, 'for job:', requestId);

      const response = await fetch(
        API_ENDPOINTS.JOB_VERIFY_OTP(requestId),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pin: fullPin }),
        }
      );

      const data = await response.json();

      console.log('[RES] OTP verification response:', data);

      if (response.ok && data.success) {
        AsyncStorage.removeItem(`@cache_job_detail_${requestId}`).catch(() => {});
        AsyncStorage.removeItem('@cache_worker_requests_SCHEDULED').catch(() => {});
        AsyncStorage.removeItem('@cache_worker_requests_ALL').catch(() => {});
        Alert.alert(
          'Success!',
          'Arrival verified successfully. You can now start the work.',
          [
            {
              text: 'OK',
              onPress: () => go('requests'),
            },
          ]
        );
      } else {
        Alert.alert(
          'Verification Failed',
          data.error || 'Invalid or expired PIN. Please ask the client for the correct PIN.',
          [{ text: 'Try Again' }]
        );
        // Clear PIN for retry
        setPin(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('[FAIL] Error verifying OTP:', err);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    Alert.alert(
      'Resend PIN',
      'This will generate a new PIN for the client. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resend',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('access_token');
              const response = await fetch(
                API_ENDPOINTS.JOB_GENERATE_OTP(requestId),
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              const data = await response.json();

              if (response.ok && data.success) {
                Alert.alert('Success', 'New PIN sent to client. Please ask for the new PIN.');
                setPin(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
              } else {
                Alert.alert('Error', data.error || 'Failed to generate new PIN');
              }
            } catch (err) {
              Alert.alert('Error', 'Network error. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => go('workerJobDetails', { requestId })}
          delayPressIn={0}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={TEXT} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Enter PIN</Text>

        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="lock-outline" size={64} color={PURPLE} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Verify Your Arrival</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Ask <Text style={styles.clientName}>{clientName || 'the client'}</Text> for the 6-digit PIN from their notification screen
        </Text>

        {/* PIN Input */}
        <View style={styles.pinContainer}>
          {pin.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.pinInput,
                digit ? styles.pinInputFilled : {},
              ]}
              value={digit}
              onChangeText={(value) => handlePinChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!loading}
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            (loading || pin.join('').length !== 6) && styles.verifyButtonDisabled,
          ]}
          onPress={() => verifyOTP()}
          disabled={loading || pin.join('').length !== 6}
          delayPressIn={0}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.verifyButtonText}>Verify PIN</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Resend Link */}
        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendOTP}
          disabled={loading}
          delayPressIn={0}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="refresh" size={18} color={PURPLE} />
          <Text style={styles.resendText}>Generate New PIN</Text>
        </TouchableOpacity>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={MUTED}
          />
          <Text style={styles.infoText}>
            The client will see the PIN in their app's notification screen. The PIN expires in 3 minutes.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BG,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
  },

  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },

  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: PURPLE + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 12,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 15,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },

  clientName: {
    fontWeight: '700',
    color: PURPLE,
  },

  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },

  pinInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: BORDER,
    borderRadius: 12,
    marginHorizontal: 6,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: TEXT,
    backgroundColor: '#FFFFFF',
  },

  pinInputFilled: {
    borderColor: PURPLE,
    backgroundColor: PURPLE + '10',
  },

  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PURPLE,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    elevation: 3,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  verifyButtonDisabled: {
    opacity: 0.5,
  },

  verifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 10,
  },

  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 12,
  },

  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: PURPLE,
    marginLeft: 6,
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    color: MUTED,
    lineHeight: 19,
    marginLeft: 10,
  },
});
