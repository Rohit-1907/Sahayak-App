import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Animated,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { translate, translateService } from '../utils/translations';
import { useTextToSpeech } from '../utils/useTextToSpeech';
import VoiceGuidanceButton from '../components/VoiceGuidanceButton';

/* =====================================================
   COLORS
===================================================== */

const PRIMARY = '#49769F';

const COLORS = {
  primary: '#49769F',
  dark: '#111827',
  gray: '#64748B',
  lightGray: '#94A3B8',
  white: '#FFFFFF',

  background: '#F7FAFC',
  border: '#E5E7EB',

  softBlue: '#F3F8FC',

  green: '#059669',
  greenBg: '#ECFDF5',

  orange: '#EA580C',
  orangeBg: '#FFF7ED',

  requestedBg: '#EFF6FF',

  red: '#EF4444',
};


/* =====================================================
   HELPER
===================================================== */

const getBookingStatusLabel = (status, language) => {

  switch (status) {

    case 'requested':
      return translate(language, 'statusRequested');

    case 'scheduled':
      return translate(language, 'statusScheduled');

    case 'inProgress':
      return translate(language, 'inProgress');

    case 'paymentPending':
      return translate(language, 'paymentPending');

    case 'completed':
      return translate(language, 'completed');

    case 'rejected':
      return translate(language, 'statusRejected');

    case 'cancelled':
      return translate(language, 'statusCancelled');

    default:
      return translate(language, 'statusBooking');

  }
};


/* =====================================================
   HELPER
===================================================== */

const getBookingIcon = (booking) => {

  if (booking?.icon) {
    return booking.icon;
  }

  const service =
    String(
      booking?.service || ''
    ).toLowerCase();

  if (
    service.includes('plumb')
  ) {
    return 'water-outline';
  }

  if (
    service.includes('paint')
  ) {
    return 'color-palette-outline';
  }

  if (
    service.includes('clean')
  ) {
    return 'sparkles-outline';
  }

  if (
    service.includes('electric')
  ) {
    return 'flash-outline';
  }

  if (
    service.includes('carpent')
  ) {
    return 'hammer-outline';
  }

  if (
    service.includes('ac')
  ) {
    return 'snow-outline';
  }

  return 'construct-outline';
};


/* =====================================================
   ANIMATED BUTTON
===================================================== */

function AnimatedButton({
  children,
  style,
  onPress,
}) {

  const scale = useRef(
    new Animated.Value(1)
  ).current;


  const handlePressIn = () => {

    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 25,
      bounciness: 3,
    }).start();

  };


  const handlePressOut = () => {

    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 5,
    }).start();

  };


  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            {
              scale,
            },
          ],
        },
      ]}
    >

      <Pressable
        delayPressIn={0}
        onPress={onPress}
        onPressIn={
          handlePressIn
        }
        onPressOut={
          handlePressOut
        }
      >

        {children}

      </Pressable>

    </Animated.View>
  );
}


/* =====================================================
   STATUS BADGE
===================================================== */

function StatusBadge({
  status,
  language,
}) {

  const label =
    getBookingStatusLabel(
      status,
      language
    );


  let containerStyle =
    styles.requestedBadge;

  let textStyle =
    styles.requestedText;

  let icon =
    'paper-plane-outline';

  let iconColor =
    PRIMARY;


  if (
    status === 'scheduled'
  ) {

    containerStyle =
      styles.scheduledBadge;

    textStyle =
      styles.scheduledText;

    icon =
      'calendar-outline';

    iconColor =
      PRIMARY;

  }


  if (
    status === 'inProgress'
  ) {

    containerStyle =
      styles.progressBadge;

    textStyle =
      styles.progressText;

    icon =
      'hammer-outline';

    iconColor =
      COLORS.green;

  }


  if (
    status === 'paymentPending'
  ) {

    containerStyle =
      styles.paymentBadge;

    textStyle =
      styles.paymentText;

    icon =
      'card-outline';

    iconColor =
      COLORS.orange;

  }


  if (
    status === 'completed'
  ) {

    containerStyle =
      styles.completedBadge;

    textStyle =
      styles.completedText;

    icon =
      'checkmark-circle';

    iconColor =
      COLORS.green;

  }


  return (
    <View
      style={[
        styles.statusBadge,
        containerStyle,
      ]}
    >

      <Ionicons
        name={icon}
        size={12}
        color={iconColor}
      />

      <Text
        style={[
          styles.statusText,
          textStyle,
        ]}
      >
        {label}
      </Text>

    </View>
  );
}


/* =====================================================
   BOOKING CARD
===================================================== */

function BookingCard({
  booking,
  index,
  onPress,
  language,
}) {

  const opacity = useRef(
    new Animated.Value(0)
  ).current;


  const translateY = useRef(
    new Animated.Value(25)
  ).current;


  useEffect(() => {

    Animated.parallel([

      Animated.timing(
        opacity,
        {
          toValue: 1,
          duration: 250,
          delay:
            Math.min(index * 20, 150),
          useNativeDriver: true,
        }
      ),

      Animated.spring(
        translateY,
        {
          toValue: 0,
          delay:
            Math.min(index * 20, 150),
          speed: 25,
          bounciness: 3,
          useNativeDriver: true,
        }
      ),

    ]).start();

  }, []);


  const serviceName =
    translateService(
      booking?.service ||
      booking?.work_type ||
      booking?.category,
      language
    ) ||
    translate(language, 'homeService');


  const workerName =
    booking?.workerName ||
    booking?.org_name ||
    booking?.orgName ||
    booking?.worker ||
    translate(language, 'worker');


  const icon =
    getBookingIcon(
      booking
    );


  const rawTotal =
    booking?.totalAmount != null && Number(booking.totalAmount) > 0
      ? booking.totalAmount
      : booking?.total_amount != null && Number(booking.total_amount) > 0
      ? booking.total_amount
      : booking?.service_charge != null && Number(booking.service_charge) > 0
      ? booking.service_charge
      : null;


  const totalAmount =
    rawTotal != null
      ? `Rs. ${rawTotal}`
      : booking?.price && booking?.price !== 'TBD'
      ? booking.price
      : translate(language, 'amountPending');


  return (

    <Animated.View
      style={[
        styles.bookingAnimatedContainer,
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

      <Pressable
        delayPressIn={0}
        style={({ pressed }) => [
          styles.bookingCard,

          pressed &&
            styles.bookingCardPressed,
        ]}
        onPress={() =>
          onPress(booking)
        }
      >

        {/* SERVICE ICON */}

        <View
          style={styles.serviceIcon}
        >

          <Ionicons
            name={icon}
            size={24}
            color={PRIMARY}
          />

        </View>


        {/* MAIN INFORMATION */}

        <View
          style={styles.bookingMain}
        >

          <View
            style={styles.bookingTitleRow}
          >

            <Text
              style={styles.categoryName}
              numberOfLines={1}
            >
              {serviceName}
            </Text>


            <StatusBadge
              status={
                booking?.status
              }
              language={language}
            />

          </View>


          <Text
            style={styles.workerName}
            numberOfLines={1}
          >
            {workerName}
          </Text>


          <View
            style={styles.bookingInfoRow}
          >

            <View
              style={styles.smallInfo}
            >

              <Ionicons
                name="calendar-outline"
                size={14}
                color={COLORS.gray}
              />

              <Text
                style={styles.smallInfoText}
                numberOfLines={1}
              >
                {
                  booking?.date ||
                  translate(language, 'dateNotSelected')
                }
              </Text>

            </View>


            <View
              style={styles.smallInfo}
            >

              <Ionicons
                name="time-outline"
                size={14}
                color={COLORS.gray}
              />

              <Text
                style={styles.smallInfoText}
                numberOfLines={1}
              >
                {
                  booking?.time ||
                  translate(language, 'timeNotSelected')
                }
              </Text>

            </View>

          </View>

        </View>


        {/* PRICE */}

        <View
          style={styles.cardRight}
        >

          <Text
            style={styles.cardPrice}
            numberOfLines={1}
          >
            {totalAmount}
          </Text>


          <View
            style={styles.arrowCircle}
          >

            <Ionicons
              name="chevron-forward"
              size={17}
              color={PRIMARY}
            />

          </View>

        </View>

      </Pressable>

    </Animated.View>
  );
}


/* =====================================================
   RECEIPT MODAL
===================================================== */

function ReceiptModal({
  booking,
  visible,
  onClose,
  language,
}) {

  const modalScale =
    useRef(
      new Animated.Value(0.85)
    ).current;


  const modalOpacity =
    useRef(
      new Animated.Value(0)
    ).current;


  useEffect(() => {

    if (visible) {

      modalScale.setValue(
        0.85
      );

      modalOpacity.setValue(
        0
      );


      Animated.parallel([

        Animated.spring(
          modalScale,
          {
            toValue: 1,
            speed: 18,
            bounciness: 5,
            useNativeDriver: true,
          }
        ),

        Animated.timing(
          modalOpacity,
          {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }
        ),

      ]).start();

    }

  }, [visible]);


  if (
    !visible ||
    !booking
  ) {

    return null;

  }


  const isOrg =
    booking.type === 'organization' ||
    booking.id?.toString().startsWith('org-');

  const isCompleted =
    (booking.status || '').toLowerCase() === 'completed';

  const serviceName =
    translateService(
      booking.service ||
      booking.work_type ||
      booking.category,
      language
    ) ||
    translate(language, 'homeService');


  const workerName =
    booking.workerName ||
    booking.org_name ||
    booking.orgName ||
    booking.worker ||
    (isOrg ? 'Organization' : translate(language, 'worker'));


  const icon =
    getBookingIcon(
      booking
    );


  const rawAmount =
    booking.totalAmount != null && Number(booking.totalAmount) > 0
      ? booking.totalAmount
      : booking.total_amount != null && Number(booking.total_amount) > 0
      ? booking.total_amount
      : booking.service_charge != null && Number(booking.service_charge) > 0
      ? booking.service_charge
      : null;


  const amount =
    rawAmount != null
      ? `Rs. ${rawAmount}`
      : translate(language, 'amountPending');


  const paymentMethod =
    booking.paymentMethod ||
    (booking.payment_mode ? `${booking.payment_mode} Payment` : null) ||
    booking.paymentMode ||
    translate(language, 'notAvailable');


  return (

    <View
      style={styles.modalOverlay}
    >

      {/* BACKDROP */}

      <Pressable
        style={
          styles.modalBackground
        }
        onPress={
          onClose
        }
      />


      {/* RECEIPT */}

      <Animated.View
        style={[
          styles.receiptModal,
          {
            opacity:
              modalOpacity,

            transform: [
              {
                scale:
                  modalScale,
              },
            ],
          },
        ]}
      >

        {/* HEADER */}

        <View
          style={
            styles.receiptHeader
          }
        >

          <View
            style={
              styles.receiptHeaderText
            }
          >

            <Text
              style={
                styles.receiptTitle
              }
            >
              {translate(language, 'paymentReceipt')}
            </Text>


            <Text
              style={
                styles.receiptSubtitle
              }
            >
              {isCompleted
                ? translate(language, 'paymentCompletedSuccessfully')
                : translate(language, 'bookingDetails')}
            </Text>

          </View>


          <Pressable
            style={
              styles.closeButton
            }
            onPress={
              onClose
            }
          >

            <Ionicons
              name="close"
              size={22}
              color="#374151"
            />

          </Pressable>

        </View>


        {/* SUCCESS ICON */}

        <View
          style={
            isCompleted
              ? styles.receiptSuccessCircle
              : styles.receiptPendingCircle
          }
        >

          <Ionicons
            name={
              isCompleted
                ? 'checkmark'
                : 'document-text-outline'
            }
            size={30}
            color="#FFFFFF"
          />

        </View>


        {/* SERVICE */}

        <View
          style={
            styles.receiptService
          }
        >

          <View
            style={
              styles.receiptServiceIcon
            }
          >

            <Ionicons
              name={icon}
              size={27}
              color={PRIMARY}
            />

          </View>


          <View
            style={
              styles.receiptServiceText
            }
          >

            <Text
              style={
                styles.receiptServiceName
              }
            >
              {serviceName}
            </Text>


            <Text
              style={
                styles.receiptWorker
              }
            >
              {isOrg ? 'Organization: ' : `${translate(language, 'workerLabel')} `}{workerName}
            </Text>

          </View>

        </View>


        {/* DETAILS */}

        <View
          style={
            styles.receiptDetails
          }
        >

          {/* DATE */}

          <View
            style={
              styles.receiptRow
            }
          >

            <View
              style={
                styles.receiptLabelRow
              }
            >

              <View
                style={
                  styles.receiptDetailIcon
                }
              >

                <Ionicons
                  name="calendar-outline"
                  size={17}
                  color={PRIMARY}
                />

              </View>


              <Text
                style={
                  styles.receiptLabel
                }
              >
                {translate(language, 'date')}
              </Text>

            </View>


            <Text
              style={
                styles.receiptValue
              }
            >
              {
                booking.date ||
                translate(language, 'notSelected')
              }
            </Text>

          </View>


          {/* TIME */}

          <View
            style={
              styles.receiptRow
            }
          >

            <View
              style={
                styles.receiptLabelRow
              }
            >

              <View
                style={
                  styles.receiptDetailIcon
                }
              >

                <Ionicons
                  name="time-outline"
                  size={17}
                  color={PRIMARY}
                />

              </View>


              <Text
                style={
                  styles.receiptLabel
                }
              >
                {translate(language, 'time')}
              </Text>

            </View>


            <Text
              style={
                styles.receiptValue
              }
            >
              {
                booking.time ||
                translate(language, 'notSelected')
              }
            </Text>

          </View>


          {/* ADDRESS */}

          <View
            style={
              styles.receiptRow
            }
          >

            <View
              style={
                styles.receiptLabelRow
              }
            >

              <View
                style={
                  styles.receiptDetailIcon
                }
              >

                <Ionicons
                  name="location-outline"
                  size={17}
                  color={PRIMARY}
                />

              </View>


              <Text
                style={
                  styles.receiptLabel
                }
              >
                {translate(language, 'address')}
              </Text>

            </View>


            <Text
              style={
                styles.receiptValue
              }
              numberOfLines={3}
            >
              {
                booking.address ||
                translate(language, 'notAvailable')
              }
            </Text>

          </View>


          {/* DESCRIPTION */}

          <View
            style={
              styles.receiptRow
            }
          >

            <View
              style={
                styles.receiptLabelRow
              }
            >

              <View
                style={
                  styles.receiptDetailIcon
                }
              >

                <Ionicons
                  name="document-text-outline"
                  size={17}
                  color={PRIMARY}
                />

              </View>


              <Text
                style={
                  styles.receiptLabel
                }
              >
                {translate(language, 'workLabel')}
              </Text>

            </View>


            <Text
              style={
                styles.receiptValue
              }
              numberOfLines={3}
            >
              {
                booking.description ||
                translate(language, 'noDescription')
              }
            </Text>

          </View>


          {/* PAYMENT */}

          <View
            style={
              styles.receiptRow
            }
          >

            <View
              style={
                styles.receiptLabelRow
              }
            >

              <View
                style={
                  styles.receiptDetailIcon
                }
              >

                <Ionicons
                  name="card-outline"
                  size={17}
                  color={PRIMARY}
                />

              </View>


              <Text
                style={
                  styles.receiptLabel
                }
              >
                {translate(language, 'paymentLabel')}
              </Text>

            </View>


            <Text
              style={
                styles.receiptValue
              }
            >
              {paymentMethod}
            </Text>

          </View>

        </View>


        {/* DIVIDER */}

        <View
          style={
            styles.receiptDivider
          }
        />


        {/* TOTAL */}

        <View
          style={
            styles.totalRow
          }
        >

          <Text
            style={
              styles.totalLabel
            }
          >
            {translate(language, 'totalLabel')}
          </Text>


          <Text
            style={
              styles.totalAmount
            }
          >
            {amount}
          </Text>

        </View>


        {/* PAYMENT STATUS */}

        <View
          style={
            isCompleted
              ? styles.paymentSuccess
              : styles.paymentPending
          }
        >

          <Ionicons
            name={
              isCompleted
                ? 'checkmark-circle'
                : 'time-outline'
            }
            size={19}
            color={
              isCompleted
                ? COLORS.green
                : COLORS.orange
            }
          />


          <Text
            style={
              isCompleted
                ? styles.paymentSuccessText
                : styles.paymentPendingText
            }
          >
            {
              isCompleted
                ? translate(language, 'paymentCompleted')
                : getBookingStatusLabel(
                    booking.status,
                    language
                  )
            }
          </Text>

        </View>


        {/* DONE */}

        <AnimatedButton
          style={
            styles.doneButtonWrapper
          }
          onPress={
            onClose
          }
        >

          <View
            style={
              styles.doneButton
            }
          >

            <Text
              style={
                styles.doneButtonText
              }
            >
              {translate(language, 'done')}
            </Text>

          </View>

        </AnimatedButton>

      </Animated.View>

    </View>
  );
}


/* =====================================================
   MAIN SCREEN
===================================================== */

let bookingsIntroSpoken = false;

export default function Bookingscreen({
  bookings = [],
  onBack,
  onViewDetails,
  onRefresh,
  refreshing = false,
  loading = false,
  language,
}) {
  const { speak, stop } = useTextToSpeech(language);
  const mountedRef = useRef(true);
  const prevLoadingRef = useRef(loading);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stop();
    };
  }, [stop]);

  // Plays the "Voice Assistance is available" instruction once per
  // app session, after the initial bookings load settles (never on
  // re-renders, language changes, scrolls, or pull-to-refresh).
  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = loading;
    if (wasLoading && !loading && !bookingsIntroSpoken) {
      bookingsIntroSpoken = true;
      if (mountedRef.current) {
        speak(translate(language, 'myBookingsVoiceAssistIntro'));
      }
    }
  }, [loading, language, speak]);

  const [
    selectedBooking,
    setSelectedBooking,
  ] = useState(null);


  const [
    receiptVisible,
    setReceiptVisible,
  ] = useState(false);


  /* SCREEN ANIMATION */

  const screenOpacity =
    useRef(
      new Animated.Value(0)
    ).current;


  const screenTranslateY =
    useRef(
      new Animated.Value(20)
    ).current;


  useEffect(() => {

    Animated.parallel([

      Animated.timing(
        screenOpacity,
        {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }
      ),

      Animated.timing(
        screenTranslateY,
        {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }
      ),

    ]).start();

  }, []);


  /* =====================================================
     OPEN RECEIPT / VIEW DETAILS
  ===================================================== */

  const openReceipt =
    booking => {
      if (!booking) return;

      const isCompleted =
        (booking.status || '').toLowerCase() === 'completed';
      const isOrg =
        booking.type === 'organization' ||
        booking.id?.toString().startsWith('org-');

      // If booking is COMPLETED (worker or organization), open payment receipt directly!
      if (isCompleted) {
        setSelectedBooking(
          booking
        );

        setReceiptVisible(
          true
        );
        return;
      }

      // If booking is an active/pending organization request, open organization details
      if (isOrg && typeof onViewDetails === 'function') {
        onViewDetails(booking);
        return;
      }

      // If onViewDetails is provided and booking is NOT completed, navigate to details
      else if (typeof onViewDetails === 'function') {
        onViewDetails(booking);
      } 
      // Fallback to receipt modal behavior
      else {
        setSelectedBooking(
          booking
        );

        setReceiptVisible(
          true
        );
      }

    };


  /* =====================================================
     CLOSE RECEIPT
  ===================================================== */

  const closeReceipt = () => {

    setReceiptVisible(
      false
    );

    setTimeout(() => {

      setSelectedBooking(
        null
      );

    }, 250);

  };


  /* =====================================================
     SORTED BOOKINGS (Most recent date wise, standard order)
  ===================================================== */

  const sortedBookings = useMemo(() => {
    if (!Array.isArray(bookings)) return [];
    return [...bookings].sort((a, b) => {
      const getTimestamp = (item) => {
        if (!item) return 0;
        if (item.created_at) {
          const t = new Date(item.created_at).getTime();
          if (!isNaN(t) && t > 0) return t;
        }
        if (item.rawRequest?.created_at) {
          const t = new Date(item.rawRequest.created_at).getTime();
          if (!isNaN(t) && t > 0) return t;
        }
        const dStr = item.required_date || item.date || item.rawRequest?.required_date;
        if (dStr) {
          if (dStr instanceof Date) {
            const t = dStr.getTime();
            if (!isNaN(t) && t > 0) return t;
          } else if (typeof dStr === 'string') {
            const tStr = item.required_time || item.time || '';
            if (tStr && typeof tStr === 'string' && tStr !== 'TBD' && tStr.includes(':')) {
              const dt = new Date(`${dStr}T${tStr}`).getTime();
              if (!isNaN(dt) && dt > 0) return dt;
            }
            const d = new Date(dStr).getTime();
            if (!isNaN(d) && d > 0) return d;
          }
        }
        if (typeof item.id === 'number') return item.id;
        if (typeof item.id === 'string' && item.id.startsWith('org-')) {
          const num = parseInt(item.id.replace('org-', ''), 10);
          if (!isNaN(num)) return num;
        }
        return 0;
      };
      return getTimestamp(b) - getTimestamp(a);
    });
  }, [bookings]);


  /* =====================================================
     COUNTS
  ===================================================== */

  const requestedCount =
    bookings.filter(
      booking =>
        booking.status ===
        'requested'
    ).length;


  const scheduledCount =
    bookings.filter(
      booking =>
        booking.status ===
        'scheduled'
    ).length;


  const progressCount =
    bookings.filter(
      booking =>
        booking.status ===
        'inProgress'
    ).length;


  const paymentCount =
    bookings.filter(
      booking =>
        booking.status ===
        'paymentPending'
    ).length;


  const completedCount =
    bookings.filter(
      booking =>
        booking.status ===
        'completed'
    ).length;


  /* =====================================================
     SCREEN
  ===================================================== */

  return (

    <SafeAreaView
      style={
        styles.container
      }
    >

      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity:
              screenOpacity,

            transform: [
              {
                translateY:
                  screenTranslateY,
              },
            ],
          },
        ]}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <View
          style={
            styles.header
          }
        >

          <AnimatedButton
            style={
              styles.headerButtonWrapper
            }
            onPress={
              onBack
            }
          >

            <View
              style={
                styles.backButton
              }
            >

              <Ionicons
                name="arrow-back"
                size={24}
                color="#111827"
              />

            </View>

          </AnimatedButton>


          <Text
            style={
              styles.headerTitle
            }
          >
            {translate(language, 'myBookings')}
          </Text>


          <View
            style={
              styles.headerSpace
            }
          />

        </View>


        {/* =================================================
            VOICE ASSISTANCE
        ================================================= */}

        <View
          style={
            styles.voiceGuidanceWrap
          }
        >

          <VoiceGuidanceButton
            labeled
            text={
              translate(language, 'bookingsScreenVoiceGuidance')
            }

            language={language}

            title={
              translate(language, 'voiceAssistance')
            }

            subtitle={
              translate(language, 'myBookingsHearHowToUse')
            }
          />

        </View>


        {/* =================================================
            CONTENT
        ================================================= */}

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#49769F']}
              />
            ) : undefined
          }
        >

          <Text
            style={
              styles.pageTitle
            }
          >
            {translate(language, 'myBookings')}
          </Text>


          <Text
            style={
              styles.pageSubtitle
            }
          >
            {translate(language, 'bookingSubtitle')}
          </Text>


          {/* =================================================
              SUMMARY
          ================================================= */}

          <View
            style={
              styles.summaryCard
            }
          >

            <View
              style={
                styles.summaryIcon
              }
            >

              <Ionicons
                name="briefcase-outline"
                size={20}
                color={PRIMARY}
              />

            </View>


            <View
              style={
                styles.summaryText
              }
            >

              <Text
                style={
                  styles.summaryTitle
                }
              >
                {bookings.length}{' '}
                {translate(language, 'totalBookings')}
              </Text>


              <Text
                style={
                  styles.summarySubtitle
                }
              >
                {
                  completedCount
                } {translate(language, 'completedWord')} • {
                  progressCount
                } {translate(language, 'activeWord')}
              </Text>

            </View>

          </View>


          {/* =================================================
              STATUS SUMMARY
          ================================================= */}

          {bookings.length > 0 && (

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.statusSummaryScroll
              }
            >

              {/* REQUESTED */}

              <View
                style={[
                  styles.miniStatusCard,
                  styles.miniRequested,
                ]}
              >

                <Text
                  style={
                    styles.miniStatusNumber
                  }
                >
                  {
                    requestedCount
                  }
                </Text>

                <Text
                  style={
                    styles.miniStatusLabel
                  }
                >
                  {translate(language, 'statusRequested')}
                </Text>

              </View>


              {/* SCHEDULED */}

              <View
                style={[
                  styles.miniStatusCard,
                  styles.miniScheduled,
                ]}
              >

                <Text
                  style={
                    styles.miniStatusNumber
                  }
                >
                  {
                    scheduledCount
                  }
                </Text>

                <Text
                  style={
                    styles.miniStatusLabel
                  }
                >
                  {translate(language, 'statusScheduled')}
                </Text>

              </View>


              {/* IN PROGRESS */}

              <View
                style={[
                  styles.miniStatusCard,
                  styles.miniProgress,
                ]}
              >

                <Text
                  style={
                    styles.miniStatusNumber
                  }
                >
                  {
                    progressCount
                  }
                </Text>

                <Text
                  style={
                    styles.miniStatusLabel
                  }
                >
                  {translate(language, 'inProgress')}
                </Text>

              </View>


              {/* PAYMENT */}

              <View
                style={[
                  styles.miniStatusCard,
                  styles.miniPayment,
                ]}
              >

                <Text
                  style={
                    styles.miniStatusNumber
                  }
                >
                  {
                    paymentCount
                  }
                </Text>

                <Text
                  style={
                    styles.miniStatusLabel
                  }
                >
                  {translate(language, 'paymentLabel')}
                </Text>

              </View>


              {/* COMPLETED */}

              <View
                style={[
                  styles.miniStatusCard,
                  styles.miniCompleted,
                ]}
              >

                <Text
                  style={
                    styles.miniStatusNumber
                  }
                >
                  {
                    completedCount
                  }
                </Text>

                <Text
                  style={
                    styles.miniStatusLabel
                  }
                >
                  {translate(language, 'completed')}
                </Text>

              </View>

            </ScrollView>
          )}


          {/* =================================================
              EMPTY / LOADING
          ================================================= */}

          {loading && bookings.length === 0 ? (

            <View
              style={
                styles.emptyContainer
              }
            >

              <View
                style={[
                  styles.emptyIcon,
                  { backgroundColor: '#EAF3FA' },
                ]}
              >

                <ActivityIndicator size="large" color={PRIMARY} />

              </View>


              <Text
                style={
                  styles.emptyTitle
                }
              >
                {translate(language, 'loadingBookings')}
              </Text>


              <Text
                style={
                  styles.emptySubtitle
                }
              >
                {translate(language, 'fetchingLatest')}
              </Text>

            </View>

          ) : bookings.length === 0 ? (

            <View
              style={
                styles.emptyContainer
              }
            >

              <View
                style={
                  styles.emptyIcon
                }
              >

                <Ionicons
                  name="calendar-outline"
                  size={43}
                  color={PRIMARY}
                />

              </View>


              <Text
                style={
                  styles.emptyTitle
                }
              >
                {translate(language, 'noBookingsYet')}
              </Text>


              <Text
                style={
                  styles.emptySubtitle
                }
              >
                {translate(language, 'emptySubtitle')}
              </Text>

            </View>

          ) : (

            /* =================================================
               BOOKINGS
            ================================================= */

            <View
              style={
                styles.bookingsContainer
              }
            >

              {sortedBookings.map(
                (booking, index) => (

                  <BookingCard
                    key={
                      booking.id ||
                      index
                    }

                    booking={
                      booking
                    }

                    index={
                      index
                    }

                    language={language}

                    onPress={
                      openReceipt
                    }

                  />

                )
              )}

            </View>

          )}


          {/* =================================================
              INFORMATION
          ================================================= */}

          <View
            style={
              styles.bottomInfo
            }
          >

            <Ionicons
              name="information-circle-outline"
              size={18}
              color={
                COLORS.lightGray
              }
            />


            <Text
              style={
                styles.bottomInfoText
              }
            >
              {translate(language, 'tapAnyBooking')}
            </Text>

          </View>


          <Text
            style={
              styles.version
            }
          >
            Sahayak • {translate(language, 'version')} 1.0.0
          </Text>

        </ScrollView>

      </Animated.View>


      {/* =================================================
          RECEIPT POPUP
      ================================================= */}

      <ReceiptModal

        booking={
          selectedBooking
        }

        visible={
          receiptVisible
        }

        onClose={
          closeReceipt
        }

        language={language}

      />

    </SafeAreaView>
  );
}


/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({

  /* ===================================================
     CONTAINER
  =================================================== */

  container: {
    flex: 1,
    backgroundColor:
      COLORS.white,
  },

  animatedContainer: {
    flex: 1,
  },


  /* ===================================================
     HEADER
  =================================================== */

  header: {
    height: 80,
    marginTop: 25,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',

    paddingHorizontal: 20,

    paddingTop: 15,

    borderBottomWidth: 1,

    borderBottomColor:
      COLORS.border,

    backgroundColor:
      COLORS.white,
  },

  headerButtonWrapper: {
    borderRadius: 22,
  },

  backButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor:
      COLORS.white,

    justifyContent:
      'center',

    alignItems:
      'center',

    borderWidth: 1,

    borderColor:
      COLORS.border,

    elevation: 2,
  },

  headerTitle: {
    fontSize: 20,

    fontWeight: '700',

    color:
      COLORS.dark,
  },

  headerSpace: {
    width: 42,
  },

  voiceGuidanceWrap: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },


  /* ===================================================
     SCROLL
  =================================================== */

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 45,
  },


  /* ===================================================
     PAGE TITLE
  =================================================== */

  pageTitle: {
    fontSize: 27,

    fontWeight: '800',

    color:
      COLORS.dark,

    marginTop: 25,
  },

  pageSubtitle: {
    fontSize: 14,

    color:
      COLORS.gray,

    marginTop: 7,

    lineHeight: 20,

    marginBottom: 20,
  },


  /* ===================================================
     SUMMARY
  =================================================== */

  summaryCard: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor:
      COLORS.softBlue,

    borderRadius: 17,

    padding: 13,

    borderWidth: 1,

    borderColor:
      '#E1EDF5',

    marginBottom: 14,
  },

  summaryIcon: {
    width: 42,
    height: 42,

    borderRadius: 13,

    backgroundColor:
      COLORS.white,

    justifyContent:
      'center',

    alignItems:
      'center',

    marginRight: 11,
  },

  summaryText: {
    flex: 1,
  },

  summaryTitle: {
    fontSize: 15,

    fontWeight: '800',

    color:
      COLORS.dark,
  },

  summarySubtitle: {
    fontSize: 11,

    color:
      COLORS.gray,

    marginTop: 3,
  },


  /* ===================================================
     STATUS SUMMARY
  =================================================== */

  statusSummaryScroll: {
    paddingBottom: 6,
  },

  miniStatusCard: {
    width: 88,

    minHeight: 68,

    borderRadius: 14,

    marginRight: 8,

    padding: 10,

    justifyContent:
      'center',

    alignItems:
      'center',

    borderWidth: 1,
  },

  miniRequested: {
    backgroundColor:
      '#F8FBFF',

    borderColor:
      '#DCEBFA',
  },

  miniScheduled: {
    backgroundColor:
      '#F7FAFC',

    borderColor:
      '#D9E3EC',
  },

  miniProgress: {
    backgroundColor:
      '#F2FCF7',

    borderColor:
      '#D5F0DE',
  },

  miniPayment: {
    backgroundColor:
      '#FFF9F2',

    borderColor:
      '#FDE1C7',
  },

  miniCompleted: {
    backgroundColor:
      '#F2FCF7',

    borderColor:
      '#D5F0DE',
  },

  miniStatusNumber: {
    fontSize: 20,

    fontWeight: '900',

    color:
      COLORS.dark,
  },

  miniStatusLabel: {
    fontSize: 9.5,

    color:
      COLORS.gray,

    fontWeight: '600',

    marginTop: 2,

    textAlign: 'center',
  },


  /* ===================================================
     BOOKINGS
  =================================================== */

  bookingsContainer: {
    marginTop: 15,
  },

  bookingAnimatedContainer: {
    marginBottom: 13,
  },

  bookingCard: {
    backgroundColor:
      COLORS.white,

    borderRadius: 17,

    padding: 14,

    flexDirection: 'row',

    alignItems:
      'center',

    borderWidth: 1,

    borderColor:
      COLORS.border,

    elevation: 2,
  },

  bookingCardPressed: {
    opacity: 0.75,

    transform: [
      {
        scale: 0.98,
      },
    ],
  },


  /* ===================================================
     SERVICE ICON
  =================================================== */

  serviceIcon: {
    width: 52,
    height: 52,

    borderRadius: 16,

    backgroundColor:
      '#EAF3F8',

    justifyContent:
      'center',

    alignItems:
      'center',

    flexShrink: 0,
  },


  /* ===================================================
     BOOKING MAIN
  =================================================== */

  bookingMain: {
    flex: 1,

    marginLeft: 12,

    minWidth: 0,
  },

  bookingTitleRow: {
    flexDirection: 'row',

    alignItems:
      'center',
  },

  categoryName: {
    flex: 1,

    fontSize: 15,

    fontWeight: '700',

    color:
      COLORS.dark,

    marginRight: 5,
  },

  workerName: {
    fontSize: 12,

    color:
      COLORS.gray,

    marginTop: 3,
  },


  /* ===================================================
     STATUS BADGES
  =================================================== */

  statusBadge: {
    flexDirection: 'row',

    alignItems:
      'center',

    borderRadius: 8,

    paddingHorizontal: 6,

    paddingVertical: 4,

    flexShrink: 0,
  },

  statusText: {
    fontSize: 8.5,

    fontWeight: '800',

    marginLeft: 3,
  },

  requestedBadge: {
    backgroundColor:
      COLORS.requestedBg,
  },

  requestedText: {
    color:
      PRIMARY,
  },

  scheduledBadge: {
    backgroundColor:
      '#F3F8FC',
  },

  scheduledText: {
    color:
      PRIMARY,
  },

  progressBadge: {
    backgroundColor:
      COLORS.greenBg,
  },

  progressText: {
    color:
      COLORS.green,
  },

  paymentBadge: {
    backgroundColor:
      COLORS.orangeBg,
  },

  paymentText: {
    color:
      COLORS.orange,
  },

  completedBadge: {
    backgroundColor:
      COLORS.greenBg,
  },

  completedText: {
    color:
      COLORS.green,
  },


  /* ===================================================
     BOOKING INFO
  =================================================== */

  bookingInfoRow: {
    flexDirection: 'row',

    alignItems:
      'center',

    marginTop: 7,
  },

  smallInfo: {
    flexDirection: 'row',

    alignItems:
      'center',

    marginRight: 9,

    maxWidth: '50%',
  },

  smallInfoText: {
    fontSize: 9.5,

    color:
      COLORS.gray,

    marginLeft: 4,

    flexShrink: 1,
  },


  /* ===================================================
     CARD RIGHT
  =================================================== */

  cardRight: {
    alignItems:
      'flex-end',

    justifyContent:
      'center',

    marginLeft: 5,

    flexShrink: 0,
  },

  cardPrice: {
    fontSize: 12.5,

    fontWeight: '800',

    color:
      PRIMARY,

    marginBottom: 8,

    maxWidth: 70,

    textAlign: 'right',
  },

  arrowCircle: {
    width: 27,
    height: 27,

    borderRadius: 14,

    backgroundColor:
      '#F1F7FA',

    justifyContent:
      'center',

    alignItems:
      'center',
  },


  /* ===================================================
     EMPTY
  =================================================== */

  emptyContainer: {
    alignItems:
      'center',

    justifyContent:
      'center',

    paddingVertical: 65,
  },

  emptyIcon: {
    width: 88,
    height: 88,

    borderRadius: 44,

    backgroundColor:
      COLORS.softBlue,

    justifyContent:
      'center',

    alignItems:
      'center',

    marginBottom: 17,
  },

  emptyTitle: {
    fontSize: 20,

    fontWeight: '800',

    color:
      COLORS.dark,
  },

  emptySubtitle: {
    fontSize: 13,

    color:
      COLORS.gray,

    textAlign:
      'center',

    lineHeight: 20,

    marginTop: 7,

    paddingHorizontal: 20,
  },


  /* ===================================================
     BOTTOM INFO
  =================================================== */

  bottomInfo: {
    flexDirection: 'row',

    alignItems:
      'center',

    justifyContent:
      'center',

    marginTop: 15,

    paddingHorizontal: 15,
  },

  bottomInfoText: {
    fontSize: 11,

    color:
      COLORS.lightGray,

    marginLeft: 5,

    textAlign:
      'center',

    lineHeight: 17,

    flex: 1,
  },


  /* ===================================================
     VERSION
  =================================================== */

  version: {
    textAlign:
      'center',

    color:
      '#CBD5E1',

    fontSize: 10,

    marginTop: 25,
  },


  /* ===================================================
     MODAL
  =================================================== */

  modalOverlay: {
    position: 'absolute',

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    justifyContent:
      'center',

    alignItems:
      'center',

    zIndex: 100,
  },

  modalBackground: {
    position: 'absolute',

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor:
      'rgba(15, 23, 42, 0.48)',
  },


  /* ===================================================
     RECEIPT
  =================================================== */

  receiptModal: {
    width: '90%',

    maxWidth: 420,

    maxHeight: '88%',

    backgroundColor:
      COLORS.white,

    borderRadius: 24,

    padding: 20,

    elevation: 10,

    shadowColor:
      '#000',

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.22,

    shadowRadius: 15,
  },

  receiptHeader: {
    flexDirection: 'row',

    alignItems:
      'flex-start',

    justifyContent:
      'space-between',
  },

  receiptHeaderText: {
    flex: 1,
  },

  receiptTitle: {
    fontSize: 21,

    fontWeight: '800',

    color:
      COLORS.dark,
  },

  receiptSubtitle: {
    fontSize: 11.5,

    color:
      COLORS.gray,

    marginTop: 4,
  },

  closeButton: {
    width: 35,
    height: 35,

    borderRadius: 18,

    backgroundColor:
      '#F1F5F9',

    justifyContent:
      'center',

    alignItems:
      'center',
  },


  /* ===================================================
     RECEIPT ICONS
  =================================================== */

  receiptSuccessCircle: {
    width: 52,
    height: 52,

    borderRadius: 26,

    backgroundColor:
      COLORS.green,

    justifyContent:
      'center',

    alignItems:
      'center',

    alignSelf:
      'center',

    marginTop: 15,

    marginBottom: 15,
  },

  receiptPendingCircle: {
    width: 52,
    height: 52,

    borderRadius: 26,

    backgroundColor:
      COLORS.orange,

    justifyContent:
      'center',

    alignItems:
      'center',

    alignSelf:
      'center',

    marginTop: 15,

    marginBottom: 15,
  },


  /* ===================================================
     RECEIPT SERVICE
  =================================================== */

  receiptService: {
    flexDirection: 'row',

    alignItems:
      'center',

    backgroundColor:
      COLORS.softBlue,

    borderRadius: 15,

    padding: 13,

    borderWidth: 1,

    borderColor:
      '#E1EDF5',
  },

  receiptServiceIcon: {
    width: 48,
    height: 48,

    borderRadius: 14,

    backgroundColor:
      COLORS.white,

    justifyContent:
      'center',

    alignItems:
      'center',

    marginRight: 12,
  },

  receiptServiceText: {
    flex: 1,
  },

  receiptServiceName: {
    fontSize: 16,

    fontWeight: '700',

    color:
      COLORS.dark,
  },

  receiptWorker: {
    fontSize: 11.5,

    color:
      COLORS.gray,

    marginTop: 4,
  },


  /* ===================================================
     RECEIPT DETAILS
  =================================================== */

  receiptDetails: {
    marginTop: 13,
  },

  receiptRow: {
    flexDirection: 'row',

    alignItems:
      'center',

    justifyContent:
      'space-between',

    paddingVertical: 7,
  },

  receiptLabelRow: {
    flexDirection: 'row',

    alignItems:
      'center',

    flexShrink: 0,
  },

  receiptDetailIcon: {
    width: 29,
    height: 29,

    borderRadius: 9,

    backgroundColor:
      '#F1F7FA',

    justifyContent:
      'center',

    alignItems:
      'center',
  },

  receiptLabel: {
    fontSize: 12.5,

    color:
      COLORS.gray,

    marginLeft: 8,
  },

  receiptValue: {
    fontSize: 12,

    fontWeight: '600',

    color:
      COLORS.dark,

    maxWidth: '55%',

    textAlign:
      'right',
  },


  /* ===================================================
     DIVIDER
  =================================================== */

  receiptDivider: {
    height: 1,

    backgroundColor:
      COLORS.border,

    marginVertical: 10,
  },


  /* ===================================================
     TOTAL
  =================================================== */

  totalRow: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems:
      'center',

    marginTop: 2,
  },

  totalLabel: {
    fontSize: 15,

    fontWeight: '700',

    color:
      '#374151',
  },

  totalAmount: {
    fontSize: 22,

    fontWeight: '800',

    color:
      PRIMARY,
  },


  /* ===================================================
     PAYMENT STATUS
  =================================================== */

  paymentSuccess: {
    flexDirection: 'row',

    alignItems:
      'center',

    justifyContent:
      'center',

    backgroundColor:
      COLORS.greenBg,

    borderRadius: 11,

    paddingVertical: 9,

    marginTop: 13,
  },

  paymentSuccessText: {
    color:
      COLORS.green,

    fontSize: 12.5,

    fontWeight: '700',

    marginLeft: 6,
  },

  paymentPending: {
    flexDirection: 'row',

    alignItems:
      'center',

    justifyContent:
      'center',

    backgroundColor:
      COLORS.orangeBg,

    borderRadius: 11,

    paddingVertical: 9,

    marginTop: 13,
  },

  paymentPendingText: {
    color:
      COLORS.orange,

    fontSize: 12.5,

    fontWeight: '700',

    marginLeft: 6,
  },


  /* ===================================================
     DONE BUTTON
  =================================================== */

  doneButtonWrapper: {
    marginTop: 13,

    borderRadius: 14,
  },

  doneButton: {
    height: 49,

    borderRadius: 14,

    backgroundColor:
      PRIMARY,

    justifyContent:
      'center',

    alignItems:
      'center',

    shadowColor:
      PRIMARY,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.18,

    shadowRadius: 6,

    elevation: 3,
  },

  doneButtonText: {
    color:
      COLORS.white,

    fontSize: 15,

    fontWeight: '700',
  },

});