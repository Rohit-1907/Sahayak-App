/**
 * LocationPicker Component
 * Allows worker to select their primary service location during registration
 * - Option 1: Use current GPS location
 * - Option 2: Manually enter location
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { scale, verticalScale, moderateScale, wp } from '../utils/responsive';

const PURPLE = '#49769F';

export default function LocationPicker({ onLocationSelected, initialLocation }) {
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [manualAddress, setManualAddress] = useState(initialLocation?.address || '');
  const [manualCity, setManualCity] = useState(initialLocation?.city || '');

  /**
   * Get current GPS location
   */
  const getCurrentLocation = async () => {
    try {
      setLoading(true);

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use current location. You can enter your location manually instead.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode to get address
      const addressResults = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addressResults && addressResults.length > 0) {
        const addr = addressResults[0];
        const formattedAddress = [
          addr.street,
          addr.subregion,
          addr.city,
          addr.region,
        ]
          .filter(Boolean)
          .join(', ');

        const location = {
          address: formattedAddress || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          city: addr.city || addr.subregion || '',
          state: addr.region || '',
          latitude,
          longitude,
        };

        setSelectedLocation(location);
        setManualAddress(location.address);
        setManualCity(location.city);

        if (onLocationSelected) {
          onLocationSelected(location);
        }

        Alert.alert(
          'Location Detected',
          `Your location has been set to:\n${location.address}`,
          [{ text: 'OK' }]
        );
      } else {
        // No address found, use coordinates
        const location = {
          address: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
          city: '',
          state: '',
          latitude,
          longitude,
        };

        setSelectedLocation(location);
        setManualAddress(location.address);

        if (onLocationSelected) {
          onLocationSelected(location);
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again or enter manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save manually entered location
   */
  const saveManualLocation = () => {
    if (!manualAddress.trim()) {
      Alert.alert('Required', 'Please enter your service location address.');
      return;
    }

    if (!manualCity.trim()) {
      Alert.alert('Required', 'Please enter your city.');
      return;
    }

    // For manual entry, we don't have exact coordinates
    // Backend can geocode this later, or we can use a geocoding API
    const location = {
      address: manualAddress.trim(),
      city: manualCity.trim(),
      state: '', // Can be added as optional field
      latitude: null, // Will be geocoded by backend if needed
      longitude: null,
    };

    setSelectedLocation(location);

    if (onLocationSelected) {
      onLocationSelected(location);
    }

    Alert.alert(
      'Location Saved',
      `Your service location has been set to:\n${location.address}, ${location.city}`,
      [{ text: 'OK' }]
    );
  };

  /**
   * Clear selected location
   */
  const clearLocation = () => {
    setSelectedLocation(null);
    setManualAddress('');
    setManualCity('');

    if (onLocationSelected) {
      onLocationSelected(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="map-marker" size={moderateScale(24)} color={PURPLE} />
        <Text style={styles.title}>Primary Service Location</Text>
      </View>

      <Text style={styles.description}>
        This is your base service area. Clients will see you as available in this location.
      </Text>

      {/* Selected Location Display */}
      {selectedLocation && (
        <View style={styles.selectedBox}>
          <View style={styles.selectedHeader}>
            <MaterialCommunityIcons
              name="check-circle"
              size={moderateScale(20)}
              color="#4CAF50"
            />
            <Text style={styles.selectedTitle}>Location Set</Text>
          </View>

          <Text style={styles.selectedAddress}>{selectedLocation.address}</Text>
          {selectedLocation.city && (
            <Text style={styles.selectedCity}>{selectedLocation.city}</Text>
          )}

          {selectedLocation.latitude && selectedLocation.longitude && (
            <Text style={styles.selectedCoords}>
               {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
            </Text>
          )}

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.clearButton}
            onPress={clearLocation}
          >
            <MaterialCommunityIcons name="close-circle" size={moderateScale(18)} color="#E53935" />
            <Text style={styles.clearText}>Change Location</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Location Options */}
      {!selectedLocation && (
        <>
          {/* Option 1: Use Current Location */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.optionButton}
            onPress={getCurrentLocation}
            disabled={loading}
          >
            <View style={styles.optionIcon}>
              {loading ? (
                <ActivityIndicator size="small" color={PURPLE} />
              ) : (
                <MaterialCommunityIcons
                  name="crosshairs-gps"
                  size={moderateScale(24)}
                  color={PURPLE}
                />
              )}
            </View>

            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Use My Current Location</Text>
              <Text style={styles.optionDescription}>
                Get your location automatically using GPS
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={moderateScale(24)}
              color="#9AA4AF"
            />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Option 2: Manual Entry */}
          <View style={styles.manualSection}>
            <Text style={styles.manualTitle}>Enter Location Manually</Text>

            <Text style={styles.inputLabel}>Service Area Address *</Text>
            <View style={styles.inputBox}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={moderateScale(20)}
                color={PURPLE}
              />
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Dighi, Near ABC Mall"
                placeholderTextColor="#9AA4AF"
                value={manualAddress}
                onChangeText={setManualAddress}
                multiline
              />
            </View>

            <Text style={styles.inputLabel}>City *</Text>
            <View style={styles.inputBox}>
              <MaterialCommunityIcons
                name="city"
                size={moderateScale(20)}
                color={PURPLE}
              />
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Pune"
                placeholderTextColor="#9AA4AF"
                value={manualCity}
                onChangeText={setManualCity}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.saveButton}
              onPress={saveManualLocation}
            >
              <MaterialCommunityIcons
                name="content-save"
                size={moderateScale(20)}
                color="#FFFFFF"
              />
              <Text style={styles.saveButtonText}>Save Location</Text>
            </TouchableOpacity>
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
    marginVertical: verticalScale(8),
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
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
    marginBottom: verticalScale(16),
  },

  // Selected Location
  selectedBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: moderateScale(10),
    padding: moderateScale(14),
    borderWidth: 1,
    borderColor: '#4CAF50',
  },

  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },

  selectedTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: moderateScale(6),
  },

  selectedAddress: {
    fontSize: moderateScale(14),
    color: '#222222',
    fontWeight: '500',
    marginBottom: verticalScale(4),
  },

  selectedCity: {
    fontSize: moderateScale(13),
    color: '#6B7280',
    marginBottom: verticalScale(4),
  },

  selectedCoords: {
    fontSize: moderateScale(12),
    color: '#9AA4AF',
    marginBottom: verticalScale(10),
  },

  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: verticalScale(6),
  },

  clearText: {
    fontSize: moderateScale(13),
    color: '#E53935',
    marginLeft: moderateScale(4),
    fontWeight: '500',
  },

  // Option Buttons
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: moderateScale(10),
    padding: moderateScale(14),
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: verticalScale(12),
  },

  optionIcon: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#222222',
    marginBottom: verticalScale(4),
  },

  optionDescription: {
    fontSize: moderateScale(12),
    color: '#6B7280',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(16),
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },

  dividerText: {
    fontSize: moderateScale(12),
    color: '#9AA4AF',
    marginHorizontal: moderateScale(12),
    fontWeight: '500',
  },

  // Manual Entry
  manualSection: {
    marginTop: verticalScale(4),
  },

  manualTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#222222',
    marginBottom: verticalScale(12),
  },

  inputLabel: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    color: '#374151',
    marginBottom: verticalScale(6),
    marginTop: verticalScale(8),
  },

  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: moderateScale(10),
    minHeight: verticalScale(50),
    paddingHorizontal: moderateScale(14),
    paddingVertical: verticalScale(12),
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },

  textInput: {
    flex: 1,
    fontSize: moderateScale(14),
    color: '#222222',
    marginLeft: moderateScale(10),
    paddingVertical: 0,
  },

  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PURPLE,
    borderRadius: moderateScale(10),
    minHeight: verticalScale(48),
    marginTop: verticalScale(16),
    paddingVertical: verticalScale(12),
  },

  saveButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: moderateScale(8),
  },
});
