import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { API_ENDPOINTS } from '../../config/api';
import { translate } from '../../utils/translations';
import { useTextToSpeech } from '../../utils/useTextToSpeech';
import VoiceGuidanceButton from '../../components/VoiceGuidanceButton';

const PURPLE = '#1F6CC5';  // Blue theme color
const LIGHT_PURPLE = '#EEF4F8';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E0E7ED';
const GREEN = '#24935D';
const ORANGE = '#1F6CC5';  // Changed to blue
const RED = '#D94C4C';
const BLUE = '#1F6CC5';  // Primary blue
const BG = '#F8FAFC';

const getLanguageCode = (language) => {
  if (language === 'मराठी') return 'mr';
  if (language === 'हिंदी') return 'hi';
  return 'en';
};

const getOrgWorkDescription = (work, language) => {
  const code = getLanguageCode(language);
  return work?.translations?.[code]?.work_description
    || work?.work_description
    || '';
};

let orgWorkerJobDetailsIntroSpoken = false;

export default function OrgWorkerJobDetails({ route, go, onBack, language = "English" }) {
  const { workId } = route?.params || {};
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const { speak: speakOrgWorkerJobDetails, stop: stopOrgWorkerJobDetails } = useTextToSpeech(language);

  useEffect(() => {
    if (orgWorkerJobDetailsIntroSpoken) {
      return;
    }
    orgWorkerJobDetailsIntroSpoken = true;
    const intro = translate('orgWorkerJobDetailsAutoIntro', language);
    speakOrgWorkerJobDetails(intro);
    return () => {
      stopOrgWorkerJobDetails();
    };
  }, [language, speakOrgWorkerJobDetails, stopOrgWorkerJobDetails]);

  useEffect(() => {
    if (workId && !work) {
      fetchWorkDetails();
    }
    
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [workId]);

  const fetchWorkDetails = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const tokenStr = await AsyncStorage.getItem('org_worker_token');
      const workerData = await AsyncStorage.getItem('org_worker_data');
      
      console.log('[TASK] Fetching work details for ID:', workId);
      
      if (!tokenStr || !workerData) {
        console.log('[FAIL] Missing auth data');
        Alert.alert(translate('error', language), translate('authenticationRequired', language));
        setLoading(false);
        return;
      }

      const token = JSON.parse(tokenStr);
      const worker = JSON.parse(workerData);
      const workerId = token.worker_id || worker.id;
      
      // Try all three endpoints to find the work (it could be assigned, in-progress, or completed)
      const endpoints = [
        'assigned-work',
        'in-progress',
        'completed'
      ];
      
      let foundWork = null;
      
      for (const endpoint of endpoints) {
        const apiUrl = endpoint === 'assigned-work'
          ? API_ENDPOINTS.ORG_WORKER_ASSIGNED(workerId)
          : endpoint === 'in-progress'
          ? API_ENDPOINTS.ORG_WORKER_IN_PROGRESS(workerId)
          : API_ENDPOINTS.ORG_WORKER_COMPLETED(workerId);
        
        console.log(`[SEARCH] Checking endpoint: ${endpoint}`);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
            'X-Worker-ID': workerId.toString(),
          },
        });
        
        const data = await response.json();
        
        if (data.success && data.work && Array.isArray(data.work)) {
          const workItem = data.work.find(w => w.id === workId);
          
          if (workItem) {
            console.log(`[OK] Found work in ${endpoint}:`, workItem);
            foundWork = workItem;
            break;
          }
        }
      }
      
      if (foundWork) {
        // Transform API response to match expected format
        const transformedWork = {
          id: foundWork.id,
          work_type: foundWork.title || translate('workAssignment', language),
          client_name: foundWork.client || translate('notProvided', language),
          client_contact: foundWork.contact || null,
          work_description: foundWork.description || translate('noDescriptionShort', language),
          translations: foundWork.translations || null,
          status: foundWork.status || 'assigned',
          assigned_at: foundWork.assigned_at,
          started_at: foundWork.started_at || null,
          completed_at: foundWork.completedDate || null,
          progress: foundWork.progress,
          rating: foundWork.rating,
          admin_name: foundWork.assigned_by,
          location: foundWork.location || null,
          // Add coordinate fields for navigation
          latitude: foundWork.latitude || foundWork.work_latitude || null,
          longitude: foundWork.longitude || foundWork.work_longitude || null,
        };
        console.log('[OK] Work loaded successfully:', transformedWork);
        setWork(transformedWork);
      } else {
        console.log('[FAIL] Work item not found in any endpoint');
        Alert.alert(translate('error', language), translate('workAssignmentNotFound', language));
      }
    } catch (error) {
      console.log('[FAIL] Error:', error.toString());
      Alert.alert(translate('error', language), translate('failedToLoadWorkDetails', language));
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async () => {
    Alert.alert(
      translate('startWorkTitle', language),
      translate('startWorkConfirm', language),
      [
        { text: translate('cancel', language), style: 'cancel' },
        {
          text: translate('start', language),
          onPress: async () => {
            try {
              setProcessing(true);
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              const tokenStr = await AsyncStorage.getItem('org_worker_token');
              const token = JSON.parse(tokenStr);
              const workerData = JSON.parse(await AsyncStorage.getItem('org_worker_data'));
              const workerId = token.worker_id || workerData.id;

              const response = await fetch(
                API_ENDPOINTS.ORG_WORK_ASSIGNMENT_START(work.id),
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Worker-ID': workerId.toString(),
                  },
                }
              );

              const data = await response.json();

              if (data.success) {
                Alert.alert(translate('success', language), translate('workStartedSuccess', language), [
                  { text: translate('ok', language), onPress: () => fetchWorkDetails() }
                ]);
              } else {
                Alert.alert(translate('error', language), data.error || translate('failedToStartWork', language));
              }
            } catch (error) {
              console.log('Error starting work:', error);
              Alert.alert(translate('error', language), translate('failedToStartWork', language));
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleCompleteWork = async () => {
    Alert.alert(
      translate('completeWorkTitle', language),
      translate('completeWorkConfirm', language),
      [
        { text: translate('cancel', language), style: 'cancel' },
        {
          text: translate('completeButton', language),
          onPress: async () => {
            try {
              setProcessing(true);
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              const tokenStr = await AsyncStorage.getItem('org_worker_token');
              const token = JSON.parse(tokenStr);
              const workerData = JSON.parse(await AsyncStorage.getItem('org_worker_data'));
              const workerId = token.worker_id || workerData.id;

              const response = await fetch(
                API_ENDPOINTS.ORG_WORK_ASSIGNMENT_COMPLETE(work.id),
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Worker-ID': workerId.toString(),
                  },
                }
              );

              const data = await response.json();

              if (data.success) {
                Alert.alert(translate('success', language), translate('workCompletedSuccess', language), [
                  { text: translate('ok', language), onPress: () => (onBack ? onBack() : go('home')) }
                ]);
              } else {
                Alert.alert(translate('error', language), data.error || translate('failedToCompleteWork', language));
              }
            } catch (error) {
              console.log('Error completing work:', error);
              Alert.alert(translate('error', language), translate('failedToCompleteWork', language));
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleCallClient = () => {
    if (!work?.client_contact) {
      Alert.alert(translate('noContact', language), translate('clientContactUnavailable', language));
      return;
    }

    const phoneUrl = `tel:${work.client_contact}`;
    Linking.openURL(phoneUrl).catch(() => {
      Alert.alert(translate('error', language), translate('couldNotMakeCall', language));
    });
  };

  const handleNavigateToLocation = async () => {
    console.log('[MAP] Navigate button clicked in OrgWorkerJobDetails');
    console.log('[DATA] Work data:', work);
    
    if (!work?.location) {
      Alert.alert(translate('noLocationTitle', language), translate('locationUnavailableBody', language));
      return;
    }

    try {
      // Try to get coordinates from the work object
      let jobLat = work.latitude || work.work_latitude;
      let jobLng = work.longitude || work.work_longitude;

      // If no coordinates, try to geocode the location address
      if (!jobLat || !jobLng) {
        console.log('[SEARCH] No coordinates found, attempting to geocode address:', work.location);
        
        // Use a geocoding service to get coordinates from address
        // For now, show error - in production you'd call a geocoding API
        Alert.alert(
          translate('coordsUnavailableTitle', language),
          translate('coordsUnavailableBody', language) + ' ' + work.location,
          [
            { text: translate('ok', language) }
          ]
        );
        return;
      }

      // Get worker's current device location using expo-location
            console.log('[LOC] Requesting location permissions...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(translate('permissionDeniedTitle', language), translate('locationPermissionBody', language));
        return;
      }

      console.log('[LOC] Getting current location...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const workerLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };

      const jobLocation = {
        latitude: parseFloat(jobLat),
        longitude: parseFloat(jobLng)
      };

      console.log('[LOC] Worker location:', workerLocation);
      console.log('[LOC] Job location:', jobLocation);

      console.log('[NAV] Navigating to internal map with:', {
        workerLocation,
        jobLocation,
        clientName: work.client_name,
        serviceType: work.work_type
      });

      go('navigationMap', {
        workerLocation,
        jobLocation,
        clientName: work.client_name || 'Client',
        serviceType: work.work_type || 'Work',
        workId: work.id  // Pass workId so we can navigate back
      });

    } catch (error) {
      console.error('[FAIL] Error in handleNavigateToLocation:', error);
      Alert.alert(translate('error', language), translate('failedToGetLocation', language));
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'assigned':
        return ORANGE;
      case 'in_progress':
        return BLUE;
      case 'completed':
        return GREEN;
      default:
        return MUTED;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'assigned':
        return 'clock-outline';
      case 'in_progress':
        return 'progress-clock';
      case 'completed':
        return 'check-circle';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return translate('notSpecified', language);
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PURPLE} />
        <Text style={styles.loadingText}>{translate('loadingWorkDetails', language)}</Text>
      </View>
    );
  }

  if (!work) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color={MUTED} />
        <Text style={styles.errorText}>{translate('workAssignmentNotFound', language)}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (onBack ? onBack() : go('home'))}
        >
          <Text style={styles.backButtonText}>{translate('goBack', language)}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColor = getStatusColor(work.status);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.headerGradient, { backgroundColor: statusColor }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => (onBack ? onBack() : go('home'))}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{translate('workAssignment', language)}</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <View style={styles.voiceGuidanceWrap}>
        <VoiceGuidanceButton
          labeled
          text={translate('orgWorkerJobDetailsVoiceGuidance', language)}
          language={language}
          title={translate('voiceAssistance', language)}
          subtitle={translate('orgWorkerJobDetailsHearHowToUse', language)}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          {/* Status Hero Card */}
          <View style={[styles.heroCard, { backgroundColor: statusColor }]}>
            <View style={styles.heroIcon}>
              <MaterialCommunityIcons
                name={getStatusIcon(work.status)}
                size={48}
                color="#fff"
              />
            </View>
            <Text style={styles.heroStatus}>
              {work.status?.replace('_', ' ').toUpperCase() || 'ASSIGNED'}
            </Text>
            {work.progress !== undefined && work.status === 'in_progress' && (
              <Text style={styles.heroSubtext}>{work.progress}{translate('progressCompleteSuffix', language)}</Text>
            )}
          </View>

          {/* Work Type Banner */}
          <View style={styles.typeBanner}>
            <MaterialCommunityIcons name="hammer-wrench" size={28} color={PURPLE} />
            <Text style={styles.typeBannerText}>{work.work_type || translate('workAssignment', language)}</Text>
          </View>

          {/* Client Info Card */}
          <View style={styles.glassCard}>
            <View style={styles.cardIconHeader}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="account" size={24} color={PURPLE} />
              </View>
              <Text style={styles.cardHeaderTitle}>{translate('clientInformation', language)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIconBox}>
                <MaterialCommunityIcons name="account-outline" size={18} color={PURPLE} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{translate('clientNameLabel', language)}</Text>
                <Text style={styles.detailValue}>{work.client_name || translate('notProvided', language)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {work.client_contact && (
              <TouchableOpacity 
                style={styles.detailRow} 
                onPress={handleCallClient}
                activeOpacity={0.7}
              >
                <View style={[styles.detailIconBox, { backgroundColor: '#E8F5E9' }]}>
                  <MaterialCommunityIcons name="phone" size={18} color={GREEN} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>{translate('contactNumber', language)}</Text>
                  <Text style={[styles.detailValue, { color: GREEN, fontWeight: '700' }]}>
                    {work.client_contact}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={GREEN} />
              </TouchableOpacity>
            )}
          </View>

          {/* Work Description Card */}
          <View style={styles.glassCard}>
            <View style={styles.cardIconHeader}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="text-box" size={24} color={PURPLE} />
              </View>
              <Text style={styles.cardHeaderTitle}>{translate('workDescriptionTitle', language)}</Text>
            </View>
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>
                {getOrgWorkDescription(work, language) || translate('noDescriptionProvided', language)}
              </Text>
            </View>

            {work.location && (
              <>
                <View style={styles.divider} />
                <View style={styles.locationRow}>
                  <View style={[styles.detailIconBox, { backgroundColor: '#FFF3E0' }]}>
                    <MaterialCommunityIcons name="map-marker" size={18} color={ORANGE} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>{translate('workLocation', language)}</Text>
                    <Text style={[styles.detailValue, { color: ORANGE }]}>
                      {work.location}
                    </Text>
                  </View>
                </View>
                
                {/* Navigate Button */}
                <TouchableOpacity
                  style={styles.navigateButton}
                  onPress={handleNavigateToLocation}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="navigation" size={20} color="#fff" />
                  <Text style={styles.navigateButtonText}>{translate('navigateToJob', language)}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Assignment Details Card */}
          <View style={styles.glassCard}>
            <View style={styles.cardIconHeader}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="information" size={24} color={PURPLE} />
              </View>
              <Text style={styles.cardHeaderTitle}>{translate('assignmentDetails', language)}</Text>
            </View>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoBox}>
                <MaterialCommunityIcons name="calendar-check" size={24} color={PURPLE} />
                <Text style={styles.infoBoxLabel}>{translate('assignedOn', language)}</Text>
                <Text style={styles.infoBoxValue}>{formatDate(work.assigned_at)}</Text>
              </View>

              {work.admin_name && (
                <View style={styles.infoBox}>
                  <MaterialCommunityIcons name="account-tie" size={24} color={PURPLE} />
                  <Text style={styles.infoBoxLabel}>{translate('assignedBy', language)}</Text>
                  <Text style={styles.infoBoxValue}>{work.admin_name}</Text>
                </View>
              )}
            </View>

            {work.rating && (
              <>
                <View style={styles.divider} />
                <View style={styles.ratingRow}>
                  <Text style={styles.detailLabel}>{translate('adminRating', language)}</Text>
                  <View style={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <MaterialCommunityIcons
                        key={star}
                        name={star <= work.rating ? 'star' : 'star-outline'}
                        size={20}
                        color={star <= work.rating ? '#FFA500' : MUTED}
                      />
                    ))}
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            {/* Navigate to Client Button - Always visible if location exists */}
            {work.status === 'assigned' && (
              <TouchableOpacity
                style={[styles.actionButtonFull, { backgroundColor: BLUE }]}
                onPress={handleStartWork}
                disabled={processing}
                activeOpacity={0.8}
              >
                <View style={styles.actionButtonContent}>
                  <MaterialCommunityIcons name="play-circle" size={24} color="#fff" />
                  <Text style={styles.actionButtonText}>{translate('startWorkTitle', language)}</Text>
                </View>
              </TouchableOpacity>
            )}

            {work.status === 'in_progress' && (
              <TouchableOpacity
                style={[styles.actionButtonFull, { backgroundColor: GREEN }]}
                onPress={handleCompleteWork}
                disabled={processing}
                activeOpacity={0.8}
              >
                <View style={styles.actionButtonContent}>
                  <MaterialCommunityIcons name="check-circle" size={24} color="#fff" />
                  <Text style={styles.actionButtonText}>{translate('markAsComplete', language)}</Text>
                </View>
              </TouchableOpacity>
            )}

            {work.status === 'completed' && (
              <View style={styles.completedBadge}>
                <MaterialCommunityIcons name="check-circle" size={28} color={GREEN} />
                <Text style={styles.completedText}>{translate('workCompletedBadge', language)}</Text>
              </View>
            )}
          </View>

          <View style={{ height: verticalScale(30) }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  headerGradient: {
    paddingTop: verticalScale(10),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
  },
  backBtn: {
    padding: scale(8),
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#fff',
  },
  headerSpacer: {
    width: scale(40),
  },
  voiceGuidanceWrap: {
    marginHorizontal: scale(16),
    marginTop: verticalScale(12),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: scale(16),
  },
  
  // Hero Card
  heroCard: {
    borderRadius: moderateScale(24),
    padding: scale(32),
    alignItems: 'center',
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  heroIcon: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
  },
  heroStatus: {
    fontSize: moderateScale(28),
    fontWeight: '800',
    color: '#fff',
    marginBottom: verticalScale(8),
  },
  heroSubtext: {
    fontSize: moderateScale(16),
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  
  // Type Banner
  typeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: verticalScale(20),
    paddingHorizontal: scale(24),
    borderRadius: moderateScale(20),
    marginBottom: verticalScale(20),
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  typeBannerText: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    color: PURPLE,
    marginLeft: scale(12),
  },
  
  // Glass Cards
  glassCard: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(20),
    padding: scale(20),
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardIconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  iconCircle: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: LIGHT_PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  cardHeaderTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: TEXT,
  },
  
  // Detail Rows
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
  },
  detailIconBox: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(12),
    backgroundColor: LIGHT_PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: moderateScale(12),
    color: MUTED,
    marginBottom: verticalScale(4),
  },
  detailValue: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: TEXT,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: verticalScale(12),
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: verticalScale(8),
  },
  
  // Description
  descriptionBox: {
    backgroundColor: '#F9FAFB',
    padding: scale(16),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: BORDER,
  },
  descriptionText: {
    fontSize: moderateScale(15),
    color: TEXT,
    lineHeight: moderateScale(24),
  },
  
  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    gap: scale(12),
    flexWrap: 'wrap',
  },
  infoBox: {
    flex: 1,
    minWidth: scale(140),
    backgroundColor: '#F9FAFB',
    padding: scale(16),
    borderRadius: moderateScale(16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  infoBoxLabel: {
    fontSize: moderateScale(11),
    color: MUTED,
    marginTop: verticalScale(8),
    marginBottom: verticalScale(4),
    fontWeight: '600',
    textAlign: 'center',
  },
  infoBoxValue: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: TEXT,
    textAlign: 'center',
  },
  
  // Rating
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: verticalScale(12),
  },
  ratingStars: {
    flexDirection: 'row',
    gap: scale(4),
  },
  
  // Action Buttons
  actionContainer: {
    marginTop: verticalScale(8),
  },
  navigateClientButton: {
    height: verticalScale(53),
    borderRadius: moderateScale(13),
    backgroundColor: '#EEF4F8',
    borderWidth: 1.5,
    borderColor: '#AFC5D7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(9),
  },
  navigateClientText: {
    color: '#4B7BA7',
    fontSize: moderateScale(15),
    fontWeight: '800',
    marginLeft: scale(8),
  },
  actionButtonFull: {
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(18),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
  },
  actionButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#fff',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: verticalScale(18),
    borderRadius: moderateScale(16),
    borderWidth: 2,
    borderColor: GREEN,
  },
  completedText: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: GREEN,
    marginLeft: scale(12),
  },
  
  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG,
  },
  loadingText: {
    fontSize: moderateScale(16),
    color: MUTED,
    marginTop: verticalScale(16),
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(32),
    backgroundColor: BG,
  },
  errorText: {
    fontSize: moderateScale(18),
    color: MUTED,
    marginTop: verticalScale(16),
    marginBottom: verticalScale(24),
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: PURPLE,
    paddingHorizontal: scale(32),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
  },
  backButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PURPLE,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    marginTop: verticalScale(12),
    gap: moderateScale(8),
  },
  navigateButtonText: {
    color: '#fff',
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
});
