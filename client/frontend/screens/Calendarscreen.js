import React, { useEffect, useRef, useState } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { translate, translateService } from '../utils/translations';
import { useTextToSpeech } from '../utils/useTextToSpeech';
import VoiceGuidanceButton from '../components/VoiceGuidanceButton';


/* =====================================================
   COLORS
===================================================== */

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
  red: '#EF4444',
  yellow: '#F59E0B',
  orange: '#EA580C',
};


/* =====================================================
   STATUS HELPERS
===================================================== */

const getStatusColor = (status) => {
  switch (status) {
    case 'requested':
      return COLORS.red;

    case 'scheduled':
      return COLORS.yellow;

    case 'inProgress':
      return COLORS.yellow;

    case 'paymentPending':
      return COLORS.orange;

    case 'completed':
      return COLORS.green;

    default:
      return COLORS.yellow;
  }
};


const getStatusLabel = (status, language) => {
  switch (status) {
    case 'requested':
      return translate(language, 'statusWaiting');

    case 'scheduled':
      return translate(language, 'statusScheduled');

    case 'inProgress':
      return translate(language, 'inProgress');

    case 'paymentPending':
      return translate(language, 'paymentPending');

    case 'completed':
      return translate(language, 'completed');

    default:
      return translate(language, 'booked');
  }
};


const getStatusIcon = (status) => {
  switch (status) {
    case 'requested':
      return 'hourglass-outline';

    case 'scheduled':
      return 'calendar-outline';

    case 'inProgress':
      return 'hammer-outline';

    case 'paymentPending':
      return 'card-outline';

    case 'completed':
      return 'checkmark-circle';

    default:
      return 'calendar-outline';
  }
};


/* =====================================================
   SERVICE ICON
===================================================== */

const getServiceIcon = (service) => {
  const value = String(service || '').toLowerCase();

  if (value.includes('plumb')) {
    return 'water-outline';
  }

  if (value.includes('paint')) {
    return 'color-palette-outline';
  }

  if (value.includes('clean')) {
    return 'sparkles-outline';
  }

  if (value.includes('electric')) {
    return 'flash-outline';
  }

  if (value.includes('carpent')) {
    return 'hammer-outline';
  }

  if (value.includes('ac')) {
    return 'snow-outline';
  }

  return 'construct-outline';
};


/* =====================================================
   NORMALIZE BOOKING DATE
===================================================== */

const normalizeBookingDate = (value) => {
  if (!value) {
    return null;
  }

  /* Date object */

  if (value instanceof Date) {
    if (isNaN(value.getTime())) {
      return null;
    }

    return (
      `${value.getFullYear()}-` +
      `${String(value.getMonth() + 1).padStart(2, '0')}-` +
      `${String(value.getDate()).padStart(2, '0')}`
    );
  }

  const dateString = String(value).trim();

  /* Already YYYY-MM-DD */

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  /* DD/MM/YYYY */

  const slashParts = dateString.split('/');

  if (slashParts.length === 3) {
    const day = parseInt(slashParts[0], 10);
    const month = parseInt(slashParts[1], 10);
    const year = parseInt(slashParts[2], 10);

    if (
      !isNaN(day) &&
      !isNaN(month) &&
      !isNaN(year)
    ) {
      return (
        `${year}-` +
        `${String(month).padStart(2, '0')}-` +
        `${String(day).padStart(2, '0')}`
      );
    }
  }

  /* DD Month YYYY */

  const words = dateString.split(/\s+/);

  if (words.length >= 3) {
    const day = parseInt(words[0], 10);
    const monthName = words[1].toLowerCase();
    const year = parseInt(words[2], 10);

    const months = {
      jan: 0,
      january: 0,

      feb: 1,
      february: 1,

      mar: 2,
      march: 2,

      apr: 3,
      april: 3,

      may: 4,

      jun: 5,
      june: 5,

      jul: 6,
      july: 6,

      aug: 7,
      august: 7,

      sep: 8,
      sept: 8,
      september: 8,

      oct: 9,
      october: 9,

      nov: 10,
      november: 10,

      dec: 11,
      december: 11,
    };

    if (
      !isNaN(day) &&
      !isNaN(year) &&
      months[monthName] !== undefined
    ) {
      return (
        `${year}-` +
        `${String(months[monthName] + 1).padStart(2, '0')}-` +
        `${String(day).padStart(2, '0')}`
      );
    }
  }

  /* JS date parsing */

  const parsed = new Date(dateString);

  if (!isNaN(parsed.getTime())) {
    return (
      `${parsed.getFullYear()}-` +
      `${String(parsed.getMonth() + 1).padStart(2, '0')}-` +
      `${String(parsed.getDate()).padStart(2, '0')}`
    );
  }

  return null;
};


/* =====================================================
   CALENDAR SCREEN
===================================================== */

let calendarIntroSpoken = false;

export default function Calendarscreen({
  language = 'english',
  bookings = [],
  onBack,
  onBookingPress,
  loading = false,
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
  // re-renders, language changes, month changes, or date taps).
  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = loading;
    if (wasLoading && !loading && !calendarIntroSpoken) {
      calendarIntroSpoken = true;
      if (mountedRef.current) {
        speak(translate(language, 'calendarVoiceAssistIntro'));
      }
    }
  }, [loading, language, speak]);

  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    )
  );

  const [selectedDate, setSelectedDate] = useState(null);


  /* ===================================================
     MONTH
  =================================================== */

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthName = currentMonth.toLocaleDateString(
    'en-IN',
    {
      month: 'long',
      year: 'numeric',
    }
  );


  /* ===================================================
     DAYS
  =================================================== */

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();


  /* ===================================================
     FIRST DAY
  =================================================== */

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const startingDay =
    firstDay === 0
      ? 6
      : firstDay - 1;


  /* ===================================================
     TODAY
  =================================================== */

  const todayString =
    `${today.getFullYear()}-` +
    `${String(today.getMonth() + 1).padStart(2, '0')}-` +
    `${String(today.getDate()).padStart(2, '0')}`;


  /* ===================================================
     CHANGE MONTH
  =================================================== */

  const changeMonth = (direction) => {
    setCurrentMonth(
      new Date(
        year,
        month + direction,
        1
      )
    );

    setSelectedDate(null);
  };


  /* ===================================================
     CREATE DATE STRING
  =================================================== */

  const createDateString = (day) => {
    return (
      `${year}-` +
      `${String(month + 1).padStart(2, '0')}-` +
      `${String(day).padStart(2, '0')}`
    );
  };


  /* ===================================================
     FIND BOOKINGS
  =================================================== */

  const getBookingsForDate = (dateString) => {
    return bookings.filter((booking) => {
      const normalized =
        normalizeBookingDate(
          booking?.date
        );

      return normalized === dateString;
    });
  };


  /* ===================================================
     DATE PRESS
  =================================================== */

  const handleDatePress = (day) => {
    const dateString =
      createDateString(day);

    setSelectedDate(dateString);
  };


  /* ===================================================
     SELECTED BOOKINGS
  =================================================== */

  const selectedBookings = selectedDate
    ? getBookingsForDate(selectedDate)
    : [];


  /* ===================================================
     BUILD DAYS
  =================================================== */

  const calendarDays = [];

  for (
    let i = 0;
    i < startingDay;
    i++
  ) {
    calendarDays.push({
      empty: true,
      id: `empty-${i}`,
    });
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    calendarDays.push({
      empty: false,
      day,
      date: createDateString(day),
    });
  }


  /* ===================================================
     GET DOT COLOR FOR DATE
     Priority:
     completed
     payment pending
     in progress
     scheduled
     requested
  =================================================== */

  const getDateDotColor = (date) => {
    const dayBookings =
      getBookingsForDate(date);

    if (!dayBookings.length) {
      return null;
    }

    if (
      dayBookings.some(
        booking =>
          booking.status ===
          'completed'
      )
    ) {
      return COLORS.green;
    }

    if (
      dayBookings.some(
        booking =>
          booking.status ===
          'paymentPending'
      )
    ) {
      return COLORS.orange;
    }

    if (
      dayBookings.some(
        booking =>
          booking.status ===
            'inProgress' ||
          booking.status ===
            'scheduled'
      )
    ) {
      return COLORS.yellow;
    }

    if (
      dayBookings.some(
        booking =>
          booking.status ===
          'requested'
      )
    ) {
      return COLORS.red;
    }

    return COLORS.yellow;
  };


  /* ===================================================
     UI
  =================================================== */

  return (
    <SafeAreaView
      style={styles.container}
    >

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <View
          style={styles.header}
        >

          {onBack && (
            <Pressable
              delayPressIn={0}
              style={styles.backButton}
              onPress={onBack}
            >
              <Ionicons
                name="arrow-back"
                size={23}
                color={COLORS.dark}
              />
            </Pressable>
          )}

          <View
            style={styles.headerText}
          >
            <Text
              style={
                styles.headerTitle
              }
            >
              {translate(language, 'calendar')}
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }
            >
              {translate(language, 'scheduledServices')}
            </Text>
          </View>

          <View
            style={
              styles.calendarHeaderIcon
            }
          >
            <Ionicons
              name="calendar"
              size={23}
              color={COLORS.blue}
            />
          </View>

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
              translate(language, 'calendarVoiceGuidance')
            }

            language={language}

            title={
              translate(language, 'voiceAssistance')
            }

            subtitle={
              translate(language, 'calendarHearHowToUse')
            }
          />

        </View>


        {/* =================================================
            MONTH SELECTOR
        ================================================= */}

        <View
          style={
            styles.monthSelector
          }
        >

          <Pressable
            delayPressIn={0}
            style={
              styles.monthButton
            }
            onPress={() =>
              changeMonth(-1)
            }
          >
            <Ionicons
              name="chevron-back"
              size={21}
              color={COLORS.dark}
            />
          </Pressable>


          <Text
            style={
              styles.monthTitle
            }
          >
            {monthName}
          </Text>


          <Pressable
            delayPressIn={0}
            style={
              styles.monthButton
            }
            onPress={() =>
              changeMonth(1)
            }
          >
            <Ionicons
              name="chevron-forward"
              size={21}
              color={COLORS.dark}
            />
          </Pressable>

        </View>


        {/* =================================================
            CALENDAR
        ================================================= */}

        <View
          style={
            styles.calendarCard
          }
        >

          {/* WEEK DAYS */}

          <View
            style={
              styles.weekRow
            }
          >

            {[
              'MON',
              'TUE',
              'WED',
              'THU',
              'FRI',
              'SAT',
              'SUN',
            ].map((day, index) => (
              <Text
                key={day}
                style={
                  styles.weekText
                }
              >
                {translate(
                  language,
                  [
                    'weekMon',
                    'weekTue',
                    'weekWed',
                    'weekThu',
                    'weekFri',
                    'weekSat',
                    'weekSun',
                  ][index]
                )}
              </Text>
            ))}

          </View>


          {/* DAYS */}

          <View
            style={
              styles.daysGrid
            }
          >

            {calendarDays.map((item) => {

              if (item.empty) {
                return (
                  <View
                    key={item.id}
                    style={
                      styles.dayBox
                    }
                  />
                );
              }

              const dayBookings =
                getBookingsForDate(
                  item.date
                );

              const hasBooking =
                dayBookings.length > 0;

              const isSelected =
                selectedDate ===
                item.date;

              const isToday =
                item.date ===
                todayString;

              const dotColor =
                getDateDotColor(
                  item.date
                );

              return (
                <Pressable
                  delayPressIn={0}
                  key={item.date}
                  style={
                    styles.dayBox
                  }
                  onPress={() =>
                    handleDatePress(
                      item.day
                    )
                  }
                >

                  <View
                    style={[
                      styles.dayCircle,

                      isToday &&
                        styles.todayCircle,

                      isSelected &&
                        styles.selectedDayCircle,
                    ]}
                  >

                    <Text
                      style={[
                        styles.dayText,

                        isToday &&
                          styles.todayText,

                        isSelected &&
                          styles.selectedDayText,
                      ]}
                    >
                      {item.day}
                    </Text>

                  </View>


                  {/* COLORED STATUS DOT */}

                  {hasBooking && (
                    <View
                      style={[
                        styles.bookingDot,
                        {
                          backgroundColor:
                            isSelected
                              ? COLORS.white
                              : dotColor,
                        },
                      ]}
                    />
                  )}

                </Pressable>
              );
            })}

          </View>


          {/* =================================================
              LEGEND
          ================================================= */}

          <View
            style={
              styles.legend
            }
          >

            <View
              style={
                styles.legendItem
              }
            >
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor:
                      COLORS.red,
                  },
                ]}
              />

              <Text
                style={
                  styles.legendText
                }
              >
                {translate(language, 'legendWaiting')}
              </Text>
            </View>


            <View
              style={
                styles.legendItem
              }
            >
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor:
                      COLORS.yellow,
                  },
                ]}
              />

              <Text
                style={
                  styles.legendText
                }
              >
                {translate(language, 'legendOngoing')}
              </Text>
            </View>


            <View
              style={
                styles.legendItem
              }
            >
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor:
                      COLORS.green,
                  },
                ]}
              />

              <Text
                style={
                  styles.legendText
                }
              >
                {translate(language, 'completed')}
              </Text>
            </View>


            <View
              style={
                styles.legendItem
              }
            >
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor:
                      COLORS.orange,
                  },
                ]}
              />

              <Text
                style={
                  styles.legendText
                }
              >
                {translate(language, 'paymentLabel')}
              </Text>
            </View>

          </View>

        </View>


        {/* =================================================
            BOOKING SECTION
        ================================================= */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          {selectedDate
            ? translate(language, 'bookingsOnThisDate')
            : translate(language, 'yourBookings')}
        </Text>


        {/* =================================================
            SELECTED DATE
        ================================================= */}

        {selectedDate ? (

          selectedBookings.length > 0 ? (

            selectedBookings.map(
              (booking) => {

                const status =
                  booking?.status ||
                  'requested';

                const statusColor =
                  getStatusColor(
                    status
                  );

                const serviceIcon =
                  getServiceIcon(
                    booking?.service
                  );

                const workerName =
                  booking?.workerName ||
                  booking?.worker?.name ||
                  translate(language, 'worker');

                return (
                  <Pressable
                    delayPressIn={0}
                    key={
                      `calendar-${booking.id}`
                    }
                    style={({ pressed }) => [
                      styles.bookingCard,

                      pressed &&
                        styles.bookingCardPressed,
                    ]}
                    onPress={() => {

                      if (
                        typeof onBookingPress ===
                        'function'
                      ) {
                        onBookingPress(
                          booking
                        );
                      }

                    }}
                  >

                    {/* TOP */}

                    <View
                      style={
                        styles.bookingTop
                      }
                    >

                      <View
                        style={
                          styles.serviceIcon
                        }
                      >

                        <Ionicons
                          name={
                            serviceIcon
                          }
                          size={24}
                          color={
                            COLORS.blue
                          }
                        />

                      </View>


                      <View
                        style={
                          styles.bookingTitleContainer
                        }
                      >

                        <Text
                          style={
                            styles.serviceName
                          }
                          numberOfLines={
                            1
                          }
                        >
                          {
                            translateService(booking?.service, language) ||
                            translate(language, 'homeService')
                          }
                        </Text>


                        <Text
                          style={
                            styles.workerName
                          }
                          numberOfLines={
                            1
                          }
                        >
                          {workerName}
                        </Text>

                      </View>


                      {/* STATUS BADGE */}

                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              statusColor +
                              '18',
                          },
                        ]}
                      >

                        <Ionicons
                          name={
                            getStatusIcon(
                              status
                            )
                          }
                          size={12}
                          color={
                            statusColor
                          }
                        />

                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                statusColor,
                            },
                          ]}
                        >
                          {
                            getStatusLabel(
                              status,
                              language
                            )
                          }
                        </Text>

                      </View>

                    </View>


                    {/* DETAILS */}

                    <View
                      style={
                        styles.bookingDetails
                      }
                    >

                      {/* DATE */}

                      <View
                        style={
                          styles.detailRow
                        }
                      >

                        <Ionicons
                          name="calendar-outline"
                          size={18}
                          color={
                            COLORS.gray
                          }
                        />

                        <Text
                          style={
                            styles.detailText
                          }
                        >
                          {
                            booking?.date ||
                            translate(language, 'dateNotAvailable')
                          }
                        </Text>

                      </View>


                      {/* TIME */}

                      <View
                        style={
                          styles.detailRow
                        }
                      >

                        <Ionicons
                          name="time-outline"
                          size={18}
                          color={
                            COLORS.gray
                          }
                        />

                        <Text
                          style={
                            styles.detailText
                          }
                        >
                          {
                            booking?.time ||
                            translate(language, 'timeNotAvailable')
                          }
                        </Text>

                      </View>


                      {/* ADDRESS */}

                      <View
                        style={
                          styles.detailRow
                        }
                      >

                        <Ionicons
                          name="location-outline"
                          size={18}
                          color={
                            COLORS.gray
                          }
                        />

                        <Text
                          style={
                            styles.detailText
                          }
                          numberOfLines={
                            2
                          }
                        >
                          {
                            booking?.address ||
                            translate(language, 'addressNotAvailable')
                          }
                        </Text>

                      </View>


                      {/* DESCRIPTION */}

                      {!!booking?.description && (

                        <View
                          style={
                            styles.detailRow
                          }
                        >

                          <Ionicons
                            name="document-text-outline"
                            size={18}
                            color={
                              COLORS.gray
                            }
                          />

                          <Text
                            style={
                              styles.detailText
                            }
                            numberOfLines={
                              2
                            }
                          >
                            {
                              booking.description
                            }
                          </Text>

                        </View>

                      )}


                      {/* PAYMENT */}

                      {booking?.paymentStatus && (

                        <View
                          style={
                            styles.detailRow
                          }
                        >

                          <Ionicons
                            name="card-outline"
                            size={18}
                            color={
                              COLORS.gray
                            }
                          />

                          <Text
                            style={
                              styles.detailText
                            }
                          >
                            {translate(language, 'paymentLabel')}: {
                              booking.paymentStatus ===
                              'paid'
                                ? translate(language, 'paid')
                                : translate(language, 'unpaid')
                            }
                          </Text>

                        </View>

                      )}

                    </View>


                    {/* VIEW DETAILS */}

                    <View
                      style={
                        styles.viewDetailsRow
                      }
                    >

                      <Text
                        style={[
                          styles.viewDetailsText,
                          {
                            color:
                              statusColor,
                          },
                        ]}
                      >
                        {translate(language, 'viewBookingDetails')}
                      </Text>

                      <Ionicons
                        name="chevron-forward"
                        size={17}
                        color={
                          statusColor
                        }
                      />

                    </View>

                  </Pressable>
                );
              }
            )

          ) : (

            <View
              style={
                styles.emptyCard
              }
            >

              <View
                style={
                  styles.emptyIcon
                }
              >
                <Ionicons
                  name="calendar-outline"
                  size={40}
                  color={
                    COLORS.blue
                  }
                />
              </View>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                {translate(language, 'noBookingOnThisDate')}
              </Text>

              <Text
                style={
                  styles.emptySubtitle
                }
              >
                {translate(language, 'noServiceForThisDate')}
              </Text>

            </View>

          )

        ) : (

          <View
            style={
              styles.emptyCard
            }
          >

            <View
              style={
                styles.emptyIcon
              }
            >
              <Ionicons
                name="hand-left-outline"
                size={36}
                color={
                  COLORS.blue
                }
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              {translate(language, 'selectDate')}
            </Text>

            <Text
              style={
                styles.emptySubtitle
              }
            >
              {translate(language, 'tapDateWithDot')}
            </Text>

          </View>

        )}


        <View
          style={
            styles.bottomSpace
          }
        />

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
    backgroundColor:
      COLORS.background,
  },

  scrollContent: {
    paddingBottom: 35,
  },

  voiceGuidanceWrap: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },


  /* ===================================================
     HEADER
  =================================================== */

  header: {
    height: 85,
    marginTop: 50,
    backgroundColor:
      COLORS.white,
    flexDirection:
      'row',
    alignItems:
      'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor:
      COLORS.border,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      '#F1F5F9',
    justifyContent:
      'center',
    alignItems:
      'center',
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight:
      '800',
    color:
      COLORS.dark,
  },

  headerSubtitle: {
    fontSize: 12,
    color:
      COLORS.gray,
    marginTop: 3,
  },

  calendarHeaderIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor:
      COLORS.softBlue,
    justifyContent:
      'center',
    alignItems:
      'center',
  },


  /* ===================================================
     MONTH
  =================================================== */

  monthSelector: {
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },

  monthTitle: {
    fontSize: 19,
    fontWeight:
      '800',
    color:
      COLORS.dark,
  },

  monthButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    justifyContent:
      'center',
    alignItems:
      'center',
  },


  /* ===================================================
     CALENDAR
  =================================================== */

  calendarCard: {
    marginHorizontal: 20,
    backgroundColor:
      COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  weekRow: {
    flexDirection:
      'row',
    marginBottom: 12,
  },

  weekText: {
    flex: 1,
    textAlign:
      'center',
    fontSize: 10,
    fontWeight:
      '800',
    color:
      COLORS.lightGray,
  },

  daysGrid: {
    flexDirection:
      'row',
    flexWrap:
      'wrap',
  },

  dayBox: {
    width:
      '14.2857%',
    height: 51,
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  dayText: {
    fontSize: 14,
    fontWeight:
      '600',
    color:
      COLORS.dark,
  },

  todayCircle: {
    borderWidth: 1.5,
    borderColor:
      COLORS.blue,
  },

  todayText: {
    color:
      COLORS.blue,
    fontWeight:
      '800',
  },

  selectedDayCircle: {
    backgroundColor:
      COLORS.blue,
    borderWidth: 0,
  },

  selectedDayText: {
    color:
      COLORS.white,
    fontWeight:
      '800',
  },

  bookingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position:
      'absolute',
    bottom: 2,
  },


  /* ===================================================
     LEGEND
  =================================================== */

  legend: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor:
      COLORS.border,
    flexDirection:
      'row',
    flexWrap:
      'wrap',
    justifyContent:
      'center',
  },

  legendItem: {
    flexDirection:
      'row',
    alignItems:
      'center',
    marginRight: 14,
    marginBottom: 5,
  },

  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  legendText: {
    fontSize: 10.5,
    color:
      COLORS.gray,
    fontWeight:
      '600',
  },


  /* ===================================================
     SECTION
  =================================================== */

  sectionTitle: {
    fontSize: 18,
    fontWeight:
      '800',
    color:
      COLORS.dark,
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 12,
  },


  /* ===================================================
     BOOKING CARD
  =================================================== */

  bookingCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor:
      COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  bookingCardPressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  bookingTop: {
    flexDirection:
      'row',
    alignItems:
      'center',
  },

  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor:
      COLORS.softBlue,
    justifyContent:
      'center',
    alignItems:
      'center',
  },

  bookingTitleContainer: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },

  serviceName: {
    fontSize: 17,
    fontWeight:
      '800',
    color:
      COLORS.dark,
  },

  workerName: {
    fontSize: 11.5,
    color:
      COLORS.gray,
    marginTop: 4,
  },


  /* ===================================================
     STATUS
  =================================================== */

  statusBadge: {
    flexDirection:
      'row',
    alignItems:
      'center',
    borderRadius: 9,
    paddingHorizontal: 7,
    paddingVertical: 5,
    marginLeft: 6,
    flexShrink: 0,
  },

  statusText: {
    fontSize: 8.5,
    fontWeight:
      '800',
    marginLeft: 3,
  },


  /* ===================================================
     DETAILS
  =================================================== */

  bookingDetails: {
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor:
      COLORS.border,
  },

  detailRow: {
    flexDirection:
      'row',
    alignItems:
      'center',
    marginBottom: 9,
  },

  detailText: {
    flex: 1,
    fontSize: 13,
    color:
      COLORS.gray,
    marginLeft: 9,
    lineHeight: 18,
  },


  /* ===================================================
     VIEW DETAILS
  =================================================== */

  viewDetailsRow: {
    marginTop: 3,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor:
      COLORS.border,
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'space-between',
  },

  viewDetailsText: {
    fontSize: 11,
    fontWeight:
      '800',
  },


  /* ===================================================
     EMPTY
  =================================================== */

  emptyCard: {
    marginHorizontal: 20,
    backgroundColor:
      COLORS.white,
    borderRadius: 18,
    padding: 26,
    alignItems:
      'center',
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor:
      COLORS.softBlue,
    justifyContent:
      'center',
    alignItems:
      'center',
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight:
      '700',
    color:
      COLORS.dark,
    marginTop: 10,
  },

  emptySubtitle: {
    fontSize: 12,
    color:
      COLORS.gray,
    textAlign:
      'center',
    lineHeight: 19,
    marginTop: 5,
  },

  bottomSpace: {
    height: 20,
  },

});