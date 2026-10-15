import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../services/auth.service';
import { useGoogleAuth, handleGoogleResponse } from '../services/google-auth.service';
import { scale, verticalScale, moderateScale, wp } from '../utils/responsive';
import { translate } from '../utils/translations';
import { useTextToSpeech } from '../utils/useTextToSpeech';
import VoiceGuidanceButton from '../components/VoiceGuidanceButton';

let loginIntroSpoken = false;

export default function LoginScreen({
  onLogin,
  onRegister,
  onBack,
  onForgotPassword,
  language = "english",
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [screenReady, setScreenReady] = useState(false);

  const { speak, stop } = useTextToSpeech(language);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stop();
    };
  }, [stop]);

  // Plays the "Welcome back" Voice Assistance instruction once per
  // app session, after the login screen entrance animation settles
  // (never on re-renders, language changes, or typing).
  useEffect(() => {
    if (screenReady && !loginIntroSpoken) {
      loginIntroSpoken = true;
      if (mountedRef.current) {
        speak(translate(language, 'loginVoiceAssistIntro'));
      }
    }
  }, [screenReady, language, speak]);

  // Google OAuth
  const { request, response, promptAsync } = useGoogleAuth();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;
  const buttonAnim = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 650,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.spring(buttonAnim, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start(() => setScreenReady(true));
  }, []);

  // Handle Google OAuth response
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
        await AsyncStorage.setItem('@sahayak:just_logged_in', 'true');
        Alert.alert(
          translate(language, 'success'),
          `Welcome, ${result.user.full_name || result.user.email}!`,
          [
            {
              text: translate(language, 'continueText'),
              onPress: () => {
                if (onLogin) {
                  onLogin(result.user);
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Google auth error:', error);
      Alert.alert(
        translate(language, 'googleSignInFailed'),
        error.message || translate(language, 'googleSignInError')
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
      Alert.alert(translate(language, 'validationError'), translate(language, 'googleStartError'));
      setGoogleLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async () => {
    // Validation
    if (!email.trim() || !password) {
      Alert.alert(translate(language, 'validationError'), translate(language, 'enterBoth'));
      return;
    }

    setLoading(true);

    try {
      const response = await login(email.trim(), password);
      await AsyncStorage.setItem('@sahayak:just_logged_in', 'true');
      
      Alert.alert(
        translate(language, 'success'),
        `Welcome back, ${response.user.full_name || response.user.username}!`,
        [
          {
            text: translate(language, 'continueText'),
            onPress: () => {
              if (onLogin) {
                onLogin(response.user);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = translate(language, 'loginFailedDefault');
      
      if (error.status === 401) {
        errorMessage = translate(language, 'invalidCredentials');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(translate(language, 'loginFailed'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >

          {/* BACK BUTTON */}
          <Pressable
            style={styles.backButton}
            onPress={onBack}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#111827"
            />
          </Pressable>

          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim,
                  },
                ],
              },
            ]}
          >

            {/* LOGO */}
            <View style={styles.logoOuter}>
              <View style={styles.logoInner}>
                <Image
                  source={require('../assets/logo.png')}
                  style={styles.logoImage}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* TITLE */}
            <Text style={styles.title}>
              {translate(language, 'welcomeBack')}
            </Text>

            <Text style={styles.subtitle}>
              {translate(language, 'loginSubtitle')}
            </Text>


            {/* EMAIL */}
            <View style={styles.inputContainer}>

              <Ionicons
                name="mail-outline"
                size={20}
                color="#49769F"
              />

              <TextInput
                style={styles.input}
                placeholder={translate(language, 'emailPlaceholder')}
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

            </View>


            {/* PASSWORD */}
            <View style={styles.inputContainer}>

              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#49769F"
              />

              <TextInput
                style={styles.input}
                placeholder={translate(language, 'passwordPlaceholder')}
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />

              <Pressable
                onPress={() =>
                  setShowPassword(!showPassword)
                }
              >
                <Ionicons
                  name={
                    showPassword
                      ? 'eye-outline'
                      : 'eye-off-outline'
                  }
                  size={20}
                  color="#6B7280"
                />
              </Pressable>

            </View>


            {/* FORGOT PASSWORD */}
            <Pressable
              style={styles.forgotButton}
              onPress={onForgotPassword}
            >
              <Text style={styles.forgotText}>
                {translate(language, 'forgotPassword')}
              </Text>
            </Pressable>


            {/* GOOGLE LOGIN - TEMPORARILY DISABLED */}
            {/* TODO: Fix Expo OAuth issues with Google - SHA-1 is correct but Expo's expo-auth-session has compatibility issues */}
            {/* <Pressable
              style={({ pressed }) => [
                styles.googleButton,
                pressed && styles.pressed,
                googleLoading && styles.googleDisabled,
              ]}
              onPress={handleGooglePress}
              disabled={!request || googleLoading}
            >

              {googleLoading ? (
                <ActivityIndicator color="#111827" size="small" />
              ) : (
                <>
                  <Ionicons
                    name="logo-google"
                    size={20}
                    color="#111827"
                  />

                  <Text style={styles.googleText}>
                    Continue with Google
                  </Text>
                </>
              )}

            </Pressable> */}


            {/* OR */}
            <View style={styles.dividerRow}>

              <View style={styles.divider} />

              <Text style={styles.orText}>
                {translate(language, 'orText')}
              </Text>

              <View style={styles.divider} />

            </View>


            {/* VOICE ASSISTANCE */}
            <View style={styles.voiceGuidanceWrap}>

              <VoiceGuidanceButton
                labeled
                text={translate(language, 'loginVoiceGuidance')}
                language={language}
                title={translate(language, 'voiceAssistance')}
                subtitle={translate(language, 'loginHearHowToUse')}
              />

            </View>


            {/* LOGIN BUTTON */}
            <Animated.View
              style={{
                width: '100%',
                transform: [
                  {
                    scale: buttonAnim,
                  },
                ],
              }}
            >

              <Pressable
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && styles.loginPressed,
                  loading && styles.loginDisabled,
                ]}
                onPress={handleLogin}
                disabled={loading}
              >

                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.loginText}>
                      {translate(language, 'loginButton')}
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={19}
                      color="#FFFFFF"
                    />
                  </>
                )}

              </Pressable>

            </Animated.View>


            {/* CREATE ACCOUNT */}
            <View style={styles.bottomRow}>

              <Text style={styles.bottomText}>
                {translate(language, 'newToSahayak')}
              </Text>

              <Pressable
                onPress={onRegister}
              >
                <Text style={styles.createAccount}>
                  {translate(language, 'createAccount')}
                </Text>
              </Pressable>

            </View>


            {/* SECURITY MESSAGE */}
            <View style={styles.securityRow}>

              <Ionicons
                name="shield-checkmark-outline"
                size={15}
                color="#49769F"
              />

              <Text style={styles.securityText}>
                {translate(language, 'secureMessage')}
              </Text>

            </View>

          </Animated.View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(25),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(30),
  },

  backButton: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(21),
    backgroundColor: '#F1F5F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },

  content: {
    alignItems: 'center',
  },

  /* LOGO */

  logoOuter: {
    width: scale(82),
    height: scale(82),
    borderRadius: scale(41),
    backgroundColor: '#EAF1F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(18),
  },

  logoInner: {
    width: scale(58),
    height: scale(58),
    borderRadius: scale(29),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',

    elevation: 3,

    shadowColor: '#49769F',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },

  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: scale(29),
  },

  /* TITLE */

  title: {
    fontSize: moderateScale(30),
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },

  subtitle: {
    marginTop: verticalScale(8),
    marginBottom: verticalScale(27),
    fontSize: moderateScale(14),
    lineHeight: moderateScale(21),
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: moderateScale(12),
  },

  /* INPUT */

  inputContainer: {
    width: '100%',
    minHeight: verticalScale(56),
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(16),

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(12),
    marginBottom: verticalScale(14),
  },

  input: {
    flex: 1,
    marginLeft: moderateScale(11),
    fontSize: moderateScale(15),
    color: '#111827',
    minHeight: verticalScale(32),
  },

  /* FORGOT */

  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: verticalScale(2),
    marginBottom: verticalScale(20),
  },

  forgotText: {
    color: '#49769F',
    fontSize: moderateScale(13),
    fontWeight: '700',
  },

  /* GOOGLE */

  googleButton: {
    width: '100%',
    minHeight: verticalScale(54),
    borderRadius: moderateScale(15),

    borderWidth: 1,
    borderColor: '#E2E8F0',

    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(14),
  },

  googleText: {
    marginLeft: moderateScale(10),
    color: '#111827',
    fontSize: moderateScale(15),
    fontWeight: '600',
  },

  /* DIVIDER */

  dividerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(19),
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  orText: {
    marginHorizontal: moderateScale(12),
    color: '#9CA3AF',
    fontSize: moderateScale(12),
    fontWeight: '700',
  },

  /* VOICE ASSISTANCE */

  voiceGuidanceWrap: {
    width: '100%',
    marginVertical: verticalScale(4),
  },

  /* LOGIN */

  loginButton: {
    width: '100%',
    minHeight: verticalScale(56),

    borderRadius: moderateScale(16),

    backgroundColor: '#49769F',

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    paddingVertical: verticalScale(16),
    marginTop: verticalScale(18),

    elevation: 3,

    shadowColor: '#49769F',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },

  loginText: {
    color: '#FFFFFF',
    fontSize: moderateScale(17),
    fontWeight: '700',
    marginRight: moderateScale(8),
  },

  /* BOTTOM */

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(24),
  },

  bottomText: {
    fontSize: 14,
    color: '#6B7280',
  },

  createAccount: {
    marginLeft: 5,
    fontSize: 14,
    color: '#49769F',
    fontWeight: '700',
  },

  /* SECURITY */

  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },

  securityText: {
    marginLeft: 5,
    fontSize: 10,
    color: '#9CA3AF',
  },

  /* PRESSED */

  pressed: {
    opacity: 0.7,
  },

  loginPressed: {
    opacity: 0.8,
  },

  loginDisabled: {
    opacity: 0.6,
  },

  googleDisabled: {
    opacity: 0.5,
  },

});