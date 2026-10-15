/**
 * NotificationService - Firebase Cloud Messaging Integration
 * 
 * Handles push notification setup, token registration, and notification handling
 * for the Sahayak Client mobile app using Expo Notifications.
 */

import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const TOKEN_STORAGE_KEY = '@sahayak:push_token';
const PENDING_REGISTRATION_KEY = '@sahayak:pending_token_registration';

// Configure notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
    this.isInitialized = false;
  }

  /**
   * Initialize notification service.
   * Requests permissions, registers token, sets up listeners.
   * @param {Object} options - { isLogin: boolean, force: boolean }
   */
  async initialize(options = {}) {
    const isLogin = options && options.isLogin === true;

    // If already initialized in this session and not a fresh login/force, skip
    if (this.isInitialized && !isLogin && !options?.force) {
      console.log('ℹ️ NotificationService already initialized, skipping duplicate init');
      return true;
    }

    console.log(`[NOTIF] Initializing NotificationService (isLogin=${isLogin})...`);
    
    // Request permissions
    const permissionGranted = await this.requestPermissions();
    
    if (!permissionGranted) {
      console.log('[WARN]  Notification permissions denied');
      this.showPermissionDeniedAlert();
      return false;
    }

    // Configure Android notification channel
    if (Platform.OS === 'android') {
      await this.setupAndroidChannel();
    }

    // Get and register token
    try {
      await this.registerPushToken({ isLogin });
    } catch (error) {
      console.error('[FAIL] Failed to register push token:', error);
    }

    // Setup listeners if not already setup
    if (!this.notificationListener) {
      this.setupListeners();
    }

    this.isInitialized = true;
    console.log('[OK] NotificationService initialized');
    return true;
  }

  /**
   * Request notification permissions from OS.
   */
  async requestPermissions() {
    if (!Device.isDevice) {
      console.log('[WARN]  Must use physical device for push notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  /**
   * Show alert when permissions are denied
   */
  showPermissionDeniedAlert() {
    Alert.alert(
      'Notifications Disabled',
      'Please enable notifications in your device settings to receive important updates about your bookings and OTP codes.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Settings', 
          onPress: () => Linking.openSettings() 
        }
      ]
    );
  }

  /**
   * Configure Android notification channel with high priority.
   */
  async setupAndroidChannel() {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      // sound: 'default', // Removed - use system default

      lightColor: '#1F6CC5',
    });
    
    console.log('[OK] Android notification channel configured');
  }

    /**
   * Get FCM push token and register with backend.
   * For development builds, we use Firebase directly.
   */
  async registerPushToken(options = {}) {
    const isLogin = options && options.isLogin === true;
    try {
      // For development builds with google-services.json, 
      // we can skip projectId and use device's push token directly
      console.log('[DEV] Requesting notification token...');
      
      // Request permission first
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('[WARN]  Permissions not granted, requesting...');
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          throw new Error('Notification permissions denied');
        }
      }

      // Get device push token (works with development builds)
      const tokenData = await Notifications.getDevicePushTokenAsync();
      const pushToken = tokenData.data;
      
      console.log('[DEV] Got device push token:', pushToken.substring(0, 50) + '...');

      // Get device info
      const deviceInfo = {
        token: pushToken,
        device_type: Platform.OS,
        device_name: Device.deviceName || `${Device.brand} ${Device.modelName}`,
        is_login: isLogin,
        send_welcome: isLogin,
      };

      // Save token locally
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, pushToken);

      // Register with backend
      await this.registerTokenWithBackend(deviceInfo);

      return pushToken;
    } catch (error) {
      console.error('[FAIL] Error registering push token:', error);
      console.error('Error details:', error.message);
      
      // Cache token for retry when online
      if (error.message && (error.message.includes('network') || error.message.includes('fetch'))) {
        console.log('[NOTE] Network error - will retry when online');
      }
      
      throw error;
    }
  }

  /**
   * Register token with backend API (with retry logic).
   */
  async registerTokenWithBackend(deviceInfo, retryCount = 0) {
    const MAX_RETRIES = 3;
    const BACKOFF_BASE = 1000; // 1 second

    try {
      const token = await AsyncStorage.getItem('access_token');
      
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/register-token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(deviceInfo),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[OK] Token registered with backend:', data.message);
      
      // Clear pending registration if exists
      await AsyncStorage.removeItem(PENDING_REGISTRATION_KEY);
      
      return data;
    } catch (error) {
      console.error(`[FAIL] Failed to register token (attempt ${retryCount + 1}/${MAX_RETRIES}):`, error);

      if (retryCount < MAX_RETRIES) {
        // Exponential backoff: 1s, 2s, 4s
        const backoffDelay = BACKOFF_BASE * Math.pow(2, retryCount);
        console.log(`[WAIT] Retrying in ${backoffDelay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return this.registerTokenWithBackend(deviceInfo, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Retry pending token registration (called when connectivity restored).
   */
  async retryPendingRegistration() {
    const pending = await AsyncStorage.getItem(PENDING_REGISTRATION_KEY);
    
    if (pending) {
      try {
        const deviceInfo = JSON.parse(pending);
        console.log('[REFRESH] Retrying pending token registration...');
        await this.registerTokenWithBackend(deviceInfo);
      } catch (error) {
        console.error('[FAIL] Failed to retry pending registration:', error);
      }
    }
  }

  /**
   * Setup notification listeners for received and response events.
   */
  setupListeners() {
    // Listener for notifications received while app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('[NOTIF] Notification received (foreground):', notification.request.content.title);
      this.logNotificationEvent('received_foreground', notification);
    });

    // Listener for user tapping on notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('[TAP] Notification tapped:', response.notification.request.content.title);
      this.logNotificationEvent('tapped', response.notification);
      this.handleNotificationTap(response);
    });
    
    console.log('[OK] Notification listeners set up');
  }

  /**
   * Handle notification tap - navigate to appropriate screen.
   */
  handleNotificationTap(response) {
    const { notification } = response;
    const data = notification.request.content.data || {};

    // Import navigation dynamically to avoid circular dependencies
    const { navigate } = require('../navigation/NavigationService');

    console.log('[NAV] Navigating based on notification type:', data.type, data);

    switch (data.type) {
      case 'otp':
        navigate('notifications', { highlightOtp: data.otp_id });
        break;

      case 'new_job_request':
      case 'job_accepted':
      case 'job_rejected':
      case 'job_started':
      case 'job_completed':
      case 'job_cancelled':
      case 'job_update':
        if (data.work_request_id) {
          navigate('bookingSummary', { requestId: data.work_request_id });
        } else {
          navigate('myRequests');
        }
        break;

      case 'message':
        navigate('messages', { conversationId: data.related_id });
        break;

      default:
        navigate('notifications');
    }
  }

  /**
   * Log notification event for debugging.
   */
  logNotificationEvent(eventType, notification) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: eventType,
      type: notification.request.content.data?.type,
      title: notification.request.content.title,
    };
    
    console.log('[STATS] Notification event:', logEntry);
  }

  async unregisterPushToken() {
    this.isInitialized = false;
    try {
      const pushToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      const authToken = await AsyncStorage.getItem('access_token');
      
      if (pushToken && authToken) {
        const response = await fetch(`${API_BASE_URL}/api/v1/notifications/unregister-token/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({ token: pushToken }),
        });

        if (response.ok) {
          await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
          console.log('[OK] Token unregistered successfully');
        }
      }
    } catch (error) {
      console.error('[FAIL] Error unregistering token:', error);
    }
  }

  /**
   * Mark notification as read.
   */
  async markAsRead(notificationId) {
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      await fetch(`${API_BASE_URL}/api/v1/notifications/${notificationId}/mark-read/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      // Update badge count
      const unreadCount = await this.getUnreadCount();
      await Notifications.setBadgeCountAsync(unreadCount);
      
      console.log('[OK] Notification marked as read');
    } catch (error) {
      console.error('[FAIL] Error marking notification as read:', error);
    }
  }

  /**
   * Get unread notification count from API.
   */
  async getUnreadCount() {
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/?is_read=false`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.count || 0;
      }
      
      return 0;
    } catch (error) {
      console.error('[FAIL] Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Reset initialization state (e.g. on logout)
   */
  reset() {
    this.isInitialized = false;
    console.log('[REFRESH] NotificationService state reset');
  }

  /**
   * Cleanup listeners.
   */
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
    this.isInitialized = false;
    console.log('[CLEAN] NotificationService cleaned up');
  }
}

export default new NotificationService();




