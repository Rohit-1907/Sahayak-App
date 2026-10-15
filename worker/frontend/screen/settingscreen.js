import React, { useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Animated,
  TextInput,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  primary: "#49769F",
  secondary: "#4E8EA2",
  dark: "#2A2A2A",
  white: "#FFFFFF",

  background: "#F7FAFC",
  softBlue: "#EAF3F7",
  softBlue2: "#EEF6F9",

  border: "#E5E7EB",
  muted: "#6B7280",
  placeholder: "#9CA3AF",

  danger: "#EF4444",
  dangerBackground: "#FEF2F2",
  dangerBorder: "#FECACA",

  success: "#20804A",
  successBackground: "#EAF7EF",
};

export default function SettingsScreen({
  onBack,
  onLogout,
  onChangePassword,
  onLanguage,
  onTheme,
  onChangeMobile,
  onPrivacyPolicy,
  onTerms,
  onContactUs,
  theme,
}) {
  /*
   ============================================================
   INTERNAL SETTINGS NAVIGATION

   This makes all buttons inside Settings actually open
   their respective screens without requiring App.js routes.
   ============================================================
  */

  const [activeScreen, setActiveScreen] = useState("main");

  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const [language, setLanguage] = useState("English");

  const [currentTheme, setCurrentTheme] = useState(
    theme === "dark" ? "dark" : "light"
  );

  /*
   ============================================================
   PASSWORD STATE
   ============================================================
  */

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /*
   ============================================================
   MOBILE STATE
   ============================================================
  */

  const [newMobile, setNewMobile] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [mobileOtpSent, setMobileOtpSent] = useState(false);

  /*
   ============================================================
   THEME
   ============================================================
  */

  const isDark = currentTheme === "dark";

  /*
   ============================================================
   INTERNAL BACK
   ============================================================
  */

  const goBackInsideSettings = () => {
    setActiveScreen("main");
  };

  /*
   ============================================================
   LANGUAGE
   ============================================================
  */

  const selectLanguage = (selectedLanguage) => {
    setLanguage(selectedLanguage);

    if (onLanguage) {
      onLanguage(selectedLanguage);
    }

    Alert.alert(
      "Language Changed",
      `Language changed to ${selectedLanguage}.`
    );

    setActiveScreen("main");
  };

  /*
   ============================================================
   THEME
   ============================================================
  */

  const selectTheme = (selectedTheme) => {
    setCurrentTheme(selectedTheme);

    if (onTheme) {
      onTheme(selectedTheme);
    }

    Alert.alert(
      "Theme Updated",
      selectedTheme === "dark"
        ? "Dark Mode enabled."
        : "Light Mode enabled."
    );
  };

  /*
   ============================================================
   PASSWORD
   ============================================================
  */

  const savePassword = () => {
    if (!oldPassword.trim()) {
      Alert.alert("Required", "Please enter your current password.");
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert("Required", "Please enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(
        "Invalid Password",
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "New password and confirm password do not match."
      );
      return;
    }

    if (onChangePassword) {
      onChangePassword({
        oldPassword,
        newPassword,
      });
    }

    Alert.alert(
      "Password Updated",
      "Your password has been changed successfully.",
      [
        {
          text: "OK",
          onPress: () => {
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setActiveScreen("main");
          },
        },
      ]
    );
  };

  /*
   ============================================================
   MOBILE NUMBER
   ============================================================
  */

  const sendMobileOtp = () => {
    const cleanMobile = newMobile.replace(/\D/g, "");

    if (cleanMobile.length !== 10) {
      Alert.alert(
        "Invalid Mobile Number",
        "Please enter a valid 10 digit mobile number."
      );
      return;
    }

    setNewMobile(cleanMobile);
    setMobileOtpSent(true);

    Alert.alert(
      "OTP Sent",
      `A verification OTP has been sent to +91 ${cleanMobile}.`
    );
  };

  const verifyMobileOtp = () => {
    if (mobileOtp.length !== 6) {
      Alert.alert(
        "Invalid OTP",
        "Please enter the 6 digit OTP."
      );
      return;
    }

    if (onChangeMobile) {
      onChangeMobile(newMobile);
    }

    Alert.alert(
      "Mobile Number Updated",
      "Your mobile number has been updated successfully.",
      [
        {
          text: "OK",
          onPress: () => {
            setNewMobile("");
            setMobileOtp("");
            setMobileOtpSent(false);
            setActiveScreen("main");
          },
        },
      ]
    );
  };

  /*
   ============================================================
   CONTACT
   ============================================================
  */

  const handleEmailPress = () => {
    Alert.alert(
      "Email Support",
      "support@sahayak.com\n\nYou can contact our support team using this email."
    );
  };

  const handlePhonePress = () => {
    Alert.alert(
      "Call Support",
      "+91 9876543210\n\nOur support team will help you with your issue."
    );
  };

  /*
   ============================================================
   LOGOUT
   ============================================================
  */

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            if (onLogout) {
              onLogout();
            }
          },
        },
      ]
    );
  };

  /*
   ============================================================
   IF INTERNAL SCREEN IS OPEN
   ============================================================
  */

  if (activeScreen === "changePassword") {
    return (
      <PasswordScreen
        onBack={goBackInsideSettings}
        oldPassword={oldPassword}
        setOldPassword={setOldPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        showOldPassword={showOldPassword}
        setShowOldPassword={setShowOldPassword}
        showNewPassword={showNewPassword}
        setShowNewPassword={setShowNewPassword}
        showConfirmPassword={showConfirmPassword}
        setShowConfirmPassword={setShowConfirmPassword}
        onSave={savePassword}
      />
    );
  }

  if (activeScreen === "changeMobile") {
    return (
      <MobileScreen
        onBack={goBackInsideSettings}
        newMobile={newMobile}
        setNewMobile={setNewMobile}
        mobileOtp={mobileOtp}
        setMobileOtp={setMobileOtp}
        mobileOtpSent={mobileOtpSent}
        onSendOtp={sendMobileOtp}
        onVerifyOtp={verifyMobileOtp}
      />
    );
  }

  if (activeScreen === "language") {
    return (
      <LanguageScreen
        onBack={goBackInsideSettings}
        selectedLanguage={language}
        onSelect={selectLanguage}
      />
    );
  }

  if (activeScreen === "theme") {
    return (
      <ThemeScreen
        onBack={goBackInsideSettings}
        selectedTheme={currentTheme}
        onSelect={selectTheme}
      />
    );
  }

  if (activeScreen === "privacy") {
    return (
      <InformationScreen
        onBack={goBackInsideSettings}
        icon="shield-checkmark-outline"
        title="Privacy Policy"
      >
        <Text style={styles.infoText}>
          Sahayak respects your privacy and is committed to protecting
          your personal information.
        </Text>

        <Text style={styles.infoHeading}>
          Information We Collect
        </Text>

        <Text style={styles.infoText}>
          We may collect information such as your name, mobile number,
          location, work details and verification documents to provide
          worker services.
        </Text>

        <Text style={styles.infoHeading}>
          How We Use Your Information
        </Text>

        <Text style={styles.infoText}>
          Your information is used to create and manage your account,
          connect you with jobs, verify your identity and improve the
          Sahayak experience.
        </Text>

        <Text style={styles.infoHeading}>
          Data Security
        </Text>

        <Text style={styles.infoText}>
          We take reasonable measures to protect your information from
          unauthorized access or misuse.
        </Text>
      </InformationScreen>
    );
  }

  if (activeScreen === "terms") {
    return (
      <InformationScreen
        onBack={goBackInsideSettings}
        icon="document-text-outline"
        title="Terms & Conditions"
      >
        <Text style={styles.infoText}>
          By using Sahayak, you agree to follow the terms and conditions
          applicable to the worker platform.
        </Text>

        <Text style={styles.infoHeading}>
          Account Responsibility
        </Text>

        <Text style={styles.infoText}>
          You are responsible for keeping your account information
          accurate and your login credentials secure.
        </Text>

        <Text style={styles.infoHeading}>
          Jobs & Services
        </Text>

        <Text style={styles.infoText}>
          Workers should provide professional and reliable services
          according to the accepted job requirements.
        </Text>

        <Text style={styles.infoHeading}>
          Account Usage
        </Text>

        <Text style={styles.infoText}>
          Any misuse of the application or fraudulent activity may
          result in account restrictions.
        </Text>
      </InformationScreen>
    );
  }

  if (activeScreen === "contact") {
    return (
      <ContactScreen
        onBack={goBackInsideSettings}
        onEmail={handleEmailPress}
        onPhone={handlePhonePress}
      />
    );
  }

  if (activeScreen === "version") {
    return (
      <InformationScreen
        onBack={goBackInsideSettings}
        icon="information-circle-outline"
        title="App Version"
      >
        <View style={styles.versionBox}>
          <Ionicons
            name="sparkles-outline"
            size={42}
            color={COLORS.secondary}
          />

          <Text style={styles.versionTitle}>
            Sahayak
          </Text>

          <Text style={styles.versionNumber}>
            Version 1.0.0
          </Text>
        </View>

        <Text style={styles.infoText}>
          Sahayak helps workers manage their profile, skills, jobs,
          earnings and account information from one place.
        </Text>
      </InformationScreen>
    );
  }

  /*
   ============================================================
   MAIN SETTINGS SCREEN
   ============================================================
  */

  return (
    <SafeAreaView
      style={[
        styles.container,
        isDark && styles.darkContainer,
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* HEADER */}

        <View style={styles.header}>

          <AnimatedIconButton
            icon="arrow-back"
            onPress={onBack}
            iconColor={isDark ? "#FFFFFF" : COLORS.dark}
          />

          <Text
            style={[
              styles.headerTitle,
              isDark && styles.darkText,
            ]}
          >
            Settings
          </Text>

          <View style={styles.headerSpace} />

        </View>

        {/* ACCOUNT */}

        <Text
          style={[
            styles.sectionTitle,
            isDark && styles.darkText,
          ]}
        >
          Account
        </Text>

        <View
          style={[
            styles.card,
            isDark && styles.darkCard,
          ]}
        >

          <SettingItem
            icon="lock-closed-outline"
            title="Change Password"
            subtitle="Update your account password"
            onPress={() => setActiveScreen("changePassword")}
            dark={isDark}
          />

          <SettingItem
            icon="call-outline"
            title="Change Mobile Number"
            subtitle="Update your registered phone number"
            onPress={() => setActiveScreen("changeMobile")}
            dark={isDark}
          />

          <SettingItem
            icon="language-outline"
            title="Language Preference"
            subtitle={language}
            onPress={() => setActiveScreen("language")}
            dark={isDark}
          />

          <SettingItem
            icon="moon-outline"
            title="Theme"
            subtitle={
              currentTheme === "dark"
                ? "Dark Mode"
                : "Light Mode"
            }
            onPress={() => setActiveScreen("theme")}
            dark={isDark}
            isLast
          />

        </View>

        {/* PERMISSIONS */}

        <Text
          style={[
            styles.sectionTitle,
            isDark && styles.darkText,
          ]}
        >
          Permissions
        </Text>

        <View
          style={[
            styles.card,
            isDark && styles.darkCard,
          ]}
        >

          <ToggleItem
            icon="camera-outline"
            title="Camera Access"
            value={cameraEnabled}
            onValueChange={setCameraEnabled}
            dark={isDark}
          />

          <ToggleItem
            icon="mic-outline"
            title="Microphone Access"
            value={microphoneEnabled}
            onValueChange={setMicrophoneEnabled}
            dark={isDark}
          />

          <ToggleItem
            icon="location-outline"
            title="Location Access"
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            isLast
            dark={isDark}
          />

        </View>

        {/* ABOUT */}

        <Text
          style={[
            styles.sectionTitle,
            isDark && styles.darkText,
          ]}
        >
          About
        </Text>

        <View
          style={[
            styles.card,
            isDark && styles.darkCard,
          ]}
        >

          <SettingItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            onPress={() => setActiveScreen("privacy")}
            dark={isDark}
          />

          <SettingItem
            icon="document-text-outline"
            title="Terms & Conditions"
            onPress={() => setActiveScreen("terms")}
            dark={isDark}
          />

          <SettingItem
            icon="mail-outline"
            title="Contact Us"
            subtitle="support@sahayak.com"
            onPress={() => setActiveScreen("contact")}
            dark={isDark}
          />

          <SettingItem
            icon="information-circle-outline"
            title="App Version"
            subtitle="Sahayak 1.0.0"
            onPress={() => setActiveScreen("version")}
            dark={isDark}
            isLast
          />

        </View>

        {/* LOGOUT */}

        <AnimatedLogoutButton
          onPress={handleLogout}
        />

        {/* FOOTER */}

        <View style={styles.footerContainer}>

          <View style={styles.footerLine} />

          <View style={styles.footerContent}>

            <Ionicons
              name="sparkles-outline"
              size={15}
              color={COLORS.secondary}
            />

            <Text style={styles.footer}>
              Sahayak • Made with
            </Text>

            <Ionicons
              name="heart"
              size={13}
              color="#E85D75"
              style={styles.heartIcon}
            />

            <Text style={styles.footer}>
              in India
            </Text>

          </View>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   PASSWORD SCREEN
============================================================ */

function PasswordScreen({
  onBack,
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showOldPassword,
  setShowOldPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  onSave,
}) {
  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.innerHeader}>

        <AnimatedIconButton
          icon="arrow-back"
          onPress={onBack}
          iconColor={COLORS.dark}
        />

        <Text style={styles.innerHeaderTitle}>
          Change Password
        </Text>

        <View style={styles.headerSpace} />

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.formContent}
      >

        <View style={styles.largeIconCircle}>
          <Ionicons
            name="lock-closed-outline"
            size={35}
            color={COLORS.secondary}
          />
        </View>

        <Text style={styles.formHeading}>
          Update your password
        </Text>

        <Text style={styles.formDescription}>
          Enter your current password and create a new secure password.
        </Text>

        <PasswordInput
          label="Current Password"
          value={oldPassword}
          onChangeText={setOldPassword}
          secure={!showOldPassword}
          onEye={() =>
            setShowOldPassword(!showOldPassword)
          }
          visible={showOldPassword}
        />

        <PasswordInput
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secure={!showNewPassword}
          onEye={() =>
            setShowNewPassword(!showNewPassword)
          }
          visible={showNewPassword}
        />

        <PasswordInput
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secure={!showConfirmPassword}
          onEye={() =>
            setShowConfirmPassword(!showConfirmPassword)
          }
          visible={showConfirmPassword}
        />

        <Text style={styles.passwordHint}>
          Password must contain at least 8 characters.
        </Text>

        <PrimaryButton
          title="Save Password"
          icon="checkmark-circle-outline"
          onPress={onSave}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   MOBILE SCREEN
============================================================ */

function MobileScreen({
  onBack,
  newMobile,
  setNewMobile,
  mobileOtp,
  setMobileOtp,
  mobileOtpSent,
  onSendOtp,
  onVerifyOtp,
}) {
  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.innerHeader}>

        <AnimatedIconButton
          icon="arrow-back"
          onPress={onBack}
          iconColor={COLORS.dark}
        />

        <Text style={styles.innerHeaderTitle}>
          Change Mobile Number
        </Text>

        <View style={styles.headerSpace} />

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.formContent}
      >

        <View style={styles.largeIconCircle}>
          <Ionicons
            name="call-outline"
            size={35}
            color={COLORS.secondary}
          />
        </View>

        <Text style={styles.formHeading}>
          Update mobile number
        </Text>

        <Text style={styles.formDescription}>
          Enter your new mobile number. We will send an OTP for
          verification.
        </Text>

        <Text style={styles.inputLabel}>
          New Mobile Number
        </Text>

        <View style={styles.phoneInputContainer}>

          <Text style={styles.countryCode}>
            +91
          </Text>

          <TextInput
            style={styles.phoneInput}
            value={newMobile}
            onChangeText={(text) =>
              setNewMobile(text.replace(/\D/g, "").slice(0, 10))
            }
            placeholder="Enter 10 digit mobile number"
            placeholderTextColor={COLORS.placeholder}
            keyboardType="phone-pad"
            maxLength={10}
          />

        </View>

        {!mobileOtpSent ? (
          <PrimaryButton
            title="Send OTP"
            icon="send-outline"
            onPress={onSendOtp}
          />
        ) : (
          <>
            <Text style={styles.otpInfo}>
              OTP sent to +91 {newMobile}
            </Text>

            <Text style={styles.inputLabel}>
              Enter OTP
            </Text>

            <TextInput
              style={styles.normalInput}
              value={mobileOtp}
              onChangeText={(text) =>
                setMobileOtp(
                  text.replace(/\D/g, "").slice(0, 6)
                )
              }
              placeholder="Enter 6 digit OTP"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="number-pad"
              maxLength={6}
            />

            <PrimaryButton
              title="Verify & Update"
              icon="checkmark-circle-outline"
              onPress={onVerifyOtp}
            />

            <Pressable
              style={styles.resendButton}
              onPress={onSendOtp}
            >
              <Text style={styles.resendText}>
                Resend OTP
              </Text>
            </Pressable>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   LANGUAGE SCREEN
============================================================ */

function LanguageScreen({
  onBack,
  selectedLanguage,
  onSelect,
}) {
  const languages = [
    {
      name: "English",
      icon: "🇬🇧",
    },
    {
      name: "मराठी",
      icon: "🇮🇳",
    },
    {
      name: "हिंदी",
      icon: "🇮🇳",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.innerHeader}>

        <AnimatedIconButton
          icon="arrow-back"
          onPress={onBack}
          iconColor={COLORS.dark}
        />

        <Text style={styles.innerHeaderTitle}>
          Language Preference
        </Text>

        <View style={styles.headerSpace} />

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.formContent}
      >

        <Text style={styles.formHeading}>
          Select Language
        </Text>

        <Text style={styles.formDescription}>
          Choose your preferred language for the application.
        </Text>

        <View style={styles.selectionCard}>

          {languages.map((item, index) => {
            const selected =
              selectedLanguage === item.name;

            return (
              <Pressable
                key={item.name}
                style={[
                  styles.languageRow,
                  index === languages.length - 1 &&
                    styles.noBorder,
                  selected &&
                    styles.selectedLanguageRow,
                ]}
                onPress={() => onSelect(item.name)}
              >

                <Text style={styles.languageEmoji}>
                  {item.icon}
                </Text>

                <Text
                  style={[
                    styles.languageName,
                    selected &&
                      styles.selectedLanguageName,
                  ]}
                >
                  {item.name}
                </Text>

                <View
                  style={[
                    styles.radio,
                    selected &&
                      styles.radioSelected,
                  ]}
                >
                  {selected && (
                    <View
                      style={styles.radioDot}
                    />
                  )}
                </View>

              </Pressable>
            );
          })}

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   THEME SCREEN
============================================================ */

function ThemeScreen({
  onBack,
  selectedTheme,
  onSelect,
}) {
  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.innerHeader}>

        <AnimatedIconButton
          icon="arrow-back"
          onPress={onBack}
          iconColor={COLORS.dark}
        />

        <Text style={styles.innerHeaderTitle}>
          Theme
        </Text>

        <View style={styles.headerSpace} />

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.formContent}
      >

        <Text style={styles.formHeading}>
          Choose Theme
        </Text>

        <Text style={styles.formDescription}>
          Select how Sahayak should look on your device.
        </Text>

        <ThemeOption
          icon="sunny-outline"
          title="Light Mode"
          subtitle="Use the light appearance"
          selected={selectedTheme === "light"}
          onPress={() => onSelect("light")}
        />

        <ThemeOption
          icon="moon-outline"
          title="Dark Mode"
          subtitle="Use the dark appearance"
          selected={selectedTheme === "dark"}
          onPress={() => onSelect("dark")}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   INFORMATION SCREEN
============================================================ */

function InformationScreen({
  onBack,
  icon,
  title,
  children,
}) {
  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.innerHeader}>

        <AnimatedIconButton
          icon="arrow-back"
          onPress={onBack}
          iconColor={COLORS.dark}
        />

        <Text style={styles.innerHeaderTitle}>
          {title}
        </Text>

        <View style={styles.headerSpace} />

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.infoContent}
      >

        <View style={styles.largeIconCircle}>
          <Ionicons
            name={icon}
            size={35}
            color={COLORS.secondary}
          />
        </View>

        <Text style={styles.infoMainTitle}>
          {title}
        </Text>

        <View style={styles.infoCard}>
          {children}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   CONTACT SCREEN
============================================================ */

function ContactScreen({
  onBack,
  onEmail,
  onPhone,
}) {
  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.innerHeader}>

        <AnimatedIconButton
          icon="arrow-back"
          onPress={onBack}
          iconColor={COLORS.dark}
        />

        <Text style={styles.innerHeaderTitle}>
          Contact Us
        </Text>

        <View style={styles.headerSpace} />

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.formContent}
      >

        <View style={styles.largeIconCircle}>
          <Ionicons
            name="mail-outline"
            size={35}
            color={COLORS.secondary}
          />
        </View>

        <Text style={styles.formHeading}>
          How can we help?
        </Text>

        <Text style={styles.formDescription}>
          Our support team is here to help you with your Sahayak
          account and services.
        </Text>

        <Pressable
          style={styles.contactCard}
          onPress={onEmail}
        >
          <View style={styles.contactIcon}>
            <Ionicons
              name="mail-outline"
              size={24}
              color={COLORS.secondary}
            />
          </View>

          <View style={styles.contactText}>
            <Text style={styles.contactTitle}>
              Email Support
            </Text>

            <Text style={styles.contactSubtitle}>
              support@sahayak.com
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#9CA3AF"
          />
        </Pressable>

        <Pressable
          style={styles.contactCard}
          onPress={onPhone}
        >
          <View style={styles.contactIcon}>
            <Ionicons
              name="call-outline"
              size={24}
              color={COLORS.secondary}
            />
          </View>

          <View style={styles.contactText}>
            <Text style={styles.contactTitle}>
              Phone Support
            </Text>

            <Text style={styles.contactSubtitle}>
              +91 9876543210
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#9CA3AF"
          />
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   PASSWORD INPUT
============================================================ */

function PasswordInput({
  label,
  value,
  onChangeText,
  secure,
  onEye,
  visible,
}) {
  return (
    <View style={styles.inputWrapper}>

      <Text style={styles.inputLabel}>
        {label}
      </Text>

      <View style={styles.passwordInputContainer}>

        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={COLORS.secondary}
        />

        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor={COLORS.placeholder}
        />

        <Pressable onPress={onEye}>
          <Ionicons
            name={
              visible
                ? "eye-outline"
                : "eye-off-outline"
            }
            size={21}
            color="#9CA3AF"
          />
        </Pressable>

      </View>

    </View>
  );
}

/* ============================================================
   PRIMARY BUTTON
============================================================ */

function PrimaryButton({
  title,
  icon,
  onPress,
}) {
  return (
    <Pressable
      delayPressIn={0}
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && styles.primaryButtonPressed,
      ]}
      onPress={onPress}
    >

      <Ionicons
        name={icon}
        size={20}
        color="#FFFFFF"
      />

      <Text style={styles.primaryButtonText}>
        {title}
      </Text>

    </Pressable>
  );
}

/* ============================================================
   THEME OPTION
============================================================ */

function ThemeOption({
  icon,
  title,
  subtitle,
  selected,
  onPress,
}) {
  return (
    <Pressable
      delayPressIn={0}
      style={[
        styles.themeOption,
        selected && styles.themeOptionSelected,
      ]}
      onPress={onPress}
    >

      <View style={styles.themeIcon}>
        <Ionicons
          name={icon}
          size={24}
          color={COLORS.secondary}
        />
      </View>

      <View style={styles.themeText}>
        <Text style={styles.themeTitle}>
          {title}
        </Text>

        <Text style={styles.themeSubtitle}>
          {subtitle}
        </Text>
      </View>

      <View
        style={[
          styles.radio,
          selected && styles.radioSelected,
        ]}
      >
        {selected && (
          <View style={styles.radioDot} />
        )}
      </View>

    </Pressable>
  );
}

/* ============================================================
   ANIMATED ICON BUTTON
============================================================ */

function AnimatedIconButton({
  icon,
  onPress,
  iconColor,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
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
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
      }}
    >
      <Pressable
        delayPressIn={0}
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.backButtonPressed,
        ]}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
      >
        <Ionicons
          name={icon}
          size={24}
          color={iconColor}
        />
      </Pressable>
    </Animated.View>
  );
}

/* ============================================================
   SETTING ITEM
============================================================ */

function SettingItem({
  icon,
  title,
  subtitle,
  onPress,
  isLast = false,
  dark = false,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!onPress) return;

    Animated.spring(scale, {
      toValue: 0.985,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 5,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.animatedItem,
        {
          transform: [{ scale }],
        },
      ]}
    >
      <Pressable
        delayPressIn={0}
        style={[
          styles.item,
          isLast && styles.lastItem,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >

        <View style={styles.iconCircle}>

          <Ionicons
            name={icon}
            size={21}
            color={COLORS.secondary}
          />

        </View>

        <View style={styles.textContainer}>

          <Text
            style={[
              styles.itemTitle,
              dark && styles.darkText,
            ]}
          >
            {title}
          </Text>

          {subtitle ? (
            <Text style={styles.itemSubtitle}>
              {subtitle}
            </Text>
          ) : null}

        </View>

        <View style={styles.arrowCircle}>

          <Ionicons
            name="chevron-forward"
            size={17}
            color="#9CA3AF"
          />

        </View>

      </Pressable>
    </Animated.View>
  );
}

/* ============================================================
   TOGGLE ITEM
============================================================ */

function ToggleItem({
  icon,
  title,
  value,
  onValueChange,
  isLast = false,
  dark = false,
}) {
  return (
    <View
      style={[
        styles.item,
        isLast && styles.lastItem,
      ]}
    >

      <View style={styles.iconCircle}>

        <Ionicons
          name={icon}
          size={21}
          color={COLORS.secondary}
        />

      </View>

      <Text
        style={[
          styles.toggleTitle,
          dark && styles.darkText,
        ]}
      >
        {title}
      </Text>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: "#D1D5DB",
          true: COLORS.secondary,
        }}
        thumbColor={COLORS.white}
        ios_backgroundColor="#D1D5DB"
      />

    </View>
  );
}

/* ============================================================
   LOGOUT
============================================================ */

function AnimatedLogoutButton({
  onPress,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
      bounciness: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.logoutAnimated,
        {
          transform: [{ scale }],
        },
      ]}
    >

      <Pressable
        delayPressIn={0}
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.logoutPressed,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >

        <View style={styles.logoutIconCircle}>

          <Ionicons
            name="log-out-outline"
            size={21}
            color={COLORS.danger}
          />

        </View>

        <Text style={styles.logoutText}>
          Logout
        </Text>

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#F87171"
        />

      </Pressable>

    </Animated.View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  darkContainer: {
    backgroundColor: "#101820",
  },

  content: {
    paddingBottom: 40,
  },

  /* HEADER */

  header: {
    height: 70,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  innerHeader: {
    height: 70,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: COLORS.softBlue,
    justifyContent: "center",
    alignItems: "center",
  },

  backButtonPressed: {
    backgroundColor: "#DCEAF1",
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: COLORS.dark,
  },

  innerHeaderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.dark,
    maxWidth: "70%",
    textAlign: "center",
  },

  headerSpace: {
    width: 43,
  },

  /* SECTION */

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.dark,
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 12,
  },

  /* CARD */

  card: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 5,
    elevation: 2,
  },

  darkCard: {
    backgroundColor: "#1A252E",
    borderColor: "#2D3A44",
  },

  /* ITEM */

  animatedItem: {
    width: "100%",
  },

  item: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  lastItem: {
    borderBottomWidth: 0,
  },

  /* ICON */

  iconCircle: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.softBlue,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  /* TEXT */

  textContainer: {
    flex: 1,
  },

  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.dark,
  },

  itemSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 3,
  },

  toggleTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.dark,
  },

  darkText: {
    color: "#FFFFFF",
  },

  /* ARROW */

  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },

  /* LOGOUT */

  logoutAnimated: {
    marginHorizontal: 20,
    marginTop: 28,
  },

  logoutButton: {
    height: 57,
    borderRadius: 16,
    backgroundColor: COLORS.dangerBackground,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  logoutPressed: {
    backgroundColor: "#FEE2E2",
  },

  logoutIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },

  logoutText: {
    flex: 1,
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },

  /* FOOTER */

  footerContainer: {
    marginTop: 25,
    alignItems: "center",
    paddingHorizontal: 20,
  },

  footerLine: {
    width: "25%",
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 14,
  },

  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  footer: {
    color: COLORS.placeholder,
    fontSize: 12,
    marginLeft: 5,
  },

  heartIcon: {
    marginLeft: 4,
  },

  /* ============================================================
     INNER SCREENS
  ============================================================ */

  formContent: {
    padding: 20,
    paddingBottom: 50,
  },

  infoContent: {
    padding: 20,
    paddingBottom: 50,
  },

  largeIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: COLORS.softBlue,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 15,
  },

  formHeading: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.dark,
    textAlign: "center",
    marginTop: 18,
  },

  formDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 7,
    marginBottom: 22,
  },

  inputWrapper: {
    marginBottom: 15,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: 7,
  },

  passwordInputContainer: {
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: COLORS.dark,
    marginLeft: 10,
  },

  passwordHint: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: -3,
    marginBottom: 18,
  },

  primaryButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    gap: 8,
  },

  primaryButtonPressed: {
    opacity: 0.85,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
  },

  /* MOBILE */

  phoneInputContainer: {
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 15,
  },

  countryCode: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.dark,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },

  phoneInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: COLORS.dark,
    paddingLeft: 10,
  },

  normalInput: {
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.dark,
    marginBottom: 12,
  },

  otpInfo: {
    color: COLORS.success,
    backgroundColor: COLORS.successBackground,
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    marginBottom: 18,
  },

  resendButton: {
    alignItems: "center",
    paddingVertical: 15,
  },

  resendText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 13,
  },

  /* LANGUAGE */

  selectionCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    overflow: "hidden",
  },

  languageRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  selectedLanguageRow: {
    backgroundColor: COLORS.softBlue2,
  },

  noBorder: {
    borderBottomWidth: 0,
  },

  languageEmoji: {
    fontSize: 25,
    width: 42,
  },

  languageName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.dark,
  },

  selectedLanguageName: {
    color: COLORS.primary,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
  },

  radioSelected: {
    borderColor: COLORS.secondary,
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.secondary,
  },

  /* THEME */

  themeOption: {
    minHeight: 80,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 12,
  },

  themeOptionSelected: {
    borderColor: "#BFD5E3",
    backgroundColor: COLORS.softBlue2,
  },

  themeIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: COLORS.softBlue,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  themeText: {
    flex: 1,
  },

  themeTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.dark,
  },

  themeSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 3,
  },

  /* INFORMATION */

  infoMainTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.dark,
    textAlign: "center",
    marginTop: 15,
    marginBottom: 18,
  },

  infoCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 18,
  },

  infoHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.dark,
    marginTop: 18,
    marginBottom: 6,
  },

  infoText: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 21,
  },

  /* VERSION */

  versionBox: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 25,
    marginBottom: 15,
  },

  versionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.dark,
    marginTop: 10,
  },

  versionNumber: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
  },

  /* CONTACT */

  contactCard: {
    minHeight: 78,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 12,
  },

  contactIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: COLORS.softBlue,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  contactText: {
    flex: 1,
  },

  contactTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.dark,
  },

  contactSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
});
