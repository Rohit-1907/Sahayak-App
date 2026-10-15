import React, { useRef, useState } from 'react';
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
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

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

  danger: '#EF4444',
  dangerBackground: '#FEF2F2',
  dangerBorder: '#FECACA',
};

/* =====================================================
   MAIN SETTINGS SCREEN
===================================================== */

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
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const [language, setLanguage] = useState('English');

  /* ================================
     LANGUAGE
  ================================= */

  const changeLanguage = () => {
    const next =
      language === 'English'
        ? 'मराठी'
        : language === 'मराठी'
        ? 'हिंदी'
        : 'English';

    setLanguage(next);

    Alert.alert(
      'Language Changed',
      'Language set to ' + next
    );

    if (onLanguage) {
      onLanguage(next);
    }
  };

  /* ================================
     CHANGE PASSWORD
  ================================= */

  const changePassword = () => {
    if (onChangePassword) {
      onChangePassword();
      return;
    }

    Alert.alert(
      'Change Password',
      'Password change screen will be connected with the backend.'
    );
  };

  /* ================================
     CHANGE MOBILE
  ================================= */

  const changeMobile = () => {
    if (onChangeMobile) {
      onChangeMobile();
      return;
    }

    Alert.alert(
      'Change Mobile Number',
      'Mobile number update will be connected with the backend.'
    );
  };

  /* ================================
     PRIVACY
  ================================= */

  const openPrivacy = () => {
    if (onPrivacyPolicy) {
      onPrivacyPolicy();
      return;
    }

    Alert.alert(
      'Privacy Policy',
      'Privacy Policy screen will open here.'
    );
  };

  /* ================================
     TERMS
  ================================= */

  const openTerms = () => {
    if (onTerms) {
      onTerms();
      return;
    }

    Alert.alert(
      'Terms & Conditions',
      'Terms & Conditions screen will open here.'
    );
  };

  /* ================================
     CONTACT
  ================================= */

  const contactUs = () => {
    if (onContactUs) {
      onContactUs();
      return;
    }

    Alert.alert(
      'Contact Us',
      'Email: support@sahayak.com\nPhone: +91 9876543210'
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>

          <AnimatedIconButton
            icon="arrow-back"
            onPress={onBack}
            iconColor={COLORS.dark}
          />

          <Text style={styles.headerTitle}>
            Settings
          </Text>

          <View style={styles.headerSpace} />

        </View>

        {/* =================================================
            ACCOUNT
        ================================================= */}

        <Text style={styles.sectionTitle}>
          Account
        </Text>

        <View style={styles.card}>

          <SettingItem
            icon="lock-closed-outline"
            title="Change Password"
            subtitle="Update your account password"
            onPress={changePassword}
          />

          <SettingItem
            icon="call-outline"
            title="Change Mobile Number"
            subtitle="Update your registered phone number"
            onPress={changeMobile}
          />

          <SettingItem
            icon="language-outline"
            title="Language Preference"
            subtitle={language}
            onPress={changeLanguage}
          />

          <SettingItem
            icon="moon-outline"
            title="Theme"
            subtitle={
              theme === 'dark'
                ? 'Dark Mode'
                : 'Light Mode'
            }
            onPress={onTheme}
            isLast
          />

        </View>

        {/* =================================================
            PERMISSIONS
        ================================================= */}

        <Text style={styles.sectionTitle}>
          Permissions
        </Text>

        <View style={styles.card}>

          <ToggleItem
            icon="camera-outline"
            title="Camera Access"
            value={cameraEnabled}
            onValueChange={setCameraEnabled}
          />

          <ToggleItem
            icon="mic-outline"
            title="Microphone Access"
            value={microphoneEnabled}
            onValueChange={setMicrophoneEnabled}
          />

          <ToggleItem
            icon="location-outline"
            title="Location Access"
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            isLast
          />

        </View>

        {/* =================================================
            ABOUT
        ================================================= */}

        <Text style={styles.sectionTitle}>
          About
        </Text>

        <View style={styles.card}>

          <SettingItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            onPress={openPrivacy}
          />

          <SettingItem
            icon="document-text-outline"
            title="Terms & Conditions"
            onPress={openTerms}
          />

          <SettingItem
            icon="mail-outline"
            title="Contact Us"
            subtitle="support@sahayak.com"
            onPress={contactUs}
          />

          <SettingItem
            icon="information-circle-outline"
            title="App Version"
            subtitle="Sahayak 1.0.0"
            isLast
          />

        </View>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <AnimatedLogoutButton onPress={onLogout} />

        {/* =================================================
            FOOTER
        ================================================= */}

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

/* =====================================================
   ANIMATED ICON BUTTON
===================================================== */

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

/* =====================================================
   SETTING ITEM
===================================================== */

function SettingItem({
  icon,
  title,
  subtitle,
  onPress,
  isLast = false,
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
        style={[
          styles.item,
          isLast && styles.lastItem,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!onPress}
      >

        {/* ICON */}

        <View style={styles.iconCircle}>

          <Ionicons
            name={icon}
            size={21}
            color={COLORS.secondary}
          />

        </View>

        {/* TEXT */}

        <View style={styles.textContainer}>

          <Text style={styles.itemTitle}>
            {title}
          </Text>

          {subtitle ? (
            <Text style={styles.itemSubtitle}>
              {subtitle}
            </Text>
          ) : null}

        </View>

        {/* ARROW */}

        {onPress ? (
          <View style={styles.arrowCircle}>

            <Ionicons
              name="chevron-forward"
              size={17}
              color="#9CA3AF"
            />

          </View>
        ) : null}

      </Pressable>

    </Animated.View>
  );
}

/* =====================================================
   TOGGLE ITEM
===================================================== */

function ToggleItem({
  icon,
  title,
  value,
  onValueChange,
  isLast = false,
}) {
  return (
    <View
      style={[
        styles.item,
        isLast && styles.lastItem,
      ]}
    >

      {/* ICON */}

      <View style={styles.iconCircle}>

        <Ionicons
          name={icon}
          size={21}
          color={COLORS.secondary}
        />

      </View>

      {/* TITLE */}

      <Text style={styles.toggleTitle}>
        {title}
      </Text>

      {/* SWITCH */}

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: '#D1D5DB',
          true: COLORS.secondary,
        }}
        thumbColor={COLORS.white}
        ios_backgroundColor="#D1D5DB"
      />

    </View>
  );
}

/* =====================================================
   ANIMATED LOGOUT BUTTON
===================================================== */

function AnimatedLogoutButton({ onPress }) {
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

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({

  /* ================= CONTAINER ================= */

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingBottom: 40,
  },

  /* ================= HEADER ================= */

  header: {
    height: 102,
    paddingTop:30,
    backgroundColor: COLORS.white,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 20,

    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 22,

    backgroundColor: COLORS.softBlue,

    justifyContent: 'center',
    alignItems: 'center',
  },

  backButtonPressed: {
    backgroundColor: '#DCEAF1',
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: COLORS.dark,
  },

  headerSpace: {
    width: 43,
  },

  /* ================= SECTION ================= */

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,

    paddingHorizontal: 20,

    marginTop: 25,
    marginBottom: 12,
  },

  /* ================= CARD ================= */

  card: {
    marginHorizontal: 20,

    backgroundColor: COLORS.white,

    borderRadius: 19,

    borderWidth: 1,
    borderColor: COLORS.border,

    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 5,

    elevation: 2,
  },

  /* ================= ITEM ================= */

  animatedItem: {
    width: '100%',
  },

  item: {
    minHeight: 74,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 15,

    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  lastItem: {
    borderBottomWidth: 0,
  },

  /* ================= ICON ================= */

  iconCircle: {
    width: 43,
    height: 43,
    borderRadius: 14,

    backgroundColor: COLORS.softBlue,

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 12,
  },

  /* ================= TEXT ================= */

  textContainer: {
    flex: 1,
  },

  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
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
    fontWeight: '600',
    color: COLORS.dark,
  },

  /* ================= ARROW ================= */

  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,

    backgroundColor: '#F8FAFC',

    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ================= LOGOUT ================= */

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

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 15,
  },

  logoutPressed: {
    backgroundColor: '#FEE2E2',
  },

  logoutIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 13,

    backgroundColor: COLORS.white,

    justifyContent: 'center',
    alignItems: 'center',
  },

  logoutText: {
    flex: 1,

    color: COLORS.danger,

    fontSize: 16,
    fontWeight: '700',

    marginLeft: 10,
  },

  /* ================= FOOTER ================= */

  footerContainer: {
    marginTop: 25,
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  footerLine: {
    width: '25%',
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 14,
  },

  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footer: {
    color: COLORS.placeholder,
    fontSize: 12,
    marginLeft: 5,
  },

  heartIcon: {
    marginLeft: 4,
  },

});