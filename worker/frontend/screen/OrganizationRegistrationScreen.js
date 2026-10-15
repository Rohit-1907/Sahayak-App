import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { scale, verticalScale, moderateScale, wp } from '../utils/responsive';
import { translate } from '../utils/translations';
import { useTextToSpeech } from '../utils/useTextToSpeech';
import { useSpeechToText } from '../utils/useSpeechToText';
import VoiceGuidanceButton from '../components/VoiceGuidanceButton';

const PURPLE = "#49769F";

// ============================================================
// INPUT BOX
// ============================================================

const InputBox = ({
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  secureTextEntry = false,
  editable = true,
  autoCapitalize = "sentences",
  multiline = false,
}) => {
  return (
    <View style={styles.inputBox}>
      <MaterialCommunityIcons
        name={icon}
        size={moderateScale(22)}
        color={PURPLE}
      />

      <TextInput
        style={[styles.textInput, multiline && styles.textInputMultiline]}
        placeholder={placeholder}
        placeholderTextColor="#9AA4AF"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={editable}
        autoCorrect={false}
        autoCapitalize={autoCapitalize}
        blurOnSubmit={!multiline}
        returnKeyType={multiline ? "default" : "next"}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );
};

// ============================================================
// SELECT BOX
// ============================================================

const SelectBox = ({
  icon,
  placeholder,
  value,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.selectBox}
      onPress={onPress}
    >
      <MaterialCommunityIcons
        name={icon}
        size={moderateScale(22)}
        color={PURPLE}
      />

      <Text
        style={[
          styles.selectText,
          !value && styles.placeholderText,
        ]}
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>

      <MaterialCommunityIcons
        name="chevron-down"
        size={27}
        color={PURPLE}
      />
    </TouchableOpacity>
  );
};

// ============================================================
// ORGANIZATION REGISTRATION SCREEN
// ============================================================

let orgRegIntroSpoken = false;

export default function OrganizationRegistrationScreen({
  onBack,
  onNext,
  language = "English",
}) {
  // Organization Details
  const [organizationName, setOrganizationName] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [numberOfWorkers, setNumberOfWorkers] = useState("");
  const [organizationDescription, setOrganizationDescription] = useState("");
  
  // Organization Address
  const [organizationAddress, setOrganizationAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [country, setCountry] = useState("India");

  // Leader/Admin Personal Details
  const [leaderName, setLeaderName] = useState("");
  const [leaderPhone, setLeaderPhone] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  
  const [dob, setDob] = useState("");
  const [dobDate, setDobDate] = useState(
    new Date(1985, 0, 1)
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [gender, setGender] = useState("");
  const [aadhaar, setAadhaar] = useState("");

  // Account Security
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // VOICE GUIDANCE (TTS)
  const { speak: speakOrgReg, stop: stopOrgReg } = useTextToSpeech(language);

  React.useEffect(() => {
    if (orgRegIntroSpoken) {
      return;
    }
    orgRegIntroSpoken = true;
    const spokenIntro = translate('orgRegGreeting', language);
    speakOrgReg(spokenIntro);
    return () => {
      stopOrgReg();
    };
  }, [language, speakOrgReg, stopOrgReg]);

  // ============================================================
  // VOICE INPUT (STT) — live dictation for non-sensitive fields only.
  // Sensitive fields (PIN, phone, email, Aadhaar, passwords) keep the
  // voiceInputUnavailable alert below and never receive STT results.
  // ============================================================

  const { start, stop, listening, transcript } = useSpeechToText(language);
  const [activeVoiceField, setActiveVoiceField] = useState(null);

  // Stop any in-flight recognition when this screen unmounts.
  React.useEffect(() => () => {
    stop();
  }, [stop]);

  const ORG_TYPE_OPTIONS = [
    { value: 'Construction', key: 'construction' },
    { value: 'Electrical Services', key: 'electricalServices' },
    { value: 'Plumbing Services', key: 'plumbingServices' },
    { value: 'Cleaning Services', key: 'cleaningServices' },
    { value: 'Transportation', key: 'transportation' },
    { value: 'Carpentry', key: 'carpentry' },
    { value: 'Painting Services', key: 'paintingServices' },
    { value: 'Other', key: 'other' },
  ];

  const matchOrganizationType = (text) => {
    const norm = text.trim().toLowerCase();
    if (!norm) {
      return;
    }
    const found = ORG_TYPE_OPTIONS.find(
      (o) =>
        o.value.toLowerCase() === norm ||
        translate(o.key, language).toLowerCase() === norm
    );
    if (found) {
      setOrganizationType(found.value);
    }
  };

  const startVoiceFor = (fieldKey) => {
    stopOrgReg();
    setActiveVoiceField(fieldKey);
    start();
  };

  // Route each recognized transcript only to its active field's setter.
  React.useEffect(() => {
    if (!transcript || !activeVoiceField) {
      return;
    }
    const text = transcript.trim();
    if (!text) {
      return;
    }
    switch (activeVoiceField) {
      case 'organizationName':
        setOrganizationName(text);
        break;
      case 'typeOfOrganization':
        matchOrganizationType(text);
        break;
      case 'numberOfWorkers':
        setNumberOfWorkers(text.replace(/\D/g, ''));
        break;
      case 'descriptionOptional':
        setOrganizationDescription(text);
        break;
      case 'address':
        setOrganizationAddress(text);
        break;
      case 'city':
        setCity(text);
        break;
      case 'state':
        setState(text);
        break;
      case 'country':
        setCountry(text);
        break;
      case 'fullName':
        setLeaderName(text);
        break;
      default:
        break;
    }
  }, [transcript, activeVoiceField, language]);

  const VoiceButton = ({ field, onVoice }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.micButton}
        onPress={() => onVoice()}
      >
        <MaterialCommunityIcons
          name="microphone"
          size={22}
          color={PURPLE}
        />
      </TouchableOpacity>
    );
  };

  // ============================================================
  // ORGANIZATION TYPE
  // ============================================================

  const selectOrganizationType = () => {
    Alert.alert(
      translate('selectOrgType', language),
      translate('orgTypePrompt', language),
      [
        {
          text: translate('construction', language),
          onPress: () => setOrganizationType("Construction"),
        },
        {
          text: translate('electricalServices', language),
          onPress: () => setOrganizationType("Electrical Services"),
        },
        {
          text: translate('plumbingServices', language),
          onPress: () => setOrganizationType("Plumbing Services"),
        },
        {
          text: translate('cleaningServices', language),
          onPress: () => setOrganizationType("Cleaning Services"),
        },
        {
          text: translate('transportation', language),
          onPress: () => setOrganizationType("Transportation"),
        },
        {
          text: translate('carpentry', language),
          onPress: () => setOrganizationType("Carpentry"),
        },
        {
          text: translate('paintingServices', language),
          onPress: () => setOrganizationType("Painting Services"),
        },
        {
          text: translate('other', language),
          onPress: () => setOrganizationType("Other"),
        },
        {
          text: translate('cancel', language),
          style: "cancel",
        },
      ]
    );
  };

  // ============================================================
  // DOB
  // ============================================================

  const openDOB = () => {
    setShowDatePicker(true);
  };

  const handleDOB = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (!selectedDate) {
      return;
    }

    setDobDate(selectedDate);

    const day = String(selectedDate.getDate()).padStart(2, "0");
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const year = selectedDate.getFullYear();

    setDob(`${day}/${month}/${year}`);
  };

  // ============================================================
  // CITY
  // ============================================================

  const selectCity = () => {
    Alert.alert(
      translate('selectCity', language),
      translate('cityPrompt', language),
      [
        {
          text: translate('pune', language),
          onPress: () => setCity("Pune"),
        },
        {
          text: translate('mumbai', language),
          onPress: () => setCity("Mumbai"),
        },
        {
          text: translate('nashik', language),
          onPress: () => setCity("Nashik"),
        },
        {
          text: translate('nagpur', language),
          onPress: () => setCity("Nagpur"),
        },
        {
          text: translate('bangalore', language),
          onPress: () => setCity("Bangalore"),
        },
        {
          text: translate('hyderabad', language),
          onPress: () => setCity("Hyderabad"),
        },
        {
          text: translate('cancel', language),
          style: "cancel",
        },
      ]
    );
  };

  // ============================================================
  // STATE
  // ============================================================

  const selectState = () => {
    Alert.alert(
      translate('selectState', language),
      translate('statePrompt', language),
      [
        {
          text: translate('maharashtra', language),
          onPress: () => setState("Maharashtra"),
        },
        {
          text: translate('gujarat', language),
          onPress: () => setState("Gujarat"),
        },
        {
          text: translate('karnataka', language),
          onPress: () => setState("Karnataka"),
        },
        {
          text: translate('goa', language),
          onPress: () => setState("Goa"),
        },
        {
          text: translate('telangana', language),
          onPress: () => setState("Telangana"),
        },
        {
          text: translate('cancel', language),
          style: "cancel",
        },
      ]
    );
  };

  // ============================================================
  // COUNTRY
  // ============================================================

  const selectCountry = () => {
    Alert.alert(
      translate('selectCountry', language),
      translate('countryPrompt', language),
      [
        {
          text: translate('india', language),
          onPress: () => setCountry("India"),
        },
        {
          text: translate('other', language),
          onPress: () => setCountry("Other"),
        },
        {
          text: translate('cancel', language),
          style: "cancel",
        },
      ]
    );
  };

  // ============================================================
  // COMPLETE REGISTRATION
  // ============================================================

  const completeRegistration = () => {
    // Organization validation
    if (!organizationName.trim()) {
      Alert.alert(translate('required', language), translate('pleaseEnterOrgName', language));
      return;
    }

    if (!organizationType.trim()) {
      Alert.alert(translate('required', language), translate('pleaseSelectOrgType', language));
      return;
    }

    if (!numberOfWorkers.trim() || isNaN(numberOfWorkers)) {
      Alert.alert(translate('required', language), translate('pleaseEnterWorkerCount', language));
      return;
    }

    if (!organizationAddress.trim()) {
      Alert.alert(translate('required', language), translate('pleaseEnterAddress', language));
      return;
    }

    if (!city.trim()) {
      Alert.alert(translate('required', language), translate('pleaseEnterCity', language));
      return;
    }

    if (!state.trim()) {
      Alert.alert(translate('required', language), translate('pleaseEnterState', language));
      return;
    }

    if (pinCode.length !== 6) {
      Alert.alert(translate('invalidPIN', language), translate('pleaseEnterPIN', language));
      return;
    }

    // Leader validation
    if (!leaderName.trim()) {
      Alert.alert(translate('required', language), translate('pleaseEnterLeaderName', language));
      return;
    }

    if (leaderPhone.replace(/\D/g, "").length !== 10) {
      Alert.alert(
        translate('invalidPhone', language),
        translate('pleaseEnterPhone', language)
      );
      return;
    }

    if (!leaderEmail.trim() || !leaderEmail.includes("@")) {
      Alert.alert(translate('invalidEmail', language), translate('pleaseEnterEmail', language));
      return;
    }

    if (!dob.trim()) {
      Alert.alert(translate('required', language), translate('pleaseSelectDOB', language));
      return;
    }

    if (!gender) {
      Alert.alert(translate('required', language), translate('pleaseSelectGender', language));
      return;
    }

    if (aadhaar.replace(/\D/g, "").length !== 12) {
      Alert.alert(
        translate('invalidAadhaar', language),
        translate('pleaseEnterAadhaar', language)
      );
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        translate('invalidPassword', language),
        translate('passwordMinChars', language)
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(translate('passwordError', language), translate('passwordsDoNotMatch', language));
      return;
    }

    if (onNext) {
      onNext({
        organizationName,
        organizationType,
        numberOfWorkers: parseInt(numberOfWorkers),
        organizationDescription,
        organizationAddress,
        city,
        state,
        pinCode,
        country,
        leaderName,
        leaderPhone,
        leaderEmail,
        dob,
        gender,
        aadhaar,
        password,
      });
    }
  };

  // ============================================================
  // SCREEN
  // ============================================================

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color="#222222"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {translate('organizationRegistration', language)}
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* LONG SCROLL FORM */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        nestedScrollEnabled
        contentContainerStyle={styles.content}
      >
        <Text style={styles.pageTitle}>
          {translate('registerYourOrganization', language)}
        </Text>

        <Text style={styles.pageSubtitle}>
          {translate('organizationRegistrationSubtitle', language)}
        </Text>

        {/* VOICE GUIDANCE (TTS) */}
        <View style={styles.orgRegVoiceGuidanceWrap}>
          <VoiceGuidanceButton
            labeled
            text={translate('orgRegVoiceGuidance', language)}
            language={language}
            title={translate('voiceAssistance', language)}
            subtitle={translate('orgRegHearHowToUse', language)}
          />
        </View>

        {/* INFO BOX */}

        <View style={styles.infoBox}>
          <View style={styles.infoIcon}>
            <MaterialCommunityIcons
              name="information-outline"
              size={21}
              color={PURPLE}
            />
          </View>

          <Text style={styles.infoText}>
            {translate('orgRegistrationInfo', language)}
          </Text>
        </View>

        {/* ORGANIZATION DETAILS */}

        <Text style={styles.sectionTitle}>
          {translate('organizationDetails', language)}
        </Text>

        <Text style={styles.label}>
          {translate('organizationName', language)} *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="office-building-outline"
              placeholder={translate('placeholderOrgName', language)}
              value={organizationName}
              onChangeText={setOrganizationName}
            />
          </View>

          <VoiceButton field={translate('organizationName', language)} onVoice={() => startVoiceFor('organizationName')} />
        </View>

        {/* ORGANIZATION TYPE */}

        <Text style={styles.label}>
          {translate('typeOfOrganization', language)} *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <SelectBox
              icon="briefcase-outline"
              placeholder={translate('placeholderSelectType', language)}
              value={organizationType}
              onPress={selectOrganizationType}
            />
          </View>

          <VoiceButton field={translate('typeOfOrganization', language)} onVoice={() => startVoiceFor('typeOfOrganization')} />
        </View>

        {/* NUMBER OF WORKERS */}

        <Text style={styles.label}>
          {translate('numberOfWorkers', language)} *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="account-group-outline"
              placeholder={translate('placeholderWorkerCount', language)}
              keyboardType="number-pad"
              value={numberOfWorkers}
              onChangeText={(text) =>
                setNumberOfWorkers(text.replace(/\D/g, ""))
              }
            />
          </View>

          <VoiceButton field={translate('numberOfWorkers', language)} onVoice={() => startVoiceFor('numberOfWorkers')} />
        </View>

        {/* ORGANIZATION DESCRIPTION */}

        <Text style={styles.label}>
          {translate('descriptionOptional', language)}
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="text-box-outline"
              placeholder={translate('placeholderDescription', language)}
              value={organizationDescription}
              onChangeText={setOrganizationDescription}
              multiline={true}
            />
          </View>

          <VoiceButton field={translate('descriptionOptional', language)} onVoice={() => startVoiceFor('descriptionOptional')} />
        </View>

        {/* ORGANIZATION ADDRESS */}

        <Text style={styles.sectionTitle}>
          {translate('organizationAddressSection', language)}
        </Text>

        <Text style={styles.label}>
          {translate('address', language)} *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="map-marker-outline"
              placeholder={translate('placeholderAddress', language)}
              value={organizationAddress}
              onChangeText={setOrganizationAddress}
            />
          </View>

          <VoiceButton field={translate('address', language)} onVoice={() => startVoiceFor('address')} />
        </View>

        {/* CITY */}

        <Text style={styles.label}>
          {translate('city', language)} *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="map-marker-outline"
              placeholder={translate('placeholderCity', language)}
              value={city}
              onChangeText={setCity}
            />
          </View>

          <VoiceButton field={translate('city', language)} onVoice={() => startVoiceFor('city')} />
        </View>

        {/* STATE */}

        <Text style={styles.label}>
          {translate('state', language)} *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="map-outline"
              placeholder={translate('placeholderState', language)}
              value={state}
              onChangeText={setState}
            />
          </View>

          <VoiceButton field={translate('state', language)} onVoice={() => startVoiceFor('state')} />
        </View>

        {/* PIN CODE */}

        <Text style={styles.label}>
          {translate('pinCode', language)} *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="map-marker-radius-outline"
              placeholder={translate('placeholderPIN', language)}
              keyboardType="number-pad"
              value={pinCode}
              onChangeText={(text) =>
                setPinCode(text.replace(/\D/g, "").slice(0, 6))
              }
            />
          </View>
        </View>

        {/* COUNTRY */}

        <Text style={styles.label}>
          {translate('country', language)} *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="earth"
              placeholder={translate('placeholderCountry', language)}
              value={country}
              onChangeText={setCountry}
            />
          </View>

          <VoiceButton field={translate('country', language)} onVoice={() => startVoiceFor('country')} />
        </View>

        {/* LEADER/ADMIN DETAILS */}

        <Text style={styles.sectionTitle}>
          {translate('adminLeaderDetails', language)}
        </Text>

        <Text style={styles.label}>
          {translate('fullName', language)} *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="account-outline"
              placeholder={translate('placeholderFullName', language)}
              value={leaderName}
              onChangeText={setLeaderName}
            />
          </View>

          <VoiceButton field={translate('fullName', language)} onVoice={() => startVoiceFor('fullName')} />
        </View>

        {/* PHONE */}

        <Text style={styles.label}>
          {translate('phoneNumber', language)} *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="phone-outline"
              placeholder={translate('placeholderPhone', language)}
              keyboardType="phone-pad"
              value={leaderPhone}
              onChangeText={(text) =>
                setLeaderPhone(text.replace(/\D/g, "").slice(0, 10))
              }
            />
          </View>
        </View>

        {/* EMAIL */}

        <Text style={styles.label}>
          {translate('email', language)} *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="email-outline"
              placeholder={translate('placeholderEmail', language)}
              keyboardType="email-address"
              value={leaderEmail}
              onChangeText={setLeaderEmail}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* DOB */}

        <Text style={styles.label}>
          {translate('dateOfBirth', language)} *
        </Text>

        <View style={styles.row}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.flexOne}
            onPress={openDOB}
          >
            <InputBox
              icon="calendar-outline"
              placeholder={translate('placeholderDOB', language)}
              value={dob}
              editable={false}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.calendarButton}
            onPress={openDOB}
          >
            <MaterialCommunityIcons
              name="calendar"
              size={22}
              color={PURPLE}
            />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dobDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "calendar"}
            maximumDate={new Date()}
            onChange={handleDOB}
          />
        )}

        {/* GENDER */}

        <Text style={styles.label}>
          {translate('gender', language)} *
        </Text>

        <View style={styles.genderRow}>
          {[
            { key: "Male", label: translate('male', language) },
            { key: "Female", label: translate('female', language) },
            { key: "Other", label: translate('other', language) },
          ].map((item) => {
            const selected = gender === item.key;

            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.8}
                style={[
                  styles.genderButton,
                  selected && styles.genderButtonSelected,
                ]}
                onPress={() => setGender(item.key)}
              >
                {selected && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={17}
                    color="#FFFFFF"
                    style={styles.genderIcon}
                  />
                )}

                <Text
                  style={[
                    styles.genderText,
                    selected && styles.genderTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* AADHAAR */}

        <Text style={styles.label}>
          {translate('aadhaarNumber', language)} *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="card-account-details-outline"
              placeholder={translate('aadhaarNumber', language)}
              keyboardType="number-pad"
              value={aadhaar}
              onChangeText={(text) =>
                setAadhaar(text.replace(/\D/g, "").slice(0, 12))
              }
            />
          </View>
        </View>

        {/* ACCOUNT SECURITY */}

        <Text style={styles.sectionTitle}>
          {translate('accountSecurity', language)}
        </Text>

        <Text style={styles.label}>
          {translate('password', language)} *
        </Text>

        <View style={styles.passwordRow}>
          <MaterialCommunityIcons
            name="lock-outline"
            size={22}
            color={PURPLE}
          />

          <TextInput
            style={styles.passwordInput}
            placeholder={translate('placeholderMinChars', language)}
            placeholderTextColor="#9AA4AF"
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={false}
            returnKeyType="next"
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <MaterialCommunityIcons
              name={passwordVisible ? "eye-off-outline" : "eye-outline"}
              size={24}
              color={PURPLE}
            />
          </TouchableOpacity>
        </View>

        {/* CONFIRM PASSWORD */}

        <Text style={styles.label}>
          {translate('confirmPassword', language)} *
        </Text>

        <View style={styles.passwordRow}>
          <MaterialCommunityIcons
            name="lock-check-outline"
            size={22}
            color={PURPLE}
          />

          <TextInput
            style={styles.passwordInput}
            placeholder={translate('placeholderConfirmPassword', language)}
            placeholderTextColor="#9AA4AF"
            secureTextEntry={!confirmPasswordVisible}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={false}
            returnKeyType="done"
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              setConfirmPasswordVisible(!confirmPasswordVisible)
            }
          >
            <MaterialCommunityIcons
              name={
                confirmPasswordVisible
                  ? "eye-off-outline"
                  : "eye-outline"
              }
              size={24}
              color={PURPLE}
            />
          </TouchableOpacity>
        </View>

        {/* COMPLETE */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.completeButton}
          onPress={completeRegistration}
        >
          <Text style={styles.completeButtonText}>
            {translate('completeRegistration', language)}
          </Text>

          <MaterialCommunityIcons
            name="check"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  orgRegVoiceGuidanceWrap: {
    marginBottom: verticalScale(10),
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(18),
    paddingTop: Platform.OS === "ios" ? verticalScale(50) : verticalScale(12),
    paddingBottom: verticalScale(12),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  backButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: moderateScale(17),
    fontWeight: "700",
    color: "#111827",
  },

  headerSpacer: {
    width: scale(40),
  },

  content: {
    paddingHorizontal: moderateScale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(30),
  },

  pageTitle: {
    fontSize: moderateScale(26),
    fontWeight: "700",
    color: "#111827",
    marginBottom: verticalScale(6),
  },

  pageSubtitle: {
    fontSize: moderateScale(14),
    color: "#6B7280",
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(18),
  },

  infoBox: {
    flexDirection: "row",
    backgroundColor: "#EEF4F8",
    padding: moderateScale(14),
    borderRadius: moderateScale(10),
    marginBottom: verticalScale(22),
  },

  infoIcon: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(10),
  },

  infoText: {
    flex: 1,
    fontSize: moderateScale(13),
    color: "#374151",
    lineHeight: moderateScale(19),
  },

  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#111827",
    marginTop: verticalScale(20),
    marginBottom: verticalScale(14),
  },

  label: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#374151",
    marginBottom: verticalScale(8),
    marginTop: verticalScale(12),
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  flexOne: {
    flex: 1,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(14),
    minHeight: verticalScale(52),
    paddingVertical: verticalScale(12),
  },

  textInput: {
    flex: 1,
    fontSize: moderateScale(15),
    color: "#111827",
    marginLeft: moderateScale(10),
    minHeight: verticalScale(28),
  },

  textInputMultiline: {
    minHeight: verticalScale(80),
    textAlignVertical: "top",
    paddingTop: verticalScale(12),
  },

  selectBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(14),
    minHeight: verticalScale(52),
    paddingVertical: verticalScale(12),
  },

  selectText: {
    flex: 1,
    fontSize: moderateScale(15),
    color: "#111827",
    marginLeft: moderateScale(10),
  },

  placeholderText: {
    color: "#9AA4AF",
  },

  micButton: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: "#EEF4F8",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: moderateScale(10),
  },

  calendarButton: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: "#EEF4F8",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: moderateScale(10),
  },

  genderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  genderButton: {
    flex: 1,
    minHeight: verticalScale(48),
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: moderateScale(10),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: moderateScale(4),
    backgroundColor: "#FFFFFF",
    paddingVertical: verticalScale(12),
  },

  genderButtonSelected: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },

  genderIcon: {
    marginRight: moderateScale(6),
  },

  genderText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#374151",
  },

  genderTextSelected: {
    color: "#FFFFFF",
  },

  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(14),
    minHeight: verticalScale(52),
    paddingVertical: verticalScale(12),
  },

  passwordInput: {
    flex: 1,
    fontSize: moderateScale(15),
    color: "#111827",
    marginLeft: moderateScale(10),
    minHeight: verticalScale(28),
  },

  completeButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PURPLE,
    minHeight: verticalScale(54),
    borderRadius: moderateScale(12),
    marginTop: verticalScale(26),
    paddingVertical: verticalScale(14),
    elevation: 3,
    shadowColor: PURPLE,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },

  completeButtonText: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#FFFFFF",
    marginRight: moderateScale(8),
  },

  bottomSpace: {
    height: verticalScale(30),
  },
});
