import React, { useEffect, useRef } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Animated,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

// =====================================================
// COLORS
// =====================================================

const COLORS = {
  blue: '#49769F',
  dark: '#1F2937',
  gray: '#64748B',
  lightGray: '#94A3B8',
  white: '#FFFFFF',
  background: '#F7FAFC',
  border: '#E2E8F0',
  softBlue: '#EAF3FA',
  green: '#22C55E',
};


// =====================================================
// BOOK WORKER SCREEN
// =====================================================

export default function Bookscreen({
  worker,
  serviceRequest,
  onBack,
  onConfirmBooking,
}) {

  // ===================================================
  // ANIMATION
  // ===================================================

  const opacity = useRef(
    new Animated.Value(0)
  ).current;

  const translateY = useRef(
    new Animated.Value(25)
  ).current;


  useEffect(() => {

    Animated.parallel([

      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),

      Animated.spring(translateY, {
        toValue: 0,
        speed: 14,
        bounciness: 5,
        useNativeDriver: true,
      }),

    ]).start();

  }, []);


  // ===================================================
  // WORKER
  // ===================================================

  const currentWorker = {

    name: 'Amit Kulkarni',

    service: 'Plumbing',

    distance: 2.4,

    rating: 4.8,

    reviews: 124,

    photo: worker.photo || worker.profile_picture || 
           `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name || 'Worker')}&background=49769F&color=fff&size=200`,

    ...worker,

  };


  // ===================================================
  // REQUEST DATA
  // ===================================================

  const request =
    serviceRequest || {};


  // ===================================================
  // SERVICE
  // ===================================================

  const displayService =
    request.service ||
    currentWorker.service ||
    'Home Service';


  // ===================================================
  // DATE
  // ===================================================

  const displayDate =
    request.dateText ||

    (
      request.date instanceof Date
        ? request.date.toLocaleDateString(
            'en-IN',
            {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }
          )
        : request.date
    ) ||

    'Not selected';


  // ===================================================
  // TIME
  // ===================================================

  const displayTime =
    request.timeText ||

    (
      request.time instanceof Date
        ? request.time.toLocaleTimeString(
            'en-IN',
            {
              hour: '2-digit',
              minute: '2-digit',
            }
          )
        : request.time
    ) ||

    'Not selected';


  // ===================================================
  // ADDRESS
  // ===================================================

  const displayAddress =
    request.address ||
    'Not available';


  // ===================================================
  // DESCRIPTION
  // ===================================================

  const displayDescription =
    request.description ||
    'No description provided';


  // ===================================================
  // NAME
  // ===================================================

  const displayName =
    request.name ||
    'Not provided';


  // ===================================================
  // SCREEN
  // ===================================================

  return (

    <SafeAreaView
      style={styles.container}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <View
        style={styles.header}
      >

        <Pressable
          style={styles.backButton}
          onPress={onBack}
        >

          <Ionicons
            name="arrow-back"
            size={23}
            color={COLORS.dark}
          />

        </Pressable>


        <Text
          style={styles.headerTitle}
        >
          Book Worker
        </Text>


        <View
          style={styles.headerSpace}
        />

      </View>


      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity,

            transform: [
              {
                translateY,
              },
            ],
          },
        ]}
      >

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >

          {/* =================================================
              CONFIRMATION ICON
          ================================================= */}

          <View
            style={
              styles.confirmationCircle
            }
          >

            <Ionicons
              name="checkmark"
              size={34}
              color={COLORS.white}
            />

          </View>


          <Text
            style={styles.pageTitle}
          >
            Confirm Your Booking
          </Text>


          <Text
            style={styles.pageSubtitle}
          >
            Review the service and worker
            details before confirming your booking.
          </Text>


          {/* =================================================
              WORKER CARD
          ================================================= */}

          <View
            style={styles.workerCard}
          >

            <Image
              source={{
                uri:
                  currentWorker.photo,
              }}
              style={
                styles.workerPhoto
              }
            />


            <View
              style={styles.workerInfo}
            >

              <Text
                style={styles.workerName}
              >
                {currentWorker.name}
              </Text>


              <Text
                style={styles.workerService}
              >
                {currentWorker.service}
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
                  {currentWorker.rating}
                </Text>


                <Text
                  style={styles.reviews}
                >
                  ({currentWorker.reviews} reviews)
                </Text>

              </View>

            </View>


            <View
              style={
                styles.verifiedBadge
              }
            >

              <Ionicons
                name="checkmark-circle"
                size={14}
                color={COLORS.green}
              />

              <Text
                style={
                  styles.verifiedText
                }
              >
                Verified
              </Text>

            </View>

          </View>


          {/* =================================================
              YOUR DETAILS
          ================================================= */}

          <Text
            style={styles.sectionTitle}
          >
            Your Details
          </Text>


          <View
            style={styles.detailsCard}
          >

            {/* NAME */}

            <View
              style={styles.detailRow}
            >

              <View
                style={styles.detailIcon}
              >

                <Ionicons
                  name="person-outline"
                  size={19}
                  color={COLORS.blue}
                />

              </View>


              <View
                style={styles.detailText}
              >

                <Text
                  style={styles.detailLabel}
                >
                  Name
                </Text>


                <Text
                  style={styles.detailValue}
                >
                  {displayName}
                </Text>

              </View>

            </View>


            {/* SERVICE */}

            <View
              style={styles.detailRow}
            >

              <View
                style={styles.detailIcon}
              >

                <Ionicons
                  name="construct-outline"
                  size={19}
                  color={COLORS.blue}
                />

              </View>


              <View
                style={styles.detailText}
              >

                <Text
                  style={styles.detailLabel}
                >
                  Service
                </Text>


                <Text
                  style={styles.detailValue}
                >
                  {displayService}
                </Text>

              </View>

            </View>


            {/* DATE */}

            <View
              style={styles.detailRow}
            >

              <View
                style={styles.detailIcon}
              >

                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color={COLORS.blue}
                />

              </View>


              <View
                style={styles.detailText}
              >

                <Text
                  style={styles.detailLabel}
                >
                  Date
                </Text>


                <Text
                  style={styles.detailValue}
                >
                  {displayDate}
                </Text>

              </View>

            </View>


            {/* TIME */}

            <View
              style={styles.detailRow}
            >

              <View
                style={styles.detailIcon}
              >

                <Ionicons
                  name="time-outline"
                  size={19}
                  color={COLORS.blue}
                />

              </View>


              <View
                style={styles.detailText}
              >

                <Text
                  style={styles.detailLabel}
                >
                  Time
                </Text>


                <Text
                  style={styles.detailValue}
                >
                  {displayTime}
                </Text>

              </View>

            </View>


            {/* ADDRESS */}

            <View
              style={styles.detailRow}
            >

              <View
                style={styles.detailIcon}
              >

                <Ionicons
                  name="location-outline"
                  size={19}
                  color={COLORS.blue}
                />

              </View>


              <View
                style={styles.detailText}
              >

                <Text
                  style={styles.detailLabel}
                >
                  Service Address
                </Text>


                <Text
                  style={styles.detailValue}
                >
                  {displayAddress}
                </Text>

              </View>

            </View>


            {/* DESCRIPTION */}

            <View
              style={[
                styles.detailRow,
                styles.lastDetailRow,
              ]}
            >

              <View
                style={styles.detailIcon}
              >

                <Ionicons
                  name="document-text-outline"
                  size={19}
                  color={COLORS.blue}
                />

              </View>


              <View
                style={styles.detailText}
              >

                <Text
                  style={styles.detailLabel}
                >
                  Work Description
                </Text>


                <Text
                  style={styles.detailValue}
                >
                  {displayDescription}
                </Text>

              </View>

            </View>

          </View>


          {/* =================================================
              BOOKING INFORMATION
          ================================================= */}

          <Text
            style={styles.sectionTitle}
          >
            Booking Information
          </Text>


          <View
            style={styles.infoBanner}
          >

            <View
              style={styles.infoIcon}
            >

              <Ionicons
                name="information-circle-outline"
                size={20}
                color={COLORS.blue}
              />

            </View>


            <Text
              style={styles.infoText}
            >
              After confirmation, your request
              will be sent to the worker. Once
              the worker accepts, the service will
              move to your In Progress section.
            </Text>

          </View>


          {/* =================================================
              CONFIRM BUTTON
          ================================================= */}

          <Pressable
            style={({ pressed }) => [
              styles.confirmButton,
              pressed &&
                styles.pressed,
            ]}
            onPress={() => {

              console.log(
                'CONFIRM & BOOK WORKER PRESSED'
              );

              if (
                typeof onConfirmBooking ===
                'function'
              ) {

                onConfirmBooking();

              }

            }}
          >

            <View
              style={
                styles.buttonCheck
              }
            >

              <Ionicons
                name="checkmark"
                size={18}
                color={COLORS.blue}
              />

            </View>


            <Text
              style={
                styles.confirmButtonText
              }
            >
              Confirm & Book Worker
            </Text>


            <Ionicons
              name="arrow-forward"
              size={20}
              color={COLORS.white}
            />

          </Pressable>


          <View
            style={styles.bottomSpace}
          />

        </ScrollView>

      </Animated.View>

    </SafeAreaView>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  animatedContainer: {
    flex: 1,
  },


  // ===================================================
  // HEADER
  // ===================================================

  header: {
    height: 70,
    marginTop: 30,

    backgroundColor:
      COLORS.white,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',

    paddingHorizontal: 20,

    borderBottomWidth: 1,

    borderBottomColor:
      COLORS.border,
  },

  backButton: {
    width: 43,
    height: 43,

    borderRadius: 22,

    backgroundColor:
      '#F1F5F9',

    justifyContent:
      'center',

    alignItems:
      'center',
  },

  headerTitle: {
    fontSize: 20,

    fontWeight: '800',

    color:
      COLORS.dark,
  },

  headerSpace: {
    width: 43,
  },


  // ===================================================
  // SCROLL
  // ===================================================

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },


  // ===================================================
  // CONFIRMATION
  // ===================================================

  confirmationCircle: {
    width: 68,
    height: 68,

    borderRadius: 34,

    backgroundColor:
      COLORS.blue,

    justifyContent:
      'center',

    alignItems:
      'center',

    alignSelf:
      'center',

    marginTop: 10,
  },

  pageTitle: {
    fontSize: 25,

    fontWeight: '800',

    color:
      COLORS.dark,

    textAlign:
      'center',

    marginTop: 15,
  },

  pageSubtitle: {
    fontSize: 13,

    lineHeight: 20,

    color:
      COLORS.gray,

    textAlign:
      'center',

    marginTop: 6,

    marginBottom: 23,
  },


  // ===================================================
  // WORKER CARD
  // ===================================================

  workerCard: {
    backgroundColor:
      COLORS.white,

    borderRadius: 18,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    padding: 15,

    flexDirection: 'row',

    alignItems:
      'center',
  },

  workerPhoto: {
    width: 65,
    height: 65,

    borderRadius: 18,

    backgroundColor:
      '#E2E8F0',
  },

  workerInfo: {
    flex: 1,

    marginLeft: 12,
  },

  workerName: {
    fontSize: 17,

    fontWeight: '800',

    color:
      COLORS.dark,
  },

  workerService: {
    fontSize: 12,

    color:
      COLORS.gray,

    marginTop: 3,
  },

  ratingRow: {
    flexDirection: 'row',

    alignItems:
      'center',

    marginTop: 5,
  },

  rating: {
    fontSize: 12,

    fontWeight: '800',

    color:
      COLORS.dark,

    marginLeft: 4,
  },

  reviews: {
    fontSize: 10,

    color:
      COLORS.lightGray,

    marginLeft: 3,
  },

  verifiedBadge: {
    flexDirection: 'row',

    alignItems:
      'center',

    backgroundColor:
      '#ECFDF5',

    borderRadius: 9,

    paddingHorizontal: 7,

    paddingVertical: 5,
  },

  verifiedText: {
    fontSize: 9,

    fontWeight: '700',

    color:
      COLORS.green,

    marginLeft: 3,
  },


  // ===================================================
  // DETAILS
  // ===================================================

  sectionTitle: {
    fontSize: 17,

    fontWeight: '800',

    color:
      COLORS.dark,

    marginTop: 24,

    marginBottom: 11,
  },

  detailsCard: {
    backgroundColor:
      COLORS.white,

    borderRadius: 18,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    padding: 15,
  },

  detailRow: {
    flexDirection: 'row',

    alignItems:
      'flex-start',

    marginBottom: 15,
  },

  lastDetailRow: {
    marginBottom: 0,
  },

  detailIcon: {
    width: 39,
    height: 39,

    borderRadius: 12,

    backgroundColor:
      COLORS.softBlue,

    justifyContent:
      'center',

    alignItems:
      'center',
  },

  detailText: {
    flex: 1,

    marginLeft: 10,
  },

  detailLabel: {
    fontSize: 10,

    color:
      COLORS.lightGray,
  },

  detailValue: {
    fontSize: 13,

    fontWeight: '600',

    color:
      COLORS.dark,

    marginTop: 3,

    lineHeight: 19,
  },


  // ===================================================
  // INFO
  // ===================================================

  infoBanner: {
    flexDirection: 'row',

    alignItems:
      'flex-start',

    backgroundColor:
      COLORS.softBlue,

    borderRadius: 14,

    padding: 13,

    borderWidth: 1,

    borderColor:
      '#D6E7F2',
  },

  infoIcon: {
    marginTop: 1,
  },

  infoText: {
    flex: 1,

    fontSize: 11,

    lineHeight: 18,

    color:
      COLORS.gray,

    marginLeft: 8,
  },


  // ===================================================
  // CONFIRM BUTTON
  // ===================================================

  confirmButton: {
    height: 57,

    borderRadius: 16,

    backgroundColor:
      COLORS.blue,

    flexDirection: 'row',

    alignItems:
      'center',

    justifyContent:
      'center',

    paddingHorizontal: 15,

    marginTop: 25,

    elevation: 4,

    shadowColor:
      COLORS.blue,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.2,

    shadowRadius: 6,
  },

  buttonCheck: {
    width: 28,
    height: 28,

    borderRadius: 14,

    backgroundColor:
      COLORS.white,

    justifyContent:
      'center',

    alignItems:
      'center',

    marginRight: 8,
  },

  confirmButtonText: {
    color:
      COLORS.white,

    fontSize: 14,

    fontWeight: '800',

    marginRight: 8,
  },

  pressed: {
    opacity: 0.75,

    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  bottomSpace: {
    height: 25,
  },

});