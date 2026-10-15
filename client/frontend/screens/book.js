import React, { useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

export default function Book({
  onHome,
  onPayment,
  onTrackWorker,
  total = 799,
  paymentMethod = 'Cash After Service',
}) {
  // =====================================================
  // ANIMATIONS
  // =====================================================

  const successScale = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const closeScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(successScale, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true,
      }),

      Animated.timing(contentAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // =====================================================
  // CLOSE / GO TO PAYMENT SCREEN
  // =====================================================

  const handlePayment = () => {
    Animated.sequence([
      Animated.timing(closeScale, {
        toValue: 0.88,
        duration: 70,
        useNativeDriver: true,
      }),

      Animated.spring(closeScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (typeof onPayment === 'function') {
        onPayment();
      }
    });
  };

  // =====================================================
  // TRACK WORKER
  // =====================================================

  const handleTrackWorker = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),

      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (typeof onTrackWorker === 'function') {
        onTrackWorker();
      }
    });
  };

  // =====================================================
  // HOME
  // =====================================================

  const handleHome = () => {
    if (typeof onHome === 'function') {
      onHome();
    }
  };

  // =====================================================
  // PAYMENT ICON
  // =====================================================

  const paymentIcon =
    paymentMethod === 'Online Payment'
      ? 'card-outline'
      : 'cash-outline';

  return (
    <SafeAreaView style={styles.container}>

      {/* =================================================
          HEADER
      ================================================= */}

      <View style={styles.header}>

        {/* CLOSE BUTTON - GOES TO PAYMENT SCREEN */}

        <Animated.View
          style={{
            transform: [
              {
                scale: closeScale,
              },
            ],
          }}
        >
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.headerPressed,
            ]}
            onPress={handlePayment}
          >
            <Ionicons
              name="close"
              size={24}
              color="#111827"
            />
          </Pressable>
        </Animated.View>

        <Text style={styles.headerTitle}>
          Booking Confirmed
        </Text>

        <View style={styles.headerSpacer} />

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* =================================================
            SUCCESS ICON
        ================================================= */}

        <Animated.View
          style={[
            styles.successCircle,
            {
              transform: [
                {
                  scale: successScale,
                },
              ],
            },
          ]}
        >
          <Ionicons
            name="checkmark"
            size={52}
            color="#FFFFFF"
          />
        </Animated.View>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        <Animated.View
          style={{
            transform: [
              {
                translateY: contentAnim,
              },
            ],
          }}
        >

          <Text style={styles.successTitle}>
            Your booking is confirmed!
          </Text>

          <Text style={styles.successSubtitle}>
            Your professional has been notified and
            will be on the way soon.
          </Text>

          {/* =================================================
              BOOKING ID
          ================================================= */}

          <View style={styles.bookingIdCard}>

            <View>

              <Text style={styles.bookingLabel}>
                Booking ID
              </Text>

              <Text style={styles.bookingId}>
                #UW10256
              </Text>

            </View>

            <View style={styles.bookingIcon}>

              <Ionicons
                name="receipt-outline"
                size={23}
                color="#49769F"
              />

            </View>

          </View>

          {/* =================================================
              WORKER CARD
          ================================================= */}

          <View style={styles.workerCard}>

            <View style={styles.workerHeader}>

              <Text style={styles.sectionTitle}>
                Your Professional
              </Text>

              <View style={styles.verifiedBadge}>

                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color="#16A34A"
                />

                <Text style={styles.verifiedText}>
                  Verified
                </Text>

              </View>

            </View>

            <View style={styles.workerRow}>

              <View style={styles.avatar}>

                <Ionicons
                  name="person"
                  size={30}
                  color="#49769F"
                />

                <View style={styles.onlineDot} />

              </View>

              <View style={styles.workerInfo}>

                <Text style={styles.workerName}>
                  Rohit Deshmukh
                </Text>

                <Text style={styles.workerProfession}>
                  Professional Painter
                </Text>

                <View style={styles.ratingRow}>

                  <Ionicons
                    name="star"
                    size={15}
                    color="#F59E0B"
                  />

                  <Text style={styles.rating}>
                    4.9
                  </Text>

                  <Text style={styles.experience}>
                    • 8 years experience
                  </Text>

                </View>

              </View>

            </View>

            {/* =================================================
                PHONE
            ================================================= */}

            <View style={styles.contactRow}>

              <View style={styles.contactIcon}>

                <Ionicons
                  name="call-outline"
                  size={19}
                  color="#49769F"
                />

              </View>

              <View>

                <Text style={styles.contactLabel}>
                  Phone
                </Text>

                <Text style={styles.contactValue}>
                  +91 98765 43210
                </Text>

              </View>

            </View>

          </View>

          {/* =================================================
              SERVICE DETAILS
          ================================================= */}

          <View style={styles.detailsCard}>

            <Text style={styles.sectionTitle}>
              Booking Details
            </Text>

            {/* SERVICE */}

            <View style={styles.detailRow}>

              <View style={styles.detailIcon}>

                <Ionicons
                  name="color-palette-outline"
                  size={20}
                  color="#49769F"
                />

              </View>

              <View style={styles.detailInfo}>

                <Text style={styles.detailLabel}>
                  Service
                </Text>

                <Text style={styles.detailValue}>
                  Painting Service
                </Text>

              </View>

            </View>

            {/* DATE */}

            <View style={styles.detailRow}>

              <View style={styles.detailIcon}>

                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#49769F"
                />

              </View>

              <View style={styles.detailInfo}>

                <Text style={styles.detailLabel}>
                  Date
                </Text>

                <Text style={styles.detailValue}>
                  10 Aug 2026
                </Text>

              </View>

            </View>

            {/* TIME */}

            <View style={styles.detailRow}>

              <View style={styles.detailIcon}>

                <Ionicons
                  name="time-outline"
                  size={20}
                  color="#49769F"
                />

              </View>

              <View style={styles.detailInfo}>

                <Text style={styles.detailLabel}>
                  Time
                </Text>

                <Text style={styles.detailValue}>
                  10:00 AM
                </Text>

              </View>

            </View>

            {/* PAYMENT */}

            <View style={styles.detailRow}>

              <View style={styles.detailIcon}>

                <Ionicons
                  name={paymentIcon}
                  size={20}
                  color="#49769F"
                />

              </View>

              <View style={styles.detailInfo}>

                <Text style={styles.detailLabel}>
                  Payment Method
                </Text>

                <Text style={styles.detailValue}>
                  {paymentMethod}
                </Text>

              </View>

            </View>

          </View>

          {/* =================================================
              PAYMENT SUMMARY
          ================================================= */}

          <View style={styles.paymentCard}>

            <View>

              <Text style={styles.paymentLabel}>
                Total Amount
              </Text>

              <Text style={styles.paymentAmount}>
                Rs. {total}
              </Text>

            </View>

            <View style={styles.paidBadge}>

              <Ionicons
                name="checkmark-circle"
                size={15}
                color="#16A34A"
              />

              <Text style={styles.paidText}>
                {paymentMethod === 'Online Payment'
                  ? 'Paid'
                  : 'Pay After Service'}
              </Text>

            </View>

          </View>

          {/* =================================================
              STATUS
          ================================================= */}

          <View style={styles.statusBox}>

            <View style={styles.statusIcon}>

              <Ionicons
                name="navigate-outline"
                size={22}
                color="#49769F"
              />

            </View>

            <View style={styles.statusInfo}>

              <Text style={styles.statusTitle}>
                Worker is getting ready
              </Text>

              <Text style={styles.statusText}>
                Track your worker's location and
                estimated arrival time.
              </Text>

            </View>

          </View>

        </Animated.View>

      </ScrollView>

      {/* =================================================
          BOTTOM BAR
      ================================================= */}

      <View style={styles.bottomBar}>

        <View style={styles.bottomInfo}>

          <Text style={styles.bottomLabel}>
            Your worker
          </Text>

          <Text style={styles.bottomWorker}>
            Rohit Deshmukh
          </Text>

        </View>

        <Animated.View
          style={{
            transform: [
              {
                scale: buttonScale,
              },
            ],
          }}
        >

          <Pressable
            style={({ pressed }) => [
              styles.trackButton,
              pressed && styles.trackPressed,
            ]}
            onPress={handleTrackWorker}
          >

            <Ionicons
              name="navigate-outline"
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.trackButtonText}>
              Track Worker
            </Text>

          </Pressable>

        </Animated.View>

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
    paddingBottom: 125,
  },

  /* ================= HEADER ================= */

  header: {
    height: 102,
    paddingTop: 30,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  headerButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#F3F6F8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
  },

  headerSpacer: {
    width: 43,
  },

  /* ================= SUCCESS ================= */

  successCircle: {
    width: 95,
    height: 95,
    borderRadius: 48,
    backgroundColor: COLORS.primary,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.22,
    shadowRadius: 10,

    elevation: 6,
  },

  successTitle: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 23,
    fontWeight: '800',
    color: COLORS.dark,
  },

  successSubtitle: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.muted,
  },

  /* ================= BOOKING ID ================= */

  bookingIdCard: {
    marginTop: 24,
    backgroundColor: COLORS.softBlue,
    borderRadius: 18,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D5E4EF',
  },

  bookingLabel: {
    fontSize: 12,
    color: COLORS.muted,
  },

  bookingId: {
    marginTop: 3,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.dark,
  },

  bookingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ================= CARDS ================= */

  workerCard: {
    marginTop: 18,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  workerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
  },

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },

  verifiedText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.green,
  },

  /* ================= WORKER ================= */

  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 67,
    height: 67,
    borderRadius: 34,
    backgroundColor: COLORS.softBlue,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  onlineDot: {
    position: 'absolute',
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    right: 1,
    bottom: 2,
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  workerInfo: {
    flex: 1,
    marginLeft: 14,
  },

  workerName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.dark,
  },

  workerProfession: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.muted,
  },

  ratingRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  rating: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },

  experience: {
    marginLeft: 4,
    fontSize: 11,
    color: COLORS.muted,
  },

  /* ================= PHONE ================= */

  contactRow: {
    marginTop: 18,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },

  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: COLORS.softBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },

  contactLabel: {
    marginLeft: 11,
    fontSize: 10,
    color: COLORS.muted,
  },

  contactValue: {
    marginLeft: 11,
    marginTop: 2,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.dark,
  },

  /* ================= DETAILS ================= */

  detailsCard: {
    marginTop: 18,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 17,
  },

  detailIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: COLORS.softBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },

  detailInfo: {
    marginLeft: 12,
    flex: 1,
  },

  detailLabel: {
    fontSize: 11,
    color: COLORS.muted,
  },

  detailValue: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.dark,
  },

  /* ================= PAYMENT ================= */

  paymentCard: {
    marginTop: 18,
    backgroundColor: COLORS.softBlue,
    borderRadius: 18,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D5E4EF',
  },

  paymentLabel: {
    fontSize: 11,
    color: COLORS.muted,
  },

  paymentAmount: {
    marginTop: 3,
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.dark,
  },

  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 11,
  },

  paidText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.green,
  },

  /* ================= STATUS ================= */

  statusBox: {
    marginTop: 18,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  statusIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: COLORS.softBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statusInfo: {
    flex: 1,
    marginLeft: 12,
  },

  statusTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.dark,
  },

  statusText: {
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
    minHeight: 82,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 20,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    elevation: 10,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  bottomInfo: {
    flex: 1,
    marginRight: 10,
  },

  bottomLabel: {
    fontSize: 10,
    color: COLORS.muted,
  },

  bottomWorker: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.dark,
  },

  trackButton: {
    height: 51,
    paddingHorizontal: 16,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 7,

    elevation: 4,
  },

  trackButtonText: {
    marginLeft: 7,
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },

  trackPressed: {
    opacity: 0.8,
  },

});