import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Animated,
  Easing,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

export default function Refferearnscreen({ onBack }) {
  const [copied, setCopied] = useState(false);

  const referralCode = 'SAHAYAK200';

  /* =====================================================
     ANIMATIONS
  ===================================================== */

  const headerAnim = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const giftAnim = useRef(new Animated.Value(0.8)).current;

  const step1Anim = useRef(new Animated.Value(0)).current;
  const step2Anim = useRef(new Animated.Value(0)).current;
  const step3Anim = useRef(new Animated.Value(0)).current;

  const codeAnim = useRef(new Animated.Value(0)).current;
  const shareAnim = useRef(new Animated.Value(0)).current;
  const infoAnim = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;

  const shareScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.timing(heroAnim, {
        toValue: 1,
        duration: 600,
        delay: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.spring(giftAnim, {
        toValue: 1,
        delay: 350,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),

      Animated.timing(step1Anim, {
        toValue: 1,
        duration: 450,
        delay: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.timing(step2Anim, {
        toValue: 1,
        duration: 450,
        delay: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.timing(step3Anim, {
        toValue: 1,
        duration: 450,
        delay: 650,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.timing(codeAnim, {
        toValue: 1,
        duration: 500,
        delay: 750,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.timing(shareAnim, {
        toValue: 1,
        duration: 500,
        delay: 850,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.timing(infoAnim, {
        toValue: 1,
        duration: 500,
        delay: 950,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.timing(footerAnim, {
        toValue: 1,
        duration: 500,
        delay: 1050,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /* =====================================================
     COPY REFERRAL CODE
  ===================================================== */

  const handleCopy = () => {
    setCopied(true);

    Alert.alert(
      'Referral Code',
      `${referralCode} copied successfully!`
    );

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  /* =====================================================
     SHARE
  ===================================================== */

  const handleShare = () => {
    Alert.alert(
      'Share Sahayak',
      'Share your referral code with your friends and earn rewards when they complete their first booking.'
    );
  };

  /* =====================================================
     SHARE BUTTON PRESS ANIMATION
  ===================================================== */

  const handleSharePressIn = () => {
    Animated.spring(shareScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handleSharePressOut = () => {
    Animated.spring(shareScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >

        <Pressable
          style={styles.backButton}
          onPress={onBack}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#2A2A2A"
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Refer & Earn
        </Text>

        <View style={styles.headerSpace} />

      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* =====================================================
            HERO
        ===================================================== */}

        <Animated.View
          style={[
            styles.heroCard,
            {
              opacity: heroAnim,
              transform: [
                {
                  translateY: heroAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [35, 0],
                  }),
                },
                {
                  scale: heroAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.96, 1],
                  }),
                },
              ],
            },
          ]}
        >

          <Animated.View
            style={[
              styles.giftCircle,
              {
                transform: [
                  {
                    scale: giftAnim,
                  },
                ],
              },
            ]}
          >
            <Ionicons
              name="gift"
              size={40}
              color="#FFFFFF"
            />
          </Animated.View>

          <Text style={styles.heroTitle}>
            Refer Friends. Earn Rewards.
          </Text>

          <Text style={styles.heroSubtitle}>
            Invite your friends to Sahayak and earn
            rewards when they complete their first booking.
          </Text>

          <View style={styles.rewardBadge}>
            <Text style={styles.rewardText}>
              Rs. 200 REWARD
            </Text>
          </View>

        </Animated.View>

        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <Text style={styles.sectionTitle}>
          How it works
        </Text>

        <View style={styles.stepsContainer}>

          {/* STEP 1 */}

          <Animated.View
            style={[
              styles.step,
              {
                opacity: step1Anim,
                transform: [
                  {
                    translateX: step1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-30, 0],
                    }),
                  },
                ],
              },
            ]}
          >

            <View style={styles.stepIcon}>
              <Ionicons
                name="share-social-outline"
                size={23}
                color="#49769F"
              />
            </View>

            <View style={styles.stepContent}>

              <Text style={styles.stepTitle}>
                1. Share your code
              </Text>

              <Text style={styles.stepText}>
                Share your unique referral code with your friends.
              </Text>

            </View>

          </Animated.View>

          <View style={styles.connector} />

          {/* STEP 2 */}

          <Animated.View
            style={[
              styles.step,
              {
                opacity: step2Anim,
                transform: [
                  {
                    translateX: step2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-30, 0],
                    }),
                  },
                ],
              },
            ]}
          >

            <View style={styles.stepIcon}>
              <Ionicons
                name="person-add-outline"
                size={23}
                color="#49769F"
              />
            </View>

            <View style={styles.stepContent}>

              <Text style={styles.stepTitle}>
                2. Friend joins Sahayak
              </Text>

              <Text style={styles.stepText}>
                Your friend creates an account using your code.
              </Text>

            </View>

          </Animated.View>

          <View style={styles.connector} />

          {/* STEP 3 */}

          <Animated.View
            style={[
              styles.step,
              {
                opacity: step3Anim,
                transform: [
                  {
                    translateX: step3Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-30, 0],
                    }),
                  },
                ],
              },
            ]}
          >

            <View style={styles.stepIcon}>
              <Ionicons
                name="checkmark-circle-outline"
                size={23}
                color="#49769F"
              />
            </View>

            <View style={styles.stepContent}>

              <Text style={styles.stepTitle}>
                3. Earn Rs. 200
              </Text>

              <Text style={styles.stepText}>
                You receive your reward after their first successful booking.
              </Text>

            </View>

          </Animated.View>

        </View>

        {/* =====================================================
            REFERRAL CODE
        ===================================================== */}

        <Text style={styles.sectionTitle}>
          Your referral code
        </Text>

        <Animated.View
          style={[
            styles.codeCard,
            {
              opacity: codeAnim,
              transform: [
                {
                  translateY: codeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [25, 0],
                  }),
                },
              ],
            },
          ]}
        >

          <View>

            <Text style={styles.codeLabel}>
              SHARE THIS CODE
            </Text>

            <Text style={styles.code}>
              {referralCode}
            </Text>

          </View>

          <Pressable
            style={styles.copyButton}
            onPress={handleCopy}
          >

            <Ionicons
              name={copied ? 'checkmark' : 'copy-outline'}
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.copyText}>
              {copied ? 'Copied' : 'Copy'}
            </Text>

          </Pressable>

        </Animated.View>

        {/* =====================================================
            SHARE BUTTON
        ===================================================== */}

        <Animated.View
          style={{
            opacity: shareAnim,
            transform: [
              {
                translateY: shareAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [25, 0],
                }),
              },
              {
                scale: shareScale,
              },
            ],
          }}
        >

          <Pressable
            style={styles.shareButton}
            onPress={handleShare}
            onPressIn={handleSharePressIn}
            onPressOut={handleSharePressOut}
          >

            <Ionicons
              name="share-social-outline"
              size={21}
              color="#FFFFFF"
            />

            <Text style={styles.shareText}>
              Share with Friends
            </Text>

          </Pressable>

        </Animated.View>

        {/* =====================================================
            REWARD INFO
        ===================================================== */}

        <Animated.View
          style={[
            styles.infoCard,
            {
              opacity: infoAnim,
              transform: [
                {
                  translateY: infoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [25, 0],
                  }),
                },
              ],
            },
          ]}
        >

          <Ionicons
            name="information-circle-outline"
            size={23}
            color="#49769F"
          />

          <View style={styles.infoContent}>

            <Text style={styles.infoTitle}>
              Referral Reward
            </Text>

            <Text style={styles.infoText}>
              You can earn Rs. 200 for every eligible friend
              who joins Sahayak and completes their first booking.
            </Text>

          </View>

        </Animated.View>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <Animated.View
          style={[
            styles.footer,
            {
              opacity: footerAnim,
              transform: [
                {
                  translateY: footerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >

          <Ionicons
            name="people-outline"
            size={22}
            color="#49769F"
          />

          <Text style={styles.footerText}>
            Invite your friends and grow the Sahayak community!
          </Text>

        </Animated.View>

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
    borderBottomColor: '#D6E4EE',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF3F8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#2A2A2A',
  },

  headerSpace: {
    width: 42,
  },

  /* CONTENT */

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  /* HERO */

  heroCard: {
    backgroundColor: '#49769F',
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
    marginTop: 15,
  },

  giftCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },

  heroSubtitle: {
    color: '#EAF3F8',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 9,
  },

  rewardBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 18,
  },

  rewardText: {
    color: '#49769F',
    fontSize: 14,
    fontWeight: '800',
  },

  /* SECTION */

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2A2A2A',
    marginTop: 28,
    marginBottom: 14,
  },

  /* STEPS */

  stepsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: '#D6E4EE',
  },

  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#EAF3F8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepContent: {
    flex: 1,
    marginLeft: 13,
  },

  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2A2A2A',
  },

  stepText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 3,
  },

  connector: {
    width: 1,
    height: 22,
    backgroundColor: '#B8CBD9',
    marginLeft: 24,
    marginVertical: 5,
  },

  /* REFERRAL CODE */

  codeCard: {
    backgroundColor: '#EAF3F8',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#D6E4EE',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  codeLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 0.7,
  },

  code: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2A2A2A',
    marginTop: 5,
    letterSpacing: 1,
  },

  copyButton: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  copyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },

  /* SHARE BUTTON */

  shareButton: {
    height: 54,
    backgroundColor: '#49769F',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },

  shareText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 9,
  },

  /* INFO */

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E4EE',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    marginTop: 22,
  },

  infoContent: {
    flex: 1,
    marginLeft: 11,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2A2A2A',
  },

  infoText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 4,
  },

  /* FOOTER */

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    paddingHorizontal: 15,
  },

  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 8,
    textAlign: 'center',
  },

});