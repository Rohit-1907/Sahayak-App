import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { register } from '../services/auth.service';
import { translate } from '../utils/translations';
import { useTextToSpeech } from '../utils/useTextToSpeech';
import VoiceGuidanceButton from '../components/VoiceGuidanceButton';
import { useSpeechToText } from '../utils/useSpeechToText';

const COLORS = {
  primary: '#49769F',
  secondary: '#4E8EA2',
  dark: '#2A2A2A',
  white: '#FFFFFF',

  background: '#F7FAFC',
  softBlue: '#EAF3F7',
  softBlue2: '#EEF6F9',

  border: '#E5E7EB',
  muted: '#6B7280',
  placeholder: '#9CA3AF',

  error: '#EF4444',
};

/* =========================================================
   MIC BUTTON
   IMPORTANT:
   This component is OUTSIDE Registerscreen.
   This prevents TextInputs from remounting while typing.
========================================================= */

function MicButton({ field, onVoice }) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 30,
      bounciness: 5,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 8,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
      }}
    >
      <Pressable
        style={styles.micButton}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={() => onVoice(field)}
      >
        <Ionicons
          name="mic-outline"
          size={18}
          color={COLORS.primary}
        />
      </Pressable>
    </Animated.View>
  );
}

/* =========================================================
   INPUT FIELD
   IMPORTANT:
   This component is OUTSIDE Registerscreen.
   This fixes the keyboard disappearing issue.
========================================================= */

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  keyboardType = 'default',
  secureTextEntry = false,
  fieldName,
  maxLength,
  rightIcon,
  onRightIconPress,
  autoCapitalize = 'none',
  onVoice,
  showMic = true,
}) {
  return (
    <View style={styles.fieldWrapper}>

      <View style={styles.labelRow}>

        <Text style={styles.label}>
          {label}
          <Text style={styles.required}> *</Text>
        </Text>

        {showMic && (
          <MicButton
            field={fieldName || label}
            onVoice={onVoice}
          />
        )}

      </View>

      <View style={styles.inputContainer}>

        <View style={styles.inputIcon}>
          <Ionicons
            name={icon}
            size={21}
            color={COLORS.primary}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          blurOnSubmit={false}
        />

        {rightIcon && (
          <Pressable
            style={styles.passwordIcon}
            onPress={onRightIconPress}
          >
            <Ionicons
              name={rightIcon}
              size={21}
              color={COLORS.muted}
            />
          </Pressable>
        )}

      </View>

    </View>
  );
}

/* =========================================================
   STT HELPERS
   Shared by the voice buttons outside the component.
========================================================= */

const normalizeDigits = (text) =>
  String(text)
    .replace(/[०-९]/g, (ch) => '०१२३४५६७८९'.indexOf(ch))
    .replace(/[٠-٩]/g, (ch) => '٠١٢٣٤٥٦٧٨٩'.indexOf(ch))
    .replace(/[^0-9]/g, '');

const parseDateFromSpeech = (text) => {

  const match = text.match(
    /(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})/
  );

  if (match) {

    const day = String(match[1]).padStart(2, '0');
    const month = String(match[2]).padStart(2, '0');
    const year = match[3].length === 2
      ? `20${match[3]}`
      : match[3];

    return `${day}/${month}/${year}`;
  }

  const digits = normalizeDigits(text);

  if (digits.length === 8) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  }

  if (digits.length === 6) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/20${digits.slice(4, 6)}`;
  }

  return null;
};

/* =========================================================
   REGISTER SCREEN
========================================================= */

let registerIntroSpoken = false;

export default function Registerscreen({
  onBack,
  onRegister,
  language = "english",
}) {

  /* =====================================================
     FORM STATES
  ===================================================== */

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');

  const [phone, setPhone] = useState('');
  const [aadhaar, setAadhaar] = useState('');

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');

  const [country] = useState('India');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');
  const [loading, setLoading] = useState(false);

  /* =====================================================
     PASSWORD VISIBILITY
  ===================================================== */

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  /* =====================================================
     MODALS
  ===================================================== */

  const [genderModal, setGenderModal] = useState(false);
  const [addressModal, setAddressModal] = useState(false);
  const [showDatePicker, setShowDatePicker] =
    useState(false);

  /* =====================================================
     ANIMATIONS
  ===================================================== */

  const screenOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const screenTranslate = useRef(
    new Animated.Value(25)
  ).current;

  const welcomeAnim = useRef(
    new Animated.Value(0)
  ).current;

  const voiceAnim = useRef(
    new Animated.Value(0)
  ).current;

  const personalAnim = useRef(
    new Animated.Value(0)
  ).current;

  const contactAnim = useRef(
    new Animated.Value(0)
  ).current;

  const addressAnim = useRef(
    new Animated.Value(0)
  ).current;

  const securityAnim = useRef(
    new Animated.Value(0)
  ).current;

  const buttonAnim = useRef(
    new Animated.Value(0)
  ).current;

  const registerScale = useRef(
    new Animated.Value(1)
  ).current;

  const { speak, stop } = useTextToSpeech(language);
  const mountedRef = useRef(true);
  const [screenReady, setScreenReady] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stop();
    };
  }, [stop]);

  // Plays the "Create Account" Voice Assistance instruction once per
  // app session, after the entrance animation settles (never on
  // re-renders, language changes, or typing).
  useEffect(() => {
    if (screenReady && !registerIntroSpoken) {
      registerIntroSpoken = true;
      if (mountedRef.current) {
        speak(translate(language, 'registerVoiceAssistIntro'));
      }
    }
  }, [screenReady, language, speak]);

  /* =====================================================
     SCREEN ANIMATION
  ===================================================== */

  useEffect(() => {

    Animated.parallel([

      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),

      Animated.timing(screenTranslate, {
        toValue: 0,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.sequence([

        Animated.delay(100),

        Animated.timing(welcomeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),

        Animated.timing(voiceAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),

        Animated.timing(personalAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),

        Animated.timing(contactAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),

        Animated.timing(addressAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),

        Animated.timing(securityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),

        Animated.timing(buttonAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),

      ]),

    ]).start(() => setScreenReady(true));

  }, []);

  /* =====================================================
     ANIMATION HELPER
  ===================================================== */

  const animatedSection = (animation) => ({
    opacity: animation,

    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  });

  /* =====================================================
     VOICE
  ===================================================== */

  const {
    start: startSTT,
    stop: stopSTT,
    reset: resetSTT,
    listening,
    transcript,
  } = useSpeechToText(language);

  const activeVoiceField = useRef(null);

  const voiceLabelToKey = {
    [translate(language, 'fullName')]: 'fullName',
    [translate(language, 'dob')]: 'dob',
    [translate(language, 'gender')]: 'gender',
    [translate(language, 'phoneNumber')]: 'phone',
    [translate(language, 'emailAddress')]: 'email',
    [translate(language, 'aadhaarNumber')]: 'aadhaar',
    [translate(language, 'streetAddress')]: 'street',
    [translate(language, 'city')]: 'city',
    [translate(language, 'state')]: 'state',
    [translate(language, 'pinCode')]: 'pinCode',
    [translate(language, 'password')]: 'password',
    [translate(language, 'confirmPassword')]: 'confirmPassword',
  };

  const applyVoiceToField = (key, text) => {

    switch (key) {

      case 'fullName':
        setFullName(text);
        break;

      case 'phone':
        setPhone(normalizeDigits(text).slice(0, 10));
        break;

      case 'email':
        setEmail(text.replace(/\s+/g, ''));
        break;

      case 'aadhaar':
        setAadhaar(normalizeDigits(text).slice(0, 12));
        break;

      case 'street':
        setStreet(text);
        break;

      case 'city':
        setCity(text);
        break;

      case 'state':
        setState(text);
        break;

      case 'pinCode':
        setPinCode(normalizeDigits(text).slice(0, 6));
        break;

      case 'password':
        setPassword(text);
        break;

      case 'confirmPassword':
        setConfirmPassword(text);
        break;

      case 'gender': {

        const lowered = text.toLowerCase();

        const genderOptions = [
          {
            value: 'Male',
            label: translate(language, 'male')
              .toLowerCase(),
          },
          {
            value: 'Female',
            label: translate(language, 'female')
              .toLowerCase(),
          },
          {
            value: 'Other',
            label: translate(language, 'other')
              .toLowerCase(),
          },
        ];

        const match = genderOptions.find(
          (option) =>
            option.label &&
            lowered.includes(option.label)
        );

        if (match) {
          setGender(match.value);
        }

      }
        break;

      case 'dob': {

        const parsed = parseDateFromSpeech(text);

        if (parsed) {
          setDob(parsed);
        }

      }
        break;

    }

  };

  const handleVoice = (field) => {

    const key = voiceLabelToKey[field];

    if (!key) {

      Alert.alert(
        translate(language, 'voiceInputTitle'),
        translate(language, 'voiceInputMessage').replace(
          '{{field}}',
          field
        )
      );

      return;
    }

    activeVoiceField.current = key;
    resetSTT();
    startSTT();

  };

  useEffect(() => {

    if (!transcript || listening) {
      return;
    }

    const key = activeVoiceField.current;

    if (!key) {
      return;
    }

    applyVoiceToField(key, transcript);

    activeVoiceField.current = null;
    resetSTT();

  }, [listening, transcript]);

  useEffect(() => {
    activeVoiceField.current = null;
    stopSTT();
  }, [stopSTT]);

  /* =====================================================
     DATE
  ===================================================== */

  const formatDate = (date) => {

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (
    event,
    selectedDate
  ) => {

    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setDob(formatDate(selectedDate));
    }
  };

  /* =====================================================
     REGISTER WITH API
  ===================================================== */

  const handleRegister = async () => {

    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanAadhaar = aadhaar.trim();
    const cleanPin = pinCode.trim();
    const cleanEmail = email.trim();

    // Validation
    if (
      !cleanName ||
      !dob ||
      !gender ||
      !cleanPhone ||
      !cleanAadhaar ||
      !street.trim() ||
      !city.trim() ||
      !state.trim() ||
      !cleanPin ||
      !cleanEmail ||
      !password ||
      !confirmPassword
    ) {

      Alert.alert(
        'Incomplete Details',
        'Please fill in all required fields.'
      );

      return;
    }

    if (cleanPhone.length !== 10) {

      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid 10-digit phone number.'
      );

      return;
    }

    if (cleanAadhaar.length !== 12) {

      Alert.alert(
        'Invalid Aadhaar Number',
        'Please enter a valid 12-digit Aadhaar number.'
      );

      return;
    }

    if (cleanPin.length !== 6) {

      Alert.alert(
        'Invalid PIN Code',
        'Please enter a valid 6-digit PIN code.'
      );

      return;
    }

    if (password.length < 8) {

      Alert.alert(
        'Weak Password',
        'Password must be at least 8 characters long.'
      );

      return;
    }

    if (password !== confirmPassword) {

      Alert.alert(
        'Password Mismatch',
        'Password and Confirm Password must be the same.'
      );

      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address.'
      );
      return;
    }

    setLoading(true);

    try {
      // Split full name into first and last name
      const nameParts = cleanName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];

      // Create username from email (before @)
      const username = cleanEmail.split('@')[0].toLowerCase();

      // Prepare registration data
      const registrationData = {
        username: username,
        email: cleanEmail,
        phone_number: cleanPhone,
        password: password,
        password_confirm: confirmPassword,
        first_name: firstName,
        last_name: lastName,
        role: 'customer',
      };

      console.log('[NOTE] Registering customer:', username);

      const response = await register(registrationData);

      console.log('[OK] Registration successful:', response);

      Alert.alert(
        'Registration Successful! ',
        `Welcome to Sahayak, ${firstName}! Your account has been created successfully.`,
        [
          {
            text: translate(language, 'continueText'),
            onPress: () => {
              if (onRegister) {
                onRegister(response.user);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Registration error:', error);

      let errorMessage = translate(language, 'registrationFailedDefault');

      if (error.errors) {
        // Handle field-specific errors
        const errors = error.errors;
        if (errors.username) {
          errorMessage = `Username: ${errors.username[0]}`;
        } else if (errors.email) {
          errorMessage = `Email: ${errors.email[0]}`;
        } else if (errors.phone_number) {
          errorMessage = `Phone: ${errors.phone_number[0]}`;
        } else if (errors.password) {
          errorMessage = `Password: ${errors.password[0]}`;
        } else {
          errorMessage = JSON.stringify(errors);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(translate(language, 'registrationFailed'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     REGISTER BUTTON ANIMATION
  ===================================================== */

  const registerPressIn = () => {

    Animated.spring(registerScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();

  };

  const registerPressOut = () => {

    Animated.spring(registerScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <Pressable
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.headerButtonPressed,
          ]}
          onPress={onBack}
        >

          <Ionicons
            name="arrow-back"
            size={25}
            color={COLORS.white}
          />

        </Pressable>

        <View style={styles.headerCenter}>

          <Text style={styles.headerTitle}>
            {translate(language, 'createAccountTitle')}
          </Text>

          <Text style={styles.headerSubtitle}>
            {translate(language, 'joinSahayak')}
          </Text>

        </View>

      </View>

      <Animated.View
        style={[
          styles.animatedScreen,
          {
            opacity: screenOpacity,
            transform: [
              {
                translateY: screenTranslate,
              },
            ],
          },
        ]}
      >

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            contentContainerStyle={
              styles.scrollContent
            }
          >

            {/* WELCOME */}

            <Animated.View
              style={animatedSection(welcomeAnim)}
            >

              <View style={styles.welcomeCard}>

                <View style={styles.welcomeIcon}>

                  <Ionicons
                    name="person-add-outline"
                    size={25}
                    color={COLORS.white}
                  />

                </View>

                <View
                  style={styles.welcomeTextContainer}
                >

                  <Text style={styles.welcomeTitle}>
                    {translate(language, 'createSahayakAccount')}
                  </Text>

                  <Text style={styles.welcomeSubtitle}>
                    {translate(language, 'enterDetails')}
                  </Text>

                </View>

              </View>

            </Animated.View>

            {/* VOICE ASSISTANCE */}

            <Animated.View
              style={animatedSection(voiceAnim)}
            >

              <View style={styles.voiceGuidanceWrap}>

                <VoiceGuidanceButton
                  labeled
                  text={translate(language, 'registerVoiceGuidance')}
                  language={language}
                  title={translate(language, 'voiceAssistance')}
                  subtitle={translate(language, 'registerHearHowToUse')}
                />

              </View>

            </Animated.View>

            {/* PERSONAL INFORMATION */}

            <Animated.View
              style={animatedSection(personalAnim)}
            >

              <Text style={styles.sectionTitle}>
                {translate(language, 'personalInformation')}
              </Text>

              <InputField
                label={translate(language, 'fullName')}
                placeholder={translate(language, 'fullNamePlaceholder')}
                value={fullName}
                onChangeText={setFullName}
                icon="person-outline"
                fieldName={translate(language, 'fullName')}
                onVoice={handleVoice}

                /*
                 * No automatic transformation of
                 * what the user types.
                 */
                autoCapitalize="none"
              />

              {/* DATE OF BIRTH */}

              <View style={styles.fieldWrapper}>

                <View style={styles.labelRow}>

                  <Text style={styles.label}>
                    {translate(language, 'dob')}
                    <Text style={styles.required}>
                      {' '}*
                    </Text>
                  </Text>

                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.inputContainer,
                    pressed &&
                      styles.inputPressed,
                  ]}
                  onPress={() =>
                    setShowDatePicker(true)
                  }
                >

                  <View style={styles.inputIcon}>

                    <Ionicons
                      name="calendar-outline"
                      size={21}
                      color={COLORS.primary}
                    />

                  </View>

                  <Text
                    style={[
                      styles.selectText,
                      !dob &&
                        styles.placeholderText,
                    ]}
                  >
                    {dob ||
                      translate(language, 'dobPlaceholder')}
                  </Text>

                  <Ionicons
                    name="calendar"
                    size={20}
                    color={COLORS.primary}
                  />

                </Pressable>

              </View>

              {showDatePicker && (

                <DateTimePicker
                  value={
                    dob
                      ? (() => {

                          const parts =
                            dob.split('/');

                          return new Date(
                            Number(parts[2]),
                            Number(parts[1]) - 1,
                            Number(parts[0])
                          );

                        })()
                      : new Date(2005, 0, 1)
                  }
                  mode="date"
                  display={
                    Platform.OS === 'ios'
                      ? 'spinner'
                      : 'calendar'
                  }
                  maximumDate={new Date()}
                  onChange={handleDateChange}
                />

              )}

              {/* GENDER */}

              <View style={styles.fieldWrapper}>

                <View style={styles.labelRow}>

                  <Text style={styles.label}>
                    {translate(language, 'gender')}
                    <Text style={styles.required}>
                      {' '}*
                    </Text>
                  </Text>

                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.inputContainer,
                    pressed &&
                      styles.inputPressed,
                  ]}
                  onPress={() =>
                    setGenderModal(true)
                  }
                >

                  <View style={styles.inputIcon}>

                    <Ionicons
                      name="people-outline"
                      size={21}
                      color={COLORS.primary}
                    />

                  </View>

                  <Text
                    style={[
                      styles.selectText,
                      !gender &&
                        styles.placeholderText,
                    ]}
                  >
                    {gender ||
                      translate(language, 'genderPlaceholder')}
                  </Text>

                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={COLORS.muted}
                  />

                </Pressable>

              </View>

            </Animated.View>

            {/* CONTACT */}

            <Animated.View
              style={animatedSection(contactAnim)}
            >

              <Text style={styles.sectionTitle}>
                {translate(language, 'contactInformation')}
              </Text>

              <InputField
                label={translate(language, 'phoneNumber')}
                placeholder={translate(language, 'phonePlaceholder')}
                value={phone}
                onChangeText={setPhone}
                icon="call-outline"
                keyboardType="phone-pad"
                maxLength={10}
                fieldName={translate(language, 'phoneNumber')}
                autoCapitalize="none"
                onVoice={handleVoice}
              />

              <InputField
                label={translate(language, 'emailAddress')}
                placeholder={translate(language, 'emailPlaceholderReg')}
                value={email}
                onChangeText={setEmail}
                icon="mail-outline"
                keyboardType="email-address"
                fieldName={translate(language, 'emailAddress')}
                autoCapitalize="none"
                onVoice={handleVoice}
              />

            </Animated.View>

            {/* ADDRESS */}

            <Animated.View
              style={animatedSection(addressAnim)}
            >

              <Text style={styles.sectionTitle}>
                {translate(language, 'addressSection')}
              </Text>

              <InputField
                label={translate(language, 'aadhaarNumber')}
                placeholder={translate(language, 'aadhaarPlaceholder')}
                value={aadhaar}
                onChangeText={setAadhaar}
                icon="card-outline"
                keyboardType="number-pad"
                maxLength={12}
                fieldName={translate(language, 'aadhaarNumber')}
                autoCapitalize="none"
                onVoice={handleVoice}
              />

              <InputField
                label={translate(language, 'streetAddress')}
                placeholder={translate(language, 'streetPlaceholder')}
                value={street}
                onChangeText={setStreet}
                icon="home-outline"
                fieldName={translate(language, 'streetAddress')}
                autoCapitalize="none"
                onVoice={handleVoice}
              />

              {/* SELECT ADDRESS */}

              <Pressable
                style={({ pressed }) => [
                  styles.selectAddressButton,
                  pressed &&
                    styles.addressButtonPressed,
                ]}
                onPress={() =>
                  setAddressModal(true)
                }
              >

                <View
                  style={styles.addressIconCircle}
                >

                  <Ionicons
                    name="location-outline"
                    size={21}
                    color={COLORS.primary}
                  />

                </View>

                <View style={{ flex: 1 }}>

                  <Text
                    style={styles.selectAddressTitle}
                  >
                    {translate(language, 'selectAddress')}
                  </Text>

                  <Text
                    style={styles.selectAddressSubtitle}
                  >
                    {translate(language, 'selectAddressDesc')}
                  </Text>

                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.muted}
                />

              </Pressable>

              {/* CITY + STATE */}

              <View style={styles.twoColumn}>

                <View style={styles.column}>

                  <View style={styles.labelRow}>

                    <Text style={styles.smallLabel}>
                      {translate(language, 'city')}
                      <Text style={styles.required}>
                        {' '}*
                      </Text>
                    </Text>

                    <MicButton
                      field={translate(language, 'city')}
                      onVoice={handleVoice}
                    />

                  </View>

                  <View style={styles.smallInput}>

                    <Ionicons
                      name="business-outline"
                      size={19}
                      color={COLORS.primary}
                    />

                    <TextInput
                      style={styles.smallInputText}
                      placeholder={translate(language, 'cityPlaceholder')}
                      placeholderTextColor={
                        COLORS.placeholder
                      }
                      value={city}
                      onChangeText={setCity}
                      autoCapitalize="none"
                      autoCorrect={false}
                      blurOnSubmit={false}
                    />

                  </View>

                </View>

                <View style={styles.column}>

                  <View style={styles.labelRow}>

                    <Text style={styles.smallLabel}>
                      {translate(language, 'state')}
                      <Text style={styles.required}>
                        {' '}*
                      </Text>
                    </Text>

                    <MicButton
                      field={translate(language, 'state')}
                      onVoice={handleVoice}
                    />

                  </View>

                  <View style={styles.smallInput}>

                    <Ionicons
                      name="map-outline"
                      size={19}
                      color={COLORS.primary}
                    />

                    <TextInput
                      style={styles.smallInputText}
                      placeholder={translate(language, 'statePlaceholder')}
                      placeholderTextColor={
                        COLORS.placeholder
                      }
                      value={state}
                      onChangeText={setState}
                      autoCapitalize="none"
                      autoCorrect={false}
                      blurOnSubmit={false}
                    />

                  </View>

                </View>

              </View>

              {/* PIN + COUNTRY */}

              <View style={styles.twoColumn}>

                <View style={styles.column}>

                  <View style={styles.labelRow}>

                    <Text style={styles.smallLabel}>
                      {translate(language, 'pinCode')}
                      <Text style={styles.required}>
                        {' '}*
                      </Text>
                    </Text>

                    <MicButton
                      field={translate(language, 'pinCode')}
                      onVoice={handleVoice}
                    />

                  </View>

                  <View style={styles.smallInput}>

                    <Ionicons
                      name="keypad-outline"
                      size={19}
                      color={COLORS.primary}
                    />

                    <TextInput
                      style={styles.smallInputText}
                      placeholder={translate(language, 'pinPlaceholder')}
                      placeholderTextColor={
                        COLORS.placeholder
                      }
                      value={pinCode}
                      onChangeText={setPinCode}
                      keyboardType="number-pad"
                      maxLength={6}
                      blurOnSubmit={false}
                    />

                  </View>

                </View>

                <View style={styles.column}>

                    <Text style={styles.smallLabel}>
                      {translate(language, 'country')}
                      <Text style={styles.required}>
                        {' '}*
                      </Text>
                    </Text>

                  <View style={styles.smallInput}>

                    <Ionicons
                      name="globe-outline"
                      size={20}
                      color={COLORS.primary}
                    />

                    <Text style={styles.countryText}>
                      {country}
                    </Text>

                  </View>

                </View>

              </View>

            </Animated.View>

            {/* SECURITY */}

            <Animated.View
              style={animatedSection(securityAnim)}
            >

              <Text style={styles.sectionTitle}>
                {translate(language, 'accountSecurity')}
              </Text>

              <InputField
                label={translate(language, 'password')}
                placeholder={translate(language, 'passwordCreatePlaceholder')}
                value={password}
                onChangeText={setPassword}
                icon="lock-closed-outline"
                secureTextEntry={!showPassword}
                fieldName={translate(language, 'password')}
                autoCapitalize="none"
                rightIcon={
                  showPassword
                    ? 'eye-outline'
                    : 'eye-off-outline'
                }
                onRightIconPress={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                onVoice={handleVoice}
                showMic={false}
              />

              <InputField
                label={translate(language, 'confirmPassword')}
                placeholder={translate(language, 'confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChangeText={
                  setConfirmPassword
                }
                icon="shield-checkmark-outline"
                secureTextEntry={
                  !showConfirmPassword
                }
                fieldName={translate(language, 'confirmPassword')}
                autoCapitalize="none"
                rightIcon={
                  showConfirmPassword
                    ? 'eye-outline'
                    : 'eye-off-outline'
                }
                onRightIconPress={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                onVoice={handleVoice}
                showMic={false}
              />

            </Animated.View>

            {/* REGISTER BUTTON */}

            <Animated.View
              style={animatedSection(buttonAnim)}
            >

              <Animated.View
                style={{
                  transform: [
                    {
                      scale: registerScale,
                    },
                  ],
                }}
              >

                <Pressable
                  style={({ pressed }) => [
                    styles.registerButton,
                    pressed &&
                      styles.registerButtonPressed,
                    loading && styles.registerButtonDisabled,
                  ]}
                  onPressIn={registerPressIn}
                  onPressOut={registerPressOut}
                  onPress={handleRegister}
                  disabled={loading}
                >

                  {loading ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <>
                      <Text
                        style={styles.registerButtonText}
                      >
                        {translate(language, 'createAccountButton')}
                      </Text>

                      <View style={styles.buttonArrow}>

                        <Ionicons
                          name="arrow-forward"
                          size={20}
                          color={COLORS.white}
                        />

                      </View>
                    </>
                  )}

                </Pressable>

              </Animated.View>

              {/* LOGIN */}

              <View style={styles.loginRow}>

                <Text style={styles.loginText}>
                  {translate(language, 'alreadyHaveAccount')}
                </Text>

                <Pressable onPress={onBack}>

                  <Text style={styles.loginLink}>
                    {translate(language, 'loginLink')}
                  </Text>

                </Pressable>

              </View>

            </Animated.View>

          </ScrollView>

        </KeyboardAvoidingView>

      </Animated.View>

      {/* =====================================================
          GENDER MODAL
      ===================================================== */}

      <Modal
        visible={genderModal}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setGenderModal(false)
        }
      >

        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setGenderModal(false)
          }
        >

          <View style={styles.modalBox}>

            <Text style={styles.modalTitle}>
              {translate(language, 'selectGenderTitle')}
            </Text>

            {['Male', 'Female', 'Other'].map(
              (item) => (

                <Pressable
                  key={item}
                  style={styles.modalOption}
                  onPress={() => {

                    setGender(item);
                    setGenderModal(false);

                  }}
                >

                  <View style={styles.modalIcon}>

                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={COLORS.primary}
                    />

                  </View>

                  <Text
                    style={styles.modalOptionText}
                  >
                    {item === 'Male' ? translate(language, 'male') : item === 'Female' ? translate(language, 'female') : translate(language, 'other')}
                  </Text>

                </Pressable>

              )
            )}

          </View>

        </Pressable>

      </Modal>

      {/* =====================================================
          ADDRESS MODAL
      ===================================================== */}

      <Modal
        visible={addressModal}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setAddressModal(false)
        }
      >

        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setAddressModal(false)
          }
        >

          <View style={styles.modalBox}>

            <Text style={styles.modalTitle}>
              {translate(language, 'selectAddressTitle')}
            </Text>

            <Text style={styles.modalSubtitle}>
              {translate(language, 'chooseLocation')}
            </Text>

            {/* CURRENT LOCATION */}

            <Pressable
              style={styles.addressOption}
              onPress={() => {

                setCity('Pune');
                setState('Maharashtra');
                setAddressModal(false);

              }}
            >

              <View style={styles.modalIcon}>

                <Ionicons
                  name="location"
                  size={20}
                  color={COLORS.primary}
                />

              </View>

              <View style={{ flex: 1 }}>

                <Text
                  style={styles.modalOptionText}
                >
                  {translate(language, 'puneMaharashtra')}
                </Text>

                  <Text style={styles.addressHint}>
                    {translate(language, 'useThisLocation')}
                  </Text>

              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLORS.muted}
              />

            </Pressable>

            {/* ENTER MANUALLY */}

            <Pressable
              style={styles.addressOption}
              onPress={() =>
                setAddressModal(false)
              }
            >

              <View style={styles.modalIcon}>

                <Ionicons
                  name="create-outline"
                  size={20}
                  color={COLORS.primary}
                />

              </View>

              <View style={{ flex: 1 }}>

                  <Text
                    style={styles.modalOptionText}
                  >
                    {translate(language, 'enterManually')}
                  </Text>

                  <Text style={styles.addressHint}>
                    {translate(language, 'fillCityState')}
                  </Text>

              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLORS.muted}
              />

            </Pressable>

          </View>

        </Pressable>

      </Modal>

    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  animatedScreen: {
    flex: 1,
  },

  header: {
    height: 102,
    paddingTop:30,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },

  headerButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor:
      'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerButtonPressed: {
    backgroundColor:
      'rgba(255,255,255,0.28)',
    transform: [{ scale: 0.94 }],
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: '700',
  },

  headerSubtitle: {
    color: '#DCEAF1',
    fontSize: 12,
    marginTop: 2,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 50,
  },

  welcomeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },

  welcomeIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  welcomeTextContainer: {
    flex: 1,
    marginLeft: 14,
  },

  welcomeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.dark,
  },

  welcomeSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.muted,
    marginTop: 4,
  },

  voiceGuidanceWrap: {
    marginTop: 16,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: 28,
    marginBottom: 17,
  },

  fieldWrapper: {
    marginBottom: 20,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  label: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.dark,
  },

  required: {
    color: COLORS.error,
  },

  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.softBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCEAF0',
  },

  inputContainer: {
    minHeight: 57,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  inputPressed: {
    borderColor: COLORS.secondary,
    backgroundColor: '#FAFDFF',
  },

  inputIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: COLORS.softBlue2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.dark,
    minHeight: 55,
  },

  passwordIcon: {
    padding: 6,
  },

  selectText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.dark,
  },

  placeholderText: {
    color: COLORS.placeholder,
  },

  selectAddressButton: {
    backgroundColor: COLORS.softBlue,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DCEAF0',
  },

  addressButtonPressed: {
    opacity: 0.8,
  },

  addressIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  selectAddressTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.dark,
  },

  selectAddressSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 3,
  },

  twoColumn: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },

  column: {
    flex: 1,
  },

  smallLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.dark,
  },

  smallInput: {
    minHeight: 57,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  smallInputText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 14,
    color: COLORS.dark,
    minHeight: 55,
  },

  countryText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.dark,
  },

  registerButton: {
    height: 60,
    borderRadius: 17,
    backgroundColor: COLORS.dark,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },

  registerButtonPressed: {
    opacity: 0.85,
  },

  registerButtonDisabled: {
    opacity: 0.6,
  },

  registerButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },

  buttonArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },

  loginText: {
    color: COLORS.muted,
    fontSize: 14,
  },

  loginLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(42,42,42,0.45)',
    justifyContent: 'flex-end',
  },

  modalBox: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 22,
    paddingBottom: 35,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 8,
  },

  modalSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 15,
  },

  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  addressOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  modalIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.softBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalOptionText: {
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.dark,
    fontWeight: '600',
  },

  addressHint: {
    marginLeft: 12,
    marginTop: 3,
    fontSize: 12,
    color: COLORS.muted,
  },

});