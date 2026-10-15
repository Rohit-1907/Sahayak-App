import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

export default function TestMapScreen({ navigation }) {
  // Pune coordinates for testing
  const testLocation = {
    latitude: 18.5204,
    longitude: 73.8567,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  console.log('[MAP] TestMapScreen rendered');
  console.log('[LOC] Test Location:', testLocation);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Map Screen</Text>
      </View>

      <View style={{ padding: 10, backgroundColor: '#FFF3CD' }}>
        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
          [TEST] DEBUG: Simple Map Test
        </Text>
        <Text style={{ fontSize: 10 }}>
          Location: {testLocation.latitude}, {testLocation.longitude}
        </Text>
        <Text style={{ fontSize: 10 }}>
          If you see map below, Google Maps is working! 
        </Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={testLocation}
        onMapReady={() => console.log('[OK] Test Map Ready!')}
        onError={(e) => console.error('[FAIL] Test Map Error:', e)}
      >
        <Marker
          coordinate={{
            latitude: testLocation.latitude,
            longitude: testLocation.longitude,
          }}
          title="Test Location"
          description="Pune, India"
        />
      </MapView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          [TAP] Map should show Pune, India above
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0', // Gray background to see if map loads
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
});
