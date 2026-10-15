import React, { useEffect, useRef } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

// =====================================================
// TRACK WORKER SCREEN
// =====================================================

export default function Trackworker({ onBack, onHome }) {

  // =====================================================
  // ANIMATIONS
  // =====================================================

  const cardAnim = useRef(
    new Animated.Value(100)
  ).current;

  const statusAnim = useRef(
    new Animated.Value(0)
  ).current;

  const workerAnim = useRef(
    new Animated.Value(0)
  ).current;

  const arrivalAnim = useRef(
    new Animated.Value(0)
  ).current;

  const buttonAnim = useRef(
    new Animated.Value(0)
  ).current;

  // Button animations
  const backScale = useRef(
    new Animated.Value(1)
  ).current;

  const callScale = useRef(
    new Animated.Value(1)
  ).current;

  const homeScale = useRef(
    new Animated.Value(1)
  ).current;


  // =====================================================
  // SCREEN ENTRY ANIMATION
  // =====================================================

  useEffect(() => {

    Animated.parallel([

      // Bottom card
      Animated.spring(cardAnim, {
        toValue: 0,
        tension: 55,
        friction: 8,
        useNativeDriver: true,
      }),

      // Status
      Animated.timing(statusAnim, {
        toValue: 1,
        duration: 500,
        delay: 250,
        useNativeDriver: true,
      }),

      // Worker
      Animated.timing(workerAnim, {
        toValue: 1,
        duration: 500,
        delay: 400,
        useNativeDriver: true,
      }),

      // Arrival
      Animated.timing(arrivalAnim, {
        toValue: 1,
        duration: 500,
        delay: 550,
        useNativeDriver: true,
      }),

      // Home button
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 500,
        delay: 700,
        useNativeDriver: true,
      }),

    ]).start();

  }, []);


  // =====================================================
  // PRESS ANIMATION
  // =====================================================

  const pressAnimation = (
    animation,
    callback
  ) => {

    Animated.sequence([

      Animated.timing(animation, {
        toValue: 0.94,
        duration: 80,
        useNativeDriver: true,
      }),

      Animated.timing(animation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),

    ]).start(() => {

      if (
        typeof callback === 'function'
      ) {
        callback();
      }

    });

  };


  // =====================================================
  // BACK TO BOOKING CONFIRMED
  // =====================================================

  const handleBack = () => {

    console.log(
      'Track Worker → Booking Confirmed'
    );

    if (typeof onBack === 'function') {

      onBack();

    } else {

      console.warn(
        'Trackworker: onBack function is not connected.'
      );

    }

  };


  // =====================================================
  // GO HOME
  // =====================================================

  const handleHome = () => {

    console.log(
      'Track Worker → Home'
    );

    if (typeof onHome === 'function') {

      onHome();

    } else {

      console.warn(
        'Trackworker: onHome function is not connected.'
      );

    }

  };


  // =====================================================
  // SCREEN
  // =====================================================

  return (

    <SafeAreaView
      style={styles.container}
    >

      {/* =================================================
          MAP
      ================================================= */}

      <View
        style={styles.mapContainer}
      >

        <MapView
          style={styles.map}

          initialRegion={{
            latitude: 18.5204,
            longitude: 73.8567,
            latitudeDelta: 0.025,
            longitudeDelta: 0.025,
          }}
        >

          {/* =============================================
              WORKER LOCATION
          ============================================= */}

          <Marker
            coordinate={{
              latitude: 18.5235,
              longitude: 73.8580,
            }}

            title="Rohit Deshmukh"

            description="Your worker"
          >

            <View
              style={styles.workerMarker}
            >

              <Ionicons
                name="person"
                size={22}
                color={COLORS.white}
              />

            </View>

          </Marker>


          {/* =============================================
              USER LOCATION
          ============================================= */}

          <Marker
            coordinate={{
              latitude: 18.5204,
              longitude: 73.8567,
            }}

            title="Your Location"
          >

            <View
              style={styles.userMarker}
            >

              <Ionicons
                name="home"
                size={20}
                color={COLORS.white}
              />

            </View>

          </Marker>

        </MapView>


        {/* =============================================
            MAP BACK BUTTON
        ============================================= */}

        <Animated.View
          style={[
            styles.mapBackAnimated,

            {
              transform: [
                {
                  scale: backScale,
                },
              ],
            },
          ]}
        >

          <Pressable

            style={({ pressed }) => [

              styles.mapBackButton,

              pressed &&
                styles.iconPressed,

            ]}

            onPress={() =>
              pressAnimation(
                backScale,
                handleBack
              )
            }

          >

            <Ionicons
              name="arrow-back"
              size={24}
              color={COLORS.dark}
            />

          </Pressable>

        </Animated.View>


        {/* =============================================
            LIVE STATUS BADGE
        ============================================= */}

        <View
          style={styles.mapStatusBadge}
        >

          <View
            style={styles.liveDot}
          />

          <Text
            style={styles.mapStatusText}
          >
            Worker is on the way
          </Text>

        </View>

      </View>


      {/* =================================================
          BOTTOM TRACKING CARD
      ================================================= */}

      <Animated.View
        style={[
          styles.trackingCard,

          {
            transform: [
              {
                translateY: cardAnim,
              },
            ],
          },
        ]}
      >

        {/* DRAG HANDLE */}

        <View
          style={styles.dragHandle}
        />


        {/* =================================================
            WORKER STATUS
        ================================================= */}

        <Animated.View
          style={{

            opacity: statusAnim,

            transform: [
              {
                translateY:
                  statusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 0],
                  }),
              },
            ],

          }}
        >

          <View
            style={styles.statusRow}
          >

            <View
              style={styles.statusIcon}
            >

              <Ionicons
                name="navigate"
                size={24}
                color={COLORS.white}
              />

            </View>


            <View
              style={styles.statusTextContainer}
            >

              <Text
                style={styles.arrivalTitle}
              >
                Your worker is on the way
              </Text>

              <Text
                style={styles.arrivalSubtitle}
              >
                Rohit is heading to your location
              </Text>

            </View>


            <View
              style={styles.etaBox}
            >

              <Text
                style={styles.eta}
              >
                18
              </Text>

              <Text
                style={styles.min}
              >
                min
              </Text>

            </View>

          </View>

        </Animated.View>


        {/* =================================================
            WORKER INFORMATION
        ================================================= */}

        <Animated.View
          style={{

            opacity: workerAnim,

            transform: [
              {
                translateY:
                  workerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 0],
                  }),
              },
            ],

          }}
        >

          <View
            style={styles.workerRow}
          >

            {/* AVATAR */}

            <View
              style={styles.avatar}
            >

              <Ionicons
                name="person"
                size={28}
                color={COLORS.primary}
              />

              <View
                style={styles.onlineDot}
              />

            </View>


            {/* WORKER DETAILS */}

            <View
              style={styles.workerInfo}
            >

              <Text
                style={styles.workerName}
              >
                Rohit Deshmukh
              </Text>


              <View
                style={styles.ratingRow}
              >

                <Ionicons
                  name="star"
                  size={15}
                  color="#F59E0B"
                />

                <Text
                  style={styles.rating}
                >
                  4.9 • 8 years experience
                </Text>

              </View>

            </View>


            {/* CALL BUTTON */}

            <Animated.View
              style={{
                transform: [
                  {
                    scale: callScale,
                  },
                ],
              }}
            >

              <Pressable

                style={({ pressed }) => [

                  styles.callButton,

                  pressed &&
                    styles.callPressed,

                ]}

                onPress={() =>
                  pressAnimation(
                    callScale
                  )
                }

              >

                <Ionicons
                  name="call"
                  size={20}
                  color={COLORS.primary}
                />

              </Pressable>

            </Animated.View>

          </View>

        </Animated.View>


        {/* =================================================
            ARRIVAL INFORMATION
        ================================================= */}

        <Animated.View
          style={{

            opacity: arrivalAnim,

            transform: [
              {
                translateY:
                  arrivalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 0],
                  }),
              },
            ],

          }}
        >

          <View
            style={styles.arrivalBox}
          >

            {/* ICON */}

            <View
              style={styles.arrivalIcon}
            >

              <Ionicons
                name="time-outline"
                size={22}
                color={COLORS.primary}
              />

            </View>


            {/* ARRIVAL INFO */}

            <View
              style={styles.arrivalInfo}
            >

              <Text
                style={styles.arrivalLabel}
              >
                Estimated arrival
              </Text>

              <Text
                style={styles.arrivalTime}
              >
                10:18 AM
              </Text>

            </View>


            {/* ARRIVING BADGE */}

            <View
              style={styles.arrivingBadge}
            >

              <View
                style={styles.arrivingDot}
              />

              <Text
                style={styles.arrivingText}
              >
                Arriving
              </Text>

            </View>

          </View>

        </Animated.View>


        {/* =================================================
            HOME BUTTON
        ================================================= */}

        <Animated.View
          style={{

            opacity: buttonAnim,

            transform: [

              {
                translateY:
                  buttonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 0],
                  }),
              },

              {
                scale: homeScale,
              },

            ],

          }}
        >

          <Pressable

            style={({ pressed }) => [

              styles.homeButton,

              pressed &&
                styles.homeButtonPressed,

            ]}

            onPress={() =>
              pressAnimation(
                homeScale,
                handleHome
              )
            }

          >

            <Ionicons
              name="home-outline"
              size={19}
              color={COLORS.white}
            />

            <Text
              style={styles.homeButtonText}
            >
              Back to Home
            </Text>

          </Pressable>

        </Animated.View>

      </Animated.View>

    </SafeAreaView>
  );
}


// =====================================================
// COLORS
// =====================================================

const COLORS = {

  primary: '#49769F',

  secondary: '#4E8EA2',

  dark: '#2A2A2A',

  white: '#FFFFFF',

  background: '#F7FAFC',

  softBlue: '#EAF3FA',

  border: '#E5E7EB',

  muted: '#64748B',

  lightText: '#94A3B8',

  green: '#22C55E',

};


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  // ===================================================
  // CONTAINER
  // ===================================================

  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },


  // ===================================================
  // MAP
  // ===================================================

  mapContainer: {
    flex: 1,
    position: 'relative',
  },

  map: {
    width: '100%',
    height: '100%',
  },


  // ===================================================
  // MAP BACK BUTTON
  // ===================================================

  mapBackAnimated: {
    position: 'absolute',
    top: 20,
    left: 20,
  },

  mapBackButton: {
    width: 48,
    height: 48,

    borderRadius: 24,

    backgroundColor: COLORS.white,

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.15,

    shadowRadius: 6,

    elevation: 5,
  },

  iconPressed: {
    backgroundColor: '#F1F5F9',
  },


  // ===================================================
  // MAP STATUS
  // ===================================================

  mapStatusBadge: {

    position: 'absolute',

    top: 22,
    right: 20,

    backgroundColor: COLORS.white,

    borderRadius: 20,

    paddingHorizontal: 13,
    paddingVertical: 9,

    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.12,

    shadowRadius: 5,

    elevation: 4,
  },

  liveDot: {

    width: 8,
    height: 8,

    borderRadius: 4,

    backgroundColor: COLORS.green,

    marginRight: 7,
  },

  mapStatusText: {

    fontSize: 12,

    fontWeight: '600',

    color: COLORS.dark,
  },


  // ===================================================
  // MARKERS
  // ===================================================

  workerMarker: {

    width: 45,
    height: 45,

    borderRadius: 23,

    backgroundColor: COLORS.primary,

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 3,

    borderColor: COLORS.white,
  },

  userMarker: {

    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: COLORS.dark,

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 3,

    borderColor: COLORS.white,
  },


  // ===================================================
  // TRACKING CARD
  // ===================================================

  trackingCard: {

    backgroundColor: COLORS.white,

    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,

    paddingHorizontal: 20,

    paddingTop: 12,

    paddingBottom: 25,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: -4,
    },

    shadowOpacity: 0.08,

    shadowRadius: 10,

    elevation: 10,
  },

  dragHandle: {

    width: 45,
    height: 5,

    borderRadius: 3,

    backgroundColor: '#CBD5E1',

    alignSelf: 'center',

    marginBottom: 20,
  },


  // ===================================================
  // STATUS
  // ===================================================

  statusRow: {

    flexDirection: 'row',

    alignItems: 'center',
  },

  statusIcon: {

    width: 50,
    height: 50,

    borderRadius: 25,

    backgroundColor: COLORS.primary,

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 13,
  },

  statusTextContainer: {

    flex: 1,
  },

  arrivalTitle: {

    fontSize: 16,

    fontWeight: '700',

    color: '#111827',
  },

  arrivalSubtitle: {

    fontSize: 12,

    color: COLORS.muted,

    marginTop: 4,
  },

  etaBox: {

    alignItems: 'center',

    backgroundColor: COLORS.softBlue,

    borderRadius: 12,

    paddingHorizontal: 12,

    paddingVertical: 7,
  },

  eta: {

    fontSize: 20,

    fontWeight: '800',

    color: COLORS.primary,
  },

  min: {

    fontSize: 10,

    color: COLORS.muted,
  },


  // ===================================================
  // WORKER
  // ===================================================

  workerRow: {

    marginTop: 22,

    paddingTop: 18,

    borderTopWidth: 1,

    borderTopColor: COLORS.border,

    flexDirection: 'row',

    alignItems: 'center',
  },

  avatar: {

    width: 55,
    height: 55,

    borderRadius: 28,

    backgroundColor: COLORS.softBlue,

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 13,

    position: 'relative',
  },

  onlineDot: {

    position: 'absolute',

    right: 1,

    bottom: 2,

    width: 12,

    height: 12,

    borderRadius: 6,

    backgroundColor: COLORS.green,

    borderWidth: 2,

    borderColor: COLORS.white,
  },

  workerInfo: {

    flex: 1,
  },

  workerName: {

    fontSize: 16,

    fontWeight: '700',

    color: '#111827',
  },

  ratingRow: {

    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 5,
  },

  rating: {

    marginLeft: 5,

    fontSize: 12,

    color: COLORS.muted,
  },


  // ===================================================
  // CALL
  // ===================================================

  callButton: {

    width: 45,
    height: 45,

    borderRadius: 23,

    backgroundColor: COLORS.softBlue,

    justifyContent: 'center',
    alignItems: 'center',
  },

  callPressed: {

    backgroundColor: '#DCEAF4',
  },


  // ===================================================
  // ARRIVAL
  // ===================================================

  arrivalBox: {

    marginTop: 18,

    backgroundColor: '#F8FAFC',

    borderRadius: 15,

    padding: 14,

    flexDirection: 'row',

    alignItems: 'center',

    borderWidth: 1,

    borderColor: '#EEF2F6',
  },

  arrivalIcon: {

    width: 42,
    height: 42,

    borderRadius: 13,

    backgroundColor: COLORS.softBlue,

    justifyContent: 'center',
    alignItems: 'center',
  },

  arrivalInfo: {

    marginLeft: 12,

    flex: 1,
  },

  arrivalLabel: {

    fontSize: 12,

    color: COLORS.muted,
  },

  arrivalTime: {

    fontSize: 17,

    fontWeight: '700',

    color: '#111827',

    marginTop: 3,
  },

  arrivingBadge: {

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#ECFDF5',

    paddingHorizontal: 9,

    paddingVertical: 6,

    borderRadius: 12,
  },

  arrivingDot: {

    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor: COLORS.green,

    marginRight: 5,
  },

  arrivingText: {

    fontSize: 10,

    fontWeight: '700',

    color: '#16A34A',
  },


  // ===================================================
  // HOME BUTTON
  // ===================================================

  homeButton: {

    marginTop: 18,

    height: 52,

    borderRadius: 14,

    backgroundColor: COLORS.primary,

    justifyContent: 'center',
    alignItems: 'center',

    flexDirection: 'row',

    shadowColor: COLORS.primary,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.18,

    shadowRadius: 7,

    elevation: 4,
  },

  homeButtonPressed: {

    backgroundColor: '#3E6689',
  },

  homeButtonText: {

    color: COLORS.white,

    fontSize: 16,

    fontWeight: '700',

    marginLeft: 8,
  },

});