import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  blue: '#49769F',
  white: '#FFFFFF',
  dark: '#111827',
  gray: '#6B7280',
  lightGray: '#9CA3AF',
  light: '#F8FAFC',
  border: '#D9E1E8',
};

export default function ForgotPassScreen({
  onBack,
  onResetPassword,
}) {
  const [mobile, setMobile] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSendOTP = () => {
    const number = mobile.trim();

    if (!number) {
      Alert.alert(
        'Mobile Number Required',
        'Please enter your registered mobile number.'
      );
      return;
    }

    if (number.length !== 10) {
      Alert.alert(
        'Invalid Mobile Number',
        'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    if (onResetPassword) {
      onResetPassword(number);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >

          {/* BACK BUTTON */}
          <Pressable
            style={styles.backButton}
            onPress={onBack}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={COLORS.blue}
            />
          </Pressable>


          {/* LOGO */}
          <View style={styles.logoContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={52}
              color={COLORS.white}
            />
          </View>


          {/* TITLE */}
          <Text style={styles.title}>
            Forgot Password?
          </Text>

          <Text style={styles.subtitle}>
            Don't worry! Enter your registered mobile number
            {' '}and we'll send you an OTP to reset your password.
          </Text>


          {/* MOBILE LABEL */}
          <Text style={styles.label}>
            Mobile Number
          </Text>


          {/* MOBILE INPUT */}
          <View
            style={[
              styles.inputContainer,
              focused && styles.inputFocused,
            ]}
          >

            <Ionicons
              name="call-outline"
              size={22}
              color={
                focused
                  ? COLORS.blue
                  : COLORS.gray
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Enter mobile number"
              placeholderTextColor={COLORS.lightGray}
              value={mobile}
              onChangeText={(text) => {
                const numbersOnly =
                  text.replace(/[^0-9]/g, '');

                if (numbersOnly.length <= 10) {
                  setMobile(numbersOnly);
                }
              }}
              keyboardType="phone-pad"
              maxLength={10}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              returnKeyType="done"
              onSubmitEditing={handleSendOTP}
            />

          </View>


          {/* SEND OTP */}
          <Pressable
            style={({ pressed }) => [
              styles.otpButton,
              pressed && styles.buttonPressed,
              !mobile && styles.disabledButton,
            ]}
            onPress={handleSendOTP}
          >

            <Text style={styles.otpText}>
              Send OTP
            </Text>

            <View style={styles.arrowCircle}>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={COLORS.blue}
              />
            </View>

          </Pressable>


          {/* BACK TO LOGIN */}
          <Pressable
            style={styles.loginBackButton}
            onPress={onBack}
          >

            <Ionicons
              name="arrow-back"
              size={20}
              color={COLORS.blue}
            />

            <Text style={styles.loginBackText}>
              Back to Login
            </Text>

          </Pressable>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  keyboard: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 40,
  },


  /* BACK */

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,

    borderWidth: 1,
    borderColor: COLORS.border,

    backgroundColor: COLORS.white,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 42,
  },


  /* LOGO */

  logoContainer: {
    width: 112,
    height: 112,

    borderRadius: 56,

    backgroundColor: COLORS.blue,

    alignSelf: 'center',

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 28,
  },


  /* TITLE */

  title: {
    fontSize: 32,
    fontWeight: '800',

    color: COLORS.blue,

    textAlign: 'center',

    marginBottom: 14,
  },


  /* SUBTITLE */

  subtitle: {
    fontSize: 16,
    lineHeight: 24,

    color: COLORS.gray,

    textAlign: 'center',

    paddingHorizontal: 8,

    marginBottom: 42,
  },


  /* LABEL */

  label: {
    fontSize: 16,
    fontWeight: '700',

    color: COLORS.blue,

    marginBottom: 10,
  },


  /* INPUT */

  inputContainer: {
    height: 58,

    width: '100%',

    flexDirection: 'row',

    alignItems: 'center',

    borderWidth: 1.5,
    borderColor: COLORS.border,

    borderRadius: 16,

    paddingHorizontal: 17,

    backgroundColor: COLORS.light,

    marginBottom: 22,
  },

  inputFocused: {
    borderColor: COLORS.blue,
    backgroundColor: '#F4F9FC',
  },

  input: {
    flex: 1,

    marginLeft: 12,

    fontSize: 16,

    color: COLORS.dark,

    paddingVertical: 0,
  },


  /* OTP BUTTON */

  otpButton: {
    height: 58,

    width: '100%',

    borderRadius: 16,

    backgroundColor: COLORS.blue,

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 4,
  },

  disabledButton: {
    opacity: 0.55,
  },

  buttonPressed: {
    opacity: 0.75,
  },

  otpText: {
    color: COLORS.white,

    fontSize: 17,

    fontWeight: '700',

    marginRight: 12,
  },

  arrowCircle: {
    width: 36,
    height: 36,

    borderRadius: 18,

    backgroundColor: COLORS.white,

    justifyContent: 'center',
    alignItems: 'center',
  },


  /* BACK TO LOGIN */

  loginBackButton: {
    flexDirection: 'row',

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 32,

    paddingVertical: 10,
  },

  loginBackText: {
    color: COLORS.blue,

    fontSize: 16,

    fontWeight: '700',

    marginLeft: 8,
  },

});
