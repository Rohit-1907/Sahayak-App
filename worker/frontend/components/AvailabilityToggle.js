/**
 * AvailabilityToggle Component
 * Allows worker to toggle their availability for work
 * Automatically updates current location when turning availability ON
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import { WORKER_ENDPOINTS } from '../config/api';
import { translate } from '../utils/translations';

const PURPLE = '#49769F';

export default function AvailabilityToggle({ initialStatus = false, onStatusChange, language = "English" }) {
  const [isAvailable, setIsAvailable] = useState(initialStatus); // Render default status immediately; server/cache corrects it in background
  const [isLoading, setIsLoading] = useState(true); // Start as loading
  const [locationInfo, setLocationInfo] = useState(null);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  useEffect(() => {
    // Only fetch if we haven't fetched before in this session
    if (!hasFetchedOnce) {
      fetchWorkerStatus();
    }
  }, [hasFetchedOnce]);

  /**
   * Fetch current worker availability status
   */
  const fetchWorkerStatus = async () => {
    try {
      setIsLoading(true);
      
      // First check if we have cached status
      const cachedStatus = await AsyncStorage.getItem('worker_availability_status');
      if (cachedStatus !== null) {
        const cached = JSON.parse(cachedStatus);
        setIsAvailable(cached.is_available);
        if (cached.location) {
          setLocationInfo(cached.location);
        }
        setHasFetchedOnce(true);
        setIsLoading(false);
        // Still fetch from backend in background to update cache
      }

      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        if (cachedStatus === null) {
          setIsAvailable(initialStatus);
        }
        setIsLoading(false);
        setHasFetchedOnce(true);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      let response;
      try {
        response = await fetch(WORKER_ENDPOINTS.STATUS, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const data = await response.json();

      if (data.success) {
        setIsAvailable(data.is_available);
        if (data.current_location) {
          setLocationInfo(data.current_location);
        }
        
        // Cache the status
        await AsyncStorage.setItem('worker_availability_status', JSON.stringify({
          is_available: data.is_available,
          location: data.current_location,
          cached_at: new Date().toISOString(),
        }));
      } else {
        // Fallback to initialStatus if API fails
        if (cachedStatus === null) {
          setIsAvailable(initialStatus);
        }
      }
    } catch (error) {
      console.error('Error fetching worker status:', error);
      // Use cached or fallback
      const cachedStatus = await AsyncStorage.getItem('worker_availability_status');
      if (cachedStatus === null) {
        setIsAvailable(initialStatus);
      }
    } finally {
      setIsLoading(false);
      setHasFetchedOnce(true);
    }
  };

  /**
   * Get current GPS location
   */
  const getCurrentLocation = async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required to turn availability ON. This helps clients find you.',
          [{ text: 'OK' }]
        );
        return null;
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again.',
        [{ text: 'OK' }]
      );
      return null;
    }
  };

  /**
   * Toggle availability status
   */
  const handleToggle = async (newValue) => {
    // If turning ON, get current location first
    if (newValue) {
      setIsLoading(true);
      
      const location = await getCurrentLocation();
      
      if (!location) {
        setIsLoading(false);
        return; // Permission denied or error
      }

      // Send to backend with location
      await updateAvailability(true, location);
    } else {
      // Turning OFF - confirm with user
      Alert.alert(
        'Turn OFF Availability',
        'You will no longer appear in client searches. Are you sure?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Turn OFF',
            style: 'destructive',
            onPress: () => updateAvailability(false, null),
          },
        ]
      );
    }
  };

  /**
   * Update availability status on backend
   */
  const updateAvailability = async (available, location) => {
    try {
      setIsLoading(true);

      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        Alert.alert('Error', 'Authentication required. Please login again.');
        setIsLoading(false);
        return;
      }

      const requestData = {
        is_available: available,
      };

      // Add location if turning ON
      if (available && location) {
        requestData.current_latitude = location.latitude;
        requestData.current_longitude = location.longitude;
      }

      const response = await fetch(WORKER_ENDPOINTS.TOGGLE_AVAILABILITY, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        setIsAvailable(available);
        
        if (available && data.current_location) {
          setLocationInfo({
            latitude: data.current_location.latitude,
            longitude: data.current_location.longitude,
            updated_at: data.location_updated_at,
          });
        } else {
          setLocationInfo(null);
        }

        // Update cache
        await AsyncStorage.setItem('worker_availability_status', JSON.stringify({
          is_available: available,
          location: available ? data.current_location : null,
          cached_at: new Date().toISOString(),
        }));

        // Notify parent component
        if (onStatusChange) {
          onStatusChange(available);
        }

        Alert.alert(
          'Success',
          available 
            ? 'You are now available for work. Clients can find you!' 
            : 'You are now unavailable. You won\'t appear in searches.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to update availability.');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      Alert.alert('Error', 'Failed to update availability. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Manually refresh location (while already available)
   */
  const refreshLocation = async () => {
    if (!isAvailable) {
      Alert.alert('Info', 'Turn availability ON to update your location.');
      return;
    }

    setIsLoading(true);
    const location = await getCurrentLocation();

    if (location) {
      try {
        const token = await AsyncStorage.getItem('access_token');

        const response = await fetch(WORKER_ENDPOINTS.UPDATE_LOCATION, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            current_latitude: location.latitude,
            current_longitude: location.longitude,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setLocationInfo({
            latitude: data.current_location.latitude,
            longitude: data.current_location.longitude,
            updated_at: data.location_updated_at,
          });

          Alert.alert('Success', 'Location updated successfully!');
        }
      } catch (error) {
        console.error('Error updating location:', error);
      }
    }

    setIsLoading(false);
  };

  /**
   * Format timestamp
   */
  const formatLocationTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hr ago`;
      return `${Math.floor(diffMins / 1440)} days ago`;
    } catch {
      return 'Unknown';
    }
  };

  return (
    <View style={styles.container}>
      {/* Show loading indicator only when no status can be shown yet */}
      {isLoading && isAvailable === null ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={PURPLE} />
          <Text style={styles.loadingText}>Loading availability status...</Text>
        </View>
      ) : (
        <>
          {/* Main Toggle */}
          <View style={styles.toggleRow}>
        <View style={styles.toggleInfo}>
          <View style={styles.titleRow}>
            <MaterialCommunityIcons
              name={isAvailable ? 'check-circle' : 'close-circle'}
              size={moderateScale(24)}
              color={isAvailable ? '#4CAF50' : '#9AA4AF'}
            />
            <Text style={styles.title}>{translate('availableForWork', language)}</Text>
          </View>

<Text style={styles.description}>
{isAvailable
  ? translate('visibleToClients', language)
  : translate('turnOnToReceiveRequests', language)}
</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="small" color={PURPLE} />
        ) : (
          <Switch
            value={isAvailable}
            onValueChange={handleToggle}
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor={isAvailable ? PURPLE : '#F3F4F6'}
            ios_backgroundColor="#D1D5DB"
          />
        )}
      </View>

      {/* Status Indicator */}
      <View style={[styles.statusBar, isAvailable ? styles.statusBarActive : styles.statusBarInactive]}>
        <MaterialCommunityIcons
          name={isAvailable ? 'account-check' : 'account-off'}
          size={moderateScale(18)}
          color={isAvailable ? '#4CAF50' : '#6B7280'}
        />
        <Text style={[styles.statusText, isAvailable ? styles.statusTextActive : styles.statusTextInactive]}>
          {isAvailable ? 'ACTIVE - Clients can see you' : 'INACTIVE - Not visible to clients'}
        </Text>
      </View>

      {/* Help Text */}
      <View style={styles.helpBox}>
        <MaterialCommunityIcons
          name="information-outline"
          size={moderateScale(16)}
          color="#6B7280"
        />
        <Text style={styles.helpText}>
          {isAvailable
            ? 'Your location updates automatically when you turn availability ON. Refresh if you\'ve moved.'
            : 'Turn ON availability to let clients find you. We\'ll use your current GPS location.'}
        </Text>
      </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginVertical: verticalScale(12),
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(20),
  },

  loadingText: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    marginLeft: moderateScale(12),
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(12),
  },

  toggleInfo: {
    flex: 1,
    marginRight: moderateScale(12),
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },

  title: {
    fontSize: moderateScale(17),
    fontWeight: '600',
    color: '#222222',
    marginLeft: moderateScale(8),
  },

  description: {
    fontSize: moderateScale(13),
    color: '#6B7280',
    lineHeight: moderateScale(18),
  },

  // Status Bar
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(10),
    paddingHorizontal: moderateScale(12),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(12),
  },

  statusBarActive: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },

  statusBarInactive: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  statusText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    marginLeft: moderateScale(8),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  statusTextActive: {
    color: '#16A34A',
  },

  statusTextInactive: {
    color: '#6B7280',
  },

  // Location Card
  locationCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: verticalScale(12),
  },

  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },

  locationTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: PURPLE,
    marginLeft: moderateScale(6),
  },

  locationDetails: {
    marginBottom: verticalScale(10),
  },

  locationCoords: {
    fontSize: moderateScale(13),
    color: '#374151',
    marginBottom: verticalScale(4),
  },

  locationTime: {
    fontSize: moderateScale(12),
    color: '#6B7280',
  },

  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: verticalScale(6),
  },

  refreshText: {
    fontSize: moderateScale(13),
    color: PURPLE,
    fontWeight: '600',
    marginLeft: moderateScale(4),
  },

  // Help Box
  helpBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: moderateScale(8),
    padding: moderateScale(10),
  },

  helpText: {
    flex: 1,
    fontSize: moderateScale(12),
    color: '#6B7280',
    lineHeight: moderateScale(16),
    marginLeft: moderateScale(8),
  },
});
