import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { translate } from '../utils/translations';

const PRIMARY = '#49769F';

const languages = [
  {
    id: 'english',
    name: 'English',
    nativeName: 'English',
  },
  {
    id: 'marathi',
    name: 'Marathi',
    nativeName: 'मराठी',
  },
  {
    id: 'hindi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
  },
];

export default function Languageselection({
  onContinue,
  onBack,
}) {
  const [selectedLanguage, setSelectedLanguage] =
    useState('english');

  // =====================================================
  // MAIN SCREEN ANIMATION
  // =====================================================

  const fadeAnim = useRef(
    new Animated.Value(0)
  ).current;

  const slideAnim = useRef(
    new Animated.Value(30)
  ).current;

  // =====================================================
  // BUTTON ANIMATION
  // =====================================================

  const buttonScale = useRef(
    new Animated.Value(1)
  ).current;

  // =====================================================
  // SCREEN ENTRANCE
  // =====================================================

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
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // =====================================================
  // SELECT LANGUAGE
  // =====================================================

  const selectLanguage = (id) => {
    setSelectedLanguage(id);
  };

  // =====================================================
  // CONTINUE BUTTON
  // =====================================================

  const handleContinue = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),

      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onContinue) {
        onContinue(selectedLanguage);
      }
    });
  };

  // =====================================================
  // UI
  // =====================================================

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
          onPress={onBack}
        >

          <Ionicons
            name="arrow-back"
            size={24}
            color="#111827"
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

        {/* LOGO */}

        <View style={[styles.logoCircle, { overflow: 'hidden' }]}>
          <Image
            source={require('../assets/logo.png')}
            style={{ width: '100%', height: '100%', borderRadius: 45 }}
            resizeMode="cover"
          />
        </View>


        {/* HEADING */}

        <Text style={styles.title}>
          Choose Your Language
        </Text>


        <Text style={styles.subtitle}>
          Select your preferred language for a better
          Sahayak experience.
        </Text>


        {/* =================================================
            LANGUAGE CARDS
        ================================================= */}

        <View style={styles.languageContainer}>

          {languages.map((language) => {

            const isSelected =
              selectedLanguage === language.id;

            return (

              <Pressable
                key={language.id}
                onPress={() =>
                  selectLanguage(language.id)
                }
                style={[
                  styles.languageCard,
                  isSelected &&
                    styles.selectedCard,
                ]}
              >

                {/* LANGUAGE ICON */}

                <View
                  style={[
                    styles.languageIcon,
                    isSelected &&
                      styles.selectedIcon,
                  ]}
                >

                  <Ionicons
                    name="language-outline"
                    size={23}
                    color={
                      isSelected
                        ? '#FFFFFF'
                        : PRIMARY
                    }
                  />

                </View>


                {/* LANGUAGE TEXT */}

                <View
                  style={
                    styles.languageTextContainer
                  }
                >

                  <Text
                    style={[
                      styles.languageName,
                      isSelected &&
                        styles.selectedLanguageName,
                    ]}
                  >
                    {language.name}
                  </Text>

                  <Text style={styles.nativeName}>
                    {language.nativeName}
                  </Text>

                </View>


                {/* CHECK CIRCLE */}

                <View
                  style={[
                    styles.checkCircle,
                    isSelected &&
                      styles.selectedCheckCircle,
                  ]}
                >

                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color="#FFFFFF"
                    />
                  )}

                </View>

              </Pressable>

            );

          })}

        </View>


        {/* =================================================
            CONTINUE BUTTON
        ================================================= */}

        <Animated.View
          style={[
            styles.buttonWrapper,
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
            style={styles.continueButton}
            onPress={handleContinue}
          >

            <Text style={styles.continueText}>
              {translate(selectedLanguage, 'continue')}
            </Text>

            <Ionicons
              name="arrow-forward"
              size={21}
              color="#FFFFFF"
            />

          </Pressable>

        </Animated.View>


        {/* BOTTOM TEXT */}

        <Text style={styles.bottomText}>
          You can change your language later in Settings.
        </Text>

      </Animated.View>

    </SafeAreaView>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },


  // ===================================================
  // TOP BAR
  // ===================================================

  topBar: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 8,
  },


  // ===================================================
  // BACK BUTTON
  // ===================================================

  backButton: {
    width: 43,
    height: 43,
    marginTop:20,

    borderRadius: 22,

    backgroundColor: '#F1F5F9',

    justifyContent: 'center',
    alignItems: 'center',
  },


  backButtonPressed: {
    opacity: 0.6,
  },


  // ===================================================
  // CONTENT
  // ===================================================

  content: {
    flex: 1,

    paddingHorizontal: 25,

    justifyContent: 'center',
  },


  // ===================================================
  // LOGO
  // ===================================================

  logoCircle: {
    width: 90,
    height: 90,

    borderRadius: 45,

    backgroundColor: PRIMARY,

    justifyContent: 'center',
    alignItems: 'center',

    alignSelf: 'center',

    marginBottom: 28,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.12,

    shadowRadius: 8,

    elevation: 5,
  },


  // ===================================================
  // TITLE
  // ===================================================

  title: {
    fontSize: 29,

    fontWeight: '800',

    color: '#111827',

    textAlign: 'center',
  },


  // ===================================================
  // SUBTITLE
  // ===================================================

  subtitle: {
    fontSize: 15,

    lineHeight: 23,

    color: '#64748B',

    textAlign: 'center',

    marginTop: 10,

    marginBottom: 32,

    paddingHorizontal: 15,
  },


  // ===================================================
  // LANGUAGE CONTAINER
  // ===================================================

  languageContainer: {
    width: '100%',
  },


  languageCard: {
    height: 72,

    backgroundColor: '#FFFFFF',

    borderRadius: 18,

    borderWidth: 1.5,

    borderColor: '#E2E8F0',

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 15,

    marginBottom: 14,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.04,

    shadowRadius: 5,

    elevation: 2,
  },


  selectedCard: {
    borderColor: PRIMARY,

    backgroundColor: '#F3F8FC',

    borderWidth: 2,
  },


  // ===================================================
  // LANGUAGE ICON
  // ===================================================

  languageIcon: {
    width: 44,
    height: 44,

    borderRadius: 14,

    backgroundColor: '#EAF3FA',

    justifyContent: 'center',
    alignItems: 'center',
  },


  selectedIcon: {
    backgroundColor: PRIMARY,
  },


  // ===================================================
  // LANGUAGE TEXT
  // ===================================================

  languageTextContainer: {
    flex: 1,

    marginLeft: 14,
  },


  languageName: {
    fontSize: 16,

    fontWeight: '700',

    color: '#111827',
  },


  selectedLanguageName: {
    color: PRIMARY,
  },


  nativeName: {
    fontSize: 13,

    color: '#64748B',

    marginTop: 3,
  },


  // ===================================================
  // CHECK CIRCLE
  // ===================================================

  checkCircle: {
    width: 24,
    height: 24,

    borderRadius: 12,

    borderWidth: 1.8,

    borderColor: '#CBD5E1',

    justifyContent: 'center',
    alignItems: 'center',
  },


  selectedCheckCircle: {
    backgroundColor: PRIMARY,

    borderColor: PRIMARY,
  },


  // ===================================================
  // CONTINUE BUTTON
  // ===================================================

  buttonWrapper: {
    marginTop: 18,
  },


  continueButton: {
    height: 56,

    borderRadius: 17,
    marginBottom:20,

    backgroundColor: PRIMARY,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    shadowColor: PRIMARY,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.22,

    shadowRadius: 8,

    elevation: 5,
  },


  continueText: {
    color: '#FFFFFF',

    fontSize: 17,

    fontWeight: '700',

    marginRight: 10,
  },


  // ===================================================
  // BOTTOM TEXT
  // ===================================================

  bottomText: {
    textAlign: 'center',

    color: '#94A3B8',

    fontSize: 12,

    marginTop: 18,
  },

});