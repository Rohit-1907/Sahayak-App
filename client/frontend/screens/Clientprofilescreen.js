import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { translate } from '../utils/translations';
import { useTextToSpeech } from '../utils/useTextToSpeech';
import VoiceGuidanceButton from '../components/VoiceGuidanceButton';

/* =====================================================
   ANIMATED BUTTON
===================================================== */

function AnimatedButton({ children, style, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale }],
        },
      ]}
    >
      <Pressable
        delayPressIn={0}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

/* =====================================================
   ANIMATED PROFILE ITEM
===================================================== */

function ProfileItem({
  icon,
  title,
  subtitle,
  onPress,
  delay = 0,
}) {
  const opacity = useRef(
    new Animated.Value(0)
  ).current;

  const translateX = useRef(
    new Animated.Value(30)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        delay,
        useNativeDriver: true,
      }),

      Animated.timing(translateX, {
        toValue: 0,
        duration: 450,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateX }],
      }}
    >
      <AnimatedButton
        style={styles.menuItemWrapper}
        onPress={onPress}
      >
        <View style={styles.menuItem}>

          <View style={styles.iconCircle}>
            <Ionicons
              name={icon}
              size={22}
              color="#49769F"
            />
          </View>

          <View style={styles.itemTextContainer}>

            <Text style={styles.itemTitle}>
              {title}
            </Text>

            <Text style={styles.itemSubtitle}>
              {subtitle}
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#94A3B8"
          />

        </View>
      </AnimatedButton>
    </Animated.View>
  );
}

/* =====================================================
   MAIN SCREEN
===================================================== */

let profileIntroSpoken = false;

export default function ClientProfile({
  language = 'english',
  onBack,
  onLogout,
  onSwitchAccount,
  onMyBookings,
  onSavedServices,
  onEditProfile,
  onNotifications,
  onSettings,
  onPaymentMethods,
  onHelpSupport,
}) {
  const [userName, setUserName] = useState('Loading...');
  const [userEmail, setUserEmail] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  const { speak, stop } = useTextToSpeech(language);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stop();
    };
  }, [stop]);

  // Plays the "Voice Assistance is available" instruction once per
  // app session, after the profile data loads (never on re-renders,
  // language changes, scrolls, or navigation away and back).
  useEffect(() => {
    if (dataLoaded && !profileIntroSpoken) {
      profileIntroSpoken = true;
      if (mountedRef.current) {
        speak(translate(language, 'profileVoiceAssistIntro'));
      }
    }
  }, [dataLoaded, language, speak]);

  const screenOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const screenTranslateY = useRef(
    new Animated.Value(20)
  ).current;

  const profileOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const profileScale = useRef(
    new Animated.Value(0.92)
  ).current;

  // Fetch user data
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const userDataStr = await AsyncStorage.getItem('user_data');
      
      if (userDataStr) {
        const user = JSON.parse(userDataStr);
        setUserName(user.full_name || user.username || 'User');
        setUserEmail(user.email || '');
      }
    } catch (error) {
      console.log('Error fetching user data:', error);
      setUserName('User');
    }
    setDataLoaded(true);
  };

  useEffect(() => {
    Animated.parallel([

      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),

      Animated.timing(screenTranslateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),

      Animated.spring(profileScale, {
        toValue: 1,
        speed: 12,
        bounciness: 6,
        useNativeDriver: true,
      }),

      Animated.timing(profileOpacity, {
        toValue: 1,
        duration: 600,
        delay: 150,
        useNativeDriver: true,
      }),

    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>

      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity: screenOpacity,
            transform: [
              {
                translateY: screenTranslateY,
              },
            ],
          },
        ]}
      >

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >

          {/* =====================================================
              HEADER
          ===================================================== */}

          <View style={styles.header}>

            <AnimatedButton
              style={styles.headerButtonWrapper}
              onPress={onBack}
            >
              <View style={styles.backButton}>

                <Ionicons
                  name="arrow-back"
                  size={24}
                  color="#2A2A2A"
                />

              </View>
            </AnimatedButton>

            <Text style={styles.headerTitle}>
              {translate(language, 'myProfile')}
            </Text>

            <AnimatedButton
              style={styles.headerButtonWrapper}
              onPress={onEditProfile}
            >
              <View style={styles.editIcon}>

                <Ionicons
                  name="create-outline"
                  size={23}
                  color="#49769F"
                />

              </View>
            </AnimatedButton>

          </View>

          {/* =====================================================
              VOICE ASSISTANCE
          ===================================================== */}

          <View style={styles.voiceGuidanceWrap}>

            <VoiceGuidanceButton
              labeled
              text={translate(language, 'profileVoiceGuidance')}
              language={language}
              title={translate(language, 'voiceAssistance')}
              subtitle={translate(language, 'profileHearHowToUse')}
            />

          </View>

          {/* =====================================================
              PROFILE SECTION
          ===================================================== */}

          <Animated.View
            style={[
              styles.profileSection,
              {
                opacity: profileOpacity,
                transform: [
                  {
                    scale: profileScale,
                  },
                ],
              },
            ]}
          >

            <View style={styles.profileImage}>

              <Ionicons
                name="person"
                size={48}
                color="#FFFFFF"
              />

            </View>

            <Text style={styles.name}>
              {userName}
            </Text>

            <Text style={styles.email}>
              {userEmail || translate(language, 'noEmailSet')}
            </Text>

            <View style={styles.locationRow}>

              <Ionicons
                name="location-outline"
                size={17}
                color="#49769F"
              />

              <Text style={styles.location}>
                {translate(language, 'profileLocation')}
              </Text>

            </View>

            {/* EDIT PROFILE BUTTON */}

            <AnimatedButton
              style={styles.editButtonWrapper}
              onPress={onEditProfile}
            >
              <View style={styles.editButton}>

                <Ionicons
                  name="create-outline"
                  size={17}
                  color="#49769F"
                />

                <Text style={styles.editButtonText}>
                  {translate(language, 'editProfile')}
                </Text>

              </View>
            </AnimatedButton>

          </Animated.View>

          {/* =====================================================
              ACCOUNT
          ===================================================== */}

          <Text style={styles.sectionTitle}>
            {translate(language, 'account')}
          </Text>

          <View style={styles.menuCard}>

            <ProfileItem
              icon="calendar-outline"
              title={translate(language, 'myBookings')}
              subtitle={translate(language, 'bookingsSubtitle')}
              onPress={onMyBookings}
              delay={100}
            />

            <ProfileItem
              icon="heart-outline"
              title={translate(language, 'savedServices')}
              subtitle={translate(language, 'savedServicesSubtitle')}
              onPress={onSavedServices}
              delay={180}
            />

            <ProfileItem
              icon="card-outline"
              title={translate(language, 'paymentMethods')}
              subtitle={translate(language, 'paymentMethodsSubtitle')}
              onPress={onPaymentMethods}
              delay={260}
            />

          </View>

          {/* =====================================================
              PREFERENCES
          ===================================================== */}

          <Text style={styles.sectionTitle}>
            {translate(language, 'preferences')}
          </Text>

          <View style={styles.menuCard}>

            <ProfileItem
              icon="notifications-outline"
              title={translate(language, 'notifications')}
              subtitle={translate(language, 'notificationsSubtitle')}
              onPress={onNotifications}
              delay={340}
            />

            <ProfileItem
              icon="settings-outline"
              title={translate(language, 'settings')}
              subtitle={translate(language, 'settingsSubtitle')}
              onPress={onSettings}
              delay={420}
            />

            <ProfileItem
              icon="help-circle-outline"
              title={translate(language, 'helpSupport')}
              subtitle={translate(language, 'helpSupportSubtitle')}
              onPress={onHelpSupport}
              delay={500}
            />

          </View>

          {/* =====================================================
              LOGOUT
          ===================================================== */}

          <AnimatedButton
            style={styles.logoutWrapper}
            onPress={() => {
              Alert.alert(
                translate(language, 'logout'),
                translate(language, 'logoutConfirmMessage'),
                [
                  {
                    text: translate(language, 'cancel'),
                    style: 'cancel',
                  },
                  {
                    text: translate(language, 'logout'),
                    style: 'destructive',
                    onPress: onLogout,
                  },
                ]
              );
            }}
          >
            <View style={styles.logoutButton}>

              <Ionicons
                name="log-out-outline"
                size={22}
                color="#2A2A2A"
              />

              <Text style={styles.logoutText}>
                {translate(language, 'logout')}
              </Text>

            </View>
          </AnimatedButton>

          {/* =====================================================
              SWITCH ACCOUNT
          ===================================================== */}

          <AnimatedButton
            style={styles.switchAccountWrapper}
            onPress={() => {
              Alert.alert(
                translate(language, 'switchAccount'),
                translate(language, 'switchAccountMessage'),
                [
                  {
                    text: translate(language, 'cancel'),
                    style: 'cancel',
                  },
                  {
                    text: translate(language, 'switchNow'),
                    onPress: onSwitchAccount,
                  },
                ]
              );
            }}
          >
            <View style={styles.switchAccountButton}>

              <Ionicons
                name="swap-horizontal-outline"
                size={22}
                color="#49769F"
              />

              <Text style={styles.switchAccountText}>
                {translate(language, 'switchAccount')}
              </Text>

            </View>
          </AnimatedButton>

          {/* =====================================================
              VERSION
          ===================================================== */}

          <Text style={styles.version}>
            Sahayak • {translate(language, 'version')} 1.0.0
          </Text>

        </ScrollView>

      </Animated.View>

    </SafeAreaView>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  animatedContainer: {
    flex: 1,
  },

  content: {
    paddingBottom: 40,
  },

  voiceGuidanceWrap: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },

  /* =====================================================
     HEADER
  ===================================================== */

  header: {
    height: 102,
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  headerButtonWrapper: {
    borderRadius: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#D6E4EE',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2A2A2A',
  },

  editIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF3F8',

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#D6E4EE',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  /* =====================================================
     PROFILE
  ===================================================== */

  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },

  profileImage: {
    width: 105,
    height: 105,
    borderRadius: 53,

    backgroundColor: '#49769F',

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 15,

    shadowColor: '#49769F',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2A2A2A',
  },

  email: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 5,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  location: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },

  /* =====================================================
     EDIT PROFILE BUTTON
  ===================================================== */

  editButtonWrapper: {
    marginTop: 18,
    borderRadius: 12,
  },

  editButton: {
    backgroundColor: '#EAF3F8',

    paddingHorizontal: 20,
    paddingVertical: 11,

    borderRadius: 12,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderColor: '#D6E4EE',
  },

  editButtonText: {
    color: '#49769F',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 7,
  },

  /* =====================================================
     SECTIONS
  ===================================================== */

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#2A2A2A',

    paddingHorizontal: 20,

    marginTop: 8,
    marginBottom: 12,
  },

  menuCard: {
    marginHorizontal: 20,

    backgroundColor: '#FFFFFF',

    borderRadius: 18,

    borderWidth: 1,
    borderColor: '#D6E4EE',

    overflow: 'hidden',

    marginBottom: 25,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },

  menuItemWrapper: {
    width: '100%',
  },

  menuItem: {
    minHeight: 75,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 15,

    borderBottomWidth: 1,
    borderBottomColor: '#E8F0F5',
  },

  iconCircle: {
    width: 43,
    height: 43,
    borderRadius: 22,

    backgroundColor: '#EAF3F8',

    justifyContent: 'center',
    alignItems: 'center',
  },

  itemTextContainer: {
    flex: 1,
    marginLeft: 13,
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A2A2A',
  },

  itemSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },

  /* =====================================================
     LOGOUT
  ===================================================== */

  logoutWrapper: {
    marginHorizontal: 20,
    borderRadius: 15,
  },

  logoutButton: {
    height: 55,

    borderRadius: 15,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#D6E4EE',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutText: {
    color: '#2A2A2A',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },

  /* =====================================================
     SWITCH ACCOUNT
  ===================================================== */

  switchAccountWrapper: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 15,
  },

  switchAccountButton: {
    height: 55,

    borderRadius: 15,

    backgroundColor: '#EAF3F8',

    borderWidth: 1,
    borderColor: '#D6E4EE',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  switchAccountText: {
    color: '#49769F',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },

  /* =====================================================
     VERSION
  ===================================================== */

  version: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 20,
  },

});