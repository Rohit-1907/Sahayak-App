import React, { useEffect, useRef, useState } from 'react';

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
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import { translate, translateService } from '../utils/translations';

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
  red: '#EF4444',
};

// Module-level caches for instant 0ms price rendering and in-flight deduplication
const pricingCache = new Map();
const pricingInFlight = new Map();

export default function Bookworkerscreen({
  route,
  navigation,
  // Direct props from App.js custom navigation
  worker: workerProp,
  serviceRequest: serviceRequestProp,
  language: languageProp,
  onBack,
  onSuccess,
}) {
  // Method 1: React Navigation (route.params)
  const routeParams = route?.params || {};
  const language = languageProp || routeParams?.language || 'english';
  const { 
    worker: workerFromRoute, 
    service_category: serviceCategoryFromRoute,
    work_location: workLocationFromRoute,
    serviceRequest: serviceRequestFromRoute 
  } = routeParams;

  // Method 2: Direct props (custom navigation in App.js)
  const worker = workerFromRoute || workerProp;
  const serviceRequest = serviceRequestFromRoute || serviceRequestProp;
  
  // Extract service_category and work_location from serviceRequest if not provided directly
  const service_category = serviceCategoryFromRoute || serviceRequest?.service;
  const work_location = workLocationFromRoute || {
    address: serviceRequest?.address,
    latitude: serviceRequest?.latitude,
    longitude: serviceRequest?.longitude
  };

  const isOrganization = !!(
    worker?.is_organization ||
    worker?.organization_id ||
    worker?.org_id ||
    worker?.role === 'organization_worker' ||
    worker?.role === 'organization_admin' ||
    worker?.role_name === 'organization_worker' ||
    worker?.role_name === 'organization_admin' ||
    worker?.user_type === 'organization'
  );

  const currentWorker = {
    name: 'Worker',
    service: 'Service Provider',
    distance: 0,
    rating: 4.5,
    reviews: 0,
    photo: worker?.photo || worker?.profile_picture || 
           `https://ui-avatars.com/api/?name=${encodeURIComponent(worker?.name || 'Worker')}&background=49769F&color=fff&size=200`,
    ...worker,
    is_organization: isOrganization,
  };

  const workerId = currentWorker.id || currentWorker.user_id;
  const serviceCategory = service_category || currentWorker.service;
  const userCity = work_location?.city || 'Pune';
  const pricingCacheKey = `${serviceCategory}_${userCity}_${workerId}`;

  const opacity = useRef(
    new Animated.Value(0)
  ).current;

  const translateY = useRef(
    new Animated.Value(25)
  ).current;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pricing, setPricing] = useState(() => (
    isOrganization
      ? { base_price: 0, worker_visit_charge: 0, platform_fee: 0, total_price: 0 }
      : (pricingCache.get(pricingCacheKey) || null)
  ));
  const [loadingPrice, setLoadingPrice] = useState(() => {
    if (isOrganization) return false;
    return !pricingCache.has(pricingCacheKey);
  });

  useEffect(() => {

    Animated.parallel([

      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
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

  // Fetch pricing
  useEffect(() => {
    if (!pricing && !isOrganization) {
      fetchPricing();
    }
  }, [workerId, serviceCategory, userCity, isOrganization]);

  const fetchPricing = async () => {
    try {
      // Skip pricing for organizations
      if (isOrganization) {
        console.log('[TIMER] Skipping pricing for organization:', currentWorker?.name);
        setPricing({ 
          base_price: 0,
          worker_visit_charge: 0,
          platform_fee: 0,
          total_price: 0 
        }); // Set zero pricing for organizations
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

      if (!token || !workerId || !serviceCategory) {
        console.log('[FAIL] Pricing fetch skipped');
        setLoadingPrice(false);
        return;
      }

      const fetchPromise = (async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/jobs/calculate-price/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              service_category: serviceCategory,
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
      console.log('[FAIL] Error fetching booking pricing:', error);
    } finally {
      setLoadingPrice(false);
    }
  };

  console.log('[TASK] Bookworkerscreen received:');
  console.log('   worker:', worker);
  console.log('   serviceRequest:', serviceRequest);
  console.log('   service_category:', service_category);
  console.log('   work_location:', work_location);


  // =====================================================
  // REQUEST DATA
  // =====================================================

  const request = serviceRequest || {};


  const displayService =
    service_category ||
    request.service ||
    currentWorker.service ||
    'Home Service';


  const displayDate =
    request.dateText ||
    (
      request.date instanceof Date
        ? request.date.toLocaleDateString(
            'en-IN',
            {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }
          )
        : null
    ) ||
    'Tomorrow (default)';


  const displayTime =
    request.timeText ||
    (
      request.time instanceof Date
        ? request.time.toLocaleTimeString(
            'en-IN',
            {
              hour: '2-digit',
              minute: '2-digit',
            }
          )
        : null
    ) ||
    '10:00 AM (default)';


  const displayAddress =
    work_location?.address ||
    request.address ||
    'Work location';


  const displayDescription =
    request.description ||
    'Work request for ' + displayService;


  const displayName =
    request.name ||
    'Client';


  // =====================================================
  // CONFIRM BOOKING
  // =====================================================

  const handleConfirmBooking = async () => {

    if (isSubmitting) {
      return; // Prevent double submission
    }

    // Wait for pricing to load if still loading (only for individual workers)
    if (!isOrganization && loadingPrice) {
      Alert.alert('Please wait', 'Calculating price...');
      return;
    }

    // Verify pricing is available (only for individual workers)
    if (!isOrganization && !pricing) {
      Alert.alert('Error', 'Unable to calculate pricing. Please try again.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Get auth token
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'Please login to continue');
        navigation?.navigate('Loginscreen');
        return;
      }

      // Validate required data
      if (!currentWorker.id && !currentWorker.user_id) {
        Alert.alert('Error', 'Worker information is missing');
        setIsSubmitting(false);
        return;
      }

      if (!work_location || !work_location.latitude || !work_location.longitude) {
        Alert.alert('Error', 'Work location is required');
        setIsSubmitting(false);
        return;
      }

      // Parse dates and times
      let requiredDate = request.date;
      let requiredTime = request.time;

      // Convert Date objects to strings if needed
      if (requiredDate instanceof Date) {
        // Format: YYYY-MM-DD
        const year = requiredDate.getFullYear();
        const month = String(requiredDate.getMonth() + 1).padStart(2, '0');
        const day = String(requiredDate.getDate()).padStart(2, '0');
        requiredDate = `${year}-${month}-${day}`;
      } else if (typeof requiredDate === 'string') {
        // If it's already a string, ensure proper format
        // Handle various date formats
        const dateObj = new Date(requiredDate);
        if (!isNaN(dateObj.getTime())) {
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          requiredDate = `${year}-${month}-${day}`;
        }
      }

      // Default to tomorrow if no date
      if (!requiredDate) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const year = tomorrow.getFullYear();
        const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const day = String(tomorrow.getDate()).padStart(2, '0');
        requiredDate = `${year}-${month}-${day}`;
      }

      // Convert time to HH:MM format
      if (requiredTime instanceof Date) {
        const hours = String(requiredTime.getHours()).padStart(2, '0');
        const minutes = String(requiredTime.getMinutes()).padStart(2, '0');
        requiredTime = `${hours}:${minutes}`;
      } else if (!requiredTime || typeof requiredTime !== 'string') {
        requiredTime = '10:00'; // Default time
      }

      // Handle organization requests differently
      // Determine source_language from active app language, route params, AsyncStorage, or default
      // Map: English/english -> 'en', Marathi/मराठी/marathi -> 'mr', Hindi/हिंदी/hindi -> 'hi'
      const getSourceLanguage = async () => {
        // 1. Use the actively selected app language prop (client selection is authoritative)
        if (languageProp) {
          const lang = String(languageProp).toLowerCase();
          if (lang === 'english' || lang === 'en') return 'en';
          if (lang === 'marathi' || lang === 'मराठी' || lang === 'mr') return 'mr';
          if (lang === 'hindi' || lang === 'हिंदी' || lang === 'hi') return 'hi';
        }
        // 2. Check route params for language
        const routeLanguage = routeParams.language || routeParams.selectedLanguage;
        if (routeLanguage) {
          const lang = String(routeLanguage).toLowerCase();
          if (lang === 'english' || lang === 'en') return 'en';
          if (lang === 'marathi' || lang === 'मराठी' || lang === 'mr') return 'mr';
          if (lang === 'hindi' || lang === 'हिंदी' || lang === 'hi') return 'hi';
        }
        // 3. Check AsyncStorage for persisted language
        try {
          const stored = await AsyncStorage.getItem('selected_language');
          if (stored) {
            const lang = String(stored).toLowerCase();
            if (lang === 'english' || lang === 'en') return 'en';
            if (lang === 'marathi' || lang === 'मराठी' || lang === 'mr') return 'mr';
            if (lang === 'hindi' || lang === 'हिंदी' || lang === 'hi') return 'hi';
          }
        } catch (_) {
          // Ignore AsyncStorage errors
        }
        // 4. Default to English
        return 'en';
      };

      const sourceLanguage = await getSourceLanguage();

      if (isOrganization) {
        console.log('[ORG] Creating organization work request');
        
        // Get client info from AsyncStorage
        const clientData = await AsyncStorage.getItem('client_data');
        const client = clientData ? JSON.parse(clientData) : {};
        
        console.log('[TASK] Client data from storage:', client);
        
        // Get contact number - check multiple possible fields
        let clientContact = client.phone_number || client.phone || client.mobile || client.contact_number || '';
        
        // If still empty, try to get from user data
        if (!clientContact) {
          const userData = await AsyncStorage.getItem('user_data');
          if (userData) {
            const user = JSON.parse(userData);
            clientContact = user.phone_number || user.phone || user.mobile || '';
          }
        }
        
        // Final validation - use a placeholder if still empty
        if (!clientContact) {
          clientContact = '0000000000'; // Placeholder for missing contact
          console.log('[WARN] No client contact found, using placeholder');
        }

        let clientName = client.name || client.full_name || '';
        if (!clientName) {
          const userData = await AsyncStorage.getItem('user_data');
          if (userData) {
            const user = JSON.parse(userData);
            clientName = user.full_name || user.name || user.username || '';
          }
        }
        if (!clientName) {
          clientName = displayName || 'Client';
        }
        
        const orgPayload = {
          org_id: currentWorker.org_id || currentWorker.organization_id || currentWorker.id,
          client_name: clientName,
          client_contact: clientContact,
          work_description: displayDescription || 'Work request',
          work_type: displayService,
          work_location: work_location?.address || displayAddress || 'Location not provided',
          work_latitude: work_location?.latitude ? parseFloat(work_location.latitude) : null,
          work_longitude: work_location?.longitude ? parseFloat(work_location.longitude) : null,
          required_date: requiredDate,
          required_time: requiredTime,
          source_language: sourceLanguage,
        };

        console.log('[REQ] Creating organization work request with payload:', orgPayload);

        const response = await fetch(`${API_BASE_URL}/api/v1/org/requests/create/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orgPayload),
        });

        const data = await response.json();
        console.log('[RES] Organization work request response:', data);

        if (response.ok && data.success) {
          try {
            const keys = ['@cache_client_requests_all', '@cache_client_requests_pending', '@cache_client_requests_active', '@cache_client_requests_completed', '@cache_worker_requests_all', '@cache_worker_requests_pending'];
            AsyncStorage.multiRemove(keys);
          } catch (e) {}
          setIsSubmitting(false);
          Alert.alert(
            translate(language, 'requestSentTitle'),
            translate(language, 'requestSentOrgBody')
              .replace('{{org}}', currentWorker.name || currentWorker.organization_name || 'Organization'),
            [
              {
                text: 'OK',
                onPress: () => {
                  if (onSuccess) {
                    onSuccess();
                  } else if (navigation?.navigate) {
                    navigation.navigate('home');
                  } else if (onBack) {
                    onBack();
                  }
                },
              },
            ]
          );
          return; // Exit early for organizations
        } else {
          const errorMsg = data.error || data.errors || 'Failed to create request. Please try again.';
          Alert.alert('Error', typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
          setIsSubmitting(false);
          return;
        }
      }

      // Regular worker request - Prepare request payload for new work_requests API
      const payload = {
        worker_id: currentWorker.id || currentWorker.user_id,
        service_category: displayService,
        title: displayName || `${displayService} Request`,
        description: displayDescription,
        work_address: work_location.address || displayAddress,
        work_latitude: parseFloat(work_location.latitude),
        work_longitude: parseFloat(work_location.longitude),
        required_date: requiredDate,
        required_time: requiredTime,
        number_of_workers: parseInt(request.number_of_workers || 1),
        estimated_budget: pricing.total_price,
        source_language: sourceLanguage,
      };

      console.log('[REQ] Creating work request with payload:');
      console.log('   worker_id:', payload.worker_id);
      console.log('   estimated_budget:', payload.estimated_budget);
      console.log('   pricing:', pricing);

      // Call new work_requests API endpoint
      const response = await fetch(`${API_BASE_URL}/api/v1/jobs/work-requests/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log('[RES] Work request response:', data);

      if (response.ok && data.success) {
        // Success!
        try {
          const keys = ['@cache_client_requests_all', '@cache_client_requests_pending', '@cache_client_requests_active', '@cache_client_requests_completed', '@cache_worker_requests_all', '@cache_worker_requests_pending'];
          AsyncStorage.multiRemove(keys);
        } catch (e) {}
        setIsSubmitting(false);
        Alert.alert(
          translate(language, 'requestSentTitle'),
          translate(language, 'requestSentBody')
            .replace('{{service}}', translateService(displayService, language))
            .replace('{{worker}}', currentWorker.name),
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate directly to home
                if (onSuccess) {
                  onSuccess();
                } else if (navigation?.navigate) {
                  navigation.navigate('home');
                } else if (onBack) {
                  onBack();
                }
              },
            },
          ]
        );
      } else {
        // API error
        const errorMsg = data.error || data.details || 'Failed to create request. Please try again.';
        Alert.alert('Error', typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('[FAIL] Booking error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };


  return (

    <SafeAreaView
      style={styles.container}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <View
        style={styles.header}
      >

        <Pressable
          delayPressIn={0}
          style={styles.backButton}
          onPress={() => {
            if (onBack) {
              onBack();
            } else if (navigation?.goBack) {
              navigation.goBack();
            }
          }}
        >

          <Ionicons
            name="arrow-back"
            size={23}
            color={COLORS.dark}
          />

        </Pressable>


        <Text
          style={styles.headerTitle}
        >
          {translate(language, 'bookWorker')}
        </Text>


        <View
          style={styles.headerSpace}
        />

      </View>


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
              CONFIRMATION ICON
          ================================================= */}

          <View
            style={
              styles.confirmationCircle
            }
          >

            <Ionicons
              name="checkmark"
              size={34}
              color={COLORS.white}
            />

          </View>


          <Text
            style={styles.pageTitle}
          >
            {translate(language, 'confirmYourBooking')}
          </Text>


          <Text
            style={styles.pageSubtitle}
          >
            {translate(language, 'reviewBookingSubtitle')}
          </Text>


          {/* =================================================
              SELECTED WORKER
          ================================================= */}

          <Text
            style={styles.sectionTitle}
          >
            {translate(language, 'selectedWorker')}
          </Text>


          <View
            style={styles.workerCard}
          >

            <Image
              source={{
                uri:
                  currentWorker.photo,
              }}
              style={
                styles.workerPhoto
              }
            />


            <View
              style={styles.workerInfo}
            >

              <Text
                style={styles.workerName}
              >
                {currentWorker.name}
              </Text>


              <Text
                style={styles.workerService}
              >
                {translateService(currentWorker.service, language)}
              </Text>


              <View
                style={styles.ratingRow}
              >

                <Ionicons
                  name="star"
                  size={15}
                  color="#F59E0B"
                />


                <Text
                  style={styles.rating}
                >
                  {currentWorker.rating}
                </Text>


                <Text
                  style={styles.reviews}
                >
                  ({currentWorker.reviews} reviews)
                </Text>

              </View>

            </View>


            <View
              style={styles.verifiedBadge}
            >

              <Ionicons
                name="checkmark-circle"
                size={14}
                color={
                  COLORS.green
                }
              />


              <Text
                style={styles.verifiedText}
              >
                {translate(language, 'verifiedWorkers') || 'Verified'}
              </Text>

            </View>

          </View>


          {/* =================================================
              YOUR DETAILS
          ================================================= */}

          <Text
            style={styles.sectionTitle}
          >
            {translate(language, 'yourDetails')}
          </Text>


          <View
            style={styles.detailsCard}
          >

            {/* NAME */}

            <View
              style={styles.detailRow}
            >

              <View
                style={
                  styles.detailIcon
                }
              >

                <Ionicons
                  name="person-outline"
                  size={19}
                  color={
                    COLORS.blue
                  }
                />

              </View>


              <View
                style={styles.detailText}
              >

                <Text
                  style={
                    styles.detailLabel
                  }
                >
                  {translate(language, 'fullName') || 'Name'}
                </Text>


                <Text
                  style={
                    styles.detailValue
                  }
                >
                  {displayName}
                </Text>

              </View>

            </View>


            {/* SERVICE */}

            <View
              style={styles.detailRow}
            >

              <View
                style={
                  styles.detailIcon
                }
              >

                <Ionicons
                  name="construct-outline"
                  size={19}
                  color={
                    COLORS.blue
                  }
                />

              </View>


              <View
                style={styles.detailText}
              >

                <Text
                  style={
                    styles.detailLabel
                  }
                >
                  {translate(language, 'service')}
                </Text>


                <Text
                  style={
                    styles.detailValue
                  }
                >
                  {translateService(displayService, language)}
                </Text>

              </View>

            </View>


            {/* DATE */}

            <View
              style={styles.detailRow}
            >

              <View
                style={
                  styles.detailIcon
                }
              >

                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color={
                    COLORS.blue
                  }
                />

              </View>


              <View
                style={styles.detailText}
              >

                <Text
                  style={
                    styles.detailLabel
                  }
                >
                  {translate(language, 'date')}
                </Text>


                <Text
                  style={
                    styles.detailValue
                  }
                >
                  {displayDate}
                </Text>

              </View>

            </View>


            {/* TIME */}

            <View
              style={styles.detailRow}
            >

              <View
                style={
                  styles.detailIcon
                }
              >

                <Ionicons
                  name="time-outline"
                  size={19}
                  color={
                    COLORS.blue
                  }
                />

              </View>


              <View
                style={styles.detailText}
              >

                <Text
                  style={
                    styles.detailLabel
                  }
                >
                  {translate(language, 'time')}
                </Text>


                <Text
                  style={
                    styles.detailValue
                  }
                >
                  {displayTime}
                </Text>

              </View>

            </View>


            {/* ADDRESS */}

            <View
              style={styles.detailRow}
            >

              <View
                style={
                  styles.detailIcon
                }
              >

                <Ionicons
                  name="location-outline"
                  size={19}
                  color={
                    COLORS.blue
                  }
                />

              </View>


              <View
                style={styles.detailText}
              >

                <Text
                  style={
                    styles.detailLabel
                  }
                >
                  {translate(language, 'serviceAddress')}
                </Text>


                <Text
                  style={
                    styles.detailValue
                  }
                >
                  {displayAddress}
                </Text>

              </View>

            </View>


            {/* DESCRIPTION */}

            <View
              style={[
                styles.detailRow,
                styles.lastDetailRow,
              ]}
            >

              <View
                style={
                  styles.detailIcon
                }
              >

                <Ionicons
                  name="document-text-outline"
                  size={19}
                  color={
                    COLORS.blue
                  }
                />

              </View>


              <View
                style={styles.detailText}
              >

                <Text
                  style={
                    styles.detailLabel
                  }
                >
                  {translate(language, 'workDescription')}
                </Text>


                <Text
                  style={
                    styles.detailValue
                  }
                >
                  {displayDescription}
                </Text>

              </View>

            </View>

          </View>


          {/* =================================================
              BOOKING INFORMATION
          ================================================= */}

          <Text
            style={styles.sectionTitle}
          >
            {translate(language, 'bookingInformation')}
          </Text>

          {/* PRICING CARD OR ORGANIZATION MESSAGE */}
          {isOrganization ? (
            <View style={styles.orgPricingMessage}>
              <Ionicons name="information-circle-outline" size={22} color={COLORS.blue} />
              <Text style={styles.orgPricingText}>
                {translate(language, 'finalPricingOrgNotice')}
              </Text>
            </View>
          ) : loadingPrice ? (
            <View style={styles.pricingLoadingCard}>
              <ActivityIndicator size="small" color={COLORS.blue} />
              <Text style={styles.pricingLoadingText}>{translate(language, 'calculatingPrice')}</Text>
            </View>
          ) : pricing ? (
            <View style={styles.pricingCard}>
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>{translate(language, 'basePrice')}</Text>
                <Text style={styles.pricingValue}>Rs. {pricing.base_price}</Text>
              </View>
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>{translate(language, 'visitCharge')}</Text>
                <Text style={styles.pricingValue}>Rs. {pricing.worker_visit_charge}</Text>
              </View>
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>{translate(language, 'platformFee')}</Text>
                <Text style={styles.pricingValue}>Rs. {pricing.platform_fee}</Text>
              </View>
              <View style={styles.pricingDivider} />
              <View style={styles.pricingRow}>
                <Text style={styles.pricingTotalLabel}>{translate(language, 'totalPrice')}</Text>
                <Text style={styles.pricingTotalValue}>Rs. {pricing.total_price}</Text>
              </View>
            </View>
          ) : null}


          <View
            style={styles.infoBanner}
          >

            <View
              style={styles.infoIcon}
            >

              <Ionicons
                name="information-circle-outline"
                size={20}
                color={
                  COLORS.blue
                }
              />

            </View>


            <Text
              style={styles.infoText}
            >
              {isOrganization
                ? translate(language, 'orgRequestConfirmationNotice')
                : translate(language, 'workerRequestConfirmationNotice')}
            </Text>

          </View>


          {/* =================================================
              CONFIRM BUTTON
          ================================================= */}

          <Pressable
            delayPressIn={0}
            style={({ pressed }) => [

              styles.confirmButton,

              pressed &&
                styles.pressed,
              
              isSubmitting &&
                styles.confirmButtonDisabled,

            ]}
            onPress={
              handleConfirmBooking
            }
            disabled={isSubmitting}
          >

            {isSubmitting ? (
              <>
                <ActivityIndicator size="small" color={COLORS.white} />
                <Text
                  style={
                    styles.confirmButtonText
                  }
                >
                  {translate(language, 'creatingRequest')}
                </Text>
              </>
            ) : (
              <>
                <View
                  style={
                    styles.buttonCheck
                  }
                >

                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={
                      COLORS.blue
                    }
                  />

                </View>


                <Text
                  style={
                    styles.confirmButtonText
                  }
                >
                  {isOrganization ? translate(language, 'sendRequestToOrg') : translate(language, 'confirmAndBookWorker')}
                </Text>


                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={
                    COLORS.white
                  }
                />
              </>
            )}

          </Pressable>


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

    header: {
      height: 70,
      marginTop: 30,
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

    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },

    confirmationCircle: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor:
        COLORS.blue,
      justifyContent:
        'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginTop: 10,
    },

    pageTitle: {
      fontSize: 25,
      fontWeight: '800',
      color: COLORS.dark,
      textAlign: 'center',
      marginTop: 15,
    },

    pageSubtitle: {
      fontSize: 13,
      lineHeight: 20,
      color: COLORS.gray,
      textAlign: 'center',
      marginTop: 6,
      marginBottom: 23,
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: COLORS.dark,
      marginTop: 24,
      marginBottom: 11,
    },

    workerCard: {
      backgroundColor:
        COLORS.white,
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      padding: 15,
      flexDirection: 'row',
      alignItems: 'center',
    },

    workerPhoto: {
      width: 65,
      height: 65,
      borderRadius: 18,
      backgroundColor:
        '#E2E8F0',
    },

    workerInfo: {
      flex: 1,
      marginLeft: 12,
    },

    workerName: {
      fontSize: 17,
      fontWeight: '800',
      color: COLORS.dark,
    },

    workerService: {
      fontSize: 12,
      color: COLORS.gray,
      marginTop: 3,
    },

    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },

    rating: {
      fontSize: 12,
      fontWeight: '800',
      color: COLORS.dark,
      marginLeft: 4,
    },

    reviews: {
      fontSize: 10,
      color: COLORS.lightGray,
      marginLeft: 3,
    },

    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        '#ECFDF5',
      borderRadius: 9,
      paddingHorizontal: 7,
      paddingVertical: 5,
    },

    verifiedText: {
      fontSize: 9,
      fontWeight: '700',
      color: COLORS.green,
      marginLeft: 3,
    },

    detailsCard: {
      backgroundColor:
        COLORS.white,
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      padding: 15,
    },

    detailRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 15,
    },

    lastDetailRow: {
      marginBottom: 0,
    },

    detailIcon: {
      width: 39,
      height: 39,
      borderRadius: 12,
      backgroundColor:
        COLORS.softBlue,
      justifyContent:
        'center',
      alignItems: 'center',
    },

    detailText: {
      flex: 1,
      marginLeft: 10,
    },

    detailLabel: {
      fontSize: 10,
      color: COLORS.lightGray,
    },

    detailValue: {
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.dark,
      marginTop: 3,
      lineHeight: 19,
    },

    infoBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor:
        COLORS.softBlue,
      borderRadius: 14,
      padding: 13,
      borderWidth: 1,
      borderColor:
        '#D6E7F2',
    },

    infoIcon: {
      marginTop: 1,
    },

    infoText: {
      flex: 1,
      fontSize: 11,
      lineHeight: 18,
      color: COLORS.gray,
      marginLeft: 8,
    },

    confirmButton: {
      height: 57,
      borderRadius: 16,
      backgroundColor:
        COLORS.blue,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      paddingHorizontal: 15,
      marginTop: 25,
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

    buttonCheck: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor:
        COLORS.white,
      justifyContent:
        'center',
      alignItems: 'center',
      marginRight: 8,
    },

    confirmButtonText: {
      color: COLORS.white,
      fontSize: 14,
      fontWeight: '800',
      marginRight: 8,
    },

    pressed: {
      opacity: 0.75,
      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    confirmButtonDisabled: {
      opacity: 0.6,
    },

    bottomSpace: {
      height: 25,
    },

    pricingLoadingCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.white,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: 16,
      marginBottom: 15,
    },

    pricingLoadingText: {
      fontSize: 13,
      color: COLORS.gray,
      marginLeft: 10,
    },

    pricingCard: {
      backgroundColor: '#F0F9FF',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#BFDBFE',
      padding: 16,
      marginBottom: 15,
    },

    pricingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },

    pricingLabel: {
      fontSize: 13,
      color: COLORS.gray,
    },

    pricingValue: {
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.dark,
    },

    pricingDivider: {
      height: 1,
      backgroundColor: '#BFDBFE',
      marginVertical: 8,
    },

    pricingTotalLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: COLORS.dark,
    },

    pricingTotalValue: {
      fontSize: 20,
      fontWeight: '800',
      color: COLORS.blue,
    },
    
    // Organization pricing message styles
    orgPricingMessage: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: '#E8F4FD',
      padding: 16,
      borderRadius: 16,
      marginTop: 4,
      borderWidth: 1,
      borderColor: '#BFDBFE',
    },
    orgPricingText: {
      fontSize: 13,
      color: COLORS.blue,
      marginLeft: 12,
      flex: 1,
      fontWeight: '500',
      lineHeight: 19,
    },

  });
