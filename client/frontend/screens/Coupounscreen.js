import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Coupuonscreen({ onBack, onContinue }) {
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState('');

  const coupons = [
    {
      code: 'WELCOME20',
      title: '20% OFF',
      description: 'Get 20% off on your first booking',
    },
    {
      code: 'SAHAYAK100',
      title: 'Rs. 100 OFF',
      description: 'Get Rs. 100 off on your service',
    },
    {
      code: 'HOME50',
      title: 'Rs. 50 OFF',
      description: 'Flat Rs. 50 off on selected services',
    },
  ];

  const applyCoupon = (code = coupon) => {
    const enteredCode = code.trim().toUpperCase();

    if (!enteredCode) {
      setMessage('Please enter a coupon code');
      return;
    }

    if (enteredCode === 'WELCOME20') {
      setDiscount(20);
      setAppliedCoupon(enteredCode);
      setMessage('Coupon applied successfully!');
    } else if (enteredCode === 'SAHAYAK100') {
      setDiscount(100);
      setAppliedCoupon(enteredCode);
      setMessage('Coupon applied successfully!');
    } else if (enteredCode === 'HOME50') {
      setDiscount(50);
      setAppliedCoupon(enteredCode);
      setMessage('Coupon applied successfully!');
    } else {
      setDiscount(0);
      setAppliedCoupon('');
      setMessage('Invalid or expired coupon');
    }
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue({
        coupon: appliedCoupon,
        discount: discount,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ================= HEADER ================= */}
      <View style={styles.header}>

        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
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
          Apply Coupon
        </Text>

        <View style={styles.headerSpace} />

      </View>

      {/* ================= CONTENT ================= */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* COUPON BANNER */}
        <View style={styles.banner}>

          <View style={styles.bannerIcon}>
            <Ionicons
              name="pricetag"
              size={30}
              color="#49769F"
            />
          </View>

          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>
              Have a coupon?
            </Text>

            <Text style={styles.bannerSubtitle}>
              Save more on your booking
            </Text>
          </View>

        </View>

        {/* ENTER COUPON */}
        <Text style={styles.sectionTitle}>
          Enter coupon code
        </Text>

        <View style={styles.inputRow}>

          <Ionicons
            name="ticket-outline"
            size={22}
            color="#49769F"
          />

          <TextInput
            style={styles.input}
            placeholder="Enter coupon code"
            placeholderTextColor="#9CA3AF"
            value={coupon}
            onChangeText={(text) => {
              setCoupon(text.toUpperCase());
              setMessage('');
            }}
            autoCapitalize="characters"
          />

          <Pressable
            style={({ pressed }) => [
              styles.applyButton,
              pressed && styles.pressedButton,
            ]}
            onPress={() => applyCoupon()}
          >
            <Text style={styles.applyText}>
              Apply
            </Text>
          </Pressable>

        </View>

        {/* MESSAGE */}
        {message !== '' && (
          <View
            style={[
              styles.messageBox,
              appliedCoupon
                ? styles.successBox
                : styles.errorBox,
            ]}
          >

            <Ionicons
              name={
                appliedCoupon
                  ? 'checkmark-circle'
                  : 'alert-circle'
              }
              size={20}
              color={
                appliedCoupon
                  ? '#49769F'
                  : '#DC2626'
              }
            />

            <Text
              style={[
                styles.messageText,
                {
                  color: appliedCoupon
                    ? '#49769F'
                    : '#DC2626',
                },
              ]}
            >
              {message}
            </Text>

          </View>
        )}

        {/* AVAILABLE COUPONS */}
        <Text style={styles.sectionTitle}>
          Available coupons
        </Text>

        {coupons.map((item) => (

          <View
            key={item.code}
            style={[
              styles.couponCard,
              appliedCoupon === item.code &&
                styles.selectedCard,
            ]}
          >

            {/* COUPON INFO */}
            <View style={styles.couponLeft}>

              <View style={styles.couponIcon}>
                <Ionicons
                  name="pricetag-outline"
                  size={22}
                  color="#49769F"
                />
              </View>

              <View style={styles.couponInfo}>

                <Text style={styles.couponTitle}>
                  {item.title}
                </Text>

                <Text style={styles.couponDescription}>
                  {item.description}
                </Text>

                <View style={styles.codeBox}>
                  <Text style={styles.codeText}>
                    {item.code}
                  </Text>
                </View>

              </View>

            </View>

            {/* APPLY */}
            <Pressable
              style={({ pressed }) => [
                styles.smallApply,
                pressed && styles.smallApplyPressed,
              ]}
              onPress={() => {
                setCoupon(item.code);
                applyCoupon(item.code);
              }}
            >
              <Text style={styles.smallApplyText}>
                {appliedCoupon === item.code
                  ? 'Applied'
                  : 'Apply'}
              </Text>
            </Pressable>

          </View>
        ))}

        {/* APPLIED COUPON */}
        {appliedCoupon !== '' && (

          <View style={styles.discountCard}>

            <View style={styles.discountIcon}>
              <Ionicons
                name="gift-outline"
                size={25}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.discountInfo}>

              <Text style={styles.discountTitle}>
                Coupon applied
              </Text>

              <Text style={styles.discountCode}>
                {appliedCoupon}
              </Text>

            </View>

            <Text style={styles.discountAmount}>
              {discount === 20
                ? '20% OFF'
                : `Rs. ${discount} OFF`}
            </Text>

          </View>
        )}

      </ScrollView>

      {/* ================= BOTTOM ================= */}
      <View style={styles.bottomContainer}>

        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            pressed && styles.pressedButton,
          ]}
          onPress={handleContinue}
        >

          <Text style={styles.continueText}>
            Continue
          </Text>

          <Ionicons
            name="arrow-forward"
            size={22}
            color="#FFFFFF"
          />

        </Pressable>

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  /* ================= CONTAINER ================= */

  container: {
    flex: 1,
    backgroundColor: '#F4F9FC',
  },

  /* ================= HEADER ================= */

  header: {
    height: 102,
    paddingTop:30,
    backgroundColor: '#49769F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
  },

  headerSpace: {
    width: 44,
  },

  /* ================= CONTENT ================= */

  content: {
    padding: 20,
    paddingBottom: 120,
  },

  /* ================= BANNER ================= */

  banner: {
    backgroundColor: '#E5F0F7',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#D7E6F0',
  },

  bannerIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bannerText: {
    marginLeft: 15,
  },

  bannerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#111827',
  },

  bannerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748B',
  },

  /* ================= SECTION ================= */

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },

  /* ================= INPUT ================= */

  inputRow: {
    height: 58,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E2EA',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 6,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#111827',
  },

  applyButton: {
    backgroundColor: '#49769F',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 11,
  },

  applyText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* ================= MESSAGE ================= */

  messageBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  successBox: {
    backgroundColor: '#E7F3EA',
  },

  errorBox: {
    backgroundColor: '#FEECEC',
  },

  messageText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },

  /* ================= COUPON CARD ================= */

  couponCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  selectedCard: {
    borderColor: '#49769F',
    borderWidth: 1.5,
    backgroundColor: '#F8FCFE',
  },

  couponLeft: {
    flex: 1,
    flexDirection: 'row',
  },

  couponIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EAF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  couponInfo: {
    marginLeft: 12,
    flex: 1,
  },

  couponTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },

  couponDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },

  codeBox: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  codeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#49769F',
  },

  smallApply: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
  },

  smallApplyPressed: {
    backgroundColor: '#EAF2F7',
  },

  smallApplyText: {
    color: '#49769F',
    fontWeight: '700',
    fontSize: 14,
  },

  /* ================= DISCOUNT ================= */

  discountCard: {
    backgroundColor: '#49769F',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  discountIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  discountInfo: {
    flex: 1,
  },

  discountTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  discountCode: {
    color: '#DCEAF3',
    fontSize: 12,
    marginTop: 3,
  },

  discountAmount: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  /* ================= BOTTOM ================= */

  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  continueButton: {
    height: 55,
    backgroundColor: '#49769F',
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  continueText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginRight: 10,
  },

  /* ================= PRESS EFFECT ================= */

  pressed: {
    opacity: 0.75,
  },

  pressedButton: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

});