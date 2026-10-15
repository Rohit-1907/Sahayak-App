/**
 * NotificationButton Component
 * Simple button to enable push notifications
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../services/NotificationService';

const NotificationButton = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkNotificationStatus = async () => {
    const token = await AsyncStorage.getItem('@sahayak:push_token');
    setIsEnabled(!!token);
  };

  React.useEffect(() => {
    checkNotificationStatus();
  }, []);

  const enableNotifications = async () => {
    setLoading(true);
    try {
      console.log('[NOTIF] User tapped Enable Notifications button');
      const result = await NotificationService.initialize();
      
      if (result) {
        setIsEnabled(true);
        Alert.alert(
          'Success! ',
          'Push notifications are now enabled. You will receive alerts for OTPs and job updates!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Permission Denied',
          'Please enable notification permissions in your device settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      Alert.alert(
        'Error',
        'Failed to enable notifications. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (isEnabled) {
    // Show re-register option
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.enabledContainer}
          onPress={enableNotifications}
          disabled={loading}
        >
          <MaterialCommunityIcons name="bell-check" size={20} color="#4CAF50" />
          <Text style={styles.enabledText}>
            {loading ? 'Re-registering...' : 'Notifications Enabled  (Tap to refresh)'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={enableNotifications}
      disabled={loading}
    >
      <MaterialCommunityIcons name="bell-ring" size={20} color="#FFFFFF" />
      <Text style={styles.buttonText}>
        {loading ? 'Enabling...' : 'Enable Push Notifications'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F6CC5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 10,
    marginHorizontal: 20,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  enabledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 10,
    marginHorizontal: 20,
    gap: 8,
  },
  enabledText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationButton;

