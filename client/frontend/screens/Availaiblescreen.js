import React, { useState, useEffect } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
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


// Module-level caches for instant 0ms price rendering and in-flight deduplication
const pricingCache = new Map();
const pricingInFlight = new Map();

// =====================================================
// WORKER CARD
// =====================================================

function WorkerCard({
  worker,
  onViewWorker,
  serviceCategory,
  userCity,
  language = 'english',
}) {
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

  const cacheKey = `${serviceCategory}_${userCity}_${worker?.id}`;
  const [pricing, setPricing] = useState(() => (
    isOrganization
      ? { base_price: 0, worker_visit_charge: 0, platform_fee: 0, total_price: 0 }
      : (pricingCache.get(cacheKey) || null)
  ));
  const [loadingPrice, setLoadingPrice] = useState(() => {
    if (isOrganization) return false;
    return !pricingCache.has(cacheKey);
  });

  useEffect(() => {
    if (!pricing && !isOrganization) {
      fetchPricing();
    }
  }, [worker?.id, serviceCategory, userCity, isOrganization]);

  const fetchPricing = async () => {
    try {
      // Skip pricing for organizations
      if (isOrganization) {
        setLoadingPrice(false);
        return;
      }

      if (pricingCache.has(cacheKey)) {
        setPricing(pricingCache.get(cacheKey));
        setLoadingPrice(false);
        return;
      }

      if (pricingInFlight.has(cacheKey)) {
        const result = await pricingInFlight.get(cacheKey);
        if (result) setPricing(result);
        setLoadingPrice(false);
        return;
      }

      const token = await AsyncStorage.getItem('access_token');
      if (!token || !worker?.id || !serviceCategory || !userCity) {
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
              worker_id: worker.id,
            }),
          });

          const data = await response.json();
          if (data.success && data.pricing) {
            pricingCache.set(cacheKey, data.pricing);
            return data.pricing;
          }
          return null;
        } catch (e) {
          return null;
        } finally {
          pricingInFlight.delete(cacheKey);
        }
      })();

      pricingInFlight.set(cacheKey, fetchPromise);
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

  return (

    <View style={styles.workerCard}>

      {/* TOP */}

      <View style={styles.workerTop}>

        <Image
          source={{
            uri: worker.photo,
          }}
          style={styles.workerPhoto}
        />

        <View style={styles.workerInfo}>

          <Text style={styles.workerName}>
            {worker.name}
          </Text>

          {isOrganization && worker.phone_number && (
            <TouchableOpacity 
              delayPressIn={0}
              activeOpacity={0.7}
              onPress={() => Linking.openURL(`tel:${worker.phone_number}`)}
              style={styles.orgPhoneRow}
            >
              <Ionicons name="call-outline" size={14} color={COLORS.blue} />
              <Text style={styles.orgPhoneText}>{worker.phone_number}</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.workerService}>
            {translateService(worker.service, language)}
          </Text>

          <View style={styles.ratingRow}>

            <Ionicons
              name="star"
              size={15}
              color={COLORS.yellow}
            />

            <Text style={styles.rating}>
              {worker.rating}
            </Text>

            <Text style={styles.reviews}>
              ({worker.reviews})
            </Text>

          </View>

        </View>

        {/* DISTANCE */}

        <View style={styles.distanceBadge}>

          <Ionicons
            name="location-outline"
            size={13}
            color={COLORS.blue}
          />

          <Text style={styles.distanceText}>
            {worker.distance} km
          </Text>

        </View>

      </View>


      {/* PRICING OR ORGANIZATION CONTACT MESSAGE */}
      {isOrganization ? (
        <View style={styles.orgContactMessage}>
          <Ionicons name="information-circle-outline" size={18} color={COLORS.blue} />
          <Text style={styles.orgContactText}>
            {translate(language, 'contactAdminPricing')}
          </Text>
        </View>
      ) : (
        loadingPrice ? (
          <View style={styles.pricingLoadingRow}>
            <ActivityIndicator size="small" color={COLORS.blue} />
            <Text style={styles.pricingLoadingText}>{translate(language, 'calculatingPrice')}</Text>
          </View>
        ) : pricing ? (
          <View style={styles.pricingBadge}>
            <Ionicons name="cash-outline" size={16} color={COLORS.blue} />
            <Text style={styles.pricingText}>{translate(language, 'totalPricePrefix')} {pricing.total_price}</Text>
          </View>
        ) : null
      )}


      {/* EXPERIENCE */}

      <View style={styles.infoRow}>

        <View style={styles.infoItem}>

          <Ionicons
            name="briefcase-outline"
            size={16}
            color={COLORS.blue}
          />

          <Text style={styles.infoText}>
            {worker.experience}
          </Text>

        </View>

        <View style={styles.available}>

          <View style={styles.greenDot} />

          <Text style={styles.availableText}>
            {translate(language, 'available')}
          </Text>

        </View>

      </View>


      {/* DESCRIPTION */}

      <Text
        style={styles.description}
        numberOfLines={2}
      >
        {worker.description}
      </Text>


      {/* DIVIDER */}

      <View style={styles.divider} />


      {/* VIEW WORKER */}

      <Pressable
        delayPressIn={0}
        style={({ pressed }) => [
          styles.viewButton,
          pressed && {
            opacity: 0.7,
          },
        ]}
        onPress={() => {
          if (onViewWorker) {
            onViewWorker({ ...worker, is_organization: isOrganization });
          }
        }}
      >

        <Ionicons
          name="person-outline"
          size={18}
          color={COLORS.blue}
        />

        <Text style={styles.viewButtonText}>
          {translate(language, 'viewWorker')}
        </Text>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={COLORS.blue}
        />

      </Pressable>

    </View>

  );
}


// =====================================================
// MAIN SCREEN
// =====================================================

export default function AvailableWorkersScreen({

  selectedService,

  workLocation = {},

  onBack,

  onViewWorker,

  language = 'english',

}) {

  console.log('[VIEW] AvailableWorkersScreen mounted with service:', selectedService);

  // IMPORTANT
  // Default radius is 20km to show more workers
  const [selectedRadius, setSelectedRadius] = useState(20);
  
  // API States
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Default city for pricing
  const userCity = workLocation.city || 'Pune';
  const requestLatitude = Number(workLocation.latitude);
  const requestLongitude = Number(workLocation.longitude);
  const hasRequestLocation = Number.isFinite(requestLatitude) && Number.isFinite(requestLongitude);
  console.log('[LOC] User city for pricing:', userCity);

  // SWR: Load cached workers immediately on mount
  useEffect(() => {
    let isMounted = true;
    const loadCache = async () => {
      try {
        const cached = await AsyncStorage.getItem(`@cache_available_workers_${selectedService}`);
        if (cached && isMounted) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setWorkers(parsed);
            setLoading(false);
          }
        }
      } catch (e) {}
    };
    loadCache();
    return () => { isMounted = false; };
  }, [selectedService]);

  // ===================================================
  // FETCH WORKERS FROM API
  // ===================================================

  const fetchWorkers = async (silent = false) => {
    console.log('[SEARCH] fetchWorkers called for service:', selectedService);
    
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      // Check if service is organization type
      const organizationTypes = ['Construction', 'Plumber', 'Electrician'];
      const isOrganizationType = organizationTypes.some(
        type => type.toLowerCase() === selectedService.toLowerCase()
      );

      if (isOrganizationType) {
        // ===== FETCH ORGANIZATIONS =====
        console.log('[ORG] Fetching organizations for:', selectedService);
        console.log('[LINK] API URL:', `${API_BASE_URL}/api/v1/org/list/?service_type=${encodeURIComponent(selectedService)}`);
        
        const response = await fetch(
          `${API_BASE_URL}/api/v1/org/list/?service_type=${encodeURIComponent(selectedService)}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('[API] Organization API Response Status:', response.status);
        const data = await response.json();
        console.log('[DATA] Organization API Response Data:', JSON.stringify(data, null, 2));

        if (response.ok && data.success) {
          console.log('[OK] Organizations found:', data.organisations?.length || 0);
          
          // Transform organizations to worker format for display
          const transformedOrgs = (data.organisations || []).map(org => ({
            id: org.org_id,
            name: org.org_name || org.company_name,
            service: org.service_type,
            distance: '0.0', // Organizations don't have distance
            rating: 4.5, // Default rating for organizations
            reviews: org.worker_count || 0,
            experience: 'Professional Organization',
            photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(org.org_name || 'Organization')}&background=49769F&color=fff&size=200`,
            description: org.description || `Professional ${org.service_type} organization providing quality services`,
            skills: [org.service_type],
            education: 'Organization',
            certification: 'Registered Organization',
            phoneVerified: true,
            city: org.city || 'Pune',
            address: org.address || '',
            phone_number: org.company_phone,
            // Organization-specific fields
            is_organization: true,
            organization_id: org.org_id,
            organization_name: org.org_name,
            worker_count: org.worker_count || 0,
            org_id: org.org_id,
            org_email: org.company_email,
          }));

          console.log('[REFRESH] Transformed organizations:', transformedOrgs);
          setWorkers(transformedOrgs);
          try {
            AsyncStorage.setItem(`@cache_available_workers_${selectedService}`, JSON.stringify(transformedOrgs));
          } catch (e) {}
          console.log(`[OK] Found ${transformedOrgs.length} organizations`);
        } else {
          console.error('[FAIL] Organization API Error:', data.error || 'Unknown error');
          setError(data.error || 'Failed to fetch organizations');
        }

        // ===== ADDITIONAL INDIVIDUAL WORKER FETCH (Plumber only) =====
        // Merges individual workers into the organization results for Plumber.
        // The organization listing above is left completely unchanged.
        if (selectedService && selectedService.toLowerCase() === 'plumber') {
          const workerToken = await AsyncStorage.getItem('access_token');

          if (workerToken) {
            const work_latitude = hasRequestLocation ? requestLatitude : 18.5204;
            const work_longitude = hasRequestLocation ? requestLongitude : 73.8567;

            const requestBody = {
              service_category: selectedService,
              work_latitude: work_latitude,
              work_longitude: work_longitude,
              search_radius: selectedRadius,
            };

            console.log('[MERGE] Searching individual workers for:', selectedService);
            console.log('[NET] API URL:', `${API_BASE_URL}/api/v1/users/workers/search/`);

            try {
              const workerResponse = await fetch(`${API_BASE_URL}/api/v1/users/workers/search/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${workerToken}`,
                },
                body: JSON.stringify(requestBody),
              });

              const workerData = await workerResponse.json();

              if (workerResponse.ok && workerData.success) {
                // Same transformation as the individual-worker branch
                const transformedWorkers = (workerData.workers || []).map(worker => ({
                  // CRITICAL: id must be worker_profile_id for booking API
                  id: worker.id,

                  // UI Display Fields
                  name: worker.full_name || worker.name || 'Unknown Worker',
                  service: worker.service_categories?.[0] || worker.services?.[0] || selectedService,
                  distance: parseFloat(worker.distance_km || 0).toFixed(1),
                  rating: parseFloat(worker.average_rating || worker.rating || 4.5),
                  reviews: parseInt(worker.completed_jobs_count || worker.total_jobs || 0),
                  experience: worker.years_of_experience
                    ? `${worker.years_of_experience} ${worker.years_of_experience === 1 ? 'year' : 'years'} experience`
                    : `${worker.experience || 0} years experience`,
                  photo: worker.photo || worker.profile_picture || worker.profile_photo_url || worker.photo_url ||
                         `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name || 'Worker')}&background=49769F&color=fff&size=200`,
                  description: worker.bio || worker.description || `Professional ${selectedService} with extensive experience. Available for quality service in your area.`,

                  // Additional Profile Fields
                  skills: worker.service_categories || worker.services || [selectedService],
                  education: worker.education || 'Professional Training',
                  certification: worker.certifications || 'Verified Professional',
                  phoneVerified: worker.is_phone_verified || true,

                  // Location Fields
                  city: worker.primary_city || worker.city || 'Pune',
                  address: worker.primary_address || worker.address || '',

                  // Keep original data for booking (user_id is separate from worker_profile_id)
                  user_id: worker.user_id,
                  worker_profile_id: worker.id,
                  phone_number: worker.phone_number,
                  primary_latitude: worker.primary_latitude,
                  primary_longitude: worker.primary_longitude,
                  hourly_rate: worker.hourly_rate || 0,

                  // Worker type for grouping
                  is_organization: false,
                  organization_id: null,
                  organization_name: null,
                }));

                setWorkers(prev => {
                  const merged = [...prev, ...transformedWorkers];
                  try {
                    AsyncStorage.setItem(`@cache_available_workers_${selectedService}`, JSON.stringify(merged));
                  } catch (e) {}
                  return merged;
                });
                console.log(`[MERGE] Added ${transformedWorkers.length} individual worker(s) for ${selectedService}`);
              } else {
                console.log('[MERGE] Individual worker fetch skipped/failed:', workerData.error || workerData.message || 'unknown');
              }
            } catch (err) {
              console.error('[FAIL] Error fetching individual workers for org category:', err);
            }
          }
        }

      } else {
        // ===== FETCH INDIVIDUAL WORKERS =====
        console.log('[USER] Fetching individual workers for:', selectedService);
        
        // Get auth token - use the correct key from auth.service.js
        const token = await AsyncStorage.getItem('access_token');
        
        console.log('[AUTH] Auth token:', token ? 'Found' : 'Not found');
        
        if (!token) {
          console.log('[FAIL] No auth token found');
          setError('Please login to search for workers');
          setLoading(false);
          return;
        }

        const work_latitude = hasRequestLocation ? requestLatitude : 18.5204;
        const work_longitude = hasRequestLocation ? requestLongitude : 73.8567;

        const requestBody = {
          service_category: selectedService || 'Cook',
          work_latitude: work_latitude,
          work_longitude: work_longitude,
          search_radius: selectedRadius,
        };

        console.log('[API] Searching workers with:', requestBody);
        console.log('[NET] API URL:', `${API_BASE_URL}/api/v1/users/workers/search/`);

        const response = await fetch(`${API_BASE_URL}/api/v1/users/workers/search/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        console.log('[MAIL] API Response status:', response.status);
        
        const data = await response.json();

        console.log('[DATA] API Response data:', data);

        if (response.ok) {
          // Transform API data to match our UI format
          const transformedWorkers = data.workers.map(worker => ({
            // CRITICAL: id must be worker_profile_id for booking API
            id: worker.id, // This is worker_profile_id from the API
            
            // UI Display Fields
            name: worker.full_name || worker.name || 'Unknown Worker',
            service: worker.service_categories?.[0] || worker.services?.[0] || selectedService,
            distance: parseFloat(worker.distance_km || 0).toFixed(1),
            rating: parseFloat(worker.average_rating || worker.rating || 4.5),
            reviews: parseInt(worker.completed_jobs_count || worker.total_jobs || 0),
            experience: worker.years_of_experience 
              ? `${worker.years_of_experience} ${worker.years_of_experience === 1 ? 'year' : 'years'} experience`
              : `${worker.experience || 0} years experience`,
            photo: worker.photo || worker.profile_picture || worker.profile_photo_url || worker.photo_url || 
                   `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name || 'Worker')}&background=49769F&color=fff&size=200`,
            description: worker.bio || worker.description || `Professional ${selectedService} with extensive experience. Available for quality service in your area.`,
            
            // Additional Profile Fields
            skills: worker.service_categories || worker.services || [selectedService],
            education: worker.education || 'Professional Training',
            certification: worker.certifications || 'Verified Professional',
            phoneVerified: worker.is_phone_verified || true,
            
            // Location Fields
            city: worker.primary_city || worker.city || 'Pune',
            address: worker.primary_address || worker.address || '',
            
            // Keep original data for booking (user_id is separate from worker_profile_id)
            user_id: worker.user_id,
            worker_profile_id: worker.id, // Explicit field for clarity
            phone_number: worker.phone_number,
            primary_latitude: worker.primary_latitude,
            primary_longitude: worker.primary_longitude,
            hourly_rate: worker.hourly_rate || 0,
            
            // Worker type for grouping
            is_organization: worker.organization_id ? true : false,
            organization_id: worker.organization_id || null,
            organization_name: worker.organization_name || null,
          }));

          setWorkers(transformedWorkers);
          try {
            AsyncStorage.setItem(`@cache_available_workers_${selectedService}`, JSON.stringify(transformedWorkers));
          } catch (e) {}
          console.log(`[OK] Found ${transformedWorkers.length} workers (${transformedWorkers.filter(w => !w.is_organization).length} individual, ${transformedWorkers.filter(w => w.is_organization).length} organization)`);
        } else {
          const errorMsg = data.message || data.error || 'Failed to fetch workers';
          setError(errorMsg);
          console.error('[FAIL] API Error:', data);
        }
      }

    } catch (err) {
      console.error('[FAIL] Error fetching workers:', err);
      setError('Unable to connect to server. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // FETCH ON MOUNT AND RADIUS CHANGE
  // ===================================================

  useEffect(() => {
    fetchWorkers(workers.length > 0);
  }, [selectedRadius]);


  // ===================================================
  // FILTER WORKERS BY DISTANCE AND GROUP BY TYPE
  // ===================================================

  let visibleWorkers = workers.filter(worker => worker.distance <= selectedRadius);
  
  // Separate individual and organization workers
  const individualWorkers = visibleWorkers.filter(worker => !worker.is_organization);
  const organizationWorkers = visibleWorkers.filter(worker => worker.is_organization);
  
  console.log(`[STATS] Workers: ${individualWorkers.length} individual, ${organizationWorkers.length} organization`);


  // ===================================================
  // CHANGE RADIUS
  // ===================================================

  const changeRadius = (newRadius) => {
    console.log('Changing radius to:', newRadius);
    setSelectedRadius(newRadius);
  };


  return (

    <SafeAreaView style={styles.container}>

      {/* =================================================
          HEADER
      ================================================= */}

      <View style={styles.header}>

        <Pressable
          delayPressIn={0}
          style={styles.backButton}
          onPress={onBack}
        >

          <Ionicons
            name="arrow-back"
            size={23}
            color={COLORS.dark}
          />

        </Pressable>

        <View>

          <Text style={styles.headerTitle}>
            {translate(language, 'availableWorkers')}
          </Text>

          <Text style={styles.headerSubtitle}>
            {translate(language, 'chooseProfessional')}
          </Text>

        </View>

      </View>


      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* =================================================
            SERVICE
        ================================================= */}

        <View style={styles.serviceCard}>

          <View style={styles.serviceIcon}>

            <Ionicons
              name="construct-outline"
              size={23}
              color={COLORS.blue}
            />

          </View>

          <View style={styles.serviceText}>

            <Text style={styles.serviceLabel}>
              {translate(language, 'lookingFor')}
            </Text>

            <Text style={styles.serviceName}>
              {translateService(selectedService, language) || translate(language, 'homeService')}
            </Text>

          </View>

          <Ionicons
            name="checkmark-circle"
            size={23}
            color={COLORS.green}
          />

        </View>


        {/* =================================================
            RADIUS TITLE
        ================================================= */}

        <View style={styles.radiusHeader}>

          <View>

            <Text style={styles.title}>
              {translate(language, 'searchRadius')}
            </Text>

            <Text style={styles.subtitle}>
              {translate(language, 'chooseHowFarToSearch')}
            </Text>

          </View>

          <View style={styles.currentRadius}>

            <Ionicons
              name="location"
              size={14}
              color={COLORS.blue}
            />

            <Text style={styles.currentRadiusText}>
              {selectedRadius} km
            </Text>

          </View>

        </View>


        {/* =================================================
            RADIUS BUTTONS
        ================================================= */}

        <View style={styles.radiusContainer}>

          {[5, 10, 15, 20].map((radius) => {

            const isSelected =
              selectedRadius === radius;

            return (

              <Pressable
                delayPressIn={0}
                key={radius}
                onPress={() =>
                  changeRadius(radius)
                }
                style={[
                  styles.radiusButton,

                  isSelected &&
                    styles.radiusButtonSelected,
                ]}
              >

                <Ionicons
                  name="location-outline"
                  size={16}
                  color={
                    isSelected
                      ? COLORS.white
                      : COLORS.gray
                  }
                />

                <Text
                  style={[
                    styles.radiusButtonText,

                    isSelected &&
                      styles.radiusButtonTextSelected,
                  ]}
                >
                  {radius} km
                </Text>

              </Pressable>

            );

          })}

        </View>


        {/* =================================================
            RESULT
        ================================================= */}

        <View style={styles.resultHeader}>

          <View>

            <Text style={styles.resultTitle}>
              {translate(language, 'availableWorkers')}
            </Text>

            <Text style={styles.resultSubtitle}>
              {translate(language, 'professionalsWithin')
                .replace('{{count}}', visibleWorkers.length)
                .replace('{{radius}}', selectedRadius)}
            </Text>

          </View>

        </View>


        {/* =================================================
            WORKERS
        ================================================= */}

        {loading ? (

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.blue} />
            <Text style={styles.loadingText}>{translate(language, 'searchingForWorkers')}</Text>
          </View>

        ) : error ? (

          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="alert-circle-outline"
                size={42}
                color={COLORS.blue}
              />
            </View>

            <Text style={styles.emptyTitle}>
              {translate(language, 'errorLoadingWorkers')}
            </Text>

            <Text style={styles.emptyText}>
              {error}
            </Text>

            <Pressable
              delayPressIn={0}
              style={styles.expandButton}
              onPress={() => fetchWorkers(false)}
            >
              <Text style={styles.expandButtonText}>
                {translate(language, 'retry')}
              </Text>
            </Pressable>
          </View>

        ) : visibleWorkers.length > 0 ? (

          <>
            {/* INDIVIDUAL WORKERS SECTION */}
            {individualWorkers.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person-outline" size={20} color={COLORS.blue} />
                  <Text style={styles.sectionHeaderText}>{translate(language, 'individualWorkers')}</Text>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>{individualWorkers.length}</Text>
                  </View>
                </View>

                {individualWorkers.map((worker) => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    onViewWorker={onViewWorker}
                    serviceCategory={selectedService}
                    userCity={userCity}
                    language={language}
                  />
                ))}
              </>
            )}

            {/* ORGANIZATION WORKERS SECTION */}
            {organizationWorkers.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Ionicons name="business-outline" size={20} color={COLORS.blue} />
                  <Text style={styles.sectionHeaderText}>{translate(language, 'organizationWorkers')}</Text>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>{organizationWorkers.length}</Text>
                  </View>
                </View>

                {organizationWorkers.map((worker) => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    onViewWorker={onViewWorker}
                    serviceCategory={selectedService}
                    userCity={userCity}
                    language={language}
                  />
                ))}
              </>
            )}
          </>

        ) : (

          <View style={styles.empty}>

            <View style={styles.emptyIcon}>

              <Ionicons
                name="people-outline"
                size={42}
                color={COLORS.blue}
              />

            </View>

            <Text style={styles.emptyTitle}>
              {translate(language, 'noWorkersFound')}
            </Text>

            <Text style={styles.emptyText}>
              {translate(language, 'noWorkersWithinRadius')
                .replace('{{service}}', selectedService)
                .replace('{{radius}}', selectedRadius)}
            </Text>

            <Pressable
              style={styles.expandButton}
              onPress={() =>
                setSelectedRadius(20)
              }
            >

              <Text style={styles.expandButtonText}>
                {translate(language, 'increaseRadiusTo20km')}
              </Text>

            </Pressable>

          </View>

        )}

      </ScrollView>

    </SafeAreaView>

  );

}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.dark,
  },

  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 3,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },

  // SERVICE

  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 25,
  },

  serviceIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: COLORS.softBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },

  serviceText: {
    flex: 1,
    marginLeft: 12,
  },

  serviceLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.lightGray,
    letterSpacing: 1,
  },

  serviceName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.dark,
    marginTop: 3,
  },

  // RADIUS

  radiusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.dark,
  },

  subtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },

  currentRadius: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softBlue,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },

  currentRadiusText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 4,
  },

  radiusContainer: {
    flexDirection: 'row',
    marginTop: 14,
    marginBottom: 25,
  },

  radiusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    marginRight: 8,
  },

  radiusButtonSelected: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },

  radiusButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray,
    marginLeft: 5,
  },

  radiusButtonTextSelected: {
    color: COLORS.white,
  },

  // RESULT

  resultHeader: {
    marginBottom: 15,
  },

  resultTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.dark,
  },

  resultSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },

  // WORKER CARD

  workerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 19,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  workerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  workerPhoto: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },

  workerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  workerName: {
    fontSize: 16,
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
    marginTop: 6,
  },

  rating: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.dark,
    marginLeft: 4,
  },

  reviews: {
    fontSize: 11,
    color: COLORS.lightGray,
    marginLeft: 3,
  },

  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softBlue,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 9,
  },

  distanceText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.blue,
    marginLeft: 2,
  },

  // INFO

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoText: {
    fontSize: 11,
    color: COLORS.gray,
    marginLeft: 5,
  },

  available: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.green,
    marginRight: 5,
  },

  availableText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.green,
  },

  description: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.gray,
    marginTop: 12,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },

  // BUTTON

  viewButton: {
    height: 43,
    borderRadius: 12,
    backgroundColor: COLORS.softBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  viewButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.blue,
    marginHorizontal: 7,
  },

  // EMPTY

  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 85,
    height: 85,
    borderRadius: 43,
    backgroundColor: COLORS.softBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.dark,
  },

  emptyText: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 7,
  },

  expandButton: {
    marginTop: 18,
    backgroundColor: COLORS.blue,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
  },

  expandButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },

  // LOADING

  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },

  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '600',
  },

  // PRICING STYLES
  pricingLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 6,
  },

  pricingLoadingText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 8,
  },

  pricingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },

  pricingText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.blue,
    marginLeft: 6,
  },

  // SECTION HEADERS FOR INDIVIDUAL/ORGANIZATION
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  sectionHeaderText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.dark,
    marginLeft: 10,
    flex: 1,
  },

  sectionBadge: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 30,
    alignItems: 'center',
  },

  sectionBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },

});

// Organization styles added
const orgStyles = StyleSheet.create({
  orgPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    marginBottom: 2,
  },
  orgPhoneText: {
    fontSize: 12,
    color: '#49769F',
    marginLeft: 4,
    fontWeight: '600',
  },
  orgContactMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FD',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  orgContactText: {
    fontSize: 12,
    color: '#49769F',
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
});

// Merge with main styles
Object.assign(styles, orgStyles);
