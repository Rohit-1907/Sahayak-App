import React, { useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Animated,
} from 'react-native';

import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function Painting({
  onBack,
  onOpenWorker,
}) {
  const bookScale = useRef(new Animated.Value(1)).current;

  // =====================================================
  // BOOK BUTTON ANIMATION
  // =====================================================

  const handleBookPressIn = () => {
    Animated.spring(bookScale, {
      toValue: 0.95,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleBookPressOut = () => {
    Animated.spring(bookScale, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  // =====================================================
  // OPEN WORKER INFO
  // =====================================================

  const handleBook = () => {
    console.log('Painting.js -> Workerinfo.js');

    if (typeof onOpenWorker === 'function') {
      onOpenWorker();
    } else {
      console.log(
        'ERROR: onOpenWorker is not connected in App.js'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <View style={styles.header}>

        <Pressable
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.pressed,
          ]}
          onPress={onBack}
        >
          <Ionicons
            name="arrow-back"
            size={25}
            color="#111827"
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Painting Services
        </Text>

        <View style={styles.headerSpacer} />

      </View>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* =====================================================
            TOP BANNER
        ===================================================== */}

        <View style={styles.banner}>

          <Image
            source={{
              uri:
                'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=900',
            }}
            style={styles.bannerImage}
          />

          <View style={styles.bannerOverlay}>

            <Text style={styles.bannerTitle}>
              Professional Painting
            </Text>

            <Text style={styles.bannerSubtitle}>
              Give your home a fresh new look
            </Text>

          </View>

        </View>

        {/* =====================================================
            SERVICE INFORMATION
        ===================================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Painting Services
          </Text>

          <Text style={styles.description}>
            Get professional painting services from
            experienced workers. Choose a trusted
            professional and book your service easily.
          </Text>

        </View>

        {/* =====================================================
            SERVICES
        ===================================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            What We Offer
          </Text>

          <View style={styles.serviceGrid}>

            <View style={styles.serviceCard}>

              <View style={styles.serviceIcon}>
                <Ionicons
                  name="home-outline"
                  size={25}
                  color="#49769F"
                />
              </View>

              <Text style={styles.serviceTitle}>
                Home Painting
              </Text>

              <Text style={styles.serviceText}>
                Complete interior and exterior painting.
              </Text>

            </View>

            <View style={styles.serviceCard}>

              <View style={styles.serviceIcon}>
                <MaterialIcons
                  name="format-paint"
                  size={25}
                  color="#49769F"
                />
              </View>

              <Text style={styles.serviceTitle}>
                Wall Painting
              </Text>

              <Text style={styles.serviceText}>
                Professional wall painting and finishing.
              </Text>

            </View>

            <View style={styles.serviceCard}>

              <View style={styles.serviceIcon}>
                <Ionicons
                  name="color-palette-outline"
                  size={25}
                  color="#49769F"
                />
              </View>

              <Text style={styles.serviceTitle}>
                Colour Consultation
              </Text>

              <Text style={styles.serviceText}>
                Get help choosing the perfect colours.
              </Text>

            </View>

            <View style={styles.serviceCard}>

              <View style={styles.serviceIcon}>
                <Ionicons
                  name="brush-outline"
                  size={25}
                  color="#49769F"
                />
              </View>

              <Text style={styles.serviceTitle}>
                Finishing
              </Text>

              <Text style={styles.serviceText}>
                Smooth and professional finishing.
              </Text>

            </View>

          </View>

        </View>

        {/* =====================================================
            WORKER SECTION
        ===================================================== */}

        <View style={styles.section}>

          <View style={styles.workerHeader}>

            <Text style={styles.sectionTitle}>
              Available Professional
            </Text>

            <Text style={styles.availableCount}>
              1 Available
            </Text>

          </View>

          {/* =================================================
              WORKER CARD
          ================================================= */}

          <View style={styles.workerCard}>

            <View style={styles.workerTop}>

              <Image
                source={{
                  uri:
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
                }}
                style={styles.workerImage}
              />

              <View style={styles.workerInfo}>

                <View style={styles.nameRow}>

                  <Text style={styles.workerName}>
                    Rahul Sharma
                  </Text>

                  <MaterialIcons
                    name="verified"
                    size={19}
                    color="#49769F"
                  />

                </View>

                <Text style={styles.workerProfession}>
                  Professional Painter
                </Text>

                <View style={styles.ratingRow}>

                  <Ionicons
                    name="star"
                    size={17}
                    color="#FBBF24"
                  />

                  <Text style={styles.rating}>
                    4.8
                  </Text>

                  <Text style={styles.reviews}>
                    (350 Reviews)
                  </Text>

                </View>

                <View style={styles.availableRow}>

                  <View style={styles.greenDot} />

                  <Text style={styles.availableText}>
                    Available Today
                  </Text>

                </View>

              </View>

            </View>

            {/* =================================================
                WORKER DETAILS
            ================================================= */}

            <View style={styles.workerDetails}>

              <View style={styles.detailItem}>

                <Ionicons
                  name="briefcase-outline"
                  size={19}
                  color="#49769F"
                />

                <Text style={styles.detailText}>
                  5+ Years Experience
                </Text>

              </View>

              <View style={styles.detailItem}>

                <Ionicons
                  name="checkmark-circle-outline"
                  size={19}
                  color="#49769F"
                />

                <Text style={styles.detailText}>
                  500+ Jobs Completed
                </Text>

              </View>

              <View style={styles.detailItem}>

                <Ionicons
                  name="location-outline"
                  size={19}
                  color="#49769F"
                />

                <Text style={styles.detailText}>
                  Pune, Maharashtra
                </Text>

              </View>

            </View>

            {/* =================================================
                PRICE
            ================================================= */}

            <View style={styles.priceRow}>

              <View>

                <Text style={styles.priceLabel}>
                  Starting from
                </Text>

                <Text style={styles.price}>
                  Rs. 749
                </Text>

              </View>

              {/* =================================================
                  BOOK NOW
              ================================================= */}

              <Animated.View
                style={[
                  styles.bookAnimated,
                  {
                    transform: [
                      {
                        scale: bookScale,
                      },
                    ],
                  },
                ]}
              >

               

              </Animated.View>

            </View>

          </View>

        </View>

        {/* =====================================================
            WHY CHOOSE US
        ===================================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Why Choose Our Service?
          </Text>

          <View style={styles.reasonCard}>

            <View style={styles.reasonRow}>

              <View style={styles.reasonIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={22}
                  color="#49769F"
                />
              </View>

              <View style={styles.reasonContent}>

                <Text style={styles.reasonTitle}>
                  Verified Professionals
                </Text>

                <Text style={styles.reasonText}>
                  All workers are verified before joining
                  our platform.
                </Text>

              </View>

            </View>

            <View style={styles.reasonRow}>

              <View style={styles.reasonIcon}>
                <Ionicons
                  name="star-outline"
                  size={22}
                  color="#49769F"
                />
              </View>

              <View style={styles.reasonContent}>

                <Text style={styles.reasonTitle}>
                  Highly Rated Workers
                </Text>

                <Text style={styles.reasonText}>
                  Choose professionals with trusted
                  customer reviews.
                </Text>

              </View>

            </View>

            <View style={styles.reasonRow}>

              <View style={styles.reasonIcon}>
                <Ionicons
                  name="cash-outline"
                  size={22}
                  color="#49769F"
                />
              </View>

              <View style={styles.reasonContent}>

                <Text style={styles.reasonTitle}>
                  Transparent Pricing
                </Text>

                <Text style={styles.reasonText}>
                  See the service price before confirming
                  your booking.
                </Text>

              </View>

            </View>

          </View>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    paddingBottom: 40,
  },

  /* =====================================================
     HEADER
  ===================================================== */

  header: {
    height: 102,
    paddingTop:30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3F6F8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },

  headerSpacer: {
    width: 42,
  },

  pressed: {
    opacity: 0.6,
    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  /* =====================================================
     BANNER
  ===================================================== */

  banner: {
    margin: 20,
    height: 190,
    borderRadius: 22,
    overflow: 'hidden',
  },

  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  bannerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
  },

  bannerSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 6,
  },

  /* =====================================================
     SECTION
  ===================================================== */

  section: {
    marginHorizontal: 20,
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },

  description: {
    fontSize: 15,
    lineHeight: 23,
    color: '#64748B',
  },

  /* =====================================================
     SERVICES
  ===================================================== */

  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 5,
  },

  serviceCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  serviceIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EAF3FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  serviceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  serviceText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    marginTop: 5,
  },

  /* =====================================================
     WORKER
  ===================================================== */

  workerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  availableCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },

  workerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 7,

    elevation: 3,
  },

  workerTop: {
    flexDirection: 'row',
  },

  workerImage: {
    width: 85,
    height: 85,
    borderRadius: 42,
  },

  workerInfo: {
    flex: 1,
    marginLeft: 14,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  workerName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
    marginRight: 5,
  },

  workerProfession: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  rating: {
    marginLeft: 5,
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },

  reviews: {
    marginLeft: 4,
    fontSize: 12,
    color: '#64748B',
  },

  availableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    marginRight: 5,
  },

  availableText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600',
  },

  /* =====================================================
     WORKER DETAILS
  ===================================================== */

  workerDetails: {
    marginTop: 18,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  detailText: {
    marginLeft: 9,
    fontSize: 13,
    color: '#475569',
  },

  /* =====================================================
     PRICE
  ===================================================== */

  priceRow: {
    marginTop: 8,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  priceLabel: {
    fontSize: 12,
    color: '#64748B',
  },

  price: {
    fontSize: 22,
    fontWeight: '800',
    color: '#49769F',
    marginTop: 2,
  },

  /* =====================================================
     BOOK BUTTON
  ===================================================== */

  bookAnimated: {
    minWidth: 135,
  },

  bookButton: {
    minWidth: 135,
    height: 48,
    paddingHorizontal: 15,
    borderRadius: 14,
    backgroundColor: '#49769F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    elevation: 3,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  bookPressed: {
    opacity: 0.85,
  },

  bookText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginRight: 7,
  },

  /* =====================================================
     WHY CHOOSE US
  ===================================================== */

  reasonCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  reasonIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EAF3FA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  reasonContent: {
    flex: 1,
    marginLeft: 12,
  },

  reasonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  reasonText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 3,
  },

});