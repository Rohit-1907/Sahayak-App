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
  Linking,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import { translate, translateService } from '../utils/translations';

export default function OrgBookingDetails({
  onBack,
  bookingId, // Format: "org-4" or "org-5"
  onPaymentSuccess,
  initialBooking,
  language = 'english',
}) {
  // =====================================================
  // STATE
  // =====================================================

  const [loading, setLoading] = useState(!initialBooking);
  const [bookingData, setBookingData] = useState(initialBooking || null);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [serviceCharge, setServiceCharge] = useState(''); // CLIENT ENTERS THIS
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
  // FETCH BOOKING DETAILS (SWR Cache)
  // =====================================================

  useEffect(() => {
    let isMounted = true;
    const loadCache = async () => {
      if (!initialBooking && bookingId) {
        try {
          const cached = await AsyncStorage.getItem(`@cache_org_booking_${bookingId}`);
          if (cached && isMounted) {
            const parsed = JSON.parse(cached);
            if (parsed) {
              setBookingData(parsed);
              setLoading(false);
              if (parsed.rating && parsed.feedback) {
                setHasRated(true);
              }
            }
          }
        } catch (e) {}
      }
    };
    loadCache();
    if (bookingId) {
      fetchOrgBookingDetails(!initialBooking && !bookingData);
    }
    return () => { isMounted = false; };
  }, [bookingId]);

  const fetchOrgBookingDetails = async (showLoading = false) => {
    try {
      if (showLoading && !bookingData) {
        setLoading(true);
      }
      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        Alert.alert('Error', 'Please login to view booking details');
        return;
      }

      // Extract numeric ID from "org-4" format
      const orgRequestId = bookingId.toString().replace('org-', '');
      console.log('[API] Fetching organization booking details for:', orgRequestId);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/org/requests/client/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      console.log('[DATA] Organization requests:', data);

      if (data.success && data.requests) {
        // Find the specific request
        const request = data.requests.find(r => r.id === parseInt(orgRequestId));
        
        if (request) {
          setBookingData(request);
          try {
            AsyncStorage.setItem(`@cache_org_booking_${bookingId}`, JSON.stringify(request));
          } catch (e) {}
          console.log('[STATS] Organization booking found:', request);
          
          // Check if already rated
          if (request.rating && request.feedback) {
            setHasRated(true);
            console.log('[OK] Client has already rated this organization work');
          } else {
            setHasRated(false);
            console.log('[NOTE] Rating not submitted yet');
          }
        } else {
          Alert.alert('Error', 'Organization booking not found');
        }
      } else {
        Alert.alert('Error', data.error || 'Failed to load booking details');
      }
    } catch (error) {
      console.error('[FAIL] Error fetching organization booking:', error);
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
    const service = parseFloat(serviceCharge) || 0;
    const platformFee = 50; // Fixed platform fee
    const additional = parseFloat(additionalCharges) || 0;
    
    return service + platformFee + additional;
  };

  // =====================================================
  // NAVIGATE TO LOCATION
  // =====================================================

  const handleNavigateToLocation = () => {
    if (!bookingData || !bookingData.work_location) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    const address = encodeURIComponent(bookingData.work_location);
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;

    Alert.alert(
      'Navigate to Location',
      'Open location in Google Maps?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Maps',
          onPress: () => {
            Linking.openURL(mapUrl).catch(() => {
              Alert.alert('Error', 'Could not open maps');
            });
          },
        },
      ]
    );
  };

  // =====================================================
  // PAYMENT
  // =====================================================

  const handlePayment = async () => {
    // Validate service charge input
    if (!serviceCharge || parseFloat(serviceCharge) <= 0) {
      Alert.alert('Service Charge Required', 'Please enter the service charge amount');
      return;
    }

    const total = calculateTotal();
    
    console.log('[PAY] Organization Payment Details:');
    console.log('Service Charge:', serviceCharge);
    console.log('Platform Fee: 50');
    console.log('Mode:', paymentMode);
    console.log('Total:', total);
    
    Alert.alert(
      'Confirm Payment',
      `Pay Rs. ${total} via ${paymentMode} for organization service?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('access_token');
              
              if (token && bookingData) {
                const orgRequestId = bookingData.id;
                
                console.log('[REQ] Completing organization work request:', orgRequestId);
                
                // Call backend API to mark as completed
                const response = await fetch(
                  `${API_BASE_URL}/api/v1/org/requests/${orgRequestId}/complete/`,
                  {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      payment_mode: paymentMode,
                      service_charge: parseFloat(serviceCharge),
                      platform_fee: 50,
                      additional_charges: parseFloat(additionalCharges) || 0,
                      additional_charges_reason: additionalReason || '',
                      total_amount: total,
                    }),
                  }
                );

                const data = await response.json();
                console.log('[RES] Payment response:', data);

                if (response.ok && data.success) {
                  // Update local booking data with completed status
                  setBookingData({ ...bookingData, status: 'completed' });
                  
                  console.log('[OK] Organization work request marked as COMPLETED');
                  
                  Alert.alert(
                    'Payment Successful', 
                    `Payment of Rs. ${total} completed successfully!\n\nThe work is now marked as completed. You can rate the organization service.`,
                    [
                      {
                        text: 'OK',
                        onPress: async () => {
                          if (typeof onPaymentSuccess === 'function') {
                            await onPaymentSuccess();
                          }
                          // Navigate back to trigger screen change to bookings
                          if (typeof onBack === 'function') {
                            onBack();
                          }
                        },
                      },
                    ]
                  );
                } else {
                  Alert.alert('Error', data.error || 'Failed to complete payment');
                }
              }
              
            } catch (error) {
              console.error('[FAIL] Payment error:', error);
              Alert.alert('Payment Failed', 'Could not process payment. Please try again.');
            }
          },
        },
      ]
    );
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
      Alert.alert('Feedback Required', 'Please provide feedback for the organization');
      return;
    }

    try {
      setSubmittingRating(true);
      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        Alert.alert('Error', 'Please login to submit rating');
        return;
      }

      const orgRequestId = bookingData.id;

      console.log('[STAR] Submitting organization rating:', { rating, feedback, orgRequestId });

      const response = await fetch(
        `${API_BASE_URL}/api/v1/org/requests/${orgRequestId}/rate/`,
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
          'Your rating and feedback for the organization service has been submitted successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Refresh booking data
                fetchOrgBookingDetails();
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

  const service = parseFloat(serviceCharge) || 0;
  const platformFee = 50;
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
                  rawStatus === 'ACCEPTED' && styles.statusScheduled,
                  rawStatus === 'PENDING' && styles.statusRequested,
                  rawStatus === 'COMPLETED' && styles.statusCompleted,
                  isRejected && styles.statusRejected,
                ]}>
                  <Text style={[
                    styles.statusText,
                    isRejected && styles.statusRejectedText,
                  ]}>
                    {rawStatus === 'ACCEPTED' ? 'SCHEDULED' : rawStatus}
                  </Text>
                </View>
              </View>

              <Text style={styles.bookingId}>
                #ORG-{bookingData.id}
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
                  {bookingData.rejection_reason || 'This organization work request was rejected and is no longer active.'}
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
              <Text style={styles.label}>{translate(language, 'serviceType') || 'Service Type'}</Text>
              <Text style={styles.value}>{translateService(bookingData.work_type, language)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>{translate(language, 'organization') || 'Organization'}</Text>
              <Text style={styles.value}>{bookingData.org_name || 'N/A'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>{translate(language, 'workersAssigned') || 'Workers Assigned'}</Text>
              <Text style={styles.value}>{bookingData.assignment_count || 0}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>{translate(language, 'date')}</Text>
              <Text style={styles.value}>{formatDate(bookingData.required_date)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>{translate(language, 'time')}</Text>
              <Text style={styles.value}>{formatTime(bookingData.required_time)}</Text>
            </View>

            {bookingData.work_description && (
              <>
                <View style={styles.divider} />
                <Text style={styles.descriptionLabel}>{translate(language, 'description')}</Text>
                <Text style={styles.descriptionText}>{bookingData.work_description}</Text>
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
                {bookingData.work_location || 'Address not provided'}
              </Text>
            </View>

            {!isRejected && (
              <Pressable
                delayPressIn={0}
                style={styles.navigateButton}
                onPress={handleNavigateToLocation}
              >
                <Ionicons name="navigate" size={20} color="#FFFFFF" />
                <Text style={styles.navigateText}>{translate(language, 'navigateToLocation') || 'Navigate to Location'}</Text>
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
                  delayPressIn={0}
                  activeOpacity={0.7}
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
                  delayPressIn={0}
                  activeOpacity={0.7}
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
              PRICE BREAKDOWN - SERVICE CHARGE INPUT
          ================================================= */}

          {!isRejected && (
            <View style={styles.card}>

              <Text style={styles.sectionTitle}>
                Price Details
              </Text>

              <Text style={styles.priceInfoText}>
                Enter the agreed service charge for this organization work
              </Text>

              {/* SERVICE CHARGE INPUT BOX */}
              <View style={styles.serviceChargeContainer}>
                <Text style={styles.serviceChargeLabel}>Service Charge</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.rupeeSymbol}>Rs. </Text>
                  <TextInput
                    style={styles.serviceChargeInput}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    value={serviceCharge}
                    onChangeText={setServiceCharge}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              <View style={styles.divider} />

              {/* PLATFORM FEE - FIXED */}
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Platform fee</Text>
                <Text style={styles.price}>Rs. 50</Text>
              </View>

              {/* ADDITIONAL CHARGES */}
              {additional > 0 && (
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

              {/* TOTAL AMOUNT */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.total}>Rs. {total}</Text>
              </View>

              {service === 0 && (
                <Text style={styles.warningText}>
                  [WARN] Please enter service charge to proceed with payment
                </Text>
              )}

            </View>
          )}

          {/* =================================================
              RATING & FEEDBACK (For accepted/completed org bookings)
          ================================================= */}

          {!isRejected && (bookingData.status === 'accepted' || bookingData.status === 'completed') && !hasRated && (
            <View style={styles.card}>

              <Text style={styles.sectionTitle}>
                Rate Organization Service
              </Text>

              <Text style={styles.ratingSubtitle}>
                How was your experience with {bookingData.org_name || 'the organization'}?
              </Text>

              {/* Star Rating */}
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    delayPressIn={0}
                    activeOpacity={0.7}
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
                placeholder="Share your feedback about the organization service (required)"
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
          {!isRejected && (bookingData.status === 'accepted' || bookingData.status === 'completed') && hasRated && bookingData.rating && (
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
              delayPressIn={0}
              style={({ pressed }) => [
                styles.continueButton,
                pressed && styles.continuePressed,
                service === 0 && styles.continueDisabled,
              ]}
              onPress={handlePayment}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={service === 0}
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
    backgroundColor: '#FFF7ED',
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
    marginBottom: 16,
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },

  label: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },

  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    textAlign: 'right',
  },

  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },

  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },

  descriptionText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  locationText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },

  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#49769F',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },

  navigateText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  paymentModes: {
    flexDirection: 'row',
    gap: 12,
  },

  paymentModeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 18,
    position: 'relative',
  },

  paymentModeActive: {
    borderColor: '#49769F',
    backgroundColor: '#EAF3FA',
  },

  paymentModeText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },

  paymentModeTextActive: {
    color: '#49769F',
  },

  checkMark: {
    position: 'absolute',
    top: 6,
    right: 6,
  },

  additionalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  additionalDescription: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 18,
  },

  additionalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1E293B',
    marginBottom: 12,
  },

  reasonInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  priceInfoText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },

  serviceChargeContainer: {
    marginBottom: 16,
  },

  serviceChargeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#49769F',
    borderRadius: 12,
    paddingHorizontal: 16,
  },

  rupeeSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#49769F',
    marginRight: 8,
  },

  serviceChargeInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },

  priceLabel: {
    fontSize: 14,
    color: '#64748B',
  },

  price: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },

  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
  },

  total: {
    fontSize: 22,
    fontWeight: '700',
    color: '#49769F',
  },

  warningText: {
    marginTop: 12,
    fontSize: 13,
    color: '#F97316',
    textAlign: 'center',
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },

  infoIcon: {
    marginRight: 12,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },

  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },

  totalContainer: {
    marginBottom: 12,
  },

  bottomLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },

  bottomPrice: {
    fontSize: 26,
    fontWeight: '700',
    color: '#49769F',
  },

  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#49769F',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },

  continuePressed: {
    opacity: 0.8,
  },

  continueDisabled: {
    backgroundColor: '#94A3B8',
  },

  continueText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  // Rating card styles
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },

  starButton: {
    padding: 4,
  },

  ratingSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    textAlign: 'center',
  },

  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },

  feedbackInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1E293B',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },

  submitRatingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#49769F',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },

  submitRatingButtonDisabled: {
    backgroundColor: '#CBD5E1',
    opacity: 0.6,
  },

  submitRatingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

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
