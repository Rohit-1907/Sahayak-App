import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translate } from '../utils/translations';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

const PURPLE = '#49769F';
const BG = '#F8FAFC';
const TEXT = '#111827';
const MUTED = '#6B7280';
const GREEN = '#24935D';
const RED = '#D94C4C';
const ORANGE = '#F59E0B';
const BLUE = '#1F6CC5';
const BORDER = '#E0E7ED';

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Just now';
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

const getNotificationMeta = (type) => {
  switch (type) {
    case 'new_job_request':
      return {
        icon: 'briefcase-plus',
        color: PURPLE,
        bgColor: '#EBF2F7',
        actionHint: 'View Request',
      };
    case 'job_accepted':
      return {
        icon: 'check-circle',
        color: GREEN,
        bgColor: '#E8F5E9',
        actionHint: 'View Job',
      };
    case 'job_rejected':
      return {
        icon: 'close-circle',
        color: RED,
        bgColor: '#FFEBEE',
        actionHint: null,
      };
    case 'job_started':
      return {
        icon: 'progress-wrench',
        color: ORANGE,
        bgColor: '#FFF8E1',
        actionHint: 'View Job',
      };
    case 'job_completed':
      return {
        icon: 'check-decagram',
        color: GREEN,
        bgColor: '#E8F5E9',
        actionHint: 'View Job',
      };
    case 'job_cancelled':
      return {
        icon: 'alert-circle',
        color: RED,
        bgColor: '#FFEBEE',
        actionHint: null,
      };
    case 'otp':
      return {
        icon: 'shield-check',
        color: BLUE,
        bgColor: '#E3F2FD',
        actionHint: 'Enter OTP',
      };
    case 'payment':
      return {
        icon: 'cash',
        color: GREEN,
        bgColor: '#E8F5E9',
        actionHint: null,
      };
    default:
      return {
        icon: 'bell',
        color: PURPLE,
        bgColor: '#EBF2F7',
        actionHint: null,
      };
  }
};

export default function NotificationScreen({ go, language = 'English', onBack }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'jobs'
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async (isRefresh = false, silent = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (!silent) {
        setLoading(true);
      }
      setError(null);

      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const notifUrl = API_ENDPOINTS.NOTIFICATIONS || `${API_BASE_URL}/notifications/`;
      const response = await fetch(notifUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const list = data.results ? data.results : (Array.isArray(data) ? data : []);
      setNotifications(list);
      AsyncStorage.setItem('@cache_worker_notifications', JSON.stringify(list)).catch(() => {});
    } catch (err) {
      console.warn('[NotificationScreen] Fetch error:', err.message);
      if (notifications.length === 0) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [notifications.length]);

  useEffect(() => {
    let isMounted = true;
    const loadCached = async () => {
      try {
        const cached = await AsyncStorage.getItem('@cache_worker_notifications');
        if (cached && isMounted) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNotifications(parsed);
            setLoading(false);
          }
        }
      } catch (e) {}
      if (isMounted) {
        fetchNotifications(false, true);
      }
    };
    loadCached();
    const interval = setInterval(() => fetchNotifications(false, true), 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  const markAsRead = async (item) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
    );

    if (!item.is_read) {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          const markUrl = API_ENDPOINTS.NOTIFICATIONS_MARK_READ
            ? API_ENDPOINTS.NOTIFICATIONS_MARK_READ(item.id)
            : `${API_BASE_URL}/notifications/${item.id}/mark-read/`;

          await fetch(markUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        }
      } catch (err) {
        console.warn('[NotificationScreen] Mark read failed:', err.message);
      }
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        const markAllUrl = API_ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ || `${API_BASE_URL}/notifications/mark-all-read/`;
        await fetch(markAllUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (err) {
      console.warn('[NotificationScreen] Mark all read failed:', err.message);
    }
  };

  const handlePressItem = async (item) => {
    await markAsRead(item);

    if (!item.related_id) return;

    if (item.type === 'new_job_request') {
      go('workerJobDetails', { requestId: item.related_id });
    } else if (
      item.type === 'job_accepted' ||
      item.type === 'job_started' ||
      item.type === 'job_completed' ||
      item.type === 'job_cancelled'
    ) {
      go('workerJobDetails', { requestId: item.related_id });
    } else if (item.type === 'otp') {
      go('otpEntry', { requestId: item.related_id });
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'unread') return !item.is_read;
    if (activeFilter === 'jobs') {
      return (
        item.type === 'new_job_request' ||
        item.type === 'job_accepted' ||
        item.type === 'job_rejected' ||
        item.type === 'job_started' ||
        item.type === 'job_completed' ||
        item.type === 'job_cancelled' ||
        item.type === 'otp'
      );
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack || (() => go('home'))}
          delayPressIn={0}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={TEXT} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>
            {translate('notifications', language) || 'Notifications'}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead} delayPressIn={0} activeOpacity={0.7}>
            <Text style={styles.markAllReadText}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
          onPress={() => setActiveFilter('all')}
          delayPressIn={0}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'all' && styles.filterChipTextActive,
            ]}
          >
            All ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'unread' && styles.filterChipActive]}
          onPress={() => setActiveFilter('unread')}
          delayPressIn={0}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'unread' && styles.filterChipTextActive,
            ]}
          >
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'jobs' && styles.filterChipActive]}
          onPress={() => setActiveFilter('jobs')}
          delayPressIn={0}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'jobs' && styles.filterChipTextActive,
            ]}
          >
            Jobs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading state */}
      {loading && notifications.length === 0 && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PURPLE} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      )}

      {/* Error state */}
      {error && notifications.length === 0 && (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={RED} />
          <Text style={styles.errorText}>Unable to load notifications</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchNotifications(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchNotifications(true)}
            colors={[PURPLE]}
          />
        }
      >
        {filteredNotifications.map((item) => {
          const meta = getNotificationMeta(item.type);
          const hasAction = Boolean(meta.actionHint && item.related_id);

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, !item.is_read && styles.cardUnread]}
              onPress={() => handlePressItem(item)}
              delayPressIn={0}
              activeOpacity={0.75}
            >
              <View style={[styles.iconWrap, { backgroundColor: meta.bgColor }]}>
                <MaterialCommunityIcons name={meta.icon} size={22} color={meta.color} />
              </View>

              <View style={styles.cardBody}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.cardTitle, !item.is_read && styles.cardTitleUnread]}>
                    {item.title}
                  </Text>
                  {!item.is_read && <View style={styles.unreadDot} />}
                </View>

                {item.message ? (
                  <Text style={styles.cardMessage}>{item.message}</Text>
                ) : null}

                <View style={styles.cardFooter}>
                  <Text style={styles.cardTime}>{formatTimeAgo(item.created_at)}</Text>
                  {hasAction && (
                    <View style={styles.actionWrap}>
                      <Text style={styles.actionText}>{meta.actionHint}</Text>
                      <MaterialCommunityIcons name="chevron-right" size={16} color={PURPLE} />
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Empty state */}
        {!loading && filteredNotifications.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons name="bell-sleep-outline" size={44} color={MUTED} />
            </View>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'unread'
                ? "You've read all your notifications!"
                : "You're all caught up! New job requests and alerts will appear here."}
            </Text>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
  },
  unreadBadge: {
    backgroundColor: PURPLE,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  markAllReadText: {
    fontSize: 13,
    color: PURPLE,
    fontWeight: '600',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: PURPLE,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: MUTED,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardUnread: {
    backgroundColor: '#FAFDFE',
    borderColor: '#D0E3F0',
    borderLeftWidth: 4,
    borderLeftColor: PURPLE,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardBody: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT,
    flex: 1,
  },
  cardTitleUnread: {
    fontWeight: '700',
    color: '#0A2540',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PURPLE,
    marginLeft: 6,
  },
  cardMessage: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 18,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  cardTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: PURPLE,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: MUTED,
  },
  errorText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: RED,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: PURPLE,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 19,
  },
});
