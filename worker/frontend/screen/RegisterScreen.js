import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  Platform,
  Image,
  Modal,
  KeyboardAvoidingView,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import { scale, verticalScale, moderateScale, wp } from '../utils/responsive';
import LocationPicker from '../components/LocationPicker';
import { translate } from '../utils/translations';
import { useSpeechToText } from '../utils/useSpeechToText';

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
}) => {
  return (
    <View style={styles.inputBox}>
      <MaterialCommunityIcons
        name={icon}
        size={moderateScale(22)}
        color={PURPLE}
      />

      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor="#9AA4AF"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={editable}
        autoCorrect={false}
        autoCapitalize={autoCapitalize}
        blurOnSubmit={false}
        returnKeyType="next"
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
        size={moderateScale(27)}
        color={PURPLE}
      />
    </TouchableOpacity>
  );
};

const VOICE_ENABLED_FIELDS = [
  "Full Name",
  "Type of Work",
  "Phone Number",
  "Aadhaar Number",
  "Address",
  "City",
  "State",
  "PIN Code",
  "Country",
  "Experience",
  "Visit Charge",
  "Email",
];

const SPOKEN_DIGITS = {
  zero: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  oh: "0",
};

// Converts simple spoken numeric words to digits ("five" -> "5").
const wordsToDigits = (text) =>
  text.replace(
    /\b(zero|one|two|three|four|five|six|seven|eight|nine|oh)\b/gi,
    (match) => SPOKEN_DIGITS[match.toLowerCase()] || match
  );

// Keeps only digits so spoken numbers map cleanly to numeric fields.
const normalizeNumeric = (text) =>
  wordsToDigits(text).replace(/\D/g, "");

// ============================================================
// REGISTER SCREEN
// ============================================================

export default function RegisterScreen({
  onBack,
  onNext,
  language = "English",
}) {
  const [name, setName] = useState("");

  const [dob, setDob] = useState("");
  const [dobDate, setDobDate] = useState(
    new Date(2000, 0, 1)
  );
  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [gender, setGender] = useState("");
  const [workType, setWorkType] = useState("");
  const [phone, setPhone] = useState("");

  const [aadhaar, setAadhaar] = useState("");
  const [aadhaarImage, setAadhaarImage] =
    useState(null);
  const [aadhaarVerified, setAadhaarVerified] =
    useState(false);

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [country, setCountry] = useState("India");

  // Primary service location (new)
  const [primaryLocation, setPrimaryLocation] = useState(null);

  const [experience, setExperience] = useState("");
  const [visitCharge, setVisitCharge] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [passwordVisible, setPasswordVisible] =
    useState(false);

  const [
    confirmPasswordVisible,
    setConfirmPasswordVisible,
  ] = useState(false);

  // ============================================================
  // CAMERA
  // ============================================================

  const [
    cameraPermission,
    requestCameraPermission,
  ] = useCameraPermissions();

  const [cameraVisible, setCameraVisible] =
    useState(false);

  // ============================================================
  // VOICE INPUT
  // ============================================================

  const {
    start: startSTT,
    reset: resetSTT,
    listening: voiceListening,
    transcript: voiceTranscript,
  } = useSpeechToText(language);

  const activeVoiceField = useRef(null);

  const applyVoiceToField = (field, text) => {
    switch (field) {
      case "Full Name":
        setName(text);
        break;
      case "Type of Work":
        setWorkType(text);
        break;
      case "Phone Number":
        setPhone(normalizeNumeric(text).slice(0, 10));
        break;
      case "Aadhaar Number":
        setAadhaar(normalizeNumeric(text).slice(0, 12));
        break;
      case "Address":
        setAddress(text);
        break;
      case "City":
        setCity(text);
        break;
      case "State":
        setState(text);
        break;
      case "PIN Code":
        setPinCode(normalizeNumeric(text).slice(0, 6));
        break;
      case "Country":
        setCountry(text);
        break;
      case "Experience":
        setExperience(normalizeNumeric(text));
        break;
      case "Visit Charge":
        setVisitCharge(normalizeNumeric(text));
        break;
      case "Email":
        setEmail(text);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (!activeVoiceField.current || voiceListening) {
      return;
    }

    const field = activeVoiceField.current;

    // Recognition finished; guard against empty results.
    const spoken = (voiceTranscript || "").trim();

    if (!spoken) {
      return;
    }

    activeVoiceField.current = null;
    applyVoiceToField(field, spoken);
  }, [voiceListening, voiceTranscript]);

  const voiceInput = (field) => {
    if (!VOICE_ENABLED_FIELDS.includes(field)) {
      Alert.alert(
        translate("voiceInput", language),
        translate("voiceInputUnavailable", language)
      );
      return;
    }

    activeVoiceField.current = field;
    resetSTT();
    startSTT();
  };

  const VoiceButton = ({ field }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.micButton}
        onPress={() => voiceInput(field)}
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

    const day = String(
      selectedDate.getDate()
    ).padStart(2, "0");

    const month = String(
      selectedDate.getMonth() + 1
    ).padStart(2, "0");

    const year = selectedDate.getFullYear();

    setDob(`${day}/${month}/${year}`);
  };

  // ============================================================
  // CITY
  // FIX:
  // city-outline -> map-marker-outline
  // ============================================================

  const selectCity = () => {
    Alert.alert(
      "Select City",
      "Choose your city",
      [
        {
          text: "Pune",
          onPress: () => setCity("Pune"),
        },
        {
          text: "Mumbai",
          onPress: () => setCity("Mumbai"),
        },
        {
          text: "Nashik",
          onPress: () => setCity("Nashik"),
        },
        {
          text: "Nagpur",
          onPress: () => setCity("Nagpur"),
        },
        {
          text: "Cancel",
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
      "Select State",
      "Choose your state",
      [
        {
          text: "Maharashtra",
          onPress: () =>
            setState("Maharashtra"),
        },
        {
          text: "Gujarat",
          onPress: () => setState("Gujarat"),
        },
        {
          text: "Karnataka",
          onPress: () =>
            setState("Karnataka"),
        },
        {
          text: "Goa",
          onPress: () => setState("Goa"),
        },
        {
          text: "Cancel",
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
      "Select Country",
      "Choose your country",
      [
        {
          text: "India",
          onPress: () => setCountry("India"),
        },
        {
          text: "Other",
          onPress: () => setCountry("Other"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  // ============================================================
  // AADHAAR CAMERA
  // ============================================================

  const openCamera = async () => {
    if (!cameraPermission?.granted) {
      const permission =
        await requestCameraPermission();

      if (!permission.granted) {
        Alert.alert(
          "Camera Permission",
          "Please allow camera permission."
        );
        return;
      }
    }

    setCameraVisible(true);
  };

  // ============================================================
  // AADHAAR GALLERY
  // ============================================================

  const pickAadhaar = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Gallery Permission",
        "Please allow gallery permission."
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.9,
      });

    if (!result.canceled) {
      setAadhaarImage(
        result.assets[0].uri
      );

      setAadhaarVerified(false);
    }
  };

  // ============================================================
  // COMPLETE REGISTRATION
  // ============================================================

  const completeRegistration = () => {
    if (!name.trim()) {
      Alert.alert(
        "Required",
        "Please enter your full name."
      );
      return;
    }

    if (!dob.trim()) {
      Alert.alert(
        "Required",
        "Please select your date of birth."
      );
      return;
    }

    if (!gender) {
      Alert.alert(
        "Required",
        "Please select your gender."
      );
      return;
    }

    if (!workType.trim()) {
      Alert.alert(
        "Required",
        "Please enter your type of work."
      );
      return;
    }

    if (
      phone.replace(/\D/g, "").length !== 10
    ) {
      Alert.alert(
        "Invalid Phone",
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    if (
      aadhaar.replace(/\D/g, "").length !== 12
    ) {
      Alert.alert(
        "Invalid Aadhaar",
        "Please enter a valid 12-digit Aadhaar number."
      );
      return;
    }

    if (!address.trim()) {
      Alert.alert(
        "Required",
        "Please enter your address."
      );
      return;
    }

    if (!city.trim()) {
      Alert.alert(
        "Required",
        "Please enter your city."
      );
      return;
    }

    if (!state.trim()) {
      Alert.alert(
        "Required",
        "Please enter your state."
      );
      return;
    }

    if (pinCode.length !== 6) {
      Alert.alert(
        "Invalid PIN",
        "Please enter a valid 6-digit PIN."
      );
      return;
    }

    if (!country.trim()) {
      Alert.alert(
        "Required",
        "Please enter your country."
      );
      return;
    }

    // Validate primary service location
    if (!primaryLocation) {
      Alert.alert(
        "Required",
        "Please set your primary service location. This helps clients find you."
      );
      return;
    }

    if (!experience.trim()) {
      Alert.alert(
        "Required",
        "Please enter your experience."
      );
      return;
    }

    if (!visitCharge.trim()) {
      Alert.alert(
        "Required",
        "Please enter your visit charge."
      );
      return;
    }

    if (
      !email.trim() ||
      !email.includes("@")
    ) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address."
      );
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Invalid Password",
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Password Error",
        "Passwords do not match."
      );
      return;
    }

    if (onNext) {
      onNext({
        name,
        dob,
        gender,
        workType,
        phone,
        aadhaar,
        aadhaarImage,
        aadhaarVerified,
        address,
        city,
        state,
        pinCode,
        country,
        primaryLocation,  // Add location data
        experience,
        visitCharge,
        email,
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
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
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
          Worker Registration
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
          Create Worker Account
        </Text>

        <Text style={styles.pageSubtitle}>
          Fill in your details to get started
        </Text>

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
            We'll use this information to
            recommend suitable jobs near you.
          </Text>
        </View>

        {/* PERSONAL DETAILS */}

        <Text style={styles.sectionTitle}>
          Personal Details
        </Text>

        <Text style={styles.label}>
          Full Name *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="account-outline"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
            />
          </View>

          <VoiceButton field="Full Name" />
        </View>

        {/* DOB */}

        <Text style={styles.label}>
          Date of Birth *
        </Text>

        <View style={styles.row}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.flexOne}
            onPress={openDOB}
          >
            <InputBox
              icon="calendar-outline"
              placeholder="Select date of birth"
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
            display={
              Platform.OS === "ios"
                ? "spinner"
                : "calendar"
            }
            maximumDate={new Date()}
            onChange={handleDOB}
          />
        )}

        {/* GENDER */}

        <Text style={styles.label}>
          Gender *
        </Text>

        <View style={styles.genderRow}>
          {["Male", "Female", "Other"].map(
            (item) => {
              const selected =
                gender === item;

              return (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.8}
                  style={[
                    styles.genderButton,
                    selected &&
                      styles.genderButtonSelected,
                  ]}
                  onPress={() =>
                    setGender(item)
                  }
                >
                  {selected && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={17}
                      color="#FFFFFF"
                      style={
                        styles.genderIcon
                      }
                    />
                  )}

                  <Text
                    style={[
                      styles.genderText,
                      selected &&
                        styles.genderTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </View>

        {/* TYPE OF WORK */}

        <Text style={styles.label}>
          Type of Work *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="briefcase-outline"
              placeholder="Select your type of work"
              value={workType}
              onChangeText={setWorkType}
            />
          </View>

          <VoiceButton field="Type of Work" />
        </View>

        {/* PHONE */}

        <Text style={styles.label}>
          Phone Number *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="phone-outline"
              placeholder="Enter 10-digit phone number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(text) =>
                setPhone(
                  text
                    .replace(/\D/g, "")
                    .slice(0, 10)
                )
              }
            />
          </View>

          <VoiceButton field="Phone Number" />
        </View>

        {/* IDENTITY */}

        <Text style={styles.sectionTitle}>
          Identity Verification
        </Text>

        <Text style={styles.label}>
          Aadhaar Number *
        </Text>

        <InputBox
          icon="card-account-details-outline"
          placeholder="Enter 12-digit Aadhaar number"
          keyboardType="number-pad"
          value={aadhaar}
          onChangeText={(text) =>
            setAadhaar(
              text
                .replace(/\D/g, "")
                .slice(0, 12)
            )
          }
        />

        {/* AADHAAR PHOTO */}

        <Text style={styles.label}>
          Aadhaar Photo
        </Text>

        <View style={styles.uploadCard}>
          <View style={styles.uploadTitleRow}>
            <MaterialCommunityIcons
              name="card-account-details-outline"
              size={28}
              color={PURPLE}
            />

            <Text style={styles.uploadTitle}>
              Aadhaar Verification
            </Text>
          </View>

          <Text style={styles.uploadDescription}>
            Upload Aadhaar photo or scan its
            QR code.
          </Text>

          {aadhaarImage && (
            <View
              style={styles.selectedImageBox}
            >
              <Image
                source={{
                  uri: aadhaarImage,
                }}
                style={styles.previewImage}
              />

              <View
                style={styles.selectedImageInfo}
              >
                <Text
                  style={styles.selectedText}
                >
                  Aadhaar photo selected
                </Text>

                {aadhaarVerified && (
                  <Text
                    style={styles.verifiedText}
                  >
                     QR Verified
                  </Text>
                )}
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setAadhaarImage(null);
                  setAadhaarVerified(false);
                }}
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={25}
                  color="#E53935"
                />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.uploadRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.uploadButton}
              onPress={openCamera}
            >
              <MaterialCommunityIcons
                name="camera-outline"
                size={23}
                color={PURPLE}
              />

              <Text
                style={styles.uploadButtonText}
              >
                Camera / QR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.uploadButton}
              onPress={pickAadhaar}
            >
              <MaterialCommunityIcons
                name="image-outline"
                size={23}
                color={PURPLE}
              />

              <Text
                style={styles.uploadButtonText}
              >
                Gallery
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ADDRESS */}

        <Text style={styles.sectionTitle}>
          Address Details
        </Text>

        <Text style={styles.label}>
          Address *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="map-marker-outline"
              placeholder="Enter full address"
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <VoiceButton field="Address" />
        </View>

        {/* CITY */}

        <Text style={styles.label}>
          City *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="map-marker-outline"
              placeholder="Enter your city"
              value={city}
              onChangeText={setCity}
            />
          </View>

          <VoiceButton field="City" />
        </View>

        {/* STATE */}

        <Text style={styles.label}>
          State *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="map-outline"
              placeholder="Enter your state"
              value={state}
              onChangeText={setState}
            />
          </View>

          <VoiceButton field="State" />
        </View>

        {/* PIN */}

        <Text style={styles.label}>
          PIN Code *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="map-marker-radius-outline"
              placeholder="Enter 6-digit PIN"
              keyboardType="number-pad"
              value={pinCode}
              onChangeText={(text) =>
                setPinCode(
                  text
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
            />
          </View>

          <VoiceButton field="PIN Code" />
        </View>

        {/* COUNTRY */}

        <Text style={styles.label}>
          Country *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="earth"
              placeholder="Enter your country"
              value={country}
              onChangeText={setCountry}
            />
          </View>

          <VoiceButton field="Country" />
        </View>

        {/* PRIMARY SERVICE LOCATION - NEW */}
        <Text style={styles.sectionTitle}>
          Service Location
        </Text>

        <LocationPicker
          onLocationSelected={setPrimaryLocation}
          initialLocation={primaryLocation}
        />

        {/* PROFESSIONAL */}

        <Text style={styles.sectionTitle}>
          Professional Details
        </Text>

        <Text style={styles.label}>
          Experience *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="briefcase-clock-outline"
              placeholder="e.g. 5 years"
              keyboardType="numeric"
              value={experience}
              onChangeText={setExperience}
            />
          </View>

          <VoiceButton field="Experience" />
        </View>

        <Text style={styles.label}>
          Visit Charge *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="currency-inr"
              placeholder="e.g. 500"
              keyboardType="numeric"
              value={visitCharge}
              onChangeText={setVisitCharge}
            />
          </View>

          <VoiceButton field="Visit Charge" />
        </View>

        <Text style={styles.label}>
          Email *
        </Text>

        <View style={styles.row}>
          <View style={styles.flexOne}>
            <InputBox
              icon="email-outline"
              placeholder="email@example.com"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          <VoiceButton field="Email" />
        </View>

        {/* PASSWORD */}

        <Text style={styles.label}>
          Password *
        </Text>

        <View style={styles.passwordRow}>
          <MaterialCommunityIcons
            name="lock-outline"
            size={22}
            color={PURPLE}
          />

          <TextInput
            style={styles.passwordInput}
            placeholder="Minimum 8 characters"
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
            onPress={() =>
              setPasswordVisible(
                !passwordVisible
              )
            }
          >
            <MaterialCommunityIcons
              name={
                passwordVisible
                  ? "eye-off-outline"
                  : "eye-outline"
              }
              size={24}
              color={PURPLE}
            />
          </TouchableOpacity>
        </View>

        {/* CONFIRM PASSWORD */}

        <Text style={styles.label}>
          Confirm Password *
        </Text>

        <View style={styles.passwordRow}>
          <MaterialCommunityIcons
            name="lock-check-outline"
            size={22}
            color={PURPLE}
          />

          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm password"
            placeholderTextColor="#9AA4AF"
            secureTextEntry={
              !confirmPasswordVisible
            }
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
              setConfirmPasswordVisible(
                !confirmPasswordVisible
              )
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
          <Text
            style={styles.completeButtonText}
          >
            Complete Registration
          </Text>

          <MaterialCommunityIcons
            name="check"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* CAMERA */}

      <Modal
        visible={cameraVisible}
        animationType="slide"
        onRequestClose={() =>
          setCameraVisible(false)
        }
      >
        <View style={styles.cameraScreen}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: [
                "qr",
                "pdf417",
              ],
            }}
            onBarcodeScanned={() => {
              setCameraVisible(false);
              setAadhaarVerified(true);

              Alert.alert(
                "QR Verified",
                "Aadhaar QR code scanned successfully."
              );
            }}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.cameraClose}
            onPress={() =>
              setCameraVisible(false)
            }
          >
            <MaterialCommunityIcons
              name="close"
              size={30}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <View style={styles.qrBox} />

          <Text style={styles.cameraText}>
            Place Aadhaar QR code inside
            the box
          </Text>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    height: verticalScale(62),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
  },

  backButton: {
    width: scale(40),
    height: scale(40),
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: "800",
    color: "#202020",
  },

  headerSpacer: {
    width: scale(40),
  },

  content: {
    paddingHorizontal: moderateScale(18),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(40),
  },

  pageTitle: {
    fontSize: moderateScale(25),
    fontWeight: "800",
    color: "#202020",
    marginTop: verticalScale(12),
  },

  pageSubtitle: {
    fontSize: moderateScale(14),
    color: "#777777",
    marginTop: verticalScale(6),
    marginBottom: verticalScale(20),
    lineHeight: moderateScale(20),
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF5F9",
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: "#DDEAF1",
    paddingVertical: verticalScale(13),
    paddingHorizontal: moderateScale(13),
    marginBottom: verticalScale(20),
  },

  infoIcon: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  infoText: {
    flex: 1,
    marginLeft: moderateScale(10),
    color: "#555555",
    fontSize: moderateScale(12.5),
    lineHeight: moderateScale(18),
  },

  sectionTitle: {
    fontSize: moderateScale(17),
    fontWeight: "800",
    color: PURPLE,
    marginTop: verticalScale(12),
    marginBottom: verticalScale(13),
  },

  label: {
    fontSize: moderateScale(13.5),
    fontWeight: "800",
    color: "#333333",
    marginTop: verticalScale(5),
    marginBottom: verticalScale(8),
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: verticalScale(13),
  },

  flexOne: {
    flex: 1,
  },

  inputBox: {
    minHeight: verticalScale(50),
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: moderateScale(13),
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: moderateScale(13),
    paddingVertical: verticalScale(5),
  },

  textInput: {
    flex: 1,
    marginLeft: moderateScale(10),
    fontSize: moderateScale(14),
    color: "#222222",
    minHeight: verticalScale(48),
    paddingVertical: verticalScale(12),
  },

  selectBox: {
    minHeight: verticalScale(50),
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: moderateScale(13),
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: moderateScale(13),
    paddingVertical: verticalScale(12),
  },

  selectText: {
    flex: 1,
    marginLeft: moderateScale(10),
    fontSize: moderateScale(14),
    color: "#222222",
  },

  placeholderText: {
    color: "#9AA4AF",
  },

  micButton: {
    width: scale(48),
    height: scale(48),
    borderRadius: moderateScale(14),
    marginLeft: moderateScale(9),
    backgroundColor: "#EAF3F9",
    borderWidth: 1,
    borderColor: "#D4E3EC",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },

  calendarButton: {
    width: scale(48),
    height: scale(48),
    borderRadius: moderateScale(14),
    marginLeft: moderateScale(9),
    backgroundColor: "#EAF3F9",
    borderWidth: 1,
    borderColor: "#D4E3EC",
    alignItems: "center",
    justifyContent: "center",
  },

  genderRow: {
    flexDirection: "row",
    gap: moderateScale(10),
    marginBottom: verticalScale(14),
  },

  genderButton: {
    flex: 1,
    minHeight: verticalScale(48),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: "#D9D9D9",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingVertical: verticalScale(12),
  },

  genderButtonSelected: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },

  genderIcon: {
    marginRight: moderateScale(5),
  },

  genderText: {
    color: "#555555",
    fontSize: moderateScale(13),
    fontWeight: "700",
  },

  genderTextSelected: {
    color: "#FFFFFF",
  },

  uploadCard: {
    borderWidth: 1,
    borderColor: "#DDEAF1",
    backgroundColor: "#F8FBFD",
    borderRadius: moderateScale(15),
    padding: moderateScale(15),
    marginBottom: verticalScale(15),
  },

  uploadTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  uploadTitle: {
    fontSize: moderateScale(16),
    fontWeight: "800",
    color: "#333333",
    marginLeft: moderateScale(10),
  },

  uploadDescription: {
    color: "#777777",
    fontSize: moderateScale(12.5),
    lineHeight: moderateScale(18),
    marginTop: verticalScale(8),
    marginBottom: verticalScale(13),
  },

  uploadRow: {
    flexDirection: "row",
    gap: moderateScale(10),
  },

  uploadButton: {
    flex: 1,
    minHeight: verticalScale(48),
    borderWidth: 1,
    borderColor: "#D4E3EC",
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingVertical: verticalScale(12),
  },

  uploadButtonText: {
    color: PURPLE,
    fontSize: moderateScale(13),
    fontWeight: "800",
    marginLeft: moderateScale(7),
  },

  selectedImageBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(12),
    padding: moderateScale(8),
    marginBottom: verticalScale(12),
  },

  previewImage: {
    width: scale(55),
    height: scale(55),
    borderRadius: moderateScale(8),
  },

  selectedImageInfo: {
    flex: 1,
  },

  selectedText: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: "#333333",
    marginLeft: moderateScale(10),
  },

  verifiedText: {
    color: "#2E8B57",
    fontWeight: "800",
    fontSize: moderateScale(12),
    marginLeft: moderateScale(10),
    marginTop: verticalScale(3),
  },

  passwordRow: {
    minHeight: verticalScale(50),
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: moderateScale(13),
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: moderateScale(13),
    paddingRight: moderateScale(5),
    marginBottom: verticalScale(13),
  },

  passwordInput: {
    flex: 1,
    minHeight: verticalScale(48),
    marginLeft: moderateScale(10),
    fontSize: moderateScale(14),
    color: "#222222",
    paddingVertical: verticalScale(12),
  },

  completeButton: {
    minHeight: verticalScale(54),
    borderRadius: moderateScale(14),
    backgroundColor: PURPLE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(18),
    paddingVertical: verticalScale(14),
    elevation: 4,
  },

  completeButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(15),
    fontWeight: "800",
    marginRight: moderateScale(9),
  },

  bottomSpace: {
    height: verticalScale(50),
  },

  cameraScreen: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },

  cameraClose: {
    position: "absolute",
    top: verticalScale(45),
    right: moderateScale(20),
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },

  qrBox: {
    width: scale(260),
    height: verticalScale(180),
    borderWidth: 3,
    borderColor: "#FFFFFF",
    borderRadius: moderateScale(15),
  },

  cameraText: {
    color: "#FFFFFF",
    fontSize: moderateScale(15),
    fontWeight: "700",
    marginTop: verticalScale(25),
    textAlign: "center",
    paddingHorizontal: moderateScale(30),
  },
});
