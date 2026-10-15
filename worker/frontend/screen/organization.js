import React, { useState, useRef } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Keyboard,
  Image,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

export default function OrganizationScreen({
  onBack,
  onLogin,
  onContinue,
}) {
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotMobile, setForgotMobile] = useState('');

  const scrollRef = useRef(null);

  /* ============================================================
     KEYBOARD SCROLL
  ============================================================ */

  const handleInputFocus = (yPosition) => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: yPosition,
        animated: true,
      });
    }, 250);
  };

  /* ============================================================
     LOGIN
  ============================================================ */

  const handleLogin = () => {
    Keyboard.dismiss();

    if (onLogin) {
      onLogin();
    }
  };

  /* ============================================================
     CONTINUE
  ============================================================ */

  const handleContinue = () => {
    const trimmedOrganizationName = organizationName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (
      !trimmedOrganizationName ||
      !trimmedEmail ||
      !trimmedPassword
    ) {
      Alert.alert(
        'Information Required',
        'Please enter information in all fields before continuing.'
      );
      return;
    }

    Keyboard.dismiss();

    if (onContinue) {
      onContinue();
    }
  };

  /* ============================================================
     FORGOT PASSWORD
  ============================================================ */

  const handleForgotPassword = () => {
    Keyboard.dismiss();
    setForgotMobile('');
    setShowForgotPassword(true);
  };

  /* ============================================================
     SEND OTP
  ============================================================ */

  const handleSendOTP = () => {
    const mobile = forgotMobile.trim();

    if (!mobile) {
      Alert.alert(
        'Mobile Number Required',
        'Please enter your registered mobile number.'
      );
      return;
    }

    if (mobile.length !== 10) {
      Alert.alert(
        'Invalid Mobile Number',
        'Please enter a valid 10 digit mobile number.'
      );
      return;
    }

    Keyboard.dismiss();

    Alert.alert(
      'OTP Sent',
      'OTP has been sent to your registered mobile number.'
    );
  };

  /* ============================================================
     FORGOT PASSWORD SCREEN
  ============================================================ */

  if (showForgotPassword) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.forgotScrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets={true}
          >

            {/* BACK BUTTON */}

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                Keyboard.dismiss();
                setShowForgotPassword(false);
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={30}
                color="#49769F"
              />
            </TouchableOpacity>


            {/* HEADER */}

            <View style={styles.forgotHeader}>

              <View style={styles.forgotLogoCircle}>
                <Ionicons
                  name="lock-closed-outline"
                  size={55}
                  color="#FFFFFF"
                />
              </View>

              <Text style={styles.forgotTitle}>
                Forgot Password?
              </Text>

              <Text style={styles.forgotSubtitle}>
                Don't worry! Enter your registered mobile
                {'\n'}
                number and we'll send you an OTP to reset
                {'\n'}
                your password.
              </Text>

            </View>


            {/* MOBILE FORM */}

            <View style={styles.forgotForm}>

              <Text style={styles.mobileLabel}>
                Mobile Number
              </Text>

              <View style={styles.forgotInputWrapper}>

                <Ionicons
                  name="call-outline"
                  size={25}
                  color="#6B7280"
                  style={styles.forgotInputIcon}
                />

                <TextInput
                  style={styles.forgotInput}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#9CA3AF"
                  value={forgotMobile}
                  onChangeText={(text) =>
                    setForgotMobile(
                      text.replace(/\D/g, '').slice(0, 10)
                    )
                  }
                  keyboardType="phone-pad"
                  maxLength={10}
                  onFocus={() => handleInputFocus(450)}
                />

              </View>


              {/* SEND OTP */}

              <Pressable
                onPress={handleSendOTP}
                style={({ pressed }) => [
                  styles.sendOtpButton,
                  pressed && styles.buttonPressed,
                ]}
              >

                <Text style={styles.sendOtpText}>
                  Send OTP
                </Text>

                <View style={styles.sendOtpCircle}>
                  <Ionicons
                    name="arrow-forward"
                    size={24}
                    color="#49769F"
                  />
                </View>

              </Pressable>


              {/* BACK TO LOGIN */}

              <TouchableOpacity
                style={styles.backToLogin}
                onPress={() => {
                  Keyboard.dismiss();
                  setShowForgotPassword(false);
                }}
                activeOpacity={0.7}
              >

                <Ionicons
                  name="arrow-back"
                  size={25}
                  color="#49769F"
                />

                <Text style={styles.backToLoginText}>
                  Back to Login
                </Text>

              </TouchableOpacity>

            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }


  /* ============================================================
     ORGANIZATION LOGIN SCREEN
  ============================================================ */

  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={true}
        >

          {/* =====================================================
              BACK BUTTON
          ===================================================== */}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Keyboard.dismiss();
              onBack?.();
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={26}
              color="#111827"
            />
          </TouchableOpacity>


          {/* =====================================================
              HEADER
          ===================================================== */}

          <View style={styles.header}>

            <View style={[styles.logoCircle, { overflow: 'hidden' }]}>
              <Image
                source={require('../assets/logo.png')}
                style={{ width: '100%', height: '100%', borderRadius: 53 }}
                resizeMode="cover"
              />
            </View>

            <Text style={styles.title}>
              Organization Login
            </Text>

            <Text style={styles.subtitle}>
              Login to manage your organization
              {'\n'}
              and team services.
            </Text>

          </View>


          {/* =====================================================
              LOGIN CARD
          ===================================================== */}

          <View style={styles.card}>

            {/* ORGANIZATION NAME */}

            <View style={styles.inputWrapper}>

              <Ionicons
                name="business-outline"
                size={21}
                color="#49769F"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                placeholder="Organization Name"
                placeholderTextColor="#9CA3AF"
                value={organizationName}
                onChangeText={setOrganizationName}
                autoCapitalize="words"
                returnKeyType="next"
                onFocus={() => handleInputFocus(250)}
              />

            </View>


            {/* EMAIL */}

            <View style={styles.inputWrapper}>

              <Ionicons
                name="mail-outline"
                size={21}
                color="#49769F"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                placeholder="Organization Email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onFocus={() => handleInputFocus(330)}
              />

            </View>


            {/* PASSWORD */}

            <View style={styles.inputWrapper}>

              <Ionicons
                name="lock-closed-outline"
                size={21}
                color="#49769F"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onFocus={() => handleInputFocus(410)}
              />

              <TouchableOpacity
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
                  size={21}
                  color="#6B7280"
                />

              </TouchableOpacity>

            </View>


            {/* FORGOT PASSWORD */}

            <TouchableOpacity
              style={styles.forgotButton}
              onPress={handleForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>


            {/* LOGIN */}

            <Pressable
              onPress={handleLogin}
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.buttonPressed,
              ]}
            >

              <Text style={styles.loginButtonText}>
                Login
              </Text>

              <Ionicons
                name="arrow-forward"
                size={20}
                color="#FFFFFF"
              />

            </Pressable>


            {/* CONTINUE */}

            <Pressable
              onPress={handleContinue}
              style={({ pressed }) => [
                styles.continueButton,
                pressed && styles.continueButtonPressed,
              ]}
            >

              <Text style={styles.continueButtonText}>
                Continue
              </Text>

              <Ionicons
                name="arrow-forward"
                size={20}
                color="#49769F"
              />

            </Pressable>

          </View>


          {/* FOOTER */}

          <Text style={styles.footer}>
            Trusted home services at your doorstep
          </Text>

        </ScrollView>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({

  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },


  /* ==========================================================
     ORGANIZATION SCROLL
  ========================================================== */

  scrollContent: {
    flexGrow: 1,

    paddingHorizontal: 22,

    paddingTop: 12,

    /*
      Extra bottom space is intentional.
      Keyboard open zalyavar inputs scroll karta yetil.
    */
    paddingBottom: 220,
  },


  /* ==========================================================
     FORGOT PASSWORD SCROLL
  ========================================================== */

  forgotScrollContent: {
    flexGrow: 1,

    paddingHorizontal: 22,

    paddingTop: 12,

    paddingBottom: 220,
  },


  /* ==========================================================
     BACK BUTTON
  ========================================================== */

  backButton: {
    width: 46,
    height: 46,

    borderRadius: 23,

    backgroundColor: '#F1F5F8',

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 5,

    elevation: 2,

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,

    shadowRadius: 4,
  },


  /* ==========================================================
     ORGANIZATION HEADER
  ========================================================== */

  header: {
    alignItems: 'center',

    marginTop: 35,

    marginBottom: 30,
  },


  logoCircle: {
    width: 105,
    height: 105,

    borderRadius: 53,

    backgroundColor: '#EAF1F6',

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 22,
  },


  title: {
    fontSize: 27,

    fontWeight: '700',

    color: '#111827',

    textAlign: 'center',
  },


  subtitle: {
    marginTop: 10,

    fontSize: 14,

    lineHeight: 21,

    color: '#6B7280',

    textAlign: 'center',

    paddingHorizontal: 20,
  },


  /* ==========================================================
     CARD
  ========================================================== */

  card: {
    width: '100%',

    backgroundColor: '#FFFFFF',

    borderRadius: 18,

    padding: 20,

    borderWidth: 1,

    borderColor: '#E5E7EB',

    elevation: 3,

    shadowColor: '#49769F',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.08,

    shadowRadius: 8,
  },


  /* ==========================================================
     INPUT
  ========================================================== */

  inputWrapper: {
    height: 56,

    borderWidth: 1.3,

    borderColor: '#D7DEE5',

    borderRadius: 14,

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 14,

    marginBottom: 13,

    backgroundColor: '#FFFFFF',
  },


  inputIcon: {
    marginRight: 10,
  },


  input: {
    flex: 1,

    height: '100%',

    fontSize: 15,

    color: '#111827',
  },


  eyeButton: {
    padding: 5,
  },


  /* ==========================================================
     FORGOT BUTTON
  ========================================================== */

  forgotButton: {
    alignSelf: 'flex-end',

    marginTop: 1,

    marginBottom: 20,
  },


  forgotText: {
    color: '#49769F',

    fontSize: 13,

    fontWeight: '600',
  },


  /* ==========================================================
     LOGIN BUTTON
  ========================================================== */

  loginButton: {
    height: 55,

    borderRadius: 14,

    backgroundColor: '#49769F',

    flexDirection: 'row',

    justifyContent: 'center',

    alignItems: 'center',

    elevation: 3,

    shadowColor: '#49769F',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.18,

    shadowRadius: 6,

    marginBottom: 12,
  },


  loginButtonText: {
    color: '#FFFFFF',

    fontSize: 16,

    fontWeight: '700',

    marginRight: 9,
  },


  /* ==========================================================
     CONTINUE BUTTON
  ========================================================== */

  continueButton: {
    height: 55,

    borderRadius: 14,

    backgroundColor: '#FFFFFF',

    borderWidth: 1.5,

    borderColor: '#49769F',

    flexDirection: 'row',

    justifyContent: 'center',

    alignItems: 'center',

    elevation: 1,

    shadowColor: '#49769F',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,

    shadowRadius: 4,
  },


  continueButtonText: {
    color: '#49769F',

    fontSize: 16,

    fontWeight: '700',

    marginRight: 9,
  },


  buttonPressed: {
    opacity: 0.78,
  },


  continueButtonPressed: {
    backgroundColor: '#F1F5F8',
  },


  /* ==========================================================
     FOOTER
  ========================================================== */

  footer: {
    textAlign: 'center',

    fontSize: 11,

    color: '#9CA3AF',

    marginTop: 30,

    paddingTop: 15,
  },


  /* ==========================================================
     FORGOT PASSWORD
  ========================================================== */

  forgotHeader: {
    alignItems: 'center',

    marginTop: 78,

    marginBottom: 70,
  },


  forgotLogoCircle: {
    width: 108,

    height: 108,

    borderRadius: 54,

    backgroundColor: '#49769F',

    justifyContent: 'center',

    alignItems: 'center',

    marginBottom: 65,
  },


  forgotTitle: {
    fontSize: 32,

    fontWeight: '700',

    color: '#49769F',

    textAlign: 'center',
  },


  forgotSubtitle: {
    marginTop: 28,

    fontSize: 16,

    lineHeight: 25,

    color: '#6B7280',

    textAlign: 'center',

    paddingHorizontal: 10,
  },


  /* ==========================================================
     FORGOT FORM
  ========================================================== */

  forgotForm: {
    width: '100%',

    paddingHorizontal: 10,
  },


  mobileLabel: {
    fontSize: 16,

    fontWeight: '700',

    color: '#49769F',

    marginBottom: 20,
  },


  forgotInputWrapper: {
    height: 58,

    borderWidth: 1.5,

    borderColor: '#D7DEE5',

    borderRadius: 15,

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 16,

    backgroundColor: '#FDFEFF',
  },


  forgotInputIcon: {
    marginRight: 16,
  },


  forgotInput: {
    flex: 1,

    height: '100%',

    fontSize: 16,

    color: '#111827',
  },


  /* ==========================================================
     SEND OTP
  ========================================================== */

  sendOtpButton: {
    height: 58,

    borderRadius: 15,

    backgroundColor: '#9DB8CF',

    marginTop: 28,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    paddingLeft: 35,
  },


  sendOtpText: {
    color: '#FFFFFF',

    fontSize: 17,

    fontWeight: '700',

    marginRight: 12,
  },


  sendOtpCircle: {
    width: 48,

    height: 48,

    borderRadius: 24,

    backgroundColor: '#E8EFF5',

    justifyContent: 'center',

    alignItems: 'center',
  },


  /* ==========================================================
     BACK TO LOGIN
  ========================================================== */

  backToLogin: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    marginTop: 48,

    paddingBottom: 20,
  },


  backToLoginText: {
    color: '#49769F',

    fontSize: 16,

    fontWeight: '700',

    marginLeft: 10,
  },

});
