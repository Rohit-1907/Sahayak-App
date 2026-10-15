import React, { useEffect, useRef, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale, wp, hp } from '../utils/responsive';
import { translate } from "../utils/translations";
import { useSpeechToText } from "../utils/useSpeechToText";
import { useTextToSpeech } from "../utils/useTextToSpeech";
import VoiceGuidanceButton from "../components/VoiceGuidanceButton";
import { API_ENDPOINTS } from "../config/api";

// Import role-based home screens
import IndividualWorkerHome from "./home/IndividualWorkerHome";
import OrganizationAdminHome from "./home/OrganizationAdminHome";
import OrganizationWorkerHome from "./home/OrganizationWorkerHome";


/* ============================================================
   COLORS
============================================================ */

const PURPLE = "#49769F";
const LIGHT_PURPLE = "#EEF4F8";
const BG = "#F8FAFC";
const TEXT = "#111827";
const MUTED = "#6B7280";
const GREEN = "#24935D";
const RED = "#D94C4C";
const BORDER = "#E0E7ED";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(wp(80), scale(330));


/* ============================================================
   DASHBOARD
============================================================ */

export default function Dashboard({
  screen,
  go,
  search,
  setSearch,
  setSelectedJob,
  userRole = "individual_worker", // Default to individual worker
  language = "English",
}) {

  const [menuOpen, setMenuOpen] = useState(false);
  const [scheduledJobs, setScheduledJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // ============================================================
  // VOICE GUIDANCE (TTS) — INDIVIDUAL WORKER CALENDAR ONLY
  // Automatic introduction speaks once per Calendar screen entry
  // (re-armed when the user leaves the Calendar tab, so normal
  // re-renders never replay it). For Organization users the Calendar
  // tab is untouched. The reusable Voice Guidance button speaks
  // detailed Calendar help on tap (tap while speaking stops it).
  // TTS only — no STT, no navigation, no backend calls.
  // ============================================================

  const {
    speak: speakCalendar,
    stop: stopCalendar,
    isSpeaking: isCalendarSpeaking,
  } = useTextToSpeech(language);

  const calendarIntroSpoken = useRef(false);

  const handleCalendarVoiceGuidance = () => {
    if (isCalendarSpeaking) {
      stopCalendar();
      return;
    }
    speakCalendar(translate('calendarVoiceGuidance', language));
  };

  useEffect(() => {
    if (screen !== "calendar" || userRole !== "individual_worker") {
      calendarIntroSpoken.current = false;
      return;
    }

    if (calendarIntroSpoken.current) {
      return;
    }

    calendarIntroSpoken.current = true;
    speakCalendar(translate('calendarAutoIntro', language));

    return () => {
      stopCalendar();
    };
  }, [screen, userRole, language, speakCalendar, stopCalendar]);

  // ============================================================
  // VOICE GUIDANCE (TTS) — INDIVIDUAL WORKER EARNINGS ONLY
  // Automatic introduction speaks once per Earnings screen entry
  // (re-armed when the user leaves the Earnings tab). Organization
  // users are untouched. The reusable Voice Guidance button speaks
  // detailed Earnings help on tap (tap while speaking stops it).
  // TTS only — no STT, no navigation, no backend calls.
  // ============================================================

  const {
    speak: speakEarnings,
    stop: stopEarnings,
    isSpeaking: isEarningsSpeaking,
  } = useTextToSpeech(language);

  const earningsIntroSpoken = useRef(false);

  const handleEarningsVoiceGuidance = () => {
    if (isEarningsSpeaking) {
      stopEarnings();
      return;
    }
    speakEarnings(translate('earningsVoiceGuidance', language));
  };

  useEffect(() => {
    if (screen !== "earnings" || userRole !== "individual_worker") {
      earningsIntroSpoken.current = false;
      return;
    }

    if (earningsIntroSpoken.current) {
      return;
    }

    earningsIntroSpoken.current = true;
    speakEarnings(translate('earningsAutoIntro', language));

    return () => {
      stopEarnings();
    };
  }, [screen, userRole, language, speakEarnings, stopEarnings]);

  // ============================================================
  // VOICE ASSISTANT (STT)
  // Reuses the shared hook; real recognition drives the visual
  // listening state. The final transcript populates the shared
  // search state and then uses the normal search-results flow.
  // No navigation from interim results.
  // ============================================================

  const {
    start: startVoiceSTT,
    stop: stopVoiceSTT,
    listening: voiceListening,
    transcript: voiceTranscript,
  } = useSpeechToText(language);

  // Visual listening state mirrors the real recognition state.
  const isListening = voiceListening;

  const voiceSearchActive = useRef(false);

  const handleVoicePress = () => {
    if (isListening) {
      stopVoiceSTT();
      return;
    }
    voiceSearchActive.current = true;
    startVoiceSTT();
  };

  useEffect(() => {
    if (!voiceSearchActive.current || voiceListening) {
      return;
    }

    // Recognition finished; guard against empty results.
    const spoken = (voiceTranscript || '').trim();

    if (!spoken) {
      voiceSearchActive.current = false;
      return;
    }

    voiceSearchActive.current = false;
    setSearch(spoken);
    go("search");
  }, [voiceListening, voiceTranscript, setSearch, go]);
  const [userData, setUserData] = useState({
    name: 'User',
    location: 'Loading...'
  });

  const drawerX = useRef(
    new Animated.Value(-DRAWER_WIDTH)
  ).current;

  const overlayOpacity = useRef(
    new Animated.Value(0)
  ).current;

  // Fetch scheduled jobs for calendar
  useEffect(() => {
    let isMounted = true;
    if (screen === "calendar") {
      const loadCachedCalendar = async () => {
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          const cached = await AsyncStorage.getItem(`@cache_worker_calendar_${userRole}`);
          if (cached && isMounted) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setScheduledJobs(parsed);
              setLoadingJobs(false);
            }
          }
        } catch (e) {}
        if (isMounted) {
          fetchScheduledJobs(true);
        }
      };
      loadCachedCalendar();
    }
    return () => { isMounted = false; };
  }, [screen, userRole]);

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const userDataStr = await AsyncStorage.getItem('user_data');
      
      if (userDataStr) {
        const user = JSON.parse(userDataStr);
        const fullName = user.full_name || user.username || 'User';
        const firstName = fullName.split(' ')[0];
        const city = user.city || 'Pune';
        const state = user.state || 'Maharashtra';
        
        setUserData({
          name: firstName,
          location: `${city}, ${state}`
        });
      }
    } catch (error) {
      console.log('Error fetching user data:', error);
    }
  };

  const fetchScheduledJobs = async (silent = false) => {
    try {
      if (!silent) {
        setLoadingJobs(true);
      }
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      console.log('[CAL] Worker Calendar: Fetching scheduled jobs...', 'User Role:', userRole);
      
      // Organization workers fetch their assigned work
      if (userRole === "organization_worker") {
        const tokenStr = await AsyncStorage.getItem('org_worker_token');
        const workerDataStr = await AsyncStorage.getItem('org_worker_data');
        
        if (tokenStr && workerDataStr) {
          const token = JSON.parse(tokenStr);
          const workerData = JSON.parse(workerDataStr);
          const workerId = token.worker_id || workerData.id;
          
          console.log('[CAL] Fetching org worker assigned work for calendar - Worker ID:', workerId);
          
          // Fetch assigned and in-progress work
          const [assignedResponse, inProgressResponse] = await Promise.all([
            fetch(API_ENDPOINTS.ORG_WORKER_ASSIGNED(workerId), {
              headers: {
                'Content-Type': 'application/json',
                'X-Worker-ID': workerId.toString(),
              },
            }),
            fetch(API_ENDPOINTS.ORG_WORKER_IN_PROGRESS(workerId), {
              headers: {
                'Content-Type': 'application/json',
                'X-Worker-ID': workerId.toString(),
              },
            }),
          ]);
          
          const assignedData = await assignedResponse.json();
          const inProgressData = await inProgressResponse.json();
          
          console.log('[CAL] Org worker - Assigned:', assignedData);
          console.log('[CAL] Org worker - In Progress:', inProgressData);
          
          const allWork = [
            ...(assignedData.success && assignedData.work ? assignedData.work : []),
            ...(inProgressData.success && inProgressData.work ? inProgressData.work : []),
          ];
          
          // Transform to match expected format
          const transformedWork = allWork.map(work => ({
            id: work.id,
            service_category: work.title,
            client_name: work.client,
            required_date: work.assigned_at || new Date().toISOString(),
            required_time: work.time || 'TBD',
            work_address: work.location,
            status: work.status === 'in_progress' ? 'IN_PROGRESS' : 'SCHEDULED',
          }));
          
          setScheduledJobs(transformedWork);
          AsyncStorage.setItem(`@cache_worker_calendar_${userRole}`, JSON.stringify(transformedWork)).catch(() => {});
        } else {
          console.log('[CAL] No org worker token found');
          setScheduledJobs([]);
        }
      } else {
        // Individual workers fetch their scheduled work requests
        const token = await AsyncStorage.getItem('access_token');
        
        if (token) {
          const response = await fetch(
            `${API_ENDPOINTS.JOBS_WORK_REQUESTS}?status=SCHEDULED`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          const data = await response.json();
          console.log('[CAL] Worker Calendar API Response:', data);
          
          if (data.success) {
            console.log('[CAL] Scheduled jobs found:', data.work_requests?.length || 0);
            const jobsList = data.work_requests || [];
            setScheduledJobs(jobsList);
            AsyncStorage.setItem(`@cache_worker_calendar_${userRole}`, JSON.stringify(jobsList)).catch(() => {});
          } else {
            console.log('[CAL] API returned error:', data.error);
            setScheduledJobs([]);
          }
        } else {
          console.log('[CAL] No auth token found');
          setScheduledJobs([]);
        }
      }
    } catch (error) {
      console.log('[FAIL] Error fetching scheduled jobs:', error);
      setScheduledJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };


  useEffect(() => {

    if (menuOpen) {

      Animated.parallel([

        Animated.spring(drawerX, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 55,
        }),

        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),

      ]).start();

    } else {

      Animated.parallel([

        Animated.timing(drawerX, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),

        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),

      ]).start();

    }

  }, [menuOpen]);


  const closeMenu = () => {
    setMenuOpen(false);
  };


  /* ============================================================
     HOME
  ============================================================ */

  if (screen === "home") {

    // Determine which home screen to show based on user role
    let HomeComponent;
    if (userRole === "organization_admin") {
      HomeComponent = OrganizationAdminHome;
    } else if (userRole === "organization_worker") {
      HomeComponent = OrganizationWorkerHome;
    } else {
      // Default to individual worker
      HomeComponent = IndividualWorkerHome;
    }

    return (
      <View style={{ flex: 1 }}>

        <MainLayout active="home" go={go} userRole={userRole} language={language}>

          <HomeComponent
            screen={screen}
            go={go}
            search={search}
            setSearch={setSearch}
            setSelectedJob={setSelectedJob}
            SectionTitle={SectionTitle}
            JobCard={JobCard}
            language={language}
            onMenuPress={() => setMenuOpen(true)}  // Open the sidebar menu
          />

        </MainLayout>


        <FloatingChatbot
          onPress={() => go("chatbot")}
        />


        {/* SIDE MENU */}

        {menuOpen && (

          <View
            style={styles.menuOverlay}
            pointerEvents="box-none"
          >

            <Animated.View
              style={[
                styles.menuBackdrop,
                { opacity: overlayOpacity },
              ]}
            >

              <TouchableOpacity
                style={{ flex: 1 }}
                activeOpacity={1}
                onPress={closeMenu}
              />

            </Animated.View>


            <Animated.View
              style={[
                styles.sideMenu,
                {
                  transform: [
                    {
                      translateX: drawerX,
                    },
                  ],
                },
              ]}
            >

              <TouchableOpacity
                style={styles.drawerClose}
                onPress={closeMenu}
              >

                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color="#fff"
                />

              </TouchableOpacity>


              <ScrollView
                style={styles.drawerScroll}
                accessibilityLabel={translate('dashboardNavigationMenu', language)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.drawerScrollContent}
                keyboardShouldPersistTaps="handled"
              >

              <View style={styles.menuProfile}>

                <View style={styles.menuProfileIcon}>

                  <MaterialCommunityIcons
                    name="account"
                    size={39}
                    color={PURPLE}
                  />

                </View>


                <View style={{ flex: 1 }}>

                  <Text style={styles.menuUserName}>
                    {userData.name}
                  </Text>

                  <Text style={styles.menuLocation}>
                    {userData.location}
                  </Text>

                </View>

              </View>


              <View style={styles.menuDivider} />


              <MenuItem
                icon="home-outline"
                title={translate('home', language)}
                active={screen === "home"}
                onPress={() => {
                  closeMenu();
                  go("home");
                }}
              />


              <MenuItem
                icon="briefcase-outline"
                title={translate('jobsNearYou', language)}
                active={screen === "jobs"}
                onPress={() => {
                  closeMenu();
                  go("jobs");
                }}
              />

              <MenuItem
                icon="calendar-month-outline"
                title={translate('myCalendar', language)}
                active={screen === "calendar"}
                onPress={() => {
                  closeMenu();
                  go("calendar");
                }}
              />

              <MenuItem
                icon="account-outline"
                title={translate('profile', language)}
                active={screen === "profile"}
                onPress={() => {
                  closeMenu();
                  go("profile");
                }}
              />


              {/* BUY SUBSCRIPTION IN DRAWER */}

              <MenuItem
                icon="crown-outline"
                title={translate('buySubscription', language)}
                active={screen === "buySubscription"}
                onPress={() => {
                  closeMenu();
                  go("buySubscription");
                }}
              />


              <MenuItem
                icon="chart-line"
                title={translate('earningsProgress', language)}
                active={screen === "earnings"}
                onPress={() => {
                  closeMenu();
                  go("earnings");
                }}
              />


              <MenuItem
                icon="cog-outline"
                title={translate('settings', language)}
                onPress={() => {
                  closeMenu();
                  go("settings");
                }}
              />


              <MenuItem
                icon="help-circle-outline"
                title={translate('helpSupport', language)}
                onPress={() => {
                  closeMenu();
                  go("helpSupport");
                }}
              />


              <View style={styles.menuBottomDivider} />


              <MenuItem
                icon="robot-outline"
                title={translate('aiHelpAssistant', language)}
                onPress={() => {
                  closeMenu();
                  go("chatbot");
                }}
              />


              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => {

                  closeMenu();

                  Alert.alert(
                    translate('logout', language),
                    translate('logoutConfirmation', language),
                    [
                      {
                        text: translate('cancel', language),
                        style: "cancel",
                      },
                      {
                        text: translate('logout', language),
                        style: "destructive",
                        onPress: async () => {
                          try {
                            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                            const role = await AsyncStorage.getItem('user_role');
                            const savedLang = await AsyncStorage.getItem('selected_language');
                            await AsyncStorage.clear();
                            if (savedLang) {
                              await AsyncStorage.setItem('selected_language', savedLang);
                            }
                            if (role === 'organization_admin' || role === 'organization_worker') {
                              go("organizationLogin");
                            } else {
                              go("login");
                            }
                          } catch (e) {
                            go("login");
                          }
                        },
                      },
                    ]
                  );

                }}
              >

                <View style={styles.logoutIconBox}>

                  <MaterialCommunityIcons
                    name="logout"
                    size={25}
                    color="#FF6B6B"
                  />

                </View>


                <Text style={styles.logoutText}>
                  {translate('logout', language)}
                </Text>

              </TouchableOpacity>

              </ScrollView>

            </Animated.View>

          </View>

        )}

      </View>
    );
  }

  /* ============================================================
     REQUESTS
  ============================================================ */

  if (screen === "requests") {

    return (
      <MainLayout
        active="home"
        go={go}
        language={language}
        title={translate('workRequests', language)}
      >

        <Text style={styles.requestPageSubtitle}>
          {translate('requestsReceived', language)}
        </Text>

        <RequestCard
          icon="account-outline"
          name="Rahul Sharma"
          job="Electrician Required"
          location="Kothrud, Pune"
          time="10 min ago"
          newRequest
        />


        <RequestCard
          icon="account-outline"
          name="Amit Patil"
          job="Plumber Required"
          location="Baner, Pune"
          time="30 min ago"
          newRequest
        />


        <Text style={styles.requestSectionTitle}>
          {translate('organizationRequests', language)}
        </Text>


        <TouchableOpacity
          style={styles.organizationRequestCard}
          onPress={() => {
            Alert.alert(
              translate('organizationRequest', language),
              "ABC Facility Services wants to hire you."
            );
          }}
          activeOpacity={0.85}
        >

          <View style={styles.organizationIcon}>

            <MaterialCommunityIcons
              name="office-building-outline"
              size={27}
              color={PURPLE}
            />

          </View>


          <View style={{ flex: 1 }}>

            <View style={styles.organizationTitleRow}>

              <Text style={styles.fullRequestTitle}>
                ABC Facility Services
              </Text>

              <View style={styles.organizationBadge}>

                <Text style={styles.organizationBadgeText}>
                  ORGANIZATION
                </Text>

              </View>

            </View>


            <Text style={styles.fullRequestJob}>
              Electrician | Maintenance
            </Text>

            <Text style={styles.fullRequestLocation}>
              Pune
            </Text>

            <Text style={styles.organizationRate}>
              Rs. 1,000 / Day
            </Text>

          </View>

        </TouchableOpacity>


        <TouchableOpacity
          style={styles.addRequestButton}
          onPress={() => {

            Alert.alert(
              translate('addRequest', language),
              translate('selectRequestType', language),
              [
                {
                  text: translate('clientRequest', language),
                  onPress: () => {},
                },
                {
                  text: translate('organizationRequest', language),
                  onPress: () => {},
                },
                {
                  text: translate('cancel', language),
                  style: "cancel",
                },
              ]
            );

          }}
          activeOpacity={0.85}
        >

          <MaterialCommunityIcons
            name="plus"
            size={23}
            color="#fff"
          />

          <Text style={styles.addRequestText}>
            {translate('addRequest', language)}
          </Text>

        </TouchableOpacity>

      </MainLayout>
    );
  }


  /* ============================================================
     VOICE ASSISTANT
  ============================================================ */

  if (
    screen === "voiceassistant" ||
    screen === "voiceAssistant"
  ) {

    return (
      <SafeAreaView style={styles.safe}>

        <StatusBar
          barStyle="dark-content"
          backgroundColor={BG}
        />

        <View style={styles.voicePage}>

          <TouchableOpacity
            style={styles.voiceBack}
            onPress={() => go("home")}
            activeOpacity={0.7}
          >

            <MaterialCommunityIcons
              name="arrow-left"
              size={23}
              color={TEXT}
            />

          </TouchableOpacity>


          <View style={styles.voiceContainer}>

            <View style={styles.voiceCircle}>

              <MaterialCommunityIcons
                name="microphone"
                size={55}
                color={PURPLE}
              />

            </View>


        <Text style={styles.voiceTitle}>
          {translate('whatJobLookingFor', language)}
        </Text>


        <Text style={styles.voiceSubtitle}>
          {translate('speakJobSkill', language)}
        </Text>


            <TouchableOpacity
              style={styles.voiceButtonLarge}
              onPress={handleVoicePress}
              activeOpacity={0.85}
            >

              <MaterialCommunityIcons
                name={isListening ? "microphone-off" : "microphone"}
                size={28}
                color="#fff"
              />

              <Text style={styles.voiceButtonText}>
                {isListening ? translate('listening', language) : translate('tapToSpeak', language)}
              </Text>

            </TouchableOpacity>


            <Text style={styles.voiceExample}>
              {translate('exampleElectricianJobs', language)}
            </Text>

          </View>

        </View>

      </SafeAreaView>
    );
  }


  /* ============================================================
     CALENDAR
  ============================================================ */

  if (screen === "calendar") {
    // Import WorkerCalendar component from separate file
    const WorkerCalendar = require('./WorkerCalendar').default;

    return (
      <WorkerCalendar
        go={go}
        setSelectedJob={setSelectedJob}
        language={language}
        userRole={userRole}
        onVoicePress={handleCalendarVoiceGuidance}
      />
    );
  }


  /* ============================================================
     EARNINGS
  ============================================================ */

  if (screen === "earnings") {
    const EarningsScreen = require('./EarningsScreen').default;

    return (
      <EarningsScreen
        go={go}
        navigation={null}
        language={language}
        userRole={userRole}
      />
    );
  }


  /* ============================================================
     SETTINGS
  ============================================================ */

  if (screen === "settings") {

    return (
      <MainLayout
        active="home"
        go={go}
        language={language}
        title={translate('settings', language)}
      >

        <TouchableOpacity
          style={styles.settingCard}
          onPress={() => go("profile")}
          activeOpacity={0.85}
        >

          <MaterialCommunityIcons
            name="account-cog-outline"
            size={30}
            color={PURPLE}
          />

          <View style={{ flex: 1, marginLeft: 12 }}>

            <Text style={styles.settingTitle}>
              {translate('accountSettings', language)}
            </Text>

            <Text style={styles.settingText}>
              {translate('manageAccountPreferences', language)}
            </Text>

          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={MUTED}
          />

        </TouchableOpacity>


        <TouchableOpacity
          style={styles.settingCard}
          onPress={() => go("notifications")}
          activeOpacity={0.85}
        >

          <MaterialCommunityIcons
            name="bell-outline"
            size={30}
            color={PURPLE}
          />

          <View style={{ flex: 1, marginLeft: 12 }}>

            <Text style={styles.settingTitle}>
              {translate('notifications', language)}
            </Text>

            <Text style={styles.settingText}>
              {translate('manageNotificationPreferences', language)}
            </Text>

          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={MUTED}
          />

        </TouchableOpacity>


        <TouchableOpacity
          style={styles.settingCard}
          onPress={() =>
            Alert.alert(
              translate('privacySecurity', language),
              translate('privacySecurityDescription', language)
            )
          }
          activeOpacity={0.85}
        >

          <MaterialCommunityIcons
            name="shield-check-outline"
            size={30}
            color={PURPLE}
          />

          <View style={{ flex: 1, marginLeft: 12 }}>

            <Text style={styles.settingTitle}>
              {translate('privacySecurity', language)}
            </Text>

            <Text style={styles.settingText}>
              {translate('keepAccountSecure', language)}
            </Text>

          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={MUTED}
          />

        </TouchableOpacity>


        {/* SUBSCRIPTION SETTING */}

        <TouchableOpacity
          style={styles.settingCard}
          onPress={() => go("buySubscription")}
          activeOpacity={0.85}
        >

          <MaterialCommunityIcons
            name="crown-outline"
            size={30}
            color={PURPLE}
          />

          <View style={{ flex: 1, marginLeft: 12 }}>

            <Text style={styles.settingTitle}>
              {translate('subscription', language)}
            </Text>

            <Text style={styles.settingText}>
              {translate('viewPlansUpgrade', language)}
            </Text>

          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={MUTED}
          />

        </TouchableOpacity>

      </MainLayout>
    );
  }


  /* ============================================================
     HELP
  ============================================================ */

  if (screen === "help") {

    return (
<MainLayout
active="home"
go={go}
language={language}
title={translate('helpSupport', language)}
>

        <View style={styles.helpHero}>

          <View style={styles.simpleIconCircle}>

            <MaterialCommunityIcons
              name="help-circle-outline"
              size={40}
              color={PURPLE}
            />

          </View>


          <Text style={styles.simplePageTitle}>
            {translate('howCanWeHelp', language)}
          </Text>


          <Text style={styles.simplePageText}>
            {translate('helpDescription', language)}
          </Text>

        </View>


        <TouchableOpacity
          style={styles.helpCard}
          onPress={() => go("chatbot")}
        >

          <MaterialCommunityIcons
            name="robot-outline"
            size={30}
            color={PURPLE}
          />

          <View style={{ flex: 1, marginLeft: 12 }}>

            <Text style={styles.settingTitle}>
              {translate('askAiAssistant', language)}
            </Text>

            <Text style={styles.settingText}>
              {translate('instantAppAnswers', language)}
            </Text>

          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={MUTED}
          />

        </TouchableOpacity>


        <TouchableOpacity
          style={styles.helpCard}
          onPress={() => {
            Alert.alert(
              translate('support', language),
              translate('supportResponseMessage', language)
            );
          }}
        >

          <MaterialCommunityIcons
            name="headset"
            size={30}
            color={PURPLE}
          />

          <View style={{ flex: 1, marginLeft: 12 }}>

            <Text style={styles.settingTitle}>
              {translate('contactSupport', language)}
            </Text>

            <Text style={styles.settingText}>
              {translate('talkToSupport', language)}
            </Text>

          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={MUTED}
          />

        </TouchableOpacity>

      </MainLayout>
    );
  }


  return null;
}


/* ============================================================
   SUBSCRIPTION PLAN
============================================================ */

function SubscriptionPlan({
  icon,
  title,
  price,
  period,
  description,
  features,
  buttonText,
  onPress,
  popular,
}) {

  return (
    <View
      style={[
        styles.subscriptionPlanCard,
        popular && styles.subscriptionPlanPopular,
      ]}
    >

      {popular && (

        <View style={styles.mostPopularBadge}>

          <MaterialCommunityIcons
            name="star"
            size={13}
            color="#fff"
          />

          <Text style={styles.mostPopularText}>
            {translate('mostPopular', language)}
          </Text>

        </View>

      )}


      <View style={styles.planTopRow}>

        <View style={styles.planIconBox}>

          <MaterialCommunityIcons
            name={icon}
            size={28}
            color={PURPLE}
          />

        </View>


        <View style={{ flex: 1, marginLeft: 11 }}>

          <Text style={styles.planTitle}>
            {title}
          </Text>

          <Text style={styles.planDescription}>
            {description}
          </Text>

        </View>

      </View>


      <View style={styles.planPriceRow}>

        <Text style={styles.planPrice}>
          {price}
        </Text>

        <Text style={styles.planPeriod}>
          {period}
        </Text>

      </View>


      <View style={styles.planDivider} />


      <View style={styles.planFeatures}>

        {features.map((feature, index) => (

          <View
            key={index}
            style={styles.planFeatureRow}
          >

            <MaterialCommunityIcons
              name="check-circle"
              size={17}
              color={GREEN}
            />

            <Text style={styles.planFeatureText}>
              {feature}
            </Text>

          </View>

        ))}

      </View>


      <TouchableOpacity
        style={[
          styles.planButton,
          popular && styles.planButtonPopular,
        ]}
        onPress={onPress}
        activeOpacity={0.85}
      >

        <Text style={styles.planButtonText}>
          {buttonText}
        </Text>

        <MaterialCommunityIcons
          name="arrow-right"
          size={18}
          color="#fff"
        />

      </TouchableOpacity>

    </View>
  );
}


/* ============================================================
   EARNINGS HELPERS
============================================================ */

function EarningSummaryRow({
  label,
  amount,
  last,
}) {

  return (
    <View
      style={[
        styles.earningSummaryRow,
        last && styles.earningSummaryRowLast,
      ]}
    >

      <Text style={styles.earningSummaryLabel}>
        {label}
      </Text>

      <Text style={styles.earningSummaryAmount}>
        {amount}
      </Text>

    </View>
  );
}


function RecentPayment({
  icon,
  title,
  date,
  amount,
  last,
}) {

  return (
    <View
      style={[
        styles.recentPaymentRow,
        last && styles.recentPaymentRowLast,
      ]}
    >

      <View style={styles.recentPaymentIconBox}>

        <MaterialCommunityIcons
          name={icon}
          size={21}
          color={PURPLE}
        />

      </View>

      <View style={styles.recentPaymentContent}>

        <Text style={styles.recentPaymentTitle}>
          {title}
        </Text>

        <Text style={styles.recentPaymentDate}>
          {date}
        </Text>

      </View>

      <Text style={styles.recentPaymentAmount}>
        {amount}
      </Text>

    </View>
  );
}


/* ============================================================
   FLOATING CHATBOT
============================================================ */

function FloatingChatbot({ onPress }) {

  const floatAnim = useRef(
    new Animated.Value(0)
  ).current;

  const scaleAnim = useRef(
    new Animated.Value(1)
  ).current;


  useEffect(() => {

    Animated.loop(

      Animated.sequence([

        Animated.parallel([

          Animated.timing(floatAnim, {
            toValue: -7,
            duration: 900,
            useNativeDriver: true,
          }),

          Animated.timing(scaleAnim, {
            toValue: 1.04,
            duration: 900,
            useNativeDriver: true,
          }),

        ]),

        Animated.parallel([

          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),

          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),

        ]),

      ])

    ).start();

  }, []);


  return (
    <Animated.View
      style={[
        styles.chatbotFloating,
        {
          transform: [
            { translateY: floatAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={styles.chatbotButton}
      >

        <MaterialCommunityIcons
          name="robot-outline"
          size={28}
          color="#fff"
        />

      </TouchableOpacity>


      <View style={styles.chatbotDot} />

    </Animated.View>
  );
}


/* ============================================================
   SIDE MENU ITEM
============================================================ */

function MenuItem({
  icon,
  title,
  active,
  onPress,
}) {

  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        active && styles.menuItemActive,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={title}
    >

      <View style={styles.menuIconBox}>

        <MaterialCommunityIcons
          name={icon}
          size={25}
          color="#fff"
        />

      </View>


      <Text style={styles.menuItemText}>
        {title}
      </Text>


      <MaterialCommunityIcons
        name="chevron-right"
        size={21}
        color="rgba(255,255,255,0.65)"
      />

    </TouchableOpacity>
  );
}


/* ============================================================
   MAIN LAYOUT
============================================================ */

function MainLayout({
  children,
  active,
  go,
  title,
  hideHeaderRight = false,
  userRole,
  language = "English",
}) {

  // ============================================================
  // CENTRAL VOICE MIC (STT -> NAVIGATION)
  // Tapping the central Voice button starts recognition on the
  // current screen. The FINAL transcript is resolved to a screen
  // and navigation happens there; no separate Voice Assistant
  // screen opens. Reuses the shared useSpeechToText hook and the
  // main `go` navigation. Non-continuous listening.
  // ============================================================

  const {
    start: startNavSTT,
    stop: stopNavSTT,
    reset: resetNavSTT,
    listening: navListening,
    transcript: navTranscript,
  } = useSpeechToText(language);

  const navVoiceActive = useRef(false);

  const handleCentralVoicePress = () => {
    if (navListening) {
      stopNavSTT();
      return;
    }
    resetNavSTT();
    navVoiceActive.current = true;
    startNavSTT();
  };

  useEffect(() => {
    if (!navVoiceActive.current || navListening) {
      return;
    }

    navVoiceActive.current = false;

    const spoken = (navTranscript || '').trim();

    if (!spoken) {
      return;
    }

    const target = resolveVoiceNavigationIntent(spoken, language);

    if (target) {
      go(target);
    }
  }, [navListening, navTranscript, language, go]);

  return (
    <SafeAreaView style={styles.safe}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor={BG}
      />


      <View style={{ flex: 1 }}>

        {title && (

          <View style={styles.mainHeader}>

            <TouchableOpacity
              onPress={() => go("home")}
              style={styles.headerBack}
            >

              <MaterialCommunityIcons
                name="arrow-left"
                size={23}
                color={TEXT}
              />

            </TouchableOpacity>


            <Text style={styles.mainHeaderTitle}>
              {title}
            </Text>

          </View>

        )}


        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 18,
            paddingBottom: 105,
          }}
        >

          {children}

        </ScrollView>


        <BottomNav
          active={active}
          go={go}
          language={language}
          onVoicePress={handleCentralVoicePress}
        />

      </View>

    </SafeAreaView>
  );
}


/* ============================================================
   CENTRAL VOICE NAVIGATION INTENT RESOLVER
   Maps the final STT transcript to a destination screen.
   Matches plain English commands and the current language's
   screen labels. Returns null when no screen intent is found.
============================================================ */

function resolveVoiceNavigationIntent(transcript, language) {
  const text = String(transcript || '').trim().toLowerCase();

  if (!text) {
    return null;
  }

  const localized = {
    home: translate('home', language),
    jobs: translate('jobs', language),
    calendar: translate('calendar', language),
    profile: translate('profile', language),
    earnings: translate('earnings', language),
    settings: translate('settings', language),
    helpSupport: translate('helpSupport', language),
  };

  const commands = [
    ['home', ['home']],
    ['jobs', ['jobs', 'job']],
    ['calendar', ['calendar', 'schedule', 'calender']],
    ['profile', ['profile', 'account']],
    ['earnings', ['earnings', 'income']],
    ['settings', ['settings', 'setting']],
    ['helpSupport', ['help', 'support']],
  ];

  for (let i = 0; i < commands.length; i += 1) {
    const [screen, keywords] = commands[i];
    const label = localized[screen];
    const terms = label ? keywords.concat([label]) : keywords;

    if (terms.some((t) => text.includes(String(t).toLowerCase()))) {
      return screen;
    }
  }

  return null;
}


/* ============================================================
   BOTTOM NAV
============================================================ */

function BottomNav({
  active,
  go,
  userRole,
  language,
  onVoicePress,
}) {

  return (
    <View style={styles.bottomNav}>

      <NavItem
        icon="home"
        title={translate('home', language)}
        active={active === "home"}
        onPress={() => go("home")}
      />

      <NavItem
        icon="briefcase-outline"
        title={translate('jobs', language)}
        active={active === "jobs"}
        onPress={() => go("jobs")}
      />


      <TouchableOpacity
        style={styles.voiceNavButton}
        onPress={onVoicePress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={translate('voiceAssistantTitle', language)}
      >

        <View style={styles.voiceNavCircle}>

          <MaterialCommunityIcons
            name="microphone"
            size={25}
            color="#fff"
          />

        </View>


        <Text
          style={[
            styles.navText,
            (active === "voiceassistant" ||
              active === "voiceAssistant") && {
              color: PURPLE,
            },
          ]}
        >
          {translate('voice', language)}
        </Text>

      </TouchableOpacity>

      <NavItem
        icon="calendar-month-outline"
        title={translate('calendar', language)}
        active={active === "calendar"}
        onPress={() => go("calendar")}
      />

      <NavItem
        icon="account-outline"
        title={translate('profile', language)}
        active={active === "profile"}
        onPress={() => go("profile")}
      />

    </View>
  );
}


/* ============================================================
   NAV ITEM
============================================================ */

function NavItem({
  icon,
  title,
  active,
  onPress,
}) {

  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
    >

      <MaterialCommunityIcons
        name={icon}
        size={23}
        color={active ? PURPLE : MUTED}
      />


      <Text
        style={[
          styles.navText,
          active && {
            color: PURPLE,
          },
        ]}
      >
        {title}
      </Text>

    </TouchableOpacity>
  );
}


/* ============================================================
   SECTION TITLE
============================================================ */

function SectionTitle({
  title,
  action,
  onPress,
}) {

  return (
    <View style={styles.sectionTitleRow}>

      <Text style={styles.sectionHeading}>
        {title}
      </Text>


      {action && (

        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
        >

          <Text style={styles.purpleText}>
            {action}
          </Text>

        </TouchableOpacity>

      )}

    </View>
  );
}


/* ============================================================
   JOB CARD
============================================================ */
function JobCard({
  icon,
  title,
  location,
  rate,
  time,
  tag,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.jobIconBox}>
        <MaterialCommunityIcons
          name={icon}
          size={25}
          color={PURPLE}
        />
      </View>

      <View style={styles.jobContent}>
        <View style={styles.jobTitleRow}>
          <Text style={styles.jobTitle}>
            {title}
          </Text>

          <View style={styles.jobTag}>
            <Text style={styles.jobTagText}>
              {tag}
            </Text>
          </View>
        </View>

        <Text style={styles.jobLocation}>
          {location}
        </Text>

        <Text style={styles.jobRate}>
          {rate}
        </Text>

        <Text style={styles.jobTime}>
          {time}
        </Text>
      </View>

      <MaterialCommunityIcons
        name="chevron-right"
        size={22}
        color={MUTED}
      />
    </TouchableOpacity>
  );
}

/* ============================================================
   REQUEST CARD
============================================================ */

function RequestCard({
  icon,
  name,
  job,
  location,
  time,
  newRequest,
}) {

  return (
    <TouchableOpacity
      style={styles.fullRequestCard}
      onPress={() => {

        Alert.alert(
          translate('clientRequest', language),
          `${name} ${translate('wantsToHireYouFor', language)} ${job}.`
        );

      }}
      activeOpacity={0.85}
    >

      <View style={styles.fullRequestIcon}>

        <MaterialCommunityIcons
          name={icon}
          size={26}
          color={PURPLE}
        />

      </View>


      <View style={{ flex: 1 }}>

        <Text style={styles.fullRequestTitle}>
          {name}
        </Text>

        <Text style={styles.fullRequestJob}>
          {job}
        </Text>

        <Text style={styles.fullRequestLocation}>
          {location}
        </Text>

        <Text style={styles.fullRequestTime}>
          {time}
        </Text>

      </View>


      {newRequest && (

        <View style={styles.newBadge}>

          <Text style={styles.newBadgeText}>
            {translate('new', language)}
          </Text>

        </View>

      )}

    </TouchableOpacity>
  );
}


/* ============================================================
   CALENDAR JOB
============================================================ */

function CalendarJob({
  time,
  ampm,
  title,
  location,
  rate,
  clientName,
  onPress,
}) {

  return (
    <TouchableOpacity
      style={styles.calendarJobFull}
      onPress={onPress}
      activeOpacity={0.85}
    >

      <View style={styles.calendarJobTimeBox}>

        <Text style={styles.calendarJobTimeBig}>
          {time}
        </Text>

        <Text style={styles.calendarJobAM}>
          {ampm}
        </Text>

      </View>


      <View style={styles.calendarJobDivider} />


      <View style={{ flex: 1 }}>

        <Text style={styles.calendarJobFullTitle}>
          {title}
        </Text>

        {clientName && (
          <Text style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
            {translate('clientLabel', language)} {clientName}
          </Text>
        )}

        <Text style={styles.calendarJobFullLocation}>
          {location}
        </Text>

        <Text style={styles.calendarJobFullRate}>
          {rate}
        </Text>

      </View>


      <MaterialCommunityIcons
        name="chevron-right"
        size={22}
        color={MUTED}
      />

    </TouchableOpacity>
  );
}


/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: BG,
  },


  /* HEADER */

  dashboardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  headerUserInfo: {
    marginLeft: 10,
    flexShrink: 1,
  },

  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },

  greeting: {
    fontSize: 21,
    fontWeight: "900",
    color: TEXT,
  },

  location: {
    fontSize: 11,
    color: MUTED,
    marginTop: 4,
  },

  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },

  notificationDot: {
    position: "absolute",
    right: 8,
    top: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: RED,
  },


  /* SEARCH */

  dashboardSearch: {
    height: 52,
    backgroundColor: "#fff",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 13,
    paddingRight: 6,
    marginTop: 15,
    marginBottom: 20,
  },

  dashboardSearchInput: {
    flex: 1,
    height: 50,
    marginLeft: 8,
    color: TEXT,
    fontSize: 13,
  },

  micButton: {
    width: 39,
    height: 39,
    borderRadius: 11,
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },

  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },


  /* SECTION */

  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 11,
  },

  sectionHeading: {
    fontSize: 16,
    fontWeight: "900",
    color: TEXT,
  },

  purpleText: {
    color: PURPLE,
    fontSize: 11,
    fontWeight: "800",
  },


  /* REQUEST */

  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  requestIconBox: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  requestContent: {
    flex: 1,
    marginLeft: 11,
  },

  requestTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: TEXT,
  },

  requestSubtitle: {
    fontSize: 10,
    color: MUTED,
    marginTop: 3,
  },

  requestStats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },

  requestStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  requestStatText: {
    fontSize: 9,
    color: MUTED,
    fontWeight: "700",
  },

  requestActions: {
    alignItems: "center",
    gap: 8,
  },

  requestNumber: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  requestNumberText: {
    color: PURPLE,
    fontWeight: "900",
  },

  requestPlus: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  requestTwoCards: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  smallRequestCard: {
    flex: 1,
    minHeight: 70,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  smallRequestIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  smallRequestTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: TEXT,
  },

  smallRequestText: {
    fontSize: 10,
    color: MUTED,
    marginTop: 3,
  },


  /* ==========================================================
     SUBSCRIPTION DASHBOARD CARD
  ========================================================== */

  subscriptionDashboardCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  subscriptionIconBox: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  subscriptionDashboardContent: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  subscriptionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  subscriptionDashboardTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "900",
  },

  subscriptionPopularBadge: {
    backgroundColor: "#EAF8F0",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    marginLeft: 7,
  },

  subscriptionPopularText: {
    color: GREEN,
    fontSize: 7,
    fontWeight: "900",
  },

  subscriptionDashboardSubtitle: {
    color: MUTED,
    fontSize: 10,
    marginTop: 4,
    lineHeight: 15,
  },

  subscriptionMiniFeatures: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 7,
  },

  subscriptionMiniFeature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  subscriptionMiniText: {
    color: MUTED,
    fontSize: 8,
    fontWeight: "700",
  },


  /* ==========================================================
     SUBSCRIPTION PAGE
  ========================================================== */

  subscriptionHero: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 22,
    alignItems: "center",
    marginBottom: 16,
  },

  subscriptionHeroIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  subscriptionHeroTitle: {
    color: TEXT,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 13,
    textAlign: "center",
  },

  subscriptionHeroText: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 7,
  },

  subscriptionPlanCard: {
    backgroundColor: "#fff",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 13,
  },

  subscriptionPlanPopular: {
    borderColor: PURPLE,
    borderWidth: 2,
  },

  mostPopularBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: PURPLE,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    marginBottom: 13,
  },

  mostPopularText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "900",
  },

  planTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  planIconBox: {
    width: 49,
    height: 49,
    borderRadius: 14,
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  planTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "900",
  },

  planDescription: {
    color: MUTED,
    fontSize: 9,
    marginTop: 3,
  },

  planPriceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 15,
  },

  planPrice: {
    color: TEXT,
    fontSize: 28,
    fontWeight: "900",
  },

  planPeriod: {
    color: MUTED,
    fontSize: 10,
    marginLeft: 5,
    marginBottom: 5,
  },

  planDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 13,
  },

  planFeatures: {
    gap: 8,
  },

  planFeatureRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  planFeatureText: {
    color: TEXT,
    fontSize: 10,
    marginLeft: 8,
  },

  planButton: {
    height: 46,
    borderRadius: 12,
    backgroundColor: PURPLE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 16,
  },

  planButtonPopular: {
    backgroundColor: PURPLE,
  },

  planButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },

  subscriptionInfoBox: {
    backgroundColor: "#EEF7F1",
    borderRadius: 14,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },

  subscriptionInfoTitle: {
    color: TEXT,
    fontSize: 11,
    fontWeight: "900",
  },

  subscriptionInfoText: {
    color: MUTED,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },


  /* ==========================================================
     QUICK ACTIONS
  ========================================================== */

  workerActionCards: {
    marginBottom: 20,
    gap: 10,
  },

  workerActionCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 72,
  },

  workerActionIconBox: {
    width: 49,
    height: 49,
    borderRadius: 14,
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  workerActionContent: {
    flex: 1,
    marginLeft: 11,
  },

  workerActionTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "900",
  },

  workerActionSubtitle: {
    color: MUTED,
    fontSize: 10,
    marginTop: 4,
  },


  /* CALENDAR */

  calendarDashboardCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 20,
  },

  calendarHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  calendarHeading: {
    fontSize: 14,
    fontWeight: "900",
    color: TEXT,
  },

  calendarSubHeading: {
    fontSize: 10,
    color: MUTED,
    marginTop: 3,
  },

  calendarIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  calendarWeek: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 13,
  },

  calendarDay: {
    width: 47,
    height: 57,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  calendarDayActive: {
    backgroundColor: PURPLE,
  },

  calendarDayName: {
    fontSize: 8,
    color: MUTED,
    fontWeight: "800",
  },

  calendarDate: {
    fontSize: 16,
    color: TEXT,
    fontWeight: "900",
    marginTop: 4,
  },

  calendarActiveText: {
    color: "#fff",
  },

  calendarDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#fff",
    marginTop: 3,
  },

  upcomingJob: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 12,
    padding: 11,
  },

  upcomingJobLine: {
    width: 4,
    height: 48,
    borderRadius: 4,
    backgroundColor: PURPLE,
    marginRight: 10,
  },

  upcomingJobTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: TEXT,
  },

  upcomingJobTime: {
    fontSize: 10,
    color: MUTED,
    marginTop: 3,
  },

  upcomingJobPrice: {
    fontSize: 11,
    color: GREEN,
    fontWeight: "900",
    marginTop: 3,
  },


  /* JOB CARD */

  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  jobIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  jobContent: {
    flex: 1,
  },

  jobTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  jobTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: "900",
    color: TEXT,
  },

  jobTag: {
    backgroundColor: "#EEF7F1",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },

  jobTagText: {
    color: GREEN,
    fontSize: 7,
    fontWeight: "900",
  },

  jobLocation: {
    color: MUTED,
    fontSize: 10,
    marginTop: 4,
  },

  jobTime: {
    color: MUTED,
    fontSize: 9,
    marginTop: 3,
  },

  jobRate: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 3,
  },


  /* BOTTOM NAV */

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: verticalScale(72),
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: moderateScale(4),
  },

  navItem: {
    width: "20%",
    alignItems: "center",
    justifyContent: "center",
  },

  navText: {
    fontSize: moderateScale(9),
    color: MUTED,
    marginTop: verticalScale(4),
    fontWeight: "700",
  },

  voiceNavButton: {
    width: "20%",
    alignItems: "center",
    justifyContent: "center",
  },

  voiceNavCircle: {
    width: scale(47),
    height: scale(47),
    borderRadius: scale(24),
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(-25),
    borderWidth: 4,
    borderColor: BG,
  },


  /* CHATBOT */

  chatbotFloating: {
    position: "absolute",
    right: moderateScale(18),
    bottom: verticalScale(88),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },

  chatbotButton: {
    width: scale(57),
    height: scale(57),
    borderRadius: scale(29),
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  chatbotDot: {
    position: "absolute",
    right: 1,
    top: 1,
    width: scale(11),
    height: scale(11),
    borderRadius: scale(6),
    backgroundColor: "#4ADE80",
    borderWidth: 2,
    borderColor: "#fff",
  },


  /* SIDE DRAWER */

  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },

  menuBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.50)",
  },

  sideMenu: {
    width: DRAWER_WIDTH,
    height: "100%",
    backgroundColor: PURPLE,
    paddingTop: 45,
    paddingHorizontal: 18,
    elevation: 25,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: {
      width: 6,
      height: 0,
    },
  },

  drawerScroll: {
    flex: 1,
  },

  drawerScrollContent: {
    paddingBottom: 22,
  },

  drawerClose: {
    position: "absolute",
    right: 13,
    top: 18,
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.13)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },

  menuProfile: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 5,
  },

  menuProfileIcon: {
    width: 66,
    height: 66,
    borderRadius: 19,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  menuUserName: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "900",
    marginLeft: 14,
  },

  menuLocation: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginLeft: 14,
    marginTop: 4,
  },

  menuDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginVertical: 17,
  },

  menuItem: {
    height: 59,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 5,
    marginBottom: 5,
  },

  menuItemActive: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  menuIconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  menuItemText: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 14,
  },

  menuBottomDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginTop: 10,
    marginBottom: 10,
  },

  logoutButton: {
    height: 59,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    marginTop: 4,
  },

  logoutIconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutText: {
    color: "#FF6B6B",
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 14,
  },


  /* REQUEST PAGE */

  requestPageSubtitle: {
    color: MUTED,
    fontSize: 12,
    marginBottom: 16,
  },

  fullRequestCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  fullRequestIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  fullRequestTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "900",
  },

  fullRequestJob: {
    color: TEXT,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3,
  },

  fullRequestLocation: {
    color: MUTED,
    fontSize: 10,
    marginTop: 3,
  },

  fullRequestTime: {
    color: MUTED,
    fontSize: 9,
    marginTop: 4,
  },

  newBadge: {
    backgroundColor: "#EAF8F0",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },

  newBadgeText: {
    color: GREEN,
    fontSize: 8,
    fontWeight: "900",
  },

  requestSectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: TEXT,
    marginTop: 10,
    marginBottom: 10,
  },

  organizationRequestCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 13,
    flexDirection: "row",
    marginBottom: 20,
  },

  organizationIcon: {
    width: 49,
    height: 49,
    borderRadius: 14,
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  organizationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  organizationBadge: {
    backgroundColor: "#EEF3FF",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },

  organizationBadgeText: {
    color: PURPLE,
    fontSize: 7,
    fontWeight: "900",
  },

  organizationRate: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 5,
  },

  addRequestButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: PURPLE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },

  addRequestText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },


  /* VOICE */

  voicePage: {
    flex: 1,
    backgroundColor: BG,
  },

  voiceBack: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    margin: 18,
  },

  voiceContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },

  voiceCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 10,
    borderColor: "#E0EBF3",
  },

  voiceTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: TEXT,
    marginTop: 25,
    textAlign: "center",
  },

  voiceSubtitle: {
    color: MUTED,
    marginTop: 7,
  },

  voiceButtonLarge: {
    height: 54,
    paddingHorizontal: 30,
    borderRadius: 28,
    backgroundColor: PURPLE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 25,
  },

  voiceButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },

  voiceExample: {
    color: MUTED,
    fontSize: 11,
    marginTop: 18,
    textAlign: "center",
  },


  /* CALENDAR */

  calendarFullHeader: {
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  /* Client-style Voice Guidance card for the Individual Worker Calendar/Earnings. */
  voiceGuidanceWrap: {
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 12,
  },

  calendarMonth: {
    fontSize: 18,
    fontWeight: "900",
    color: TEXT,
  },

  calendarMonthSub: {
    color: MUTED,
    fontSize: 10,
    marginTop: 4,
  },

  fullCalendar: {
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  fullCalendarDay: {
    width: 42,
    height: 62,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  fullCalendarDayActive: {
    backgroundColor: PURPLE,
  },

  fullCalendarDayName: {
    fontSize: 8,
    color: MUTED,
    fontWeight: "800",
  },

  fullCalendarDate: {
    fontSize: 16,
    color: TEXT,
    fontWeight: "900",
    marginTop: 5,
  },

  fullCalendarDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#fff",
    marginTop: 3,
  },

  calendarJobFull: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  calendarJobTimeBox: {
    width: 55,
    alignItems: "center",
  },

  calendarJobTimeBig: {
    fontSize: 14,
    fontWeight: "900",
    color: TEXT,
  },

  calendarJobAM: {
    fontSize: 9,
    color: MUTED,
    marginTop: 2,
  },

  calendarJobDivider: {
    width: 1,
    height: 50,
    backgroundColor: BORDER,
    marginHorizontal: 11,
  },

  calendarJobFullTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: TEXT,
  },

  calendarJobFullLocation: {
    color: MUTED,
    fontSize: 10,
    marginTop: 4,
  },

  calendarJobFullRate: {
    color: GREEN,
    fontWeight: "900",
    fontSize: 11,
    marginTop: 4,
  },


  /* HEADER OTHER PAGES */

  mainHeader: {
    height: 58,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: BG,
  },

  mainHeaderTitle: {
    flex: 1,
    marginLeft: 10,
    fontSize: 19,
    fontWeight: "900",
    color: TEXT,
  },

  headerBack: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  headerNotificationButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },


  /* EARNINGS PAGE */

  earningsHeroCard: {
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 16,
    padding: 16,
    minHeight: 132,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  earningsHeroContent: {
    flex: 1,
  },

  earningsHeroLabel: {
    color: TEXT,
    fontSize: 11,
    fontWeight: "900",
  },

  earningsHeroAmount: {
    color: TEXT,
    fontSize: 31,
    fontWeight: "900",
    marginTop: 8,
  },

  earningsWalletBox: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.42)",
    alignItems: "center",
    justifyContent: "center",
  },

  earningsSectionTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 10,
  },

  earningsSummaryCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
    marginBottom: 22,
  },

  earningSummaryRow: {
    minHeight: 48,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  earningSummaryRowLast: {
    borderBottomWidth: 0,
  },

  earningSummaryLabel: {
    color: TEXT,
    fontSize: 11,
    fontWeight: "700",
  },

  earningSummaryAmount: {
    color: TEXT,
    fontSize: 11,
    fontWeight: "900",
  },

  recentPaymentsCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
    marginBottom: 10,
  },

  recentPaymentRow: {
    minHeight: 76,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  recentPaymentRowLast: {
    borderBottomWidth: 0,
  },

  recentPaymentIconBox: {
    width: 39,
    height: 39,
    borderRadius: 11,
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  recentPaymentContent: {
    flex: 1,
  },

  recentPaymentTitle: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "900",
  },

  recentPaymentDate: {
    color: MUTED,
    fontSize: 9,
    marginTop: 4,
  },

  recentPaymentAmount: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 8,
  },


  /* SIMPLE PAGES */

  simplePage: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 260,
  },

  simpleIconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  simplePageTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: TEXT,
    marginTop: 15,
    textAlign: "center",
  },

  simplePageText: {
    fontSize: 13,
    color: MUTED,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },

  earningCard: {
    width: "100%",
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 15,
    padding: 18,
    marginTop: 25,
  },

  earningLabel: {
    fontSize: 11,
    color: MUTED,
    fontWeight: "700",
  },

  earningAmount: {
    fontSize: 28,
    color: TEXT,
    fontWeight: "900",
    marginTop: 4,
  },

  earningSmall: {
    fontSize: 10,
    color: GREEN,
    fontWeight: "800",
    marginTop: 4,
  },


  /* SETTINGS */

  settingCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 11,
  },

  settingTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "900",
  },

  settingText: {
    color: MUTED,
    fontSize: 10,
    marginTop: 4,
  },


  /* HELP */

  helpHero: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 25,
    alignItems: "center",
    marginBottom: 15,
  },

  helpCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 11,
  },

});
