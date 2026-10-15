import React, { useRef, useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Location from 'expo-location';
import { API_BASE_URL } from '../config/api';
import { translate, translateService } from '../utils/translations';

export default function Bookingsummary({
  onBack,
  onContinue,
  requestId, // Pass this from MyRequestsScreen
  onPaymentSuccess, // Callback to refresh data after payment
  initialBooking, // Pre-loaded booking data for instant loading
  language = 'english',
}) {
  // =====================================================
  // STATE
  // =====================================================

  const [loading, setLoading] = useState(!initialBooking);
  const [bookingData, setBookingData] = useState(initialBooking || null);
  const [paymentMode, setPaymentMode] = useState('CASH'); // CASH or UPI
  const [additionalCharges, setAdditionalCharges] = useState('');
  const [additionalReason, setAdditionalReason] = useState('');
  const [showAdditionalCharges, setShowAdditionalCharges] = useState(false);
  
  // Rating & Feedback states
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [hasRated, setHasRated] = useState(
    !!(initialBooking?.rating && initialBooking?.feedback)
  );

  // =====================================================
  // BUTTON ANIMATION
  // =====================================================

  const buttonScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  // =====================================================
  // FETCH BOOKING DETAILS
  // =====================================================

  useEffect(() => {
    if (requestId) {
      fetchBookingDetails(!initialBooking);
    }
  }, [requestId]);

  const fetchBookingDetails = async (showLoading = false) => {
    try {
      if (showLoading && !bookingData) {
        setLoading(true);
      }
      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        Alert.alert('Error', 'Please login to view booking details');
        return;
      }

      console.log('[API] Fetching booking details for:', requestId);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/jobs/work-requests/${requestId}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      console.log('[DATA] Booking details:', data);

      if (data.success) {
        setBookingData(data.work_request);
        console.log('[DATA] Full booking data:', JSON.stringify(data.work_request, null, 2));
        console.log('[STATS] Booking status:', data.work_request.status);
        console.log('[STAR] Has rating?', data.work_request.rating);
        console.log('[CHAT] Has feedback?', data.work_request.feedback);
        
        // Check if already rated
        if (data.work_request.rating && data.work_request.feedback) {
          setHasRated(true);
          console.log('[OK] User has already rated this booking');
        } else {
          setHasRated(false);
          console.log('[NOTE] Rating not submitted yet - should show rating card');
        }
      } else {
        Alert.alert('Error', data.error || 'Failed to load booking details');
      }
    } catch (error) {
      console.error('[FAIL] Error fetching booking:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'TBD';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // =====================================================
  // CALCULATIONS
  // =====================================================

  const calculateTotal = () => {
    if (!bookingData) return 0;
    
    // estimated_budget already contains base_price + visiting_charges + platform_fee (Rs. 50)
    const baseBudget = parseFloat(bookingData.estimated_budget) || 0;
    const additional = parseFloat(additionalCharges) || 0;
    
    return baseBudget + additional;
  };

  // =====================================================
  // NAVIGATE TO WORKER
  // =====================================================

  const handleNavigateToWorker = async () => {
    if (!bookingData) {
      Alert.alert('Error', 'Booking data not available');
      return;
    }

    // Destination: prefer worker live location, fall back to job/work location
    const destLat = bookingData.worker_latitude || bookingData.work_latitude || bookingData.latitude;
    const destLon = bookingData.worker_longitude || bookingData.work_longitude || bookingData.longitude;

    if (!destLat || !destLon) {
      Alert.alert('Error', 'Destination location not available for navigation.');
      return;
    }

    try {
      // Request permission and get device's current GPS location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for navigation.');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const clientLocation = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };

      const workerLocation = {
        latitude: parseFloat(destLat),
        longitude: parseFloat(destLon),
      };

      console.log('[MAP] Opening in-app map:', { clientLocation, workerLocation });

      if (onContinue) {
        onContinue('navigationMap', {
          clientLocation,
          workerLocation,
          workerName: bookingData.worker_name || 'Worker',
        });
      }
    } catch (error) {
      console.error('[FAIL] Error getting location for navigation:', error);
      Alert.alert('Error', 'Could not get your current location. Please enable GPS and try again.');
    }
  };

  // =====================================================
  // PAYMENT
  // =====================================================

  const parseUrlParams = (url) => {
    const params = {};
    if (!url || !url.includes('?')) return params;
    const queryString = url.split('?')[1];
    const pairs = queryString.split('&');
    for (const pair of pairs) {
      const [k, v] = pair.split('=');
      if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '');
    }
    return params;
  };

  const handlePayment = async () => {
    const total = calculateTotal();
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      Alert.alert('Error', 'Please login to complete payment');
      return;
    }

    if (paymentMode === 'UPI') {
      // ----------------------------------------------------
      // ONLINE PAYMENT (RAZORPAY)
      // ----------------------------------------------------
      Alert.alert(
        'Online Payment',
        `Pay Rs. ${total} securely via Razorpay (UPI / Card / Netbanking)?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Proceed to Pay',
            onPress: async () => {
              try {
                // 1. Create Order on Backend
                const orderRes = await fetch(`${API_BASE_URL}/api/v1/payments/create-order/`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    work_request_id: requestId,
                    additional_charges: parseFloat(additionalCharges) || 0,
                    additional_charges_reason: additionalReason || '',
                  }),
                });

                const orderData = await orderRes.json();
                if (!orderRes.ok || !orderData.success) {
                  Alert.alert('Error', orderData.error || 'Failed to initiate payment');
                  return;
                }

                // 2. Open Hosted Razorpay Checkout via WebBrowser
                const checkoutUrl = `${API_BASE_URL}${orderData.checkout_url}`;
                console.log('[PAY] Launching checkout URL:', checkoutUrl);

                const result = await WebBrowser.openAuthSessionAsync(checkoutUrl, 'sahayak://');
                console.log('[PAY] WebBrowser Result:', result);

                let paymentParams = {};
                if (result.type === 'success' && result.url) {
                  paymentParams = parseUrlParams(result.url);
                }

                // If user completed payment or if in test mode
                if (paymentParams.status === 'success' || orderData.test_mode) {
                  // 3. Verify Payment on Backend
                  const verifyRes = await fetch(`${API_BASE_URL}/api/v1/payments/verify/`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      payment_id: paymentParams.payment_id || orderData.payment_id,
                      razorpay_order_id: paymentParams.razorpay_order_id || orderData.order_id,
                      razorpay_payment_id: paymentParams.razorpay_payment_id || `pay_sim_${Date.now()}`,
                      razorpay_signature: paymentParams.razorpay_signature || 'simulated_sig',
                    }),
                  });

                  const verifyData = await verifyRes.json();
                  if (verifyRes.ok && verifyData.success) {
                    console.log('[OK] Online payment verified, job is now COMPLETED');
                    await fetchBookingDetails(false);
                    if (typeof onPaymentSuccess === 'function') {
                      await onPaymentSuccess();
                    }
                    Alert.alert(
                      'Payment Successful',
                      `Payment of Rs. ${total} completed successfully! The job has been automatically marked as COMPLETED.`,
                      [
                        {
                          text: 'OK',
                          onPress: async () => {
                            if (typeof onPaymentSuccess === 'function') {
                              await onPaymentSuccess();
                            }
                            if (typeof onBack === 'function') {
                              onBack();
                            }
                          },
                        },
                      ]
                    );
                  } else {
                    Alert.alert('Verification Failed', verifyData.error || 'Could not verify payment');
                  }
                } else if (result.type === 'cancel' || result.type === 'dismiss') {
                  Alert.alert('Payment Incomplete', 'Payment session was closed before completion.');
                }
              } catch (error) {
                console.error('[FAIL] Online payment error:', error);
                Alert.alert('Error', 'An error occurred while launching payment. Please try again.');
              }
            },
          },
        ]
      );
    } else {
      // ----------------------------------------------------
      // CASH AFTER SERVICE
      // ----------------------------------------------------
      Alert.alert(
        'Confirm Cash Payment',
        `Confirm that you will pay Rs. ${total} in Cash to the worker?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm Cash Payment',
            onPress: async () => {
              try {
                const response = await fetch(
                  `${API_BASE_URL}/api/v1/jobs/work-requests/${requestId}/complete/`,
                  {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      payment_mode: 'CASH',
                      total_amount: total,
                      additional_charges: parseFloat(additionalCharges) || 0,
                      additional_charges_reason: additionalReason || '',
                    }),
                  }
                );

                const data = await response.json();
                if (response.ok && data.success) {
                  console.log('[OK] Cash payment logged & job COMPLETED');
                  if (data.work_request) {
                    setBookingData(data.work_request);
                  }
                  if (typeof onPaymentSuccess === 'function') {
                    await onPaymentSuccess();
                  }
                  Alert.alert(
                    'Job Completed',
                    `Job marked as completed. Please pay Rs. ${total} in cash to the worker.`,
                    [
                      {
                        text: 'OK',
                        onPress: async () => {
                          if (typeof onPaymentSuccess === 'function') {
                            await onPaymentSuccess();
                          }
                          if (typeof onBack === 'function') {
                            onBack();
                          }
                        },
                      },
                    ]
                  );
                } else {
                  Alert.alert('Error', data.error || 'Failed to complete job');
                }
              } catch (error) {
                console.error('[FAIL] Cash payment error:', error);
                Alert.alert('Payment Error', 'Could not complete job. Please try again.');
              }
            },
          },
        ]
      );
    }
  };

  // =====================================================
  // SUBMIT RATING & FEEDBACK
  // =====================================================

  const handleSubmitRating = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting');
      return;
    }

    if (!feedback.trim()) {
      Alert.alert('Feedback Required', 'Please provide feedback for the worker');
      return;
    }

    try {
      setSubmittingRating(true);
      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        Alert.alert('Error', 'Please login to submit rating');
        return;
      }

      console.log('[STAR] Submitting rating:', { rating, feedback, workRequestId: requestId });

      const response = await fetch(
        `${API_BASE_URL}/api/v1/jobs/work-requests/${requestId}/rate/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rating: rating,
            feedback: feedback.trim(),
          }),
        }
      );

      const data = await response.json();
      console.log('[DATA] Rating response:', data);

      if (response.ok && data.success) {
        setHasRated(true);
        Alert.alert(
          'Thank You!',
          'Your rating and feedback has been submitted successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Optionally refresh booking data
                fetchBookingDetails();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('[FAIL] Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setSubmittingRating(false);
    }
  };

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#49769F" />
          <Text style={styles.loadingText}>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!bookingData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, styles.centerContent]}>
          <Ionicons name="alert-circle-outline" size={64} color="#94A3B8" />
          <Text style={styles.errorText}>Booking not found</Text>
          <Pressable style={styles.retryButton} onPress={onBack}>
            <Text style={styles.retryText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const rawBudget = parseFloat(bookingData?.estimated_budget) || 0;
  const platformFee = 50;
  const serviceCharge = Math.max(0, rawBudget - platformFee);
  const additional = parseFloat(additionalCharges) || 0;
  const total = calculateTotal();
  const rawStatus = (bookingData?.status || '').toUpperCase();
  const isRejected = rawStatus === 'REJECTED' || rawStatus === 'CANCELLED';

  // =====================================================
  // UI
  // =====================================================

  return (
    <SafeAreaView style={styles.container}>

      {/* =================================================
          HEADER
      ================================================= */}

      <View style={styles.header}>

        <Pressable
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
          {translate(language, 'bookingDetails')}
        </Text>

        <View style={styles.headerSpacer} />

      </View>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        <View style={styles.content}>

          {/* =================================================
              BOOKING ID & STATUS
          ================================================= */}

          <View style={styles.bookingIdCard}>

            <View style={styles.bookingIdContent}>

              <View style={styles.bookingIdHeader}>
                <Text style={styles.smallLabel}>
                  {translate(language, 'bookingId') || 'Booking ID'}
                </Text>

                <View style={[
                  styles.statusBadge,
                  rawStatus === 'SCHEDULED' && styles.statusScheduled,
                  rawStatus === 'REQUESTED' && styles.statusRequested,
                  rawStatus === 'COMPLETED' && styles.statusCompleted,
                  isRejected && styles.statusRejected,
                ]}>
                  <Text style={[
                    styles.statusText,
                    isRejected && styles.statusRejectedText,
                  ]}>
                    {bookingData.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.bookingId}>
                #{bookingData.id}
              </Text>

            </View>

          </View>

          {/* =================================================
              REJECTION BANNER
          ================================================= */}
          {isRejected && (
            <View style={styles.rejectedBanner}>
              <View style={styles.rejectedBannerIcon}>
                <Ionicons name="close-circle" size={26} color="#EF4444" />
              </View>
              <View style={styles.rejectedBannerContent}>
                <Text style={styles.rejectedBannerTitle}>Request Rejected</Text>
                <Text style={styles.rejectedBannerSubtitle}>
                  {bookingData.rejection_reason || 'This service request was rejected and is no longer active.'}
                </Text>
              </View>
            </View>
          )}

          {/* =================================================
              SERVICE DETAILS
          ================================================= */}

          <View style={styles.card}>

            <Text style={styles.sectionTitle}>
              {translate(language, 'serviceDetails')}
            </Text>

            <View style={styles.row}>
              <Text style={styles.label}>{translate(language, 'service')}</Text>
              <Text style={styles.value}>{translateService(bookingData.service_category, language)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>{translate(language, 'title')}</Text>
              <Text style={styles.value}>{bookingData.title || 'N/A'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>{translate(language, 'worker')}</Text>
              <Text style={styles.value}>{bookingData.worker_name || 'Pending'}</Text>
            </View>

            {bookingData.worker_phone && (
              <View style={styles.row}>
                <Text style={styles.label}>{translate(language, 'phone')}</Text>
                <Text style={styles.value}>{bookingData.worker_phone}</Text>
              </View>
            )}

            <View style={styles.row}>
              <Text style={styles.label}>{translate(language, 'date')}</Text>
              <Text style={styles.value}>{formatDate(bookingData.required_date)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>{translate(language, 'time')}</Text>
              <Text style={styles.value}>{formatTime(bookingData.required_time)}</Text>
            </View>

            {bookingData.description && (
              <>
                <View style={styles.divider} />
                <Text style={styles.descriptionLabel}>{translate(language, 'description')}</Text>
                <Text style={styles.descriptionText}>{bookingData.description}</Text>
              </>
            )}

          </View>

          {/* =================================================
              LOCATION & NAVIGATE
          ================================================= */}

          <View style={styles.card}>

            <Text style={styles.sectionTitle}>
              {translate(language, 'workLocation')}
            </Text>

            <View style={styles.locationRow}>
              <Ionicons name="location" size={20} color="#49769F" />
              <Text style={styles.locationText}>
                {bookingData.work_address || 'Address not provided'}
              </Text>
            </View>

            {!isRejected && (
              <Pressable
                style={styles.navigateButton}
                onPress={handleNavigateToWorker}
              >
                <Ionicons name="navigate" size={20} color="#FFFFFF" />
                <Text style={styles.navigateText}>{translate(language, 'navigateToWorker')}</Text>
              </Pressable>
            )}

          </View>

          {/* =================================================
              PAYMENT MODE SELECTION
          ================================================= */}

          {!isRejected && (
            <View style={styles.card}>

              <Text style={styles.sectionTitle}>
                {translate(language, 'paymentMethod')}
              </Text>

              <View style={styles.paymentModes}>

                <TouchableOpacity
                  style={[
                    styles.paymentModeCard,
                    paymentMode === 'CASH' && styles.paymentModeActive,
                  ]}
                  onPress={() => setPaymentMode('CASH')}
                >
                  <Ionicons
                    name="cash-outline"
                    size={28}
                    color={paymentMode === 'CASH' ? '#49769F' : '#64748B'}
                  />
                  <Text style={[
                    styles.paymentModeText,
                    paymentMode === 'CASH' && styles.paymentModeTextActive,
                  ]}>
                    {translate(language, 'cash')}
                  </Text>
                  {paymentMode === 'CASH' && (
                    <View style={styles.checkMark}>
                      <Ionicons name="checkmark-circle" size={20} color="#49769F" />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentModeCard,
                    paymentMode === 'UPI' && styles.paymentModeActive,
                  ]}
                  onPress={() => setPaymentMode('UPI')}
                >
                  <Ionicons
                    name="phone-portrait-outline"
                    size={28}
                    color={paymentMode === 'UPI' ? '#49769F' : '#64748B'}
                  />
                  <Text style={[
                    styles.paymentModeText,
                    paymentMode === 'UPI' && styles.paymentModeTextActive,
                  ]}>
                    UPI
                  </Text>
                  {paymentMode === 'UPI' && (
                    <View style={styles.checkMark}>
                      <Ionicons name="checkmark-circle" size={20} color="#49769F" />
                    </View>
                  )}
                </TouchableOpacity>

              </View>

            </View>
          )}

          {/* =================================================
              ADDITIONAL CHARGES
          ================================================= */}

          {!isRejected && (
            <View style={styles.card}>

              <View style={styles.additionalHeader}>
                <Text style={styles.sectionTitle}>
                  Additional Charges
                </Text>
                <TouchableOpacity
                  onPress={() => setShowAdditionalCharges(!showAdditionalCharges)}
                >
                  <Ionicons
                    name={showAdditionalCharges ? 'remove-circle' : 'add-circle'}
                    size={24}
                    color="#49769F"
                  />
                </TouchableOpacity>
              </View>

              {showAdditionalCharges && (
                <>
                  <Text style={styles.additionalDescription}>
                    If extra work was required on-site, add the additional amount here
                  </Text>

                  <TextInput
                    style={styles.additionalInput}
                    placeholder="Enter additional amount (Rs. )"
                    keyboardType="numeric"
                    value={additionalCharges}
                    onChangeText={setAdditionalCharges}
                  />

                  <TextInput
                    style={[styles.additionalInput, styles.reasonInput]}
                    placeholder="Reason for additional charges"
                    value={additionalReason}
                    onChangeText={setAdditionalReason}
                    multiline
                  />
                </>
              )}

            </View>
          )}

          {/* =================================================
              PRICE BREAKDOWN
          ================================================= */}

          <View style={styles.card}>

            <Text style={styles.sectionTitle}>
              Price Details
            </Text>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service charge</Text>
              <Text style={styles.price}>Rs. {serviceCharge}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Platform fee</Text>
              <Text style={styles.price}>Rs. {platformFee}</Text>
            </View>

            {!isRejected && additional > 0 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: '#F97316' }]}>
                  Additional charges
                </Text>
                <Text style={[styles.price, { color: '#F97316' }]}>
                  Rs. {additional}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.total}>Rs. {total}</Text>
            </View>

          </View>

          {/* =================================================
              RATING & FEEDBACK (For SCHEDULED and COMPLETED bookings)
          ================================================= */}

          {!isRejected && (bookingData.status === 'SCHEDULED' || bookingData.status === 'IN_PROGRESS' || bookingData.status === 'COMPLETED') && !hasRated && (
            <View style={styles.card}>

              <Text style={styles.sectionTitle}>
                Rate Your Experience
              </Text>

              <Text style={styles.ratingSubtitle}>
                How was your experience with {bookingData.worker_name || 'the worker'}?
              </Text>

              {/* Star Rating */}
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={40}
                      color={star <= rating ? '#F59E0B' : '#CBD5E1'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {rating > 0 && (
                <Text style={styles.ratingText}>
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </Text>
              )}

              {/* Feedback Input */}
              <TextInput
                style={styles.feedbackInput}
                placeholder="Share your feedback (required)"
                placeholderTextColor="#94A3B8"
                value={feedback}
                onChangeText={setFeedback}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitRatingButton,
                  (rating === 0 || !feedback.trim() || submittingRating) && styles.submitRatingButtonDisabled,
                ]}
                onPress={handleSubmitRating}
                disabled={rating === 0 || !feedback.trim() || submittingRating}
              >
                {submittingRating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.submitRatingText}>Submit Rating</Text>
                  </>
                )}
              </TouchableOpacity>

            </View>
          )}

          {/* Show existing rating and feedback if already rated */}
          {!isRejected && (bookingData.status === 'SCHEDULED' || bookingData.status === 'IN_PROGRESS' || bookingData.status === 'COMPLETED') && hasRated && bookingData.rating && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Your Rating & Feedback
              </Text>

              {/* Display Stars */}
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= bookingData.rating ? 'star' : 'star-outline'}
                    size={32}
                    color={star <= bookingData.rating ? '#F59E0B' : '#CBD5E1'}
                    style={{ marginHorizontal: 4 }}
                  />
                ))}
              </View>

              <Text style={styles.displayRatingText}>
                {bookingData.rating === 1 && 'Poor'}
                {bookingData.rating === 2 && 'Fair'}
                {bookingData.rating === 3 && 'Good'}
                {bookingData.rating === 4 && 'Very Good'}
                {bookingData.rating === 5 && 'Excellent'}
              </Text>

              {/* Display Feedback */}
              {bookingData.feedback && (
                <View style={styles.feedbackDisplay}>
                  <Text style={styles.feedbackDisplayLabel}>Your Feedback:</Text>
                  <Text style={styles.feedbackDisplayText}>{bookingData.feedback}</Text>
                </View>
              )}

              <View style={styles.thankYouMessage}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.thankYouMessageText}>
                  Thank you for your feedback!
                </Text>
              </View>
            </View>
          )}

          {/* =================================================
              SECURITY INFO
          ================================================= */}

          {!isRejected && (
            <View style={styles.infoBox}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={23}
                  color="#49769F"
                />
              </View>
              <Text style={styles.infoText}>
                Your payment is secure. Pay via {paymentMode} after work completion.
              </Text>
            </View>
          )}

        </View>

      </ScrollView>

      {/* =================================================
          BOTTOM PAYMENT BAR
      ================================================= */}

      {!isRejected && (
        <View style={styles.bottomContainer}>

          <View style={styles.totalContainer}>
            <Text style={styles.bottomLabel}>Total ({paymentMode})</Text>
            <Text style={styles.bottomPrice}>Rs. {total}</Text>
          </View>

          <Animated.View
            style={{
              transform: [{ scale: buttonScale }],
            }}
          >

            <Pressable
              style={({ pressed }) => [
                styles.continueButton,
                pressed && styles.continuePressed,
              ]}
              onPress={handlePayment}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              android_ripple={{ color: '#315A7D' }}
            >

              <Text style={styles.continueText}>
                Make Payment
              </Text>

              <Ionicons
                name="card-outline"
                size={20}
                color="#FFFFFF"
              />

            </Pressable>

          </Animated.View>

        </View>
      )}

    </SafeAreaView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },

  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#49769F',
    borderRadius: 10,
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  scrollContent: {
    paddingBottom: 125,
  },

  header: {
    height: 102,
    backgroundColor: '#49769F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 30,
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
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
  },

  headerSpacer: {
    width: 45,
  },

  content: {
    padding: 20,
  },

  bookingIdCard: {
    backgroundColor: '#EAF3FA',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#D4E4F0',
  },

  bookingIdContent: {
    flex: 1,
  },

  bookingIdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  smallLabel: {
    fontSize: 11,
    color: '#64748B',
  },

  bookingId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },

  statusScheduled: {
    backgroundColor: '#DCFCE7',
  },

  statusRequested: {
    backgroundColor: '#FEF3C7',
  },

  statusCompleted: {
    backgroundColor: '#DBEAFE',
  },

  statusRejected: {
    backgroundColor: '#FEE2E2',
  },

  statusRejectedText: {
    color: '#DC2626',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
  },

  rejectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    gap: 12,
  },

  rejectedBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  rejectedBannerContent: {
    flex: 1,
  },

  rejectedBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 4,
  },

  rejectedBannerSubtitle: {
    fontSize: 13,
    color: '#B91C1C',
    lineHeight: 18,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  label: {
    fontSize: 15,
    color: '#64748B',
  },

  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    maxWidth: '60%',
    textAlign: 'right',
  },

  descriptionLabel: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 6,
  },

  descriptionText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  locationText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },

  navigateButton: {
    backgroundColor: '#49769F',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  navigateText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },

  paymentModes: {
    flexDirection: 'row',
    gap: 12,
  },

  paymentModeCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },

  paymentModeActive: {
    borderColor: '#49769F',
    backgroundColor: '#EAF3FA',
  },

  paymentModeText: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },

  paymentModeTextActive: {
    color: '#49769F',
  },

  checkMark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  additionalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  additionalDescription: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 18,
  },

  additionalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },

  reasonInput: {
    height: 80,
    textAlignVertical: 'top',
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  priceLabel: {
    fontSize: 15,
    color: '#64748B',
  },

  price: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },

  total: {
    fontSize: 22,
    fontWeight: '800',
    color: '#49769F',
  },

  infoBox: {
    backgroundColor: '#EAF3FA',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },

  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  totalContainer: {
    marginRight: 10,
  },

  bottomLabel: {
    fontSize: 12,
    color: '#64748B',
  },

  bottomPrice: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },

  continueButton: {
    minHeight: 50,
    backgroundColor: '#49769F',
    borderRadius: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  continuePressed: {
    opacity: 0.85,
  },

  continueText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
  },

  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.94 }],
  },

  // Rating & Feedback Styles
  ratingSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },

  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },

  starButton: {
    padding: 4,
  },

  ratingText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 16,
  },

  feedbackInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 100,
    marginBottom: 16,
  },

  submitRatingButton: {
    backgroundColor: '#49769F',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  submitRatingButtonDisabled: {
    backgroundColor: '#CBD5E1',
    opacity: 0.6,
  },

  submitRatingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },

  thankYouCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },

  thankYouTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#166534',
    marginTop: 12,
    marginBottom: 8,
  },

  thankYouText: {
    fontSize: 14,
    color: '#15803D',
    textAlign: 'center',
  },

  // Display rating styles
  displayRatingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },

  feedbackDisplay: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  feedbackDisplayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },

  feedbackDisplayText: {
    fontSize: 15,
    color: '#1E293B',
    lineHeight: 22,
  },

  thankYouMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
  },

  thankYouMessageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 8,
  },

});
