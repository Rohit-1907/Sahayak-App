
import React, { useEffect, useRef } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale, wp } from '../utils/responsive';


export default function Welcomescreen({
  onNext,
  onBack,
}) {

  const fadeAnim =
    useRef(new Animated.Value(0)).current;

  const slideAnim =
    useRef(new Animated.Value(25)).current;

  const floatAnim =
    useRef(new Animated.Value(0)).current;

  const buttonAnim =
    useRef(new Animated.Value(0.95)).current;


  useEffect(() => {

    // Main entrance animation
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


    // Floating illustration animation
    const floatingAnimation =
      Animated.loop(

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


  /* =====================================================
     NEXT
  ===================================================== */

  const handleNextPress = () => {

    onNext?.();

  };


  /* =====================================================
     BACK
  ===================================================== */

  const handleBackPress = () => {

    onBack?.();

  };


  return (

    <SafeAreaView style={styles.container}>

      {/* =================================================
          BACK BUTTON
      ================================================= */}

      <View style={styles.topBar}>

        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          onPress={handleBackPress}
        >

          <Ionicons
            name="arrow-back"
            size={23}
            color="#49769F"
          />

        </Pressable>

      </View>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

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

        {/* =================================================
            ILLUSTRATION
        ================================================= */}

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

          <View style={styles.innerCircle}>

            <Ionicons
              name="construct-outline"
              size={78}
              color="#49769F"
            />

          </View>

        </Animated.View>


        {/* =================================================
            TITLE
        ================================================= */}

        <Text style={styles.title}>
          Welcome to Sahayak
        </Text>


        {/* =================================================
            SUBTITLE
        ================================================= */}

        <Text style={styles.subtitle}>
          Find trusted workers, book services instantly,
          and experience the power of voice-based booking
          — all in one app.
        </Text>

      </Animated.View>


      {/* =================================================
          NEXT BUTTON
      ================================================= */}

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

        <Pressable
          style={({ pressed }) => [
            styles.nextButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleNextPress}
        >

          <Text style={styles.nextText}>
            Next
          </Text>

          <Ionicons
            name="arrow-forward"
            size={20}
            color="#FFFFFF"
          />

        </Pressable>


        {/* =================================================
            FOOTER
        ================================================= */}

        <Text style={styles.footerText}>
          Trusted home services at your doorstep
        </Text>

      </Animated.View>

    </SafeAreaView>

  );

}


const styles = StyleSheet.create({

  /* =====================================================
     CONTAINER
  ===================================================== */

  container: {

    flex: 1,

    backgroundColor: '#FFFFFF',

    justifyContent: 'space-between',

    paddingHorizontal: 25,

    paddingTop: 20,

    paddingBottom: 28,

  },


  /* =====================================================
     TOP BAR
  ===================================================== */

  topBar: {

    width: '100%',

    height: verticalScale(50),

    justifyContent: 'center',

  },


  /* =====================================================
     BACK BUTTON
  ===================================================== */

  backButton: {

    width: scale(43),

    height: scale(43),

    borderRadius: scale(22),

    backgroundColor: '#F1F5F9',

    justifyContent: 'center',

    alignItems: 'center',

  },


  backButtonPressed: {

    opacity: 0.55,

  },


  /* =====================================================
     CONTENT
  ===================================================== */

  content: {

    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

  },


  /* =====================================================
     ILLUSTRATION
  ===================================================== */

  imageCircle: {

    width: scale(225),

    height: scale(225),

    borderRadius: scale(113),

    backgroundColor: '#EAF1F6',

    justifyContent: 'center',

    alignItems: 'center',

    marginBottom: verticalScale(38),

  },


  innerCircle: {

    width: scale(145),

    height: scale(145),

    borderRadius: scale(73),

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


  /* =====================================================
     TITLE
  ===================================================== */

  title: {

    fontSize: moderateScale(32),

    fontWeight: '700',

    color: '#111827',

    textAlign: 'center',

    letterSpacing: 0.2,

  },


  /* =====================================================
     SUBTITLE
  ===================================================== */

  subtitle: {

    marginTop: verticalScale(15),

    fontSize: moderateScale(15),

    color: '#6B7280',

    textAlign: 'center',

    lineHeight: moderateScale(23),

    paddingHorizontal: moderateScale(10),

    maxWidth: wp(90),

  },


  /* =====================================================
     BUTTON CONTAINER
  ===================================================== */

  bottomContainer: {

    width: '100%',
    marginBotton: verticalScale(40),

  },


  /* =====================================================
     NEXT BUTTON
  ===================================================== */

  nextButton: {

    minHeight: verticalScale(56),

    borderRadius: moderateScale(16),

    backgroundColor: '#49769F',

    flexDirection: 'row',

    justifyContent: 'center',

    alignItems: 'center',

    paddingVertical: verticalScale(16),

    elevation: 3,

    shadowColor: '#49769F',

    shadowOffset: {

      width: 0,

      height: 4,

    },

    shadowOpacity: 0.18,

    shadowRadius: 6,

  },


  nextText: {

    color: '#FFFFFF',

    fontSize: moderateScale(17),

    fontWeight: '700',

    marginRight: moderateScale(9),

  },


  /* =====================================================
     PRESSED STATE
  ===================================================== */

  buttonPressed: {

    opacity: 0.78,

    transform: [

      {

        scale: 0.98,

      },

    ],

  },


  /* =====================================================
     FOOTER
  ===================================================== */

  footerText: {

    textAlign: 'center',

    fontSize: moderateScale(11),

    color: '#9CA3AF',

    marginTop: verticalScale(17),

  },

});
