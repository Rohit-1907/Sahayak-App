/**
 * WorkRequestScreen
 * Client specifies work details and location before searching for workers
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale, wp } from '../utils/responsive';
import WorkLocationPicker from '../components/WorkLocationPicker';

const PURPLE = '#49769F';

export default function WorkRequestScreen({ route, navigation }) {
  const { serviceType = 'Electrician' } = route?.params || {};

  const [workLocation, setWorkLocation] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [description, setDescription] = useState('');
  const [numberOfWorkers, setNumberOfWorkers] = useState('1');
  const [requiredDate, setRequiredDate] = useState('');
  const [searchRadius, setSearchRadius] = useState(20); // km

  /**
   * Handle location selection
   */
  const handleLocationSelected = (location) => {
    setWorkLocation(location);
  };

  /**
   * Search for available workers
   */
  const searchWorkers = () => {
    // Validate inputs
    if (!workLocation) {
      Alert.alert('Required', 'Please select where the work needs to be done.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Required', 'Please describe the work you need.');
      return;
    }

    // Navigate to available workers screen with search parameters
    navigation.navigate('AvailableWorkersScreen', {
      service_category: serviceType,
      work_location: {
        address: workLocation.address,
        city: workLocation.city,
        landmark: workLocation.landmark,
        latitude: workLocation.latitude,
        longitude: workLocation.longitude,
      },
      description: description.trim(),
      number_of_workers: parseInt(numberOfWorkers) || 1,
      required_date: requiredDate,
      search_radius: searchRadius,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={moderateScale(24)} color="#222222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request {serviceType}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Service Info */}
        <View style={styles.serviceCard}>
          <View style={styles.serviceIcon}>
            <MaterialCommunityIcons
              name="flash"
              size={moderateScale(28)}
              color={PURPLE}
            />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle}>{serviceType} Service</Text>
            <Text style={styles.serviceSubtitle}>Professional {serviceType.toLowerCase()} work</Text>
          </View>
        </View>

        {/* Work Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Where is the work needed?</Text>
          <Text style={styles.sectionSubtitle}>
            Select the location where the work will be performed
          </Text>

          {workLocation ? (
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <MaterialCommunityIcons
                  name="map-marker-check"
                  size={moderateScale(22)}
                  color="#4CAF50"
                />
                <Text style={styles.locationTitle}>Work Location Set</Text>
              </View>

              <Text style={styles.locationAddress}>{workLocation.address}</Text>
              {workLocation.city && (
                <Text style={styles.locationCity}>{workLocation.city}</Text>
              )}

              {workLocation.latitude && workLocation.longitude && (
                <View style={styles.locationBadge}>
                  <MaterialCommunityIcons name="crosshairs-gps" size={moderateScale(14)} color={PURPLE} />
                  <Text style={styles.locationBadgeText}>GPS Location</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.changeLocationButton}
                onPress={() => setShowLocationPicker(true)}
              >
                <MaterialCommunityIcons name="pencil" size={moderateScale(16)} color={PURPLE} />
                <Text style={styles.changeLocationText}>Change Location</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.selectLocationButton}
              onPress={() => setShowLocationPicker(true)}
            >
              <MaterialCommunityIcons
                name="map-marker-plus"
                size={moderateScale(24)}
                color={PURPLE}
              />
              <Text style={styles.selectLocationText}>Select Work Location</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={moderateScale(20)}
                color="#9AA4AF"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Work Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Description</Text>
          <Text style={styles.sectionSubtitle}>
            Briefly describe what work you need done
          </Text>

          <View style={styles.inputBox}>
            <MaterialCommunityIcons
              name="text"
              size={moderateScale(20)}
              color={PURPLE}
            />
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Install ceiling fan in bedroom"
              placeholderTextColor="#9AA4AF"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Number of Workers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Workers Needed</Text>

          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => {
                const num = parseInt(numberOfWorkers) || 1;
                if (num > 1) setNumberOfWorkers(String(num - 1));
              }}
            >
              <MaterialCommunityIcons name="minus" size={moderateScale(20)} color={PURPLE} />
            </TouchableOpacity>

            <Text style={styles.counterText}>{numberOfWorkers}</Text>

            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => {
                const num = parseInt(numberOfWorkers) || 1;
                if (num < 10) setNumberOfWorkers(String(num + 1));
              }}
            >
              <MaterialCommunityIcons name="plus" size={moderateScale(20)} color={PURPLE} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Radius */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Radius</Text>
          <Text style={styles.sectionSubtitle}>
            How far should we search for workers?
          </Text>

          <View style={styles.radiusOptions}>
            {[5, 10, 15, 20].map((radius) => (
              <TouchableOpacity
                key={radius}
                style={[
                  styles.radiusOption,
                  searchRadius === radius && styles.radiusOptionSelected,
                ]}
                onPress={() => setSearchRadius(radius)}
              >
                <Text
                  style={[
                    styles.radiusOptionText,
                    searchRadius === radius && styles.radiusOptionTextSelected,
                  ]}
                >
                  {radius} km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Search Button */}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={searchWorkers}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="magnify" size={moderateScale(22)} color="#FFFFFF" />
          <Text style={styles.searchButtonText}>Find Available Workers</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Work Location Picker Modal */}
      <WorkLocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelected={handleLocationSelected}
        initialLocation={workLocation}
      />
    </View>
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
    paddingTop: verticalScale(50),
  },

  backButton: {
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

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: moderateScale(16),
  },

  // Service Card
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },

  serviceIcon: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: '#EEF4F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(14),
  },

  serviceInfo: {
    flex: 1,
  },

  serviceTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#222222',
    marginBottom: verticalScale(4),
  },

  serviceSubtitle: {
    fontSize: moderateScale(13),
    color: '#6B7280',
  },

  // Section
  section: {
    marginBottom: verticalScale(24),
  },

  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#222222',
    marginBottom: verticalScale(6),
  },

  sectionSubtitle: {
    fontSize: moderateScale(13),
    color: '#6B7280',
    marginBottom: verticalScale(14),
  },

  // Location Card
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    borderWidth: 1,
    borderColor: '#4CAF50',
  },

  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },

  locationTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: moderateScale(8),
  },

  locationAddress: {
    fontSize: moderateScale(14),
    color: '#222222',
    fontWeight: '500',
    marginBottom: verticalScale(4),
  },

  locationCity: {
    fontSize: moderateScale(13),
    color: '#6B7280',
    marginBottom: verticalScale(10),
  },

  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EEF4F8',
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(6),
    marginBottom: verticalScale(12),
  },

  locationBadgeText: {
    fontSize: moderateScale(12),
    color: PURPLE,
    fontWeight: '500',
    marginLeft: moderateScale(4),
  },

  changeLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  changeLocationText: {
    fontSize: moderateScale(14),
    color: PURPLE,
    fontWeight: '600',
    marginLeft: moderateScale(6),
  },

  selectLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    borderWidth: 2,
    borderColor: PURPLE,
    borderStyle: 'dashed',
  },

  selectLocationText: {
    flex: 1,
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: PURPLE,
    marginLeft: moderateScale(12),
  },

  // Input Box
  inputBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    minHeight: verticalScale(80),
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
    minHeight: verticalScale(60),
    textAlignVertical: 'top',
  },

  // Counter
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },

  counterButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: '#EEF4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  counterText: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: '#222222',
    marginHorizontal: moderateScale(30),
  },

  // Radius Options
  radiusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(10),
  },

  radiusOption: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(12),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },

  radiusOptionSelected: {
    backgroundColor: '#EEF4F8',
    borderColor: PURPLE,
  },

  radiusOptionText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#6B7280',
  },

  radiusOptionTextSelected: {
    color: PURPLE,
  },

  // Search Button
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PURPLE,
    borderRadius: moderateScale(12),
    minHeight: verticalScale(54),
    paddingVertical: verticalScale(16),
    marginTop: verticalScale(10),
  },

  searchButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: moderateScale(8),
  },

  bottomSpace: {
    height: verticalScale(30),
  },
});
