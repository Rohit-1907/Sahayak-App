import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { translate } from '../utils/translations';
import { useTextToSpeech } from '../utils/useTextToSpeech';
import VoiceGuidanceButton from '../components/VoiceGuidanceButton';
import { API_ENDPOINTS } from '../config/api';

const PURPLE = '#49769F';
const BG = '#F8FAFC';
const TEXT = '#111827';
const MUTED = '#6B7280';
const GREEN = '#24935D';
const RED = '#D94C4C';
const ORANGE = '#F59E0B';
const BORDER = '#E0E7ED';

const getLanguageCode = (language) => {
  if (language === 'मराठी') return 'mr';
  if (language === 'हिंदी') return 'hi';
  return 'en';
};

const getRequestText = (request, language, field) => {
  const translations = request.translations || {};
  const code = getLanguageCode(language);
  return translations[code]?.[field] || request[field] || '';
};

let jobDetailsIntroSpoken = false;

export default function JobDetailsScreen({ go, requestId, language = "English" }) {
  const { speak: speakJobDetails, stop: stopJobDetails } = useTextToSpeech(language);

  useEffect(() => {
    if (jobDetailsIntroSpoken) {
      return;
    }
    jobDetailsIntroSpoken = true;
    const intro = translate('jobDetailsAutoIntro', language);
    speakJobDetails(intro);
    return () => {
      stopJobDetails();
    };
  }, [language, speakJobDetails, stopJobDetails]);

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  console.log('[VIEW] JobDetailsScreen MOUNTED');
  console.log('   Request ID:', requestId);

  useEffect(() => {
    let isMounted = true;
    const loadCachedAndFetch = async () => {
      try {
        const cacheKey = `@cache_job_detail_${requestId}`;
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached && isMounted) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.id) {
            setRequest(parsed);
            setLoading(false);
          }
        }
      } catch (e) {
        // Fallback
      }
      if (isMounted) {
        fetchJobDetails(true);
      }
    };

    loadCachedAndFetch();
    return () => {
      isMounted = false;
    };
  }, [requestId]);

  const fetchJobDetails = async (silent = false) => {
    try {
      if (!silent) {
        if (!request) {
          setLoading(true);
        }
      }
      setError(null);

      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        setError('Please login to view details');
        setLoading(false);
        return;
      }

      const response = await fetch(
        API_ENDPOINTS.JOB_WORK_REQUEST_DETAIL(requestId),
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.work_request) {
        setRequest(data.work_request);
        AsyncStorage.setItem(`@cache_job_detail_${requestId}`, JSON.stringify(data.work_request)).catch(() => {});
      } else if (!request) {
        setError(data.error || 'Failed to load job details');
      }
    } catch (err) {
      console.error('[FAIL] Error fetching job details:', err);
      if (!request) {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleArrivedAtLocation = async () => {
    Alert.alert(
      'Confirm Arrival',
      'Have you arrived at the job location? This will generate a PIN for the client.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, I Arrived',
          onPress: () => generateOTP(),
        },
      ]
    );
  };

  const handleNavigateToJob = async () => {
    if (!request) {
      Alert.alert('Error', 'Job details not available');
      return;
    }

    // Job destination coordinates
    const jobLat = request.latitude || request.work_latitude;
    const jobLon = request.longitude || request.work_longitude;

    if (!jobLat || !jobLon) {
      Alert.alert('Error', 'Job location not available. Cannot navigate.');
      return;
    }

    try {
      // Request permission and get device's current GPS location as worker position
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for navigation.');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const workerLocation = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };

      const jobLocation = {
        latitude: parseFloat(jobLat),
        longitude: parseFloat(jobLon),
      };

      console.log('[MAP] Opening in-app map:', { workerLocation, jobLocation });

      if (go) {
        go('navigationMap', {
          workerLocation,
          jobLocation,
          clientName: request.client_name || 'Client',
          serviceType: request.service_category || 'Service',
        });
      }
    } catch (error) {
      console.error('[FAIL] Error getting location for navigation:', error);
      Alert.alert('Error', 'Could not get your current location. Please enable GPS and try again.');
    }
  };

  const generateOTP = async () => {
    try {
      setActionLoading(true);

      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'Please login to continue');
        return;
      }

      console.log('[REQ] Generating OTP for job:', requestId);

      const response = await fetch(
        API_ENDPOINTS.JOB_GENERATE_OTP(requestId),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      console.log('[RES] OTP generation response:', data);

      if (response.ok && data.success) {
        // Navigate to OTP entry screen
        go('otpEntry', { 
          requestId,
          clientName: request.client_name 
        });
      } else {
        Alert.alert('Error', data.error || 'Failed to generate OTP');
      }
    } catch (err) {
      console.error('[FAIL] Error generating OTP:', err);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'REQUESTED':
        return ORANGE;
      case 'SCHEDULED':
        return GREEN;
      case 'IN_PROGRESS':
        return PURPLE;
      case 'COMPLETED':
        return GREEN;
      case 'REJECTED':
        return RED;
      default:
        return MUTED;
    }
  };

  if (loading && !request) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={BG} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PURPLE} />
          <Text style={styles.loadingText}>Loading job details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !request) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={BG} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => go('requests')}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={TEXT}
            />
          </TouchableOpacity>
<Text style={styles.headerTitle}>{translate('jobDetails', language)}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color={MUTED}
          />
          <Text style={styles.errorTitle}>{translate('error', language)}</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchJobDetails}
          >
            <Text style={styles.retryButtonText}>{translate('retry', language)}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(request.status);
  const canMarkArrived = request.status === 'SCHEDULED';

  const translatedTitle = getRequestText(request, language, 'title');
  const translatedDescription = getRequestText(request, language, 'description');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => go('requests')}
          delayPressIn={0}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={TEXT}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{translate('jobDetails', language)}</Text>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => fetchJobDetails(false)}
          delayPressIn={0}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={22}
            color={PURPLE}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.voiceGuidanceWrap}>
        <VoiceGuidanceButton
          labeled
          text={translate('jobDetailsVoiceGuidance', language)}
          language={language}
          title={translate('voiceAssistance', language)}
          subtitle={translate('jobDetailsHearHowToUse', language)}
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* Status Badge */}
        <View style={[styles.statusContainer, { backgroundColor: statusColor + '20' }]}>
          <MaterialCommunityIcons
            name="checkbox-marked-circle"
            size={24}
            color={statusColor}
          />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {request.status}
          </Text>
        </View>

        {/* Service Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{translate('service', language)}</Text>
          <View style={styles.serviceRow}>
            <MaterialCommunityIcons name="briefcase" size={24} color={PURPLE} />
            <Text style={styles.serviceText}>
              {request.service_category}{translatedTitle ? ` - ${translatedTitle}` : ''}
            </Text>
          </View>
        </View>

        {/* Client Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{translate('clientInformation', language)}</Text>
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account" size={20} color={MUTED} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{translate('clientName', language)}</Text>
              <Text style={styles.infoValue}>{request.client_name || 'N/A'}</Text>
            </View>
          </View>

          {request.client_phone && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="phone" size={20} color={MUTED} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{request.client_phone}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Schedule Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{translate('schedule', language)}</Text>
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={20} color={PURPLE} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{translate('date', language)}</Text>
              <Text style={styles.infoValue}>{formatDate(request.required_date)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={PURPLE} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{translate('time', language)}</Text>
              <Text style={styles.infoValue}>{formatTime(request.required_time)}</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        {request.work_address && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{translate('workLocation', language)}</Text>
            <View style={styles.locationContainer}>
              <MaterialCommunityIcons name="map-marker" size={24} color={RED} />
              <Text style={styles.locationText}>{request.work_address}</Text>
            </View>
            
            {/* Navigate Button */}
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={handleNavigateToJob}
              delayPressIn={0}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="navigation" size={20} color="#FFFFFF" />
              <Text style={styles.navigateButtonText}>{translate('navigateToJob', language)}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Description */}
        {translatedDescription && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{translate('description', language)}</Text>
            <Text style={styles.descriptionText}>{translatedDescription}</Text>
          </View>
        )}

        {/* Budget */}
        {request.estimated_budget && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{translate('estimatedBudget', language)}</Text>
            <View style={styles.budgetContainer}>
              <MaterialCommunityIcons name="cash" size={24} color={GREEN} />
              <Text style={styles.budgetText}>
                Rs. {parseFloat(request.estimated_budget).toFixed(0)}
              </Text>
            </View>
          </View>
        )}

        {/* Action Button */}
        {canMarkArrived && (
          <TouchableOpacity
            style={[styles.arrivedButton, actionLoading && styles.arrivedButtonDisabled]}
            onPress={handleArrivedAtLocation}
            disabled={actionLoading}
            delayPressIn={0}
            activeOpacity={0.7}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="map-marker-check"
                  size={24}
                  color="#FFFFFF"
                />
<Text style={styles.arrivedButtonText}>{translate('iArrivedAtJobLocation', language)}</Text>
              </>
            )}
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  voiceGuidanceWrap: {
    marginHorizontal: 16,
    marginTop: 12,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BG,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
  },

  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BG,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: MUTED,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
    marginTop: 16,
  },

  errorText: {
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    marginTop: 8,
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: PURPLE,
    borderRadius: 12,
  },

  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },

  statusText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },

  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  serviceText: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
    marginLeft: 12,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  infoContent: {
    marginLeft: 12,
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT,
  },

  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  locationText: {
    flex: 1,
    fontSize: 14,
    color: TEXT,
    marginLeft: 12,
    lineHeight: 20,
  },

  descriptionText: {
    fontSize: 14,
    color: TEXT,
    lineHeight: 21,
  },

  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  budgetText: {
    fontSize: 24,
    fontWeight: '700',
    color: GREEN,
    marginLeft: 12,
  },

  arrivedButton: {
    backgroundColor: PURPLE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 24,
    elevation: 3,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  arrivedButtonDisabled: {
    opacity: 0.6,
  },

  arrivedButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 10,
  },

  navigateButton: {
    backgroundColor: PURPLE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },

  navigateButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
