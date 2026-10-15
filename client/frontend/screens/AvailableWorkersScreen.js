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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

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
  red: '#EF4444',
};

// =====================================================
// WORKER CARD COMPONENT
// =====================================================

function WorkerCard({ worker, onViewProfile, onRequestWorker, serviceCategory, userCity }) {
  const [pricing, setPricing] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(true);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token || !worker.id || !serviceCategory || !userCity) {
        console.log('[FAIL] Pricing fetch skipped:', { 
          hasToken: !!token, 
          hasWorkerId: !!worker.id, 
          serviceCategory, 
          userCity 
        });
        setLoadingPrice(false);
        return;
      }

      console.log('[PRICE] Fetching pricing:', { serviceCategory, userCity, workerId: worker.id });

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

      console.log('[API] Pricing API response status:', response.status);
      const data = await response.json();
      console.log('[DATA] Pricing API response data:', data);

      if (data.success) {
        setPricing(data.pricing);
        console.log('[OK] Pricing set:', data.pricing);
      } else {
        console.log('[FAIL] Pricing API error:', data.error);
      }
    } catch (error) {
      console.log('[FAIL] Error fetching pricing:', error);
    } finally {
      setLoadingPrice(false);
    }
  };

  return (
    <View style={styles.workerCard}>
      {/* TOP SECTION */}
      <View style={styles.workerTop}>
        <Image
          source={{
            uri: worker.photo || worker.profile_picture || worker.profile_photo || 
                 `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name || 'Worker')}&background=49769F&color=fff&size=200`,
          }}
          style={styles.workerPhoto}
        />

        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>{worker.name}</Text>

          {worker.type === 'organization' ? (
            <>
              <View style={styles.orgBadge}>
                <Ionicons name="business-outline" size={14} color={COLORS.blue} />
                <Text style={styles.orgBadgeText}>Organization</Text>
              </View>
              <Text style={styles.workerService}>
                {worker.service} Service Provider
              </Text>
              {worker.worker_count > 0 && (
                <Text style={styles.workerCount}>
                  {worker.worker_count} {worker.worker_count === 1 ? 'worker' : 'workers'}
                </Text>
              )}
            </>
          ) : (
            <>
              <Text style={styles.workerService}>
                {worker.services ? worker.services.join(', ') : 'Service Provider'}
              </Text>

              <View style={styles.ratingRow}>
                <Ionicons name="star" size={15} color={COLORS.yellow} />
                <Text style={styles.rating}>{worker.rating?.toFixed(1) || '0.0'}</Text>
                <Text style={styles.reviews}>({worker.total_jobs || 0})</Text>
              </View>
            </>
          )}
        </View>

        {/* DISTANCE BADGE (only for individual workers) */}
        {worker.type !== 'organization' && (
          <View style={styles.distanceBadge}>
            <Ionicons name="location-outline" size={13} color={COLORS.blue} />
            <Text style={styles.distanceText}>{worker.distance_km} km</Text>
          </View>
        )}
      </View>

      {/* INFO ROW */}
      <View style={styles.infoRow}>
        {worker.type !== 'organization' && (
          <View style={styles.infoItem}>
            <Ionicons name="briefcase-outline" size={16} color={COLORS.blue} />
            <Text style={styles.infoText}>
              {worker.experience} {worker.experience === 1 ? 'year' : 'years'} exp
            </Text>
          </View>
        )}

        {worker.is_available && (
          <View style={styles.available}>
            <View style={styles.greenDot} />
            <Text style={styles.availableText}>Available Now</Text>
          </View>
        )}
      </View>

      {/* PRICING SECTION */}
      {worker.type !== 'organization' && (
        <>
          {loadingPrice ? (
            <View style={styles.pricingRow}>
              <ActivityIndicator size="small" color={COLORS.blue} />
              <Text style={styles.pricingLoading}>Calculating price...</Text>
            </View>
          ) : pricing ? (
        <View style={styles.pricingCard}>
          <View style={styles.pricingHeader}>
            <Ionicons name="receipt-outline" size={16} color={COLORS.blue} />
            <Text style={styles.pricingTitle}>Total Price</Text>
          </View>
          <View style={styles.pricingDetails}>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Base</Text>
              <Text style={styles.pricingValue}>Rs. {pricing.base_price}</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Visit</Text>
              <Text style={styles.pricingValue}>Rs. {pricing.worker_visit_charge}</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Platform</Text>
              <Text style={styles.pricingValue}>Rs. {pricing.platform_fee}</Text>
            </View>
            <View style={styles.pricingDivider} />
            <View style={styles.pricingRow}>
              <Text style={styles.pricingTotalLabel}>Total</Text>
              <Text style={styles.pricingTotalValue}>Rs. {pricing.total_price}</Text>
            </View>
          </View>
        </View>
          ) : (
            worker.hourly_rate > 0 && (
              <View style={styles.rateRow}>
                <Ionicons name="cash-outline" size={16} color={COLORS.blue} />
                <Text style={styles.rateText}>Rs. {worker.hourly_rate}/visit</Text>
              </View>
            )
          )}
        </>
      )}

      {/* DIVIDER */}
      <View style={styles.divider} />

      {/* ACTION BUTTONS */}
      <View style={styles.buttonRow}>
        <Pressable
          style={({ pressed }) => [
            styles.viewButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => onViewProfile(worker)}
        >
          <Ionicons name="person-outline" size={18} color={COLORS.blue} />
          <Text style={styles.viewButtonText}>View Profile</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.requestButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => onRequestWorker(worker)}
        >
          <Ionicons name="add-circle-outline" size={18} color={COLORS.white} />
          <Text style={styles.requestButtonText}>Request Worker</Text>
        </Pressable>
      </View>
    </View>
  );
}

// =====================================================
// DISTANCE GROUP COMPONENT
// =====================================================

function DistanceGroup({ title, workers, onViewProfile, onRequestWorker, serviceCategory, userCity }) {
  if (!workers || workers.length === 0) {
    return null;
  }

  return (
    <View style={styles.distanceGroup}>
      <View style={styles.groupHeader}>
        <View style={styles.groupHeaderLeft}>
          <Ionicons name="location" size={18} color={COLORS.blue} />
          <Text style={styles.groupTitle}>{title}</Text>
        </View>
        <View style={styles.groupBadge}>
          <Text style={styles.groupBadgeText}>{workers.length}</Text>
        </View>
      </View>

      {workers.map((worker, index) => (
        <WorkerCard
          key={worker.id || index}
          worker={worker}
          onViewProfile={onViewProfile}
          onRequestWorker={onRequestWorker}
          serviceCategory={serviceCategory}
          userCity={userCity}
        />
      ))}
    </View>
  );
}

// =====================================================
// MAIN SCREEN
// =====================================================

export default function AvailableWorkersScreen({ route, navigation }) {
  const {
    service_category,
    work_location,
    search_radius = 20,
    number_of_workers = 1,
  } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState([]);
  const [groupedWorkers, setGroupedWorkers] = useState({});
  const [totalFound, setTotalFound] = useState(0);
  const [error, setError] = useState(null);

  // Extract city from work_location address
  const extractCity = (address) => {
    if (!address) return 'Pune'; // Default fallback
    
    // Common Indian cities
    const cities = [
      'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
      'Pune', 'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Kanpur',
      'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Nashik'
    ];
    
    // Check if any city name is in the address
    for (const city of cities) {
      if (address.toLowerCase().includes(city.toLowerCase())) {
        return city;
      }
    }
    
    // If no match, try to extract from comma-separated address
    const parts = address.split(',').map(p => p.trim());
    // Usually city is second or third from end
    if (parts.length >= 2) {
      const possibleCity = parts[parts.length - 2] || parts[parts.length - 3];
      return possibleCity || 'Pune';
    }
    
    return 'Pune'; // Final fallback
  };

  const userCity = extractCity(work_location?.address);
  console.log('[LOC] Extracted city from location:', { 
    address: work_location?.address, 
    extractedCity: userCity 
  });

  // ===================================================
  // FETCH WORKERS OR ORGANIZATIONS
  // ===================================================

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get auth token
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'Please login to continue');
        navigation.goBack();
        return;
      }

      // Validate parameters
      if (!service_category || !work_location) {
        Alert.alert('Error', 'Missing search parameters');
        navigation.goBack();
        return;
      }

      // Check if service is organization type
      const organizationTypes = ['Construction', 'Plumber', 'Electrician'];
      const isOrganizationType = organizationTypes.some(
        type => type.toLowerCase() === service_category.toLowerCase()
      );

      if (isOrganizationType) {
        // Fetch organizations for this service type
        console.log('[ORG] Fetching organizations for:', service_category);
        console.log('[LINK] API URL:', `${API_BASE_URL}/api/v1/org/list/?service_type=${encodeURIComponent(service_category)}`);
        
        const response = await fetch(
          `${API_BASE_URL}/api/v1/org/list/?service_type=${encodeURIComponent(service_category)}`,
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
            type: 'organization',
            service: org.service_type,
            services: [org.service_type],
            rating: 0, // Organizations don't have ratings yet
            total_jobs: 0,
            experience: 0,
            is_available: true,
            distance_km: 0, // Organizations don't have distance
            photo: null,
            phone: org.company_phone,
            email: org.company_email,
            address: org.address,
            city: org.city,
            state: org.state,
            description: org.description,
            worker_count: org.worker_count || 0,
            org_id: org.org_id,
          }));

          console.log('[REFRESH] Transformed organizations:', transformedOrgs);
          setWorkers(transformedOrgs);
          setTotalFound(transformedOrgs.length);
          console.log('[OK] State updated with', transformedOrgs.length, 'organizations');
        } else {
          console.error('[FAIL] Organization API Error:', data.error || 'Unknown error');
          setError(data.error || 'Failed to fetch organizations');
          Alert.alert('Error', data.error || 'Failed to fetch organizations');
        }
      } else {
        // Fetch individual workers (existing logic)
        console.log('[USER] Fetching individual workers for:', service_category);
        
        const response = await fetch(`${API_BASE_URL}/api/v1/users/workers/search/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_category,
            work_latitude: work_location.latitude,
            work_longitude: work_location.longitude,
            search_radius,
            number_of_workers,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setWorkers(data.workers || []);
          setGroupedWorkers(data.grouped_by_distance || {});
          setTotalFound(data.total_found || 0);
        } else {
          setError(data.error || 'Failed to fetch workers');
          Alert.alert('Error', data.error || 'Failed to fetch workers');
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Network error. Please check your connection.');
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  // ===================================================
  // HANDLERS
  // ===================================================

  const handleViewProfile = (worker) => {
    console.log('View profile:', worker.name);
    // Navigate to worker profile screen
    navigation.navigate('Workerprofilescreen', {
      workerId: worker.id,
      worker: worker,
    });
  };

  const handleRequestWorker = (worker) => {
    console.log('Request worker:', worker.name);
    // Navigate to booking screen
    navigation.navigate('Bookworkerscreen', {
      worker: worker,
      service_category,
      work_location,
      number_of_workers,
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleRefresh = () => {
    fetchWorkers();
  };

  // ===================================================
  // RENDER LOADING
  // ===================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={23} color={COLORS.dark} />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Searching Workers</Text>
            <Text style={styles.headerSubtitle}>Please wait...</Text>
          </View>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.blue} />
          <Text style={styles.loadingText}>Finding available workers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ===================================================
  // RENDER ERROR
  // ===================================================

  if (error && totalFound === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={23} color={COLORS.dark} />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Search Error</Text>
            <Text style={styles.headerSubtitle}>Something went wrong</Text>
          </View>
        </View>

        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.red} />
          </View>
          <Text style={styles.errorTitle}>Search Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={handleRefresh}>
            <Ionicons name="refresh" size={18} color={COLORS.white} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ===================================================
  // RENDER MAIN CONTENT
  // ===================================================

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={23} color={COLORS.dark} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Available Workers</Text>
          <Text style={styles.headerSubtitle}>
            {totalFound} {totalFound === 1 ? 'professional' : 'professionals'} found
          </Text>
        </View>
        <Pressable style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={20} color={COLORS.blue} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* SERVICE INFO */}
        <View style={styles.serviceCard}>
          <View style={styles.serviceIcon}>
            <Ionicons name="construct-outline" size={23} color={COLORS.blue} />
          </View>
          <View style={styles.serviceText}>
            <Text style={styles.serviceLabel}>LOOKING FOR</Text>
            <Text style={styles.serviceName}>{service_category}</Text>
          </View>
          <View style={styles.radiusBadge}>
            <Ionicons name="locate" size={14} color={COLORS.blue} />
            <Text style={styles.radiusBadgeText}>{search_radius} km</Text>
          </View>
        </View>

        {/* WORK LOCATION INFO */}
        <View style={styles.locationCard}>
          <Ionicons name="location" size={18} color={COLORS.blue} />
          <View style={styles.locationText}>
            <Text style={styles.locationLabel}>WORK LOCATION</Text>
            <Text style={styles.locationAddress} numberOfLines={1}>
              {work_location?.address || 'Selected Location'}
            </Text>
          </View>
        </View>

        {/* RESULTS */}
        {totalFound > 0 ? (
          <>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Workers Near You</Text>
              <Text style={styles.resultSubtitle}>
                Sorted by distance from work location
              </Text>
            </View>

            {/* DISTANCE GROUPS */}
            <DistanceGroup
              title="Very Close (0-5 km)"
              workers={groupedWorkers['0-5 km']}
              onViewProfile={handleViewProfile}
              onRequestWorker={handleRequestWorker}
              serviceCategory={service_category}
              userCity={userCity}
            />
            <DistanceGroup
              title="Close (5-10 km)"
              workers={groupedWorkers['5-10 km']}
              onViewProfile={handleViewProfile}
              onRequestWorker={handleRequestWorker}
              serviceCategory={service_category}
              userCity={userCity}
            />
            <DistanceGroup
              title="Moderate Distance (10-15 km)"
              workers={groupedWorkers['10-15 km']}
              onViewProfile={handleViewProfile}
              onRequestWorker={handleRequestWorker}
              serviceCategory={service_category}
              userCity={userCity}
            />
            <DistanceGroup
              title="Far (15-20 km)"
              workers={groupedWorkers['15-20 km']}
              onViewProfile={handleViewProfile}
              onRequestWorker={handleRequestWorker}
              serviceCategory={service_category}
              userCity={userCity}
            />
          </>
        ) : (
          /* NO RESULTS */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="people-outline" size={48} color={COLORS.blue} />
            </View>
            <Text style={styles.emptyTitle}>No Workers Found</Text>
            <Text style={styles.emptyText}>
              No available workers found within {search_radius} km for {service_category}.
            </Text>
            <Text style={styles.emptyHint}>
              Try increasing the search radius or checking back later.
            </Text>
            <Pressable style={styles.backToSearchButton} onPress={handleBack}>
              <Ionicons name="search" size={18} color={COLORS.white} />
              <Text style={styles.backToSearchButtonText}>Modify Search</Text>
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

  // HEADER
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

  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.softBlue,
    justifyContent: 'center',
    alignItems: 'center',
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

  // LOADING
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  loadingText: {
    marginTop: 20,
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
  },

  // ERROR
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  errorIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.dark,
    marginTop: 10,
  },

  errorText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },

  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.blue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },

  retryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },

  // SCROLL CONTENT
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },

  // SERVICE CARD
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
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

  radiusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softBlue,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },

  radiusBadgeText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 4,
  },

  // LOCATION CARD
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 25,
  },

  locationText: {
    flex: 1,
    marginLeft: 10,
  },

  locationLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.lightGray,
    letterSpacing: 1,
  },

  locationAddress: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 3,
  },

  // RESULT HEADER
  resultHeader: {
    marginBottom: 18,
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

  // DISTANCE GROUP
  distanceGroup: {
    marginBottom: 25,
  },

  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  groupTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.dark,
    marginLeft: 8,
  },

  groupBadge: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  groupBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
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
    shadowOffset: { width: 0, height: 2 },
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

  // INFO ROW
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

  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  rateText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.blue,
    marginLeft: 6,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },

  // BUTTONS
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },

  viewButton: {
    flex: 1,
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
    marginLeft: 7,
  },

  requestButton: {
    flex: 1,
    height: 43,
    borderRadius: 12,
    backgroundColor: COLORS.blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  requestButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.white,
    marginLeft: 7,
  },

  // EMPTY STATE
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.softBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.dark,
  },

  emptyText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },

  emptyHint: {
    fontSize: 13,
    color: COLORS.lightGray,
    textAlign: 'center',
    marginTop: 8,
  },

  backToSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.blue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },

  backToSearchButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },

  // PRICING STYLES
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 6,
  },

  pricingLoading: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 8,
  },

  pricingCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },

  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  pricingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.blue,
    marginLeft: 6,
  },

  pricingDetails: {
    gap: 6,
  },

  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  pricingLabel: {
    fontSize: 11,
    color: COLORS.gray,
  },

  pricingValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark,
  },

  pricingDivider: {
    height: 1,
    backgroundColor: '#BFDBFE',
    marginVertical: 4,
  },

  pricingTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.dark,
  },

  pricingTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.blue,
  },
  
  // Organization styles
  orgBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softBlue,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  
  orgBadgeText: {
    fontSize: 11,
    color: COLORS.blue,
    fontWeight: '600',
    marginLeft: 4,
  },
  
  workerCount: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
});
