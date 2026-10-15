import React, { useState, useRef, useEffect } from 'react';
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
  Keyboard,
  ActivityIndicator,
  Image,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../services/auth.service';
import { useGoogleAuth, handleGoogleResponse } from '../services/google-auth.service';
import { scale, verticalScale, moderateScale, wp } from '../utils/responsive';
import { translate } from '../utils/translations';

// =====================================================
// COLORS
// =====================================================

const COLORS = {
  blue: '#49769F',
  white: '#FFFFFF',
  dark: '#111827',
  gray: '#6B7280',
  lightGray: '#9CA3AF',
  light: '#F8FAFC',
  lightBlue: '#F4F9FC',
  border: '#E5E7EB',
};


// =====================================================
// WORKER LOGIN SCREEN
// =====================================================

export default function WorkerLoginScreen({
  onLogin,
  onRegister,
  onForgotPassword,
  onBack,
  language = "English",
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const scrollRef = useRef(null);

  // Google OAuth
  const { request, response, promptAsync } = useGoogleAuth();


  // =====================================================
  // SCROLL INPUT ABOVE KEYBOARD
  // =====================================================

  const scrollToInput = (yPosition) => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: yPosition,
        animated: true,
      });
    }, 250);
  };

  // =====================================================
  // HANDLE GOOGLE OAUTH RESPONSE
  // =====================================================

  useEffect(() => {
    if (response) {
      handleGoogleAuth();
    }
  }, [response]);

  const handleGoogleAuth = async () => {
    try {
      setGoogleLoading(true);
      const result = await handleGoogleResponse(response);
      
      if (result) {
        // Check if user is a worker
        const userRole = result.user.role;
        if (userRole !== 'individual_worker' && userRole !== 'organization_worker' && userRole !== 'organization_admin') {
          Alert.alert(
            translate('accessDenied', language),
            translate('workersOnlyMessage', language)
          );
          setGoogleLoading(false);
          return;
        }
        
        await AsyncStorage.setItem('@sahayak:just_logged_in', 'true');
        Alert.alert(
          translate('successExclamation', language),
          `Welcome, ${result.user.full_name || result.user.email}!`,
          [
            {
              text: translate('ok', language),
              onPress: () => {
                if (onLogin) {
                  onLogin(result.user.role_name || result.user.role);
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Google auth error:', error);
      Alert.alert(
        translate('googleSignInFailed', language),
        error.message || translate('googleSignInTryAgain', language)
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGooglePress = async () => {
    try {
      setGoogleLoading(true);
      await promptAsync();
    } catch (error) {
      console.error('Error starting Google auth:', error);
      Alert.alert('Error', translate('failedStartGoogleSignIn', language));
      setGoogleLoading(false);
    }
  };


  // =====================================================
  // LOGIN WITH API
  // =====================================================

  const handleLogin = async () => {
    const enteredEmail = email.trim();
    const enteredPassword = password.trim();

    if (!enteredEmail) {
      Alert.alert(
        translate('emailOrMobileRequired', language),
        translate('enterEmailOrMobile', language)
      );
      return;
    }

    if (!enteredPassword) {
      Alert.alert(
        translate('passwordRequired', language),
        translate('enterPassword', language)
      );
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      const response = await login(enteredEmail, enteredPassword);
      
      // Check if user is a worker
      const userRole = response.user.role;
      if (userRole !== 'individual_worker' && userRole !== 'organization_worker' && userRole !== 'organization_admin') {
        Alert.alert(
          translate('accessDenied', language),
          translate('workersOnlyMessage', language)
        );
        setLoading(false);
        return;
      }
      
      await AsyncStorage.setItem('@sahayak:just_logged_in', 'true');
      Alert.alert(
        translate('successExclamation', language),
        `Welcome back, ${response.user.full_name || response.user.username}!`,
        [
          {
            text: translate('ok', language),
            onPress: () => {
              if (onLogin) {
                // Pass the role_name to parent component
                onLogin(response.user.role_name || response.user.role);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = translate('loginFailedTryAgain', language);

      if (error.status === 401) {
        errorMessage = translate('invalidCredentials', language);
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(translate('loginFailed', language), errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        keyboardVerticalOffset={
          Platform.OS === 'ios' ? 20 : 0
        }
      >

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={true}
          contentContainerStyle={styles.content}
        >

          {/* =================================================
              BACK BUTTON
          ================================================= */}

          {onBack && (
            <Pressable
              style={styles.backButton}
              onPress={() => {
                Keyboard.dismiss();
                onBack();
              }}
            >
              <Ionicons
                name="arrow-back"
                size={moderateScale(24)}
                color={COLORS.dark}
              />
            </Pressable>
          )}


          {/* =================================================
              WORKER LOGO
          ================================================= */}

          <View style={styles.logoBox}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>


          {/* =================================================
              TITLE
          ================================================= */}

          <Text style={styles.title}>
            {translate('workerLogin', language)}
          </Text>

          <Text style={styles.subtitle}>
            {translate('loginSubtitle', language)}
          </Text>


          {/* =================================================
              EMAIL / MOBILE
          ================================================= */}

          <View
            style={[
              styles.inputContainer,
              emailFocused && styles.inputFocused,
            ]}
          >

            <Ionicons
              name="mail-outline"
              size={moderateScale(20)}
              color={
                emailFocused
                  ? COLORS.blue
                  : COLORS.gray
              }
            />

            <TextInput
              style={styles.input}
              placeholder={translate('emailOrMobileNumber', language)}
              placeholderTextColor={COLORS.lightGray}

              value={email}
              onChangeText={setEmail}

              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}

              returnKeyType="next"

              onFocus={() => {
                setEmailFocused(true);
                scrollToInput(180);
              }}

              onBlur={() =>
                setEmailFocused(false)
              }
            />

          </View>


          {/* =================================================
              PASSWORD
          ================================================= */}

          <View
            style={[
              styles.inputContainer,
              passwordFocused && styles.inputFocused,
            ]}
          >

            <Ionicons
              name="lock-closed-outline"
              size={moderateScale(20)}
              color={
                passwordFocused
                  ? COLORS.blue
                  : COLORS.gray
              }
            />

            <TextInput
              style={styles.input}
              placeholder={translate('password', language)}
              placeholderTextColor={COLORS.lightGray}

              value={password}
              onChangeText={setPassword}

              secureTextEntry={!showPassword}

              autoCapitalize="none"
              autoCorrect={false}

              returnKeyType="done"

              onFocus={() => {
                setPasswordFocused(true);
                scrollToInput(300);
              }}

              onBlur={() =>
                setPasswordFocused(false)
              }

              onSubmitEditing={handleLogin}
            />


            {/* SHOW / HIDE PASSWORD */}

            <Pressable
              onPress={() =>
                setShowPassword(!showPassword)
              }

              style={styles.eyeButton}
            >

              <Ionicons
                name={
                  showPassword
                    ? 'eye-outline'
                    : 'eye-off-outline'
                }

                size={moderateScale(21)}
                color={COLORS.gray}
              />

            </Pressable>

          </View>


          {/* =================================================
              FORGOT PASSWORD
          ================================================= */}

          <Pressable
            style={styles.forgotButton}

            onPress={() => {

              Keyboard.dismiss();

              if (onForgotPassword) {
                onForgotPassword();
              }

            }}
          >

            <Text style={styles.forgot}>
              {translate('forgotPassword', language)}
            </Text>

          </Pressable>


          {/* =================================================
              LOGIN BUTTON
          ================================================= */}

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.buttonPressed,
              loading && styles.loginDisabled,
            ]}

            onPress={handleLogin}
            disabled={loading}
          >

            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>
                  {translate('loginButton', language)}
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={moderateScale(20)}
                  color={COLORS.white}
                />
              </>
            )}

          </Pressable>


          {/* =================================================
              DIVIDER
          ================================================= */}

          <View style={styles.dividerRow}>

            <View style={styles.divider} />

            <Text style={styles.orText}>
              {translate('or', language)}
            </Text>

            <View style={styles.divider} />

          </View>


          {/* =================================================
              GOOGLE LOGIN - TEMPORARILY DISABLED
          ================================================= */}
          {/* TODO: Fix Expo OAuth issues - will implement in future update */}
          {/* <Pressable
            style={({ pressed }) => [
              styles.googleButton,
              pressed && styles.googlePressed,
              googleLoading && styles.googleDisabled,
            ]}
            onPress={handleGooglePress}
            disabled={!request || googleLoading}
          >

            {googleLoading ? (
              <ActivityIndicator color={COLORS.dark} size="small" />
            ) : (
              <>
                <Ionicons
                  name="logo-google"
                  size={moderateScale(20)}
                  color={COLORS.dark}
                />

                <Text style={styles.googleText}>
                  Continue with Google
                </Text>
              </>
            )}

          </Pressable> */}


          {/* =================================================
              REGISTER / JOIN AS WORKER
          ================================================= */}

          <View style={styles.bottomRow}>

            <Text style={styles.bottomText}>
              {translate('wantToProvideServices', language)}
            </Text>

            <Pressable onPress={onRegister}>

              <Text style={styles.register}>
                {' '}{translate('register', language)}
              </Text>

            </Pressable>

          </View>


          {/* =================================================
              EXTRA SPACE FOR KEYBOARD SCROLL
          ================================================= */}

          <View style={styles.bottomSpace} />

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}


/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  keyboardContainer: {
    flex: 1,
  },

  content: {
    flexGrow: 1,

    justifyContent: 'center',

    paddingHorizontal: moderateScale(30),

    paddingTop: verticalScale(30),

    /*
      Extra bottom space so the complete screen
      can scroll when keyboard opens.
    */
    paddingBottom: verticalScale(180),
  },


  /* =====================================================
     BACK BUTTON
  ===================================================== */

  backButton: {
    position: 'absolute',

    top: verticalScale(20),

    left: moderateScale(20),

    width: scale(44),

    height: scale(44),

    borderRadius: scale(22),

    backgroundColor: COLORS.light,

    justifyContent: 'center',

    alignItems: 'center',

    borderWidth: 1,

    borderColor: COLORS.border,

    zIndex: 10,
  },


  /* =====================================================
     WORKER LOGO
  ===================================================== */

  logoBox: {
    width: scale(90),
    height: scale(90),
    backgroundColor: COLORS.blue,
    borderRadius: moderateScale(22),
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(24),
    overflow: 'hidden',
  },

  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(22),
  },


  /* =====================================================
     TITLE
  ===================================================== */

  title: {
    fontSize: moderateScale(32),

    fontWeight: '700',

    color: COLORS.dark,

    textAlign: 'center',
  },


  subtitle: {
    marginTop: verticalScale(10),

    fontSize: moderateScale(15),

    lineHeight: moderateScale(22),

    color: COLORS.gray,

    textAlign: 'center',

    marginBottom: verticalScale(35),
  },


  /* =====================================================
     INPUT
  ===================================================== */

  inputContainer: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: COLORS.light,

    borderRadius: moderateScale(16),

    borderWidth: 1,

    borderColor: COLORS.border,

    paddingHorizontal: moderateScale(16),

    marginBottom: verticalScale(18),

    minHeight: verticalScale(56),
  },


  inputFocused: {
    borderColor: COLORS.blue,

    backgroundColor: COLORS.lightBlue,
  },


  input: {
    flex: 1,

    marginLeft: moderateScale(10),

    fontSize: moderateScale(15),

    color: COLORS.dark,

    paddingVertical: verticalScale(16),
  },


  eyeButton: {
    width: scale(35),

    height: scale(40),

    justifyContent: 'center',

    alignItems: 'center',

    marginLeft: moderateScale(5),
  },


  /* =====================================================
     FORGOT PASSWORD
  ===================================================== */

  forgotButton: {
    alignSelf: 'flex-end',

    marginBottom: verticalScale(24),

    paddingVertical: verticalScale(4),

    paddingHorizontal: moderateScale(2),
  },


  forgot: {
    color: COLORS.blue,

    fontWeight: '600',

    fontSize: moderateScale(14),
  },


  /* =====================================================
     LOGIN BUTTON
  ===================================================== */

  loginButton: {
    backgroundColor: COLORS.blue,

    minHeight: verticalScale(56),

    borderRadius: moderateScale(16),

    justifyContent: 'center',

    alignItems: 'center',

    flexDirection: 'row',

    paddingVertical: verticalScale(16),
  },


  buttonPressed: {
    opacity: 0.75,
  },


  loginButtonText: {
    color: COLORS.white,

    fontSize: moderateScale(17),

    fontWeight: '700',

    marginRight: moderateScale(8),
  },

  loginDisabled: {
    opacity: 0.6,
  },


  /* =====================================================
     DIVIDER
  ===================================================== */

  dividerRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginVertical: verticalScale(28),
  },


  divider: {
    flex: 1,

    height: 1,

    backgroundColor: COLORS.border,
  },


  orText: {
    marginHorizontal: moderateScale(12),

    color: COLORS.gray,

    fontWeight: '600',

    fontSize: moderateScale(14),
  },


  /* =====================================================
     GOOGLE
  ===================================================== */

  googleButton: {
    minHeight: verticalScale(56),

    borderRadius: moderateScale(16),

    borderWidth: 1,

    borderColor: COLORS.border,

    flexDirection: 'row',

    justifyContent: 'center',

    alignItems: 'center',

    backgroundColor: COLORS.white,

    paddingVertical: verticalScale(16),
  },


  googlePressed: {
    backgroundColor: COLORS.light,
  },


  googleText: {
    marginLeft: moderateScale(10),

    color: COLORS.dark,

    fontWeight: '600',

    fontSize: moderateScale(15),
  },


  /* =====================================================
     REGISTER
  ===================================================== */

  bottomRow: {
    flexDirection: 'row',

    justifyContent: 'center',

    alignItems: 'center',

    marginTop: verticalScale(28),

    flexWrap: 'wrap',
  },


  bottomText: {
    color: COLORS.gray,

    fontSize: moderateScale(15),
  },


  register: {
    color: COLORS.blue,

    fontWeight: '700',

    fontSize: moderateScale(15),
  },


  /* =====================================================
     GOOGLE DISABLED
  ===================================================== */

  googleDisabled: {
    opacity: 0.5,
  },


  /* =====================================================
     EXTRA BOTTOM SPACE
  ===================================================== */

  bottomSpace: {
    height: verticalScale(120),
  },

});
