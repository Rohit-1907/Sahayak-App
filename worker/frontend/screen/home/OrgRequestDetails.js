import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { API_ENDPOINTS } from '../../config/api';
import { translate } from '../../utils/translations';
import { useTextToSpeech } from '../../utils/useTextToSpeech';
import VoiceGuidanceButton from '../../components/VoiceGuidanceButton';

const PURPLE = '#49769F';
const LIGHT_PURPLE = '#EEF4F8';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E0E7ED';
const GREEN = '#10B981';
const RED = '#EF4444';
const YELLOW = '#F59E0B';

let orgRequestDetailsIntroSpoken = false;

export default function OrgRequestDetails({ route, go, onBack, language = "English" }) {
  const { request } = route?.params || {};
  const [processing, setProcessing] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const { speak: speakOrgRequestDetails, stop: stopOrgRequestDetails } = useTextToSpeech(language);

  React.useEffect(() => {
    if (orgRequestDetailsIntroSpoken) {
      return;
    }
    orgRequestDetailsIntroSpoken = true;
    const intro = translate('orgRequestDetailsAutoIntro', language);
    speakOrgRequestDetails(intro);
    return () => {
      stopOrgRequestDetails();
    };
  }, [language, speakOrgRequestDetails, stopOrgRequestDetails]);

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
    
    // Debug logging
    if (request) {
      console.log('[TASK] OrgRequestDetails - Request data:', JSON.stringify(request, null, 2));
      console.log('[TASK] Status:', request.status);
      console.log('[TASK] Work Description:', request.work_description);
      console.log('[TASK] Location:', request.work_location);
      console.log('[TASK] Required Date:', request.required_date);
      console.log('[TASK] Required Time:', request.required_time);
    }
  }, []);

  if (!request) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color={MUTED} />
        <Text style={styles.errorText}>{translate('requestNotFound', language)}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (onBack ? onBack() : go('home'))}
        >
          <Text style={styles.backButtonText}>{translate('goBack', language)}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCallClient = () => {
    if (request.client_contact) {
      Linking.openURL(`tel:${request.client_contact}`);
    } else {
      Alert.alert('No Contact', 'Client contact number not available');
    }
  };

  const handleAccept = async () => {
    try {
      setProcessing(true);
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('access_token');

      const response = await fetch(API_ENDPOINTS.ORG_REQUEST_ACCEPT(request.id), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Work request accepted successfully!', [
          {
            text: 'OK',
            onPress: () => {
              if (route?.params?.onRefresh) {
                route.params.onRefresh();
              }
              if (onBack) onBack();
              else go('home');
            },
          },
        ]);
      } else {
        Alert.alert('Error', data.error || 'Failed to accept request');
      }
    } catch (error) {
      console.log('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this work request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              const token = await AsyncStorage.getItem('access_token');

              const response = await fetch(API_ENDPOINTS.ORG_REQUEST_REJECT(request.id), {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              const data = await response.json();

              if (data.success) {
                Alert.alert('Rejected', 'Work request rejected', [
                  {
                    text: 'OK',
                    onPress: () => {
                      if (route?.params?.onRefresh) {
                        route.params.onRefresh();
                      }
                      if (onBack) onBack();
                      else go('home');
                    },
                  },
                ]);
              } else {
                Alert.alert('Error', data.error || 'Failed to reject request');
              }
            } catch (error) {
              console.log('Error rejecting request:', error);
              Alert.alert('Error', 'Failed to reject request');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const getLanguageCode = (language) => {
    if (language === 'मराठी') return 'mr';
    if (language === 'हिंदी') return 'hi';
    return 'en';
  };

  const getOrgRequestDescription = (request, language) => {
    const code = getLanguageCode(language);
    return request.translations?.[code]?.work_description
      || request.work_description
      || '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return translate('invalidDate', language);
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return translate('invalidDate', language);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return translate('invalidDate', language);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      // Handle HH:MM:SS format
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const minute = minutes || '00';
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minute} ${ampm}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'accepted':
        return GREEN;
      case 'rejected':
        return RED;
      default:
        return MUTED;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'clock-outline';
      case 'accepted':
        return 'check-circle';
      case 'rejected':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Gradient Effect */}
      <View style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => (onBack ? onBack() : go('home'))}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{translate('workRequestTitle', language)}</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <View style={styles.voiceGuidanceWrap}>
        <VoiceGuidanceButton
          labeled
          text={translate('orgRequestDetailsVoiceGuidance', language)}
          language={language}
          title={translate('voiceAssistance', language)}
          subtitle={translate('orgRequestDetailsHearHowToUse', language)}
        />
      </View>

      <ScrollView
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          {/* Status Hero Card */}
          <View style={[styles.heroCard, { backgroundColor: getStatusColor(request.status) }]}>
            <View style={styles.heroIcon}>
              <MaterialCommunityIcons
                name={getStatusIcon(request.status)}
                size={48}
                color="#fff"
              />
            </View>
            <Text style={styles.heroStatus}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Text>
            <Text style={styles.heroSubtext}>
              {request.status === 'pending' ? translate('awaitingResponse', language) :
               request.status === 'accepted' ? translate('readyToAssignWorkers', language) : translate('requestDeclined', language)}
            </Text>
          </View>

          {/* Work Type Banner */}
          <View style={styles.typeBanner}>
            <MaterialCommunityIcons name="briefcase-variant" size={28} color={PURPLE} />
            <Text style={styles.typeBannerText}>{request.work_type}</Text>
          </View>

          {/* Schedule Card */}
          <View style={styles.glassCard}>
            <View style={styles.cardIconHeader}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="calendar-clock" size={24} color={PURPLE} />
              </View>
              <Text style={styles.cardHeaderTitle}>{translate('scheduleInformation', language)}</Text>
            </View>
            
            {/* Required Date (if specified) */}
            {request.required_date && (
              <>
                <View style={styles.detailRow}>
                  <View style={[styles.detailIconBox, { backgroundColor: '#E8F5FF' }]}>
                    <MaterialCommunityIcons name="calendar" size={18} color={PURPLE} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>{translate('requiredDate', language)}</Text>
                    <Text style={[styles.detailValue, { color: PURPLE, fontWeight: '700' }]}>
                      {new Date(request.required_date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />
              </>
            )}

            {/* Required Time (if specified) */}
            {request.required_time && (
              <>
                <View style={styles.detailRow}>
                  <View style={[styles.detailIconBox, { backgroundColor: '#E8F5FF' }]}>
                    <MaterialCommunityIcons name="clock-outline" size={18} color={PURPLE} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>{translate('requiredTime', language)}</Text>
                    <Text style={[styles.detailValue, { color: PURPLE, fontWeight: '700' }]}>
                      {formatTime(request.required_time)}
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />
              </>
            )}
            
            {/* Created Date */}
            <View style={styles.detailRow}>
              <View style={styles.detailIconBox}>
                <MaterialCommunityIcons name="calendar-plus" size={18} color={MUTED} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{translate('requestSubmitted', language)}</Text>
                <Text style={styles.detailValue}>{formatDate(request.created_at)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Request ID */}
            <View style={styles.detailRow}>
              <View style={styles.detailIconBox}>
                <MaterialCommunityIcons name="tag" size={18} color={MUTED} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{translate('requestId', language)}</Text>
                <Text style={styles.detailValue} numberOfLines={1}>#{request.id}</Text>
              </View>
            </View>
          </View>

          {/* Client Card */}
          <View style={styles.glassCard}>
            <View style={styles.cardIconHeader}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="account" size={24} color={PURPLE} />
              </View>
              <Text style={styles.cardHeaderTitle}>{translate('clientDetails', language)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIconBox}>
                <MaterialCommunityIcons name="account-outline" size={18} color={PURPLE} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{translate('name', language)}</Text>
                <Text style={styles.detailValue}>{request.client_name}</Text>
              </View>
            </View>

            <View style={styles.divider} />

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
                  {request.client_contact}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={GREEN} />
            </TouchableOpacity>
          </View>

          {/* Description Card */}
          <View style={styles.glassCard}>
            <View style={styles.cardIconHeader}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="text-box" size={24} color={PURPLE} />
              </View>
              <Text style={styles.cardHeaderTitle}>{translate('workDescriptionTitle', language)}</Text>
            </View>
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>
                {getOrgRequestDescription(request, language) || translate('noDescriptionProvided', language)}
              </Text>
            </View>
          </View>

          {/* Location Card */}
          {request.work_location && (
            <View style={styles.glassCard}>
              <View style={styles.cardIconHeader}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="map-marker" size={24} color={RED} />
                </View>
                <Text style={styles.cardHeaderTitle}>{translate('workLocation', language)}</Text>
              </View>
              <View style={styles.locationContainer}>
                <MaterialCommunityIcons name="map-marker" size={24} color={RED} />
                <Text style={styles.locationText}>{request.work_location}</Text>
              </View>
            </View>
          )}

          {/* Assignment Details (if available) */}
          {request.assignment_count > 0 && (
            <View style={styles.glassCard}>
              <View style={styles.cardIconHeader}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="account-group" size={24} color={PURPLE} />
                </View>
                <Text style={styles.cardHeaderTitle}>{translate('workAssignment', language)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailIconBox}>
                  <MaterialCommunityIcons name="account-hard-hat" size={18} color={PURPLE} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>{translate('workersAssigned', language)}</Text>
                  <Text style={styles.detailValue}>{request.assignment_count} {translate('workerCountSuffix', language)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          {request.status === 'pending' && (
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={[styles.actionButtonLarge, styles.rejectButton]}
                onPress={handleReject}
                disabled={processing}
                activeOpacity={0.8}
              >
                <View style={styles.actionButtonContent}>
                  <MaterialCommunityIcons name="close-circle" size={24} color={RED} />
                  <Text style={styles.rejectButtonText}>{translate('decline', language)}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButtonLarge, styles.acceptButton]}
                onPress={handleAccept}
                disabled={processing}
                activeOpacity={0.8}
              >
                <View style={styles.actionButtonContent}>
                  <MaterialCommunityIcons name="check-circle" size={24} color="#fff" />
                  <Text style={styles.acceptButtonText}>{translate('acceptRequest', language)}</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: verticalScale(30) }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    backgroundColor: PURPLE,
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
  
  // Hero Status Card
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
    fontSize: moderateScale(14),
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
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
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: verticalScale(4),
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
  },
  infoBox: {
    flex: 1,
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
  },
  infoBoxValue: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: TEXT,
    textAlign: 'center',
  },
  
  // Action Buttons
  actionContainer: {
    flexDirection: 'row',
    gap: scale(12),
    marginTop: verticalScale(8),
  },
  actionButtonLarge: {
    flex: 1,
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
  rejectButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: RED,
  },
  rejectButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: RED,
  },
  acceptButton: {
    backgroundColor: PURPLE,
  },
  acceptButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#fff',
  },
  
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(32),
    backgroundColor: '#F8FAFC',
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

  // Location
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF5F5',
    padding: scale(16),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#FFEBEE',
  },
  locationText: {
    flex: 1,
    fontSize: moderateScale(15),
    color: TEXT,
    marginLeft: scale(12),
    lineHeight: moderateScale(22),
  },
});
