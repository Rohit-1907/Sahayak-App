import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

let workRequestsIntroSpoken = false;

const getLanguageCode = (language) => {
  if (language === 'मराठी') return 'mr';
  if (language === 'हिंदी') return 'hi';
  return 'en';
};

const getRequestText = (request, language, field) => {
  const code = getLanguageCode(language);
  return request.translations?.[code]?.[field] || request[field] || '';
};

export default function WorkRequestsScreen({ go, language = "English" }) {
  const { speak: speakWorkRequests, stop: stopWorkRequests } = useTextToSpeech(language);

  useEffect(() => {
    if (workRequestsIntroSpoken) {
      return;
    }
    workRequestsIntroSpoken = true;
    const intro = translate('workRequestsAutoIntro', language);
    speakWorkRequests(intro);
    return () => {
      stopWorkRequests();
    };
  }, [language, speakWorkRequests, stopWorkRequests]);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('REQUESTED'); // REQUESTED, SCHEDULED, ALL
  const [actionLoadingId, setActionLoadingId] = useState(null);

  console.log('[VIEW] WorkRequestsScreen MOUNTED - Filter:', filter);

  useEffect(() => {
    let isMounted = true;
    const loadCachedAndFetch = async () => {
      try {
        const cacheKey = `@cache_worker_requests_${filter}`;
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached && isMounted) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setRequests(parsed);
            setLoading(false);
          }
        }
      } catch (e) {
        // Cache read fallback
      }
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
      let url = API_ENDPOINTS.JOBS_WORK_REQUESTS;
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
        AsyncStorage.setItem(`@cache_worker_requests_${filter}`, JSON.stringify(list)).catch(() => {});
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

  const handleAccept = async (requestId) => {
    Alert.alert(
      translate('acceptRequest', language),
      translate('acceptRequestConfirm', language),
      [
        { text: translate('cancel', language), style: 'cancel' },
        {
          text: translate('accept', language),
          onPress: () => performAction(requestId, 'accept'),
        },
      ]
    );
  };

const handleReject = async (requestId) => {
    Alert.alert(
      translate('rejectRequest', language),
      translate('rejectRequestConfirm', language),
      [
        { text: translate('cancel', language), style: 'cancel' },
        {
          text: translate('reject', language),
          style: 'destructive',
          onPress: () => {
            performAction(requestId, 'reject', '');
          },
        },
      ]
    );
  };

  const performAction = async (requestId, action, reason = '') => {
    try {
      setActionLoadingId(requestId);
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'Please login to continue');
        setActionLoadingId(null);
        return;
      }

      const payload = {
        action: action,
      };

      if (action === 'reject' && reason) {
        payload.reason = reason;
      }

      console.log(`[REQ] ${action} request ${requestId}:`, payload);

      const response = await fetch(
        API_ENDPOINTS.JOB_WORK_REQUEST_ACTION(requestId),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      console.log(`[RES] Action response:`, data);

      if (response.ok && data.success) {
        // Optimistically remove request immediately from state
        setRequests(prev => {
          const next = prev.filter(r => r.id !== requestId);
          AsyncStorage.setItem(`@cache_worker_requests_${filter}`, JSON.stringify(next)).catch(() => {});
          return next;
        });
        // Silent re-fetch in background to keep data fresh without UI flash
        fetchRequests(true);
        Alert.alert(
          translate('successExclamation', language),
          data.message || translate('requestActionSuccess', language, { action: translate(action, language) })
        );
      } else {
        Alert.alert(translate('error', language), data.error || translate('failedToActionRequest', language, { action: translate(action, language) }));
      }
    } catch (err) {
      console.error(`[FAIL] Error ${action}ing request:`, err);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'REQUESTED':
        return ORANGE;
      case 'SCHEDULED':
        return GREEN;
      case 'REJECTED':
        return RED;
      default:
        return MUTED;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
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

  const renderRequest = (request) => {
    const statusColor = getStatusColor(request.status);
    const isRequested = request.status === 'REQUESTED';

    return (
      <TouchableOpacity
        key={request.id}
        style={styles.requestCard}
        onPress={() => go('workerJobDetails', { requestId: request.id })}
        activeOpacity={0.7}
        delayPressIn={0}
      >
        {/* Header */}
        <View style={styles.requestHeader}>
          <View style={styles.serviceRow}>
            <MaterialCommunityIcons
              name="briefcase"
              size={20}
              color={PURPLE}
            />
            <Text style={styles.serviceText}>
              {request.service_category}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + '20' },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {request.status}
            </Text>
          </View>
        </View>

        {/* Client Info */}
        <View style={styles.clientRow}>
          <MaterialCommunityIcons
            name="account"
            size={16}
            color={MUTED}
          />
          <Text style={styles.clientName}>
            {request.client_name || 'Client'}
          </Text>
          {request.client_phone && (
            <>
              <Text style={styles.separator}>|</Text>
              <MaterialCommunityIcons
                name="phone"
                size={14}
                color={MUTED}
              />
              <Text style={styles.clientPhone}>
                {request.client_phone}
              </Text>
            </>
          )}
        </View>

        {/* Description */}
        {request.description && (
          <Text style={styles.description} numberOfLines={3}>
            {getRequestText(request, language, 'description')}
          </Text>
        )}

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="calendar"
              size={16}
              color={PURPLE}
            />
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>
              {formatDate(request.required_date)}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color={PURPLE}
            />
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>
              {formatTime(request.required_time)}
            </Text>
          </View>
        </View>

        {/* Location */}
        {request.work_address && (
          <View style={styles.locationRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color={RED}
            />
            <Text style={styles.locationText} numberOfLines={2}>
              {request.work_address}
            </Text>
          </View>
        )}

        {/* Budget */}
        {request.estimated_budget && (
          <View style={styles.budgetRow}>
            <MaterialCommunityIcons
              name="cash"
              size={16}
              color={GREEN}
            />
            <Text style={styles.budgetText}>
              Est. Budget: Rs. {parseFloat(request.estimated_budget).toFixed(0)}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        {isRequested && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.rejectButton,
                actionLoadingId === request.id && { opacity: 0.6 },
              ]}
              onPress={() => handleReject(request.id)}
              disabled={!!actionLoadingId}
              delayPressIn={0}
              activeOpacity={0.7}
            >
              {actionLoadingId === request.id ? (
                <ActivityIndicator size="small" color={RED} />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="close"
                    size={18}
                    color={RED}
                  />
                  <Text style={styles.rejectButtonText}>{translate('reject', language)}</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.acceptButton,
                actionLoadingId === request.id && { opacity: 0.6 },
              ]}
              onPress={() => handleAccept(request.id)}
              disabled={!!actionLoadingId}
              delayPressIn={0}
              activeOpacity={0.7}
            >
              {actionLoadingId === request.id ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="check"
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.acceptButtonText}>{translate('accept', language)}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Timestamps */}
        <Text style={styles.timestamp}>
          Received {formatDate(request.created_at)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => go('home')}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={TEXT}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{translate('workRequests', language)}</Text>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchRequests}
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
          text={translate('workRequestsVoiceGuidance', language)}
          language={language}
          title={translate('voiceAssistance', language)}
          subtitle={translate('workRequestsHearHowToUse', language)}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
{['REQUESTED', 'SCHEDULED', 'ALL'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    filter === status && styles.filterChipActive,
                  ]}
                  onPress={() => setFilter(status)}
                  delayPressIn={0}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === status && styles.filterTextActive,
                    ]}
                  >
                    {status === 'ALL'
                      ? translate('seeAll', language)
                      : status === 'REQUESTED'
                      ? translate('pending', language)
                      : translate('scheduled', language)}
                  </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PURPLE]}
          />
        }
      >
        {loading && requests.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PURPLE} />
            <Text style={styles.loadingText}>{translate('loading', language)}</Text>
          </View>
        ) : error && requests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={48}
              color={MUTED}
            />
            <Text style={styles.emptyTitle}>{translate('error', language)}</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchRequests}
            >
              <Text style={styles.retryButtonText}>{translate('retry', language)}</Text>
            </TouchableOpacity>
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="briefcase-outline"
              size={48}
              color={MUTED}
            />
            <Text style={styles.emptyTitle}>{translate('noWorkRequests', language)}</Text>
            <Text style={styles.emptyText}>
              {filter === 'REQUESTED'
                ? translate('noPendingRequests', language)
                : filter === 'SCHEDULED'
                ? translate('noScheduledRequests', language)
                : translate('noWorkRequests', language)}
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
    backgroundColor: BG,
  },

  header: {
    height: 60,
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

  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  filterScroll: {
    paddingHorizontal: 16,
  },

  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: BG,
    marginRight: 8,
  },

  filterChipActive: {
    backgroundColor: PURPLE,
  },

  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: MUTED,
  },

  filterTextActive: {
    color: '#FFFFFF',
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
    color: MUTED,
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
    color: TEXT,
    marginTop: 16,
  },

  emptyText: {
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
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

  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  serviceText: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
    marginLeft: 8,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  clientName: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT,
    marginLeft: 6,
  },

  separator: {
    marginHorizontal: 8,
    color: MUTED,
  },

  clientPhone: {
    fontSize: 12,
    color: MUTED,
    marginLeft: 4,
  },

  description: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 19,
    marginBottom: 12,
  },

  detailsGrid: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG,
    padding: 10,
    borderRadius: 10,
    marginRight: 8,
  },

  detailLabel: {
    fontSize: 10,
    color: MUTED,
    marginLeft: 6,
    marginRight: 4,
  },

  detailValue: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },

  locationText: {
    flex: 1,
    fontSize: 12,
    color: TEXT,
    marginLeft: 6,
    lineHeight: 17,
  },

  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },

  budgetText: {
    fontSize: 13,
    fontWeight: '600',
    color: GREEN,
    marginLeft: 6,
  },

  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 8,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },

  rejectButton: {
    backgroundColor: '#FEE2E2',
    marginRight: 8,
  },

  rejectButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: RED,
    marginLeft: 6,
  },

  acceptButton: {
    backgroundColor: GREEN,
  },

  acceptButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 6,
  },

  timestamp: {
    fontSize: 10,
    color: MUTED,
    marginTop: 4,
  },
});

