import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getRoute, formatDistance, formatDuration } from '../services/routing.service';

const COLORS = {
  blue: '#49769F',
  white: '#FFFFFF',
  dark: '#111827',
  gray: '#64748B',
  green: '#16A34A',
  red: '#EF4444',
  orange: '#EA580C',
};

export default function NavigationMapScreen({ route, navigation }) {
  console.log('[MAP] NavigationMapScreen RENDERED');
  console.log('[DATA] Route params:', route?.params);
  
  // Safely extract params
  const params = route?.params || {};
  const { workerLocation, jobLocation, clientName, serviceType } = params;
  
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[SEARCH] Checking navigation params...');
    console.log('  Worker Location:', workerLocation);
    console.log('  Job Location:', jobLocation);
    
    if (!workerLocation || !jobLocation) {
      console.error('[FAIL] Missing location data!');
      setError('Location data not available');
      setLoading(false);
      return;
    }
    
    loadRoute();
  }, []);

  const loadRoute = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate coordinates
      if (!workerLocation?.latitude || !workerLocation?.longitude) {
        const msg = 'Worker location not available. Please update your location in profile.';
        console.error('[FAIL]', msg);
        setError(msg);
        setLoading(false);
        return;
      }
      
      if (!jobLocation?.latitude || !jobLocation?.longitude) {
        const msg = 'Job location not available.';
        console.error('[FAIL]', msg);
        setError(msg);
        setLoading(false);
        return;
      }

      console.log('[LOC] Worker Location:', workerLocation);
      console.log('[LOC] Job Location:', jobLocation);

      // Fetch route from OSRM
      const routeData = await getRoute(workerLocation, jobLocation);
      
      setRouteCoordinates(routeData.coordinates);
      setDistance(routeData.distance);
      setDuration(routeData.duration);

      // Calculate map region to show both points
      const minLat = Math.min(workerLocation.latitude, jobLocation.latitude);
      const maxLat = Math.max(workerLocation.latitude, jobLocation.latitude);
      const minLng = Math.min(workerLocation.longitude, jobLocation.longitude);
      const maxLng = Math.max(workerLocation.longitude, jobLocation.longitude);

      const midLat = (minLat + maxLat) / 2;
      const midLng = (minLng + maxLng) / 2;
      const latDelta = (maxLat - minLat) * 1.5; // Add padding
      const lngDelta = (maxLng - minLng) * 1.5;

      setRegion({
        latitude: midLat,
        longitude: midLng,
        latitudeDelta: Math.max(latDelta, 0.02),
        longitudeDelta: Math.max(lngDelta, 0.02),
      });

      console.log('[OK] Route loaded:', routeData.coordinates.length, 'points');
    } catch (err) {
      console.error('[FAIL] Error loading route:', err);
      setError('Failed to load route. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Navigate to Job</Text>
        <View style={styles.placeholder} />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color={COLORS.red} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              loadRoute();
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.blue} />
          <Text style={styles.loadingText}>Loading route...</Text>
        </View>
      ) : (
        <>
          {/* Map */}
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={region}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {/* Worker Marker (Your Location) */}
            <Marker
              coordinate={workerLocation}
              title="Your Location"
              description="Worker Location"
              pinColor={COLORS.blue}
            >
              <View style={styles.workerMarker}>
                <MaterialCommunityIcons name="account" size={24} color={COLORS.white} />
              </View>
            </Marker>

            {/* Job Location Marker */}
            <Marker
              coordinate={jobLocation}
              title={clientName || 'Job Location'}
              description={serviceType || 'Service Location'}
              pinColor={COLORS.orange}
            >
              <View style={styles.jobMarker}>
                <MaterialCommunityIcons name="map-marker" size={28} color={COLORS.white} />
              </View>
            </Marker>

            {/* Route Polyline */}
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor={COLORS.blue}
                strokeWidth={4}
              />
            )}
          </MapView>

          {/* Route Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="map-marker-distance" size={20} color={COLORS.blue} />
                <Text style={styles.infoLabel}>Distance</Text>
                <Text style={styles.infoValue}>
                  {distance ? formatDistance(distance) : 'N/A'}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.blue} />
                <Text style={styles.infoLabel}>Duration</Text>
                <Text style={styles.infoValue}>
                  {duration ? formatDuration(duration) : 'N/A'}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="account-outline" size={20} color={COLORS.orange} />
                <Text style={styles.infoLabel}>Client</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {clientName || 'Client'}
                </Text>
              </View>
            </View>

            {/* Service Type */}
            {serviceType && (
              <View style={styles.serviceRow}>
                <MaterialCommunityIcons name="tools" size={16} color={COLORS.gray} />
                <Text style={styles.serviceText}>{serviceType}</Text>
              </View>
            )}

            {/* Open in Google Maps Button */}
            <TouchableOpacity
              style={styles.openMapsButton}
              onPress={() => {
                const url = `https://www.google.com/maps/dir/?api=1&origin=${workerLocation.latitude},${workerLocation.longitude}&destination=${jobLocation.latitude},${jobLocation.longitude}&travelmode=driving`;
                Alert.alert(
                  'Open in Google Maps',
                  'Would you like to open directions in Google Maps app?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Open',
                      onPress: () => {
                        const Linking = require('react-native').Linking;
                        Linking.openURL(url);
                      },
                    },
                  ]
                );
              }}
            >
              <MaterialCommunityIcons name="google-maps" size={20} color={COLORS.white} />
              <Text style={styles.openMapsText}>Open in Google Maps</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  map: {
    flex: 1,
  },
  workerMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  jobMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  infoCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  serviceText: {
    fontSize: 13,
    color: COLORS.gray,
    flex: 1,
  },
  openMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.blue,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  openMapsText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
});
