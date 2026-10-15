import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.168.123.150:8000';

export default function PricingTest({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [pricingData, setPricingData] = useState(null);
  
  // Input fields
  const [serviceCategory, setServiceCategory] = useState('Cook');
  const [city, setCity] = useState('Pune');
  const [workerId, setWorkerId] = useState('');

  // Popular services for quick selection
  const services = [
    'Cook', 'Plumber', 'Electrician', 'Carpenter', 
    'Painter', 'Cleaner', 'Driver', 'Gardener'
  ];

  // Popular cities for quick selection
  const cities = [
    'Pune', 'Mumbai', 'Delhi', 'Bangalore', 
    'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad'
  ];

  const fetchPricing = async () => {
    if (!workerId.trim()) {
      Alert.alert('Error', 'Please enter Worker ID');
      return;
    }

    try {
      setLoading(true);
      setPricingData(null);

      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      console.log('[PRICE] Fetching pricing for:', { serviceCategory, city, workerId });

      const response = await fetch(
        `${API_URL}/api/v1/jobs/calculate-price/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_category: serviceCategory,
            city: city,
            worker_id: workerId,
          }),
        }
      );

      const data = await response.json();
      console.log('[DATA] Pricing response:', data);

      if (data.success) {
        setPricingData(data);
        Alert.alert('Success', 'Pricing calculated successfully!');
      } else {
        Alert.alert('Error', data.error || 'Failed to calculate pricing');
      }
    } catch (error) {
      console.error('[FAIL] Error fetching pricing:', error);
      Alert.alert('Error', 'Failed to fetch pricing. Please try again.');
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
          onPress={onBack}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Pricing System</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#49769F" />
          <Text style={styles.infoText}>
            Select service, city, and enter worker ID to calculate pricing
          </Text>
        </View>

        {/* Service Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Service</Text>
          <View style={styles.chipContainer}>
            {services.map((service) => (
              <TouchableOpacity
                key={service}
                style={[
                  styles.chip,
                  serviceCategory === service && styles.chipActive,
                ]}
                onPress={() => setServiceCategory(service)}
              >
                <Text style={[
                  styles.chipText,
                  serviceCategory === service && styles.chipTextActive,
                ]}>
                  {service}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* City Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select City</Text>
          <View style={styles.chipContainer}>
            {cities.map((cityName) => (
              <TouchableOpacity
                key={cityName}
                style={[
                  styles.chip,
                  city === cityName && styles.chipActive,
                ]}
                onPress={() => setCity(cityName)}
              >
                <Text style={[
                  styles.chipText,
                  city === cityName && styles.chipTextActive,
                ]}>
                  {cityName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Worker ID Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Worker ID (UUID)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter worker UUID (e.g., abc123...)"
            placeholderTextColor="#94A3B8"
            value={workerId}
            onChangeText={setWorkerId}
            autoCapitalize="none"
          />
          <Text style={styles.helperText}>
            Get worker ID from worker list or database
          </Text>
        </View>

        {/* Calculate Button */}
        <TouchableOpacity
          style={[styles.calculateButton, loading && styles.calculateButtonDisabled]}
          onPress={fetchPricing}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="calculator" size={20} color="#FFFFFF" />
              <Text style={styles.calculateText}>Calculate Price</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Pricing Result */}
        {pricingData && (
          <View style={styles.resultCard}>
            
            <View style={styles.resultHeader}>
              <Ionicons name="checkmark-circle" size={32} color="#10B981" />
              <Text style={styles.resultTitle}>Pricing Calculated</Text>
            </View>

            {/* Breakdown */}
            <View style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>Price Breakdown</Text>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Service</Text>
                <Text style={styles.priceValue}>
                  {pricingData.breakdown.service_category}
                </Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>City</Text>
                <Text style={styles.priceValue}>
                  {pricingData.breakdown.city}, {pricingData.breakdown.state}
                </Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Worker</Text>
                <Text style={styles.priceValue}>
                  {pricingData.breakdown.worker_name}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Base Price</Text>
                <Text style={styles.priceAmount}>
                  Rs. {pricingData.pricing.base_price}
                </Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Worker Visit Charge</Text>
                <Text style={styles.priceAmount}>
                  Rs. {pricingData.pricing.worker_visit_charge}
                </Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Platform Fee</Text>
                <Text style={styles.priceAmount}>
                  Rs. {pricingData.pricing.platform_fee}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Price</Text>
                <Text style={styles.totalAmount}>
                  Rs. {pricingData.pricing.total_price}
                </Text>
              </View>
            </View>

            {/* Formula */}
            <View style={styles.formulaCard}>
              <Text style={styles.formulaTitle}>Formula Used:</Text>
              <Text style={styles.formulaText}>
                Base Price + Worker Visit Charge + Platform Fee = Total
              </Text>
              <Text style={styles.formulaExample}>
                Rs. {pricingData.pricing.base_price} + Rs. {pricingData.pricing.worker_visit_charge} + Rs. {pricingData.pricing.platform_fee} = Rs. {pricingData.pricing.total_price}
              </Text>
            </View>

          </View>
        )}

        <View style={{ height: 40 }} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    height: 100,
    backgroundColor: '#49769F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 30,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },

  headerSpacer: {
    width: 40,
  },

  content: {
    flex: 1,
    padding: 20,
  },

  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },

  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },

  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },

  chipActive: {
    backgroundColor: '#49769F',
    borderColor: '#49769F',
  },

  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },

  chipTextActive: {
    color: '#FFFFFF',
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#1E293B',
  },

  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748B',
  },

  calculateButton: {
    backgroundColor: '#49769F',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },

  calculateButtonDisabled: {
    opacity: 0.6,
  },

  calculateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  resultCard: {
    marginTop: 24,
  },

  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },

  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },

  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  priceLabel: {
    fontSize: 14,
    color: '#64748B',
  },

  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },

  priceAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#49769F',
  },

  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },

  totalAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#10B981',
  },

  formulaCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  formulaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 6,
  },

  formulaText: {
    fontSize: 13,
    color: '#78350F',
    marginBottom: 8,
  },

  formulaExample: {
    fontSize: 12,
    color: '#92400E',
    fontStyle: 'italic',
  },
});
