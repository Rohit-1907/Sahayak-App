import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translate } from "../utils/translations";
import { useTextToSpeech } from "../utils/useTextToSpeech";
import VoiceGuidanceButton from "../components/VoiceGuidanceButton";

import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
} from "expo-audio";

import { File } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";

const PRIMARY = "#49769F";

const BG = "#F7FAFC";
const BORDER = "#E5E9ED";
const TEXT = "#111827";
const MUTED = "#6B7280";

/* ============================================================
   MAIN PROFILE
============================================================ */

let profileIntroSpoken = false;

export default function Profile({ go, language = "English" }) {
  const { speak: speakProfile, stop: stopProfile } = useTextToSpeech(language);

  useEffect(() => {
    if (profileIntroSpoken) {
      return;
    }
    profileIntroSpoken = true;
    const intro = translate('profileAutoIntro', language);
    speakProfile(intro);
    return () => {
      stopProfile();
    };
  }, [language, speakProfile, stopProfile]);

  const [voiceResumeAdded, setVoiceResumeAdded] = useState(false);
  const [voiceResumeUrl, setVoiceResumeUrl] = useState(null);
  const [profileScreen, setProfileScreen] = useState("main");
  const [userData, setUserData] = useState({
    name: '',
    profession: '',
    location: 'Pune, Maharashtra',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      // Check user role - Get all relevant data for debugging
      const userType = await AsyncStorage.getItem('user_type');
      const userRole = await AsyncStorage.getItem('user_role');
      const userData = await AsyncStorage.getItem('user_data');
      
      // SWR instant load
      if (userData) {
        try {
          const user = JSON.parse(userData);
          const profile = user.profile || {};
          const workerProfile = user.worker_profile || {};
          if (workerProfile.voice_resume_url) {
            setVoiceResumeAdded(true);
            setVoiceResumeUrl(workerProfile.voice_resume_url);
          }
          setUserData({
            name: user.full_name || user.username || 'Worker Name',
            profession: workerProfile.service_categories?.[0] || user.profession || user.service_category || 'Worker',
            location: `${profile.city || workerProfile.primary_city || 'Pune'}, ${profile.state || workerProfile.primary_state || 'Maharashtra'}`,
            phone: user.phone_number || '',
            email: user.email || '',
            rating: workerProfile.average_rating || 0.0,
            jobsDone: workerProfile.total_jobs_completed || 0,
            experience: workerProfile.years_of_experience || 0,
            role: userRole === 'organization_admin' ? 'Organization Admin' : 'Individual Worker',
          });
          setLoading(false);
        } catch (e) {}
      }

      console.log('[SEARCH] Profile - Loading for:', { userType, userRole });
      
      // Organization Admin - get data from user_data
      if (userRole === 'organization_admin' || userType === 'organization_admin') {
        console.log('[ADMIN] Loading Organization Admin Profile');
        
        if (userData) {
          const admin = JSON.parse(userData);
          console.log('[USER] Admin Data:', admin);
          
          setUserData({
            name: admin.full_name || admin.username || 'Admin Name',
            profession: 'Organization Admin',
            location: admin.city || admin.address || admin.location || 'Pune',
            phone: admin.phone_number || '',
            email: admin.email || '',
            rating: 0.0,
            jobsDone: 0,
            experience: 0, // Set to 0 for admins
            organization: admin.organization_name || admin.org_name || 'Organization',
            organizationType: admin.service_type || admin.organization_type || admin.industry_type || 'Construction',
            role: 'Organization Admin',
          });
          setLoading(false);
          return;
        }
      }
      
      // Organization Worker - get data from org_worker_data
      if (userType === 'org_worker' || userRole === 'organization_worker') {
        console.log('[WORKER] Loading Organization Worker Profile');
        const workerDataStr = await AsyncStorage.getItem('org_worker_data');
        
        if (workerDataStr) {
          const worker = JSON.parse(workerDataStr);
          console.log('[USER] Org Worker Profile Data:', worker);
          
          setUserData({
            name: worker.full_name || worker.username || 'Worker Name',
            profession: worker.service_type || worker.organization_type || 'Organization Worker',
            location: worker.address || worker.city || 'Not provided',
            phone: worker.phone_number || '',
            email: worker.email || '',
            rating: 0.0, // Org workers don't have public ratings
            jobsDone: 0, // Will be fetched from assignments
            experience: worker.experience || '0 years',
            organization: worker.organization_name || worker.org_name || 'Organization',
            organizationType: worker.organization_type || worker.service_type || 'Not specified',
            role: 'Organization Worker',
          });
          setLoading(false);
          return;
        }
      }
      
      // Individual worker - fetch from API
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        console.log('No access token found');
        setLoading(false);
        return;
      }

      // Fetch complete user data from API
      const { USER_ENDPOINTS, apiRequest } = require('../config/api');
      const response = await apiRequest(USER_ENDPOINTS.COMPLETE_DATA, 'GET', null, token);
      
      if (response.success && response.user) {
        const user = response.user;
        const profile = user.profile || {};
        const workerProfile = user.worker_profile || {};
        
        // Store updated user data
        await AsyncStorage.setItem('user_data', JSON.stringify(user));
        
        if (workerProfile.voice_resume_url) {
          setVoiceResumeAdded(true);
          setVoiceResumeUrl(workerProfile.voice_resume_url);
        } else {
          setVoiceResumeAdded(false);
          setVoiceResumeUrl(null);
        }

        setUserData({
          name: user.full_name || user.username || 'Worker Name',
          profession: workerProfile.service_categories?.[0] || 'Worker',
          location: `${profile.city || workerProfile.primary_city || 'Pune'}, ${profile.state || workerProfile.primary_state || 'Maharashtra'}`,
          phone: user.phone_number || '',
          email: user.email || '',
          rating: workerProfile.average_rating || 0.0,
          jobsDone: workerProfile.total_jobs_completed || 0,
          experience: workerProfile.years_of_experience || 0,
          role: 'Individual Worker',
        });
      }
    } catch (error) {
      console.log('Error fetching user data:', error);
      // Fallback to AsyncStorage
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const userDataStr = await AsyncStorage.getItem('user_data');
        
        if (userDataStr) {
          const user = JSON.parse(userDataStr);
          const workerProfile = user.worker_profile || {};
          if (workerProfile.voice_resume_url) {
            setVoiceResumeAdded(true);
            setVoiceResumeUrl(workerProfile.voice_resume_url);
          }
          setUserData({
            name: user.full_name || user.username || 'Worker Name',
            profession: user.profession || user.service_category || 'Worker',
            location: user.location || 'Pune, Maharashtra',
            phone: user.phone_number || '',
            email: user.email || '',
            rating: 0.0,
            jobsDone: 0,
            experience: 0,
          });
        }
      } catch (asyncError) {
        console.log('Error reading from AsyncStorage:', asyncError);
      }
    } finally {
      setLoading(false);
    }
  };

  const navigate = (screen) => {
    if (typeof go === "function") {
      const internalScreens = [
        "editProfile",
        "voiceResume",
        "skills",
        "documents",
        "myJobs",
        "earnings",
      ];

      if (internalScreens.includes(screen)) {
        setProfileScreen(screen);
        return;
      }

      go(screen);
      return;
    }

    Alert.alert(
      translate('navigationError', language),
      translate('screenNotConnected', language)
    );
  };

  const internalBack = () => {
    setProfileScreen("main");
  };

  if (profileScreen === "editProfile") {
    return <EditProfileScreen onBack={internalBack} userData={userData} setUserData={setUserData} language={language} />;
  }

  if (profileScreen === "voiceResume") {
    return (
      <VoiceResumeScreen
        onBack={internalBack}
        added={voiceResumeAdded}
        setAdded={setVoiceResumeAdded}
        voiceUrl={voiceResumeUrl}
        setVoiceUrl={setVoiceResumeUrl}
        language={language}
      />
    );
  }

  if (profileScreen === "skills") {
    return <SkillsScreen onBack={internalBack} language={language} />;
  }

  if (profileScreen === "documents") {
    return <DocumentsScreen onBack={internalBack} language={language} />;
  }

  if (profileScreen === "myJobs") {
    return <MyJobsScreen onBack={internalBack} language={language} />;
  }

  if (profileScreen === "earnings") {
    return <EarningsScreen onBack={internalBack} language={language} />;
  }

  /* ============================================================
     PROFILE MENU
  ============================================================ */

  const menu = [
    {
      icon: "account-edit-outline",
      title: translate('editProfile', language),
      subtitle: translate('updatePersonalInformation', language),
      screen: "editProfile",
    },

    {
      icon: "microphone-outline",
      title: translate('voiceResume', language),
      subtitle: voiceResumeAdded
        ? translate('voiceResumeAdded', language)
        : translate('addVoiceIntroduction', language),
      screen: "voiceResume",
    },

    {
      icon: "tools",
      title: translate('mySkills', language),
      subtitle: translate('manageSkillsServices', language),
      screen: "skills",
    },

    {
      icon: "file-document-outline",
      title: translate('documents', language),
      subtitle: translate('manageVerificationDocuments', language),
      screen: "documents",
    },

    {
      icon: "briefcase-outline",
      title: translate('myJobs', language),
      subtitle: translate('viewJobStatuses', language),
      screen: "myJobs",
    },

    {
      icon: "wallet-outline",
      title: translate('earnings', language),
      subtitle: translate('viewEarningsPayments', language),
      screen: "earnings",
    },

    {
      icon: "cog-outline",
      title: translate('settings', language),
      subtitle: translate('manageAppSettings', language),
      screen: "settings",
    },

    {
      icon: "logout",
      title: translate('logout', language),
      subtitle: translate('signOutWorkerAccount', language),
      screen: "login",
      logout: true,
    },
  ];

  /* ============================================================
     MENU PRESS
  ============================================================ */

  const handleMenuPress = (item) => {
    if (item.logout) {
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
                // Clear AsyncStorage
                await AsyncStorage.clear();
                console.log('[OK] Logged out successfully and storage cleared');
                if (typeof go === "function") {
                  go("language");
                }
              } catch (error) {
                console.error('[FAIL] Logout error:', error);
                Alert.alert(translate('error', language), translate('failedLogout', language));
              }
            },
          },
        ]
      );

      return;
    }

    navigate(item.screen);
  };

  /* ============================================================
     SWITCH ACCOUNT
  ============================================================ */

  const handleSwitchAccount = () => {
    Alert.alert(
      translate('switchAccount', language),
      translate('confirmSwitchAccount', language),
      [
        {
          text: translate('cancel', language),
          style: "cancel",
        },

        {
          text: translate('switch', language),
          onPress: async () => {
            try {
              // Clear AsyncStorage
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              await AsyncStorage.removeItem('access_token');
              await AsyncStorage.removeItem('refresh_token');
              await AsyncStorage.removeItem('user_data');
              console.log('[OK] Account data cleared for switch');
              
              // Navigate to login/welcome
              if (typeof go === "function") {
                go("login");
              }
            } catch (error) {
              console.error('[FAIL] Switch account error:', error);
              Alert.alert(translate('error', language), translate('failedSwitchAccount', language));
            }
          },
        },
      ]
    );
  };

  /* ============================================================
     MAIN PROFILE UI
  ============================================================ */

  return (
    <SafeAreaView style={styles.safe}>

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          delayPressIn={0}
          onPress={() => {
            if (typeof go === "function") {
              go("home");
            }
          }}
          activeOpacity={0.75}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={25}
            color="#111827"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {translate('myProfile', language)}
        </Text>

      </View>

      <View style={styles.voiceGuidanceWrap}>
        <VoiceGuidanceButton
          labeled
          text={translate('profileVoiceGuidance', language)}
          language={language}
          title={translate('voiceAssistance', language)}
          subtitle={translate('profileHearHowToUse', language)}
        />
      </View>

      {/* CONTENT */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >

        {/* PROFILE CARD */}

        <View style={styles.profileCard}>

          <View style={styles.avatar}>
            <MaterialCommunityIcons
              name="account"
              size={48}
              color={PRIMARY}
            />
          </View>

          <View style={styles.profileInfo}>

            <Text style={styles.name}>
              {userData.name}
            </Text>

            <Text style={styles.profession}>
              {userData.profession}
            </Text>

            {userData.organization && (
              <>
                <View style={styles.locationRow}>
                  <MaterialCommunityIcons
                    name="office-building"
                    size={17}
                    color="#6B7280"
                  />
                  <Text style={styles.location}>
                    {userData.organization}
                  </Text>
                </View>
                
                {userData.organizationType && (
                  <View style={styles.locationRow}>
                    <MaterialCommunityIcons
                      name="briefcase-outline"
                      size={17}
                      color="#6B7280"
                    />
                    <Text style={styles.location}>
                      {userData.organizationType}
                    </Text>
                  </View>
                )}
              </>
            )}

            <View style={styles.locationRow}>

              <MaterialCommunityIcons
                name="map-marker-outline"
                size={17}
                color="#6B7280"
              />

              <Text style={styles.location}>
                {userData.location}
              </Text>

            </View>

          </View>

          <View style={styles.verified}>

            <MaterialCommunityIcons
              name="check-decagram"
              size={21}
              color={PRIMARY}
            />

          </View>

        </View>

        {/* RATING */}

        <View style={styles.ratingCard}>

          <View style={styles.ratingItem}>

            <Text style={styles.ratingValue}>
              {userData.rating > 0 ? userData.rating.toFixed(1) : 'N/A'}
            </Text>

            <View style={styles.ratingStars}>

              <MaterialCommunityIcons
                name="star"
                size={16}
                color="#F5B400"
              />

              <Text style={styles.ratingText}>
                {translate('rating', language)}
              </Text>

            </View>

          </View>

          <View style={styles.divider} />

          <View style={styles.ratingItem}>

            <Text style={styles.ratingValue}>
              {userData.jobsDone || 0}
            </Text>

            <Text style={styles.ratingText}>
                {translate('jobsDone', language)}
            </Text>

          </View>

          <View style={styles.divider} />

          <View style={styles.ratingItem}>

            <Text style={styles.ratingValue}>
              {userData.experience || 0} {translate('yrs', language)}
            </Text>

            <Text style={styles.ratingText}>
                {translate('experience', language)}
            </Text>

          </View>

        </View>

        {/* PROFILE OPTIONS */}

        <Text style={styles.sectionTitle}>
          {translate('profile', language)}
        </Text>

        {menu.map((item, index) => (

          <TouchableOpacity
            key={item.screen || index}
            delayPressIn={0}
            style={[
              styles.menuCard,

              item.screen === "voiceResume" &&
                styles.voiceCard,

              item.logout &&
                styles.logoutCard,
            ]}
            onPress={() => handleMenuPress(item)}
            activeOpacity={0.75}
          >

            <View
              style={[
                styles.iconBox,

                item.screen === "voiceResume" &&
                  styles.voiceIconBox,

                item.logout &&
                  styles.logoutIconBox,
              ]}
            >

              <MaterialCommunityIcons
                name={item.icon}
                size={25}
                color={
                  item.logout
                    ? "#D64545"
                    : PRIMARY
                }
              />

            </View>

            <View style={styles.menuContent}>

              <View style={styles.titleRow}>

                <Text
                  style={[
                    styles.menuTitle,

                    item.logout &&
                      styles.logoutTitle,
                  ]}
                >
                  {item.title}
                </Text>

                {item.screen === "voiceResume" &&
                  voiceResumeAdded && (

                    <View style={styles.addedBadge}>

                      <Text style={styles.addedText}>
                        {translate('added', language)}
                      </Text>

                    </View>

                  )}

              </View>

              <Text
                style={[
                  styles.menuSubtitle,

                  item.logout &&
                    styles.logoutSubtitle,
                ]}
              >
                {item.subtitle}
              </Text>

            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={25}
              color={
                item.logout
                  ? "#D88A8A"
                  : "#9CA3AF"
              }
            />

          </TouchableOpacity>

        ))}

        {/* SWITCH ACCOUNT */}

        <TouchableOpacity
          style={styles.switchAccountCard}
          delayPressIn={0}
          onPress={handleSwitchAccount}
          activeOpacity={0.75}
        >

          <View style={styles.switchAccountIconBox}>

            <MaterialCommunityIcons
              name="account-switch-outline"
              size={27}
              color={PRIMARY}
            />

          </View>

          <View style={styles.switchAccountContent}>

            <Text style={styles.switchAccountTitle}>
              {translate('switchAccount', language)}
            </Text>

            <Text style={styles.switchAccountSubtitle}>
              {translate('switchAccountDescription', language)}
            </Text>

          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={25}
            color={PRIMARY}
          />

        </TouchableOpacity>

        <View style={{ height: 20 }} />

      </ScrollView>

      {/* BOTTOM NAVIGATION */}

      <View style={styles.bottomNav}>

        <TouchableOpacity
          style={styles.navItem}
          delayPressIn={0}
          onPress={() => navigate("home")}
        >
          <MaterialCommunityIcons
            name="home-outline"
            size={25}
            color="#555"
          />

          <Text style={styles.navText}>
            {translate('home', language)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          delayPressIn={0}
          onPress={() => navigate("jobs")}
        >
          <MaterialCommunityIcons
            name="briefcase-outline"
            size={25}
            color="#555"
          />

          <Text style={styles.navText}>
            {translate('jobs', language)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          delayPressIn={0}
          onPress={() => navigate("earnings")}
        >
          <MaterialCommunityIcons
            name="wallet-outline"
            size={25}
            color="#555"
          />

          <Text style={styles.navText}>
            {translate('earnings', language)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          delayPressIn={0}
          onPress={() => navigate("profile")}
        >
          <MaterialCommunityIcons
            name="account"
            size={25}
            color={PRIMARY}
          />

          <Text
            style={[
              styles.navText,
              styles.activeText,
            ]}
          >
            {translate('profile', language)}
          </Text>
        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
}


/* ============================================================
   COMMON INTERNAL HEADER
============================================================ */

function InternalHeader({ title, onBack }) {
  return (
    <View style={styles.header}>

      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.75}
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={25}
          color={TEXT}
        />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>
        {title}
      </Text>

      <View style={{ width: 42 }} />

    </View>
  );
}


/* ============================================================
   EDIT PROFILE
============================================================ */

function EditProfileScreen({ onBack, userData, setUserData, language = "English" }) {

  const [name, setName] = useState(userData.name);
  const [profession, setProfession] = useState(userData.profession);
  const [location, setLocation] = useState(userData.location);
  const [phone, setPhone] = useState(userData.phone);
  const [email, setEmail] = useState(userData.email);

  const saveProfile = async () => {

    if (!name.trim()) {
      Alert.alert(translate('required', language), translate('enterName', language));
      return;
    }

    if (!profession.trim()) {
      Alert.alert(translate('required', language), translate('enterProfession', language));
      return;
    }

    try {
      // Update local state
      const updatedData = {
        name,
        profession,
        location,
        phone,
        email,
      };
      setUserData(updatedData);

      // Save to AsyncStorage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const userDataStr = await AsyncStorage.getItem('user_data');
      if (userDataStr) {
        const user = JSON.parse(userDataStr);
        user.full_name = name;
        user.profession = profession;
        user.location = location;
        user.phone_number = phone;
        user.email = email;
        await AsyncStorage.setItem('user_data', JSON.stringify(user));
      }

      Alert.alert(
        translate('profileUpdated', language),
        translate('profileSaved', language),
        [
          {
            text: translate('ok', language),
            onPress: onBack,
          },
        ]
      );
    } catch (error) {
      console.log('Error saving profile:', error);
      Alert.alert(translate('error', language), translate('failedSaveProfile', language));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>

      <InternalHeader
        title={translate('editProfile', language)}
        onBack={onBack}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.featureContainer}
      >

        <View style={styles.bigFeatureIcon}>
          <MaterialCommunityIcons
            name="account-edit-outline"
            size={48}
            color={PRIMARY}
          />
        </View>

        <Text style={styles.featureTitle}>
          {translate('editYourProfile', language)}
        </Text>

        <Text style={styles.featureSubtitle}>
          {translate('updatePersonalInformation', language)}
        </Text>

        <View style={styles.formCard}>

          <Text style={styles.inputLabel}>
            {translate('fullName', language)}
          </Text>

          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder={translate('enterFullName', language)}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.inputLabel}>
            {translate('profession', language)}
          </Text>

          <TextInput
            style={styles.textInput}
            value={profession}
            onChangeText={setProfession}
            placeholder={translate('enterProfessionPlaceholder', language)}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.inputLabel}>
            {translate('location', language)}
          </Text>

          <TextInput
            style={styles.textInput}
            value={location}
            onChangeText={setLocation}
            placeholder={translate('enterLocation', language)}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.inputLabel}>
            {translate('mobileNumber', language)}
          </Text>

          <TextInput
            style={styles.textInput}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder={translate('enterMobileNumber', language)}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.inputLabel}>
            {translate('email', language)}
          </Text>

          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder={translate('enterEmail', language)}
            placeholderTextColor="#9CA3AF"
          />

        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={saveProfile}
          activeOpacity={0.8}
        >

          <MaterialCommunityIcons
            name="content-save-outline"
            size={21}
            color="#FFFFFF"
          />

          <Text style={styles.primaryButtonText}>
            {translate('saveChanges', language)}
          </Text>

        </TouchableOpacity>

      </ScrollView>

    </SafeAreaView>
  );
}


/* ============================================================
   VOICE RESUME
============================================================ */

const VOICE_RECORDING_TEXT = 'Recording...';
const VOICE_STOP_TEXT = 'Stop Recording';
const VOICE_UPLOADING_TEXT = 'Uploading...';
const VOICE_ERR_PERMISSION = 'Microphone permission is required for recording.';
const VOICE_ERR_RECORDING = 'Recording failed. Please try again.';
const VOICE_ERR_UPLOAD = 'Upload failed. Please try again.';
const VOICE_ERR_MISSING_URI = 'Recording file is missing. Please record again.';

function VoiceResumeScreen({
  onBack,
  added,
  setAdded,
  voiceUrl,
  setVoiceUrl,
  language = "English",
}) {

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordedUri, setRecordedUri] = useState(null);
  const [voiceResumeUrl, setVoiceResumeUrl] = useState(voiceUrl || null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Sync profile data on mount
  useEffect(() => {
    fetchWorkerProfile();
  }, []);

  const fetchWorkerProfile = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return;

      const { API_BASE_URL } = require('../config/api');
      const response = await fetch(`${API_BASE_URL}/users/worker/profile/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data?.success && data?.worker_profile) {
        const url = data.worker_profile.voice_resume_url;
        if (url) {
          setVoiceResumeUrl(url);
          if (setVoiceUrl) setVoiceUrl(url);
          setAdded(true);
        } else {
          setVoiceResumeUrl(null);
          if (setVoiceUrl) setVoiceUrl(null);
          setAdded(false);
        }
      }
    } catch (err) {
      console.log('[VOICE] Error fetching profile in VoiceResumeScreen:', err);
    }
  };

  const formatRecordingDuration = (millis) => {
    const totalSeconds = Math.max(0, Math.floor((millis || 0) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const uploadRecording = async (uri) => {
    setIsUploading(true);

    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        Alert.alert(translate('error', language), VOICE_ERR_UPLOAD);
        return;
      }

      const { API_BASE_URL } = require('../config/api');

      const voiceFile = new File(uri);

      const formData = new FormData();
      formData.append('voice_introduction', voiceFile);

      const response = await expoFetch(`${API_BASE_URL}/users/worker/profile/update/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.log('[VOICE] Upload failed:', responseData);
        Alert.alert(translate('error', language), VOICE_ERR_UPLOAD);
        return;
      }

      const savedUrl = responseData?.worker_profile?.voice_resume_url;

      if (!savedUrl) {
        console.log('[VOICE] Missing voice_resume_url in response:', responseData);
        Alert.alert(translate('error', language), VOICE_ERR_UPLOAD);
        return;
      }

      setVoiceResumeUrl(savedUrl);
      if (setVoiceUrl) setVoiceUrl(savedUrl);
      setRecordedUri(uri);
      setAdded(true);

      // Persist to AsyncStorage user_data cache
      try {
        const userDataStr = await AsyncStorage.getItem('user_data');
        if (userDataStr) {
          const u = JSON.parse(userDataStr);
          if (!u.worker_profile) u.worker_profile = {};
          u.worker_profile.voice_resume_url = savedUrl;
          await AsyncStorage.setItem('user_data', JSON.stringify(u));
        }
      } catch (err) {}

      Alert.alert(
        translate('voiceResumeAdded', language),
        translate('voiceResumeAddedSuccess', language)
      );
    } catch (error) {
      console.log('Voice resume upload error:', error);
      Alert.alert(translate('error', language), VOICE_ERR_UPLOAD);
    } finally {
      setIsUploading(false);
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();
      setIsRecording(false);
    } catch (error) {
      console.log('Stop recording error:', error);
      setIsRecording(false);
      Alert.alert(translate('error', language), VOICE_ERR_RECORDING);
      return;
    }

    const uri = recorder.uri;

    if (!uri) {
      Alert.alert(translate('error', language), VOICE_ERR_MISSING_URI);
      return;
    }

    setRecordedUri(uri);
    await uploadRecording(uri);
  };

  const startRecording = async () => {
    if (isUploading) {
      return;
    }

    try {
      const permission = await requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(translate('voiceResume', language), VOICE_ERR_PERMISSION);
        return;
      }

      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
    } catch (error) {
      console.log('Start recording error:', error);
      setIsRecording(false);
      Alert.alert(translate('error', language), VOICE_ERR_RECORDING);
    }
  };

  const playVoiceResume = async () => {
    let playUrl = voiceResumeUrl || recordedUri;
    if (!playUrl) {
      Alert.alert(translate('voiceResume', language), 'No audio file recorded yet.');
      return;
    }

    if (playUrl.startsWith('/')) {
      const { API_BASE_URL } = require('../config/api');
      const base = API_BASE_URL.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
      playUrl = `${base}${playUrl}`;
    }

    try {
      setIsPlayingAudio(true);
      const WebBrowser = require('expo-web-browser');
      await WebBrowser.openBrowserAsync(playUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      });
    } catch (e) {
      try {
        const { Linking } = require('react-native');
        await Linking.openURL(playUrl);
      } catch (err) {
        Alert.alert(translate('error', language), 'Could not play audio file.');
      }
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const removeVoiceResume = () => {

    Alert.alert(
      translate('removeVoiceResume', language),
      translate('confirmRemoveVoiceResume', language),
      [
        {
          text: translate('cancel', language),
          style: "cancel",
        },

        {
          text: translate('remove', language),
          style: "destructive",
          onPress: async () => {
            try {
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              const token = await AsyncStorage.getItem('access_token');
              if (token) {
                const { API_BASE_URL } = require('../config/api');
                await fetch(`${API_BASE_URL}/users/worker/profile/update/`, {
                  method: 'PATCH',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ remove_voice_resume: true }),
                });

                const userDataStr = await AsyncStorage.getItem('user_data');
                if (userDataStr) {
                  const u = JSON.parse(userDataStr);
                  if (u.worker_profile) u.worker_profile.voice_resume_url = null;
                  await AsyncStorage.setItem('user_data', JSON.stringify(u));
                }
              }
            } catch (err) {
              console.log('[VOICE] Error removing voice resume:', err);
            }
            setAdded(false);
            setVoiceResumeUrl(null);
            if (setVoiceUrl) setVoiceUrl(null);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>

      <InternalHeader
        title={translate('voiceResume', language)}
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={styles.featureContainer}
      >

        <View style={styles.bigFeatureIcon}>
          <MaterialCommunityIcons
            name="microphone-outline"
            size={50}
            color={PRIMARY}
          />
        </View>

        <Text style={styles.featureTitle}>
          {translate('voiceResume', language)}
        </Text>

        <Text style={styles.featureSubtitle}>
          {translate('voiceResumeDescription', language)}
        </Text>

        <View style={styles.statusCard}>

          <MaterialCommunityIcons
            name={
              isRecording
                ? "record-rec"
                : added
                  ? "check-circle"
                  : "microphone-outline"
            }
            size={28}
            color={
              isRecording
                ? "#D64545"
                : added
                  ? "#20804A"
                  : PRIMARY
            }
          />

          <View style={{ flex: 1, marginLeft: 12 }}>

            <Text style={styles.statusTitle}>
              {isRecording
                ? VOICE_RECORDING_TEXT
                : added
                  ? translate('voiceResumeAdded', language)
                  : translate('noVoiceResume', language)}
            </Text>

            <Text style={styles.statusSubtitle}>
              {isRecording
                ? formatRecordingDuration(recorderState.durationMillis)
                : added
                  ? translate('voiceIntroductionReady', language)
                  : translate('addVoiceIntroduction', language)}
            </Text>

          </View>

        </View>

        {!added ? (

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={isRecording ? stopRecording : startRecording}
          >

            <MaterialCommunityIcons
              name={isRecording ? "stop-circle-outline" : "microphone"}
              size={21}
              color="#FFFFFF"
            />

            <Text style={styles.primaryButtonText}>
              {isRecording
                ? VOICE_STOP_TEXT
                : isUploading
                  ? VOICE_UPLOADING_TEXT
                  : translate('addVoiceResume', language)}
            </Text>

          </TouchableOpacity>

        ) : (

          <View style={{ width: '100%', gap: 12 }}>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: '#20804A' }]}
              onPress={playVoiceResume}
            >
              <MaterialCommunityIcons
                name="play-circle-outline"
                size={22}
                color="#FFFFFF"
              />
              <Text style={styles.primaryButtonText}>
                {language === 'Hindi' ? 'आवाज़ परिचय सुनें' : language === 'Marathi' ? 'आवाज परिचय ऐका' : 'Play Voice Introduction'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: PRIMARY }]}
              onPress={() => {
                setAdded(false);
              }}
            >
              <MaterialCommunityIcons
                name="microphone"
                size={21}
                color="#FFFFFF"
              />
              <Text style={styles.primaryButtonText}>
                {language === 'Hindi' ? 'नया रिकॉर्ड करें' : language === 'Marathi' ? 'नवीन रेकॉर्ड करा' : 'Record New Audio'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dangerButton}
              onPress={removeVoiceResume}
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={21}
                color="#D64545"
              />
              <Text style={styles.dangerButtonText}>
                {translate('removeVoiceResume', language)}
              </Text>
            </TouchableOpacity>

          </View>

        )}

      </ScrollView>

    </SafeAreaView>
  );
}


/* ============================================================
   SKILLS
============================================================ */

function SkillsScreen({ onBack, language = "English" }) {

  const [skills, setSkills] = useState([
    "Electrical Repair",
    "Wiring",
    "Fan Installation",
  ]);

  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {

    const value = newSkill.trim();

    if (!value) {
      Alert.alert(
        translate('enterSkill', language),
        translate('enterSkillFirst', language)
      );
      return;
    }

    setSkills((previous) => [
      ...previous,
      value,
    ]);

    setNewSkill("");

    Alert.alert(
      translate('skillAdded', language),
      `${value} ${translate('addedToSkills', language)}`
    );
  };

  const removeSkill = (skill) => {

    Alert.alert(
      translate('removeSkill', language),
      `Remove "${skill}" ${translate('fromSkills', language)}?`,
      [
        {
          text: translate('cancel', language),
          style: "cancel",
        },

        {
          text: translate('remove', language),
          style: "destructive",
          onPress: () => {
            setSkills((previous) =>
              previous.filter(
                (item) => item !== skill
              )
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>

      <InternalHeader
        title={translate('mySkills', language)}
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={styles.featureContainer}
      >

        <Text style={styles.innerPageTitle}>
          {translate('mySkillsServices', language)}
        </Text>

        <Text style={styles.innerPageSubtitle}>
          {translate('manageServices', language)}
        </Text>

        <View style={styles.addRow}>

          <TextInput
            style={styles.addSkillInput}
            value={newSkill}
            onChangeText={setNewSkill}
            placeholder={translate('addSkill', language)}
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity
            style={styles.smallAddButton}
            onPress={addSkill}
          >

            <MaterialCommunityIcons
              name="plus"
              size={24}
              color="#FFFFFF"
            />

          </TouchableOpacity>

        </View>

        {skills.map((skill, index) => (

          <View
            key={`${skill}-${index}`}
            style={styles.skillCard}
          >

            <View style={styles.skillIconBox}>

              <MaterialCommunityIcons
                name="tools"
                size={24}
                color={PRIMARY}
              />

            </View>

            <Text style={styles.skillText}>
              {skill}
            </Text>

            <TouchableOpacity
              onPress={() => removeSkill(skill)}
              style={styles.deleteButton}
            >

              <MaterialCommunityIcons
                name="delete-outline"
                size={22}
                color="#D64545"
              />

            </TouchableOpacity>

          </View>

        ))}

        {skills.length === 0 && (

          <View style={styles.emptyCard}>

            <MaterialCommunityIcons
              name="tools"
              size={35}
              color="#9CA3AF"
            />

            <Text style={styles.emptyText}>
              {translate('noSkillsAdded', language)}
            </Text>

          </View>

        )}

      </ScrollView>

    </SafeAreaView>
  );
}


/* ============================================================
   DOCUMENTS
============================================================ */

function DocumentsScreen({ onBack, language = "English" }) {

  const [documents, setDocuments] = useState([
    {
      title: "Aadhaar Card",
      status: "Verified",
    },

    {
      title: "PAN Card",
      status: "Verified",
    },

    {
      title: "Address Proof",
      status: "Pending",
    },
  ]);

  const uploadDocument = (index) => {

    const currentDocument = documents[index];

    if (currentDocument.status === "Verified") {

      Alert.alert(
        currentDocument.title,
        translate('documentAlreadyVerified', language)
      );

      return;
    }

    setDocuments((previous) =>
      previous.map((doc, i) =>
        i === index
          ? {
              ...doc,
              status: "Uploaded",
            }
          : doc
      )
    );

    Alert.alert(
      translate('document', language),
      translate('documentActionSuccess', language)
    );
  };

  return (
    <SafeAreaView style={styles.safe}>

      <InternalHeader
        title={translate('documents', language)}
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={styles.featureContainer}
      >

        <Text style={styles.innerPageTitle}>
          {translate('verificationDocuments', language)}
        </Text>

        <Text style={styles.innerPageSubtitle}>
          {translate('manageDocumentsStatus', language)}
        </Text>

        {documents.map((document, index) => (

          <View
            key={document.title}
            style={styles.documentCard}
          >

            <View style={styles.documentIcon}>

              <MaterialCommunityIcons
                name="file-document-outline"
                size={25}
                color={PRIMARY}
              />

            </View>

            <View style={styles.documentContent}>

              <Text style={styles.documentTitle}>
                {document.title}
              </Text>

              <Text
                style={[
                  styles.documentStatus,
                  document.status === "Verified" &&
                    styles.verifiedStatus,
                  document.status === "Uploaded" &&
                    styles.uploadedStatus,
                ]}
              >
                {document.status}
              </Text>

            </View>

            <TouchableOpacity
              style={styles.documentAction}
              onPress={() => uploadDocument(index)}
            >

              <MaterialCommunityIcons
                name={
                  document.status === "Verified"
                    ? "eye-outline"
                    : "upload-outline"
                }
                size={21}
                color={PRIMARY}
              />

            </TouchableOpacity>

          </View>

        ))}

      </ScrollView>

    </SafeAreaView>
  );
}


/* ============================================================
   MY JOBS
   ACCEPTED + COMPLETED + REJECTED
============================================================ */

function MyJobsScreen({ onBack, language = "English" }) {

  /*
    Default tab = Accepted
  */
  const [activeTab, setActiveTab] = useState("accepted");

  /* ==========================================================
     ACCEPTED JOBS
  ========================================================== */

  const acceptedJobs = [
    {
      id: "A1",
      title: "Home Electrical Repair",
      customer: "Rahul",
      amount: "Rs. 800",
      status: "Accepted",
      date: "Today",
    },

    {
      id: "A2",
      title: "Fan Installation",
      customer: "Amit",
      amount: "Rs. 500",
      status: "Accepted",
      date: "Yesterday",
    },

    {
      id: "A3",
      title: "Switch Board Repair",
      customer: "Priya",
      amount: "Rs. 650",
      status: "Accepted",
      date: "18 Aug",
    },
  ];

  /* ==========================================================
     COMPLETED JOBS
  ========================================================== */

  const completedJobs = [
    {
      id: "C1",
      title: "Wiring Work",
      customer: "Sneha",
      amount: "Rs. 1,500",
      status: "Completed",
      date: "18 Aug",
    },

    {
      id: "C2",
      title: "Switch Repair",
      customer: "Rohit",
      amount: "Rs. 400",
      status: "Completed",
      date: "16 Aug",
    },

    {
      id: "C3",
      title: "Ceiling Fan Repair",
      customer: "Neha",
      amount: "Rs. 700",
      status: "Completed",
      date: "14 Aug",
    },
  ];

  /* ==========================================================
     REJECTED JOBS
  ========================================================== */

  const rejectedJobs = [
    {
      id: "R1",
      title: "AC Electrical Repair",
      customer: "Vikas",
      amount: "Rs. 1,200",
      status: "Rejected",
      date: "17 Aug",
      reason: "Customer cancelled the request.",
    },

    {
      id: "R2",
      title: "House Wiring",
      customer: "Pooja",
      amount: "Rs. 2,000",
      status: "Rejected",
      date: "15 Aug",
      reason: "Job location was outside your service area.",
    },

    {
      id: "R3",
      title: "Geyser Installation",
      customer: "Suresh",
      amount: "Rs. 900",
      status: "Rejected",
      date: "12 Aug",
      reason: "Worker was unavailable at the requested time.",
    },
  ];

  /* ==========================================================
     SELECT JOB LIST
  ========================================================== */

  let jobs = [];

  if (activeTab === "accepted") {
    jobs = acceptedJobs;
  }

  if (activeTab === "completed") {
    jobs = completedJobs;
  }

  if (activeTab === "rejected") {
    jobs = rejectedJobs;
  }

  /* ==========================================================
     OPEN JOB
  ========================================================== */

  const openJob = (job) => {

    if (job.status === "Rejected") {

      Alert.alert(
        job.title,
        `${translate('customer', language)}: ${job.customer}\n${translate('amount', language)}: ${job.amount}\n${translate('date', language)}: ${job.date}\n${translate('status', language)}: ${translate('rejected', language)}\n\n${translate('reason', language)}: ${job.reason}`,
        [
          {
            text: translate('close', language),
          },
        ]
      );

      return;
    }

    Alert.alert(
      job.title,
      `${translate('customer', language)}: ${job.customer}\n${translate('amount', language)}: ${job.amount}\n${translate('date', language)}: ${job.date}\n${translate('status', language)}: ${job.status}`,
      [
        {
          text: translate('ok', language),
        },
      ]
    );
  };

  /* ==========================================================
     EMPTY TAB
  ========================================================== */

  const getEmptyMessage = () => {

    if (activeTab === "accepted") {
      return translate('noAcceptedJobs', language);
    }

    if (activeTab === "completed") {
      return translate('noCompletedJobs', language);
    }

    return translate('noRejectedJobs', language);
  };

  return (
    <SafeAreaView style={styles.safe}>

      <InternalHeader
        title={translate('myJobs', language)}
        onBack={onBack}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.featureContainer}
      >

        <Text style={styles.innerPageTitle}>
          {translate('myJobs', language)}
        </Text>

        <Text style={styles.innerPageSubtitle}>
          {translate('viewJobStatuses', language)}
        </Text>

        {/* ==================================================
            THREE TABS
        ================================================== */}

        <View style={styles.tabContainer}>

          {/* ACCEPTED */}

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "accepted" &&
                styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("accepted")}
            activeOpacity={0.8}
          >

            <MaterialCommunityIcons
              name="check-circle-outline"
              size={17}
              color={
                activeTab === "accepted"
                  ? PRIMARY
                  : MUTED
              }
            />

            <Text
              style={[
                styles.tabText,
                activeTab === "accepted" &&
                  styles.tabTextActive,
              ]}
            >
              {translate('accepted', language)}
            </Text>

          </TouchableOpacity>

          {/* COMPLETED */}

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "completed" &&
                styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("completed")}
            activeOpacity={0.8}
          >

            <MaterialCommunityIcons
              name="check-all"
              size={17}
              color={
                activeTab === "completed"
                  ? PRIMARY
                  : MUTED
              }
            />

            <Text
              style={[
                styles.tabText,
                activeTab === "completed" &&
                  styles.tabTextActive,
              ]}
            >
              {translate('completed', language)}
            </Text>

          </TouchableOpacity>

          {/* REJECTED */}

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "rejected" &&
                styles.tabButtonRejectedActive,
            ]}
            onPress={() => setActiveTab("rejected")}
            activeOpacity={0.8}
          >

            <MaterialCommunityIcons
              name="close-circle-outline"
              size={17}
              color={
                activeTab === "rejected"
                  ? "#D64545"
                  : MUTED
              }
            />

            <Text
              style={[
                styles.tabText,
                activeTab === "rejected" &&
                  styles.tabTextRejectedActive,
              ]}
            >
              {translate('rejected', language)}
            </Text>

          </TouchableOpacity>

        </View>

        {/* ==================================================
            JOB COUNT
        ================================================== */}

        <View style={styles.jobCountRow}>

          <Text style={styles.jobCountText}>
            {jobs.length}{" "}
            {jobs.length === 1 ? translate('job', language) : translate('jobs', language)}
          </Text>

          <View
            style={[
              styles.statusBadge,
              activeTab === "rejected" &&
                styles.rejectedBadge,
              activeTab === "completed" &&
                styles.completedBadge,
            ]}
          >

            <Text
              style={[
                styles.statusBadgeText,
                activeTab === "rejected" &&
                  styles.rejectedBadgeText,
                activeTab === "completed" &&
                  styles.completedBadgeText,
              ]}
            >
              {activeTab === "accepted"
                ? translate('accepted', language)
                : activeTab === "completed"
                ? translate('completed', language)
                : translate('rejected', language)}
            </Text>

          </View>

        </View>

        {/* ==================================================
            JOB LIST
        ================================================== */}

        {jobs.map((job) => (

          <TouchableOpacity
            key={job.id}
            style={[
              styles.jobCard,

              job.status === "Rejected" &&
                styles.rejectedJobCard,

              job.status === "Completed" &&
                styles.completedJobCard,
            ]}
            onPress={() => openJob(job)}
            activeOpacity={0.75}
          >

            {/* JOB ICON */}

            <View
              style={[
                styles.jobIcon,

                job.status === "Rejected" &&
                  styles.rejectedJobIcon,

                job.status === "Completed" &&
                  styles.completedJobIcon,
              ]}
            >

              <MaterialCommunityIcons
                name={
                  job.status === "Rejected"
                    ? "close-circle-outline"
                    : job.status === "Completed"
                    ? "check-circle-outline"
                    : "briefcase-outline"
                }
                size={25}
                color={
                  job.status === "Rejected"
                    ? "#D64545"
                    : job.status === "Completed"
                    ? "#20804A"
                    : PRIMARY
                }
              />

            </View>

            {/* JOB CONTENT */}

            <View style={styles.jobContent}>

              <Text style={styles.jobTitle}>
                {job.title}
              </Text>

              <Text style={styles.jobCustomer}>
                Customer: {job.customer}
              </Text>

              <Text style={styles.jobDate}>
                {job.date}
              </Text>

              <View style={styles.jobStatusRow}>

                <View
                  style={[
                    styles.jobStatusBadge,

                    job.status === "Rejected" &&
                      styles.jobStatusRejected,

                    job.status === "Completed" &&
                      styles.jobStatusCompleted,

                    job.status === "Accepted" &&
                      styles.jobStatusAccepted,
                  ]}
                >

                  <Text
                    style={[
                      styles.jobStatusText,

                      job.status === "Rejected" &&
                        styles.jobStatusTextRejected,

                      job.status === "Completed" &&
                        styles.jobStatusTextCompleted,

                      job.status === "Accepted" &&
                        styles.jobStatusTextAccepted,
                    ]}
                  >
                    {job.status}
                  </Text>

                </View>

              </View>

            </View>

            {/* AMOUNT + ARROW */}

            <View style={styles.jobRight}>

              <Text
                style={[
                  styles.jobAmount,

                  job.status === "Rejected" &&
                    styles.rejectedAmount,
                ]}
              >
                {job.amount}
              </Text>

              <MaterialCommunityIcons
                name="chevron-right"
                size={23}
                color="#9CA3AF"
              />

            </View>

          </TouchableOpacity>

        ))}

        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        {jobs.length === 0 && (

          <View style={styles.emptyJobsCard}>

            <MaterialCommunityIcons
              name={
                activeTab === "rejected"
                  ? "close-circle-outline"
                  : "briefcase-outline"
              }
              size={45}
              color="#9CA3AF"
            />

            <Text style={styles.emptyJobsTitle}>
              {getEmptyMessage()}
            </Text>

            <Text style={styles.emptyJobsSubtitle}>
              {translate('jobsAppearWhenAvailable', language)}
            </Text>

          </View>

        )}

      </ScrollView>

    </SafeAreaView>
  );
}


/* ============================================================
   EARNINGS
============================================================ */

function EarningsScreen({ onBack }) {
  const RealEarningsScreen = require('./EarningsScreen').default;
  return <RealEarningsScreen go={onBack} navigation={{ goBack: onBack }} />;
}

const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  /* HEADER */

  header: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F3",
    justifyContent: "flex-start",
  },

  voiceGuidanceWrap: {
    marginHorizontal: 16,
    marginTop: 12,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginLeft: 4,
  },

  /* MAIN */

  container: {
    padding: 18,
    paddingBottom: 110,
  },

  /* PROFILE */

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F8FB",
    borderRadius: 16,
    padding: 17,
    borderWidth: 1,
    borderColor: "#E1EAF0",
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#DCEAF3",
    alignItems: "center",
    justifyContent: "center",
  },

  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
  },

  profession: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: "700",
    marginTop: 3,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  location: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 3,
  },

  verified: {
    alignSelf: "flex-start",
  },

  /* RATING */

  ratingCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E9ED",
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 15,
    alignItems: "center",
  },

  ratingItem: {
    flex: 1,
    alignItems: "center",
  },

  ratingValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  ratingStars: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },

  ratingText: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },

  divider: {
    width: 1,
    height: 35,
    backgroundColor: "#E5E7EB",
  },

  /* SECTION */

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginTop: 24,
    marginBottom: 10,
  },

  /* MENU */

  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E9ED",
    borderRadius: 13,
    padding: 13,
    marginBottom: 10,
  },

  voiceCard: {
    borderColor: "#BFD5E3",
    backgroundColor: "#F7FAFC",
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#EEF5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  voiceIconBox: {
    backgroundColor: "#E2EFF6",
  },

  logoutCard: {
    borderColor: "#F0D4D4",
    backgroundColor: "#FFF8F8",
  },

  logoutIconBox: {
    backgroundColor: "#FCEAEA",
  },

  logoutTitle: {
    color: "#D64545",
  },

  logoutSubtitle: {
    color: "#A86B6B",
  },

  menuContent: {
    flex: 1,
    marginLeft: 12,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },

  menuSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },

  /* BADGE */

  addedBadge: {
    backgroundColor: "#E2F3E9",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 7,
  },

  addedText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#20804A",
  },

  /* SWITCH */

  switchAccountCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#BFD5E3",
    borderRadius: 13,
    padding: 13,
    marginTop: 2,
    marginBottom: 10,
  },

  switchAccountIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#E2EFF6",
    alignItems: "center",
    justifyContent: "center",
  },

  switchAccountContent: {
    flex: 1,
    marginLeft: 12,
  },

  switchAccountTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: PRIMARY,
  },

  switchAccountSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },

  /* BOTTOM NAV */

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 76,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  navItem: {
    width: "25%",
    alignItems: "center",
    justifyContent: "center",
  },

  navText: {
    fontSize: 11,
    color: "#555",
    marginTop: 4,
    fontWeight: "600",
  },

  activeText: {
    color: PRIMARY,
    fontWeight: "800",
  },

  /* ==========================================================
     INTERNAL SCREENS
  ========================================================== */

  featureContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  bigFeatureIcon: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: "#EAF3F7",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 25,
    marginBottom: 18,
  },

  featureTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: TEXT,
    textAlign: "center",
  },

  featureSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: MUTED,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 15,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT,
    marginTop: 8,
    marginBottom: 7,
  },

  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 13,
    color: TEXT,
    backgroundColor: "#FFFFFF",
  },

  primaryButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 9,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
  },

  statusTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: TEXT,
  },

  statusSubtitle: {
    fontSize: 12,
    color: MUTED,
    marginTop: 4,
  },

  dangerButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: "#FFF8F8",
    borderWidth: 1,
    borderColor: "#F0D4D4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 9,
  },

  dangerButtonText: {
    color: "#D64545",
    fontSize: 16,
    fontWeight: "800",
  },

  innerPageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 6,
  },

  innerPageSubtitle: {
    fontSize: 13,
    color: MUTED,
    marginBottom: 18,
  },

  /* SKILLS */

  addRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  addSkillInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 13,
    color: TEXT,
  },

  smallAddButton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  skillCard: {
    minHeight: 70,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 15,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  skillIconBox: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: "#EAF3F7",
    alignItems: "center",
    justifyContent: "center",
  },

  skillText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "700",
    color: TEXT,
  },

  deleteButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: 35,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 15,
  },

  emptyText: {
    color: MUTED,
    marginTop: 8,
  },

  /* DOCUMENTS */

  documentCard: {
    minHeight: 75,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 15,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  documentIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: "#EAF3F7",
    alignItems: "center",
    justifyContent: "center",
  },

  documentContent: {
    flex: 1,
    marginLeft: 12,
  },

  documentTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: TEXT,
  },

  documentStatus: {
    fontSize: 11,
    color: "#C48A22",
    marginTop: 4,
    fontWeight: "700",
  },

  verifiedStatus: {
    color: "#20804A",
  },

  uploadedStatus: {
    color: PRIMARY,
  },

  documentAction: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EEF5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ==========================================================
     MY JOBS
  ========================================================== */

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#EEF4F8",
    borderRadius: 11,
    padding: 4,
    marginBottom: 12,
  },

  tabButton: {
    flex: 1,
    minHeight: 42,
    paddingVertical: 9,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    flexDirection: "row",
    gap: 4,
  },

  tabButtonActive: {
    backgroundColor: "#FFFFFF",
  },

  tabButtonRejectedActive: {
    backgroundColor: "#FFF5F5",
  },

  tabText: {
    color: MUTED,
    fontWeight: "700",
    fontSize: 12,
  },

  tabTextActive: {
    color: PRIMARY,
  },

  tabTextRejectedActive: {
    color: "#D64545",
  },

  jobCountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  jobCountText: {
    fontSize: 13,
    color: MUTED,
    fontWeight: "700",
  },

  statusBadge: {
    backgroundColor: "#EAF3F7",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },

  completedBadge: {
    backgroundColor: "#E8F5ED",
  },

  rejectedBadge: {
    backgroundColor: "#FCEAEA",
  },

  statusBadgeText: {
    fontSize: 10,
    color: PRIMARY,
    fontWeight: "800",
  },

  completedBadgeText: {
    color: "#20804A",
  },

  rejectedBadgeText: {
    color: "#D64545",
  },

  jobCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 15,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  completedJobCard: {
    borderColor: "#D7E9DE",
    backgroundColor: "#FCFFFD",
  },

  rejectedJobCard: {
    borderColor: "#F0D4D4",
    backgroundColor: "#FFF9F9",
  },

  jobIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: "#EAF3F7",
    alignItems: "center",
    justifyContent: "center",
  },

  completedJobIcon: {
    backgroundColor: "#E8F5ED",
  },

  rejectedJobIcon: {
    backgroundColor: "#FCEAEA",
  },

  jobContent: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },

  jobTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: TEXT,
  },

  jobCustomer: {
    fontSize: 11,
    color: MUTED,
    marginTop: 4,
  },

  jobDate: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 3,
  },

  jobStatusRow: {
    flexDirection: "row",
    marginTop: 5,
  },

  jobStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "#EAF3F7",
  },

  jobStatusAccepted: {
    backgroundColor: "#EAF3F7",
  },

  jobStatusCompleted: {
    backgroundColor: "#E8F5ED",
  },

  jobStatusRejected: {
    backgroundColor: "#FCEAEA",
  },

  jobStatusText: {
    fontSize: 9,
    fontWeight: "800",
  },

  jobStatusTextAccepted: {
    color: PRIMARY,
  },

  jobStatusTextCompleted: {
    color: "#20804A",
  },

  jobStatusTextRejected: {
    color: "#D64545",
  },

  jobRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    alignSelf: "stretch",
    minWidth: 55,
  },

  jobAmount: {
    fontSize: 13,
    color: "#20804A",
    fontWeight: "800",
  },

  rejectedAmount: {
    color: "#9B6A6A",
  },

  emptyJobsCard: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 15,
    paddingVertical: 45,
    paddingHorizontal: 20,
    marginTop: 5,
  },

  emptyJobsTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: TEXT,
    marginTop: 10,
  },

  emptyJobsSubtitle: {
    fontSize: 12,
    color: MUTED,
    marginTop: 5,
    textAlign: "center",
  },

  /* ==========================================================
     EARNINGS
  ========================================================== */

  walletCard: {
    backgroundColor: PRIMARY,
    borderRadius: 17,
    padding: 20,
    marginBottom: 25,
  },

  walletSmallText: {
    color: "#EAF2F8",
    fontSize: 13,
  },

  walletAmount: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 6,
  },

  walletSubText: {
    color: "#EAF2F8",
    fontSize: 12,
    marginTop: 4,
  },

  innerSectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 12,
  },

  transactionCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 13,
    minHeight: 70,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  transactionIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#EAF3F7",
    alignItems: "center",
    justifyContent: "center",
  },

  transactionContent: {
    flex: 1,
    marginLeft: 11,
  },

  transactionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: TEXT,
  },

  transactionDate: {
    fontSize: 11,
    color: MUTED,
    marginTop: 4,
  },

  transactionAmount: {
    color: "#20804A",
    fontWeight: "900",
    fontSize: 14,
  },

  outlineButton: {
    height: 52,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },

  outlineButtonText: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: "800",
  },



  /* ============================================
     EARNINGS STYLES
  ============================================ */

  earningsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  earningsLabel: {
    fontSize: 14,
    color: MUTED,
    marginBottom: 4,
  },

  earningsAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: PRIMARY,
  },

  infoCard: {
    width: '100%',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 4,
  },

  infoSubtitle: {
    fontSize: 14,
    color: MUTED,
    lineHeight: 20,
  },

  transactionHeaderCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },

  transactionHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
    marginLeft: 8,
  },

  emptySubtext: {
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
  },

});
