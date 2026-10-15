import React, { useEffect, useRef } from 'react';
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

import { Ionicons } from '@expo/vector-icons';

/* =====================================================
   AC WORKERS
===================================================== */

const acWorkers = [
  {
    id: 1,
    name: 'Amit Sharma',
    rating: '4.9',
    experience: '8 years',
    price: 'Rs. 599',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
  },

  {
    id: 2,
    name: 'Suresh Patil',
    rating: '4.8',
    experience: '6 years',
    price: 'Rs. 549',
    image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300',
  },

  {
    id: 3,
    name: 'Rahul Deshmukh',
    rating: '5.0',
    experience: '10 years',
    price: 'Rs. 699',
    image:
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=300',
  },
];

/* =====================================================
   ANIMATED PRESSABLE
===================================================== */

function AnimatedPressable({
  children,
  onPress,
  style,
}) {
  const scale = useRef(
    new Animated.Value(1)
  ).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 6,
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
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

/* =====================================================
   ANIMATED WORKER CARD
===================================================== */

function AnimatedWorkerCard({
  worker,
  index,
}) {
  const fadeAnim = useRef(
    new Animated.Value(0)
  ).current;

  const slideAnim = useRef(
    new Animated.Value(35)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 300 + index * 150,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: 300 + index * 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.workerCard,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim,
            },
          ],
        },
      ]}
    >
      {/* Worker Image */}

      <Image
        source={{
          uri: worker.image,
        }}
        style={styles.workerImage}
      />

      {/* Worker Information */}

      <View style={styles.workerInfo}>

        <Text style={styles.workerName}>
          {worker.name}
        </Text>

        <View style={styles.ratingRow}>

          <Ionicons
            name="star"
            size={14}
            color="#F59E0B"
          />

          <Text style={styles.ratingText}>
            {worker.rating} • {worker.experience}
          </Text>

        </View>

        <Text style={styles.price}>
          {worker.price}
        </Text>

      </View>

    </Animated.View>
  );
}

/* =====================================================
   MAIN SCREEN
===================================================== */

export default function ACscreen({
  onBack,
}) {
  const screenFade = useRef(
    new Animated.Value(0)
  ).current;

  const screenSlide = useRef(
    new Animated.Value(30)
  ).current;

  const featureFade = useRef(
    new Animated.Value(0)
  ).current;

  const featureSlide = useRef(
    new Animated.Value(25)
  ).current;

  useEffect(() => {
    /* =================================================
       SCREEN ENTRANCE ANIMATION
    ================================================= */

    Animated.parallel([
      Animated.timing(screenFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),

      Animated.timing(screenSlide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    /* =================================================
       FEATURES ANIMATION
    ================================================= */

    Animated.parallel([
      Animated.timing(featureFade, {
        toValue: 1,
        duration: 500,
        delay: 250,
        useNativeDriver: true,
      }),

      Animated.timing(featureSlide, {
        toValue: 0,
        duration: 500,
        delay: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>

      <Animated.View
        style={[
          styles.screenWrapper,
          {
            opacity: screenFade,
            transform: [
              {
                translateY: screenSlide,
              },
            ],
          },
        ]}
      >

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          contentContainerStyle={
            styles.scrollContent
          }
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <View style={styles.header}>

            {/* BACK */}

            <AnimatedPressable
              style={styles.backButton}
              onPress={onBack}
            >
              <Ionicons
                name="arrow-back"
                size={23}
                color="#111827"
              />
            </AnimatedPressable>

            {/* TITLE */}

            <Text
              style={styles.headerTitle}
              numberOfLines={1}
            >
              AC Repair & Service
            </Text>

            {/* HEADER ICONS */}

            <View style={styles.headerIcons}>

              <AnimatedPressable
                style={styles.iconButton}
                onPress={() => {
                  console.log(
                    'Favourite pressed'
                  );
                }}
              >
                <Ionicons
                  name="heart-outline"
                  size={21}
                  color="#111827"
                />
              </AnimatedPressable>

              <AnimatedPressable
                style={styles.iconButton}
                onPress={() => {
                  console.log(
                    'Share pressed'
                  );
                }}
              >
                <Ionicons
                  name="share-social-outline"
                  size={21}
                  color="#111827"
                />
              </AnimatedPressable>

            </View>

          </View>


          {/* =================================================
              IMAGE SLIDER
          ================================================= */}

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            style={styles.slider}
            contentContainerStyle={
              styles.sliderContent
            }
          >

            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1631545806609-1c7c5f3a7d9d?w=900',
              }}
              style={styles.sliderImage}
            />

            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=900',
              }}
              style={styles.sliderImage}
            />

            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=900',
              }}
              style={styles.sliderImage}
            />

          </ScrollView>


          {/* =================================================
              WHY CHOOSE US
          ================================================= */}

          <Animated.View
            style={[
              styles.section,
              {
                opacity: featureFade,
                transform: [
                  {
                    translateY: featureSlide,
                  },
                ],
              },
            ]}
          >

            <View style={styles.sectionHeader}>

              <View
                style={styles.sectionAccent}
              />

              <Text
                style={styles.sectionTitle}
              >
                Why choose us
              </Text>

            </View>


            <View style={styles.featureRow}>

              {/* VERIFIED */}

              <View style={styles.featureBox}>

                <View
                  style={styles.featureIcon}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={21}
                    color="#49769F"
                  />
                </View>

                <Text
                  style={styles.featureText}
                >
                  Verified Technicians
                </Text>

              </View>


              {/* QUICK COOLING */}

              <View style={styles.featureBox}>

                <View
                  style={styles.featureIcon}
                >
                  <Ionicons
                    name="snow"
                    size={21}
                    color="#49769F"
                  />
                </View>

                <Text
                  style={styles.featureText}
                >
                  Quick Cooling
                </Text>

              </View>


              {/* TOP RATED */}

              <View style={styles.featureBox}>

                <View
                  style={styles.featureIcon}
                >
                  <Ionicons
                    name="star"
                    size={21}
                    color="#49769F"
                  />
                </View>

                <Text
                  style={styles.featureText}
                >
                  Top Rated
                </Text>

              </View>

            </View>

          </Animated.View>


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <View style={styles.section}>

            <View style={styles.sectionHeader}>

              <View
                style={styles.sectionAccent}
              />

              <Text
                style={styles.sectionTitle}
              >
                Description
              </Text>

            </View>


            <View
              style={styles.descriptionCard}
            >

              <Text
                style={styles.description}
              >
                Professional AC repair and
                maintenance services for split
                AC, window AC, inverter AC and
                other cooling systems. Our
                experienced technicians provide
                AC servicing, repair, installation,
                gas refilling and troubleshooting
                at your doorstep. Get reliable
                service and keep your home cool
                and comfortable.
              </Text>

            </View>

          </View>


          {/* =================================================
              EXPLORE TECHNICIANS
          ================================================= */}

          <View style={styles.section}>

            <View style={styles.technicianHeader}>

              <View>

                <View
                  style={styles.sectionHeader}
                >

                  <View
                    style={
                      styles.sectionAccent
                    }
                  />

                  <Text
                    style={styles.sectionTitle}
                  >
                    Explore AC Technicians
                  </Text>

                </View>

                <Text
                  style={
                    styles.technicianSubtitle
                  }
                >
                  Choose a trusted technician
                  for your AC service
                </Text>

              </View>

            </View>


            {/* WORKERS */}

            {acWorkers.map(
              (worker, index) => (

                <AnimatedWorkerCard
                  key={worker.id}
                  worker={worker}
                  index={index}
                />

              )
            )}

          </View>


        </ScrollView>

      </Animated.View>

    </SafeAreaView>
  );
}


/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({

  /* =====================================================
     GENERAL
  ===================================================== */

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  screenWrapper: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 30,
    paddingBottom: 45,
  },

  /* =====================================================
     HEADER
  ===================================================== */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,

    backgroundColor: '#EAF3FA',

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#DDE8F0',
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',

    fontSize: 19,
    fontWeight: '800',

    color: '#111827',

    marginHorizontal: 10,

    letterSpacing: -0.3,
  },

  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconButton: {
    width: 41,
    height: 41,
    borderRadius: 13,

    backgroundColor: '#EAF3FA',

    justifyContent: 'center',
    alignItems: 'center',

    marginLeft: 8,

    borderWidth: 1,
    borderColor: '#DDE8F0',
  },

  /* =====================================================
     IMAGE SLIDER
  ===================================================== */

  slider: {
    marginTop: 5,
  },

  sliderContent: {
    paddingLeft: 20,
    paddingRight: 5,
  },

  sliderImage: {
    width: 325,
    height: 220,

    borderRadius: 22,

    marginRight: 15,
  },

  /* =====================================================
     SECTIONS
  ===================================================== */

  section: {
    paddingHorizontal: 20,
    marginTop: 28,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionAccent: {
    width: 4,
    height: 21,

    borderRadius: 3,

    backgroundColor: '#49769F',

    marginRight: 9,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',

    color: '#111827',

    letterSpacing: -0.3,
  },

  /* =====================================================
     FEATURES
  ===================================================== */

  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  featureBox: {
    flex: 1,

    minHeight: 112,

    backgroundColor: '#EAF3FA',

    borderRadius: 18,

    paddingVertical: 15,
    paddingHorizontal: 5,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderColor: '#E0E8EF',

    elevation: 2,

    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 5,

    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  featureIcon: {
    width: 43,
    height: 43,

    borderRadius: 14,

    backgroundColor: '#FFFFFF',

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 7,
  },

  featureText: {
    fontSize: 11.5,

    textAlign: 'center',

    color: '#111827',

    fontWeight: '700',

    lineHeight: 16,

    paddingHorizontal: 3,
  },

  /* =====================================================
     DESCRIPTION
  ===================================================== */

  descriptionCard: {
    backgroundColor: '#F8FAFC',

    borderRadius: 18,

    padding: 17,

    borderWidth: 1,

    borderColor: '#E5EAF0',
  },

  description: {
    fontSize: 14.5,

    lineHeight: 23,

    color: '#4B5563',

    fontWeight: '500',
  },

  /* =====================================================
     TECHNICIANS
  ===================================================== */

  technicianSubtitle: {
    fontSize: 12.5,

    color: '#64748B',

    marginTop: -5,

    marginBottom: 16,

    paddingLeft: 13,
  },

  technicianHeader: {
    width: '100%',
  },

  /* =====================================================
     WORKER CARD
  ===================================================== */

  workerCard: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#F8FAFC',

    borderRadius: 19,

    padding: 14,

    marginBottom: 14,

    borderWidth: 1,

    borderColor: '#E2E8F0',

    elevation: 3,

    shadowColor: '#000',

    shadowOpacity: 0.05,

    shadowRadius: 7,

    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  workerImage: {
    width: 62,
    height: 62,

    borderRadius: 18,

    backgroundColor: '#EAF3FA',
  },

  workerInfo: {
    flex: 1,

    marginLeft: 13,

    paddingRight: 5,
  },

  workerName: {
    fontSize: 16.5,

    fontWeight: '800',

    color: '#111827',
  },

  ratingRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 5,
  },

  ratingText: {
    marginLeft: 5,

    color: '#64748B',

    fontSize: 12.5,

    fontWeight: '500',
  },

  price: {
    marginTop: 6,

    fontSize: 15,

    fontWeight: '800',

    color: '#49769F',
  },

});