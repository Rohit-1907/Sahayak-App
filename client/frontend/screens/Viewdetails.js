import React, { useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { translate, translateService } from '../utils/translations';

export default function BookingDetailsScreen({ booking, onBack, language = 'english' }) {
  const bookingData = booking || {
    category: 'Home Cleaning',
    worker: 'Priya Sharma',
    date: '15 August 2026',
    time: '10:00 AM',
    price: 'Rs. 399',
    status: 'Completed',
    paymentStatus: 'Paid',
    paymentMode: 'UPI',
    bookingId: 'SAH-10001',
  };

  const AnimatedButton = ({ children, onPress, style }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scale, {
        toValue: 0.94,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale }],
          },
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* HEADER */}
        <View style={styles.header}>
          <AnimatedButton
            onPress={onBack}
            style={styles.backButtonWrapper}
          >
            <View style={styles.backButton}>
              <Ionicons
                name="arrow-back"
                size={23}
                color="#111827"
              />
            </View>
          </AnimatedButton>

          <Text style={styles.headerTitle}>
            {translate(language, 'bookingDetails')}
          </Text>

          <View style={styles.headerSpace} />
        </View>

        {/* STATUS CARD */}
        <View style={styles.statusCard}>

          <View style={styles.checkCircle}>
            <Ionicons
              name="checkmark"
              size={30}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>
              {bookingData.status}
            </Text>

            <Text style={styles.statusSubtitle}>
              {translate(language, 'paymentCompletedSuccessfully') || 'Your booking has been completed successfully.'}
            </Text>
          </View>

          <View style={styles.statusDot}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color="#059669"
            />
          </View>

        </View>

        {/* SERVICE DETAILS */}
        <Text style={styles.sectionTitle}>
          {translate(language, 'serviceDetails')}
        </Text>

        <View style={styles.card}>
          <View style={styles.serviceRow}>

            <View style={styles.serviceIcon}>
              <Ionicons
                name="sparkles-outline"
                size={28}
                color="#4E8EA2"
              />
            </View>

            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>
                {translateService(bookingData.category || bookingData.service, language)}
              </Text>

              <View style={styles.bookingIdContainer}>
                <Ionicons
                  name="receipt-outline"
                  size={13}
                  color="#9CA3AF"
                />

                <Text style={styles.bookingId}>
                  {bookingData.bookingId}
                </Text>
              </View>
            </View>

            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>
                {translate(language, 'completed') || 'Done'}
              </Text>
            </View>

          </View>
        </View>

        {/* WORKER DETAILS */}
        <Text style={styles.sectionTitle}>
          {translate(language, 'workerDetails') || 'Worker Details'}
        </Text>

        <View style={styles.card}>
          <View style={styles.workerRow}>

            <View style={styles.workerImage}>
              <Ionicons
                name="person"
                size={30}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.workerInfo}>
              <Text style={styles.workerName}>
                {bookingData.worker}
              </Text>

              <Text style={styles.workerRole}>
                {translate(language, 'professionalServiceProvider') || 'Professional Service Provider'}
              </Text>

              <View style={styles.ratingRow}>
                <Ionicons
                  name="star"
                  size={14}
                  color="#F59E0B"
                />

                <Text style={styles.ratingText}>
                  4.9
                </Text>

                <Text style={styles.reviewText}>
                  • Highly Rated
                </Text>
              </View>
            </View>

            <AnimatedButton
              onPress={() => {}}
              style={styles.callButtonWrapper}
            >
              <View style={styles.callButton}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color="#4E8EA2"
                />
              </View>
            </AnimatedButton>

          </View>
        </View>

        {/* SCHEDULE */}
        <Text style={styles.sectionTitle}>
          Schedule
        </Text>

        <View style={styles.card}>

          <View style={styles.detailRow}>

            <View style={styles.detailIcon}>
              <Ionicons
                name="calendar-outline"
                size={22}
                color="#4E8EA2"
              />
            </View>

            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>
                Date
              </Text>

              <Text style={styles.detailValue}>
                {bookingData.date}
              </Text>
            </View>

          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>

            <View style={styles.detailIcon}>
              <Ionicons
                name="time-outline"
                size={22}
                color="#4E8EA2"
              />
            </View>

            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>
                Time
              </Text>

              <Text style={styles.detailValue}>
                {bookingData.time}
              </Text>
            </View>

          </View>

        </View>

        {/* PAYMENT */}
        <Text style={styles.sectionTitle}>
          Payment Details
        </Text>

        <View style={styles.card}>

          <View style={styles.paymentRow}>

            <View>
              <Text style={styles.paymentLabel}>
                Total Amount
              </Text>

              <Text style={styles.amount}>
                {bookingData.price}
              </Text>
            </View>

            <View style={styles.paidBadge}>

              <Ionicons
                name="checkmark-circle"
                size={16}
                color="#059669"
              />

              <Text style={styles.paidText}>
                {bookingData.paymentStatus}
              </Text>

            </View>

          </View>

          <View style={styles.divider} />

          <View style={styles.paymentMethodRow}>

            <View style={styles.paymentIcon}>
              <Ionicons
                name="card-outline"
                size={22}
                color="#4E8EA2"
              />
            </View>

            <View>
              <Text style={styles.detailLabel}>
                Payment Mode
              </Text>

              <Text style={styles.detailValue}>
                {bookingData.paymentMode}
              </Text>
            </View>

          </View>

        </View>

        {/* BOOKING SUMMARY */}
        <Text style={styles.sectionTitle}>
          Booking Summary
        </Text>

        <View style={styles.summaryCard}>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Service
            </Text>

            <Text style={styles.summaryValue}>
              {bookingData.category}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Worker
            </Text>

            <Text style={styles.summaryValue}>
              {bookingData.worker}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Date
            </Text>

            <Text style={styles.summaryValue}>
              {bookingData.date}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Time
            </Text>

            <Text style={styles.summaryValue}>
              {bookingData.time}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Total Paid
            </Text>

            <Text style={styles.totalAmount}>
              {bookingData.price}
            </Text>
          </View>

        </View>

        {/* BACK TO BOOKINGS */}
        <AnimatedButton
          onPress={onBack}
          style={styles.backHomeWrapper}
        >
          <View style={styles.backHomeButton}>

            <Ionicons
              name="arrow-back"
              size={18}
              color="#FFFFFF"
            />

            <Text style={styles.backHomeText}>
              Back to My Bookings
            </Text>

          </View>
        </AnimatedButton>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    paddingBottom: 40,
  },

  /* HEADER */

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

  backButtonWrapper: {
    width: 42,
    height: 42,
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

  /* STATUS */

  statusCard: {
    marginHorizontal: 20,
    marginTop: 25,
    padding: 18,
    backgroundColor: '#ECFDF5',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },

  checkCircle: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statusInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },

  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
  },

  statusSubtitle: {
    fontSize: 12,
    color: '#047857',
    marginTop: 4,
    lineHeight: 18,
  },

  statusDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* SECTION */

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 12,
  },

  /* CARD */

  card: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 17,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },

  /* SERVICE */

  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  serviceIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#EAF4F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  serviceInfo: {
    flex: 1,
    marginLeft: 14,
  },

  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  bookingIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  bookingId: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },

  completedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  completedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },

  /* WORKER */

  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  workerImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#4E8EA2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  workerInfo: {
    flex: 1,
    marginLeft: 14,
  },

  workerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },

  workerRole: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginLeft: 4,
  },

  reviewText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 4,
  },

  callButtonWrapper: {
    width: 42,
    height: 42,
  },

  callButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF4F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* DETAILS */

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EAF4F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  detailInfo: {
    marginLeft: 12,
  },

  detailLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },

  /* PAYMENT */

  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  paymentLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  amount: {
    fontSize: 23,
    fontWeight: '700',
    color: '#4E8EA2',
    marginTop: 4,
  },

  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },

  paidText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },

  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  paymentIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EAF4F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  /* SUMMARY */

  summaryCard: {
    marginHorizontal: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
  },

  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    maxWidth: '55%',
    textAlign: 'right',
  },

  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 5,
    marginBottom: 15,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4E8EA2',
  },

  /* BACK BUTTON */

  backHomeWrapper: {
    marginHorizontal: 20,
    marginTop: 25,
    height: 52,
  },

  backHomeButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#2A2A2A',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backHomeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },

});