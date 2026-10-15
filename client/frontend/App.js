// "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" devices
// "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081

import React, { useEffect, useRef, useState } from 'react';
import { translate, translateService } from './utils/translations';
import { useTextToSpeech } from './utils/useTextToSpeech';
import { useSpeechToText } from './utils/useSpeechToText';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  TextInput,
  Image,
  Alert,
  Dimensions,
  Easing,
} from 'react-native';

import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
  
} from 'react-native-safe-area-context';

import {
  Ionicons,
  MaterialCommunityIcons,
 
} from '@expo/vector-icons';
import PlumbingScreen from './screens/Plumbingscreen';
import HomeScreen from './screens/Homescreen';
import PaintingScreen from './screens/Painting';
import Electricianscreen from './screens/Electricianscreen';
import Carpenterscreen from './screens/Carpenterscreen';
import Workerinfo from './screens/Workerinfo';

import Languageselection from './screens/Languageselection';
import Servicerequestscreen from './screens/Servicerequestscreen';
import Calendarscreen from './screens/Calendarscreen';
import VoiceGuidanceButton from './components/VoiceGuidanceButton';

import Splashscreen from './screens/Splashscreen';
import Loginscreen from './screens/Loginscreen';
import Registerscreen from './screens/Registerscreen';
import Onboardingscreen from './screens/Onboardingscreen';
import Welcomescreen from './screens/Welcomescreen';

import Availaiblescreen from './screens/Availaiblescreen';
import Forgotpassscreen from './screens/Forgotpassscreen';
import OtpVerifyResetScreen from './screens/OtpVerifyResetScreen';

import Clientprofilescreen from './screens/Clientprofilescreen';
import Bookingscreen from './screens/Bookingscreen';
import Viewdetails from './screens/Viewdetails';
import Savedservice from './screens/Savedservice';
import Editprofilescreen from './screens/Editprofilescreen';
import Paymentmethodscreen from './screens/Paymentmethodscreen';
import Notificationscreen from './screens/Notificationscreen';
import Settingscreen from './screens/Settingscreen';
import ChatbotScreen from './screens/ChatbotScreen';
import Acscreen from './screens/Acscreen';

import Bookingsummary from './screens/Bookingsummary';
import OrgBookingDetails from './screens/OrgBookingDetails';
import NavigationMapScreen from './screens/NavigationMapScreen';
import TestMapScreen from './screens/TestMapScreen';
import Paymentscreen from './screens/Paymentscreen';
import Trackworker from './screens/Trackworker';
import Coupounscreen from './screens/Coupounscreen';

import Helpsupportscreen from './screens/Helpsupportscreen';
import Aichatbotscreen from './screens/Aichatbotscreen';
import Callsupportscreen from './screens/Callsupportscreen';
import Reportissuescreen from './screens/Reportissuescreen';
import Feedbackscreen from './screens/Feedbackscreen';
import Suggestionscreen from './screens/Suggestionscreen';

import Refferearnscreen from './screens/Refferearnscreen';
import Offerscreen from './screens/Offerscreen';
import Messagescreen from './screens/Messagescreen';
import Chatscreen from './screens/Chatscreen';

import Book from './screens/book';
import Workerprofilescreen from './screens/Workerprofilescreen';
import Bookscreen from './screens/Bookscreen';
import Bookworkerscreen from './screens/Bookworkerscreen';
import MyRequestsScreen from './screens/MyRequestsScreen';
import NotificationService from './services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config/api';


/* =====================================================
   COLORS
===================================================== */

const COLORS = {
  blue: '#49769F',
  darkBlue: '#365C7C',

  dark: '#111827',
  white: '#FFFFFF',

  light: '#F5F8FB',
  lightBlue: '#E8F0F6',
  softBlue: '#F0F6FA',

  border: '#D9E3EC',

  gray: '#64748B',
  lightGray: '#94A3B8',

  green: '#16A34A',
  greenSoft: '#ECFDF5',

  orange: '#EA580C',
  orangeSoft: '#FFF7ED',

  red: '#EF4444',

  blackOverlay: 'rgba(0,0,0,0.42)',
};


/* =====================================================
   WIDTH
===================================================== */

const { width } = Dimensions.get('window');


/* =====================================================
   CATEGORIES
===================================================== */

const categories = [
  {
    id: 1,
    name: 'Construction',
    icon: 'hammer-wrench',
  },
  {
    id: 2,
    name: 'Mason',
    icon: 'wall',
  },
  {
    id: 3,
    name: 'Electrician',
    icon: 'flash',
  },
  {
    id: 4,
    name: 'Plumber',
    icon: 'pipe-wrench',
  },
  {
    id: 5,
    name: 'Carpenter',
    icon: 'hammer',
  },
  {
    id: 6,
    name: 'Painter',
    icon: 'format-paint',
  },
  {
    id: 7,
    name: 'Cleaner',
    icon: 'broom',
  },
  {
    id: 8,
    name: 'AC Technician',
    icon: 'air-conditioner',
  },
  {
    id: 9,
    name: 'Mechanic',
    icon: 'wrench',
  },
  {
    id: 10,
    name: 'Cook',
    icon: 'chef-hat',
  },
  {
    id: 11,
    name: 'Gardener',
    icon: 'flower',
  },
  {
    id: 12,
    name: 'Tile Worker',
    icon: 'checkerboard',
  },
  {
    id: 13,
    name: 'Welder',
    icon: 'fire',
  },
  {
    id: 14,
    name: 'Maintenance Worker',
    icon: 'tools',
  },
  {
    id: 15,
    name: 'Driver',
    icon: 'car',
  },
  {
    id: 16,
    name: 'Loader',
    icon: 'dolly',
  },
  {
    id: 17,
    name: 'Pest Control',
    icon: 'bug',
  },
  {
    id: 18,
    name: 'Security Guard',
    icon: 'shield-account',
  },
  {
    id: 19,
    name: 'Farm Worker',
    icon: 'sprout',
  },
  {
    id: 20,
    name: 'Packer',
    icon: 'package-variant',
  },
  {
    id: 21,
    name: 'Laundry Worker',
    icon: 'washing-machine',
  },
];


/* =====================================================
   SPOTLIGHT
===================================================== */

const spotlightCards = [
  {
    id: 1,
    title: 'A cleaner home, without any hassle',
    subtitle: 'Full home cleaning',
    image:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900',
    screen: 'cleaning',
  },

  {
    id: 2,
    title: 'Electronic repair at your doorstep',
    subtitle: 'TV, AC, fridge & appliance repair',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900',
    screen: 'electrician',
  },

  {
    id: 3,
    title: 'Give your walls a fresh new look',
    subtitle: 'Professional painting service',
    image:
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=900',
    screen: 'painting',
  },

  {
    id: 4,
    title: 'Stay cool with expert AC service',
    subtitle: 'AC repair & maintenance',
    image:
      'https://images.unsplash.com/photo-1631545806609-1c7c5f3a7d9d?w=900',
    screen: 'acRepair',
  },
];


/* =====================================================
   ANIMATED PRESSABLE
===================================================== */

function AnimatedPressable({
  children,
  onPress,
  style,
}) {
  const scale = useRef(
    new Animated.Value(1)
  ).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 30,
      bounciness: 3,
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
      style={[
        {
          transform: [{ scale }],
        },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}


/* =====================================================
   STATUS HELPERS
===================================================== */

const getStatusLabel = (status, language) => {
  switch (status) {
    case 'requested':
      return translate(language, 'statusRequested');

    case 'scheduled':
      return translate(language, 'statusScheduled');

    case 'inProgress':
      return translate(language, 'inProgress');

    case 'paymentPending':
      return translate(language, 'paymentPending');

    case 'completed':
      return translate(language, 'completed');

    default:
      return translate(language, 'statusBooking');
  }
};


const getStatusIcon = (status) => {
  switch (status) {
    case 'requested':
      return 'paper-plane-outline';

    case 'scheduled':
      return 'calendar-outline';

    case 'inProgress':
      return 'hammer-outline';

    case 'paymentPending':
      return 'card-outline';

    case 'completed':
      return 'checkmark-circle-outline';

    default:
      return 'briefcase-outline';
  }
};


const getBookingServiceIcon = (service) => {
  const value =
    String(service || '').toLowerCase();

  if (value.includes('plumb')) {
    return 'water-outline';
  }

  if (value.includes('paint')) {
    return 'color-palette-outline';
  }

  if (value.includes('clean')) {
    return 'sparkles-outline';
  }

  if (value.includes('electric')) {
    return 'flash-outline';
  }

  if (value.includes('carpent')) {
    return 'hammer-outline';
  }

  if (value.includes('ac')) {
    return 'snow-outline';
  }

  return 'construct-outline';
};


/* =====================================================
   DATE FORMATTER
   IMPORTANT FOR CALENDAR
===================================================== */

const formatBookingDate = (dateValue) => {
  if (!dateValue) {
    return '';
  }

  /* Date object */

  if (dateValue instanceof Date) {
    return (
      `${dateValue.getFullYear()}-` +
      `${String(
        dateValue.getMonth() + 1
      ).padStart(2, '0')}-` +
      `${String(
        dateValue.getDate()
      ).padStart(2, '0')}`
    );
  }

  const value = String(
    dateValue
  ).trim();

  /* Already YYYY-MM-DD */

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return value;
  }

  /* DD/MM/YYYY */

  const slashParts =
    value.split('/');

  if (
    slashParts.length === 3
  ) {
    const day =
      parseInt(
        slashParts[0],
        10
      );

    const month =
      parseInt(
        slashParts[1],
        10
      );

    const year =
      parseInt(
        slashParts[2],
        10
      );

    if (
      !isNaN(day) &&
      !isNaN(month) &&
      !isNaN(year)
    ) {
      return (
        `${year}-${String(month).padStart(2, '0')}-` +
        `${String(day).padStart(2, '0')}`
      );
    }
  }

  /* Standard JS date */

  const parsed =
    new Date(value);

  if (
    !isNaN(
      parsed.getTime()
    )
  ) {
    return (
      `${parsed.getFullYear()}-` +
      `${String(
        parsed.getMonth() + 1
      ).padStart(2, '0')}-` +
      `${String(
        parsed.getDate()
      ).padStart(2, '0')}`
    );
  }

  return value;
};


/* =====================================================
   HOME BOOKING CARD
===================================================== */

function HomeBookingCard({
  booking,
  onPress,
  language,
}) {
  const serviceName =
    translateService(booking?.service, language) ||
    translate(language, 'homeService');

  const workerName =
    booking?.workerName ||
    booking?.worker?.name ||
    translate(language, 'worker');

  const status =
    booking?.status || 'requested';

  const serviceIcon =
    getBookingServiceIcon(
      booking?.service || serviceName
    );

  let badgeBackground =
    '#EFF6FF';

  let badgeColor =
    COLORS.blue;

  if (status === 'scheduled') {
    badgeBackground = COLORS.softBlue;
    badgeColor = COLORS.blue;
  }

  if (status === 'inProgress') {
    badgeBackground = COLORS.greenSoft;
    badgeColor = COLORS.green;
  }

  if (status === 'paymentPending') {
    badgeBackground =
      COLORS.orangeSoft;
    badgeColor = COLORS.orange;
  }

  if (status === 'completed') {
    badgeBackground =
      COLORS.greenSoft;
    badgeColor = COLORS.green;
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.homeBookingCard,
        pressed &&
          styles.homeBookingCardPressed,
      ]}
      onPress={onPress}
    >

      <View
        style={
          styles.homeBookingIcon
        }
      >
        <Ionicons
          name={serviceIcon}
          size={23}
          color={COLORS.blue}
        />
      </View>

      <View
        style={
          styles.homeBookingMiddle
        }
      >
        <Text
          style={
            styles.homeBookingService
          }
          numberOfLines={1}
        >
          {serviceName}
        </Text>

        <Text
          style={
            styles.homeBookingWorker
          }
          numberOfLines={1}
        >
          {workerName}
        </Text>

        <View
          style={
            styles.homeBookingMeta
          }
        >
          <Ionicons
            name="calendar-outline"
            size={12}
            color={COLORS.lightGray}
          />

          <Text
            style={
              styles.homeBookingMetaText
            }
          >
            {booking?.date || translate(language, 'noDate')}
          </Text>

          <Ionicons
            name="time-outline"
            size={12}
            color={COLORS.lightGray}
            style={{
              marginLeft: 8,
            }}
          />

          <Text
            style={
              styles.homeBookingMetaText
            }
          >
            {booking?.time || translate(language, 'noTime')}
          </Text>
        </View>
      </View>

      <View
        style={
          styles.homeBookingRight
        }
      >
        <View
          style={[
            styles.homeStatusBadge,
            {
              backgroundColor:
                badgeBackground,
            },
          ]}
        >
          <Ionicons
            name={getStatusIcon(status)}
            size={11}
            color={badgeColor}
          />

          <Text
            style={[
              styles.homeStatusText,
              {
                color: badgeColor,
              },
            ]}
          >
            {getStatusLabel(status, language)}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={17}
          color={COLORS.lightGray}
        />
      </View>

    </Pressable>
  );
}


/* =====================================================
   HOME STATUS SECTION
===================================================== */

function HomeBookingSection({
  title,
  subtitle,
  icon,
  bookings,
  onBookingPress,
  language,
}) {
   
  if (!bookings.length) {
    return null;
  }

  return (
    <View
      style={
        styles.homeStatusSection
      }
    >

      <View
        style={
          styles.homeStatusHeader
        }
      >

        <View
          style={
            styles.homeStatusHeaderLeft
          }
        >

          <View
            style={
              styles.homeStatusSectionIcon
            }
          >
            <Ionicons
              name={icon}
              size={18}
              color={COLORS.blue}
            />
          </View>

          <View>
            <Text
              style={
                styles.homeStatusTitle
              }
            >
              {title}
            </Text>

            <Text
              style={
                styles.homeStatusSubtitle
              }
            >
              {subtitle}
            </Text>
          </View>

        </View>

        <View
          style={
            styles.homeStatusCount
          }
        >
          <Text
            style={
              styles.homeStatusCountText
            }
          >
            {bookings.length}
          </Text>
        </View>

      </View>


      {bookings
        .slice(0, 3)
        .map((booking) => (
          <HomeBookingCard
            key={`home-${booking.id}`}
            booking={booking}
            language={language}
            onPress={() =>
              onBookingPress(
                booking
              )
            }
          />
        ))}

    </View>
  );
}


/* =====================================================
   APP
===================================================== */

export default function App() {


  /* ===================================================
     NAVIGATION
  =================================================== */
const go = (screenName) => {
  setScreen(screenName);
};
  const [
    screen,
    setScreen,
  ] = useState('splash');

  const [
    language,
    setLanguage,
  ] = useState("english");

  // Track target screen resolved during splash check
  const initialRouteRef = useRef(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          const savedLanguage = await AsyncStorage.getItem('selected_language');
          if (savedLanguage) {
            setLanguage(savedLanguage);
            console.log('[SESSION] Restored client language:', savedLanguage);
          }
          console.log('[SESSION] Valid client access token found. Target screen: home');
          initialRouteRef.current = 'home';
        } else {
          console.log('[SESSION] No valid token found (logged out or fresh). Target screen: language');
          initialRouteRef.current = 'language';
        }
      } catch (err) {
        console.error('[SESSION] Error checking client session:', err);
        initialRouteRef.current = 'language';
      }
    };

    restoreSession();
  }, []);

  const handleLogout = async () => {
    try {
      notificationsInitializedRef.current = false;
      NotificationService.reset();
      await NotificationService.unregisterPushToken();

      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('user_data');
      await AsyncStorage.removeItem('@sahayak:just_logged_in');
      await AsyncStorage.removeItem('selected_language');
      await AsyncStorage.removeItem('has_seen_onboarding');
      initialRouteRef.current = 'language';
      console.log('[OK] Client logged out and session cleared');
    } catch (error) {
      console.error('[FAIL] Logout error:', error);
    } finally {
      setScreen('language');
    }
  };

  const { speak, stop } = useTextToSpeech(language);

  const {
    start: startSTT,
    stop: stopSTT,
    reset: resetSTT,
    listening: sttListening,
    transcript: sttTranscript,
  } = useSpeechToText(language);

  const homeGreetingSpokenRef = useRef(false);

  useEffect(() => {
    if (screen === 'home') {
      if (!homeGreetingSpokenRef.current) {
        homeGreetingSpokenRef.current = true;
        speak(
          translate(language, 'welcomeToSahayak') +
            ' ' +
            translate(language, 'homeGuidancePrompt')
        );
      }
    } else {
      stop();
    }
  }, [screen, language, speak, stop]);

  const [
    selectedRequestId,
    setSelectedRequestId,
  ] = useState(null);

  const [
    previousScreen,
    setPreviousScreen,
  ] = useState(null);

  const [
    navigationParams,
    setNavigationParams,
  ] = useState(null);

  useEffect(() => {
    const { setNavigator } = require('./navigation/NavigationService');
    setNavigator((targetScreen, data) => {
      if (data && data.requestId) {
        setSelectedRequestId(data.requestId);
      }
      setScreen(targetScreen);
    });
  }, [screen]);

  const [
    resetPhone,
    setResetPhone,
  ] = useState(''); // For password reset flow

  /* ===================================================
     CHATBOT FLOATING BUTTON ANIMATION
  =================================================== */

/* ===================================================
   CHATBOT MOVEMENT ANIMATION
=================================================== */

const chatbotMove = useRef(
  new Animated.Value(0)
).current;

useEffect(() => {
  const animation = Animated.loop(
    Animated.sequence([
      Animated.timing(chatbotMove, {
        toValue: -6,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.timing(chatbotMove, {
        toValue: 0,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  );

  animation.start();

  return () => {
    animation.stop();
  };
}, [chatbotMove]);
  /* ===================================================
     DRAWER
  =================================================== */

  const [
    drawerOpen,
    setDrawerOpen,
  ] = useState(false);


  /* ===================================================
     SEARCH
  =================================================== */

  const [
    searchVisible,
    setSearchVisible,
  ] = useState(false);


  const [
    searchText,
    setSearchText,
  ] = useState('');

  /* ===================================================
     VOICE NAVIGATION (Voice Assistant)
     Called by the central mic (speech-to-text result).
  =================================================== */

  const voiceServiceList = [
    'Construction',
    'Mason',
    'Electrician',
    'Plumber',
    'Carpenter',
    'Painter',
    'Cleaner',
    'AC Technician',
    'Mechanic',
    'Cook',
    'Gardener',
    'Tile Worker',
    'Welder',
    'Maintenance Worker',
    'Driver',
    'Loader',
    'Pest Control',
    'Security Guard',
    'Farm Worker',
    'Packer',
    'Laundry Worker',
  ];

  const voiceScreenMap = {
    home: 'home',
    bookings: 'bookings',
    booking: 'bookings',
    history: 'bookings',
    calendar: 'calendar',
    schedule: 'calendar',
    offers: 'offers',
    subscription: 'offers',
    profile: 'profile',
    account: 'profile',
    settings: 'settings',
    help: 'helpSupport',
    'help support': 'helpSupport',
    support: 'helpSupport',
    messages: 'messages',
    message: 'messages',
    chats: 'messages',
    inbox: 'messages',
    requests: 'myRequests',
    'my requests': 'myRequests',
    notifications: 'notifications',
    saved: 'saved',
    favorites: 'saved',
  };

  const handleVoiceNavigate = (spokenText) => {

    const text = String(spokenText || '')
      .toLowerCase()
      .trim();

    if (!text) {
      return;
    }

    const serviceMatch = voiceServiceList.find(
      (service) =>
        text.includes(
          service.toLowerCase()
        )
    );

    if (serviceMatch) {

      setSelectedService(
        serviceMatch
      );

      setSearchVisible(false);
      setSearchText('');
      setScreen('serviceRequest');

      return;
    }

    const screenEntry = Object.entries(
      voiceScreenMap
    ).find(
      ([key]) =>
        text.includes(key) ||
        text.replace(/\s+/g, '')
          .includes(
            key.replace(/\s+/g, '')
          )
    );

    if (screenEntry) {

      setScreen(
        screenEntry[1]
      );

      return;
    }

    setSearchText(
      String(spokenText)
    );

    setSearchVisible(true);
    setScreen('home');

  };

  useEffect(() => {
    if (screen !== 'home') {
      return;
    }

    if (!sttTranscript || sttListening) {
      return;
    }

    handleVoiceNavigate(sttTranscript);
    resetSTT();
  }, [screen, sttListening, sttTranscript, handleVoiceNavigate, resetSTT]);

  useEffect(() => {
    if (screen !== 'home') {
      stopSTT();
    }
  }, [screen, stopSTT]);


  /* ===================================================
     BOOKING DATA
  =================================================== */

  const [
    bookings,
    setBookings,
  ] = useState([]);
  
  const [loadingBookings, setLoadingBookings] = useState(false);
  

  const [
    currentBooking,
    setCurrentBooking,
  ] = useState(null);


  const [
    selectedBooking,
    setSelectedBooking,
  ] = useState(null);


  /* ===================================================
     WORKER
  =================================================== */

  const [
    selectedWorker,
    setSelectedWorker,
  ] = useState(null);


  const [
    serviceRequest,
    setServiceRequest,
  ] = useState(null);


  const [
    selectedService,
    setSelectedService,
  ] = useState('');


  /* ===================================================
     OTHER STATES
  =================================================== */

  const [
    theme,
    setTheme,
  ] = useState('light');


  const [
    bookingAmount,
    setBookingAmount,
  ] = useState(799);


  const [
    selectedConversation,
    setSelectedConversation,
  ] = useState(null);

  const [scheduledRequests, setScheduledRequests] = useState([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);

  // Fetch scheduled work requests for client home page
  useEffect(() => {
    if (screen === 'home') {
      fetchScheduledRequests();
    }
  }, [screen]);

  /* ===================================================
     NOTIFICATION SERVICE INITIALIZATION
     Auto-initialize once when user reaches home screen (logged in)
  =================================================== */
  const notificationsInitializedRef = useRef(false);

  useEffect(() => {
    // Only initialize once per session or on login; never on routine screen navigation
    if (notificationsInitializedRef.current) return;
    if (screen !== 'home') return;

    const initNotifications = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');

        if (token) {
          notificationsInitializedRef.current = true;
          const justLoggedIn = await AsyncStorage.getItem('@sahayak:just_logged_in');
          const isLogin = justLoggedIn === 'true';

          if (isLogin) {
            await AsyncStorage.removeItem('@sahayak:just_logged_in');
            console.log('[NOTIF] Initializing NotificationService with welcome notification on login...');
          } else {
            console.log('[NOTIF] Initializing NotificationService for existing session...');
          }

          await NotificationService.initialize({ isLogin });
          console.log(`[OK] NotificationService auto-initialized (isLogin=${isLogin})`);
        }
      } catch (error) {
        console.log('[WARN] NotificationService init skipped:', error.message);
      }
    };

    initNotifications();
  }, [screen]);

  const getBookingSortTime = (item) => {
    if (!item) return 0;
    if (item.created_at) {
      const t = new Date(item.created_at).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    if (item.rawRequest?.created_at) {
      const t = new Date(item.rawRequest.created_at).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    const dStr = item.required_date || item.date || item.rawRequest?.required_date;
    if (dStr) {
      if (dStr instanceof Date) {
        const t = dStr.getTime();
        if (!isNaN(t) && t > 0) return t;
      } else if (typeof dStr === 'string') {
        const tStr = item.required_time || item.time || '';
        if (tStr && typeof tStr === 'string' && tStr !== 'TBD' && tStr.includes(':')) {
          const dt = new Date(`${dStr}T${tStr}`).getTime();
          if (!isNaN(dt) && dt > 0) return dt;
        }
        const d = new Date(dStr).getTime();
        if (!isNaN(d) && d > 0) return d;
      }
    }
    if (typeof item.id === 'number') return item.id;
    if (typeof item.id === 'string' && item.id.startsWith('org-')) {
      const num = parseInt(item.id.replace('org-', ''), 10);
      if (!isNaN(num)) return num;
    }
    return 0;
  };

  // SWR: Load cached calendar bookings on mount
  useEffect(() => {
    let isMounted = true;
    const loadCache = async () => {
      try {
        const cached = await AsyncStorage.getItem('@cache_client_calendar_bookings');
        if (cached && isMounted) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.sort((a, b) => getBookingSortTime(b) - getBookingSortTime(a));
            setBookings(parsed);
          }
        }
      } catch (e) {}
    };
    loadCache();
    return () => { isMounted = false; };
  }, []);

  // Fetch all work requests for calendar and bookings when opened
  useEffect(() => {
    if (screen === 'calendar' || screen === 'bookings' || screen === 'home') {
      fetchAllWorkRequestsForCalendar(bookings.length > 0);
    }
  }, [screen]);

  const fetchScheduledRequests = async () => {
    try {
      setLoadingScheduled(true);
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('access_token');
      
      if (token) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/v1/jobs/work-requests/client/?status=SCHEDULED`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          const data = await response.json();
          if (data.success) {
            setScheduledRequests(data.work_requests || []);
          }
        } catch (fetchError) {
          console.log('[FAIL] Error fetching scheduled:', fetchError.message);
        }
      }
    } catch (error) {
      console.log('Error fetching scheduled requests:', error);
    } finally {
      setLoadingScheduled(false);
    }
  };

  const fetchAllWorkRequestsForCalendar = async (silent = false) => {
    try {
      if (!silent && bookings.length === 0) {
        setLoadingBookings(true);
      }
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('access_token');
      
      console.log('[CAL] Client Calendar: Fetching all work requests...');
      
      if (token) {
        try {
          // Fetch BOTH APIs in PARALLEL for faster loading
          console.log('[API] Fetching worker & organization requests in parallel...');
          const [workerResponse, orgResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/api/v1/jobs/work-requests/client/`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }),
            fetch(`${API_BASE_URL}/api/v1/org/requests/client/`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            })
          ]);
          
          const workerData = await workerResponse.json();
          const orgData = await orgResponse.json();
          
          console.log('[CAL] Individual worker requests:', workerData);
          console.log('[CAL] Organization requests:', orgData);
          
          let allBookings = [];
          
          // Convert individual worker requests to booking format
          if (workerData.success && workerData.work_requests) {
            const workerBookings = workerData.work_requests.map(request => {
              const totalAmount =
                parseFloat(request.total_amount) > 0
                  ? parseFloat(request.total_amount)
                  : parseFloat(request.estimated_budget) || 0;
              
              return {
                ...request,
                id: request.id,
                rawRequest: request,
                type: 'individual', // Mark as individual worker request
                service: request.service_category,
                workerName: request.worker_name || 'Pending Assignment',
                date: request.required_date,
                time: request.required_time || 'TBD',
                price: totalAmount > 0 ? `Rs. ${totalAmount}` : 'TBD',
                status: (() => {
                  const s = (request.status || 'requested').toLowerCase();
                  if (s === 'in_progress') return 'inProgress';
                  if (s === 'payment_pending') return 'paymentPending';
                  return s;
                })(),
                address: request.work_address,
                workerPhone: request.worker_phone,
                description: request.description || '',
                totalAmount: totalAmount,
                paymentMode: 'CASH',
                paymentMethod: 'Cash Payment',
                created_at: request.created_at,
              };
            });
            allBookings = [...allBookings, ...workerBookings];
            console.log('[CAL] Added', workerBookings.length, 'individual worker bookings');
          }
          
          // Convert organization requests to booking format
          if (orgData.success && orgData.requests) {
            const orgBookings = orgData.requests.map(request => {
              const totalAmount = parseFloat(request.total_amount) || parseFloat(request.service_charge) || 0;
              const paymentMode = request.payment_mode || 'CASH';
              const paymentMethod = request.payment_mode ? `${request.payment_mode} Payment` : 'Cash Payment';
              return {
                ...request,
                id: `org-${request.id}`, // Prefix with 'org-' to avoid ID conflicts
                rawRequest: request,
                type: 'organization', // Mark as organization request
                service: request.work_type,
                workerName: request.org_name, // Show organization name
                date: request.required_date || (request.created_at ? request.created_at.split('T')[0] : ''),
                time: request.required_time || 'TBD',
                price: totalAmount > 0 ? `Rs. ${totalAmount}` : 'TBD',
                status: request.status === 'accepted' ? 'scheduled' : request.status,
                address: request.work_location || 'Location TBD',
                workerPhone: request.client_contact, // Store client's own phone
                description: request.work_description || '',
                totalAmount: totalAmount,
                paymentMode: paymentMode,
                paymentMethod: paymentMethod,
                orgName: request.org_name,
                assignmentCount: request.assignment_count || 0,
                created_at: request.created_at,
              };
            });
            allBookings = [...allBookings, ...orgBookings];
            console.log('[CAL] Added', orgBookings.length, 'organization bookings');
          }
          
          // Sort all bookings chronologically by recent date first (standard booking order)
          allBookings.sort((a, b) => getBookingSortTime(b) - getBookingSortTime(a));
          console.log('[CAL] Total bookings (sorted recent first):', allBookings.length);
          setBookings(allBookings);
          try {
            AsyncStorage.setItem('@cache_client_calendar_bookings', JSON.stringify(allBookings));
          } catch (e) {}
          
        } catch (fetchError) {
          console.log('[FAIL] Fetch error:', fetchError.name, fetchError.message);
        }
      } else {
        console.log('[CAL] No auth token found');
      }
    } catch (error) {
      console.log('[FAIL] Error fetching calendar work requests:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  

  const createBooking = ({
    worker,
    serviceRequest,
  }) => {

    const bookingDate =
      formatBookingDate(
        serviceRequest?.date
      );

    let bookingTime =
      serviceRequest?.time;

    if (
      serviceRequest?.timeText
    ) {
      bookingTime =
        serviceRequest.timeText;
    } else if (
      serviceRequest?.time instanceof Date
    ) {
      bookingTime =
        serviceRequest.time.toLocaleTimeString(
          'en-IN',
          {
            hour: '2-digit',
            minute: '2-digit',
          }
        );
    }

    const newBooking = {

      id:
        'BOOK-' +
        Date.now(),

      worker:
        worker || null,

      workerId:
        worker?.id ||
        null,

      workerName:
        worker?.name ||
        'Worker',

      workerPhoto:
        worker?.photo ||
        null,

      workerRating:
        worker?.rating ||
        0,

      service:
        serviceRequest?.service ||
        worker?.service ||
        'Home Service',

      customerName:
        serviceRequest?.name ||
        '',

      /* IMPORTANT FOR CALENDAR */

      date:
        bookingDate,

      time:
        bookingTime || '',

      address:
        serviceRequest?.address ||
        '',

      latitude:
        serviceRequest?.latitude ||
        null,

      longitude:
        serviceRequest?.longitude ||
        null,

      description:
        serviceRequest?.description ||
        '',

      image:
        serviceRequest?.image ||
        null,

      /*
        REAL INITIAL STATUS
      */

      status:
        'requested',

      paymentStatus:
        'unpaid',

      paymentMethod:
        null,

      totalAmount:
        null,

      createdAt:
        new Date().toISOString(),

      acceptedAt:
        null,

      completedAt:
        null,

      paidAt:
        null,
    };


    console.log(
      'NEW CLIENT BOOKING:',
      newBooking
    );


    setBookings(
      previousBookings => [
        newBooking,
        ...previousBookings,
      ].sort((a, b) => getBookingSortTime(b) - getBookingSortTime(a))
    );


    setCurrentBooking(
      newBooking
    );


    setSelectedBooking(
      newBooking
    );


    return newBooking;
  };


  /* ===================================================
     LIVE BOOKING CATEGORIES
  =================================================== */

  const requestedBookings =
    bookings.filter(
      booking =>
        booking.status ===
        'requested'
    );


  const scheduledBookings =
    bookings.filter(
      booking =>
        booking.status ===
        'scheduled'
    );


  const inProgressBookings =
    bookings.filter(
      booking =>
        booking.status ===
        'inProgress'
    );


  const paymentPendingBookings =
    bookings.filter(
      booking =>
        booking.status ===
        'paymentPending'
    );


  const completedBookings =
    bookings.filter(
      booking =>
        booking.status ===
        'completed'
    );


  /* ===================================================
     HOME ANIMATIONS
  =================================================== */

  const homeFade =
    useRef(
      new Animated.Value(0)
    ).current;

  const homeSlide =
    useRef(
      new Animated.Value(25)
    ).current;

  const headerAnimation =
    useRef(
      new Animated.Value(0)
    ).current;

  const searchAnimation =
    useRef(
      new Animated.Value(0)
    ).current;

  const offerAnimation =
    useRef(
      new Animated.Value(0)
    ).current;

  const categoryAnimation =
    useRef(
      categories.map(
        () =>
          new Animated.Value(0)
      )
    ).current;

  const spotlightAnimation =
    useRef(
      spotlightCards.map(
        () =>
          new Animated.Value(0)
      )
    ).current;

  const referAnimation =
    useRef(
      new Animated.Value(0)
    ).current;


  /* ===================================================
     DRAWER ANIMATIONS
  =================================================== */

  const drawerSlide =
    useRef(
      new Animated.Value(-300)
    ).current;

  const drawerBackdrop =
    useRef(
      new Animated.Value(0)
    ).current;


  /* ===================================================
     SEARCH ANIMATION
  =================================================== */

  useEffect(() => {

    if (searchVisible) {

      searchAnimation.setValue(0);

      Animated.timing(
        searchAnimation,
        {
          toValue: 1,
          duration: 280,
          easing: Easing.out(
            Easing.ease
          ),
          useNativeDriver: true,
        }
      ).start();

    }

  }, [searchVisible]);

  /* ===================================================
     DRAWER OPEN
  =================================================== */

  useEffect(() => {

    if (drawerOpen) {

      drawerSlide.setValue(-300);
      drawerBackdrop.setValue(0);

      Animated.parallel([

        Animated.timing(
          drawerSlide,
          {
            toValue: 0,
            duration: 330,
            easing: Easing.out(
              Easing.cubic
            ),
            useNativeDriver: true,
          }
        ),

        Animated.timing(
          drawerBackdrop,
          {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }
        ),

      ]).start();

    }

  }, [drawerOpen]);


  /* ===================================================
     CLOSE DRAWER
  =================================================== */

  const closeDrawer = () => {

    Animated.parallel([

      Animated.timing(
        drawerSlide,
        {
          toValue: -300,
          duration: 250,
          easing: Easing.in(
            Easing.cubic
          ),
          useNativeDriver: true,
        }
      ),

      Animated.timing(
        drawerBackdrop,
        {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }
      ),

    ]).start(() => {
      setDrawerOpen(false);
    });

  };


  /* ===================================================
     DRAWER NAVIGATION
  =================================================== */

  const navigateFromDrawer = (
    targetScreen
  ) => {

    closeDrawer();

    setTimeout(() => {
      setScreen(
        targetScreen
      );
    }, 260);

  };


  /* ===================================================
     HOME ANIMATION
  =================================================== */

  useEffect(() => {

    if (
      screen !== 'home'
    ) {
      return;
    }

    homeFade.setValue(0);
    homeSlide.setValue(25);

    headerAnimation.setValue(0);
    offerAnimation.setValue(0);
    referAnimation.setValue(0);

    categoryAnimation.forEach(
      animation =>
        animation.setValue(0)
    );

    spotlightAnimation.forEach(
      animation =>
        animation.setValue(0)
    );


    Animated.parallel([

      Animated.timing(
        homeFade,
        {
          toValue: 1,
          duration: 450,
          easing: Easing.out(
            Easing.ease
          ),
          useNativeDriver: true,
        }
      ),

      Animated.timing(
        homeSlide,
        {
          toValue: 0,
          duration: 500,
          easing: Easing.out(
            Easing.cubic
          ),
          useNativeDriver: true,
        }
      ),

      Animated.timing(
        headerAnimation,
        {
          toValue: 1,
          duration: 400,
          delay: 80,
          useNativeDriver: true,
        }
      ),

      Animated.timing(
        offerAnimation,
        {
          toValue: 1,
          duration: 450,
          delay: 180,
          useNativeDriver: true,
        }
      ),

      Animated.timing(
        referAnimation,
        {
          toValue: 1,
          duration: 450,
          delay: 600,
          useNativeDriver: true,
        }
      ),

    ]).start();


    Animated.stagger(
      70,
      categoryAnimation.map(
        animation =>
          Animated.timing(
            animation,
            {
              toValue: 1,
              duration: 350,
              useNativeDriver: true,
            }
          )
      )
    ).start();


    Animated.stagger(
      100,
      spotlightAnimation.map(
        animation =>
          Animated.timing(
            animation,
            {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }
          )
      )
    ).start();

  }, [screen]);


  /* ===================================================
     ANIMATION STYLE
  =================================================== */

  const getFadeSlideStyle = (
    animation,
    distance = 20
  ) => ({
    opacity: animation,

    transform: [
      {
        translateY:
          animation.interpolate({
            inputRange: [0, 1],
            outputRange: [
              distance,
              0,
            ],
          }),
      },
    ],
  });


  /* ===================================================
     OPEN BOOKING FROM HOME
  =================================================== */

  const openBookingFromHome = (
    booking
  ) => {

    console.log('[HOME] Home - opening booking:', booking);

    setSelectedBooking(
      booking
    );

    // Check if it's an organization booking
    if (booking.type === 'organization' || booking.id?.toString().startsWith('org-')) {
      console.log('[ORG] Opening organization booking details from home');
      setScreen('orgBookingDetails');
    } else {
      console.log('[USER] Opening bookings page');
      setScreen('bookings');
    }
  };


  /* ===================================================
     SPLASH
  =================================================== */

  if (
    screen === 'splash'
  ) {
    return (
      <Splashscreen
        onFinish={async () => {
          let target = initialRouteRef.current;
          if (!target) {
            try {
              const token = await AsyncStorage.getItem('access_token');
              target = token ? 'home' : 'language';
            } catch (e) {
              target = 'language';
            }
          }
          console.log('[SESSION] Client splash finished, navigating to:', target);
          setScreen(target);
        }}
      />
    );
  }


  /* ===================================================
     LANGUAGE
  =================================================== */

  if (
    screen === 'language'
  ) {
    return (
      <Languageselection

        onBack={() =>
          setScreen(
            'splash'
          )
        }

        onContinue={
          async selectedLanguage => {
            setLanguage(selectedLanguage);
            try {
              await AsyncStorage.setItem('selected_language', selectedLanguage);
            } catch (e) {}

            console.log(
              'Selected language:',
              selectedLanguage
            );

            setScreen(
              'onboarding'
            );
          }
        }

      />
    );
  }


  /* ===================================================
     ONBOARDING
  =================================================== */

  if (
    screen === 'onboarding'
  ) {
    return (
      <Onboardingscreen

        onBack={() =>
          setScreen(
            'language'
          )
        }

        onFinish={async () => {
          try {
            await AsyncStorage.setItem('has_seen_onboarding', 'true');
          } catch (e) {}
          setScreen(
            'login'
          );
        }}

        language={language}

      />
    );
  }


  /* ===================================================
     WELCOME
  =================================================== */

  if (
    screen === 'welcome'
  ) {
    return (
      <Welcomescreen

        onNext={() =>
          setScreen(
            'login'
          )
        }

        onBack={() =>
          setScreen(
            'onboarding'
          )
        }

      />
    );
  }


  /* ===================================================
     LOGIN
  =================================================== */

  if (
    screen === 'login'
  ) {
    return (
      <Loginscreen

        onLogin={() =>
          setScreen(
            'home'
          )
        }

        onRegister={() =>
          setScreen(
            'register'
          )
        }

        onForgotPassword={() =>
          setScreen(
            'forgotPassword'
          )
        }

        onVoiceLogin={() =>
          setScreen(
            'home'
          )
        }

        onBack={() =>
          setScreen(
            'welcome'
          )
        }

        language={language}

      />
    );
  }


  /* ===================================================
     REGISTER
  =================================================== */

  if (
    screen === 'register'
  ) {
    return (
      <Registerscreen

        onBack={() =>
          setScreen(
            'login'
          )
        }

        onRegister={() =>
          setScreen(
            'home'
          )
        }

        language={language}

      />
    );
  }


  /* ===================================================
     FORGOT PASSWORD
  =================================================== */

  if (
    screen === 'forgotPassword'
  ) {
    return (
      <Forgotpassscreen

        onBack={() =>
          setScreen(
            'login'
          )
        }

        onSendOTP={(phone) => {
          setResetPhone(phone);
          setScreen('otpVerifyReset');
        }}

      />
    );
  }

  /* ===================================================
     OTP VERIFY & RESET PASSWORD
  =================================================== */

  if (
    screen === 'otpVerifyReset'
  ) {
    return (
      <OtpVerifyResetScreen

        phone={resetPhone}

        onBack={() =>
          setScreen(
            'forgotPassword'
          )
        }

        onSuccess={() => {
          setScreen('login');
          setResetPhone('');
        }}

      />
    );
  }


  /* ===================================================
     SERVICE REQUEST
  =================================================== */

  if (
    screen === 'serviceRequest'
  ) {
    return (
      <Servicerequestscreen

        selectedService={
          selectedService
        }

        language={language}

        onBack={() =>
          setScreen(
            'home'
          )
        }

        onSearchWorker={
          requestData => {

            console.log(
              'SERVICE REQUEST:',
              requestData
            );

            setServiceRequest(
              requestData
            );

            setScreen(
              'availableWorkers'
            );

          }
        }

      />
    );
  }


  /* ===================================================
     AVAILABLE WORKERS
  =================================================== */

  if (
    screen === 'availableWorkers'
  ) {
    return (
      <Availaiblescreen

        selectedService={
          selectedService
        }

        workLocation={serviceRequest}

        language={language}

        onBack={() =>
          setScreen(
            'serviceRequest'
          )
        }

        onViewWorker={
          worker => {

            console.log(
              'Selected worker:',
              worker
            );

            setSelectedWorker(
              worker
            );

            setScreen(
              'workerProfile'
            );

          }
        }

      />
    );
  }


  /* ===================================================
     WORKER PROFILE
  =================================================== */

  if (
    screen === 'workerProfile'
  ) {
    return (
      <Workerprofilescreen

        worker={
          selectedWorker
        }

        service_category={selectedService}

        work_location={serviceRequest?.work_location}

        language={language}

        onBack={() =>
          setScreen(
            'availableWorkers'
          )
        }

        onChooseAnother={() =>
          setScreen(
            'availableWorkers'
          )
        }

        onRequestWorker={
          (worker, serviceCategory, workLocation) => {

            console.log(
              'Selected worker:',
              worker
            );

            console.log(
              'Service category:',
              serviceCategory
            );

            setSelectedWorker(
              worker
            );

            // Update service request with worker info
            if (serviceRequest) {
              setServiceRequest({
                ...serviceRequest,
                worker: worker,
                service: serviceCategory || serviceRequest.service,
                work_location: workLocation || serviceRequest.work_location,
              });
            }

            setScreen(
              'bookScreen'
            );

          }
        }

      />
    );
  }


  /* ===================================================
     BOOK WORKER
  =================================================== */

  if (
    screen === 'bookScreen'
  ) {
    return (
      <Bookworkerscreen
        worker={
          selectedWorker
        }
        serviceRequest={
          serviceRequest
        }
        language={language}
        onBack={() =>
          setScreen(
            'workerProfile'
          )
        }
        onSuccess={() =>
          setScreen(
            'home'
          )
        }
      />
    );
  }


  /* ===================================================
     CALENDAR
  =================================================== */

  if (
    screen === 'calendar'
  ) {
    return (
      <Calendarscreen

        language={language}

        /* IMPORTANT:
           Send LIVE bookings */
        bookings={
          bookings
        }

        loading={loadingBookings}

        onBack={() =>
          setScreen(
            'home'
          )
        }

        /* Tap calendar booking */
        onBookingPress={
          booking => {

            console.log(
              'Calendar booking:',
              booking
            );

            setSelectedBooking(
              booking
            );

            // Check if it's an organization booking
            if (booking.type === 'organization' || booking.id?.toString().startsWith('org-')) {
              console.log('[ORG] Opening organization booking details');
              setScreen('orgBookingDetails');
            } else {
              console.log('[USER] Opening individual booking details');
              setScreen('bookingDetails');
            }

          }
        }

      />
    );
  }


  /* ===================================================
     BOOKINGS
  =================================================== */

  if (
    screen === 'bookings'
  ) {
    return (
      <Bookingscreen

        language={language}

        /* IMPORTANT:
           Send LIVE bookings */
        bookings={
          bookings
        }

        loading={loadingBookings}

        onRefresh={fetchAllWorkRequestsForCalendar}

        onBack={() =>
          setScreen(
            'home'
          )
        }

        onViewDetails={
          booking => {

            console.log('[TASK] Bookings page - viewing details for:', booking);

            setSelectedBooking(
              booking
            );

            // Check if it's an organization booking
            if (booking.type === 'organization' || booking.id?.toString().startsWith('org-')) {
              console.log('[ORG] Opening organization booking details from bookings page');
              setScreen('orgBookingDetails');
            } else {
              // Navigate to booking summary with the booking ID
              setSelectedRequestId(
                booking.id
              );

              setPreviousScreen(
                'bookings'
              );

              setScreen(
                'bookingSummary'
              );
            }

          }
        }

      />
    );
  }


  /* ===================================================
     BOOKING DETAILS
  =================================================== */

  if (
    screen === 'bookingDetails'
  ) {
    return (
      <Viewdetails

        booking={
          selectedBooking
        }

        language={language}

        onBack={() =>
          setScreen(
            'bookings'
          )
        }

      />
    );
  }


  /* ===================================================
     ORGANIZATION BOOKING DETAILS
  =================================================== */

  if (
    screen === 'orgBookingDetails'
  ) {
    return (
      <OrgBookingDetails

        bookingId={
          selectedBooking?.id
        }

        initialBooking={
          selectedBooking?.rawRequest || selectedBooking
        }

        language={language}

        onBack={() => {
          fetchAllWorkRequestsForCalendar();
          setScreen(
            previousScreen || 'bookings'
          );
        }}

        onPaymentSuccess={async () => {
          console.log('[REFRESH] Org payment successful: navigating to bookings and refreshing data...');
          setScreen('bookings');
          await fetchAllWorkRequestsForCalendar();
        }}

      />
    );
  }


  /* ===================================================
     MY REQUESTS (Work Requests)
  =================================================== */

  if (
    screen === 'myRequests'
  ) {
    return (
      <MyRequestsScreen
        language={language}
        navigation={(requestId, requestObj) => {
          setSelectedRequestId(requestId);
          if (requestObj) {
            setSelectedBooking(requestObj);
          }
          setPreviousScreen('myRequests');
          setScreen('bookingSummary');
        }}
        onBack={() =>
          setScreen('home')
        }
      />
    );
  }


  /* ===================================================
     OFFERS
  =================================================== */

  if (
    screen === 'offers'
  ) {
    return (
      <Offerscreen

        onBack={() =>
          setScreen(
            'home'
          )
        }

        onBook={
          offer => {

            if (
              offer.title ===
              'Home Cleaning'
            ) {
              setScreen(
                'cleaning'
              );

            } else if (
              offer.title ===
              'Professional Painting'
            ) {
              setScreen(
                'painting'
              );

            } else if (
              offer.title ===
              'Electrical Services'
            ) {
              setScreen(
                'electrician'
              );

            } else if (
              offer.title ===
              'Plumbing Services'
            ) {
              setScreen(
                'plumbing'
              );

            } else if (
              offer.title ===
              'AC Repair & Service'
            ) {
              setScreen(
                'acRepair'
              );

            } else if (
              offer.title ===
              'Carpenter Services'
            ) {
              setScreen(
                'carpenter'
              );

            } else {
              setScreen(
                'home'
              );
            }

          }
        }

      />
    );
  }


  /* ===================================================
     REFER & EARN
  =================================================== */

  if (
    screen === 'referEarn'
  ) {
    return (
      <Refferearnscreen
        onBack={() =>
          setScreen(
            'home'
          )
        }
      />
    );
  }


  /* ===================================================
     AC
  =================================================== */

  if (
    screen === 'acRepair'
  ) {
    return (
      <Acscreen
        onBack={() =>
          setScreen(
            'home'
          )
        }
      />
    );
  }


  /* ===================================================
     HELP SUPPORT
  =================================================== */

  if (
    screen === 'helpSupport'
  ) {
    return (
      <Helpsupportscreen

        onBack={() =>
          setScreen(
            'home'
          )
        }

        onChatbot={() =>
          setScreen(
            'aiChatbot'
          )
        }

        onCall={() =>
          setScreen(
            'callSupport'
          )
        }

        onReportIssue={() =>
          setScreen(
            'reportIssue'
          )
        }

        onFeedback={() =>
          setScreen(
            'feedback'
          )
        }

        onSuggestions={() =>
          setScreen(
            'suggestions'
          )
        }

      />
    );
  }


  /* ===================================================
     AI CHATBOT
  =================================================== */

  if (
    screen === 'aiChatbot'
  ) {
    return (
      <Aichatbotscreen
        onBack={() =>
          setScreen(
            'helpSupport'
          )
        }
      />
    );
  }


  /* ===================================================
     CALL SUPPORT
  =================================================== */

  if (
    screen === 'callSupport'
  ) {
    return (
      <Callsupportscreen
        onBack={() =>
          setScreen(
            'helpSupport'
          )
        }
      />
    );
  }


  /* ===================================================
     REPORT ISSUE
  =================================================== */

  if (
    screen === 'reportIssue'
  ) {
    return (
      <Reportissuescreen
        onBack={() =>
          setScreen(
            'helpSupport'
          )
        }
      />
    );
  }


  /* ===================================================
     FEEDBACK
  =================================================== */

  if (
    screen === 'feedback'
  ) {
    return (
      <Feedbackscreen
        language={language}
        onBack={() =>
          setScreen(
            'helpSupport'
          )
        }
      />
    );
  }


  /* ===================================================
     SUGGESTIONS
  =================================================== */

  if (
    screen === 'suggestions'
  ) {
    return (
      <Suggestionscreen
        onBack={() =>
          setScreen(
            'helpSupport'
          )
        }
      />
    );
  }


  /* ===================================================
     MESSAGES
  =================================================== */

  if (
    screen === 'messages'
  ) {
    return (
      <Messagescreen

        onBack={() =>
          setScreen(
            'home'
          )
        }

        onOpenChat={
          conversation => {

            setSelectedConversation(
              conversation
            );

            setScreen(
              'chat'
            );

          }
        }

      />
    );
  }


  /* ===================================================
     CHAT
  =================================================== */

  if (
    screen === 'chat'
  ) {
    return (
      <Chatscreen

        conversation={
          selectedConversation
        }

        onBack={() =>
          setScreen(
            'messages'
          )
        }

      />
    );
  }


  /* ===================================================
     NOTIFICATIONS
  =================================================== */

  if (
    screen === 'notifications'
  ) {
    return (
      <Notificationscreen
        onBack={() =>
          setScreen(
            'home'
          )
        }
        onNavigateToJob={(requestId) => {
          setSelectedRequestId(requestId);
          setPreviousScreen('notifications');
          setScreen('bookingSummary');
        }}
      />
    );
  }


  /* ===================================================
     PLUMBING
  =================================================== */

  if (
    screen === 'plumbing'
  ) {
    return (
      <PlumbingScreen

        onBack={() =>
          setScreen(
            'home'
          )
        }

      />
    );
  }


  /* ===================================================
     CLEANING
  =================================================== */

  if (
    screen === 'cleaning'
  ) {
    return (
      <HomeScreen

        onBack={() =>
          setScreen(
            'home'
          )
        }

        language={language}

      />
    );
  }


  /* ===================================================
     PAINTING
  =================================================== */

  if (
    screen === 'painting'
  ) {
    return (
      <PaintingScreen

        onBack={() =>
          setScreen(
            'home'
          )
        }

        onOpenWorker={() =>
          setScreen(
            'workerinfo'
          )
        }

      />
    );
  }


  /* ===================================================
     ELECTRICIAN
  =================================================== */

  if (
    screen === 'electrician'
  ) {
    return (
      <Electricianscreen

        onBack={() =>
          setScreen(
            'home'
          )
        }

      />
    );
  }


  /* ===================================================
     CARPENTER
  =================================================== */

  if (
    screen === 'carpenter'
  ) {
    return (
      <Carpenterscreen

        onBack={() =>
          setScreen(
            'home'
          )
        }

      />
    );
  }


  /* ===================================================
     WORKER INFO
  =================================================== */

  if (
    screen === 'workerinfo'
  ) {
    return (
      <Workerinfo

        onBack={() =>
          setScreen(
            'painting'
          )
        }

        onBook={() =>
          setScreen(
            'bookingSummary'
          )
        }

      />
    );
  }


  if (
    screen === 'bookingSummary'
  ) {
    return (
      <Bookingsummary

        requestId={selectedRequestId}

        initialBooking={
          selectedBooking?.rawRequest || selectedBooking
        }

        language={language}

        onBack={() => {
          // Refresh bookings data when going back
          fetchAllWorkRequestsForCalendar();
          if (previousScreen === 'myRequests') {
            fetchScheduledRequests();
          }
          setScreen(previousScreen || 'bookings');
        }}

        onContinue={(screenOrAmount, params) => {
          // Handle navigation to map screen
          if (screenOrAmount === 'navigationMap' && params) {
            setNavigationParams(params);
            setScreen('navigationMap');
            return;
          }

          // Handle payment amount (legacy)
          setBookingAmount(screenOrAmount || 799);
          setScreen('payment');
        }}

        onPaymentSuccess={async () => {
          // Refresh data after payment and navigate to bookings
          console.log('[REFRESH] Payment successful: navigating to bookings and refreshing data...');
          setScreen('bookings');
          await fetchAllWorkRequestsForCalendar();
          await fetchScheduledRequests();
          console.log('[OK] Bookings refreshed');
        }}

      />
    );
  }


  /* ===================================================
     NAVIGATION MAP
  =================================================== */

  if (screen === 'navigationMap') {
    return (
      <NavigationMapScreen
        route={{ params: navigationParams }}
        navigation={{
          goBack: () => setScreen('bookingSummary'),
        }}
      />
    );
  }

  /* ===================================================
     TEST MAP (DEBUG)
  =================================================== */

  if (screen === 'testMap') {
    return (
      <TestMapScreen
        navigation={{
          goBack: () => setScreen('home'),
        }}
      />
    );
  }

  /* ===================================================
     COUPON
  =================================================== */

  if (
    screen === 'coupon'
  ) {
    return (
      <Coupounscreen

        onBack={() =>
          setScreen(
            'bookingSummary'
          )
        }

        onContinue={
          couponData => {

            console.log(
              'Coupon applied:',
              couponData
            );

            setScreen(
              'payment'
            );

          }
        }

      />
    );
  }


  /* ===================================================
     PAYMENT
  =================================================== */

  if (
    screen === 'payment'
  ) {
    return (
      <Paymentscreen

        total={
          bookingAmount
        }

        onBack={() =>
          setScreen(
            'bookingSummary'
          )
        }

        onCoupon={() =>
          setScreen(
            'coupon'
          )
        }

        onContinue={(
          amount,
          paymentMethod
        ) => {

          console.log(
            'PAYMENT COMPLETED',
            amount,
            paymentMethod
          );

          setBookingAmount(
            amount || 799
          );

          setScreen(
            'bookingConfirmed'
          );

        }}

      />
    );
  }


  /* ===================================================
     BOOKING CONFIRMED
  =================================================== */

  if (
    screen === 'bookingConfirmed'
  ) {
    return (
      <Book

        onTrackWorker={() =>
          setScreen(
            'trackWorker'
          )
        }

        onGoHome={() =>
          setScreen(
            'home'
          )
        }

      />
    );
  }


  /* ===================================================
     TRACK WORKER
  =================================================== */

  if (
    screen === 'trackWorker'
  ) {
    return (
      <Trackworker

        onBack={() =>
          setScreen(
            'bookingConfirmed'
          )
        }

        onHome={() =>
          setScreen(
            'home'
          )
        }

      />
    );
  }


  /* ===================================================
     PAYMENT METHODS
  =================================================== */

  if (
    screen === 'paymentMethods'
  ) {
    return (
      <Paymentmethodscreen

        onBack={() =>
          setScreen(
            'profile'
          )
        }

      />
    );
  }


  /* ===================================================
     EDIT PROFILE
  =================================================== */

  if (
    screen === 'editProfile'
  ) {
    return (
      <Editprofilescreen

        onBack={() =>
          setScreen(
            'profile'
          )
        }

      />
    );
  }


  /* ===================================================
     PROFILE
  =================================================== */

  if (
    screen === 'profile'
  ) {
    return (
      <Clientprofilescreen

        language={language}

        onBack={() =>
          setScreen(
            'home'
          )
        }

        onLogout={handleLogout}

        onSwitchAccount={async () => {
          try {
            notificationsInitializedRef.current = false;
            NotificationService.reset();
            await NotificationService.unregisterPushToken();

            // Clear AsyncStorage
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            await AsyncStorage.removeItem('access_token');
            await AsyncStorage.removeItem('refresh_token');
            await AsyncStorage.removeItem('user_data');
            await AsyncStorage.removeItem('@sahayak:just_logged_in');
            console.log('[OK] Account data cleared for switch');
            
            // Navigate to login
            setScreen('login');
          } catch (error) {
            console.error('[FAIL] Switch account error:', error);
            Alert.alert('Error', 'Failed to switch account. Please try again.');
          }
        }}

        onMyBookings={() =>
          setScreen(
            'bookings'
          )
        }

        onSavedServices={() =>
          setScreen(
            'savedServices'
          )
        }

        onEditProfile={() =>
          setScreen(
            'editProfile'
          )
        }

        onNotifications={() =>
          setScreen(
            'notifications'
          )
        }

        onSettings={() =>
          setScreen(
            'settings'
          )
        }

        onPaymentMethods={() =>
          setScreen(
            'paymentMethods'
          )
        }

        onHelpSupport={() =>
          setScreen(
            'helpSupport'
          )
        }

      />
    );
  }


  /* ===================================================
     SAVED SERVICES
  =================================================== */

  if (
    screen === 'savedServices'
  ) {
    return (
      <Savedservice

        onBack={() =>
          setScreen(
            'profile'
          )
        }

        onServicePress={
          serviceScreen =>
            setScreen(
              serviceScreen
            )
        }

      />
    );
  }

if (
  screen === 'chatbot'
) {
  return (
    <ChatbotScreen
      onBack={() =>
        setScreen(
          'home'
        )
      }
    />
  );
}

  /* ===================================================
     SETTINGS
  =================================================== */

  if (
    screen === 'settings'
  ) {
    return (
      <Settingscreen

        onBack={() =>
          setScreen(
            'profile'
          )
        }

        onLogout={handleLogout}

        onTheme={() =>
          setTheme(
            theme ===
            'light'
              ? 'dark'
              : 'light'
          )
        }

        theme={
          theme
        }

      />
    );
  }


  /* ===================================================
     HOME
  =================================================== */

  return (
    <SafeAreaProvider>
    <SafeAreaView
      style={
        styles.container
      }
    >

      <Animated.View
        style={[
          styles.homeAnimated,
          {
            opacity:
              homeFade,

            transform: [
              {
                translateY:
                  homeSlide,
              },
            ],
          },
        ]}
      >

        <ScrollView
          style={
            styles.homeScroll
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          contentContainerStyle={
            styles.homeContent
          }
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <Animated.View
            style={[
              styles.modernHeader,
              getFadeSlideStyle(
                headerAnimation,
                -10
              ),
            ]}
          >

            <View
              style={
                styles.headerTopRow
              }
            >

              <Pressable
                style={
                  styles.modernMenuButton
                }
                onPress={() =>
                  setDrawerOpen(
                    true
                  )
                }
              >

                <Ionicons
                  name="menu-outline"
                  size={26}
                  color={
                    COLORS.dark
                  }
                />

              </Pressable>


              <View
                style={
                  styles.headerBrand
                }
              >

                <View
                  style={
                    styles.brandIcon
                  }
                >

                  <Ionicons
                    name="home"
                    size={17}
                    color={
                      COLORS.white
                    }
                  />

                </View>


                <Text
                  style={
                    styles.brandText
                  }
                >
                  Sahayak
                </Text>

              </View>

            </View>

          </Animated.View>


          {/* =================================================
              VOICE ASSISTANCE (TTS)
          ================================================= */}

          <View style={styles.homeVoiceGuidanceWrap}>
            <VoiceGuidanceButton
              labeled
              text={translate(language, 'homeVoiceGuidance')}
              language={language}
              title={translate(language, 'voiceAssistance')}
              subtitle={translate(language, 'homeHearHowToUse')}
            />
          </View>


          {/* =================================================
              SEARCH
          ================================================= */}

          <Animated.View
            style={[
              styles.modernSearchWrapper,
              getFadeSlideStyle(
                headerAnimation,
                15
              ),
            ]}
          >

            <AnimatedPressable
              onPress={() =>
                setSearchVisible(
                  true
                )
              }
            >

              <View
                style={
                  styles.modernSearchBar
                }
              >

                <View
                  style={
                    styles.modernSearchIcon
                  }
                >

                  <Ionicons
                    name="search-outline"
                    size={20}
                    color={
                      COLORS.blue
                    }
                  />

                </View>


                <View
                  style={
                    styles.searchPlaceholderContainer
                  }
                >

                  <Text
                    style={
                      styles.searchPlaceholder
                    }
                  >
                    {translate(language, 'homeSearchPlaceholder')}
                  </Text>

                  <Text
                    style={
                      styles.searchSubPlaceholder
                    }
                  >
                    {translate(language, 'homeSearchSubPlaceholder')}
                  </Text>

                </View>


                <Pressable
                  style={
                    styles.modernSearchMic
                  }
                  onPress={() => {
                    resetSTT();
                    startSTT();
                  }}
                >

                  <Ionicons
                    name="mic-outline"
                    size={21}
                    color={
                      COLORS.blue
                    }
                  />

                </Pressable>

              </View>

            </AnimatedPressable>

          </Animated.View>


          {/* =================================================
              SEARCH PANEL
          ================================================= */}

          {searchVisible && (

            <Animated.View
              style={[
                styles.searchPanel,
                {
                  opacity:
                    searchAnimation,

                  transform: [

                    {
                      translateY:
                        searchAnimation.interpolate({
                          inputRange: [
                            0,
                            1,
                          ],
                          outputRange: [
                            -12,
                            0,
                          ],
                        }),
                    },

                    {
                      scale:
                        searchAnimation.interpolate({
                          inputRange: [
                            0,
                            1,
                          ],
                          outputRange: [
                            0.97,
                            1,
                          ],
                        }),
                    },

                  ],
                },
              ]}
            >

              <View
                style={
                  styles.searchInputRow
                }
              >

                <View
                  style={
                    styles.panelSearchIcon
                  }
                >

                  <Ionicons
                    name="search"
                    size={19}
                    color={
                      COLORS.blue
                    }
                  />

                </View>


                <TextInput
                  autoFocus
                  value={
                    searchText
                  }
                  onChangeText={
                    setSearchText
                  }
                  placeholder={translate(language, 'searchServicesPlaceholder')}
                  placeholderTextColor={
                    COLORS.lightGray
                  }
                  style={
                    styles.searchInput
                  }
                />


                <Pressable
                  style={
                    styles.closeSearchButton
                  }
                  onPress={() => {

                    setSearchVisible(
                      false
                    );

                    setSearchText(
                      ''
                    );

                  }}
                >

                  <Ionicons
                    name="close-circle"
                    size={22}
                    color={
                      COLORS.lightGray
                    }
                  />

                </Pressable>

              </View>


              <Text
                style={
                  styles.searchResultTitle
                }
              >
                {
                  searchText.trim()
                    ? translate(language, 'services')
                    : translate(language, 'popularServices')
                }
              </Text>

              {/* Individual Workers Section */}
              <View style={styles.workerTypeSection}>
                <View style={styles.workerTypeSectionHeader}>
                  <Ionicons name="person-outline" size={18} color={COLORS.blue} />
                   <Text style={styles.workerTypeSectionTitle}>{translate(language, 'individualWorkers')}</Text>
                </View>
              </View>

              {[
                {
                  name: 'Construction',
                  icon: 'hammer-wrench',
                },
                {
                  name: 'Mason',
                  icon: 'wall',
                },
                {
                  name: 'Electrician',
                  icon: 'flash',
                },
                {
                  name: 'Plumber',
                  icon: 'pipe-wrench',
                },
                {
                  name: 'Carpenter',
                  icon: 'hammer',
                },
                {
                  name: 'Painter',
                  icon: 'format-paint',
                },
                {
                  name: 'Cleaner',
                  icon: 'broom',
                },
                {
                  name: 'AC Technician',
                  icon: 'air-conditioner',
                },
                {
                  name: 'Mechanic',
                  icon: 'wrench',
                },
                {
                  name: 'Cook',
                  icon: 'chef-hat',
                },
                {
                  name: 'Gardener',
                  icon: 'flower',
                },
                {
                  name: 'Tile Worker',
                  icon: 'checkerboard',
                },
                {
                  name: 'Welder',
                  icon: 'fire',
                },
                {
                  name: 'Maintenance Worker',
                  icon: 'tools',
                },
                {
                  name: 'Driver',
                  icon: 'car',
                },
                {
                  name: 'Loader',
                  icon: 'dolly',
                },
                {
                  name: 'Pest Control',
                  icon: 'bug',
                },
                {
                  name: 'Security Guard',
                  icon: 'shield-account',
                },
                {
                  name: 'Farm Worker',
                  icon: 'sprout',
                },
                {
                  name: 'Packer',
                  icon: 'package-variant',
                },
                {
                  name: 'Laundry Worker',
                  icon: 'washing-machine',
                },
              ]
                .filter(
                  item =>
                    item.name
                      .toLowerCase()
                      .includes(
                        searchText
                          .toLowerCase()
                          .trim()
                      )
                )
                .map(
                  item => (

                    <Pressable
                      key={
                        item.name
                      }
                      style={
                        styles.searchResult
                      }
                      onPress={() => {

                        setSelectedService(
                          item.name
                        );

                        setSearchVisible(
                          false
                        );

                        setSearchText(
                          ''
                        );

                        setScreen(
                          'serviceRequest'
                        );

                      }}
                    >

                      <View
                        style={
                          styles.searchResultIcon
                        }
                      >

                        <MaterialCommunityIcons
                          name={
                            item.icon
                          }
                          size={21}
                          color={
                            COLORS.blue
                          }
                        />

                      </View>


                      <Text
                        style={
                          styles.searchResultText
                        }
                      >
                        {
                          item.name
                        }
                      </Text>


                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={
                          COLORS.lightGray
                        }
                      />

                    </Pressable>

                  )
                )}

              {/* Organization Workers Section */}
              <View style={styles.workerTypeSection}>
                <View style={styles.workerTypeSectionHeader}>
                  <Ionicons name="business-outline" size={18} color={COLORS.blue} />
                   <Text style={styles.workerTypeSectionTitle}>{translate(language, 'organizationWorkers')}</Text>
                </View>
              </View>

              {[
                {
                  name: 'Construction',
                  icon: 'hammer-wrench',
                  isOrg: true,
                },
                {
                  name: 'Plumber',
                  icon: 'pipe-wrench',
                  isOrg: true,
                },
                {
                  name: 'Electrician',
                  icon: 'flash',
                  isOrg: true,
                },
              ]
                .filter(
                  item =>
                    item.name
                      .toLowerCase()
                      .includes(
                        searchText
                          .toLowerCase()
                          .trim()
                      )
                )
                .map(
                  item => (

                    <Pressable
                      key={
                        `org-${item.name}`
                      }
                      style={
                        styles.searchResult
                      }
                      onPress={() => {

                        setSelectedService(
                          item.name
                        );

                        setSearchVisible(
                          false
                        );

                        setSearchText(
                          ''
                        );

                        setScreen(
                          'serviceRequest'
                        );

                      }}
                    >

                      <View
                        style={
                          styles.searchResultIcon
                        }
                      >

                        <MaterialCommunityIcons
                          name={
                            item.icon
                          }
                          size={21}
                          color={
                            COLORS.blue
                          }
                        />

                      </View>


                      <Text
                        style={
                          styles.searchResultText
                        }
                      >
                        {
                          translateService(item.name, language)
                        }
                      </Text>


                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={
                          COLORS.lightGray
                        }
                      />

                    </Pressable>

                  )
                )}


              {searchText.trim() !== '' &&
                ![
                  'Plumbing',
                  'Painting',
                  'Cleaning',
                  'Electrician',
                  'Carpenter',
                  'AC Repair',
                ].some(
                  service =>
                    service
                      .toLowerCase()
                      .includes(
                        searchText
                          .toLowerCase()
                          .trim()
                      )
                ) && (

                  <View
                    style={
                      styles.noSearchResults
                    }
                  >

                    <Ionicons
                      name="search-outline"
                      size={25}
                      color={
                        COLORS.lightGray
                      }
                    />

                    <Text
                      style={
                        styles.noSearchResultsText
                      }
                    >
                      {translate(language, 'noServicesFound')}
                    </Text>

                  </View>

                )}

            </Animated.View>
          )}


          {/* =================================================
              AWAITING WORKER
          ================================================= */}

<HomeBookingSection

             title={translate(language, 'awaitingWorker')}

             subtitle={translate(language, 'waitingForWorker')}

             language={language}

            icon="paper-plane-outline"

            bookings={
              requestedBookings
            }

            onBookingPress={
              openBookingFromHome
            }

          />


          {/* =================================================
              SCHEDULED - NOW USING SEPARATE SECTION BELOW
          ================================================= */}

          {/* Removed duplicate HomeBookingSection - using scheduledRequests section instead */}


          {/* =================================================
              IN PROGRESS
          ================================================= */}

<HomeBookingSection

             title={translate(language, 'inProgress')}

             subtitle={translate(language, 'servicesOngoing')}

             language={language}

            icon="hammer-outline"

            bookings={
              inProgressBookings
            }

            onBookingPress={
              openBookingFromHome
            }

          />


          {/* =================================================
              PAYMENT PENDING
          ================================================= */}

<HomeBookingSection

             title={translate(language, 'paymentPending')}

             subtitle={translate(language, 'completedWorkAwaitingPayment')}

             language={language}

            icon="card-outline"

            bookings={
              paymentPendingBookings
            }

            onBookingPress={
              openBookingFromHome
            }

          />


          {/* =================================================
              COMPLETED
          ================================================= */}

<HomeBookingSection

             title={translate(language, 'completed')}

             subtitle={translate(language, 'yourCompletedServices')}

             language={language}

            icon="checkmark-circle-outline"

            bookings={
              completedBookings
            }

            onBookingPress={
              openBookingFromHome
            }

          />


          {/* =================================================
              SPECIAL OFFERS
          ================================================= */}

          <Animated.View
            style={[
              styles.sectionContainer,
              getFadeSlideStyle(
                offerAnimation,
                25
              ),
            ]}
          >

            <View
              style={
                styles.sectionHeader
              }
            >

              <View
                style={
                  styles.sectionTitleRow
                }
              >

                <View
                  style={
                    styles.sectionAccent
                  }
                />

                <Text
                  style={
                    styles.sectionTitleSmall
                  }
                >
                  {translate(language, 'specialOffers')}
                </Text>

              </View>


              <Pressable
                onPress={() =>
                  setScreen(
                    'offers'
                  )
                }
              >

                <Text
                  style={
                    styles.seeAll
                  }
                >
                  {translate(language, 'seeAll')}
                </Text>

              </Pressable>

            </View>


            <AnimatedPressable
              onPress={() =>
                setScreen(
                  'offers'
                )
              }
            >

              <View
                style={
                  styles.offerCard
                }
              >

                <View
                  style={
                    styles.offerContent
                  }
                >

                  <View
                    style={
                      styles.offerBadge
                    }
                  >

                    <Ionicons
                      name="pricetag"
                      size={13}
                      color={
                        COLORS.blue
                      }
                    />

                    <Text
                      style={
                        styles.offerBadgeText
                      }
                    >
                      {translate(language, 'firstBooking')}
                    </Text>

                  </View>


                  <Text
                    style={
                      styles.offerTitle
                    }
                  >
                    {translate(language, 'firstPercentOff')}
                  </Text>


                  <Text
                    style={
                      styles.offerSubtitle
                    }
                  >
                    {translate(language, 'getDiscountOnFirstBooking')}
                  </Text>


                  <Pressable
                    style={
                      styles.offerButton
                    }
                    onPress={() =>
                      setScreen(
                        'offers'
                      )
                    }
                  >

                    <Text
                      style={
                        styles.offerButtonText
                      }
                    >
                      {translate(language, 'getOffer')}
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color={
                        COLORS.dark
                      }
                    />

                  </Pressable>

                </View>


                <View
                  style={
                    styles.offerDecoration
                  }
                >

                  <View
                    style={
                      styles.offerCircleLarge
                    }
                  />

                  <View
                    style={
                      styles.offerCircleSmall
                    }
                  />

                  <Ionicons
                    name="gift-outline"
                    size={60}
                    color={
                      'rgba(255,255,255,0.9)'
                    }
                  />

                </View>

              </View>

            </AnimatedPressable>


            {/* =================================================
                CATEGORIES
            ================================================= */}

            <View
              style={
                styles.categories
              }
            >

              <View
                style={
                  styles.sectionHeader
                }
              >

                <View
                  style={
                    styles.sectionTitleRow
                  }
                >

                  <View
                    style={
                      styles.sectionAccent
                    }
                  />

                  <Text
                    style={
                      styles.sectionTitleSmall
                    }
                  >
                    {translate(language, 'categories')}
                  </Text>

                </View>


                <Text
                  style={
                    styles.categoryHint
                  }
                >
                  Swipe →
                </Text>

              </View>


              <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.categoryScrollContent
                }
              >

                {categories.map(
                  (item, index) => (

                    <Animated.View
                      key={
                        item.id
                      }
                      style={{
                        opacity:
                          categoryAnimation[
                            index
                          ],
                        transform: [
                          {
                            translateY:
                              categoryAnimation[
                                index
                              ].interpolate({
                                inputRange: [
                                  0,
                                  1,
                                ],
                                outputRange: [
                                  25,
                                  0,
                                ],
                              }),
                          },

                          {
                            scale:
                              categoryAnimation[
                                index
                              ].interpolate({
                                inputRange: [
                                  0,
                                  1,
                                ],
                                outputRange: [
                                  0.92,
                                  1,
                                ],
                              }),
                          },
                        ],
                      }}
                    >

                      <Pressable
                        style={
                          styles.cCard
                        }
                        onPress={() => {

                          const screens = {

                            Painting:
                              'painting',

                            Cleaning:
                              'cleaning',

                            Plumbing:
                              'plumbing',

                            Electrician:
                              'electrician',

                            Carpenter:
                              'carpenter',

                            'AC Repair':
                              'acRepair',

                          };

                          setScreen(
                            screens[
                              item.name
                            ]
                          );

                        }}
                      >

                        <View
                          style={
                            styles.categoryIcon
                          }
                        >

                          <MaterialCommunityIcons
                            name={
                              item.icon
                            }
                            size={25}
                            color={
                              COLORS.white
                            }
                          />

                        </View>


                        <Text
                          numberOfLines={1}
                          style={
                            styles.categoryText
                          }
                        >
                          {
                            translateService(item.name, language)
                          }
                        </Text>

                      </Pressable>

                    </Animated.View>
                  )
                )}

              </ScrollView>

            </View>


            {/* =================================================
                SPOTLIGHT
            ================================================= */}

            <View
              style={
                styles.spotlightContainer
              }
            >

              <View
                style={
                  styles.sectionHeader
                }
              >

                <View
                  style={
                    styles.sectionTitleRow
                  }
                >

                  <View
                    style={
                      styles.sectionAccent
                    }
                  />

                  <Text
                    style={
                      styles.sectionTitleSmall
                    }
                  >
                    {translate(language, 'inTheSpotlight')}
                  </Text>

                </View>


                <Text
                  style={
                    styles.categoryHint
                  }
                >
                  {translate(language, 'swipe')}
                </Text>

              </View>


              <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={
                  false
                }
                decelerationRate="fast"
                snapToAlignment="start"
                contentContainerStyle={
                  styles.spotlightScrollContent
                }
              >

                {spotlightCards.map(
                  (card, index) => (

                    <Animated.View
                      key={
                        card.id
                      }
                      style={[
                        styles.spotlightAnimatedCard,
                        {
                          opacity:
                            spotlightAnimation[
                              index
                            ],
                          transform: [
                            {
                              translateX:
                                spotlightAnimation[
                                  index
                                ].interpolate({
                                  inputRange: [
                                    0,
                                    1,
                                  ],
                                  outputRange: [
                                    35,
                                    0,
                                  ],
                                }),
                            },
                          ],
                        },
                      ]}
                    >

                      <View
                        style={
                          styles.spotlightCard
                        }
                      >

                        <Image
                          source={{
                            uri:
                              card.image,
                          }}
                          style={
                            styles.spotlightImage
                          }
                          resizeMode="cover"
                        />


                        <View
                          style={
                            styles.spotlightDarkOverlay
                          }
                        />


                        <View
                          style={
                            styles.spotlightTopBadge
                          }
                        >

                          <Ionicons
                            name="sparkles"
                            size={12}
                            color={
                              COLORS.white
                            }
                          />

                          <Text
                            style={
                              styles.spotlightBadgeText
                            }
                          >
                            {translate(language, 'recommended')}
                          </Text>

                        </View>


                        <View
                          style={
                            styles.spotlightContent
                          }
                        >

                          <View
                            style={
                              styles.spotlightTextArea
                            }
                          >

                            <Text
                              numberOfLines={2}
                              style={
                                styles.spotlightTitle
                              }
                            >
                              {
                                card.title
                              }
                            </Text>


                            <Text
                              numberOfLines={2}
                              style={
                                styles.spotlightSubtitle
                              }
                            >
                              {
                                card.subtitle
                              }
                            </Text>

                          </View>


                          <Pressable
                            style={
                              styles.bookNowButton
                            }
                            onPress={() =>
                              setScreen(
                                card.screen
                              )
                            }
                          >

                            <Text
                              style={
                                styles.bookNowText
                              }
                            >
                              {translate(language, 'bookNow')}
                            </Text>

                            <Ionicons
                              name="arrow-forward"
                              size={15}
                              color={
                                COLORS.dark
                              }
                            />

                          </Pressable>

                        </View>

                      </View>

                    </Animated.View>
                  )
                )}

              </ScrollView>

            </View>


            {/* =================================================
                REFER
            ================================================= */}

            <Animated.View
              style={[
                styles.referCard,
                getFadeSlideStyle(
                  referAnimation,
                  25
                ),
              ]}
            >

              <View
                style={
                  styles.referLeft
                }
              >

                <View
                  style={
                    styles.rewardBadge
                  }
                >

                  <Ionicons
                    name="gift-outline"
                    size={13}
                    color={
                      COLORS.blue
                    }
                  />

                  <Text
                    style={
                      styles.rewardBadgeText
                    }
                  >
                    Rs. 200 Reward
                  </Text>

                </View>


                <Text
                  style={
                    styles.referTitle
                  }
                >
                  Refer Friends.{'\n'}
                  Earn Rewards.
                </Text>


                <Text
                  style={
                    styles.referSubtitle
                  }
                >
                  Invite your friends and
                  earn Rs. 200 after their
                  first successful booking.
                </Text>


                <Pressable
                  style={
                    styles.referButton
                  }
                  onPress={() =>
                    setScreen(
                      'referEarn'
                    )
                  }
                >

                  <Text
                    style={
                      styles.referButtonText
                    }
                  >
                    Refer Now
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={15}
                    color={
                      COLORS.dark
                    }
                  />

                </Pressable>

              </View>


              <View
                style={
                  styles.referRight
                }
              >

                <Animated.View
                  style={[
                    styles.giftCircle,
                    {
                      transform: [
                        {
                          scale:
                            referAnimation.interpolate({
                              inputRange: [
                                0,
                                1,
                              ],
                              outputRange: [
                                0.7,
                                1,
                              ],
                            }),
                        },
                      ],
                    },
                  ]}
                >

                  <Ionicons
                    name="gift"
                    size={32}
                    color={
                      COLORS.white
                    }
                  />

                </Animated.View>

              </View>

            </Animated.View>

          </Animated.View>


          {/* =================================================
              SCHEDULED BOOKINGS
          ================================================= */}

          {scheduledRequests.length > 0 && (
            <Animated.View
              style={[
                styles.sectionContainer,
                getFadeSlideStyle(
                  referAnimation,
                  30
                ),
              ]}
            >

              <View
                style={
                  styles.sectionHeader
                }
              >

                <View
                  style={
                    styles.sectionTitleRow
                  }
                >

                  <View
                    style={
                      styles.sectionAccent
                    }
                  />

                  <Text
                    style={
                      styles.sectionTitleSmall
                    }
                  >
                    {translate(language, 'scheduledBookings')}
                  </Text>

                </View>


                <Pressable
                  onPress={() =>
                    setScreen(
                      'bookings'
                    )
                  }
                >

                  <Text
                    style={
                      styles.seeAll
                    }
                  >
                    {translate(language, 'seeAll')}
                  </Text>

                </Pressable>

              </View>


              {scheduledRequests.slice(0, 2).map((request) => (
                <Pressable
                  key={`scheduled-${request.id}`}
                  style={styles.scheduledBookingCard}
                  onPress={() => setScreen('myRequests')}
                >
                  <View style={styles.scheduledBookingHeader}>
                    <View style={styles.scheduledBookingIcon}>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={COLORS.blue}
                      />
                    </View>
                    
                    <View style={{ flex: 1 }}>
                      <Text style={styles.scheduledBookingService}>
                        {translateService(request.service_category, language)}
                      </Text>
                      
                      <Text style={styles.scheduledBookingWorker}>
                        {translate(language, 'workerLabel')} {request.worker_name || translate(language, 'assigned')}
                      </Text>
                    </View>

                    <View style={styles.scheduledBookingBadge}>
                      <Text style={styles.scheduledBookingBadgeText}>
                        {translate(language, 'scheduledBadge')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.scheduledBookingDetails}>
                    <View style={styles.scheduledBookingDetailRow}>
                      <Ionicons
                        name="calendar"
                        size={14}
                        color={COLORS.gray}
                      />
                      <Text style={styles.scheduledBookingDetailText}>
                        {new Date(request.required_date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>

                    <View style={styles.scheduledBookingDetailRow}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={COLORS.gray}
                      />
                      <Text style={styles.scheduledBookingDetailText}>
                        {request.required_time || translate(language, 'tbd')}
                      </Text>
                    </View>

                    {request.estimated_budget && (
                      <View style={styles.scheduledBookingDetailRow}>
                        <Ionicons
                          name="cash-outline"
                          size={14}
                          color={COLORS.blue}
                        />
                        <Text style={[styles.scheduledBookingDetailText, { color: COLORS.blue, fontWeight: '700' }]}>
                          Rs. {request.estimated_budget}
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}

            </Animated.View>
          )}

        </ScrollView>

      </Animated.View>


     

      {/* =================================================
          BOTTOM TAB BAR
      ================================================= */}

      <View
  style={[
    styles.tabBar,
    {
      paddingBottom: Math.max( 8),
    },
  ]}
>

        {/* HOME */}

        <Pressable
          style={
            styles.tabItem
          }
          onPress={() =>
            setScreen(
              'home'
            )
          }
        >

          <Ionicons
            name={
              screen === 'home'
                ? 'home'
                : 'home-outline'
            }
            size={22}
            color={
              screen === 'home'
                ? COLORS.blue
                : COLORS.gray
            }
          />

          <Text
            style={[
              styles.tabText,
              screen === 'home' && {
                color:
                  COLORS.blue,
                fontWeight:
                  '700',
              },
            ]}
          >
            {translate(language, 'home')}
          </Text>

        </Pressable>


        {/* CALENDAR */}

        <Pressable
          style={
            styles.tabItem
          }
          onPress={() =>
            setScreen(
              'calendar'
            )
          }
        >

          <Ionicons
            name={
              screen === 'calendar'
                ? 'calendar'
                : 'calendar-outline'
            }
            size={22}
            color={
              screen === 'calendar'
                ? COLORS.blue
                : COLORS.gray
            }
          />

          <Text
            style={[
              styles.tabText,
              screen === 'calendar' && {
                color:
                  COLORS.blue,
                fontWeight:
                  '700',
              },
            ]}
          >
            {translate(language, 'calendar')}
          </Text>

        </Pressable>


        {/* VOICE */}
{/* VOICE */}
{/* VOICE */}

<Pressable
  onPress={() => {
    resetSTT();
    startSTT();
  }}
  style={{
    width: 70,
    height: 82,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -25,
    zIndex: 999,
    elevation: 999,
  }}
>
  <View
    style={{
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: COLORS.blue,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 4,
      borderColor: sttListening ? '#16A34A' : COLORS.white,
      elevation: 12,
      zIndex: 1000,
    }}
  >
    <Ionicons
      name={sttListening ? 'pulse' : 'mic'}
      size={28}
      color="#FFFFFF"
      marginBottom="2"
    />
  </View>

  <Text
    style={{
      marginTop: 2,
      fontSize: 10,
      fontWeight: '700',
      color: COLORS.gray,
      marginBottom:2,
    }}
  >
    {translate(language, 'voiceTab')}
  </Text>
</Pressable>


        {/* BOOKINGS */}

        <Pressable
          style={
            styles.tabItem
          }
          onPress={() =>
            setScreen(
              'bookings'
            )
          }
        >

          <Ionicons
            name={
              screen === 'bookings'
                ? 'briefcase'
                : 'briefcase-outline'
            }
            size={22}
            color={
              screen === 'bookings'
                ? COLORS.blue
                : COLORS.gray
            }
          />

          <Text
            style={[
              styles.tabText,
              screen === 'bookings' && {
                color:
                  COLORS.blue,
                fontWeight:
                  '700',
              },
            ]}
          >
            {translate(language, 'bookingsTab')}
          </Text>

        </Pressable>


        {/* PROFILE */}

        <Pressable
          style={
            styles.tabItem
          }
          onPress={() =>
            setScreen(
              'profile'
            )
          }
        >

          <Ionicons
            name={
              screen === 'profile'
                ? 'person'
                : 'person-outline'
            }
            size={22}
            color={
              screen === 'profile'
                ? COLORS.blue
                : COLORS.gray
            }
          />

          <Text
            style={[
              styles.tabText,
              screen === 'profile' && {
                color:
                  COLORS.blue,
                fontWeight:
                  '700',
              },
            ]}
          >
            {translate(language, 'profileTab')}
          </Text>

        </Pressable>

      </View>
 {/* ===================================================
    FLOATING AI CHATBOT
=================================================== */}

<Animated.View
  style={[
    styles.chatbotFloatingButton,
    {
      transform: [
        {
          translateY: chatbotMove,
        },
      ],
    },
  ]}
>
  <Pressable
    style={({ pressed }) => [
      styles.chatbotButton,
      pressed && {
        transform: [{ scale: 0.94 }],
      },
    ]}
    onPress={() => go('chatbot')}
  >

    {/* ROBOT LOGO */}
    <MaterialCommunityIcons
      name="robot-outline"
      size={32}
      color="#FFFFFF"
    />

    {/* ONLINE DOT */}
    <View style={styles.chatbotOnlineDot} />

  </Pressable>
</Animated.View>

      {/* =================================================
          DRAWER
      ================================================= */}

      {drawerOpen && (

        <View
          style={
            styles.drawerOverlay
          }
        >

          <Animated.View
            style={[
              styles.drawerBackdrop,
              {
                opacity:
                  drawerBackdrop,
              },
            ]}
          >

            <Pressable
              style={
                StyleSheet.absoluteFill
              }
              onPress={
                closeDrawer
              }
            />

          </Animated.View>


          <Animated.View
            style={[
              styles.drawer,
              {
                transform: [
                  {
                    translateX:
                      drawerSlide,
                  },
                ],
              },
            ]}
          >

            <Pressable
              style={
                styles.drawerCloseButton
              }
              onPress={
                closeDrawer
              }
            >

              <Ionicons
                name="close"
                size={21}
                color={
                  COLORS.white
                }
              />

            </Pressable>


            <View
              style={
                styles.drawerHeader
              }
            >

              <View
                style={
                  styles.drawerLogo
                }
              >

                <Ionicons
                  name="home"
                  size={22}
                  color={
                    COLORS.blue
                  }
                />

              </View>


              <View
                style={
                  styles.drawerBrandContainer
                }
              >

                <Text
                  style={
                    styles.drawerBrand
                  }
                >
                  Sahayak
                </Text>

                <Text
                  style={
                    styles.drawerTagline
                  }
                >
                  {translate(language, 'servicesMadeSimple')}
                </Text>

              </View>

            </View>


            <View
              style={
                styles.drawerDivider
              }
            />


            <Text
              style={
                styles.drawerMenuTitle
              }
            >
              {translate(language, 'menu')}
            </Text>


            {/* HOME */}

            <Pressable
              style={
                styles.drawerItem
              }
              onPress={() =>
                navigateFromDrawer(
                  'home'
                )
              }
            >

              <View
                style={
                  styles.drawerIconBox
                }
              >

                <Ionicons
                  name="home-outline"
                  size={20}
                  color={
                    COLORS.white
                  }
                />

              </View>

              <Text
                style={
                  styles.drawerText
                }
              >
                {translate(language, 'home')}
              </Text>

              <Ionicons
                name="chevron-forward"
                size={15}
                color={
                  'rgba(255,255,255,0.45)'
                }
              />

            </Pressable>


            {/* MY BOOKINGS */}

            <Pressable
              style={
                styles.drawerItem
              }
              onPress={() =>
                navigateFromDrawer(
                  'bookings'
                )
              }
            >

              <View
                style={
                  styles.drawerIconBox
                }
              >

                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={
                    COLORS.white
                  }
                />

              </View>

              <Text
                style={
                  styles.drawerText
                }
              >
                {translate(language, 'myBookings')}
              </Text>

              <Ionicons
                name="chevron-forward"
                size={15}
                color={
                  'rgba(255,255,255,0.45)'
                }
              />

            </Pressable>


            {/* CALENDAR */}

            <Pressable
              style={
                styles.drawerItem
              }
              onPress={() =>
                navigateFromDrawer(
                  'calendar'
                )
              }
            >

              <View
                style={
                  styles.drawerIconBox
                }
              >

                <Ionicons
                  name="today-outline"
                  size={20}
                  color={
                    COLORS.white
                  }
                />

              </View>

              <Text
                style={
                  styles.drawerText
                }
              >
                {translate(language, 'calendar')}
              </Text>

              <Ionicons
                name="chevron-forward"
                size={15}
                color={
                  'rgba(255,255,255,0.45)'
                }
              />

            </Pressable>


            {/* SUBSCRIPTION */}

            <Pressable
              style={
                styles.drawerItem
              }
              onPress={() =>
                navigateFromDrawer(
                  'offers'
                )
              }
            >

              <View
                style={
                  styles.drawerIconBox
                }
              >

                <Ionicons
                  name="diamond-outline"
                  size={20}
                  color={
                    COLORS.white
                  }
                />

              </View>

              <Text
                style={
                  styles.drawerText
                }
              >
                {translate(language, 'buySubscription')}
              </Text>

              <Ionicons
                name="chevron-forward"
                size={15}
                color={
                  'rgba(255,255,255,0.45)'
                }
              />

            </Pressable>


            {/* HISTORY */}

            <Pressable
              style={
                styles.drawerItem
              }
              onPress={() =>
                navigateFromDrawer(
                  'bookings'
                )
              }
            >

              <View
                style={
                  styles.drawerIconBox
                }
              >

                <Ionicons
                  name="time-outline"
                  size={20}
                  color={
                    COLORS.white
                  }
                />

              </View>

              <Text
                style={
                  styles.drawerText
                }
              >
                {translate(language, 'bookingHistory')}
              </Text>

              <Ionicons
                name="chevron-forward"
                size={15}
                color={
                  'rgba(255,255,255,0.45)'
                }
              />

            </Pressable>


            {/* PROFILE */}

            <Pressable
              style={
                styles.drawerItem
              }
              onPress={() =>
                navigateFromDrawer(
                  'profile'
                )
              }
            >

              <View
                style={
                  styles.drawerIconBox
                }
              >

                <Ionicons
                  name="person-outline"
                  size={20}
                  color={
                    COLORS.white
                  }
                />

              </View>

              <Text
                style={
                  styles.drawerText
                }
              >
                {translate(language, 'profileTab')}
              </Text>

              <Ionicons
                name="chevron-forward"
                size={15}
                color={
                  'rgba(255,255,255,0.45)'
                }
              />

            </Pressable>


            {/* SETTINGS */}

            <Pressable
              style={
                styles.drawerItem
              }
              onPress={() =>
                navigateFromDrawer(
                  'settings'
                )
              }
            >

              <View
                style={
                  styles.drawerIconBox
                }
              >

                <Ionicons
                  name="settings-outline"
                  size={20}
                  color={
                    COLORS.white
                  }
                />

              </View>

              <Text
                style={
                  styles.drawerText
                }
              >
                {translate(language, 'settings')}
              </Text>

              <Ionicons
                name="chevron-forward"
                size={15}
                color={
                  'rgba(255,255,255,0.45)'
                }
              />

            </Pressable>


            {/* HELP */}

            <Pressable
              style={
                styles.drawerItem
              }
              onPress={() =>
                navigateFromDrawer(
                  'helpSupport'
                )
              }
            >

              <View
                style={
                  styles.drawerIconBox
                }
              >

                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color={
                    COLORS.white
                  }
                />

              </View>

              <Text
                style={
                  styles.drawerText
                }
              >
                {translate(language, 'helpSupport')}
              </Text>

              <Ionicons
                name="chevron-forward"
                size={15}
                color={
                  'rgba(255,255,255,0.45)'
                }
              />

            </Pressable>


            <View
              style={
                styles.drawerDivider
              }
            />


            {/* LOGOUT */}

            <Pressable
              style={
                styles.logoutItem
              }
              onPress={async () => {
                closeDrawer();
                setTimeout(() => {
                  handleLogout();
                }, 260);
              }}
            >

              <View
                style={
                  styles.logoutIconBox
                }
              >

                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={
                    COLORS.red
                  }
                />

              </View>

              <Text
                style={
                  styles.logoutText
                }
              >
                {translate(language, 'logout')}
              </Text>

            </Pressable>


            <View
              style={
                styles.drawerFooter
              }
            >

              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color={
                  'rgba(255,255,255,0.55)'
                }
              />

              <Text
                style={
                  styles.drawerFooterText
                }
              >
                {translate(language, 'safeTrustedServices')}
              </Text>

            </View>

          </Animated.View>

        </View>
      )}

    </SafeAreaView>
  
    </SafeAreaProvider>
  );
}


/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({

  /* ===================================================
     GENERAL
  =================================================== */

  container: {
    flex: 1,
    backgroundColor:
      COLORS.white,
  },

  homeAnimated: {
    flex: 1,
  },

  homeScroll: {
    flex: 1,
  },

  homeContent: {
    paddingBottom: 115,
    paddingTop: 40,
  },

  homeVoiceGuidanceWrap: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },


  /* ===================================================
     HEADER
  =================================================== */

  modernHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },

  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  modernMenuButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor:
      COLORS.light,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    justifyContent:
      'center',
    alignItems:
      'center',
  },

  headerBrand: {
    flexDirection: 'row',
    alignItems:
      'center',
    paddingHorizontal: 10,
  },

  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor:
      COLORS.blue,
    alignItems:
      'center',
    justifyContent:
      'center',
    marginRight: 7,
  },

  brandText: {
    fontSize: 18,
    fontWeight:
      '900',
    color:
      COLORS.dark,
  },

  modernNotification: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor:
      COLORS.light,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    justifyContent:
      'center',
    alignItems:
      'center',
    position:
      'relative',
  },

  notificationBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor:
      COLORS.blue,
    justifyContent:
      'center',
    alignItems:
      'center',
    borderWidth: 1.5,
    borderColor:
      COLORS.white,
  },

  notificationBadgeText: {
    fontSize: 8,
    color:
      COLORS.white,
    fontWeight:
      '800',
  },


  /* ===================================================
     SEARCH
  =================================================== */

  modernSearchWrapper: {
    marginHorizontal: 20,
    marginTop: 16,
  },

  modernSearchBar: {
    minHeight: 64,
    backgroundColor:
      COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    flexDirection:
      'row',
    alignItems:
      'center',
    paddingHorizontal: 9,
    elevation: 3,
  },

  modernSearchIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor:
      COLORS.lightBlue,
    justifyContent:
      'center',
    alignItems:
      'center',
  },

  searchPlaceholderContainer: {
    flex: 1,
    marginLeft: 11,
  },

  searchPlaceholder: {
    fontSize: 14,
    color:
      COLORS.dark,
    fontWeight:
      '600',
  },

  searchSubPlaceholder: {
    fontSize: 10.5,
    color:
      COLORS.lightGray,
    marginTop: 2,
  },

  modernSearchMic: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor:
      COLORS.light,
    justifyContent:
      'center',
    alignItems:
      'center',
    borderWidth: 1,
    borderColor:
      COLORS.border,
    marginLeft: 7,
  },


  /* ===================================================
     SEARCH PANEL
  =================================================== */

  searchPanel: {
    marginHorizontal: 20,
    marginTop: 9,
    backgroundColor:
      COLORS.white,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    elevation: 8,
    zIndex: 100,
  },

  searchInputRow: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor:
      COLORS.light,
    flexDirection:
      'row',
    alignItems:
      'center',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  panelSearchIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor:
      COLORS.lightBlue,
    justifyContent:
      'center',
    alignItems:
      'center',
  },

  searchInput: {
    flex: 1,
    marginLeft: 9,
    fontSize: 15,
    color:
      COLORS.dark,
    paddingVertical: 0,
  },

  closeSearchButton: {
    width: 30,
    height: 30,
    justifyContent:
      'center',
    alignItems:
      'center',
  },

  searchResultTitle: {
    fontSize: 14,
    fontWeight:
      '700',
    color:
      COLORS.dark,
    marginTop: 17,
    marginBottom: 7,
  },

  searchResult: {
    flexDirection:
      'row',
    alignItems:
      'center',
    paddingVertical: 7,
  },

  searchResultIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor:
      COLORS.lightBlue,
    justifyContent:
      'center',
    alignItems:
      'center',
  },

  searchResultText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14.5,
    fontWeight:
      '600',
    color:
      COLORS.dark,
  },

  noSearchResults: {
    alignItems:
      'center',
    paddingVertical: 22,
  },

  noSearchResultsText: {
    marginTop: 7,
    fontSize: 12,
    color:
      COLORS.lightGray,
    fontWeight:
      '600',
  },

  // Worker Type Section Headers
  workerTypeSection: {
    marginTop: 18,
    marginBottom: 10,
  },

  workerTypeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.lightBlue,
    borderRadius: 10,
  },

  workerTypeSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.blue,
    marginLeft: 8,
    letterSpacing: 0.5,
  },


  /* ===================================================
     HOME BOOKING SECTIONS
  =================================================== */

  homeStatusSection: {
    marginHorizontal: 20,
    marginTop: 22,
  },

  homeStatusHeader: {
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'space-between',
    marginBottom: 10,
  },

  homeStatusHeaderLeft: {
    flexDirection:
      'row',
    alignItems:
      'center',
  },

  homeStatusSectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor:
      COLORS.softBlue,
    justifyContent:
      'center',
    alignItems:
      'center',
    marginRight: 10,
  },

  homeStatusTitle: {
    fontSize: 18,
    fontWeight:
      '800',
    color:
      COLORS.dark,
  },

  homeStatusSubtitle: {
    fontSize: 10.5,
    color:
      COLORS.gray,
    marginTop: 2,
  },

  homeStatusCount: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor:
      COLORS.blue,
    justifyContent:
      'center',
    alignItems:
      'center',
  },

  homeStatusCountText: {
    fontSize: 11,
    color:
      COLORS.white,
    fontWeight:
      '800',
  },

  homeBookingCard: {
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius: 16,
    minHeight: 78,
    flexDirection:
      'row',
    alignItems:
      'center',
    padding: 12,
    marginBottom: 9,
    elevation: 2,
  },

  homeBookingCardPressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  homeBookingIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor:
      COLORS.lightBlue,
    justifyContent:
      'center',
    alignItems:
      'center',
  },

  homeBookingMiddle: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },

  homeBookingService: {
    fontSize: 14,
    fontWeight:
      '800',
    color:
      COLORS.dark,
  },

  homeBookingWorker: {
    fontSize: 11.5,
    color:
      COLORS.gray,
    marginTop: 2,
  },

  homeBookingMeta: {
    flexDirection:
      'row',
    alignItems:
      'center',
    marginTop: 5,
  },

  homeBookingMetaText: {
    fontSize: 9.5,
    color:
      COLORS.lightGray,
    marginLeft: 3,
  },

  homeBookingRight: {
    alignItems:
      'flex-end',
    justifyContent:
      'space-between',
    alignSelf:
      'stretch',
    paddingVertical: 2,
    marginLeft: 6,
  },

  homeStatusBadge: {
    flexDirection:
      'row',
    alignItems:
      'center',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  homeStatusText: {
    fontSize: 8.5,
    fontWeight:
      '800',
    marginLeft: 3,
  },


  /* ===================================================
     SECTIONS
  =================================================== */

  sectionContainer: {
    marginTop: 27,
    paddingHorizontal: 20,
  },

  sectionHeader: {
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'space-between',
    marginBottom: 13,
  },

  sectionTitleRow: {
    flexDirection:
      'row',
    alignItems:
      'center',
  },

  sectionAccent: {
    width: 4,
    height: 20,
    borderRadius: 3,
    backgroundColor:
      COLORS.blue,
    marginRight: 8,
  },

  sectionTitleSmall: {
    fontSize: 20,
    fontWeight:
      '800',
    color:
      COLORS.dark,
  },

  seeAll: {
    fontSize: 13,
    fontWeight:
      '700',
    color:
      COLORS.blue,
  },

  categoryHint: {
    fontSize: 12,
    color:
      COLORS.lightGray,
    fontWeight:
      '600',
  },


  /* ===================================================
     OFFER
  =================================================== */

  offerCard: {
    minHeight: 190,
    backgroundColor:
      COLORS.blue,
    borderRadius: 23,
    padding: 20,
    overflow:
      'hidden',
    flexDirection:
      'row',
    position:
      'relative',
  },

  offerContent: {
    flex: 1,
    zIndex: 2,
    paddingRight: 5,
  },

  offerBadge: {
    alignSelf:
      'flex-start',
    backgroundColor:
      COLORS.white,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection:
      'row',
    alignItems:
      'center',
    marginBottom: 9,
  },

  offerBadgeText: {
    fontSize: 9,
    fontWeight:
      '800',
    color:
      COLORS.blue,
    marginLeft: 5,
    letterSpacing: 0.5,
  },

  offerTitle: {
    color:
      COLORS.white,
    fontSize: 31,
    fontWeight:
      '900',
  },

  offerSubtitle: {
    color:
      COLORS.white,
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: 4,
    marginBottom: 14,
    maxWidth: 220,
    opacity: 0.94,
  },

  offerButton: {
    backgroundColor:
      COLORS.white,
    alignSelf:
      'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 11,
    flexDirection:
      'row',
    alignItems:
      'center',
  },

  offerButtonText: {
    color:
      COLORS.dark,
    fontWeight:
      '800',
    fontSize: 13,
    marginRight: 6,
  },

  offerDecoration: {
    width: 95,
    justifyContent:
      'center',
    alignItems:
      'center',
    position:
      'relative',
  },

  offerCircleLarge: {
    position:
      'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor:
      'rgba(255,255,255,0.08)',
    right: -55,
  },

  offerCircleSmall: {
    position:
      'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor:
      'rgba(255,255,255,0.10)',
    right: 0,
  },


  /* ===================================================
     CATEGORIES
  =================================================== */

  categories: {
    marginTop: 30,
  },

  categoryScrollContent: {
    paddingRight: 10,
    paddingLeft: 1,
  },

  cCard: {
    width: 96,
    height: 108,
    backgroundColor:
      COLORS.white,
    borderRadius: 19,
    justifyContent:
      'center',
    alignItems:
      'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    elevation: 3,
  },

  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor:
      COLORS.blue,
    justifyContent:
      'center',
    alignItems:
      'center',
    marginBottom: 9,
  },

  categoryText: {
    color:
      COLORS.dark,
    fontSize: 12,
    fontWeight:
      '700',
    textAlign:
      'center',
    paddingHorizontal: 3,
  },


  /* ===================================================
     SPOTLIGHT
  =================================================== */

  spotlightContainer: {
    marginTop: 31,
    width: '100%',
  },

  spotlightScrollContent: {
    paddingRight: 20,
    paddingLeft: 1,
  },

  spotlightAnimatedCard: {
    flexShrink: 0,
  },

  spotlightCard: {
    width:
      Math.min(
        width - 62,
        340
      ),
    height: 220,
    borderRadius: 23,
    overflow:
      'hidden',
    marginRight: 14,
    backgroundColor:
      COLORS.light,
    position:
      'relative',
  },

  spotlightImage: {
    position:
      'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },

  spotlightDarkOverlay: {
    position:
      'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:
      'rgba(0,0,0,0.43)',
  },

  spotlightTopBadge: {
    position:
      'absolute',
    top: 14,
    left: 15,
    backgroundColor:
      'rgba(0,0,0,0.42)',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    flexDirection:
      'row',
    alignItems:
      'center',
  },

  spotlightBadgeText: {
    color:
      COLORS.white,
    fontSize: 8.5,
    fontWeight:
      '800',
    letterSpacing: 0.5,
    marginLeft: 5,
  },

  spotlightContent: {
    flex: 1,
    paddingHorizontal: 17,
    paddingTop: 52,
    paddingBottom: 16,
    justifyContent:
      'space-between',
  },

  spotlightTextArea: {
    width: '92%',
    paddingRight: 5,
  },

  spotlightTitle: {
    color:
      COLORS.white,
    fontSize: 20,
    lineHeight: 26,
    fontWeight:
      '800',
  },

  spotlightSubtitle: {
    color:
      'rgba(255,255,255,0.92)',
    fontSize: 12.5,
    marginTop: 6,
    fontWeight:
      '500',
  },

  bookNowButton: {
    backgroundColor:
      COLORS.white,
    alignSelf:
      'flex-start',
    minHeight: 39,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 12,
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  bookNowText: {
    color:
      COLORS.dark,
    fontWeight:
      '800',
    fontSize: 12.5,
    marginRight: 6,
  },


  /* ===================================================
     REFER
  =================================================== */

  referCard: {
    marginTop: 29,
    marginHorizontal: 20,
    backgroundColor:
      COLORS.blue,
    borderRadius: 23,
    padding: 20,
    flexDirection:
      'row',
    justifyContent:
      'space-between',
    alignItems:
      'center',
    overflow:
      'hidden',
    minHeight: 235,
  },

  referLeft: {
    flex: 1,
    paddingRight: 10,
    zIndex: 2,
  },

  rewardBadge: {
    alignSelf:
      'flex-start',
    backgroundColor:
      COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
    flexDirection:
      'row',
    alignItems:
      'center',
  },

  rewardBadgeText: {
    color:
      COLORS.blue,
    fontSize: 11,
    fontWeight:
      '800',
    marginLeft: 5,
  },

  referTitle: {
    color:
      COLORS.white,
    fontSize: 23,
    fontWeight:
      '900',
    lineHeight: 29,
  },

  referSubtitle: {
    color:
      'rgba(255,255,255,0.88)',
    fontSize: 13,
    marginTop: 9,
    lineHeight: 19,
    maxWidth: 245,
  },

  referButton: {
    marginTop: 16,
    backgroundColor:
      COLORS.white,
    alignSelf:
      'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 11,
    flexDirection:
      'row',
    alignItems:
      'center',
  },

  referButtonText: {
    color:
      COLORS.dark,
    fontWeight:
      '800',
    fontSize: 13,
    marginRight: 6,
  },

  referRight: {
    width: 75,
    justifyContent:
      'center',
    alignItems:
      'center',
    position:
      'relative',
  },

  giftCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor:
      COLORS.dark,
    justifyContent:
      'center',
    alignItems:
      'center',
  },

  /* ===================================================
     SCHEDULED BOOKINGS
  =================================================== */

  scheduledBookingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  scheduledBookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  scheduledBookingIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E8F0F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  scheduledBookingService: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.dark,
  },

  scheduledBookingWorker: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },

  scheduledBookingBadge: {
    backgroundColor: '#E8F0F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  scheduledBookingBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.blue,
  },

  scheduledBookingDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  scheduledBookingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  scheduledBookingDetailText: {
    fontSize: 12,
    color: COLORS.gray,
  },


  /* ===================================================
     TAB BAR
  =================================================== */
tabBar: {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
marginBottom:30,
  height: 70,

  backgroundColor: COLORS.white,

  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-around',

  borderTopWidth: 1,
  borderTopColor: '#E5E7EB',

  elevation: 10,

  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: -2,
  },
  shadowOpacity: 0.08,
  shadowRadius: 5,

  zIndex: 100,
},


  /* ===================================================
     DRAWER
  =================================================== */

  drawerOverlay: {
    position:
      'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 1000,
  },

  drawerBackdrop: {
    position:
      'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:
      COLORS.blackOverlay,
  },

  drawer: {
    position:
      'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor:
      COLORS.blue,
    paddingTop: 48,
    paddingHorizontal: 16,
    elevation: 25,
  },

  drawerCloseButton: {
    position:
      'absolute',
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor:
      'rgba(255,255,255,0.12)',
    justifyContent:
      'center',
    alignItems:
      'center',
    zIndex: 10,
  },

  drawerHeader: {
    flexDirection:
      'row',
    alignItems:
      'center',
    paddingHorizontal: 3,
  },

  drawerLogo: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor:
      COLORS.white,
    justifyContent:
      'center',
    alignItems:
      'center',
    marginRight: 12,
  },

  drawerBrandContainer: {
    flex: 1,
  },

  drawerBrand: {
    fontSize: 20,
    fontWeight:
      '900',
    color:
      COLORS.white,
  },

  drawerTagline: {
    fontSize: 10.5,
    color:
      'rgba(255,255,255,0.68)',
    marginTop: 2,
    fontWeight:
      '500',
  },

  drawerDivider: {
    height: 1,
    backgroundColor:
      'rgba(255,255,255,0.17)',
    marginVertical: 13,
  },

  drawerMenuTitle: {
    fontSize: 9.5,
    color:
      'rgba(255,255,255,0.55)',
    fontWeight:
      '800',
    letterSpacing: 1.2,
    marginBottom: 5,
    marginLeft: 5,
  },

  drawerItem: {
    flexDirection:
      'row',
    alignItems:
      'center',
    minHeight: 46,
    paddingHorizontal: 4,
    borderRadius: 13,
    marginBottom: 1,
  },

  drawerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor:
      'rgba(255,255,255,0.12)',
    justifyContent:
      'center',
    alignItems:
      'center',
  },

  drawerText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 11,
    color:
      COLORS.white,
    fontWeight:
      '600',
  },

  logoutItem: {
    flexDirection:
      'row',
    alignItems:
      'center',
    minHeight: 46,
    paddingHorizontal: 4,
    borderRadius: 13,
  },

  logoutIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor:
      'rgba(239,68,68,0.14)',
    justifyContent:
      'center',
    alignItems:
      'center',
  },

  logoutText: {
    fontSize: 14,
    marginLeft: 11,
    color:
      COLORS.red,
    fontWeight:
      '700',
  },

  drawerFooter: {
    position:
      'absolute',
    bottom: 18,
    left: 16,
    right: 16,
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  drawerFooterText: {
    fontSize: 10,
    color:
      'rgba(255,255,255,0.58)',
    marginLeft: 5,
    fontWeight:
      '500',
  },
  /* ===================================================
   FLOATING CHATBOT
=================================================== */

/* ===================================================
   FLOATING CHATBOT
=================================================== */

chatbotFloatingButton: {
  position: 'absolute',

  right: 18,
  bottom: 95,

  zIndex: 9999,
  elevation: 9999,
},

chatbotButton: {
  width: 62,
  height: 62,

  borderRadius: 31,

  backgroundColor: '#49769F',

  alignItems: 'center',
  justifyContent: 'center',

  borderWidth: 2,
  borderColor: '#FFFFFF',

  elevation: 12,

  shadowColor: '#365C7C',
  shadowOffset: {
    width: 0,
    height: 5,
  },

  shadowOpacity: 0.30,
  shadowRadius: 8,

  position: 'relative',
},

/* ===================================================
   GREEN ONLINE DOT
=================================================== */

chatbotOnlineDot: {
  position: 'absolute',

  top: 3,
  right: 3,

  width: 14,
  height: 14,

  borderRadius: 7,

  backgroundColor: '#2ECC71',

  borderWidth: 2,
  borderColor: '#FFFFFF',
},
});
