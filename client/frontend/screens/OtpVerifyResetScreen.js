import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config/api';

const COLORS = {
  primary: '#49769F',
  white: '#FFFFFF',
};

export default function OtpVerifyResetScreen({
  onBack,
  onSuccess,
  phone,
}) {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      speed: 20,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      speed: 20,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  };

  const handleResetPassword = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter new password');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      console.log('[SEC] Verifying OTP and resetting password...');

      const response = await fetch(
        `${API_BASE_URL}/api/v1/auth/password-reset/verify/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: phone,
            otp: otp.trim(),
            new_password: newPassword,
          }),
        }
      );

      const data = await response.json();
      console.log('[DATA] Reset password response:', data);

      if (response.ok && data.success) {
        Alert.alert(
          'Success!',
          'Password reset successfully. You can now login with your new password.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onSuccess) onSuccess();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('[FAIL] Error resetting password:', error);
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backPressed,
          ]}
          onPress={onBack}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </Pressable>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name="key-outline" size={42} color={COLORS.white} />
          </View>

          <Text style={styles.title}>Reset Password</Text>

          <Text style={styles.description}>
            Enter the OTP sent to {phone} and your new password
          </Text>

          {/* OTP Input */}
          <Text style={styles.inputLabel}>Enter OTP</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="shield-checkmark-outline" size={21} color={COLORS.primary} />
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit OTP"
              placeholderTextColor={COLORS.primary}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          {/* New Password */}
          <Text style={styles.inputLabel}>New Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={21} color={COLORS.primary} />
            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              placeholderTextColor={COLORS.primary}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={21}
                color={COLORS.primary}
              />
            </Pressable>
          </View>

          {/* Confirm Password */}
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={21} color={COLORS.primary} />
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor={COLORS.primary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
          </View>

          {/* Reset Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Pressable
              style={[
                styles.resetButton,
                (!otp || !newPassword || !confirmPassword || loading) && styles.disabledButton,
              ]}
              onPress={handleResetPassword}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={!otp || !newPassword || !confirmPassword || loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.resetButtonText}>Reset Password</Text>
                  <View style={styles.arrowCircle}>
                    <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                  </View>
                </>
              )}
            </Pressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardContainer: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 18,
    left: 20,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    zIndex: 10,
  },
  backPressed: {
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 95,
  },
  iconCircle: {
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.primary,
    opacity: 0.72,
    textAlign: 'center',
    paddingHorizontal: 8,
    marginBottom: 35,
  },
  inputLabel: {
    width: '100%',
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 9,
  },
  inputContainer: {
    width: '100%',
    height: 55,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    height: '100%',
    marginLeft: 11,
    fontSize: 15,
    color: COLORS.primary,
  },
  resetButton: {
    width: '100%',
    height: 55,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 9,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.45,
  },
  resetButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 10,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
