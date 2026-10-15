import React, { useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Linking,
  Animated,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

export default function CallSupportScreen({ onBack }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const iconScale = useRef(new Animated.Value(0.7)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),

      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }),

      Animated.spring(iconScale, {
        toValue: 1,
        friction: 6,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCall = () => {
    const phoneNumber = 'tel:+918446597587';

    Linking.openURL(phoneNumber).catch(() => {
      Alert.alert(
        'Unable to make call',
        'Please try calling the support number manually: +91 84465 97587'
      );
    });
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>

        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressedButton,
          ]}
          onPress={onBack}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#111827"
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Call Support
        </Text>

        <View style={styles.headerSpace} />

      </View>

      {/* MAIN CONTENT */}
      <Animated.View
        style={[
          styles.content,
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

        {/* SUPPORT ICON */}
        <Animated.View
          style={[
            styles.iconCircle,
            {
              transform: [
                {
                  scale: iconScale,
                },
              ],
            },
          ]}
        >
          <Ionicons
            name="call"
            size={42}
            color="#FFFFFF"
          />
        </Animated.View>

        <Text style={styles.title}>
          Need Help?
        </Text>

        <Text style={styles.description}>
          Our support team is here to help you with
          bookings, payments, workers and other issues.
        </Text>

        {/* SUPPORT CARD */}
        <View style={styles.supportCard}>

          <View style={styles.smallIcon}>
            <Ionicons
              name="headset-outline"
              size={25}
              color="#4E8EA2"
            />
          </View>

          <View style={styles.supportInfo}>

            <Text style={styles.supportLabel}>
              Sahayak Support
            </Text>

            <Text style={styles.phoneNumber}>
              +91 84465 97587
            </Text>

          </View>

        </View>

        {/* AVAILABILITY */}
        <View style={styles.infoCard}>

          {/* SUPPORT HOURS */}
          <View style={styles.infoRow}>

            <View style={styles.infoIconCircle}>
              <Ionicons
                name="time-outline"
                size={21}
                color="#4E8EA2"
              />
            </View>

            <View style={styles.infoText}>

              <Text style={styles.infoTitle}>
                Support Hours
              </Text>

              <Text style={styles.infoSubtitle}>
                Monday – Sunday
              </Text>

              <Text style={styles.infoSubtitle}>
                24 Hours
              </Text>

            </View>

          </View>

          <View style={styles.divider} />

          {/* LANGUAGES */}
          <View style={styles.infoRow}>

            <View style={styles.infoIconCircle}>
              <Ionicons
                name="language-outline"
                size={21}
                color="#4E8EA2"
              />
            </View>

            <View style={styles.infoText}>

              <Text style={styles.infoTitle}>
                Languages
              </Text>

              <Text style={styles.infoSubtitle}>
                English • Hindi • Marathi
              </Text>

            </View>

          </View>

        </View>

        {/* CALL BUTTON */}
        <Animated.View
          style={[
            styles.callButtonWrapper,
            {
              transform: [
                {
                  scale: buttonScale,
                },
              ],
            },
          ]}
        >

          <Pressable
            style={({ pressed }) => [
              styles.callButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleCall}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >

            <Ionicons
              name="call"
              size={22}
              color="#111827"
            />

            <Text style={styles.callButtonText}>
              Call Support
            </Text>

          </Pressable>

        </Animated.View>

        <Text style={styles.note}>
          Standard call charges may apply.
        </Text>

      </Animated.View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  pressedButton: {
    opacity: 0.65,
    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#111827',
  },

  headerSpace: {
    width: 42,
  },

  /* CONTENT */
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 35,
  },

  /* MAIN ICON */
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#4E8EA2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },

  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
    paddingHorizontal: 15,
  },

  /* SUPPORT CARD */
  supportCard: {
    width: '100%',
    marginTop: 30,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  smallIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  supportInfo: {
    marginLeft: 14,
  },

  supportLabel: {
    fontSize: 13,
    color: '#6B7280',
  },

  phoneNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 3,
  },

  /* INFORMATION CARD */
  infoCard: {
    width: '100%',
    marginTop: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 18,
    padding: 18,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F7F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoText: {
    marginLeft: 13,
    flex: 1,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  infoSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 15,
  },

  /* CALL BUTTON */
  callButtonWrapper: {
    width: '100%',
    marginTop: 25,
  },

  callButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#111827',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },

  buttonPressed: {
    backgroundColor: '#F3F4F6',
  },

  callButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },

  note: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 10,
  },

});