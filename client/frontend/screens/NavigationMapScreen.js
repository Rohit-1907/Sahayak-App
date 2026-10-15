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
import { Ionicons } from '@expo/vector-icons';
import { getRoute, formatDistance, formatDuration } from '../services/routing.service';
import { Platform } from 'react-native';

const COLORS = {
  blue: '#49769F',
  white: '#FFFFFF',
  dark: '#111827',
  gray: '#64748B',
  green: '#16A34A',
  red: '#EF4444',
};

export default function NavigationMapScreen({ route, navigation }) {
  const { clientLocation, workerLocation, workerName } = route.params;
  
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(null);
  const [mapError, setMapError] = useState(null);

  useEffect(() => {
    console.log('[MAP] NavigationMapScreen mounted');
    console.log('[LOC] Params:', { clientLocation, workerLocation, workerName });
    loadRoute();
  }, []);

  const loadRoute = async () => {
    try {
      setLoading(true);
      setMapError(null);
      
      // Validate coordinates
      if (!clientLocation?.latitude || !clientLocation?.longitude) {
        console.error('[FAIL] Client location missing:', clientLocation);
        Alert.alert('Error', 'Client location not available');
        navigation.goBack();
        return;
      }
      
      if (!workerLocation?.latitude || !workerLocation?.longitude) {
        console.error('[FAIL] Worker location missing:', workerLocation);
        Alert.alert('Error', 'Worker location not available');
        navigation.goBack();
        return;
      }

      console.log('[LOC] Client Location:', clientLocation);
      console.log('[LOC] Worker Location:', workerLocation);

      // Calculate map region first (before fetching route)
      const minLat = Math.min(clientLocation.latitude, workerLocation.latitude);
      const maxLat = Math.max(clientLocation.latitude, workerLocation.latitude);
      const minLng = Math.min(clientLocation.longitude, workerLocation.longitude);
      const maxLng = Math.max(clientLocation.longitude, workerLocation.longitude);

      const midLat = (minLat + maxLat) / 2;
      const midLng = (minLng + maxLng) / 2;
      const latDelta = (maxLat - minLat) * 1.5; // Add padding
      const lngDelta = (maxLng - minLng) * 1.5;

      const initialRegion = {
        latitude: midLat,
        longitude: midLng,
        latitudeDelta: Math.max(latDelta, 0.02),
        longitudeDelta: Math.max(lngDelta, 0.02),
      };

      setRegion(initialRegion);
      console.log('[LOC] Map region calculated:', initialRegion);

      // Fetch route from OSRM
      try {
        console.log('[REFRESH] Fetching route from OSRM...');
        const routeData = await getRoute(clientLocation, workerLocation);
        
        setRouteCoordinates(routeData.coordinates);
        setDistance(routeData.distance);
        setDuration(routeData.duration);
        console.log('[OK] Route loaded:', routeData.coordinates.length, 'points');
      } catch (routeError) {
        console.warn('[WARN] Route fetch failed, showing markers only:', routeError);
        // Don't fail the whole screen, just show markers without route
        setRouteCoordinates([]);
      }

    } catch (error) {
      console.error('[FAIL] Error loading map:', error);
      setMapError(error.message);
      Alert.alert('Error', 'Failed to load map. Please try again.');
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
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Navigate to Worker</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.blue} />
          <Text style={styles.loadingText}>Loading route...</Text>
        </View>
      ) : mapError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.red} />
          <Text style={styles.errorText}>Failed to load map</Text>
          <Text style={styles.errorDetail}>{mapError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadRoute}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Map */}
          {region && (
            <MapView
              style={styles.map}
              initialRegion={region}
              showsUserLocation={true}
              showsMyLocationButton={true}
              onMapReady={() => {
                console.log('[OK] Map is ready');
              }}
              onMapLoaded={() => {
                console.log('[OK] Map loaded completely');
              }}
              onError={(error) => {
                console.error('[FAIL] MapView error:', error);
                setMapError(`Map error: ${JSON.stringify(error)}`);
              }}
              loadingEnabled={true}
              loadingIndicatorColor={COLORS.blue}
              loadingBackgroundColor={COLORS.white}
              zoomEnabled={true}
              scrollEnabled={true}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              {/* Client Marker (Your Location) */}
              <Marker
                coordinate={clientLocation}
                title="Your Location"
                description="Service Request Location"
              >
                <View style={styles.clientMarker}>
                  <Ionicons name="home" size={24} color={COLORS.white} />
                </View>
              </Marker>

              {/* Worker Marker */}
              <Marker
                coordinate={workerLocation}
                title={workerName || 'Worker'}
                description="Worker Location"
              >
                <View style={styles.workerMarker}>
                  <Ionicons name="person" size={24} color={COLORS.white} />
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
          )}

          {/* Route Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="navigate" size={20} color={COLORS.blue} />
                <Text style={styles.infoLabel}>Distance</Text>
                <Text style={styles.infoValue}>
                  {distance ? formatDistance(distance) : 'N/A'}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoItem}>
                <Ionicons name="time" size={20} color={COLORS.blue} />
                <Text style={styles.infoLabel}>Duration</Text>
                <Text style={styles.infoValue}>
                  {duration ? formatDuration(duration) : 'N/A'}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoItem}>
                <Ionicons name="person" size={20} color={COLORS.green} />
                <Text style={styles.infoLabel}>Worker</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {workerName || 'Worker'}
                </Text>
              </View>
            </View>

            {/* Open in Google Maps Button */}
            <TouchableOpacity
              style={styles.openMapsButton}
              onPress={() => {
                const url = `https://www.google.com/maps/dir/?api=1&origin=${clientLocation.latitude},${clientLocation.longitude}&destination=${workerLocation.latitude},${workerLocation.longitude}&travelmode=driving`;
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
              <Ionicons name="map" size={20} color={COLORS.white} />
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
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.red,
    marginTop: 16,
  },
  errorDetail: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: COLORS.blue,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  clientMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  workerMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.green,
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
    marginBottom: 16,
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
