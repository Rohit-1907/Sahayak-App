import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Paymentmethodscreen({ onBack }) {
  const [showAddPayment, setShowAddPayment] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'UPI',
      name: 'Google Pay',
      details: 'anam@okaxis',
      icon: 'phone-portrait-outline',
      default: true,
    },
    {
      id: 2,
      type: 'Debit Card',
      name: 'HDFC Bank',
      details: '•••• •••• •••• 4521',
      icon: 'card-outline',
      default: false,
    },
  ]);

  const [selectedType, setSelectedType] = useState('UPI');

  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');

  /* =====================================================
     ANIMATIONS
  ===================================================== */

  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(
    paymentMethods.map(() => new Animated.Value(0))
  ).current;
  const addButtonAnim = useRef(new Animated.Value(0)).current;
  const securityAnim = useRef(new Animated.Value(0)).current;

  const formAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),

      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),

      Animated.stagger(
        100,
        cardsAnim.map((animation) =>
          Animated.timing(animation, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          })
        )
      ),

      Animated.parallel([
        Animated.timing(addButtonAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),

        Animated.timing(securityAnim, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  /* =====================================================
     FORM ANIMATION
  ===================================================== */

  const openAddPayment = () => {
    setShowAddPayment(true);

    formAnim.setValue(0);

    Animated.spring(formAnim, {
      toValue: 1,
      friction: 7,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  const closeAddPayment = () => {
    Animated.timing(formAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setShowAddPayment(false);
    });
  };

  /* =====================================================
     SET DEFAULT PAYMENT
  ===================================================== */

  const setDefaultPayment = (id) => {
    setPaymentMethods(
      paymentMethods.map((payment) => ({
        ...payment,
        default: payment.id === id,
      }))
    );
  };

  /* =====================================================
     DELETE PAYMENT
  ===================================================== */

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
            setPaymentMethods(
              paymentMethods.filter(
                (payment) => payment.id !== id
              )
            );
          },
        },
      ]
    );
  };

  /* =====================================================
     ADD PAYMENT
  ===================================================== */

  const addPaymentMethod = () => {
    if (selectedType === 'UPI') {
      if (!upiId.trim()) {
        Alert.alert(
          'Enter UPI ID',
          'Please enter your UPI ID.'
        );
        return;
      }

      const newPayment = {
        id: Date.now(),
        type: 'UPI',
        name: 'UPI Payment',
        details: upiId,
        icon: 'phone-portrait-outline',
        default: paymentMethods.length === 0,
      };

      setPaymentMethods([
        ...paymentMethods,
        newPayment,
      ]);
    } else {
      if (!cardNumber.trim() || !cardName.trim()) {
        Alert.alert(
          'Missing Details',
          'Please enter your card details.'
        );
        return;
      }

      const lastFour = cardNumber.slice(-4);

      const newPayment = {
        id: Date.now(),
        type: selectedType,
        name: cardName,
        details: `•••• •••• •••• ${lastFour}`,
        icon: 'card-outline',
        default: paymentMethods.length === 0,
      };

      setPaymentMethods([
        ...paymentMethods,
        newPayment,
      ]);
    }

    setUpiId('');
    setCardNumber('');
    setCardName('');

    closeAddPayment();

    Alert.alert(
      'Payment Method Added',
      'Your payment method has been added successfully.'
    );
  };

  /* =====================================================
     PRESS ANIMATION COMPONENT
  ===================================================== */

  const AnimatedButton = ({
    children,
    style,
    onPress,
  }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scale, {
        toValue: 0.96,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        style={[
          {
            transform: [{ scale }],
          },
          style,
        ]}
      >
        <Pressable
          delayPressIn={0}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-15, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Pressable
          delayPressIn={0}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.smallPressed,
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
          Payment Methods
        </Text>

        <View style={styles.headerSpace} />
      </Animated.View>


      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* =====================================================
            INTRO
        ===================================================== */}

        <Animated.View
          style={{
            opacity: contentAnim,
            transform: [
              {
                translateY: contentAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
          <Text style={styles.pageTitle}>
            Your Payment Methods
          </Text>

          <Text style={styles.pageSubtitle}>
            Manage your saved payment methods for faster
            and easier bookings.
          </Text>
        </Animated.View>


        {/* =====================================================
            SAVED PAYMENT METHODS
        ===================================================== */}

        {paymentMethods.length > 0 ? (

          paymentMethods.map((payment, index) => {

            const cardAnimation =
              cardsAnim[index] || new Animated.Value(1);

            return (
              <Animated.View
                key={payment.id}
                style={[
                  styles.paymentCard,
                  {
                    opacity: cardAnimation,
                    transform: [
                      {
                        translateY:
                          cardAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [25, 0],
                          }),
                      },
                      {
                        scale:
                          cardAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.96, 1],
                          }),
                      },
                    ],
                  },
                ]}
              >

                {/* ICON */}

                <View style={styles.paymentIcon}>
                  <Ionicons
                    name={payment.icon}
                    size={25}
                    color="#4E8EA2"
                  />
                </View>


                {/* DETAILS */}

                <View style={styles.paymentInfo}>

                  <View style={styles.paymentNameRow}>

                    <Text style={styles.paymentName}>
                      {payment.name}
                    </Text>

                    {payment.default && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>
                          Default
                        </Text>
                      </View>
                    )}

                  </View>

                  <Text style={styles.paymentType}>
                    {payment.type}
                  </Text>

                  <Text style={styles.paymentDetails}>
                    {payment.details}
                  </Text>

                </View>


                {/* MENU */}

                <Pressable
                  delayPressIn={0}
                  style={({ pressed }) => [
                    styles.moreButton,
                    pressed && styles.moreButtonPressed,
                  ]}
                  onPress={() => {
                    Alert.alert(
                      'Payment Method',
                      'Choose an action',
                      [
                        {
                          text: payment.default
                            ? 'Default Payment'
                            : 'Set as Default',
                          onPress: () => {
                            if (!payment.default) {
                              setDefaultPayment(
                                payment.id
                              );
                            }
                          },
                        },
                        {
                          text: 'Remove',
                          style: 'destructive',
                          onPress: () =>
                            deletePayment(
                              payment.id
                            ),
                        },
                        {
                          text: 'Cancel',
                          style: 'cancel',
                        },
                      ]
                    );
                  }}
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={20}
                    color="#6B7280"
                  />
                </Pressable>

              </Animated.View>
            );
          })

        ) : (

          /* EMPTY STATE */

          <Animated.View
            style={[
              styles.emptyContainer,
              {
                opacity: contentAnim,
              },
            ]}
          >
            <View style={styles.emptyIcon}>
              <Ionicons
                name="card-outline"
                size={40}
                color="#4E8EA2"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No payment methods
            </Text>

            <Text style={styles.emptySubtitle}>
              Add a payment method to make your
              bookings faster.
            </Text>
          </Animated.View>

        )}


        {/* =====================================================
            ADD PAYMENT BUTTON
        ===================================================== */}

        {!showAddPayment && (
          <Animated.View
            style={{
              opacity: addButtonAnim,
              transform: [
                {
                  translateY:
                    addButtonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                },
              ],
            }}
          >
            <AnimatedButton
              style={styles.addButton}
              onPress={openAddPayment}
            >
              <View style={styles.buttonInner}>
                <Ionicons
                  name="add-circle-outline"
                  size={22}
                  color="#FFFFFF"
                />

                <Text style={styles.addButtonText}>
                  Add Payment Method
                </Text>
              </View>
            </AnimatedButton>
          </Animated.View>
        )}


        {/* =====================================================
            ADD PAYMENT FORM
        ===================================================== */}

        {showAddPayment && (
          <Animated.View
            style={[
              styles.addCard,
              {
                opacity: formAnim,
                transform: [
                  {
                    scale: formAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.94, 1],
                    }),
                  },
                  {
                    translateY:
                      formAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [25, 0],
                      }),
                  },
                ],
              },
            ]}
          >

            <View style={styles.addHeader}>

              <Text style={styles.addTitle}>
                Add Payment Method
              </Text>

              <Pressable
                delayPressIn={0}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.smallPressed,
                ]}
                onPress={closeAddPayment}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#6B7280"
                />
              </Pressable>

            </View>


            {/* PAYMENT TYPE */}

            <Text style={styles.inputLabel}>
              Payment Type
            </Text>

            <View style={styles.typeRow}>

              <Pressable
                delayPressIn={0}
                style={[
                  styles.typeButton,
                  selectedType === 'UPI' &&
                    styles.selectedType,
                ]}
                onPress={() =>
                  setSelectedType('UPI')
                }
              >

                <Ionicons
                  name="phone-portrait-outline"
                  size={20}
                  color={
                    selectedType === 'UPI'
                      ? '#FFFFFF'
                      : '#4E8EA2'
                  }
                />

                <Text
                  style={[
                    styles.typeText,
                    selectedType === 'UPI' &&
                      styles.selectedTypeText,
                  ]}
                >
                  UPI
                </Text>

              </Pressable>


              <Pressable
                delayPressIn={0}
                style={[
                  styles.typeButton,
                  selectedType === 'Debit Card' &&
                    styles.selectedType,
                ]}
                onPress={() =>
                  setSelectedType('Debit Card')
                }
              >

                <Ionicons
                  name="card-outline"
                  size={20}
                  color={
                    selectedType === 'Debit Card'
                      ? '#FFFFFF'
                      : '#4E8EA2'
                  }
                />

                <Text
                  style={[
                    styles.typeText,
                    selectedType === 'Debit Card' &&
                      styles.selectedTypeText,
                  ]}
                >
                  Debit Card
                </Text>

              </Pressable>

            </View>


            {/* UPI */}

            {selectedType === 'UPI' && (
              <>
                <Text style={styles.inputLabel}>
                  UPI ID
                </Text>

                <View style={styles.inputContainer}>

                  <Ionicons
                    name="phone-portrait-outline"
                    size={20}
                    color="#9CA3AF"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="example@upi"
                    placeholderTextColor="#9CA3AF"
                    value={upiId}
                    onChangeText={setUpiId}
                    autoCapitalize="none"
                  />

                </View>
              </>
            )}


            {/* CARD */}

            {selectedType === 'Debit Card' && (
              <>
                <Text style={styles.inputLabel}>
                  Cardholder Name
                </Text>

                <View style={styles.inputContainer}>

                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#9CA3AF"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Name on card"
                    placeholderTextColor="#9CA3AF"
                    value={cardName}
                    onChangeText={setCardName}
                  />

                </View>


                <Text style={styles.inputLabel}>
                  Card Number
                </Text>

                <View style={styles.inputContainer}>

                  <Ionicons
                    name="card-outline"
                    size={20}
                    color="#9CA3AF"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Enter card number"
                    placeholderTextColor="#9CA3AF"
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    keyboardType="numeric"
                    maxLength={16}
                  />

                </View>
              </>
            )}


            {/* SAVE */}

            <AnimatedButton
              style={styles.saveButton}
              onPress={addPaymentMethod}
            >
              <View style={styles.buttonInner}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={21}
                  color="#FFFFFF"
                />

                <Text style={styles.saveButtonText}>
                  Save Payment Method
                </Text>
              </View>
            </AnimatedButton>

          </Animated.View>
        )}


        {/* =====================================================
            SECURITY INFO
        ===================================================== */}

        <Animated.View
          style={[
            styles.securityCard,
            {
              opacity: securityAnim,
              transform: [
                {
                  translateY:
                    securityAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                },
              ],
            },
          ]}
        >

          <View style={styles.securityIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={25}
              color="#4E8EA2"
            />
          </View>

          <View style={styles.securityText}>

            <Text style={styles.securityTitle}>
              Your payment information is secure
            </Text>

            <Text style={styles.securitySubtitle}>
              Payment details are securely handled and
              are never shared with service providers.
            </Text>

          </View>

        </Animated.View>

      </ScrollView>

    </SafeAreaView>
  );
}


/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },


  /* =====================================================
     HEADER
  ===================================================== */

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


  /* =====================================================
     INTRO
  ===================================================== */

  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginTop: 25,
  },

  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 21,
    marginTop: 6,
    marginBottom: 22,
  },


  /* =====================================================
     PAYMENT CARD
  ===================================================== */

  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 17,
    padding: 15,
    marginBottom: 12,
  },

  paymentIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#EAF4F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  paymentInfo: {
    flex: 1,
    marginLeft: 13,
  },

  paymentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  paymentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  defaultBadge: {
    backgroundColor: '#EAF4F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },

  defaultText: {
    fontSize: 10,
    color: '#4E8EA2',
    fontWeight: '700',
  },

  paymentType: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },

  paymentDetails: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
    marginTop: 4,
  },

  moreButton: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },

  moreButtonPressed: {
    opacity: 0.5,
  },


  /* =====================================================
     ADD BUTTON
  ===================================================== */

  addButton: {
    height: 55,
    backgroundColor: '#4E8EA2',
    borderRadius: 14,
    marginTop: 10,
  },

  buttonInner: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },


  /* =====================================================
     ADD CARD
  ===================================================== */

  addCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 18,
    marginTop: 10,
  },

  addHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  addTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },


  /* =====================================================
     TYPE
  ===================================================== */

  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },

  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },

  typeButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedType: {
    backgroundColor: '#4E8EA2',
    borderColor: '#4E8EA2',
  },

  typeText: {
    color: '#4E8EA2',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },

  selectedTypeText: {
    color: '#FFFFFF',
  },


  /* =====================================================
     INPUT
  ===================================================== */

  inputContainer: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    marginLeft: 9,
  },


  /* =====================================================
     SAVE
  ===================================================== */

  saveButton: {
    height: 52,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    marginTop: 20,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 7,
  },


  /* =====================================================
     EMPTY
  ===================================================== */

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyIcon: {
    width: 85,
    height: 85,
    borderRadius: 43,
    backgroundColor: '#EAF4F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
  },

  emptySubtitle: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6B7280',
    marginTop: 7,
    lineHeight: 20,
  },


  /* =====================================================
     SECURITY
  ===================================================== */

  securityCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F7F9',
    borderRadius: 15,
    padding: 15,
    marginTop: 25,
  },

  securityIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#EAF4F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  securityText: {
    flex: 1,
    marginLeft: 10,
  },

  securityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },

  securitySubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 17,
  },

  smallPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.94 }],
  },

});