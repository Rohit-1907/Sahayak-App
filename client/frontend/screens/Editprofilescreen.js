import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfile({ onBack }) {
  // =====================================================
  // PERSONAL INFORMATION
  // =====================================================

  const [name, setName] = useState('Loading...');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const userDataStr = await AsyncStorage.getItem('user_data');
      
      if (userDataStr) {
        const user = JSON.parse(userDataStr);
        setName(user.full_name || user.username || 'User');
        setMobile(user.phone_number || '');
        setEmail(user.email || '');
      }
    } catch (error) {
      console.log('Error fetching user data:', error);
      setName('User');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }

    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const userDataStr = await AsyncStorage.getItem('user_data');
      
      if (userDataStr) {
        const user = JSON.parse(userDataStr);
        user.full_name = name;
        user.phone_number = mobile;
        user.email = email;
        await AsyncStorage.setItem('user_data', JSON.stringify(user));
        
        Alert.alert(
          'Success',
          'Profile updated successfully!',
          [{ text: 'OK', onPress: onBack }]
        );
      }
    } catch (error) {
      console.log('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  // =====================================================
  // ADDRESSES
  // =====================================================

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'Home',
      address: 'Pune, Maharashtra',
      isDefault: true,
    },
  ]);

  // =====================================================
  // PAYMENT METHODS
  // =====================================================

  const [payments, setPayments] = useState([
    {
      id: 1,
      type: 'UPI',
      details: 'anam@upi',
    },
  ]);

  // =====================================================
  // ADD ADDRESS
  // =====================================================

  const addAddress = () => {
    Alert.prompt(
      'Add Address',
      'Enter your complete address',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Add',
          onPress: (text) => {
            if (!text || text.trim() === '') {
              return;
            }

            const newAddress = {
              id: Date.now(),
              type: 'Other',
              address: text.trim(),
              isDefault: addresses.length === 0,
            };

            setAddresses((previousAddresses) => [
              ...previousAddresses,
              newAddress,
            ]);
          },
        },
      ],
      'plain-text'
    );
  };

  // =====================================================
  // DELETE ADDRESS
  // =====================================================

  const deleteAddress = (id) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to remove this address?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAddresses((previousAddresses) =>
              previousAddresses.filter(
                (address) => address.id !== id
              )
            );
          },
        },
      ]
    );
  };

  // =====================================================
  // SET DEFAULT ADDRESS
  // =====================================================

  const setDefaultAddress = (id) => {
    setAddresses((previousAddresses) =>
      previousAddresses.map((address) => ({
        ...address,
        isDefault: address.id === id,
      }))
    );
  };

  // =====================================================
  // ADD PAYMENT METHOD
  // =====================================================

  const addPayment = () => {
    Alert.alert(
      'Add Payment Method',
      'Choose a payment method',
      [
        {
          text: 'UPI',
          onPress: () => {
            setPayments((previousPayments) => [
              ...previousPayments,
              {
                id: Date.now(),
                type: 'UPI',
                details: 'New UPI ID',
              },
            ]);
          },
        },
        {
          text: 'Card',
          onPress: () => {
            setPayments((previousPayments) => [
              ...previousPayments,
              {
                id: Date.now(),
                type: 'Card',
                details: 'New Card',
              },
            ]);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // =====================================================
  // DELETE PAYMENT
  // =====================================================

  const deletePayment = (id) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPayments((previousPayments) =>
              previousPayments.filter(
                (payment) => payment.id !== id
              )
            );
          },
        },
      ]
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <SafeAreaView style={styles.container}>

      {/* =================================================
          HEADER
      ================================================= */}

      <View style={styles.header}>

        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressedButton,
          ]}
          onPress={onBack}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#111827"
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Edit Profile
        </Text>

        <View style={styles.headerSpace} />

      </View>

      {/* =================================================
          CONTENT
      ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >

        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}

        <Text style={styles.sectionTitle}>
          Personal Information
        </Text>

        <View style={styles.card}>

          {/* FULL NAME */}

          <Text style={styles.label}>
            Full Name
          </Text>

          <View style={styles.inputContainer}>

            <Ionicons
              name="person-outline"
              size={20}
              color="#4E8EA2"
            />

            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
            />

          </View>

          {/* MOBILE */}

          <Text style={styles.label}>
            Mobile Number
          </Text>

          <View style={styles.inputContainer}>

            <Ionicons
              name="call-outline"
              size={20}
              color="#4E8EA2"
            />

            <TextInput
              style={styles.input}
              value={mobile}
              onChangeText={(text) =>
                setMobile(text.replace(/[^0-9]/g, ''))
              }
              placeholder="Enter mobile number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              maxLength={10}
            />

          </View>

          {/* EMAIL */}

          <Text style={styles.label}>
            Email Address
          </Text>

          <View style={styles.inputContainer}>

            <Ionicons
              name="mail-outline"
              size={20}
              color="#4E8EA2"
            />

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />

          </View>

        </View>

        {/* =================================================
            ADDRESSES
        ================================================= */}

        <View style={styles.sectionHeader}>

          <Text style={styles.sectionTitle}>
            My Addresses
          </Text>

          <Pressable
            onPress={addAddress}
            style={({ pressed }) =>
              pressed && styles.pressedOpacity
            }
          >
            <Text style={styles.addText}>
              + Add Address
            </Text>
          </Pressable>

        </View>

        {addresses.map((address) => (

          <View
            key={address.id}
            style={styles.addressCard}
          >

            {/* ADDRESS ICON */}

            <View style={styles.addressIcon}>

              <Ionicons
                name={
                  address.type === 'Home'
                    ? 'home-outline'
                    : 'location-outline'
                }
                size={22}
                color="#4E8EA2"
              />

            </View>

            {/* ADDRESS DETAILS */}

            <View style={styles.addressInfo}>

              <View style={styles.addressTitleRow}>

                <Text style={styles.addressType}>
                  {address.type}
                </Text>

                {address.isDefault && (
                  <View style={styles.defaultBadge}>

                    <Text style={styles.defaultText}>
                      Default
                    </Text>

                  </View>
                )}

              </View>

              <Text style={styles.addressText}>
                {address.address}
              </Text>

              {!address.isDefault && (
                <Pressable
                  onPress={() =>
                    setDefaultAddress(address.id)
                  }
                >
                  <Text style={styles.defaultLink}>
                    Set as default
                  </Text>
                </Pressable>
              )}

            </View>

            {/* DELETE */}

            <Pressable
              style={styles.deleteButton}
              onPress={() =>
                deleteAddress(address.id)
              }
            >
              <Ionicons
                name="trash-outline"
                size={21}
                color="#EF4444"
              />
            </Pressable>

          </View>

        ))}

        {/* EMPTY ADDRESS */}

        {addresses.length === 0 && (
          <View style={styles.emptyCard}>

            <Ionicons
              name="location-outline"
              size={28}
              color="#9CA3AF"
            />

            <Text style={styles.emptyText}>
              No addresses added yet
            </Text>

          </View>
        )}

        {/* =================================================
            PAYMENT METHODS
        ================================================= */}

        <View style={styles.sectionHeader}>

          <Text style={styles.sectionTitle}>
            Payment Methods
          </Text>

          <Pressable
            onPress={addPayment}
            style={({ pressed }) =>
              pressed && styles.pressedOpacity
            }
          >
            <Text style={styles.addText}>
              + Add
            </Text>
          </Pressable>

        </View>

        {payments.map((payment) => (

          <View
            key={payment.id}
            style={styles.paymentCard}
          >

            {/* PAYMENT ICON */}

            <View style={styles.paymentIcon}>

              <Ionicons
                name={
                  payment.type === 'UPI'
                    ? 'phone-portrait-outline'
                    : 'card-outline'
                }
                size={23}
                color="#4E8EA2"
              />

            </View>

            {/* PAYMENT DETAILS */}

            <View style={styles.paymentInfo}>

              <Text style={styles.paymentType}>
                {payment.type}
              </Text>

              <Text style={styles.paymentDetails}>
                {payment.details}
              </Text>

            </View>

            {/* DELETE */}

            <Pressable
              style={styles.deleteButton}
              onPress={() =>
                deletePayment(payment.id)
              }
            >
              <Ionicons
                name="trash-outline"
                size={21}
                color="#EF4444"
              />
            </Pressable>

          </View>

        ))}

        {/* EMPTY PAYMENT */}

        {payments.length === 0 && (
          <View style={styles.emptyCard}>

            <Ionicons
              name="card-outline"
              size={28}
              color="#9CA3AF"
            />

            <Text style={styles.emptyText}>
              No payment methods added yet
            </Text>

          </View>
        )}

        {/* =================================================
            SAVE BUTTON
        ================================================= */}

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed,
          ]}
          onPress={saveProfile}
        >

          <Ionicons
            name="checkmark-circle-outline"
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.saveButtonText}>
            Save Changes
          </Text>

        </Pressable>

      </ScrollView>

    </SafeAreaView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ===================================================
  // HEADER
  // ===================================================

  header: {
    height: 102,
    paddingTop:30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },

  headerSpace: {
    width: 42,
  },

  // ===================================================
  // CONTENT
  // ===================================================

  content: {
    paddingHorizontal: 20,
    paddingBottom: 45,
  },

  // ===================================================
  // SECTION
  // ===================================================

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
    marginTop: 25,
    marginBottom: 12,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  addText: {
    color: '#4E8EA2',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 20,
  },

  // ===================================================
  // PERSONAL INFORMATION CARD
  // ===================================================

  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 7,
    marginTop: 8,
  },

  inputContainer: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#111827',
  },

  // ===================================================
  // ADDRESS
  // ===================================================

  addressCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  addressIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EAF4F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  addressInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },

  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  addressType: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  defaultBadge: {
    marginLeft: 8,
    backgroundColor: '#EAF4F7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  defaultText: {
    fontSize: 10,
    color: '#4E8EA2',
    fontWeight: '700',
  },

  addressText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 5,
    lineHeight: 18,
  },

  defaultLink: {
    color: '#4E8EA2',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 7,
  },

  // ===================================================
  // PAYMENT
  // ===================================================

  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  paymentIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EAF4F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  paymentInfo: {
    flex: 1,
    marginLeft: 12,
  },

  paymentType: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  paymentDetails: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  // ===================================================
  // DELETE
  // ===================================================

  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ===================================================
  // EMPTY STATE
  // ===================================================

  emptyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 25,
    alignItems: 'center',
    marginBottom: 5,
  },

  emptyText: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 8,
  },

  // ===================================================
  // SAVE
  // ===================================================

  saveButton: {
    height: 55,
    backgroundColor: '#4E8EA2',
    borderRadius: 15,
    marginTop: 25,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },

  saveButtonPressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },

  // ===================================================
  // PRESS EFFECTS
  // ===================================================

  pressedButton: {
    opacity: 0.7,
  },

  pressedOpacity: {
    opacity: 0.6,
  },

});