import React, { useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale, wp } from '../utils/responsive';

export default function WelcomeScreen({
  onSignIn,
  onOrganizationLogin,
  onRegisterOrganization,
  onBack,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.spring(buttonAnim, {
        toValue: 1,
        friction: 6,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();

    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    floatingAnimation.start();

    return () => {
      floatingAnimation.stop();
    };
  }, []);

  // SIGN IN
  const handleSignInPress = () => {
    if (onSignIn) {
      onSignIn();
    }
  };

  // ORGANIZATION LOGIN
  const handleOrganizationLoginPress = () => {
    if (onOrganizationLogin) {
      onOrganizationLogin();
    }
  };

  // ORGANIZATION REGISTRATION
  const handleRegisterOrganizationPress = () => {
    if (onRegisterOrganization) {
      onRegisterOrganization();
    }
  };

  // BACK TO LANGUAGE
  const handleBackPress = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* BACK BUTTON */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackPress}
        activeOpacity={0.7}
      >
        <Ionicons
          name="arrow-back"
          size={moderateScale(27)}
          color="#111827"
        />
      </TouchableOpacity>

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

        {/* ILLUSTRATION */}
        <Animated.View
          style={[
            styles.imageCircle,
            {
              transform: [
                {
                  translateY: floatAnim,
                },
              ],
            },
          ]}
        >
          <View style={[styles.innerCircle, { overflow: 'hidden' }]}>
            <Image
              source={require('../assets/logo.png')}
              style={{ width: '100%', height: '100%', borderRadius: scale(63) }}
              resizeMode="cover"
            />
          </View>
        </Animated.View>

        {/* TITLE */}
        <Text style={styles.title}>
          Welcome to Sahayak
        </Text>

        {/* SUBTITLE */}
        <Text style={styles.subtitle}>
          Find trusted workers, book services instantly,
          and experience the power of voice-based booking
          — all in one app.
        </Text>

      </Animated.View>

      {/* BUTTONS */}
      <Animated.View
        style={[
          styles.bottomContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                scale: buttonAnim,
              },
            ],
          },
        ]}
      >

        {/* INDIVIDUAL WORKER SECTION */}
        <Text style={styles.sectionLabel}>
          Individual Worker
        </Text>

        {/* SIGN IN */}
        <Pressable
          style={({ pressed }) => [
            styles.signInButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleSignInPress}
        >
          <Text style={styles.signInText}>
            Sign In as Worker
          </Text>

          <Ionicons
            name="arrow-forward"
            size={moderateScale(19)}
            color="#FFFFFF"
          />
        </Pressable>

        {/* ORGANIZATION SECTION */}
        <Text style={styles.sectionLabel}>
          Organization
        </Text>

        {/* ORGANIZATION LOGIN (Both Admin & Workers) */}
        <Pressable
          style={({ pressed }) => [
            styles.organizationLoginButton,
            pressed && styles.organizationLoginButtonPressed,
          ]}
          onPress={handleOrganizationLoginPress}
        >
          <Text style={styles.organizationLoginText}>
            Organization Login
          </Text>
        </Pressable>

        {/* FOOTER */}
        <Text style={styles.footerText}>
          Trusted home services at your doorstep
        </Text>

      </Animated.View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: moderateScale(22),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(24),
  },

  /* BACK BUTTON */

  backButton: {
    width: scale(46),
    height: scale(46),
    borderRadius: scale(23),
    backgroundColor: '#F1F5F8',

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: verticalScale(5),

    elevation: 2,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  /* CONTENT */

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: verticalScale(10),
  },

  /* ILLUSTRATION */

  imageCircle: {
    width: scale(190),
    height: scale(190),
    borderRadius: scale(95),

    backgroundColor: '#EAF1F6',

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: verticalScale(30),
  },

  innerCircle: {
    width: scale(125),
    height: scale(125),
    borderRadius: scale(63),

    backgroundColor: '#FFFFFF',

    justifyContent: 'center',
    alignItems: 'center',

    elevation: 4,

    shadowColor: '#49769F',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },

  /* TITLE */

  title: {
    fontSize: moderateScale(28),
    fontWeight: '700',
    color: '#111827',

    textAlign: 'center',
    letterSpacing: 0.2,
  },

  /* SUBTITLE */

  subtitle: {
    marginTop: verticalScale(12),

    fontSize: moderateScale(14),
    color: '#6B7280',

    textAlign: 'center',
    lineHeight: moderateScale(21),

    paddingHorizontal: moderateScale(8),
    maxWidth: wp(90),
  },

  /* BUTTON CONTAINER */

  bottomContainer: {
    width: '100%',
  },

  /* SECTION LABEL */

  sectionLabel: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: verticalScale(18),
    marginBottom: verticalScale(8),
    marginLeft: moderateScale(4),
  },

  /* SIGN IN */

  signInButton: {
    minHeight: verticalScale(54),
    borderRadius: moderateScale(14),

    backgroundColor: '#49769F',

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(14),

    elevation: 3,

    shadowColor: '#49769F',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,

    marginBottom: verticalScale(12),
  },

  signInText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '700',

    marginRight: moderateScale(8),
  },

  /* ORGANIZATION REGISTER */

  organizationButton: {
    minHeight: verticalScale(54),
    borderRadius: moderateScale(14),

    backgroundColor: '#49769F',

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(14),

    elevation: 3,

    shadowColor: '#49769F',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,

    marginBottom: 0,
  },

  organizationText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '700',
  },

  /* ORGANIZATION LOGIN */

  organizationLoginButton: {
    minHeight: verticalScale(54),
    borderRadius: moderateScale(14),

    borderWidth: 1.5,
    borderColor: '#49769F',

    backgroundColor: '#FFFFFF',

    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(14),

    marginTop: verticalScale(10),
  },

  organizationLoginText: {
    color: '#49769F',
    fontSize: moderateScale(16),
    fontWeight: '700',
  },

  organizationLoginButtonPressed: {
    backgroundColor: '#F1F5F8',
  },

  /* PRESSED */

  buttonPressed: {
    opacity: 0.78,
  },

  organizationButtonPressed: {
    backgroundColor: '#F1F5F8',
  },

  /* FOOTER */

  footerText: {
    textAlign: 'center',

    fontSize: moderateScale(11),
    color: '#9CA3AF',

    marginTop: verticalScale(14),
  },

});
