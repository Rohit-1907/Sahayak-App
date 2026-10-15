import React, { useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Image,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen({ onFinish }) {
  const scaleAnim = useRef(new Animated.Value(0.75)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const iconScaleAnim = useRef(new Animated.Value(0.5)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),

      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),

      Animated.spring(iconScaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(500),

      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),

        Animated.timing(textTranslate, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>

      {/* Background */}
      <View style={styles.backgroundCircleOne} />
      <View style={styles.backgroundCircleTwo} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoBox,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View
          style={{
            transform: [{ scale: iconScaleAnim }],
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image
            source={require('../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </Animated.View>
      </Animated.View>

      {/* App Name */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslate }],
          },
        ]}
      >
        <Text style={styles.appName}>
          Sahayak
        </Text>

        <View style={styles.titleLine} />

        <Text style={styles.tagline}>
          Trusted Home Services at Your Doorstep
        </Text>
      </Animated.View>

      {/* Loading dots */}
      <Animated.View
        style={[
          styles.loadingContainer,
          {
            opacity: textOpacity,
          },
        ]}
      >
        <View style={styles.dot} />
        <View style={styles.dotActive} />
        <View style={styles.dot} />
      </Animated.View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  backgroundCircleOne: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#F1F7F9',
    top: -120,
    right: -100,
  },

  backgroundCircleTwo: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#EEF6F9',
    bottom: -100,
    left: -90,
  },

  logoBox: {
    width: 105,
    height: 105,
    borderRadius: 28,
    backgroundColor: '#49769F',
    overflow: 'hidden',

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#49769F',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 14,

    elevation: 8,

    marginBottom: 25,
  },

  logoImage: {
    width: 105,
    height: 105,
    borderRadius: 28,
  },

  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 25,
  },

  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2A2A2A',
    letterSpacing: 0.5,
  },

  titleLine: {
    width: 42,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#4E8EA2',
    marginTop: 9,
    marginBottom: 10,
  },

  tagline: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 15,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#D5E5EA',
    marginHorizontal: 4,
  },

  dotActive: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#4E8EA2',
    marginHorizontal: 4,
  },

});
