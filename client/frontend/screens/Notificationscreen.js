import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const mapCategory = (type) => {
  switch (type) {
    case 'job_request':
    case 'new_job_request':
    case 'booking_update':
    case 'job_update':
    case 'job_accepted':
    case 'job_rejected':
    case 'job_started':
    case 'job_completed':
    case 'job_cancelled':
      return 'Bookings';
    case 'payment':
      return 'Payments';
    case 'announcement':
      return 'Offers';
    case 'otp':
      return 'OTP';
    default:
      return 'Bookings';
  }
};

const mapIcon = (type) => {
  switch (type) {
    case 'job_accepted':
      return 'checkmark-circle-outline';
    case 'job_rejected':
      return 'close-circle-outline';
    case 'job_started':
      return 'construct-outline';
    case 'job_completed':
      return 'trophy-outline';
    case 'job_cancelled':
      return 'alert-circle-outline';
    case 'payment':
      return 'card-outline';
    case 'announcement':
      return 'pricetag-outline';
    case 'otp':
      return 'lock-closed-outline';
    case 'new_job_request':
    case 'job_request':
    case 'booking_update':
    default:
      return 'calendar-outline';
  }
};

export default function Notificationscreen({ onBack, onNavigateToJob }) {
  const [activeTab, setActiveTab] = useState('All');
  const [items, setItems] = useState([]);
  const [otpNotifications, setOtpNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const tabs = ['All', 'OTP', 'Bookings', 'Offers', 'Payments'];

  // SWR: Load cached notifications immediately on mount, then silently refresh
  useEffect(() => {
    let isMounted = true;
    const loadCache = async () => {
      try {
        const [cachedItems, cachedOtps] = await Promise.all([
          AsyncStorage.getItem('@cache_client_notifications_items'),
          AsyncStorage.getItem('@cache_client_notifications_otp'),
        ]);
        if (isMounted) {
          if (cachedItems) {
            const parsed = JSON.parse(cachedItems);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setItems(parsed);
            }
          }
          if (cachedOtps) {
            const parsedOtps = JSON.parse(cachedOtps);
            if (Array.isArray(parsedOtps) && parsedOtps.length > 0) {
              setOtpNotifications(parsedOtps);
            }
          }
        }
      } catch (e) {}
    };
    loadCache();
    fetchAllNotifications(false, true);

    // Auto-refresh every 20 seconds silently
    const interval = setInterval(() => fetchAllNotifications(false, true), 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const fetchAllNotifications = async (isRefresh = false, silent = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (!silent && items.length === 0 && otpNotifications.length === 0) {
        setLoading(true);
      }
      setError(null);
      
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // 1. Fetch OTPs
      try {
        const otpResponse = await fetch(`${API_BASE_URL}/api/v1/notifications/otps/`, {
          method: 'GET',
          headers,
        });

        if (otpResponse.ok) {
          const otpData = await otpResponse.json();
          const transformedOtps = (Array.isArray(otpData) ? otpData : []).map((otp) => ({
            id: `otp-${otp.id}`,
            type: 'OTP',
            rawType: 'otp',
            icon: 'lock-closed-outline',
            title: otp.title || 'Authentication PIN',
            message: `Your PIN: ${otp.pin}`,
            pin: otp.pin,
            time: formatTime(otp.created_at),
            expiresAt: otp.expires_at,
            unread: true,
          }));
          setOtpNotifications(transformedOtps);
          try {
            AsyncStorage.setItem('@cache_client_notifications_otp', JSON.stringify(transformedOtps));
          } catch (e) {}
        }
      } catch (otpErr) {
        console.warn('Error fetching OTPs:', otpErr.message);
      }

      // 2. Fetch User Notifications
      try {
        const notifResponse = await fetch(`${API_BASE_URL}/api/v1/notifications/`, {
          method: 'GET',
          headers,
        });

        if (notifResponse.ok) {
          const notifData = await notifResponse.json();
          const list = notifData.results ? notifData.results : (Array.isArray(notifData) ? notifData : []);
          const transformed = list.map((item) => ({
            id: item.id,
            type: mapCategory(item.type),
            rawType: item.type,
            icon: mapIcon(item.type),
            title: item.title,
            message: item.message,
            time: formatTime(item.created_at),
            unread: !item.is_read,
            relatedId: item.related_id,
          }));
          setItems(transformed);
          try {
            AsyncStorage.setItem('@cache_client_notifications_items', JSON.stringify(transformed));
          } catch (e) {}
        }
      } catch (notifErr) {
        console.warn('Error fetching notifications:', notifErr.message);
      }

    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatTime = (timestamp) => {
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

  const calculateTimeRemaining = (expiresAt) => {
    if (!expiresAt) return '';
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry - now;
    
    if (diffMs <= 0) return 'Expired';
    
    const diffSecs = Math.floor(diffMs / 1000);
    const mins = Math.floor(diffSecs / 60);
    const secs = diffSecs % 60;
    
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  // Combine OTP notifications with regular notifications
  const allNotifications = [...otpNotifications, ...items];

  const filtered =
    activeTab === 'All'
      ? allNotifications
      : activeTab === 'OTP'
      ? otpNotifications
      : items.filter((notification) => notification.type === activeTab);

  const markAllRead = async () => {
    setItems((currentItems) =>
      currentItems.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
    setOtpNotifications((currentOtps) =>
      currentOtps.map((otp) => ({
        ...otp,
        unread: false,
      }))
    );

    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        await fetch(`${API_BASE_URL}/api/v1/notifications/mark-all-read/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (e) {
      console.warn('Failed to mark all read on server:', e);
    }
  };

  const markAsRead = async (id) => {
    setItems((currentItems) =>
      currentItems.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
    setOtpNotifications((currentOtps) =>
      currentOtps.map((otp) =>
        otp.id === id ? { ...otp, unread: false } : otp
      )
    );

    if (id && !String(id).startsWith('otp-')) {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          await fetch(`${API_BASE_URL}/api/v1/notifications/${id}/mark-read/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        }
      } catch (e) {
        console.warn('Failed to mark read on server:', e);
      }
    }
  };

  const handleItemPress = (item) => {
    markAsRead(item.id);
    if (item.relatedId && onNavigateToJob) {
      onNavigateToJob(item.relatedId);
    }
  };

  const unreadCount = 
    [...otpNotifications, ...items].filter((notification) => notification.unread).length;

  return (
    <SafeAreaView style={styles.container}>

      {/* ================= HEADER ================= */}

      <View style={styles.header}>

        <Pressable
          delayPressIn={0}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressedButton,
          ]}
          onPress={onBack}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#2A2A2A"
          />
        </Pressable>

        <View style={styles.headerTitleContainer}>

          <Text style={styles.headerTitle}>
            Notifications
          </Text>

          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {unreadCount}
              </Text>
            </View>
          )}

        </View>

        <Pressable
          delayPressIn={0}
          onPress={markAllRead}
          disabled={unreadCount === 0}
        >
          <Text
            style={[
              styles.markRead,
              unreadCount === 0 && styles.disabledMarkRead,
            ]}
          >
            Mark all read
          </Text>
        </Pressable>

      </View>

      {/* ================= TABS ================= */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {tabs.map((tab) => {

          const isActive = activeTab === tab;

          return (
            <Pressable
              delayPressIn={0}
              key={tab}
              style={({ pressed }) => [
                styles.tab,
                isActive && styles.activeTab,
                pressed && styles.tabPressed,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ================= NOTIFICATIONS ================= */}

      {loading && otpNotifications.length === 0 && items.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#49769F" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      )}

      {error && items.length === 0 && otpNotifications.length === 0 && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable delayPressIn={0} onPress={() => fetchAllNotifications(false)} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAllNotifications(true)}
            colors={['#49769F']}
          />
        }
      >

        {filtered.map((item) => (

          <Pressable
            delayPressIn={0}
            key={item.id}
            onPress={() => handleItemPress(item)}
            style={({ pressed }) => [
              styles.card,
              item.unread && styles.unreadCard,
              item.type === 'OTP' && styles.otpCard,
              pressed && styles.cardPressed,
            ]}
          >

            {/* ICON */}

            <View
              style={[
                styles.iconCircle,
                item.unread && styles.unreadIconCircle,
                item.type === 'OTP' && styles.otpIconCircle,
              ]}
            >
              <Ionicons
                name={item.type === 'OTP' ? 'shield-checkmark' : item.icon}
                size={24}
                color={item.type === 'OTP' ? '#10B981' : '#49769F'}
              />
            </View>

            {/* TEXT */}

            <View style={styles.textContainer}>

              <View style={styles.titleRow}>

                <Text style={styles.title}>
                  {item.title}
                </Text>

                {item.unread && (
                  <View style={styles.dot} />
                )}

              </View>

              {/* Display PIN prominently for OTP notifications */}
              {item.type === 'OTP' && item.pin && (
                <View style={styles.pinContainer}>
                  <Text style={styles.pinLabel}>PIN:</Text>
                  <Text style={styles.pinText}>{item.pin}</Text>
                </View>
              )}

              <Text style={styles.message}>
                {item.message}
              </Text>

              <View style={styles.timeRow}>
                <Text style={styles.time}>
                  {item.time}
                </Text>
                {item.type === 'OTP' && item.expiresAt && (
                  <Text style={styles.expiryText}>
                    • Expires in {calculateTimeRemaining(item.expiresAt)}
                  </Text>
                )}
              </View>

            </View>

            {/* READ INDICATOR */}

            {item.unread && (
              <View style={styles.unreadIndicator}>
                <Ionicons
                  name="mail-unread-outline"
                  size={17}
                  color={item.type === 'OTP' ? '#10B981' : '#49769F'}
                />
              </View>
            )}

          </Pressable>

        ))}

        {/* ================= EMPTY STATE ================= */}

        {filtered.length === 0 && (

          <View style={styles.emptyState}>

            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color="#49769F"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No notifications
            </Text>

            <Text style={styles.emptySubtitle}>
              You're all caught up for now.
            </Text>

          </View>

        )}

        {/* ================= ALL READ ================= */}

        {filtered.length > 0 &&
          filtered.every((item) => !item.unread) && (

            <View style={styles.allReadBox}>

              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#49769F"
              />

              <Text style={styles.allReadText}>
                You're all caught up!
              </Text>

            </View>
          )}

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  /* ================= CONTAINER ================= */

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* ================= HEADER ================= */

  header: {
    height: 102,
    paddingTop:30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,

    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,

    backgroundColor: '#F8FAFC',

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  pressedButton: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2A2A2A',
  },

  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,

    backgroundColor: '#49769F',

    justifyContent: 'center',
    alignItems: 'center',

    marginLeft: 7,
    paddingHorizontal: 5,
  },

  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  markRead: {
    fontSize: 13,
    fontWeight: '600',
    color: '#49769F',
  },

  disabledMarkRead: {
    color: '#CBD5E1',
  },

  /* ================= TABS ================= */

  tabs: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,

    borderRadius: 20,

    backgroundColor: '#F3F4F6',

    marginRight: 10,
  },

  activeTab: {
    backgroundColor: '#49769F',
  },

  tabPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  tabText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 13,
  },

  activeTabText: {
    color: '#FFFFFF',
  },

  /* ================= CONTENT ================= */

  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  /* ================= NOTIFICATION CARD ================= */

  card: {
    flexDirection: 'row',

    backgroundColor: '#F8FAFC',

    borderWidth: 1,
    borderColor: '#E5E7EB',

    borderRadius: 18,

    padding: 16,

    marginBottom: 14,

    position: 'relative',
  },

  unreadCard: {
    backgroundColor: '#F1F7F9',
    borderColor: '#D6E4EE',
  },

  cardPressed: {
    opacity: 0.75,

    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  /* ================= ICON ================= */

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,

    backgroundColor: '#EAF3F8',

    justifyContent: 'center',
    alignItems: 'center',
  },

  unreadIconCircle: {
    backgroundColor: '#DCEAF2',
  },

  /* ================= TEXT ================= */

  textContainer: {
    flex: 1,

    marginLeft: 14,
    marginRight: 5,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A2A2A',
    flex: 1,
  },

  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,

    backgroundColor: '#49769F',

    marginLeft: 8,
  },

  message: {
    fontSize: 13,
    color: '#4B5563',

    lineHeight: 20,

    marginTop: 6,
  },

  time: {
    fontSize: 12,
    color: '#9CA3AF',

    marginTop: 10,

    fontWeight: '600',
  },

  unreadIndicator: {
    position: 'absolute',
    right: 13,
    bottom: 13,
  },

  /* ================= EMPTY ================= */

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',

    paddingVertical: 80,
  },

  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,

    backgroundColor: '#EAF3F8',

    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',

    color: '#2A2A2A',

    marginTop: 14,
  },

  emptySubtitle: {
    fontSize: 14,

    color: '#6B7280',

    marginTop: 6,
  },

  /* ================= ALL READ ================= */

  allReadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#F1F7F9',

    borderRadius: 14,

    paddingVertical: 14,

    marginTop: 5,
  },

  allReadText: {
    marginLeft: 8,

    fontSize: 13,

    color: '#49769F',

    fontWeight: '600',
  },

  /* ================= LOADING & ERROR ================= */

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },

  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 10,
  },

  errorText: {
    marginTop: 8,
    fontSize: 13,
    color: '#DC2626',
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  /* ================= OTP SPECIFIC ================= */

  otpCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#10B981',
    borderWidth: 2,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  otpIconCircle: {
    backgroundColor: '#D1FAE5',
    borderWidth: 2,
    borderColor: '#10B981',
  },

  pinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#10B981',
    borderStyle: 'dashed',
  },

  pinLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
    marginRight: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  pinText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 8,
    fontFamily: 'monospace',
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },

  expiryText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
    marginLeft: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

});