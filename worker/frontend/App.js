import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Linking,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import SplashScreen from "./screen/splashscreen";
import Dashboard from "./screen/dashboard";
import WorkerCalendar from "./screen/WorkerCalendar";
import Jobs, { JobCompleted, RateCustomer } from "./screen/jobnear";
import Profile from "./screen/profile";
import WorkerWelcomeScreen from "./screen/WorkerWelcomeScreen";
import SettingsScreen from "./screen/settingscreen";
import LoginScreen from "./screen/login";
import ForgotPassScreen from "./screens/Forgotpassscreen";
import OtpVerifyResetScreen from "./screens/OtpVerifyResetScreen";
import LanguageSelection from "./screen/LanguageSelection";
import ChatbotScreen from "./screen/ChatbotScreen";
import Organization from "./screen/organization";
import AddWorkerorganization from "./screen/AddWorker";
import OrganizationLoggin from "./screen/OLogin";
import OrganizationPerformance from "./screen/Performance";
import EarningsScreen from "./screen/EarningsScreen";
import RegisterScreen from "./screen/RegisterScreen";
import OrganizationRegistrationScreen from "./screen/OrganizationRegistrationScreen";
import WorkRequestsScreen from "./screen/WorkRequestsScreen";
import JobDetailsScreen from "./screen/JobDetailsScreen";
import NavigationMapScreen from "./screen/NavigationMapScreen";
import OtpEntryScreen from "./screen/OtpEntryScreen";
import HelpSupportScreen from "./screen/Helpsupportscreen";
import VoiceResumeScreen from "./screen/VoiceResumeScreen";
import NotificationScreen from "./screen/NotificationScreen";
import NotificationService from './services/NotificationService';

// Organisation System Screens
import OrgAdminDashboard from "./screen/organisation/OrgAdminDashboard";
import OrgAddWorker from "./screen/organisation/OrgAddWorker";
import OrgWorkerLogin from "./screen/organisation/OrgWorkerLogin";
import OrgWorkersList from "./screen/organisation/OrgWorkersList";
import OrgPerformance from "./screen/organisation/OrgPerformance";
import WorkerPerformanceDetail from "./screen/organisation/WorkerPerformanceDetail";
import OrgWorkerJobs from "./screen/organisation/OrgWorkerJobs";
import OrgAssignWork from "./screen/organisation/OrgAssignWork";
import ClientWorkRequestForm from "./screen/organisation/ClientWorkRequestForm";

// import { initializeNotifications, handleNotificationNavigation } from "./services/notification.service"; // TODO: Enable after installing packages


/* ============================================================
   COLORS
============================================================ */

const PURPLE = "#49769F";
const BG = "#F8FAFC";
const TEXT = "#111827";
const MUTED = "#6B7280";
const GREEN = "#24935D";
const RED = "#D94C4C";
const BORDER = "#E0E7ED";
const BLUE = "#1F6CC5";

const DUMMY_PROFILE =
  "https://randomuser.me/api/portraits/men/32.jpg";

/* ============================================================
   TIME FORMATTER
============================================================ */

const formatTime = (seconds) => {
  const value = Math.max(0, Number(seconds) || 0);

  const hours = Math.floor(value / 3600);

  const minutes = Math.floor(
    (value % 3600) / 60
  );

  const remainingSeconds = value % 60;

  return (
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(remainingSeconds).padStart(2, "0")
  );
};

/* ============================================================
   APP
============================================================ */

export default function App() {

  /* ==========================================================
     MAIN NAVIGATION
  ========================================================== */

  const [screen, setScreen] =
    useState("splash");

  const [language, setLanguage] =
    useState("English");

  const [theme, setTheme] = useState("light");

  // User role state for role-based navigation
  const [userRole, setUserRole] = useState("individual_worker"); // individual_worker, organization_admin, organization_worker

  // Forgot password state
  const [resetPhone, setResetPhone] = useState("");

  // Track target screen resolved during splash check
  const initialRouteRef = useRef(null);

  useEffect(() => {
    const checkWorkerSession = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('selected_language');
        if (savedLanguage) {
          setLanguage(savedLanguage);
          console.log('[SESSION] Restored worker language:', savedLanguage);
        }

        const token = (await AsyncStorage.getItem('access_token')) || (await AsyncStorage.getItem('org_worker_token'));
        const role = await AsyncStorage.getItem('user_role');
        const userType = await AsyncStorage.getItem('user_type');
        let roleFromData = null;
        try {
          const userDataStr = await AsyncStorage.getItem('user_data');
          if (userDataStr) {
            const parsed = JSON.parse(userDataStr);
            roleFromData = parsed.role_name || parsed.role;
          }
        } catch (e) {}

        if (token) {
          const effectiveRole = role || userType || roleFromData || 'individual_worker';
          console.log('[SESSION] Valid worker token found. Restoring role:', effectiveRole);
          setUserRole(effectiveRole);

          if (effectiveRole === 'organization_worker') {
            initialRouteRef.current = 'orgWorkerHome';
          } else {
            initialRouteRef.current = 'home';
          }
        } else {
          console.log('[SESSION] No valid worker token found (logged out or fresh). Target screen: language');
          initialRouteRef.current = 'language';
        }
      } catch (err) {
        console.error('[SESSION] Error checking worker session:', err);
        initialRouteRef.current = 'language';
      }
    };

    checkWorkerSession();
  }, []);

  /* ===================================================
     NOTIFICATION SERVICE INITIALIZATION
     Auto-initialize once when user reaches home screen (logged in)
  =================================================== */
  const notificationsInitializedRef = useRef(false);

  useEffect(() => {
    if (screen !== 'home' && screen !== 'orgWorkerHome') return;
    
    const initNotifications = async () => {
      try {
        const justLoggedIn = await AsyncStorage.getItem('@sahayak:just_logged_in');
        const isLogin = justLoggedIn === 'true';

        // Only skip if already initialized in this session AND it's not a fresh login
        if (notificationsInitializedRef.current && !isLogin) return;

        const token = await AsyncStorage.getItem('access_token');
        if (!token) return;

        notificationsInitializedRef.current = true;

        if (isLogin) {
          await AsyncStorage.removeItem('@sahayak:just_logged_in');
          console.log('[NOTIF] Initializing NotificationService with welcome notification on login...');
        } else {
          console.log('[NOTIF] Initializing NotificationService for existing session...');
        }

        await NotificationService.initialize({ isLogin });
        console.log(`[OK] NotificationService auto-initialized (isLogin=${isLogin})`);
      } catch (error) {
        // Silently handle - notification registration may fail if backend endpoint is not ready
        console.log('[WARN] NotificationService init skipped:', error.message);
      }
    };

    initNotifications();
  }, [screen]);

  // State for passing data between screens
  const [routeData, setRouteData] = useState({});

  // Navigation function with logging and data support
  const go = (targetScreen, data = {}) => {
    console.log(`[NAV] Navigation: "${screen}" -> "${targetScreen}"`, data);
    setRouteData(data);
    setScreen(targetScreen);
  };

  useEffect(() => {
    const { setNavigator } = require('./navigation/NavigationService');
    setNavigator((targetScreen, data) => {
      go(targetScreen, data);
    });
  }, [screen]);


  /* ==========================================================
     LOGIN / REGISTRATION
  ========================================================== */

  const [phone, setPhone] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("aditya@example.com");

  const [workType, setWorkType] =
    useState("Electrician");

  const [experience, setExperience] =
    useState("2");

  const [charge, setCharge] =
    useState("800");

  const [visitCharge, setVisitCharge] =
    useState("800");

  const [aadhaar, setAadhaar] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [city, setCity] =
    useState("Pune");

  const [stateName, setStateName] =
    useState("Maharashtra");

  const [pinCode, setPinCode] =
    useState("");

  const [skills, setSkills] =
    useState("");

  /* ==========================================================
     PROFILE
  ========================================================== */

  const [profileImage, setProfileImage] =
    useState(DUMMY_PROFILE);

  /* ==========================================================
     JOB
  ========================================================== */

  const [selectedJob, setSelectedJob] =
    useState("electrician");

  const [search, setSearch] =
    useState("");

  const [jobStatus, setJobStatus] =
    useState("assigned");

  const [responseTime, setResponseTime] =
    useState(7199);

  const [customerPhoneVisible, setCustomerPhoneVisible] =
    useState(false);


  /* ==========================================================
     NAVIGATION
  ========================================================== */

  // Navigation function already defined above (line ~101)
  // Removed duplicate go function

  /* ==========================================================
     OPEN JOBS
  ========================================================== */

  const openJobs = () => {
    setJobStatus("assigned");
    setResponseTime(7199);
    setCustomerPhoneVisible(false);

    go("jobs");
  };

  /* ==========================================================
     ACCEPT JOB
  ========================================================== */

  const acceptJob = () => {
    Alert.alert(
      "Accept Job",
      "Are you sure you want to accept this job?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Accept",
          onPress: () => {
            setJobStatus("accepted");
            setCustomerPhoneVisible(true);
          },
        },
      ]
    );
  };

  /* ==========================================================
     REJECT JOB
  ========================================================== */

  const rejectJob = () => {
    Alert.alert(
      "Reject Job",
      "Are you sure you want to reject this job?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reject",
          style: "destructive",
          onPress: () => {
            setJobStatus("rejected");
            setCustomerPhoneVisible(false);

            go("jobs");
          },
        },
      ]
    );
  };

  /* ==========================================================
     CALL CUSTOMER
  ========================================================== */

  const callCustomer = async () => {
    if (!customerPhoneVisible) {
      Alert.alert(
        "Phone Number Locked",
        "Accept the job first to view the customer's phone number."
      );

      return;
    }

    try {
      await Linking.openURL(
        "tel:9876543210"
      );
    } catch (error) {
      Alert.alert(
        "Call Customer",
        "Customer Number: +91 9876543210"
      );
    }
  };

  /* ==========================================================
     NAVIGATE TO CLIENT
  ========================================================== */

  const navigateToClient = () => {
    Alert.alert(
      "Navigate to Client",
      "Map navigation can be connected later."
    );
  };

  /* ==========================================================
     COMPLETE WORK
  ========================================================== */

  const completeWork = () => {
    setJobStatus("completed");
    go("jobCompleted");
  };

  /* ==========================================================
     PROFILE IMAGE
  ========================================================== */

  const pickProfileImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow gallery permission."
        );

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (
        !result.canceled &&
        result.assets &&
        result.assets[0] &&
        result.assets[0].uri
      ) {
        setProfileImage(
          result.assets[0].uri
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Unable to open gallery."
      );
    }
  };

  /* ============================================================
     SPLASH
  ============================================================ */

  if (screen === "splash") {
    return (
      <SplashScreen
        onFinish={async () => {
          let target = initialRouteRef.current;
          if (!target) {
            try {
              const token = (await AsyncStorage.getItem('access_token')) || (await AsyncStorage.getItem('org_worker_token'));
              const role = await AsyncStorage.getItem('user_role');
              const userType = await AsyncStorage.getItem('user_type');
              const savedLang = await AsyncStorage.getItem('selected_language');
              let roleFromData = null;
              try {
                const userDataStr = await AsyncStorage.getItem('user_data');
                if (userDataStr) {
                  const parsed = JSON.parse(userDataStr);
                  roleFromData = parsed.role_name || parsed.role;
                }
              } catch (e) {}
              const effectiveRole = role || userType || roleFromData || 'individual_worker';
              if (token) {
                setUserRole(effectiveRole);
                target = effectiveRole === 'organization_worker' ? 'orgWorkerHome' : 'home';
              } else {
                target = 'language';
              }
            } catch (e) {
              target = 'language';
            }
          }
          console.log('[SESSION] Worker splash finished, navigating to:', target);
          go(target);
        }}
      />
    );
  }

  /* ============================================================
     LANGUAGE
  ============================================================ */

  if (screen === "language") {
    return (
      <LanguageSelection
        onContinue={async () => {
          try {
            await AsyncStorage.setItem('selected_language', language);
          } catch (e) {}
          go("workerWelcome");
        }}
        onBack={() =>
          go("workerWelcome")
        }
        onLanguage={async (selectedLanguage) => {
          setLanguage(selectedLanguage);
          try {
            await AsyncStorage.setItem('selected_language', selectedLanguage);
          } catch (e) {}
        }}
        language={language}
      />
    );
  }

  /* ============================================================
     WELCOME
  ============================================================ */

  if (screen === "workerWelcome") {
    return (
      <WorkerWelcomeScreen
        language={language}
        onSignIn={() =>
          go("login")
        }
        onOrganizationLogin={() =>
          go("organizationLogin")
        }
        onCreateAccount={() =>
          go("organizationRegistration")
        }
        onBack={() =>
          go("language")
        }
      />
    );
  }

  /* ============================================================
     LOGIN
  ============================================================ */

  if (screen === "login") {
    return (
      <LoginScreen
        language={language}
        onLogin={(role) => {
          // Set user role based on login response
          if (role) {
            setUserRole(role);
          }
          if (role === 'organization_worker') {
            go("orgWorkerHome");
          } else {
            go("home");
          }
        }}
        onRegister={() =>
          go("registration")
        }
        onForgotPassword={() =>
          go("forgotPassword")
        }
        onBack={() =>
          go("workerWelcome")
        }
      />
    );
  }

  /* ============================================================
     FORGOT PASSWORD
  ============================================================ */

  if (screen === "forgotPassword") {
    return (
      <ForgotPassScreen
        onBack={() =>
          go("login")
        }
        onSendOTP={(phone) => {
          setResetPhone(phone);
          go("otpVerifyReset");
        }}
      />
    );
  }

  /* ============================================================
     OTP VERIFY & RESET PASSWORD
  ============================================================ */

  if (screen === "otpVerifyReset") {
    return (
      <OtpVerifyResetScreen
        onBack={() =>
          go("forgotPassword")
        }
        onSuccess={() => {
          setResetPhone("");
          go("login");
        }}
        phone={resetPhone}
      />
    );
  }

  /* ============================================================
     REGISTRATION STEP 1
  ============================================================ */

  if (screen === "registration") {
    return (
      <RegisterScreen
        language={language}
        onBack={() =>
          go("login")
        }
        onNext={async (registrationData) => {
          try {
            // Import API helper
            const { AUTH_ENDPOINTS, apiRequest } = require('./config/api');
            
            // Helper function to convert DD/MM/YYYY to YYYY-MM-DD
            const convertDateFormat = (dateStr) => {
              if (!dateStr) return '';
              const parts = dateStr.split('/');
              if (parts.length === 3) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
              }
              return dateStr;
            };
            
            // Transform frontend data to backend format
            const apiData = {
              name: registrationData.name,
              dob: convertDateFormat(registrationData.dob), // Convert to YYYY-MM-DD
              gender: registrationData.gender.toLowerCase(),
              workType: registrationData.workType,
              phone: registrationData.phone,
              aadhaar: registrationData.aadhaar,
              address: registrationData.address,
              city: registrationData.city,
              state: registrationData.state,
              pinCode: registrationData.pinCode,
              country: registrationData.country,
              experience: registrationData.experience,
              visitCharge: registrationData.visitCharge,
              email: registrationData.email,
              password: registrationData.password,
              // Include location coordinates from LocationPicker
              primaryLocation: registrationData.primaryLocation
            };
            
            console.log("Sending Worker Registration to Backend:", apiData);
            
            // Call backend API
            const response = await apiRequest(
              AUTH_ENDPOINTS.REGISTER_WORKER,
              'POST',
              apiData
            );
            
            console.log("Registration Response:", response);
            
            if (response.success) {
              // Store tokens and user data
              // TODO: Store in AsyncStorage
              
              // Set role to individual_worker
              setUserRole("individual_worker");
              
              // Navigate to home dashboard
              Alert.alert(
                "Success",
                "Registration successful! Welcome to Sahayak.",
                [{ text: "OK", onPress: () => go("home") }]
              );
            } else {
              Alert.alert("Registration Failed", response.error || "Please try again.");
            }
          } catch (error) {
            console.error("Registration Error:", error);
            Alert.alert(
              "Registration Failed",
              error.message || "Unable to register. Please check your network and try again."
            );
          }
        }}
      />
    );
  }

  /* ============================================================
     ORGANIZATION
  ============================================================ */

  if (screen === "organization") {
    return (
      <Organization
        onContinue={() =>
          go("home")
        }
        onLogin={() =>
          go("login")
        }
        onBack={() =>
          go("workerWelcome")
        }
      />
    );
  }

  /* ============================================================
     dashboard ORGANIZATION LOGIN 
  ============================================================ */

  if (screen === "organizationLogin") {
    return (
      <OrganizationLoggin
        go={go}
        language={language}
        onLogin={(role) => {
          // Set user role from login response
          setUserRole(role);
          // Navigate to home - it will show the correct home based on role
          if (role === 'organization_worker') {
            go("orgWorkerHome");
          } else {
            go("home");
          }
        }}
      />
    );
  }

  /* ============================================================
     ORGANIZATION REGISTRATION
  ============================================================ */

  if (screen === "organizationRegistration") {
    return (
      <OrganizationRegistrationScreen
        language={language}
        onBack={() =>
          go("workerWelcome")
        }
        onNext={async (organizationData) => {
          try {
            // Import API helper
            const { ORGANIZATION_ENDPOINTS, apiRequest } = require('./config/api');
            
            // Helper function to convert DD/MM/YYYY to YYYY-MM-DD
            const convertDateFormat = (dateStr) => {
              if (!dateStr) return '';
              const parts = dateStr.split('/');
              if (parts.length === 3) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
              }
              return dateStr;
            };
            
            // Transform frontend data to backend format
            const apiData = {
              organizationName: organizationData.organizationName,
              organizationType: organizationData.organizationType,
              numberOfWorkers: organizationData.numberOfWorkers,
              organizationDescription: organizationData.organizationDescription || '',
              organizationAddress: organizationData.organizationAddress,
              city: organizationData.city,
              state: organizationData.state,
              pinCode: organizationData.pinCode,
              country: organizationData.country,
              leaderName: organizationData.leaderName,
              leaderPhone: organizationData.leaderPhone,
              leaderEmail: organizationData.leaderEmail,
              dob: convertDateFormat(organizationData.dob), // Convert to YYYY-MM-DD
              gender: organizationData.gender.toLowerCase(),
              aadhaar: organizationData.aadhaar,
              password: organizationData.password
            };
            
            console.log("Sending Organization Registration to Backend:", apiData);
            
            // Call backend API
            const response = await apiRequest(
              ORGANIZATION_ENDPOINTS.REGISTER,
              'POST',
              apiData
            );
            
            console.log("Organization Registration Response:", response);
            
            if (response.success) {
              // Store tokens and user data
              try {
                await AsyncStorage.setItem('access_token', response.tokens.access);
                await AsyncStorage.setItem('refresh_token', response.tokens.refresh);
                await AsyncStorage.setItem('user_role', 'organization_admin');
                await AsyncStorage.setItem('user_email', response.user.email);
                await AsyncStorage.setItem('user_name', response.user.username);
                
                // Store organization data including registration_number as org_id
                await AsyncStorage.setItem('org_id', response.user.registration_number);
                await AsyncStorage.setItem('org_name', response.user.organization_name);
                await AsyncStorage.setItem('org_type', response.user.organization_type);
                
                console.log('[OK] Stored org_id:', response.user.registration_number);
              } catch (storageError) {
                console.error('Error storing data:', storageError);
              }
              
              // Set role to organization_admin
              setUserRole("organization_admin");
              
              // Navigate to home - it will show OrganizationAdminHome based on role
              Alert.alert(
                "Success",
                "Organization registered successfully! Welcome to Sahayak.",
                [{ text: "OK", onPress: () => go("home") }]
              );
            } else {
              Alert.alert("Registration Failed", response.error || "Please try again.");
            }
          } catch (error) {
            console.error("Organization Registration Error:", error);
            Alert.alert(
              "Registration Failed",
              error.message || "Unable to register organization. Please check your network and try again."
            );
          }
        }}
      />
    );
  }

  /* ============================================================
     ADD WORKER
  ============================================================ */

  if (screen === "addworker") {
    return (
      <AddWorkerorganization
        go={go}
      />
    );
  }

  /* ============================================================
     PERFORMANCE
  ============================================================ */

  if (screen === "performance") {
    return (
      <OrganizationPerformance
        go={go}
        language={language}
      />
    );
  }

  /* ============================================================
     ORGANISATION SYSTEM - ADMIN DASHBOARD
  ============================================================ */

  if (screen === "orgAdminDashboard") {
    return (
      <OrgAdminDashboard
        go={go}
        language={language}
      />
    );
  }

  /* ============================================================
     ORGANISATION SYSTEM - ADD WORKER
  ============================================================ */

  if (screen === "orgAddWorker") {
    return (
      <OrgAddWorker
        go={go}
        language={language}
      />
    );
  }

  /* ============================================================
     ORGANISATION SYSTEM - WORKERS LIST
  ============================================================ */

  if (screen === "orgWorkersList") {
    return (
      <OrgWorkersList
        go={go}
        language={language}
      />
    );
  }

  /* ============================================================
     ORGANISATION SYSTEM - PERFORMANCE LIST
  ============================================================ */

  if (screen === "orgPerformance") {
    return (
      <OrgPerformance
        go={go}
        language={language}
      />
    );
  }

  /* ============================================================
     ORGANISATION SYSTEM - WORKER PERFORMANCE DETAIL
  ============================================================ */

  if (screen === "workerPerformance") {
    return (
      <WorkerPerformanceDetail
        go={go}
        language={language}
        workerId={routeData?.workerId}
        workerName={routeData?.workerName}
      />
    );
  }

  /* ============================================================
     ORGANISATION SYSTEM - ASSIGN WORK
  ============================================================ */

  if (screen === "orgAssignWork") {
    return (
      <OrgAssignWork
        go={go}
        requestId={routeData.requestId}
        language={language}
      />
    );
  }

  /* ============================================================
     ORGANISATION SYSTEM - ORG WORKER LOGIN
  ============================================================ */

  if (screen === "orgWorkerLogin") {
    return (
      <OrgWorkerLogin
        go={go}
        language={language}
      />
    );
  }

  /* ============================================================
     ORGANISATION SYSTEM - ORG WORKER HOME/JOBS
  ============================================================ */

  if (screen === "orgWorkerHome") {
    return (
      <Dashboard
        screen="home"
        go={go}
        search={search}
        setSearch={setSearch}
        setSelectedJob={setSelectedJob}
        userRole="organization_worker"
        language={language}
      />
    );
  }

  /* ============================================================
     ORGANISATION SYSTEM - ORG REQUEST DETAILS
  ============================================================ */

  if (screen === "orgRequestDetails") {
    const OrgRequestDetails = require("./screen/home/OrgRequestDetails").default;
    return (
      <OrgRequestDetails
        route={{ params: routeData }}
        go={go}
        onBack={() => go("home")}
        language={language}
      />
    );
  }

  /* ============================================================
     ORGANISATION SYSTEM - ORG WORKER JOB DETAILS
  ============================================================ */

  if (screen === "jobDetails") {
    const OrgWorkerJobDetails = require("./screen/home/OrgWorkerJobDetails").default;
    return (
      <OrgWorkerJobDetails
        route={{ params: routeData }}
        go={go}
        onBack={() => go("home")}
        language={language}
      />
    );
  }

  /* ============================================================
     ORGANISATION SYSTEM - CLIENT REQUEST FORM (PUBLIC)
  ============================================================ */

  if (screen === "clientRequestForm") {
    return (
      <ClientWorkRequestForm
        go={go}
        language={language}
      />
    );
  }

  /* ============================================================
     REGISTRATION STEP 2
  ============================================================ */

  if (screen === "registrationDetails") {
    return (
      <Screen>

        <Header
          title="Worker Registration"
          back={() =>
            go("registration")
          }
        />

        <Progress step={2} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.registrationContent
          }
        >

          <Text
            style={styles.pageTitle}
          >
            Worker Registration
          </Text>

          <Text
            style={styles.pageSubtitle}
          >
            Almost there! Add your details
          </Text>

          {/* AADHAAR */}

          <Field
            label="Aadhaar Number *"
            icon="card-account-details-outline"
            placeholder="Enter 12 digit Aadhaar number"
            value={aadhaar}
            onChangeText={(text) =>
              setAadhaar(
                text
                  .replace(/\D/g, "")
                  .slice(0, 12)
              )
            }
            keyboardType="number-pad"
          />

          {/* ADDRESS */}

          <Field
            label="Address *"
            icon="map-marker-outline"
            placeholder="Enter full address"
            value={address}
            onChangeText={setAddress}
          />

          {/* CITY / STATE */}

          <View
            style={styles.twoFields}
          >

            <View
              style={{ flex: 1 }}
            >
              <Field
                label="City *"
                icon="city"
                placeholder="Enter city"
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View
              style={{ flex: 1 }}
            >
              <Field
                label="State *"
                icon="map-outline"
                placeholder="Enter state"
                value={stateName}
                onChangeText={
                  setStateName
                }
              />
            </View>

          </View>

          {/* PIN / COUNTRY */}

          <View
            style={styles.twoFields}
          >

            <View
              style={{ flex: 1 }}
            >
              <Field
                label="Pin Code *"
                icon="numeric"
                placeholder="6-digit PIN"
                value={pinCode}
                onChangeText={(text) =>
                  setPinCode(
                    text
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                keyboardType="number-pad"
              />
            </View>

            <View
              style={{ flex: 1 }}
            >
              <Field
                label="Country"
                icon="earth"
                value="India"
                editable={false}
              />
            </View>

          </View>

          {/* EXPERIENCE */}

          <Field
            label="Experience (Years) *"
            icon="briefcase-clock-outline"
            placeholder="e.g. 5"
            value={experience}
            onChangeText={
              setExperience
            }
            keyboardType="number-pad"
          />

          {/* VISIT CHARGE */}

          <Field
            label="Min. Visit Charge *"
            icon="currency-inr"
            placeholder="e.g. 200"
            value={visitCharge}
            onChangeText={(text) =>
              setVisitCharge(
                text.replace(/\D/g, "")
              )
            }
            keyboardType="number-pad"
          />

          {/* EMAIL */}

          <Field
            label="Email Address *"
            icon="email-outline"
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          {/* PASSWORD */}

          <Field
            label="Password *"
            icon="lock-outline"
            placeholder="Min 8 chars"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* CONFIRM PASSWORD */}

          <Field
            label="Confirm Password *"
            icon="lock-check-outline"
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={
              setConfirmPassword
            }
            secureTextEntry
          />

          {/* NEXT */}

          <PrimaryButton
            title="Next"
            icon="arrow-right"
            onPress={() => {

              if (aadhaar.length !== 12) {
                Alert.alert(
                  "Invalid Aadhaar",
                  "Please enter a 12 digit Aadhaar number."
                );

                return;
              }

              if (
                !address.trim() ||
                !city.trim() ||
                !stateName.trim()
              ) {
                Alert.alert(
                  "Required",
                  "Please complete your address, city and state."
                );

                return;
              }

              if (pinCode.length !== 6) {
                Alert.alert(
                  "Invalid PIN",
                  "Please enter a 6 digit PIN code."
                );

                return;
              }

              if (!email.includes("@")) {
                Alert.alert(
                  "Invalid Email",
                  "Please enter a valid email address."
                );

                return;
              }

              if (password.length < 8) {
                Alert.alert(
                  "Password",
                  "Password must contain at least 8 characters."
                );

                return;
              }

              if (
                password !==
                confirmPassword
              ) {
                Alert.alert(
                  "Password",
                  "Password and confirm password do not match."
                );

                return;
              }

              go("verification");

            }}
          />

        </ScrollView>

      </Screen>
    );
  }

  /* ============================================================
     REGISTRATION STEP 3
  ============================================================ */

  if (screen === "verification") {
    return (
      <Screen>

        <Header
          title="Worker Registration"
          back={() =>
            go("registrationDetails")
          }
        />

        <Progress step={3} />

        <Text
          style={styles.pageTitle}
        >
          Worker Registration
        </Text>

        <Text
          style={styles.pageSubtitle}
        >
          Set your preferences
        </Text>

        <Field
          label="Work Area / City"
          icon="map-marker-outline"
          placeholder="Select city"
          value={
            city || "Pune"
          }
          onChangeText={setCity}
        />

        <Field
          label="Min. Work Charge"
          icon="currency-inr"
          placeholder="Rs.  800"
          value={
            visitCharge
              ? `Rs.  ${visitCharge}`
              : "Rs.  800"
          }
          onChangeText={(text) =>
            setVisitCharge(
              text.replace(/\D/g, "")
            )
          }
          keyboardType="number-pad"
        />

        <Field
          label="Email Address"
          icon="email-outline"
          placeholder="Enter email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Field
          label="Password"
          icon="lock-outline"
          placeholder="Create password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Field
          label="Skills / Services"
          icon="tools"
          placeholder="Select your skills"
          value={skills}
          onChangeText={setSkills}
        />

        <PrimaryButton
          title="Complete Registration"
          icon="check"
          onPress={() => {

            Alert.alert(
              "Registration Complete",
              "Your worker account has been created.",
              [
                {
                  text: "Continue",
                  onPress: () =>
                    go("home"),
                },
              ]
            );

          }}
        />

      </Screen>
    );
  }

  /* ============================================================
     DASHBOARD
  ============================================================ */


if (
  screen === "home" ||
  screen === "voiceassistant" ||
  screen === "voiceAssistant" ||
  screen === "calendar" ||
  screen === "earnings" ||
  screen === "help"
) {
  return (
    <Dashboard
      screen={screen}
      go={go}
      search={search}
      setSearch={setSearch}
      setSelectedJob={setSelectedJob}
      userRole={userRole}
      language={language}
    />
  );
}



/* ============================================================
   HELP & SUPPORT
============================================================ */
if (screen === "helpSupport") {
  return (
    <HelpSupportScreen
      onBack={() => go("home")}
      onChatbot={() => go("chatbot")}
    />
  );
}

/* ============================================================
   SETTINGS
============================================================ */

if (screen === "settings") {
  return (
    <SettingsScreen
      onBack={() => go("profile")}

      onLogout={async () => {
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
              onPress: async () => {
                try {
                  // Clear all stored data
                  // Unregister push notifications
                  notificationsInitializedRef.current = false;
                  NotificationService.reset();
                  await NotificationService.unregisterPushToken();
                  
                  await AsyncStorage.clear();
                  console.log('[OK] Worker storage cleared on logout');
                  setUserRole(null);
                  initialRouteRef.current = 'language';
                  go("language");
                } catch (error) {
                  console.error('Error clearing storage:', error);
                  initialRouteRef.current = 'language';
                  go("language");
                }
              },
            },
          ]
        );
      }}

      onChangePassword={() => {
        go("changePassword");
      }}

      onLanguage={async (selectedLanguage) => {
        setLanguage(selectedLanguage);
        try {
          await AsyncStorage.setItem('selected_language', selectedLanguage);
        } catch (e) {}
      }}

      onTheme={() => {
        go("theme");
      }}

      onChangeMobile={() => {
        go("changeMobile");
      }}

      onPrivacyPolicy={() => {
        go("privacyPolicy");
      }}

      onTerms={() => {
        go("terms");
      }}

      onContactUs={() => {
        go("contactUs");
      }}

      theme="light"
    />
  );
}

  /* ============================================================
     CHATBOT
  ============================================================ */

  if (screen === "chatbot") {
    return (
      <ChatbotScreen
        onBack={() =>
          go("home")
        }
      />
    );
  }

  /* ============================================================
     JOBS NEAR YOU
     
     IMPORTANT:
     This is the actual Jobs bottom-tab screen.
  ============================================================ */

  if (screen === "jobs") {
    return (
      <Jobs
        go={go}
        setSelectedJob={
          setSelectedJob
        }
        userRole={userRole}
        language={language}
      />
    );
  }

  /* ============================================================
     WORK REQUESTS
     
     Shows real work requests from clients via API
  ============================================================ */

  if (screen === "workRequests" || screen === "requests") {
    return (
      <WorkRequestsScreen
        go={go}
        language={language}
      />
    );
  }

  /* ============================================================
     JOB DETAILS SCREEN (Work Request Details)
  ============================================================ */

  if (screen === "workerJobDetails") {
    return (
      <JobDetailsScreen
        go={go}
        requestId={routeData.requestId}
        language={language}
      />
    );
  }

  /* ============================================================
     NAVIGATION MAP SCREEN
  ============================================================ */

  if (screen === "navigationMap") {
    return (
      <NavigationMapScreen
        route={{ params: routeData }}
        navigation={{
          goBack: () => {
            // Check if coming from org worker job details
            if (routeData.workId) {
              go("jobDetails", { workId: routeData.workId });
            } else if (routeData.previousRequestId) {
              go("workerJobDetails", { requestId: routeData.previousRequestId });
            } else {
              go("home");
            }
          },
        }}
      />
    );
  }

  /* ============================================================
     OTP ENTRY SCREEN (Worker enters PIN from client)
  ============================================================ */

  if (screen === "otpEntry") {
    return (
      <OtpEntryScreen
        go={go}
        requestId={routeData.requestId}
        clientName={routeData.clientName}
      />
    );
  }

  /* ============================================================
   THEME
============================================================ */

if (screen === "theme") {
  return (
    <ThemeScreen
      theme={theme}
      onBack={() => go("settings")}
      onSelectTheme={(selectedTheme) => {
        setTheme(selectedTheme);
      }}
    />
  );
}
  /* ============================================================
   VOICE RESUME
============================================================ */

if (screen === "voiceResume") {
  return (
    <VoiceResumeScreen 
      onBack={() => go("profile")}
    />
  );
}
/* ============================================================
   MY SKILLS
============================================================ */

if (screen === "skills") {
  return (
    <Screen>

      <Header
        title="My Skills"
        back={() => go("profile")}
      />

      <View style={styles.skillsPage}>

        <Text style={styles.sectionHeading}>
          Skills & Services
        </Text>

        <TouchableOpacity style={styles.skillCard}>
          <View style={styles.skillIcon}>
            <MaterialCommunityIcons
              name="lightning-bolt-outline"
              size={25}
              color={PURPLE}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.skillTitle}>
              Electrical Work
            </Text>

            <Text style={styles.skillSubtitle}>
              Electrical installation and repair
            </Text>
          </View>

          <MaterialCommunityIcons
            name="check-circle"
            size={22}
            color={GREEN}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.skillCard}>
          <View style={styles.skillIcon}>
            <MaterialCommunityIcons
              name="tools"
              size={25}
              color={PURPLE}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.skillTitle}>
              Home Repair
            </Text>

            <Text style={styles.skillSubtitle}>
              General home maintenance services
            </Text>
          </View>

          <MaterialCommunityIcons
            name="check-circle"
            size={22}
            color={GREEN}
          />
        </TouchableOpacity>

      </View>

    </Screen>
  );
}

  /* ============================================================
     WORK IN PROGRESS

     IMPORTANT:
     This block is INSIDE App().
     This fixes the "return outside of function" error.
  ============================================================ */

  if (screen === "workProgress") {
    return (
      <Screen>

        <Header
          title="Work In Progress"
          back={() =>
            go("jobs")
          }
        />

        <StatusBanner
          icon="progress-clock"
          title="Job In Progress"
        />

        <DetailSection
          title="Customer Address"
        >

          <Text
            style={
              styles.bodyText
            }
          >
            123, MG Road,
            Kothrud, Pune,
            Maharashtra
          </Text>

          <TouchableOpacity
            style={
              styles.mapButton
            }
            onPress={
              navigateToClient
            }
          >

            <MaterialCommunityIcons
              name="map-marker"
              size={19}
              color={PURPLE}
            />

            <Text
              style={
                styles.purpleText
              }
            >
              Open Map
            </Text>

          </TouchableOpacity>

        </DetailSection>

        <DetailSection
          title="Time Started"
        >

          <Text
            style={
              styles.bodyText
            }
          >
            Today • 09:05 AM
          </Text>

        </DetailSection>

        <DetailSection
          title="Work Duration"
        >

          <Text
            style={
              styles.bodyText
            }
          >
             02:30:45
          </Text>

        </DetailSection>

        <TouchableOpacity
          style={
            styles.completeButton
          }
          onPress={() => {

            setJobStatus(
              "completed"
            );

            go(
              "jobCompleted"
            );

          }}
        >

          <Text
            style={
              styles.completeText
            }
          >
            Complete Work
          </Text>

        </TouchableOpacity>

      </Screen>
    );
  }

  /* ============================================================
     JOB COMPLETED

     UI is provided by jobnear.js and keeps the existing blue theme.
     The screen intentionally has no "Back to Home" bottom button.
  ============================================================ */

  if (screen === "jobCompleted") {
    return (
      <JobCompleted
        go={go}
        completedJob={selectedJob}
      />
    );
  }

  /* ============================================================
     RATE CUSTOMER
  ============================================================ */

  if (screen === "rateCustomer") {
    return (
      <RateCustomer
        go={go}
      />
    );
  }

  /* ============================================================
     PROFILE
  ============================================================ */

  if (screen === "profile") {
    return (
      <Profile
        go={go}
        language={language}
      />
    );
  }

  /* ============================================================
     EDIT PROFILE
  ============================================================ */

  if (screen === "editProfile") {
    return (
      <Screen>

        <Header
          title="Edit Profile"
          back={() =>
            go("profile")
          }
        />

        <View
          style={
            styles.editPhotoWrap
          }
        >

          <Image
            source={{
              uri: profileImage,
            }}
            style={
              styles.editPhoto
            }
          />

          <TouchableOpacity
            style={
              styles.photoEdit
            }
            onPress={
              pickProfileImage
            }
          >

            <MaterialCommunityIcons
              name="camera"
              size={18}
              color="#fff"
            />

          </TouchableOpacity>

        </View>

        <Field
          label="Full Name"
          icon="account-outline"
          value={name}
          onChangeText={setName}
        />

        <Field
          label="Type of Work"
          icon="briefcase-outline"
          value={workType}
          onChangeText={
            setWorkType
          }
        />

        <Field
          label="Experience (Years)"
          icon="briefcase-clock-outline"
          value={experience}
          onChangeText={
            setExperience
          }
          keyboardType="number-pad"
        />

        <Field
          label="Minimum Visit Charge"
          icon="currency-inr"
          value={`Rs. ${charge}`}
          onChangeText={
            setCharge
          }
          keyboardType="number-pad"
        />

        <PrimaryButton
          title="Save Changes"
          icon="content-save-outline"
          onPress={() => {

            Alert.alert(
              "Saved",
              "Profile updated successfully."
            );

            go("profile");

          }}
        />

      </Screen>
    );
  }

  /* ============================================================
     MY JOBS
  ============================================================ */

  if (screen === "myJobs") {
    return (
      <Screen>

        <Header
          title="My Jobs"
          back={() =>
            go("profile")
          }
        />

        <View
          style={
            styles.tabs
          }
        >

          <Tab
            title="Applied"
          />

          <Tab
            title="Ongoing"
            active
          />

          <Tab
            title="Completed"
          />

        </View>

        <MyJob
          title="Electrician Required"
          location="Kothrud, Pune"
          time="Today • 9:00 AM"
          status="Ongoing"
        />

        <MyJob
          title="House Cleaning"
          location="Baner, Pune"
          time="10 May • 11:00 AM"
          status="Completed"
        />

        <MyJob
          title="Switch Installation"
          location="Sus, Pune"
          time="9 May • 11:00 AM"
          status="Completed"
        />

      </Screen>
    );
  }

  /* ============================================================
     NOTIFICATIONS
  ============================================================ */

  if (screen === "notifications") {
    return (
      <NotificationScreen
        go={go}
        language={language}
        onBack={() => go("home")}
      />
    );
  }

  /* ============================================================
     CHAT
  ============================================================ */

  if (screen === "chat") {
    return (
      <Screen>

        <Header
          title="Chat / Messages"
          back={() =>
            go("home")
          }
        />

        <View
          style={
            styles.chatHeader
          }
        >

          <Image
            source={{
              uri: DUMMY_PROFILE,
            }}
            style={
              styles.chatPhoto
            }
          />

          <View>

            <Text
              style={
                styles.boldText
              }
            >
              Rahul Sharma
            </Text>

            <Text
              style={
                styles.online
              }
            >
              Online
            </Text>

          </View>

        </View>

        <View
          style={
            styles.messageCustomer
          }
        >

          <Text>
            Hi, are you coming for the job?
          </Text>

          <Text
            style={
              styles.messageTime
            }
          >
            09:05 AM
          </Text>

        </View>

        <View
          style={
            styles.messageWorker
          }
        >

          <Text
            style={{
              color: "#fff",
            }}
          >
            Yes, I am on the way 
          </Text>

          <Text
            style={
              styles.messageTimeWhite
            }
          >
            09:10 AM
          </Text>

        </View>

        <View
          style={
            styles.chatInput
          }
        >

          <TextInput
            placeholder="Type a message..."
            style={{
              flex: 1,
            }}
          />

          <MaterialCommunityIcons
            name="send"
            size={25}
            color={PURPLE}
          />

        </View>

      </Screen>
    );
  }

  /* ============================================================
     WALLET
  ============================================================ */

  if (screen === "wallet") {
    return (
      <Screen>

        <Header
          title="Wallet"
          back={() =>
            go("home")
          }
        />

        <View
          style={
            styles.walletCard
          }
        >

          <Text
            style={
              styles.walletLabel
            }
          >
            Wallet Balance
          </Text>

          <Text
            style={
              styles.walletAmount
            }
          >
            Rs. 2,450
          </Text>

        </View>

        <Text
          style={
            styles.sectionHeading
          }
        >
          Recent Transactions
        </Text>

        <Transaction
          title="Job Payment"
          amount="+Rs. 800"
        />

        <Transaction
          title="Job Payment"
          amount="+Rs. 700"
        />

        <Transaction
          title="Withdrawal"
          amount="-Rs. 500"
          red
        />

      </Screen>
    );
  }

  /* ============================================================
     DOCUMENTS
  ============================================================ */

  if (screen === "documents") {
    return (
      <Screen>

        <Header
          title="Documents"
          back={() =>
            go("profile")
          }
        />

        <Document
          icon="card-account-details"
          title="Aadhaar Card"
          status="Verified"
        />

        <Document
          icon="card-account-details-outline"
          title="PAN Card"
          status="Verified"
        />

        <Document
          icon="account-box-outline"
          title="Profile Photo"
          status="Verified"
        />

        <Document
          icon="certificate-outline"
          title="Work Proof / Certificate"
          status="Not Uploaded"
        />

        <PrimaryButton
          title="Upload Document"
          icon="cloud-upload-outline"
          onPress={
            pickProfileImage
          }
        />

      </Screen>
    );
  }

  /* ============================================================
     SEARCH
  ============================================================ */

  if (screen === "search") {
    return (
      <Screen>

        <Header
          title="Search / Filter Jobs"
          back={() =>
            go("jobs")
          }
        />

        <View
          style={
            styles.searchBar
          }
        >

          <MaterialCommunityIcons
            name="magnify"
            size={23}
            color={MUTED}
          />

          <TextInput
            style={
              styles.searchInput
            }
            placeholder="Search jobs..."
            value={search}
            onChangeText={
              setSearch
            }
          />

        </View>

        <Text
          style={
            styles.filterHeading
          }
        >
          Filter
        </Text>

        <FilterRow
          title="Type"
          value="Electrician"
        />

        <FilterRow
          title="Job Type"
          value="All"
        />

        <FilterRow
          title="Price Range"
          value="Rs. 0 - Rs. 2000"
        />

        <PrimaryButton
          title="Apply Filter"
          icon="filter"
          onPress={
            openJobs
          }
        />

      </Screen>
    );
  }

  return null;
}

/* ================================================================
   SCREEN
================================================================ */

function Screen({ children }) {
  return (
    <SafeAreaView
      style={
        styles.safe
      }
    >

      <StatusBar
        barStyle="dark-content"
        backgroundColor={BG}
      />

      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.screenContent
          }
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

/* ================================================================
   HEADER
================================================================ */

function Header({
  title,
  back,
}) {
  return (
    <View
      style={
        styles.header
      }
    >

      <TouchableOpacity
        style={
          styles.backCircle
        }
        onPress={back}
      >

        <MaterialCommunityIcons
          name="arrow-left"
          size={22}
          color={TEXT}
        />

      </TouchableOpacity>

      <Text
        style={
          styles.headerTitle
        }
      >
        {title}
      </Text>

      <View
        style={{
          width: 42,
        }}
      />

    </View>
  );
}

/* ================================================================
   PRIMARY BUTTON
================================================================ */

function PrimaryButton({
  title,
  icon,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={
        styles.primaryButton
      }
      onPress={onPress}
      activeOpacity={0.85}
    >

      <Text
        style={
          styles.primaryText
        }
      >
        {title}
      </Text>

      {icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={21}
          color="#fff"
        />
      ) : null}

    </TouchableOpacity>
  );
}

/* ================================================================
   FIELD
================================================================ */

function Field({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
  editable = true,
}) {
  return (
    <View
      style={{
        marginBottom: 15,
      }}
    >

      {label ? (
        <Text
          style={
            styles.fieldLabel
          }
        >
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputBox,
          !editable && {
            backgroundColor:
              "#F4F4F4",
          },
        ]}
      >

        <MaterialCommunityIcons
          name={icon}
          size={21}
          color={PURPLE}
        />

        <TextInput
          style={
            styles.fieldInput
          }
          placeholder={
            placeholder
          }
          placeholderTextColor="#A3A1AA"
          value={value}
          onChangeText={
            onChangeText
          }
          keyboardType={
            keyboardType
          }
          secureTextEntry={
            secureTextEntry
          }
          editable={editable}
          autoCapitalize="none"
        />

      </View>

    </View>
  );
}

/* ================================================================
   PROGRESS
================================================================ */

function Progress({
  step,
}) {
  return (
    <View
      style={
        styles.progressRow
      }
    >

      {[1, 2, 3].map(
        (n) => (

          <React.Fragment
            key={n}
          >

            <View
              style={[
                styles.progressCircle,
                n <= step &&
                  styles.progressActive,
              ]}
            >

              <Text
                style={[
                  styles.progressNumber,
                  n <= step && {
                    color: "#fff",
                  },
                ]}
              >
                {n}
              </Text>

            </View>

            {n !== 3 ? (
              <View
                style={[
                  styles.progressLine,
                  n < step &&
                    styles.progressLineActive,
                ]}
              />
            ) : null}

          </React.Fragment>

        )
      )}

    </View>
  );
}

/* ================================================================
   DETAIL SECTION
================================================================ */

function DetailSection({
  title,
  children,
}) {
  return (
    <View
      style={
        styles.detailSection
      }
    >

      <Text
        style={
          styles.detailSectionTitle
        }
      >
        {title}
      </Text>

      {children}

    </View>
  );
}

/* ================================================================
   STATUS BANNER
================================================================ */

function StatusBanner({
  icon,
  title,
  green,
}) {
  return (
    <View
      style={[
        styles.statusBanner,
        {
          backgroundColor:
            green
              ? "#EAF8F0"
              : "#EEF3FF",
        },
      ]}
    >

      <MaterialCommunityIcons
        name={icon}
        size={21}
        color={
          green
            ? GREEN
            : PURPLE
        }
      />

      <Text
        style={{
          marginLeft: 8,
          fontWeight: "700",
          color:
            green
              ? GREEN
              : PURPLE,
        }}
      >
        {title}
      </Text>

    </View>
  );
}

/* ================================================================
   TAB
================================================================ */

function Tab({
  title,
  active,
}) {
  return (
    <View
      style={[
        styles.tab,
        active &&
          styles.tabActive,
      ]}
    >

      <Text
        style={[
          styles.tabText,
          active && {
            color: PURPLE,
          },
        ]}
      >
        {title}
      </Text>

    </View>
  );
}

/* ================================================================
   MY JOB
================================================================ */

function MyJob({
  title,
  location,
  time,
  status,
}) {
  return (
    <View
      style={
        styles.myJobCard
      }
    >

      <View
        style={{
          flex: 1,
        }}
      >

        <Text
          style={
            styles.jobTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.mutedText
          }
        >
          {location}
        </Text>

        <Text
          style={
            styles.mutedText
          }
        >
          ▷ {time}
        </Text>

      </View>

      <View
        style={
          styles.statusPill
        }
      >

        <Text
          style={{
            color: GREEN,
            fontSize: 11,
            fontWeight: "700",
          }}
        >
          {status}
        </Text>

      </View>

    </View>
  );
}

/* ================================================================
   NOTIFICATION
================================================================ */

function Notification({
  icon,
  title,
  time,
}) {
  return (
    <View
      style={
        styles.notification
      }
    >

      <View
        style={
          styles.notificationIcon
        }
      >

        <MaterialCommunityIcons
          name={icon}
          size={21}
          color={PURPLE}
        />

      </View>

      <View
        style={{
          flex: 1,
        }}
      >

        <Text
          style={
            styles.notificationTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.notificationTime
          }
        >
          {time}
        </Text>

      </View>

    </View>
  );
}

/* ================================================================
   TRANSACTION
================================================================ */

function Transaction({
  title,
  amount,
  red,
}) {
  return (
    <View
      style={
        styles.transaction
      }
    >

      <View
        style={
          styles.transactionIcon
        }
      >

        <MaterialCommunityIcons
          name={
            red
              ? "arrow-bottom-left"
              : "arrow-top-right"
          }
          size={21}
          color={
            red
              ? RED
              : GREEN
          }
        />

      </View>

      <Text
        style={
          styles.transactionTitle
        }
      >
        {title}
      </Text>

      <Text
        style={{
          fontWeight: "800",
          color:
            red
              ? RED
              : GREEN,
        }}
      >
        {amount}
      </Text>

    </View>
  );
}

/* ================================================================
   DOCUMENT
================================================================ */

function Document({
  icon,
  title,
  status,
}) {
  const verified =
    status === "Verified";

  return (
    <View
      style={
        styles.document
      }
    >

      <MaterialCommunityIcons
        name={icon}
        size={25}
        color={PURPLE}
      />

      <Text
        style={
          styles.documentTitle
        }
      >
        {title}
      </Text>

      <Text
        style={{
          color:
            verified
              ? GREEN
              : "#A17B00",
          fontWeight: "700",
          fontSize: 12,
        }}
      >
        {status}
      </Text>

    </View>
  );
}

/* ================================================================
   FILTER ROW
================================================================ */

function FilterRow({
  title,
  value,
}) {
  return (
    <TouchableOpacity
      style={
        styles.filterRow
      }
      onPress={() =>
        Alert.alert(
          title,
          `Selected: ${value}`
        )
      }
    >

      <Text
        style={
          styles.filterTitle
        }
      >
        {title}
      </Text>

      <View
        style={
          styles.filterRight
        }
      >

        <Text
          style={
            styles.filterValue
          }
        >
          {value}
        </Text>

        <MaterialCommunityIcons
          name="chevron-down"
          size={20}
          color="#888"
        />

      </View>

    </TouchableOpacity>
  );
}

/* ============================================================
   THEME SCREEN
============================================================ */

function ThemeScreen({
  theme,
  onBack,
  onSelectTheme,
}) {
  const isDark = theme === "dark";

  const colors = {
    background: isDark ? "#111827" : "#F8FAFC",
    card: isDark ? "#1F2937" : "#FFFFFF",
    text: isDark ? "#FFFFFF" : "#111827",
    muted: isDark ? "#9CA3AF" : "#6B7280",
    border: isDark ? "#374151" : "#E0E7ED",
    soft: isDark ? "#374151" : "#EAF3F7",
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <StatusBar
        barStyle={
          isDark
            ? "light-content"
            : "dark-content"
        }
        backgroundColor={colors.background}
      />

      {/* HEADER */}

      <View
        style={{
          height: 62,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.75}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.soft,
          }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 21,
            fontWeight: "800",
            color: colors.text,
            marginLeft: 10,
          }}
        >
          Theme
        </Text>
      </View>

      {/* CONTENT */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            color: colors.text,
            marginBottom: 6,
          }}
        >
          Appearance
        </Text>

        <Text
          style={{
            fontSize: 13,
            color: colors.muted,
            marginBottom: 20,
          }}
        >
          Choose your preferred app theme.
        </Text>

        {/* LIGHT MODE */}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            onSelectTheme("light");
          }}
          style={{
            minHeight: 78,
            backgroundColor: colors.card,
            borderWidth: 1.5,
            borderColor:
              theme === "light"
                ? PURPLE
                : colors.border,
            borderRadius: 16,
            paddingHorizontal: 15,
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              backgroundColor: colors.soft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="white-balance-sunny"
              size={24}
              color={PURPLE}
            />
          </View>

          <View
            style={{
              flex: 1,
              marginLeft: 13,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "800",
                color: colors.text,
              }}
            >
              Light Mode
            </Text>

            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                marginTop: 3,
              }}
            >
              Use the light appearance
            </Text>
          </View>

          {theme === "light" && (
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color={PURPLE}
            />
          )}
        </TouchableOpacity>

        {/* DARK MODE */}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            onSelectTheme("dark");
          }}
          style={{
            minHeight: 78,
            backgroundColor: colors.card,
            borderWidth: 1.5,
            borderColor:
              theme === "dark"
                ? PURPLE
                : colors.border,
            borderRadius: 16,
            paddingHorizontal: 15,
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              backgroundColor: colors.soft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="moon-waning-crescent"
              size={24}
              color={PURPLE}
            />
          </View>

          <View
            style={{
              flex: 1,
              marginLeft: 13,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "800",
                color: colors.text,
              }}
            >
              Dark Mode
            </Text>

            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                marginTop: 3,
              }}
            >
              Use the dark appearance
            </Text>
          </View>

          {theme === "dark" && (
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color={PURPLE}
            />
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
/* ================================================================
   STYLES
================================================================ */

const styles =
  StyleSheet.create({

    safe: {
      flex: 1,
      backgroundColor: BG,
    },

    screenContent: {
      padding: 18,
      paddingBottom: 35,
    },

    registrationContent: {
      paddingBottom: 40,
    },

    header: {
      height: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 15,
    },

    backCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent:
        "center",
      borderWidth: 1,
      borderColor: BORDER,
    },

    headerTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: TEXT,
    },

    pageTitle: {
      fontSize: 23,
      fontWeight: "900",
      color: TEXT,
      textAlign: "center",
      marginTop: 20,
    },

    pageSubtitle: {
      textAlign: "center",
      color: MUTED,
      marginTop: 6,
      marginBottom: 20,
    },

    primaryButton: {
      minHeight: 52,
      borderRadius: 10,
      backgroundColor: PURPLE,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      marginTop: 16,
      marginBottom: 10,
      paddingHorizontal: 16,
    },

    primaryText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "800",
    },

    fieldLabel: {
      fontSize: 13,
      color: TEXT,
      fontWeight: "700",
      marginBottom: 7,
    },

    inputBox: {
      minHeight: 48,
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 9,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 13,
    },

    fieldInput: {
      flex: 1,
      marginLeft: 9,
      color: TEXT,
      fontSize: 14,
    },

    progressRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },

    progressCircle: {
      width: 31,
      height: 31,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#C7C3D1",
      alignItems: "center",
      justifyContent: "center",
    },

    progressActive: {
      backgroundColor: PURPLE,
      borderColor: PURPLE,
    },

    progressNumber: {
      color: MUTED,
      fontWeight: "800",
    },

    progressLine: {
      width: 55,
      height: 2,
      backgroundColor: "#D9D6E0",
    },

    progressLineActive: {
      backgroundColor: PURPLE,
    },

    twoFields: {
      flexDirection: "row",
      gap: 10,
    },

    detailSection: {
      backgroundColor: "#fff",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: BORDER,
      padding: 14,
      marginBottom: 12,
    },

    detailSectionTitle: {
      fontWeight: "900",
      color: TEXT,
      marginBottom: 8,
    },

    bodyText: {
      color: "#55525F",
      fontSize: 12,
      lineHeight: 19,
      marginBottom: 2,
    },

    boldText: {
      color: TEXT,
      fontWeight: "800",
      fontSize: 13,
    },

    mutedText: {
      color: MUTED,
      fontSize: 12,
      marginTop: 3,
    },

    purpleText: {
      color: PURPLE,
      fontWeight: "700",
    },

    statusBanner: {
      borderRadius: 10,
      padding: 13,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
    },

    profileFeaturePage: {
  flex: 1,
  alignItems: "center",
  paddingHorizontal: 25,
  paddingTop: 45,
},

profileFeatureIcon: {
  width: 90,
  height: 90,
  borderRadius: 28,
  backgroundColor: "#EAF3F7",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 20,
},

profileFeatureTitle: {
  fontSize: 24,
  fontWeight: "800",
  color: TEXT,
  marginBottom: 10,
},

profileFeatureSubtitle: {
  fontSize: 14,
  lineHeight: 22,
  textAlign: "center",
  color: MUTED,
  maxWidth: 320,
},

profilePrimaryButton: {
  marginTop: 30,
  width: "100%",
  height: 54,
  borderRadius: 15,
  backgroundColor: PURPLE,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
},

profilePrimaryButtonText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "800",
},

skillsPage: {
  flex: 1,
  padding: 20,
},

skillCard: {
  minHeight: 75,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: BORDER,
  borderRadius: 16,
  padding: 14,
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 12,
},

skillIcon: {
  width: 46,
  height: 46,
  borderRadius: 13,
  backgroundColor: "#EAF3F7",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12,
},

skillTitle: {
  fontSize: 16,
  fontWeight: "800",
  color: TEXT,
},

skillSubtitle: {
  fontSize: 12,
  color: MUTED,
  marginTop: 4,
},

settingChoice: {
  minHeight: 65,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: BORDER,
  borderRadius: 15,
  paddingHorizontal: 16,
  marginTop: 12,
  flexDirection: "row",
  alignItems: "center",
},

settingChoiceText: {
  flex: 1,
  marginLeft: 14,
  fontSize: 16,
  fontWeight: "700",
  color: TEXT,
},

    mapButton: {
      marginTop: 10,
      borderWidth: 1,
      borderColor: PURPLE,
      borderRadius: 7,
      paddingVertical: 8,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
    },

    completeButton: {
      height: 50,
      borderWidth: 1,
      borderColor: RED,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
    },

    completeText: {
      color: RED,
      fontWeight: "800",
    },

    earningGreen: {
      color: GREEN,
      fontSize: 23,
      fontWeight: "900",
    },

    outlineButton: {
      height: 50,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: PURPLE,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
    },

    outlineText: {
      color: PURPLE,
      fontWeight: "800",
    },

    rateCenter: {
      alignItems: "center",
      marginTop: 25,
      marginBottom: 25,
    },

    rateTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: TEXT,
    },

    starsRow: {
      flexDirection: "row",
      marginTop: 15,
      gap: 6,
    },

    greatText: {
      color: MUTED,
      marginTop: 8,
      fontWeight: "700",
    },

    reviewBox: {
      minHeight: 110,
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 10,
      backgroundColor: "#fff",
      padding: 12,
      textAlignVertical: "top",
    },

    skipText: {
      color: PURPLE,
      textAlign: "center",
      fontWeight: "700",
      marginTop: 10,
    },

    editPhotoWrap: {
      alignSelf: "center",
      position: "relative",
      marginVertical: 12,
    },

    editPhoto: {
      width: 95,
      height: 95,
      borderRadius: 48,
    },

    photoEdit: {
      position: "absolute",
      right: 0,
      bottom: 0,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: PURPLE,
      alignItems: "center",
      justifyContent: "center",
    },

    tabs: {
      flexDirection: "row",
      backgroundColor: "#EEF4F8",
      borderRadius: 10,
      padding: 4,
      marginBottom: 15,
    },

    tab: {
      flex: 1,
      paddingVertical: 9,
      alignItems: "center",
      borderRadius: 8,
    },

    tabActive: {
      backgroundColor: "#fff",
    },

    tabText: {
      color: MUTED,
      fontSize: 11,
      fontWeight: "700",
    },

    jobTitle: {
      fontSize: 14,
      fontWeight: "800",
      color: TEXT,
    },

    myJobCard: {
      backgroundColor: "#fff",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: BORDER,
      padding: 14,
      marginBottom: 10,
      flexDirection: "row",
    },

    statusPill: {
      alignSelf: "flex-start",
      backgroundColor: "#E8F5EE",
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 6,
    },

    notification: {
      backgroundColor: "#fff",
      borderRadius: 11,
      borderWidth: 1,
      borderColor: BORDER,
      padding: 13,
      flexDirection: "row",
      marginBottom: 9,
    },

    notificationIcon: {
      width: 43,
      height: 43,
      borderRadius: 22,
      backgroundColor: "#EEF4F8",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },

    notificationTitle: {
      color: TEXT,
      fontWeight: "700",
      fontSize: 12,
    },

    notificationTime: {
      color: MUTED,
      fontSize: 10,
      marginTop: 5,
    },

    chatHeader: {
      backgroundColor: "#fff",
      padding: 12,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 25,
    },

    chatPhoto: {
      width: 45,
      height: 45,
      borderRadius: 23,
      marginRight: 10,
    },

    online: {
      color: GREEN,
      fontSize: 11,
      marginTop: 2,
    },

    messageCustomer: {
      alignSelf: "flex-start",
      backgroundColor: "#fff",
      borderRadius: 12,
      borderTopLeftRadius: 3,
      padding: 12,
      maxWidth: "78%",
      marginBottom: 15,
    },

    messageWorker: {
      alignSelf: "flex-end",
      backgroundColor: PURPLE,
      borderRadius: 12,
      borderTopRightRadius: 3,
      padding: 12,
      maxWidth: "78%",
      marginBottom: 20,
    },

    messageTime: {
      fontSize: 9,
      color: MUTED,
      marginTop: 4,
    },

    messageTimeWhite: {
      fontSize: 9,
      color: "#DCEAF5",
      marginTop: 4,
    },

    chatInput: {
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 25,
      height: 48,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 15,
    },

    walletCard: {
      backgroundColor: PURPLE,
      borderRadius: 15,
      padding: 20,
      marginTop: 10,
      marginBottom: 20,
    },

    walletLabel: {
      color: "#EAF2F8",
      fontSize: 12,
    },

    walletAmount: {
      color: "#fff",
      fontSize: 29,
      fontWeight: "900",
      marginTop: 6,
    },

    transaction: {
      backgroundColor: "#fff",
      borderRadius: 11,
      borderWidth: 1,
      borderColor: BORDER,
      padding: 13,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 9,
    },

    transactionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#EEF4F8",
      alignItems: "center",
      justifyContent: "center",
    },

    transactionTitle: {
      flex: 1,
      marginLeft: 10,
      fontWeight: "700",
      color: TEXT,
    },

    document: {
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 11,
      minHeight: 58,
      padding: 13,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 9,
    },

    documentTitle: {
      flex: 1,
      marginLeft: 11,
      color: TEXT,
      fontWeight: "700",
    },

    searchBar: {
      height: 48,
      backgroundColor: "#fff",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: BORDER,
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 13,
      marginTop: 16,
      marginBottom: 20,
    },

    searchInput: {
      flex: 1,
      marginLeft: 8,
      color: TEXT,
    },

    filterHeading: {
      fontSize: 17,
      fontWeight: "900",
      color: TEXT,
      marginBottom: 10,
    },

    filterRow: {
      backgroundColor: "#fff",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: BORDER,
      minHeight: 55,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 9,
    },

    filterTitle: {
      flex: 1,
      color: TEXT,
      fontWeight: "700",
    },

    filterRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    filterValue: {
      color: MUTED,
      fontSize: 12,
    },

    sectionHeading: {
      fontSize: 17,
      fontWeight: "900",
      color: TEXT,
      marginBottom: 10,
    },

  });

