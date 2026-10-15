import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import { translate, translateService } from '../utils/translations';
import { useTextToSpeech } from '../utils/useTextToSpeech';
import VoiceGuidanceButton from '../components/VoiceGuidanceButton';

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
  orange: '#F97316',
};

// Session-level guard: plays the automatic Voice Assistance
// instruction only once per app session, even if the screen
// is re-entered, re-rendered, or refreshed.
let myBookingsIntroSpoken = false;

export default function MyRequestsScreen({ navigation, onBack, language = 'english' }) {
  const { speak, stop } = useTextToSpeech(language);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stop();
    };
  }, [stop]);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, REQUESTED, SCHEDULED, REJECTED

  // Plays the "Voice Assistance is available" instruction once per
  // app session, after the initial load settles (never on re-renders,
  // language changes, scrolls, filters, or API refreshes).
  useEffect(() => {
    if (!loading && !myBookingsIntroSpoken) {
      myBookingsIntroSpoken = true;
      if (mountedRef.current) {
        speak(translate(language, 'myBookingsVoiceAssistIntro'));
      }
    }
  }, [loading, language, speak]);

  useEffect(() => {
    let isMounted = true;
    const loadCachedAndFetch = async () => {
      try {
        const cacheKey = `@cache_client_requests_${filter}`;
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached && isMounted) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRequests(parsed);
            setLoading(false);
          }
        }
      } catch (e) {}
      if (isMounted) {
        fetchRequests(true);
      }
    };
    loadCachedAndFetch();
    return () => {
      isMounted = false;
    };
  }, [filter]);

  const fetchRequests = async (silent = false) => {
    try {
      if (!silent) {
        if (requests.length === 0) {
          setLoading(true);
        }
      }
      setError(null);

      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        setError('Please login to view requests');
        setLoading(false);
        return;
      }

      // Build URL with filter
      let url = `${API_BASE_URL}/api/v1/jobs/work-requests/client/`;
      if (filter !== 'ALL') {
        url += `?status=${filter}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const list = data.work_requests || [];
        setRequests(list);
        AsyncStorage.setItem(`@cache_client_requests_${filter}`, JSON.stringify(list)).catch(() => {});
      } else if (requests.length === 0) {
        setError(data.error || 'Failed to load requests');
      }
    } catch (err) {
      console.error('[FAIL] Error fetching requests:', err);
      if (requests.length === 0) {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'REQUESTED':
        return COLORS.orange;
      case 'SCHEDULED':
        return COLORS.green;
      case 'REJECTED':
        return COLORS.red;
      case 'CANCELLED':
        return COLORS.gray;
      case 'COMPLETED':
        return COLORS.blue;
      default:
        return COLORS.gray;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'REQUESTED':
        return 'time-outline';
      case 'SCHEDULED':
        return 'checkmark-circle';
      case 'REJECTED':
        return 'close-circle';
      case 'CANCELLED':
        return 'ban';
      case 'COMPLETED':
        return 'checkmark-done-circle';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    // timeStr is in HH:MM format
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const renderRequest = (request) => {
    const statusColor = getStatusColor(request.status);
    const statusIcon = getStatusIcon(request.status);

    return (
      <Pressable
        key={request.id}
        style={styles.requestCard}
        delayPressIn={0}
        onPress={() => {
          // Navigate to booking details screen
          console.log('View request:', request.id);
          if (typeof navigation === 'function') {
            navigation(request.id, request);
          }
        }}
      >
        {/* Header */}
        <View style={styles.requestHeader}>
          <View style={styles.serviceInfo}>
            <Ionicons
              name="construct"
              size={20}
              color={COLORS.blue}
            />
            <Text style={styles.serviceText}>
              {translateService(request.service_category, language)}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Ionicons
              name={statusIcon}
              size={14}
              color={statusColor}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {request.status}
            </Text>
          </View>
        </View>

        {/* Worker Info */}
        <View style={styles.workerRow}>
          <Image
            source={{
              uri: request.worker_photo || request.worker_profile_picture || 
                   `https://ui-avatars.com/api/?name=${encodeURIComponent(request.worker_name || 'Worker')}&background=49769F&color=fff&size=200`,
            }}
            style={styles.workerPhoto}
          />
          <View style={styles.workerInfo}>
            <Text style={styles.workerName}>
              {request.worker_name || 'Worker'}
            </Text>
            {request.worker_rating && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color={COLORS.yellow} />
                <Text style={styles.ratingText}>
                  {request.worker_rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        {request.description && (
          <Text style={styles.description} numberOfLines={2}>
            {request.description}
          </Text>
        )}

        {/* Details */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.gray} />
            <Text style={styles.detailText}>
              {formatDate(request.required_date)}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color={COLORS.gray} />
            <Text style={styles.detailText}>
              {formatTime(request.required_time)}
            </Text>
          </View>
        </View>

        {/* Location */}
        {request.work_address && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.gray} />
            <Text style={styles.locationText} numberOfLines={1}>
              {request.work_address}
            </Text>
          </View>
        )}

        {/* Rejection Reason */}
        {request.status === 'REJECTED' && request.rejection_reason && (
          <View style={styles.reasonBox}>
            <Text style={styles.reasonLabel}>Rejection Reason:</Text>
            <Text style={styles.reasonText}>{request.rejection_reason}</Text>
          </View>
        )}

        {/* Timestamps */}
        <Text style={styles.timestamp}>
          Created {formatDate(request.created_at)}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} delayPressIn={0} onPress={onBack || (() => navigation?.goBack())}>
          <Ionicons name="arrow-back" size={23} color={COLORS.dark} />
        </Pressable>

        <Text style={styles.headerTitle}>My Requests</Text>

        <View style={styles.headerSpace} />
      </View>

      {/* Voice Assistance */}
      <View style={styles.voiceGuidanceWrap}>
        <VoiceGuidanceButton
          labeled
          text={translate(language, 'myBookingsVoiceGuidance')}
          language={language}
          title={translate(language, 'voiceAssistance')}
          subtitle={translate(language, 'myBookingsHearHowToUse')}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['ALL', 'REQUESTED', 'SCHEDULED', 'REJECTED'].map((status) => (
            <Pressable
              key={status}
              style={[
                styles.filterChip,
                filter === status && styles.filterChipActive,
              ]}
              delayPressIn={0}
              onPress={() => setFilter(status)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === status && styles.filterTextActive,
                ]}
              >
                {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && requests.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.blue} />
            <Text style={styles.loadingText}>Loading requests...</Text>
          </View>
        ) : error && requests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.gray} />
            <Text style={styles.emptyTitle}>Error</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchRequests}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={COLORS.gray} />
            <Text style={styles.emptyTitle}>No Requests</Text>
            <Text style={styles.emptyText}>
              {filter === 'ALL'
                ? 'You haven\'t made any work requests yet.'
                : `No ${filter.toLowerCase()} requests found.`}
            </Text>
          </View>
        ) : (
          requests.map((request) => renderRequest(request))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 70,
    marginTop: 30,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.dark,
  },

  headerSpace: {
    width: 43,
  },

  voiceGuidanceWrap: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },

  filterContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: 8,
  },

  filterChipActive: {
    backgroundColor: COLORS.blue,
  },

  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
  },

  filterTextActive: {
    color: COLORS.white,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: 16,
  },

  emptyText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.blue,
    borderRadius: 12,
  },

  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },

  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  serviceText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
    marginLeft: 8,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },

  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  workerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
  },

  workerInfo: {
    marginLeft: 10,
  },

  workerName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark,
    marginLeft: 3,
  },

  description: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 19,
    marginBottom: 12,
  },

  detailsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },

  detailText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 5,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  locationText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 5,
  },

  reasonBox: {
    backgroundColor: COLORS.red + '10',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },

  reasonLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.red,
    marginBottom: 4,
  },

  reasonText: {
    fontSize: 12,
    color: COLORS.dark,
    lineHeight: 17,
  },

  timestamp: {
    fontSize: 10,
    color: COLORS.lightGray,
    marginTop: 4,
  },
});

