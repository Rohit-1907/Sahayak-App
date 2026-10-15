import React, { useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ScrollView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

export default function Paymentscreen({
  onBack,
  onContinue,
  onCoupon,
  total = 799,
}) {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const cashScale = useRef(new Animated.Value(1)).current;
  const onlineScale = useRef(new Animated.Value(1)).current;
  const couponScale = useRef(new Animated.Value(1)).current;
  const continueScale = useRef(new Animated.Value(1)).current;

  // =====================================================
  // PRESS ANIMATION
  // =====================================================

  const animatePress = (animation, callback) => {
    if (callback) {
      callback();
    }
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),

      Animated.spring(animation, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // =====================================================
  // CASH
  // =====================================================

  const handleCashPayment = () => {
    animatePress(cashScale, () => {
      setSelectedMethod('cash');
    });
  };

  // =====================================================
  // ONLINE
  // =====================================================

  const handleOnlinePayment = () => {
    animatePress(onlineScale, () => {
      setSelectedMethod('online');
    });
  };

  // =====================================================
  // COUPON
  // =====================================================

  const handleCoupon = () => {
    animatePress(couponScale, () => {
      if (typeof onCoupon === 'function') {
        onCoupon();
      }
    });
  };

  // =====================================================
  // CONTINUE
  // =====================================================
const handleContinue = () => {
  if (!selectedMethod) {
    console.log('Please select a payment method');
    return;
  }

  console.log('================================');
  console.log('PAYMENT CONTINUE PRESSED');
  console.log('Payment method:', selectedMethod);
  console.log('Total:', total);
  console.log('================================');

  animatePress(continueScale, () => {

    if (typeof onContinue === 'function') {

      console.log(
        'Payment Continue → Booking Confirmed'
      );

      onContinue(total, selectedMethod);

    } else {

      console.log(
        'ERROR: onContinue is not connected in App.js'
      );

    }

  });
};

  return (
    <SafeAreaView style={styles.container}>

      {/* =================================================
          HEADER
      ================================================= */}

      <View style={styles.header}>

        <Pressable
          delayPressIn={0}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onBack}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Payment
        </Text>

        <View style={styles.headerSpacer} />

      </View>

      {/* =================================================
          CONTENT
      ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* =================================================
            TOTAL
        ================================================= */}

        <View style={styles.totalCard}>

          <View style={styles.totalIcon}>
            <Ionicons
              name="receipt-outline"
              size={26}
              color="#49769F"
            />
          </View>

          <View style={styles.totalInfo}>

            <Text style={styles.totalLabel}>
              Total Amount
            </Text>

            <Text style={styles.totalAmount}>
              Rs. {total}
            </Text>

          </View>

          <View style={styles.secureBadge}>

            <Ionicons
              name="shield-checkmark"
              size={15}
              color="#16A34A"
            />

            <Text style={styles.secureText}>
              Secure
            </Text>

          </View>

        </View>

        {/* =================================================
            TITLE
        ================================================= */}

        <Text style={styles.sectionTitle}>
          Choose Payment Method
        </Text>

        <Text style={styles.sectionSubtitle}>
          Select how you would like to pay for your service.
        </Text>

        {/* =================================================
            CASH
        ================================================= */}

        <Animated.View
          style={[
            styles.optionWrapper,
            {
              transform: [
                {
                  scale: cashScale,
                },
              ],
            },
          ]}
        >

          <Pressable
            delayPressIn={0}
            style={[
              styles.paymentCard,
              selectedMethod === 'cash' && styles.selectedCard,
            ]}
            onPress={handleCashPayment}
          >

            <View style={styles.optionIcon}>

              <Ionicons
                name="cash-outline"
                size={27}
                color="#49769F"
              />

            </View>

            <View style={styles.optionContent}>

              <Text style={styles.optionTitle}>
                Cash After Service
              </Text>

              <Text style={styles.optionDescription}>
                Pay the worker after the service is completed.
              </Text>

            </View>

            {/* ROUND SELECT BUTTON */}

            <View
              style={[
                styles.radioOuter,
                selectedMethod === 'cash' &&
                  styles.radioOuterSelected,
              ]}
            >
              {selectedMethod === 'cash' && (
                <View style={styles.radioInner} />
              )}
            </View>

          </Pressable>

        </Animated.View>

        {/* =================================================
            ONLINE
        ================================================= */}

        <Animated.View
          style={[
            styles.optionWrapper,
            {
              transform: [
                {
                  scale: onlineScale,
                },
              ],
            },
          ]}
        >

          <Pressable
            delayPressIn={0}
            style={[
              styles.paymentCard,
              selectedMethod === 'online' && styles.selectedCard,
            ]}
            onPress={handleOnlinePayment}
          >

            <View style={styles.optionIcon}>

              <Ionicons
                name="card-outline"
                size={27}
                color="#49769F"
              />

            </View>

            <View style={styles.optionContent}>

              <View style={styles.onlineTitleRow}>

                <Text style={styles.optionTitle}>
                  Online Payment
                </Text>

                <View style={styles.recommendedBadge}>

                  <Text style={styles.recommendedText}>
                    Recommended
                  </Text>

                </View>

              </View>

              <Text style={styles.optionDescription}>
                Pay securely using UPI, card or net banking.
              </Text>

            </View>

            {/* ROUND SELECT BUTTON */}

            <View
              style={[
                styles.radioOuter,
                selectedMethod === 'online' &&
                  styles.radioOuterSelected,
              ]}
            >
              {selectedMethod === 'online' && (
                <View style={styles.radioInner} />
              )}
            </View>

          </Pressable>

        </Animated.View>

        {/* =================================================
            COUPON
        ================================================= */}

        <Animated.View
          style={[
            styles.couponWrapper,
            {
              transform: [
                {
                  scale: couponScale,
                },
              ],
            },
          ]}
        >

          <Pressable
            delayPressIn={0}
            style={({ pressed }) => [
              styles.couponCard,
              pressed && styles.cardPressed,
            ]}
            onPress={handleCoupon}
          >

            <View style={styles.couponIcon}>

              <Ionicons
                name="pricetag-outline"
                size={26}
                color="#49769F"
              />

            </View>

            <View style={styles.couponContent}>

              <Text style={styles.couponTitle}>
                Have a Coupon?
              </Text>

              <Text style={styles.couponDescription}>
                Apply a coupon and save on your booking.
              </Text>

            </View>

            <Ionicons
              name="chevron-forward"
              size={21}
              color="#49769F"
            />

          </Pressable>

        </Animated.View>

        {/* =================================================
            SECURITY
        ================================================= */}

        <View style={styles.securityBox}>

          <View style={styles.securityIcon}>

            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#49769F"
            />

          </View>

          <View style={styles.securityContent}>

            <Text style={styles.securityTitle}>
              Your payment is secure
            </Text>

            <Text style={styles.securityText}>
              Your payment information is protected and
              securely processed.
            </Text>

          </View>

        </View>

      </ScrollView>

      {/* =================================================
          BOTTOM BAR
      ================================================= */}

      <View style={styles.bottomBar}>

        <View>

          <Text style={styles.bottomLabel}>
            Amount to Pay
          </Text>

          <Text style={styles.bottomAmount}>
            Rs. {total}
          </Text>

        </View>

        {/* CONTINUE ONLY APPEARS AFTER SELECTION */}

        {selectedMethod && (

          <Animated.View
            style={{
              transform: [
                {
                  scale: continueScale,
                },
              ],
            }}
          >

            <Pressable
              delayPressIn={0}
              style={({ pressed }) => [
                styles.continueButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleContinue}
            >

              <Text style={styles.continueText}>
                Continue
              </Text>

              <Ionicons
                name="arrow-forward"
                size={20}
                color="#FFFFFF"
              />

            </Pressable>

          </Animated.View>

        )}

      </View>

    </SafeAreaView>
  );
}

/* =====================================================
   COLORS
===================================================== */

const COLORS = {
  primary: '#49769F',
  dark: '#111827',
  muted: '#64748B',
  white: '#FFFFFF',
  background: '#F8FAFC',
  softBlue: '#EAF2F8',
  border: '#E5E7EB',
  green: '#16A34A',
};

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 130,
  },

  /* ================= HEADER ================= */

  header: {
    height: 102,
    paddingTop:30,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },

  backButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: '700',
  },

  headerSpacer: {
    width: 45,
  },

  /* ================= TOTAL ================= */

  totalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 27,
  },

  totalIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: COLORS.softBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },

  totalInfo: {
    flex: 1,
    marginLeft: 14,
  },

  totalLabel: {
    fontSize: 12,
    color: COLORS.muted,
  },

  totalAmount: {
    marginTop: 3,
    fontSize: 25,
    fontWeight: '800',
    color: COLORS.dark,
  },

  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
  },

  secureText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.green,
  },

  /* ================= TITLE ================= */

  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.dark,
  },

  sectionSubtitle: {
    marginTop: 6,
    marginBottom: 18,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.muted,
  },

  /* ================= PAYMENT ================= */

  optionWrapper: {
    marginBottom: 14,
  },

  paymentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 19,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },

  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#F3F8FC',
  },

  cardPressed: {
    opacity: 0.85,
  },

  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.softBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },

  optionContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
  },

  optionDescription: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.muted,
  },

  /* ================= ROUND RADIO ================= */

  radioOuter: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioOuterSelected: {
    borderColor: COLORS.primary,
  },

  radioInner: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
  },

  /* ================= ONLINE ================= */

  onlineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  recommendedBadge: {
    marginLeft: 7,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
  },

  recommendedText: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.green,
  },

  /* ================= COUPON ================= */

  couponWrapper: {
    marginTop: 2,
    marginBottom: 22,
  },

  couponCard: {
    backgroundColor: COLORS.softBlue,
    borderRadius: 19,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5E4EF',
  },

  couponIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  couponContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },

  couponTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
  },

  couponDescription: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.muted,
  },

  /* ================= SECURITY ================= */

  securityBox: {
    backgroundColor: COLORS.white,
    borderRadius: 17,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  securityIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.softBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },

  securityContent: {
    flex: 1,
    marginLeft: 11,
  },

  securityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.dark,
  },

  securityText: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.muted,
  },

  /* ================= BOTTOM ================= */

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 78,
    paddingHorizontal: 20,
    paddingVertical: 13,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  bottomLabel: {
    fontSize: 11,
    color: COLORS.muted,
  },

  bottomAmount: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.dark,
  },

  /* ================= CONTINUE ================= */

  continueButton: {
    minWidth: 135,
    height: 50,
    paddingHorizontal: 18,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  continueText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
  },

  buttonPressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.95,
      },
    ],
  },

});