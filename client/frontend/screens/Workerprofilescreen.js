import React, { useEffect, useRef, useState, useMemo } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Animated,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import { translate, translateService } from '../utils/translations';


// =====================================================
// COLORS
// =====================================================

const COLORS = {
  blue: '#49769F',
  dark: '#1F2937',
  gray: '#64748B',
  lightGray: '#94A3B8',
  white: '#FFFFFF',
  background: '#F7FAFC',
  border: '#E2E8F0',
  softBlue: '#EAF3FA',
  green: '#22C55E',
  yellow: '#F59E0B',
};


// =====================================================
// SAMPLE PREVIOUS WORK (can be replaced with real data from API in future)
// =====================================================

const previousWorkImages = [
  'https://ui-avatars.com/api/?name=Project+1&background=49769F&color=fff&size=400&font-size=0.3',
  'https://ui-avatars.com/api/?name=Project+2&background=22C55E&color=fff&size=400&font-size=0.3',
  'https://ui-avatars.com/api/?name=Project+3&background=F59E0B&color=fff&size=400&font-size=0.3',
];


// Module-level caches for instant 0ms price rendering and in-flight deduplication
const pricingCache = new Map();
const pricingInFlight = new Map();

// =====================================================
// MAIN SCREEN
// =====================================================

export default function Workerprofilescreen({
  route,
  navigation,
  worker: workerProp,
  service_category: serviceCategoryProp,
  work_location: workLocationProp,
  onBack,
  onChooseAnother,
  onRequestWorker,
  language = 'english',
}) {
  // Method 1: React Navigation (route.params)
  const routeParams = route?.params || {};
  const { worker: workerFromRoute, service_category: serviceCategoryFromRoute, work_location: workLocationFromRoute } = routeParams;

  // Method 2: Direct props (custom navigation in App.js)
  const workerFromProps = workerProp;
  const serviceCategoryFromProps = serviceCategoryProp;
  const workLocationFromProps = workLocationProp;

  // Use whichever method provided data
  const workerData = workerFromRoute || workerFromProps;
  const service_category = serviceCategoryFromRoute || serviceCategoryFromProps;
  const work_location = workLocationFromRoute || workLocationFromProps;

  const isOrganization = !!(
    workerData?.is_organization ||
    workerData?.organization_id ||
    workerData?.org_id ||
    workerData?.role === 'organization_worker' ||
    workerData?.role === 'organization_admin' ||
    workerData?.role_name === 'organization_worker' ||
    workerData?.role_name === 'organization_admin' ||
    workerData?.user_type === 'organization'
  );

  const workerId = workerData?.id || workerData?.worker_profile_id || routeParams?.workerId;
  const currentServiceCategory = service_category || workerData?.service;
  const userCity = work_location?.city || 'Pune';
  const pricingCacheKey = `${currentServiceCategory}_${userCity}_${workerId}`;

  // Pricing state
  const [pricing, setPricing] = useState(() => (
    isOrganization
      ? { base_price: 0, worker_visit_charge: 0, platform_fee: 0, total_price: 0 }
      : (pricingCache.get(pricingCacheKey) || null)
  ));
  const [loadingPrice, setLoadingPrice] = useState(() => {
    if (isOrganization) return false;
    return !pricingCache.has(pricingCacheKey);
  });

  // ===================================================
  // SCREEN ANIMATION
  // ===================================================

  const opacity = useRef(
    new Animated.Value(0)
  ).current;

  const translateY = useRef(
    new Animated.Value(25)
  ).current;

  // ===================================================
  // WORKER PROFILE STATE & FETCH
  // ===================================================

  const [workerProfile, setWorkerProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (workerId) {
      fetchWorkerProfile();
    }
  }, [workerId]);

  const fetchWorkerProfile = async () => {
    try {
      setLoadingProfile(true);
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/v1/users/workers/${workerId}/profile/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      const data = await response.json();
      if (data?.success && data?.worker_profile) {
        console.log('[PROFILE] Loaded fresh worker profile:', data.worker_profile.name, 'Voice:', data.worker_profile.voice_resume_url);
        setWorkerProfile(data.worker_profile);
      }
    } catch (err) {
      console.log('[PROFILE] Error fetching worker profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // ===================================================
  // VOICE INTRODUCTION PLAYER
  // ===================================================

  const rawVoiceUrl = workerProfile?.voice_resume_url || workerData?.voice_resume_url || workerData?.worker_voice_resume_url;
  const audioUrl = useMemo(() => {
    if (!rawVoiceUrl || typeof rawVoiceUrl !== 'string') return null;
    if (rawVoiceUrl.startsWith('http://') || rawVoiceUrl.startsWith('https://')) {
      try {
        const urlObj = new URL(rawVoiceUrl);
        const baseUrlObj = new URL(API_BASE_URL);
        if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(urlObj.hostname)) {
          return `${baseUrlObj.protocol}//${baseUrlObj.host}${urlObj.pathname}`;
        }
      } catch (e) {}
      return rawVoiceUrl;
    }
    const base = API_BASE_URL.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
    const path = rawVoiceUrl.startsWith('/') ? rawVoiceUrl : `/${rawVoiceUrl}`;
    return `${base}${path}`;
  }, [rawVoiceUrl]);

  const [isPlayingVoice, setIsPlayingVoice] = useState(false);


  // ===================================================
  // SCREEN ENTRANCE
  // ===================================================

  useEffect(() => {

    Animated.parallel([

      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),

      Animated.spring(translateY, {
        toValue: 0,
        speed: 14,
        bounciness: 5,
        useNativeDriver: true,
      }),

    ]).start();

  }, []);

  // ===================================================
  // FETCH PRICING
  // ===================================================

  useEffect(() => {
    if (!pricing && !isOrganization) {
      fetchPricing();
    }
  }, [workerId, currentServiceCategory, userCity, isOrganization]);

  const fetchPricing = async () => {
    try {
      // Skip pricing for organizations
      if (isOrganization) {
        console.log('[TIMER] Skipping pricing for organization:', workerData?.name);
        setPricing({
          base_price: 0,
          worker_visit_charge: 0,
          platform_fee: 0,
          total_price: 0,
        });
        setLoadingPrice(false);
        return;
      }

      if (pricingCache.has(pricingCacheKey)) {
        setPricing(pricingCache.get(pricingCacheKey));
        setLoadingPrice(false);
        return;
      }

      if (pricingInFlight.has(pricingCacheKey)) {
        const result = await pricingInFlight.get(pricingCacheKey);
        if (result) setPricing(result);
        setLoadingPrice(false);
        return;
      }

      const token = await AsyncStorage.getItem('access_token');
      if (!token || !workerId || !currentServiceCategory) {
        setLoadingPrice(false);
        return;
      }

      console.log('[PRICE] Fetching pricing for worker profile:', { serviceCategory: currentServiceCategory, userCity, workerId });

      const fetchPromise = (async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/jobs/calculate-price/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              service_category: currentServiceCategory,
              city: userCity,
              worker_id: workerId,
            }),
          });

          const data = await response.json();
          if (data.success && data.pricing) {
            pricingCache.set(pricingCacheKey, data.pricing);
            return data.pricing;
          }
          return null;
        } catch (e) {
          return null;
        } finally {
          pricingInFlight.delete(pricingCacheKey);
        }
      })();

      pricingInFlight.set(pricingCacheKey, fetchPromise);
      const res = await fetchPromise;
      if (res) {
        setPricing(res);
      }
    } catch (error) {
      console.log('[FAIL] Error fetching pricing:', error);
    } finally {
      setLoadingPrice(false);
    }
  };


  // ===================================================
  // VOICE BUTTON
  // ===================================================

  const toggleVoiceIntroduction = async () => {
    if (!audioUrl) {
      Alert.alert(
        translate(language, 'voiceResume') || 'Voice Resume',
        'No voice introduction audio recorded for this worker yet.'
      );
      return;
    }

    try {
      setIsPlayingVoice(true);
      // Stream audio directly via in-app browser or native media intent
      await WebBrowser.openBrowserAsync(audioUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        controlsColor: COLORS.blue,
      });
    } catch (error) {
      console.log('[VOICE] Error opening in-app audio stream:', error);
      try {
        await Linking.openURL(audioUrl);
      } catch (linkError) {
        Alert.alert(
          translate(language, 'voiceResume') || 'Voice Resume',
          'Could not play the audio file. Please check your network connection.'
        );
      }
    } finally {
      setIsPlayingVoice(false);
    }
  };

  console.log('[SEARCH] Worker Profile - Route params:', routeParams);
  console.log('[SEARCH] Worker Profile - Direct props:', {workerProp, serviceCategoryProp, workLocationProp});
  console.log('[SEARCH] Worker Profile - Final worker data:', workerData);
  console.log('[SEARCH] Worker Profile - Navigation type:', navigation ? 'React Navigation' : 'Custom Navigation');

  // Guard: If no worker data at all
  if (!workerData && !service_category) {
    console.warn('[WARN] Worker Profile loaded without any worker data!');
  }

  // Merge worker data from route/props with proper field mapping
  const currentWorker = workerData ? {
    // Use data from route/props (from search results or navigation)
    id: workerData.id || workerData.worker_profile_id,
    user_id: workerData.user_id,
    name: workerData.name || workerData.user?.get_full_name || 'Worker',
    service: workerData.service || workerData.services?.[0] || service_category || 'Service Provider',
    distance: workerData.distance_km || workerData.distance || 0,
    rating: workerData.rating || workerData.average_rating || 4.5,
    reviews: workerData.reviews || workerData.total_jobs || workerData.total_jobs_completed || 0,
    experience: workerData.experience ? 
      (typeof workerData.experience === 'number' ? `${workerData.experience} years experience` : workerData.experience) :
      (workerData.years_of_experience ? `${workerData.years_of_experience} years experience` : '0 years experience'),
    photo: workerData.photo || workerData.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(workerData.name || 'Worker')}&background=49769F&color=fff&size=200`,
    description: workerData.description || workerData.bio || 'Professional service provider with quality work guarantee.',
    skills: workerData.skills || workerData.services || workerData.service_categories || [workerData.service || service_category || 'General Service'],
    education: workerData.education || workerData.qualification || 'Professional Training',
    certification: workerData.certification || (workerData.is_verified ? 'Verified Professional' : 'Professional'),
    phoneVerified: workerData.phoneVerified !== undefined ? workerData.phoneVerified : workerData.is_verified !== undefined ? workerData.is_verified : true,
    hourly_rate: workerData.hourly_rate || 0,
    voice_resume_url: rawVoiceUrl,
    total_jobs: workerData.total_jobs || workerData.total_jobs_completed || 0,
    is_available: workerData.is_available !== undefined ? workerData.is_available : true,
    // Pass through all other fields
    ...workerData,
    ...(workerProfile || {}),
    voice_resume_url: rawVoiceUrl,
    is_organization: isOrganization,
  } : workerProfile ? {
    id: workerProfile.id,
    user_id: workerProfile.user_id,
    name: workerProfile.name || 'Worker',
    service: workerProfile.service_categories?.[0] || service_category || 'Service Provider',
    distance: 0,
    rating: workerProfile.average_rating || 4.5,
    reviews: workerProfile.total_jobs_completed || 0,
    experience: `${workerProfile.years_of_experience || 0} years experience`,
    photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(workerProfile.name || 'Worker')}&background=49769F&color=fff&size=200`,
    description: workerProfile.bio || 'Professional service provider',
    skills: workerProfile.skills || workerProfile.service_categories || ['General Service'],
    education: 'Professional Training',
    certification: workerProfile.is_verified ? 'Verified Professional' : 'Professional',
    phoneVerified: workerProfile.is_verified,
    voice_resume_url: rawVoiceUrl,
    ...workerProfile,
  } : {
    // Fallback only if no worker data at all
    name: 'Worker',
    service: service_category || 'Service Provider',
    distance: 0,
    rating: 4.5,
    reviews: 0,
    experience: '0 years experience',
    photo: 'https://ui-avatars.com/api/?name=Worker&background=49769F&color=fff&size=200',
    description: 'Professional service provider',
    skills: ['General Service'],
    education: 'Professional Training',
    certification: 'Professional',
    phoneVerified: false,
  };

  console.log('[OK] Current Worker Data:', currentWorker);


  return (

    <SafeAreaView style={styles.container}>

      {/* =================================================
          HEADER
      ================================================= */}

      <View style={styles.header}>

        <Pressable
          delayPressIn={0}
          style={styles.backButton}
          onPress={() => {
            console.log('[BACK] Back button pressed');
            // Try React Navigation first, then custom navigation
            if (navigation?.goBack) {
              navigation.goBack();
            } else if (onBack) {
              onBack();
            } else {
              console.warn('[WARN] No back navigation method available');
            }
          }}
        >

          <Ionicons
            name="arrow-back"
            size={23}
            color={COLORS.dark}
          />

        </Pressable>


        <Text style={styles.headerTitle}>
          {translate(language, 'workerProfile')}
        </Text>


        <View style={styles.headerSpace} />

      </View>


      {/* =================================================
          CONTENT
      ================================================= */}

      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity,
            transform: [
              {
                translateY,
              },
            ],
          },
        ]}
      >

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >

          {/* =================================================
              PROFILE HEADER
          ================================================= */}

          <View style={styles.profileHeader}>

            <View style={styles.photoWrapper}>

              <Image
                source={{
                  uri: currentWorker.photo,
                }}
                style={styles.profilePhoto}
              />

              <View style={styles.onlineDot} />

            </View>


            <Text style={styles.workerName}>
              {currentWorker.name}
            </Text>

            {/* ORGANIZATION PHONE */}
            {isOrganization && currentWorker.phone_number && (
              <Pressable 
                onPress={() => Linking.openURL(`tel:${currentWorker.phone_number}`)}
                style={styles.orgPhoneButton}
              >
                <Ionicons name="call" size={16} color={COLORS.blue} />
                <Text style={styles.orgPhoneText}>{currentWorker.phone_number}</Text>
              </Pressable>
            )}

            {/* VERIFIED */}

            {currentWorker.phoneVerified && (

              <View style={styles.verifiedRow}>

                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={COLORS.green}
                />

                <Text style={styles.verifiedText}>
                  {translate(language, 'verifiedProfessional')}
                </Text>

              </View>

            )}


            <Text style={styles.workerService}>
              {translateService(currentWorker.service, language)}
            </Text>


            {/* RATING */}

            <View style={styles.ratingRow}>

              <Ionicons
                name="star"
                size={17}
                color={COLORS.yellow}
              />

              <Text style={styles.ratingText}>
                {currentWorker.rating}
              </Text>

              <Text style={styles.reviewText}>
                {translate(language, 'reviewsCount').replace('{{count}}', currentWorker.reviews)}
              </Text>

            </View>

            {/* PRICING OR ORGANIZATION MESSAGE */}
            {isOrganization ? (
              <View style={styles.orgContactMessage}>
                <Ionicons name="information-circle-outline" size={20} color={COLORS.blue} />
                <Text style={styles.orgContactText}>
                  {translate(language, 'contactAdminPricing')}
                </Text>
              </View>
            ) : loadingPrice ? (
              <View style={styles.profilePricingLoading}>
                <ActivityIndicator size="small" color={COLORS.blue} />
                <Text style={styles.profilePricingLoadingText}>{translate(language, 'calculatingPrice')}</Text>
              </View>
            ) : pricing ? (
              <View style={styles.profilePricingCard}>
                <View style={styles.profilePricingRow}>
                  <Text style={styles.profilePricingLabel}>{translate(language, 'basePrice')}</Text>
                  <Text style={styles.profilePricingValue}>Rs. {pricing.base_price}</Text>
                </View>
                <View style={styles.profilePricingRow}>
                  <Text style={styles.profilePricingLabel}>{translate(language, 'visitCharge')}</Text>
                  <Text style={styles.profilePricingValue}>Rs. {pricing.worker_visit_charge}</Text>
                </View>
                <View style={styles.profilePricingRow}>
                  <Text style={styles.profilePricingLabel}>{translate(language, 'platformFee')}</Text>
                  <Text style={styles.profilePricingValue}>Rs. {pricing.platform_fee}</Text>
                </View>
                <View style={styles.profilePricingDivider} />
                <View style={styles.profilePricingRow}>
                  <Text style={styles.profilePricingTotalLabel}>{translate(language, 'totalPrice')}</Text>
                  <Text style={styles.profilePricingTotalValue}>Rs. {pricing.total_price}</Text>
                </View>
              </View>
            ) : null}

          </View>


          {/* =================================================
              VOICE INTRODUCTION
          ================================================= */}

          <View style={styles.voiceIntroCard}>

            {/* TOP */}

            <View style={styles.voiceIntroTop}>

              <View style={styles.voiceIconCircle}>

                <Ionicons
                  name="mic-outline"
                  size={22}
                  color={COLORS.blue}
                />

              </View>


              <View style={styles.voiceIntroText}>

                <Text
                  style={styles.voiceIntroTitle}
                >
                  {translate(language, 'voiceIntroduction')}
                </Text>

                <Text
                  style={styles.voiceIntroSubtitle}
                  numberOfLines={2}
                >
                  {audioUrl
                    ? (translate(language, 'voiceIntroSubtitle') || 'Hear {{name}} introduce themselves').replace('{{name}}', currentWorker.name)
                    : (language === 'hindi' ? 'अभी तक कोई आवाज़ परिचय रिकॉर्ड नहीं किया गया' : language === 'marathi' ? 'अद्याप आवाज परिचय रेकॉर्ड केलेला नाही' : 'No voice introduction recorded yet')}
                </Text>

              </View>


              <View style={styles.voiceDuration}>

                <Ionicons
                  name="headset-outline"
                  size={14}
                  color={COLORS.gray}
                />

                <Text
                  style={styles.voiceDurationText}
                >
                  {audioUrl ? '0:30' : '0:00'}
                </Text>

              </View>

            </View>


            {/* PLAYER */}

            <View style={styles.voicePlayer}>

              <Pressable
                style={[
                  styles.voicePlayButton,
                  isPlayingVoice &&
                    styles.voicePlayButtonActive,
                ]}
                onPress={
                  toggleVoiceIntroduction
                }
              >

                <Ionicons
                  name={
                    isPlayingVoice
                      ? 'pause'
                      : 'play'
                  }
                  size={19}
                  color={COLORS.white}
                />

              </Pressable>


              {/* WAVEFORM */}

              <View style={styles.waveform}>

                {[
                  4,
                  8,
                  14,
                  10,
                  18,
                  7,
                  12,
                  20,
                  11,
                  6,
                  16,
                  9,
                  13,
                  5,
                ].map(
                  (
                    height,
                    index
                  ) => (

                    <View
                      key={index}
                      style={[
                        styles.waveBar,
                        {
                          height,
                          opacity:
                            isPlayingVoice
                              ? index % 2 === 0
                                ? 1
                                : 0.65
                              : 0.55,
                        },
                      ]}
                    />

                  )
                )}

              </View>


              <Text style={styles.voiceTime}>
                {isPlayingVoice
                  ? translate(language, 'playing')
                  : (audioUrl ? 'Tap to play' : 'No audio')}
              </Text>

            </View>


            {/* DESCRIPTION */}

            <Text
              style={styles.voiceDescription}
            >
              {translate(language, 'voiceDescription')
                .replace('{{name}}', currentWorker.name)
                .replace('{{experience}}', currentWorker.experience)
                .replace('{{service}}', translateService(currentWorker.service, language))}
            </Text>

          </View>


          {/* =================================================
              QUICK INFORMATION
          ================================================= */}

          <View
            style={
              styles.quickInfoCard
            }
          >

            {/* DISTANCE */}

            <View
              style={
                styles.quickInfoItem
              }
            >

              <View
                style={
                  styles.quickIcon
                }
              >

                <Ionicons
                  name="location-outline"
                  size={19}
                  color={COLORS.blue}
                />

              </View>

              <Text
                style={
                  styles.quickValue
                }
              >
                {currentWorker.distance} km
              </Text>

              <Text
                style={
                  styles.quickLabel
                }
              >
                {translate(language, 'distance')}
              </Text>

            </View>


            <View
              style={
                styles.quickDivider
              }
            />


            {/* EXPERIENCE */}

            <View
              style={
                styles.quickInfoItem
              }
            >

              <View
                style={
                  styles.quickIcon
                }
              >

                <Ionicons
                  name="briefcase-outline"
                  size={19}
                  color={COLORS.blue}
                />

              </View>

              <Text
                style={
                  styles.quickValue
                }
                numberOfLines={1}
              >
                {currentWorker.experience}
              </Text>

              <Text
                style={
                  styles.quickLabel
                }
              >
                {translate(language, 'experience')}
              </Text>

            </View>


            <View
              style={
                styles.quickDivider
              }
            />


            {/* RATING */}

            <View
              style={
                styles.quickInfoItem
              }
            >

              <View
                style={
                  styles.quickIcon
                }
              >

                <Ionicons
                  name="star-outline"
                  size={19}
                  color={COLORS.blue}
                />

              </View>

              <Text
                style={
                  styles.quickValue
                }
              >
                {currentWorker.rating}/5
              </Text>

              <Text
                style={
                  styles.quickLabel
                }
              >
                {translate(language, 'rating')}
              </Text>

            </View>

          </View>


          {/* =================================================
              PRIVACY NOTE
          ================================================= */}

          <View style={styles.privacyNote}>
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={COLORS.blue}
            />
            <Text style={styles.privacyNoteText}>
              {translate(language, 'distancePrivacyNote')}
            </Text>
          </View>


          {/* =================================================
              ABOUT WORKER
          ================================================= */}

          <Text style={styles.sectionTitle}>
            {translate(language, 'aboutWorker')}
          </Text>


          <View style={styles.sectionCard}>

            <Text
              style={styles.description}
            >
              {currentWorker.description}
            </Text>

          </View>


          {/* =================================================
              DIGITAL RESUME
          ================================================= */}

          <Text style={styles.sectionTitle}>
            {translate(language, 'digitalResume')}
          </Text>


          <View style={styles.resumeCard}>

            <View style={styles.resumeHeader}>

              <View style={styles.resumeIcon}>

                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color={COLORS.blue}
                />

              </View>

              <View
                style={
                  styles.resumeHeaderText
                }
              >

                <Text
                  style={
                    styles.resumeTitle
                  }
                >
                  {translate(language, 'professionalResume')}
                </Text>

                <Text
                  style={
                    styles.resumeSubtitle
                  }
                >
                  {translate(language, 'verifiedWorkerInfo')}
                </Text>

              </View>

              <Ionicons
                name="checkmark-circle"
                size={22}
                color={COLORS.green}
              />

            </View>


            <View
              style={
                styles.resumeDivider
              }
            />


            {/* EXPERIENCE */}

            <View
              style={styles.resumeRow}
            >

              <Ionicons
                name="briefcase-outline"
                size={18}
                color={COLORS.gray}
              />

              <View
                style={styles.resumeText}
              >

                <Text
                  style={
                    styles.resumeLabel
                  }
                >
                  {translate(language, 'experience')}
                </Text>

                <Text
                  style={
                    styles.resumeValue
                  }
                >
                  {currentWorker.experience}
                </Text>

              </View>

            </View>


            {/* QUALIFICATION */}

            <View
              style={styles.resumeRow}
            >

              <Ionicons
                name="school-outline"
                size={18}
                color={COLORS.gray}
              />

              <View
                style={styles.resumeText}
              >

                <Text
                  style={
                    styles.resumeLabel
                  }
                >
                  {translate(language, 'qualification')}
                </Text>

                <Text
                  style={
                    styles.resumeValue
                  }
                >
                  {currentWorker.education}
                </Text>

              </View>

            </View>


            {/* CERTIFICATION */}

            <View
              style={styles.resumeRow}
            >

              <Ionicons
                name="ribbon-outline"
                size={18}
                color={COLORS.gray}
              />

              <View
                style={styles.resumeText}
              >

                <Text
                  style={
                    styles.resumeLabel
                  }
                >
                  {translate(language, 'certification')}
                </Text>

                <Text
                  style={
                    styles.resumeValue
                  }
                >
                  {currentWorker.certification}
                </Text>

              </View>

            </View>


            <Pressable
              delayPressIn={0}
              style={
                styles.resumeButton
              }
            >

              <Ionicons
                name="eye-outline"
                size={17}
                color={COLORS.blue}
              />

              <Text
                style={
                  styles.resumeButtonText
                }
              >
                {translate(language, 'viewFullResume')}
              </Text>

            </Pressable>

          </View>


          {/* =================================================
              SKILLS
          ================================================= */}

          <Text
            style={styles.sectionTitle}
          >
            {translate(language, 'skillsAndServices')}
          </Text>


          <View
            style={styles.skillsCard}
          >

            {(currentWorker.skills || [])
              .map(
                (
                  skill,
                  index
                ) => (

                  <View
                    key={index}
                    style={
                      styles.skillChip
                    }
                  >

                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={COLORS.green}
                    />

                    <Text
                      style={
                        styles.skillText
                      }
                    >
                      {translateService(skill, language)}
                    </Text>

                  </View>

                )
              )}

          </View>


          {/* =================================================
              PREVIOUS WORK
          ================================================= */}

          <View
            style={styles.workHeader}
          >

            <View>

              <Text
                style={styles.sectionTitle}
              >
                {translate(language, 'previousWork')}
              </Text>

              <Text
                style={
                  styles.workSubtitle
                }
              >
                {translate(language, 'recentProjectsSubtitle')}
              </Text>

            </View>

          </View>


          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.workImagesContainer
            }
          >

            {previousWorkImages.map(
              (
                image,
                index
              ) => (

                <View
                  key={index}
                  style={
                    styles.workImageWrapper
                  }
                >

                  <Image
                    source={{
                      uri: image,
                    }}
                    style={
                      styles.workImage
                    }
                  />


                  <View
                    style={
                      styles.workImageLabel
                    }
                  >

                    <Text
                      style={
                        styles.workImageText
                      }
                    >
                      {translate(language, 'projectLabel').replace('{{number}}', index + 1)}
                    </Text>

                  </View>

                </View>

              )
            )}

          </ScrollView>


          {/* =================================================
              REVIEWS
          ================================================= */}

          <View
            style={
              styles.reviewHeader
            }
          >

            <Text
              style={
                styles.sectionTitle
              }
            >
              {translate(language, 'ratingsAndReviews')}
            </Text>

            <Text
              style={
                styles.allReviews
              }
            >
              {translate(language, 'viewAll')}
            </Text>

          </View>


          <View
            style={
              styles.ratingSummary
            }
          >

            <Text
              style={
                styles.bigRating
              }
            >
              {currentWorker.rating}
            </Text>


            <View>

              <View
                style={
                  styles.starsRow
                }
              >

                {[1, 2, 3, 4, 5].map(
                  (star) => (

                    <Ionicons
                      key={star}
                      name="star"
                      size={17}
                      color={
                        COLORS.yellow
                      }
                    />

                  )
                )}

              </View>


              <Text
                style={
                  styles.totalReviews
                }
              >
                {translate(language, 'basedOnReviews').replace('{{count}}', currentWorker.reviews)}
              </Text>

            </View>

          </View>


          {/* SAMPLE REVIEW */}

          <View
            style={
              styles.reviewCard
            }
          >

            <View
              style={
                styles.reviewTop
              }
            >

              <View
                style={
                  styles.reviewerCircle
                }
              >

                <Ionicons
                  name="person"
                  size={19}
                  color={
                    COLORS.white
                  }
                />

              </View>


              <View
                style={
                  styles.reviewerInfo
                }
              >

                <Text
                  style={
                    styles.reviewerName
                  }
                >
                  {translate(language, 'customerReview')}
                </Text>


                <View
                  style={
                    styles.starsRow
                  }
                >

                  {[1, 2, 3, 4, 5].map(
                    (star) => (

                      <Ionicons
                        key={star}
                        name="star"
                        size={12}
                        color={
                          COLORS.yellow
                        }
                      />

                    )
                  )}

                </View>

              </View>

            </View>


            <Text
              style={
                styles.reviewDescription
              }
            >
              {translate(language, 'sampleReviewText')}
            </Text>

          </View>


          {/* =================================================
              ACTION BUTTONS
          ================================================= */}

          <View
            style={
              styles.actionContainer
            }
          >

            {/* REQUEST / BOOK */}

            <Pressable
              delayPressIn={0}
              style={({
                pressed,
              }) => [

                styles.requestButton,

                pressed &&
                  styles.buttonPressed,

              ]}
              onPress={() => {
                console.log('[BTN] Request Worker button pressed');
                console.log('[REQ] Worker data:', currentWorker);
                console.log('[REQ] Service category:', service_category || currentWorker.service);
                
                // Try custom callback first (App.js), then React Navigation
                if (onRequestWorker) {
                  onRequestWorker(currentWorker, service_category || currentWorker.service, work_location);
                } else if (navigation?.navigate) {
                  navigation.navigate('Bookworkerscreen', {
                    worker: currentWorker,
                    service_category: service_category || currentWorker.service,
                    work_location: work_location,
                  });
                } else {
                  console.warn('[WARN] No navigation method available for Request Worker');
                  Alert.alert(
                    translate(language, 'validationError'),
                    translate(language, 'unableToNavigateBooking')
                  );
                }
              }}
            >

              <Ionicons
                name="calendar-outline"
                size={20}
                color={
                  COLORS.white
                }
              />

              <Text
                style={
                  styles.requestButtonText
                }
              >
                {translate(language, 'requestWorker')}
              </Text>

            </Pressable>


            {/* CHOOSE ANOTHER */}

            <Pressable
              delayPressIn={0}
              style={({
                pressed,
              }) => [

                styles.anotherButton,

                pressed &&
                  styles.anotherButtonPressed,

              ]}
              onPress={() => {
                console.log('[BACK] Choose Another Worker button pressed');
                // Try custom callback first, then React Navigation
                if (onChooseAnother) {
                  onChooseAnother();
                } else if (navigation?.goBack) {
                  navigation.goBack();
                } else {
                  console.warn('[WARN] No navigation method available');
                }
              }}
            >

              <Ionicons
                name="swap-horizontal-outline"
                size={19}
                color={
                  COLORS.blue
                }
              />

              <Text
                style={
                  styles.anotherButtonText
                }
              >
                {translate(language, 'chooseAnotherWorker')}
              </Text>

            </Pressable>

          </View>


          <View
            style={
              styles.bottomSpace
            }
          />

        </ScrollView>

      </Animated.View>

    </SafeAreaView>

  );

}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },


  animatedContainer: {
    flex: 1,
  },


  // ===================================================
  // HEADER
  // ===================================================

  header: {
    height: 70,
    marginTop:30,
    backgroundColor:
      COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor:
      COLORS.border,
  },


  backButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor:
      '#F1F5F9',
    justifyContent:
      'center',
    alignItems: 'center',
  },


  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.dark,
  },


  headerSpace: {
    width: 43,
  },


  // ===================================================
  // SCROLL
  // ===================================================

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },


  // ===================================================
  // PROFILE HEADER
  // ===================================================

  profileHeader: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 22,
  },


  photoWrapper: {
    position: 'relative',
  },


  profilePhoto: {
    width: 125,
    height: 125,
    borderRadius: 63,
    backgroundColor:
      '#E2E8F0',
    borderWidth: 4,
    borderColor:
      COLORS.white,
    elevation: 6,
  },


  onlineDot: {
    position: 'absolute',
    right: 6,
    bottom: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor:
      COLORS.green,
    borderWidth: 3,
    borderColor:
      COLORS.white,
  },


  workerName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.dark,
    marginTop: 14,
  },


  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },


  verifiedText: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },


  workerService: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 6,
  },


  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },


  ratingText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.dark,
    marginLeft: 5,
  },


  reviewText: {
    fontSize: 12,
    color: COLORS.lightGray,
    marginLeft: 4,
  },


  // ===================================================
  // VOICE INTRODUCTION
  // ===================================================

  voiceIntroCard: {
    backgroundColor:
      COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 15,
    marginBottom: 25,
  },


  voiceIntroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },


  voiceIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor:
      COLORS.softBlue,
    justifyContent:
      'center',
    alignItems: 'center',
  },


  voiceIntroText: {
    flex: 1,
    marginLeft: 11,
  },


  voiceIntroTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.dark,
  },


  voiceIntroSubtitle: {
    fontSize: 10.5,
    color: COLORS.gray,
    marginTop: 3,
  },


  voiceDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 9,
  },


  voiceDurationText: {
    fontSize: 10,
    color: COLORS.gray,
    fontWeight: '700',
    marginLeft: 4,
  },


  voicePlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
    borderRadius: 13,
    backgroundColor:
      '#F8FAFC',
  },


  voicePlayButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor:
      COLORS.blue,
    justifyContent:
      'center',
    alignItems: 'center',
  },


  voicePlayButtonActive: {
    backgroundColor:
      '#345D7F',
  },


  waveform: {
    flex: 1,
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },


  waveBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor:
      COLORS.blue,
    marginHorizontal: 2,
  },


  voiceTime: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray,
    width: 43,
    textAlign: 'right',
  },


  voiceDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.gray,
    marginTop: 11,
    fontStyle: 'italic',
  },


  // ===================================================
  // QUICK INFORMATION
  // ===================================================

  quickInfoCard: {
    backgroundColor:
      COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },


  quickInfoItem: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },


  quickIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor:
      COLORS.softBlue,
    justifyContent:
      'center',
    alignItems: 'center',
    marginBottom: 6,
  },


  quickValue: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.dark,
    textAlign: 'center',
  },


  quickLabel: {
    fontSize: 10,
    color: COLORS.lightGray,
    marginTop: 3,
  },


  quickDivider: {
    width: 1,
    height: 48,
    backgroundColor:
      COLORS.border,
  },


  // ===================================================
  // SECTIONS
  // ===================================================

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 11,
  },


  sectionCard: {
    backgroundColor:
      COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    marginBottom: 24,
  },


  description: {
    fontSize: 13,
    lineHeight: 21,
    color: COLORS.gray,
  },


  // ===================================================
  // RESUME
  // ===================================================

  resumeCard: {
    backgroundColor:
      COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    marginBottom: 24,
  },


  resumeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },


  resumeIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor:
      COLORS.softBlue,
    justifyContent:
      'center',
    alignItems: 'center',
  },


  resumeHeaderText: {
    flex: 1,
    marginLeft: 11,
  },


  resumeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.dark,
  },


  resumeSubtitle: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 3,
  },


  resumeDivider: {
    height: 1,
    backgroundColor:
      COLORS.border,
    marginVertical: 14,
  },


  resumeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 13,
  },


  resumeText: {
    flex: 1,
    marginLeft: 10,
  },


  resumeLabel: {
    fontSize: 10,
    color: COLORS.lightGray,
  },


  resumeValue: {
    fontSize: 12,
    color: COLORS.dark,
    fontWeight: '600',
    marginTop: 3,
    lineHeight: 17,
  },


  resumeButton: {
    height: 42,
    borderRadius: 12,
    backgroundColor:
      COLORS.softBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'center',
    marginTop: 3,
  },


  resumeButtonText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },


  // ===================================================
  // SKILLS
  // ===================================================

  skillsCard: {
    backgroundColor:
      COLORS.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },


  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      COLORS.softBlue,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 8,
    margin: 4,
  },


  skillText: {
    fontSize: 11,
    color: COLORS.dark,
    fontWeight: '600',
    marginLeft: 4,
  },


  // ===================================================
  // PREVIOUS WORK
  // ===================================================

  workHeader: {
    marginBottom: 2,
  },


  workSubtitle: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: -5,
    marginBottom: 12,
  },


  workImagesContainer: {
    paddingBottom: 22,
  },


  workImageWrapper: {
    width: 190,
    height: 145,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor:
      '#E2E8F0',
  },


  workImage: {
    width: '100%',
    height: '100%',
  },


  workImageLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor:
      'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },


  workImageText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },


  // ===================================================
  // REVIEWS
  // ===================================================

  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },


  allReviews: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '700',
  },


  ratingSummary: {
    backgroundColor:
      COLORS.white,
    borderRadius: 17,
    padding: 16,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },


  bigRating: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.dark,
    marginRight: 15,
  },


  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },


  totalReviews: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 4,
  },


  reviewCard: {
    backgroundColor:
      COLORS.white,
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    marginBottom: 25,
  },


  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },


  reviewerCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor:
      COLORS.blue,
    justifyContent:
      'center',
    alignItems: 'center',
  },


  reviewerInfo: {
    marginLeft: 10,
  },


  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 3,
  },


  reviewDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.gray,
    marginTop: 11,
  },


  // ===================================================
  // ACTION BUTTONS
  // ===================================================

  actionContainer: {
    marginTop: 2,
  },


  requestButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor:
      COLORS.blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'center',
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor:
      COLORS.blue,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },


  requestButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
  },


  anotherButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor:
      COLORS.white,
    borderWidth: 1.5,
    borderColor:
      '#D6E4EE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'center',
    marginTop: 11,
  },


  anotherButtonText: {
    color: COLORS.blue,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 7,
  },


  buttonPressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },


  anotherButtonPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },


  bottomSpace: {
    height: 20,
  },


  // ===================================================
  // PRIVACY NOTE
  // ===================================================

  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softBlue,
    borderRadius: 12,
    padding: 12,
    marginBottom: 25,
  },

  privacyNoteText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.gray,
    marginLeft: 8,
    lineHeight: 16,
  },

  // ===================================================
  // PRICING STYLES
  // ===================================================
  profilePricingLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  profilePricingLoadingText: {
    fontSize: 13,
    color: COLORS.gray,
    marginLeft: 8,
  },
  profilePricingCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  profilePricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  profilePricingLabel: {
    fontSize: 13,
    color: COLORS.gray,
  },
  profilePricingValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.dark,
  },
  profilePricingDivider: {
    height: 1,
    backgroundColor: '#BFDBFE',
    marginVertical: 8,
  },
  profilePricingTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.dark,
  },
  profilePricingTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.blue,
  },
  
  // Organization styles
  orgPhoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  orgPhoneText: {
    fontSize: 14,
    color: COLORS.blue,
    marginLeft: 6,
    fontWeight: '600',
  },
  orgContactMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FD',
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  orgContactText: {
    fontSize: 13,
    color: COLORS.blue,
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
    lineHeight: 18,
  },
});