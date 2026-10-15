import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
  Animated,
} from 'react-native';

import { translate } from '../utils/translations';

const { width } = Dimensions.get('window');

const getSlides = (language) => [
  {
    id: '1',
    emoji: '',
    title: translate(language, 'slide1Title'),
    subtitle: translate(language, 'slide1Subtitle'),
  },
  {
    id: '2',
    emoji: '🎤',
    title: translate(language, 'slide2Title'),
    subtitle: translate(language, 'slide2Subtitle'),
  },
];

/* =====================================================
   ANIMATED SLIDE
===================================================== */

function AnimatedSlide({ item, isActive }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(35)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (isActive) {
      opacity.setValue(0);
      translateY.setValue(35);
      scale.setValue(0.92);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),

        Animated.spring(translateY, {
          toValue: 0,
          speed: 12,
          bounciness: 5,
          useNativeDriver: true,
        }),

        Animated.spring(scale, {
          toValue: 1,
          speed: 12,
          bounciness: 5,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isActive]);

  return (
    <View style={styles.slide}>
      <Animated.View
        style={[
          styles.slideContent,
          {
            opacity,
            transform: [
              { translateY },
              { scale },
            ],
          },
        ]}
      >
        {/* IMAGE / ICON CIRCLE */}
        <View style={styles.imageCircle}>
          <View style={styles.innerCircle}>
            <Text style={styles.emoji}>
              {item.emoji}
            </Text>
          </View>
        </View>

        {/* TITLE */}
        <Text style={styles.title}>
          {item.title}
        </Text>

        {/* DESCRIPTION */}
        <Text style={styles.subtitle}>
          {item.subtitle}
        </Text>
      </Animated.View>
    </View>
  );
}

/* =====================================================
   MAIN SCREEN
===================================================== */

export default function Onboardingscreen({
  onFinish,
  language = 'english',
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const flatListRef = useRef(null);

  const slides = getSlides(language);

  const buttonScale = useRef(
    new Animated.Value(1)
  ).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      setCurrentIndex(nextIndex);
    } else {
      if (onFinish) {
        onFinish();
      }
    }
  };

  /* =====================================================
     BUTTON PRESS ANIMATION
  ===================================================== */

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      speed: 20,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      speed: 20,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  };

  /* =====================================================
     SWIPE
  ===================================================== */

  const handleScrollEnd = (event) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / width
    );

    setCurrentIndex(index);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* =====================================================
          SLIDES
      ===================================================== */}

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AnimatedSlide
            item={item}
            isActive={currentIndex === index}
          />
        )}
        onMomentumScrollEnd={handleScrollEnd}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* =====================================================
          BOTTOM SECTION
      ===================================================== */}

      <View style={styles.bottomContainer}>

        {/* PAGE DOTS */}

        <View style={styles.dotsContainer}>
          {slides.map((_, index) => {
            const isActive = currentIndex === index;

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  isActive && styles.activeDot,
                ]}
              />
            );
          })}
        </View>

        {/* BUTTON */}

        <Animated.View
          style={{
            transform: [
              {
                scale: buttonScale,
              },
            ],
          }}
        >
          <Pressable
            style={styles.button}
            onPress={handleNext}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Text style={styles.buttonText}>
              {currentIndex === slides.length - 1
                ? translate(language, 'getStarted')
                : translate(language, 'next')}
            </Text>

            <View style={styles.buttonIcon}>
              <Text style={styles.arrow}>
                →
              </Text>
            </View>
          </Pressable>
        </Animated.View>

        {/* SKIP */}

        {currentIndex === 0 && (
          <Pressable
            style={({ pressed }) => [
              styles.skipButton,
              pressed && styles.skipPressed,
            ]}
            onPress={onFinish}
          >
            <Text style={styles.skipText}>
              {translate(language, 'skip')}
            </Text>
          </Pressable>
        )}

      </View>
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
    paddingTop:30,
  },

  /* =====================================================
     SLIDE
  ===================================================== */

  slide: {
    width: width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },

  slideContent: {
    width: '100%',
    alignItems: 'center',
    marginTop: -25,
  },

  /* =====================================================
     IMAGE CIRCLE
  ===================================================== */

  imageCircle: {
    width: Math.min(width * 0.62, 235),
    height: Math.min(width * 0.62, 235),
    borderRadius: 150,

    backgroundColor: '#EAF1F6',

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 42,

    shadowColor: '#49769F',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 5,
  },

  innerCircle: {
    width: '78%',
    height: '78%',
    borderRadius: 100,

    backgroundColor: '#DCE8F0',

    justifyContent: 'center',
    alignItems: 'center',
  },

  emoji: {
    fontSize: 78,
  },

  /* =====================================================
     TITLE
  ===================================================== */

  title: {
    fontSize: 28,
    fontWeight: '700',

    color: '#111827',

    textAlign: 'center',

    lineHeight: 36,

    paddingHorizontal: 10,

    marginBottom: 17,
  },

  /* =====================================================
     SUBTITLE
  ===================================================== */

  subtitle: {
    fontSize: 15,

    color: '#6B7280',

    textAlign: 'center',

    lineHeight: 23,

    paddingHorizontal: 12,
  },

  /* =====================================================
     BOTTOM
  ===================================================== */

  bottomContainer: {
    paddingHorizontal: 28,
    paddingBottom: 25,
  },

  /* =====================================================
     DOTS
  ===================================================== */

  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 23,
  },

  dot: {
    width: 9,
    height: 9,

    borderRadius: 5,

    backgroundColor: '#D1D5DB',

    marginHorizontal: 4,
  },

  activeDot: {
    width: 27,

    backgroundColor: '#49769F',
  },

  /* =====================================================
     BUTTON
  ===================================================== */

  button: {
    height: 56,

    borderRadius: 16,

    backgroundColor: '#49769F',

    flexDirection: 'row',

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#49769F',

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.22,

    shadowRadius: 10,

    elevation: 6,
  },

  buttonText: {
    color: '#FFFFFF',

    fontSize: 17,

    fontWeight: '700',

    marginRight: 9,
  },

  buttonIcon: {
    width: 27,
    height: 27,

    borderRadius: 14,

    backgroundColor: 'rgba(255,255,255,0.18)',

    justifyContent: 'center',
    alignItems: 'center',
  },

  arrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',

    marginTop: -2,
  },

  /* =====================================================
     SKIP
  ===================================================== */

  skipButton: {
    alignSelf: 'center',

    marginTop: 15,

    paddingHorizontal: 20,
    paddingVertical: 6,
  },

  skipText: {
    fontSize: 14,

    fontWeight: '600',

    color: '#6B7280',
  },

  skipPressed: {
    opacity: 0.5,
  },

});