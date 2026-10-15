import React, { useEffect, useRef } from "react";

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
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { translate } from "../utils/translations";
import { useTextToSpeech } from "../utils/useTextToSpeech";
import VoiceGuidanceButton from "../components/VoiceGuidanceButton";


// ============================================================
// WORKER WELCOME SCREEN
// ============================================================

let workerWelcomeIntroSpoken = false;

export default function WorkerWelcomeScreen({
  onSignIn,
  onOrganizationLogin,
  onCreateAccount,
  onBack,
  language = "English",
}) {
  // ==========================================================
  // ANIMATIONS
  // ==========================================================

  const fadeAnim = useRef(
    new Animated.Value(0)
  ).current;

  const slideAnim = useRef(
    new Animated.Value(25)
  ).current;

  const floatAnim = useRef(
    new Animated.Value(0)
  ).current;

  const buttonAnim = useRef(
    new Animated.Value(0.95)
  ).current;

  // VOICE GUIDANCE (TTS)
  const { speak: speakWelcome, stop: stopWelcome } = useTextToSpeech(language);


  // ==========================================================
  // SCREEN ANIMATION
  // ==========================================================

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


    // ========================================================
    // FLOATING ICON ANIMATION
    // ========================================================

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
  }, [
    fadeAnim,
    slideAnim,
    floatAnim,
    buttonAnim,
  ]);

  // Auto-intro: concise welcome guidance without reading entered values
  useEffect(() => {
    if (workerWelcomeIntroSpoken) {
      return;
    }
    workerWelcomeIntroSpoken = true;
    const intro = translate('workerWelcomeAutoIntro', language);
    speakWelcome(intro);
    return () => {
      stopWelcome();
    };
  }, [language, speakWelcome, stopWelcome]);


  // ==========================================================
  // BACK
  // ==========================================================

  const handleBackPress = () => {
    if (typeof onBack === "function") {
      onBack();
    }
  };


  // ==========================================================
  // SIGN IN
  // ==========================================================

  const handleSignInPress = () => {
    if (typeof onSignIn === "function") {
      onSignIn();
    }
  };


  // ==========================================================
  // ORGANIZATION REGISTRATION
  //
  // First preference:
  // onOrganizationLogin
  //
  // Fallback:
  // onCreateAccount
  // ==========================================================

  const handleOrganizationRegistration = () => {
    if (typeof onOrganizationLogin === "function") {
      onOrganizationLogin();
      return;
    }

    if (typeof onCreateAccount === "function") {
      onCreateAccount();
    }
  };


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <SafeAreaView style={styles.container}>

      {/* =====================================================
          BACK BUTTON
      ===================================================== */}

      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackPress}
        activeOpacity={0.7}
      >
        <Ionicons
          name="arrow-back"
          size={28}
          color="#111827"
        />
      </TouchableOpacity>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

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

          <View style={[styles.innerCircle, { overflow: 'hidden' }]}>
            <Image
              source={require('../assets/logo.png')}
              style={{ width: '100%', height: '100%', borderRadius: 63 }}
              resizeMode="cover"
            />
          </View>

        </Animated.View>


        {/* =================================================
            TITLE
        ================================================= */}

        <Text style={styles.title}>
          {translate('welcomeToSahayak', language)}
        </Text>


        {/* =================================================
            SUBTITLE
        ================================================= */}

        <Text style={styles.subtitle}>
          {translate('welcomeSubtitle', language)}
        </Text>

        <View style={{ marginTop: 16, width: '100%' }}>
          <VoiceGuidanceButton
            labeled
            text={translate('workerWelcomeVoiceGuidance', language)}
            language={language}
            title={translate('voiceAssistance', language)}
            subtitle={translate('workerWelcomeHearHowToUse', language)}
          />
        </View>

      </Animated.View>


      {/* =====================================================
          BOTTOM BUTTONS
      ===================================================== */}

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

        {/* =================================================
            SIGN IN
        ================================================= */}

        <Pressable
          style={({ pressed }) => [
            styles.signInButton,

            pressed &&
              styles.buttonPressed,
          ]}
          onPress={handleSignInPress}
        >

          <Text style={styles.signInText}>
            {translate('signIn', language)}
          </Text>

          <Ionicons
            name="arrow-forward"
            size={19}
            color="#FFFFFF"
          />

        </Pressable>


        {/* =================================================
            ORGANIZATION REGISTRATION
        ================================================= */}

        <Pressable
          style={({ pressed }) => [
            styles.createButton,

            pressed &&
              styles.createButtonPressed,
          ]}
          onPress={handleOrganizationRegistration}
        >

          <Text style={styles.createText}>
            {translate('organizationRegistration', language)}
          </Text>

        </Pressable>


        {/* =================================================
            FOOTER
        ================================================= */}

        <Text style={styles.footerText}>
          {translate('trustedHomeServices', language)}
        </Text>

      </Animated.View>

    </SafeAreaView>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  // ==========================================================
  // CONTAINER
  // ==========================================================

  container: {
    flex: 1,

    backgroundColor: "#FFFFFF",

    paddingHorizontal: 22,

    paddingTop: 12,

    paddingBottom: 24,
  },


  // ==========================================================
  // BACK BUTTON
  // ==========================================================

  backButton: {
    width: 46,

    height: 46,

    borderRadius: 23,

    backgroundColor: "#F1F5F8",

    justifyContent: "center",

    alignItems: "center",

    marginTop: 5,

    elevation: 2,

    shadowColor: "#000000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,

    shadowRadius: 4,
  },


  // ==========================================================
  // MAIN CONTENT
  // ==========================================================

  content: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    paddingBottom: 10,
  },


  // ==========================================================
  // OUTER IMAGE CIRCLE
  // ==========================================================

  imageCircle: {
    width: 190,

    height: 190,

    borderRadius: 95,

    backgroundColor: "#EAF1F6",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 30,
  },


  // ==========================================================
  // INNER CIRCLE
  // ==========================================================

  innerCircle: {
    width: 125,

    height: 125,

    borderRadius: 63,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",

    alignItems: "center",

    elevation: 4,

    shadowColor: "#49769F",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.12,

    shadowRadius: 8,
  },


  // ==========================================================
  // TITLE
  // ==========================================================

  title: {
    fontSize: 28,

    fontWeight: "700",

    color: "#111827",

    textAlign: "center",

    letterSpacing: 0.2,
  },


  // ==========================================================
  // SUBTITLE
  // ==========================================================

  subtitle: {
    marginTop: 12,

    fontSize: 14,

    color: "#6B7280",

    textAlign: "center",

    lineHeight: 21,

    paddingHorizontal: 8,

    maxWidth: 350,
  },


  // ==========================================================
  // BOTTOM CONTAINER
  // ==========================================================

  bottomContainer: {
    width: "100%",
  },


  // ==========================================================
  // SIGN IN BUTTON
  // ==========================================================

  signInButton: {
    height: 54,

    borderRadius: 14,

    backgroundColor: "#49769F",

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    elevation: 3,

    shadowColor: "#49769F",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.18,

    shadowRadius: 6,

    marginBottom: 12,
  },


  // ==========================================================
  // SIGN IN TEXT
  // ==========================================================

  signInText: {
    color: "#FFFFFF",

    fontSize: 16,

    fontWeight: "700",

    marginRight: 8,
  },


  // ==========================================================
  // ORGANIZATION REGISTRATION BUTTON
  // ==========================================================

  createButton: {
    minHeight: 54,

    borderRadius: 14,

    borderWidth: 1.5,

    borderColor: "#49769F",

    backgroundColor: "#FFFFFF",

    justifyContent: "center",

    alignItems: "center",

    paddingHorizontal: 12,
  },


  // ==========================================================
  // ORGANIZATION REGISTRATION TEXT
  // ==========================================================

  createText: {
    color: "#49769F",

    fontSize: 16,

    fontWeight: "700",

    textAlign: "center",
  },


  // ==========================================================
  // BUTTON PRESSED
  // ==========================================================

  buttonPressed: {
    opacity: 0.78,
  },


  createButtonPressed: {
    backgroundColor: "#F1F5F8",
  },


  // ==========================================================
  // FOOTER
  // ==========================================================

  footerText: {
    textAlign: "center",

    fontSize: 11,

    color: "#9CA3AF",

    marginTop: 14,
  },

});
