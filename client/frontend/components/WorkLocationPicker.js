/**
 * WorkLocationPicker Component
 * Allows client to select where the work will be performed
 * - Option 1: Use current GPS location
 * - Option 2: Manually enter/search work location
 * 
 * IMPORTANT: This is the work location, not necessarily the client's home address
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
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { scale, verticalScale, moderateScale, wp } from '../utils/responsive';

const PURPLE = '#49769F';

export default function WorkLocationPicker({ onLocationSelected, initialLocation, visible, onClose }) {
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [manualAddress, setManualAddress] = useState(initialLocation?.address || '');
  const [manualCity, setManualCity] = useState(initialLocation?.city || '');
  const [manualLandmark, setManualLandmark] = useState(initialLocation?.landmark || '');

  /**
   * Get current GPS location
   */
  const useCurrentLocation = async () => {
    try {
      setLoading(true);

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is needed to use your current location. You can enter the work location manually instead.',
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
          isCurrentLocation: true,
        };

        setSelectedLocation(location);

        if (onLocationSelected) {
          onLocationSelected(location);
        }

        Alert.alert(
          'Location Set',
          `Work location set to:\n${location.address}\n\nIs this where the work needs to be done?`,
          [
            { text: 'Change', style: 'cancel', onPress: () => setSelectedLocation(null) },
            { text: 'Confirm', onPress: () => onClose && onClose() },
          ]
        );
      } else {
        // No address found, use coordinates
        const location = {
          address: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
          city: '',
          state: '',
          latitude,
          longitude,
          isCurrentLocation: true,
        };

        setSelectedLocation(location);

        if (onLocationSelected) {
          onLocationSelected(location);
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try entering the work location manually.',
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
      Alert.alert('Required', 'Please enter the work location address.');
      return;
    }

    if (!manualCity.trim()) {
      Alert.alert('Required', 'Please enter the city.');
      return;
    }

    // For manual entry, we don't have exact coordinates
    // Backend can geocode this later or use approximate city center
    const location = {
      address: manualAddress.trim(),
      city: manualCity.trim(),
      landmark: manualLandmark.trim(),
      state: '', // Can be added as optional field
      latitude: null, // Will be geocoded by backend if needed
      longitude: null,
      isCurrentLocation: false,
    };

    setSelectedLocation(location);

    if (onLocationSelected) {
      onLocationSelected(location);
    }

    Alert.alert(
      'Location Saved',
      `Work location set to:\n${location.address}, ${location.city}`,
      [{ text: 'OK', onPress: () => onClose && onClose() }]
    );
  };

  /**
   * Clear selected location
   */
  const clearLocation = () => {
    setSelectedLocation(null);
    setManualAddress('');
    setManualCity('');
    setManualLandmark('');

    if (onLocationSelected) {
      onLocationSelected(null);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={moderateScale(24)} color="#222222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Work Location</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.infoBox}>
            <MaterialCommunityIcons
              name="information-outline"
              size={moderateScale(20)}
              color={PURPLE}
            />
            <Text style={styles.infoText}>
              Select where the work needs to be performed. This helps us find nearby workers.
            </Text>
          </View>

          {/* Selected Location Display */}
          {selectedLocation && (
            <View style={styles.selectedBox}>
              <View style={styles.selectedHeader}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={moderateScale(22)}
                  color="#4CAF50"
                />
                <Text style={styles.selectedTitle}>Work Location Set</Text>
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

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.confirmButton}
                onPress={onClose}
              >
                <Text style={styles.confirmButtonText}>Confirm & Continue</Text>
                <MaterialCommunityIcons name="arrow-right" size={moderateScale(20)} color="#FFFFFF" />
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
                onPress={useCurrentLocation}
                disabled={loading}
              >
                <View style={styles.optionIcon}>
                  {loading ? (
                    <ActivityIndicator size="small" color={PURPLE} />
                  ) : (
                    <MaterialCommunityIcons
                      name="crosshairs-gps"
                      size={moderateScale(28)}
                      color={PURPLE}
                    />
                  )}
                </View>

                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Use My Current Location</Text>
                  <Text style={styles.optionDescription}>
                    Work will be done at my current location
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
                <Text style={styles.manualTitle}>Enter Work Location</Text>
                <Text style={styles.manualSubtitle}>
                  If work is at a different location, enter the address below
                </Text>

                <Text style={styles.inputLabel}>Work Address *</Text>
                <View style={styles.inputBox}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={moderateScale(20)}
                    color={PURPLE}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., 123 Main Street, Dighi"
                    placeholderTextColor="#9AA4AF"
                    value={manualAddress}
                    onChangeText={setManualAddress}
                    multiline
                  />
                </View>

                <Text style={styles.inputLabel}>Landmark (Optional)</Text>
                <View style={styles.inputBox}>
                  <MaterialCommunityIcons
                    name="map-marker-radius"
                    size={moderateScale(20)}
                    color={PURPLE}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., Near ABC Mall"
                    placeholderTextColor="#9AA4AF"
                    value={manualLandmark}
                    onChangeText={setManualLandmark}
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
                  <Text style={styles.saveButtonText}>Save Work Location</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(16),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingTop: verticalScale(50), // Account for status bar
  },

  closeButton: {
    width: scale(40),
    height: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#222222',
  },

  headerSpacer: {
    width: scale(40),
  },

  content: {
    flex: 1,
    padding: moderateScale(16),
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EEF4F8',
    borderRadius: moderateScale(10),
    padding: moderateScale(14),
    marginBottom: verticalScale(20),
  },

  infoText: {
    flex: 1,
    fontSize: moderateScale(13),
    color: '#374151',
    lineHeight: moderateScale(18),
    marginLeft: moderateScale(10),
  },

  // Selected Location
  selectedBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    borderWidth: 1,
    borderColor: '#4CAF50',
  },

  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },

  selectedTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: moderateScale(8),
  },

  selectedAddress: {
    fontSize: moderateScale(15),
    color: '#222222',
    fontWeight: '500',
    marginBottom: verticalScale(6),
  },

  selectedCity: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    marginBottom: verticalScale(6),
  },

  selectedCoords: {
    fontSize: moderateScale(12),
    color: '#9AA4AF',
    marginBottom: verticalScale(12),
  },

  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: verticalScale(8),
    marginBottom: verticalScale(12),
  },

  clearText: {
    fontSize: moderateScale(14),
    color: '#E53935',
    marginLeft: moderateScale(6),
    fontWeight: '500',
  },

  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PURPLE,
    borderRadius: moderateScale(10),
    minHeight: verticalScale(50),
    paddingVertical: verticalScale(14),
  },

  confirmButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: moderateScale(8),
  },

  // Option Buttons
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: verticalScale(16),
  },

  optionIcon: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: '#EEF4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(14),
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#222222',
    marginBottom: verticalScale(4),
  },

  optionDescription: {
    fontSize: moderateScale(13),
    color: '#6B7280',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(20),
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },

  dividerText: {
    fontSize: moderateScale(13),
    color: '#9AA4AF',
    marginHorizontal: moderateScale(16),
    fontWeight: '600',
  },

  // Manual Entry
  manualSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },

  manualTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#222222',
    marginBottom: verticalScale(4),
  },

  manualSubtitle: {
    fontSize: moderateScale(13),
    color: '#6B7280',
    marginBottom: verticalScale(16),
  },

  inputLabel: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    color: '#374151',
    marginBottom: verticalScale(8),
    marginTop: verticalScale(12),
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
    minHeight: verticalScale(50),
    marginTop: verticalScale(20),
    paddingVertical: verticalScale(14),
  },

  saveButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: moderateScale(8),
  },
});
