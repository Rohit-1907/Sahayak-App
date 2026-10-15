import React, { useRef, useState } from 'react';
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

/* =====================================================
   COLORS
===================================================== */

const COLORS = {
  primary: '#49769F',
  white: '#FFFFFF',
};

/* =====================================================
   MAIN SCREEN
===================================================== */

export default function Forgotpassscreen({
  onBack,
  onSendOTP,
}) {

  const [mobile, setMobile] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ===================================================
     ANIMATIONS
  =================================================== */

  const buttonScale = useRef(
    new Animated.Value(1)
  ).current;

  const contentOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const contentTranslateY = useRef(
    new Animated.Value(25)
  ).current;

  /* ===================================================
     SCREEN ENTRY ANIMATION
  =================================================== */

  React.useEffect(() => {

    Animated.parallel([

      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),

      Animated.spring(contentTranslateY, {
        toValue: 0,
        speed: 12,
        bounciness: 5,
        useNativeDriver: true,
      }),

    ]).start();

  }, []);

  /* ===================================================
     BUTTON PRESS IN
  =================================================== */

  const handlePressIn = () => {

    Animated.spring(buttonScale, {
      toValue: 0.95,
      speed: 20,
      bounciness: 4,
      useNativeDriver: true,
    }).start();

  };

  /* ===================================================
     BUTTON PRESS OUT
  =================================================== */

  const handlePressOut = () => {

    Animated.spring(buttonScale, {
      toValue: 1,
      speed: 20,
      bounciness: 6,
      useNativeDriver: true,
    }).start();

  };

  /* ===================================================
     SEND OTP
  =================================================== */

  const handleSendOTP = async () => {
    if (!mobile.trim()) {
      Alert.alert('Error', 'Please enter mobile number');
      return;
    }

    if (mobile.trim().length !== 10) {
      Alert.alert('Error', 'Please enter valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    try {
      console.log('[DEV] Requesting password reset OTP for:', mobile);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/auth/password-reset/request/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: mobile.trim(),
          }),
        }
      );

      const data = await response.json();
      console.log('[DATA] OTP request response:', data);

      if (response.ok && data.success) {
        Alert.alert(
          'OTP Sent!',
          `OTP has been sent to ${mobile}. Please check your messages.\n\n(For development: OTP is ${data.otp})`,
          [
            {
              text: 'OK',
              onPress: () => {
                if (typeof onSendOTP === 'function') {
                  onSendOTP(mobile);
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('[FAIL] Error sending OTP:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================
     UI
  =================================================== */

  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >

        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backPressed,
          ]}
          onPress={onBack}
        >

          <Ionicons
            name="arrow-back"
            size={24}
            color={COLORS.primary}
          />

        </Pressable>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <Animated.View
          style={[
            styles.content,
            {
              opacity: contentOpacity,

              transform: [
                {
                  translateY: contentTranslateY,
                },
              ],
            },
          ]}
        >

          {/* =================================================
              LOCK ICON
          ================================================= */}

          <View style={styles.iconCircle}>

            <Ionicons
              name="lock-closed-outline"
              size={42}
              color={COLORS.white}
            />

          </View>

          {/* =================================================
              TITLE
          ================================================= */}

          <Text style={styles.title}>
            Forgot Password?
          </Text>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <Text style={styles.description}>
            Don't worry! Enter your registered mobile
            number and we'll send you an OTP to reset
            your password.
          </Text>

          {/* =================================================
              INPUT LABEL
          ================================================= */}

          <Text style={styles.inputLabel}>
            Mobile Number
          </Text>

          {/* =================================================
              INPUT
          ================================================= */}

          <View
            style={[
              styles.inputContainer,
              focused && styles.inputFocused,
            ]}
          >

            <Ionicons
              name="call-outline"
              size={21}
              color={COLORS.primary}
            />

            <TextInput
              style={styles.input}

              placeholder="Enter mobile number"

              placeholderTextColor={COLORS.primary}

              value={mobile}

              onChangeText={setMobile}

              keyboardType="phone-pad"

              maxLength={10}

              onFocus={() => setFocused(true)}

              onBlur={() => setFocused(false)}

              returnKeyType="done"

              autoFocus={false}

              editable={true}
            />

          </View>

          {/* =================================================
              SEND OTP BUTTON
          ================================================= */}

          <Animated.View
            style={{
              transform: [
                {
                  scale: buttonScale,
                },
              ],
            }}
          >

            <Pressable
              style={[
                styles.sendButton,

                (!mobile.trim() || loading) &&
                  styles.disabledButton,
              ]}

              onPress={handleSendOTP}

              onPressIn={handlePressIn}

              onPressOut={handlePressOut}

              disabled={!mobile.trim() || loading}
            >

              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.sendButtonText}>
                    Send OTP
                  </Text>

                  <View style={styles.arrowCircle}>

                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color={COLORS.primary}
                    />

                  </View>
                </View>
              )}

            </Pressable>

          </Animated.View>

          {/* =================================================
              BACK TO LOGIN
          ================================================= */}

          <Pressable
            style={styles.loginButton}
            onPress={onBack}
          >

            <Ionicons
              name="arrow-back-outline"
              size={17}
              color={COLORS.primary}
            />

            <Text style={styles.loginText}>
              Back to Login
            </Text>

          </Pressable>

        </Animated.View>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({

  /* ===================================================
     CONTAINER
  =================================================== */

  container: {
    flex: 1,

    backgroundColor: COLORS.white,
  },

  keyboardContainer: {
    flex: 1,
  },

  /* ===================================================
     BACK BUTTON
  =================================================== */

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

    zIndex: 100,
  },

  backPressed: {
    backgroundColor: COLORS.primary,
  },

  /* ===================================================
     CONTENT
  =================================================== */

  content: {
    flex: 1,

    alignItems: 'center',

    paddingHorizontal: 28,

    paddingTop: 95,
  },

  /* ===================================================
     ICON
  =================================================== */

  iconCircle: {
    width: 105,
    height: 105,

    borderRadius: 53,

    backgroundColor: COLORS.primary,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 28,

    shadowColor: COLORS.primary,

    shadowOffset: {
      width: 0,
      height: 7,
    },

    shadowOpacity: 0.22,

    shadowRadius: 12,

    elevation: 6,
  },

  /* ===================================================
     TITLE
  =================================================== */

  title: {
    fontSize: 28,

    fontWeight: '800',

    color: COLORS.primary,

    textAlign: 'center',

    marginBottom: 12,
  },

  /* ===================================================
     DESCRIPTION
  =================================================== */

  description: {
    fontSize: 14,

    lineHeight: 21,

    color: COLORS.primary,

    opacity: 0.72,

    textAlign: 'center',

    paddingHorizontal: 8,

    marginBottom: 35,
  },

  /* ===================================================
     LABEL
  =================================================== */

  inputLabel: {
    width: '100%',

    fontSize: 14,

    fontWeight: '700',

    color: COLORS.primary,

    marginBottom: 9,
  },

  /* ===================================================
     INPUT
  =================================================== */

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

    zIndex: 1,
  },

  inputFocused: {
    borderWidth: 2,

    shadowColor: COLORS.primary,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.12,

    shadowRadius: 5,

    elevation: 2,
  },

  input: {
    flex: 1,

    height: '100%',

    marginLeft: 11,

    fontSize: 15,

    color: COLORS.primary,

    zIndex: 1,
  },

  /* ===================================================
     SEND BUTTON
  =================================================== */

  sendButton: {
    width: '100%',

    height: 55,

    borderRadius: 14,

    backgroundColor: COLORS.primary,

    justifyContent: 'center',

    alignItems: 'center',

    paddingHorizontal: 20,

    shadowColor: COLORS.primary,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.22,

    shadowRadius: 9,

    elevation: 5,
  },

  buttonContent: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',
  },

  disabledButton: {
    opacity: 0.45,
  },

  sendButtonText: {
    color: COLORS.white,

    fontSize: 16,

    fontWeight: '700',

    marginRight: 10,
  },

  /* ===================================================
     ARROW CIRCLE
  =================================================== */

  arrowCircle: {
    width: 28,
    height: 28,

    borderRadius: 14,

    backgroundColor: COLORS.white,

    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ===================================================
     BACK TO LOGIN
  =================================================== */

  loginButton: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    marginTop: 22,

    padding: 8,
  },

  loginText: {
    color: COLORS.primary,

    fontSize: 14,

    fontWeight: '700',

    marginLeft: 6,
  },

});
