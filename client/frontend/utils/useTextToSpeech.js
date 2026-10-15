import { useState, useEffect, useCallback, useRef } from 'react';
import * as Speech from 'expo-speech';

/**
 * Maps the Workers app language values to Android Text-to-Speech
 * language codes (IETF BCP-47) supported by expo-speech.
 *
 * language values come from LanguageSelection.js and translations.js:
 *   "English" | "मराठी" | "हिंदी"
 *
 * Mirrors the locale map used by utils/useSpeechToText.js so STT and
 * TTS always use the same language.
 */
const LANGUAGE_TO_LOCALE = {
  English: 'en-IN',
  'मराठी': 'mr-IN',
  'हिंदी': 'hi-IN',
};

const DEFAULT_LOCALE = LANGUAGE_TO_LOCALE.English;

/**
 * Resolves a recognized language value to a locale code,
 * case-insensitively, so hooks can also be called with
 * "english", "hindi", "marathi", etc. Unknown languages
 * safely default to en-IN.
 */
function resolveLocale(language) {
  const matcher = String(language || '').trim().toLowerCase();

  const found = Object.keys(LANGUAGE_TO_LOCALE).find(
    (name) => name.toLowerCase() === matcher
  );

  return found ? LANGUAGE_TO_LOCALE[found] : DEFAULT_LOCALE;
}

/**
 * Shared Text-to-Speech hook built on expo-speech.
 *
 * Exposes: { speak, stop, isSpeaking }
 *
 * @param {string} language one of "English" | "मराठी" | "हिंदी"
 */
export function useTextToSpeech(language = 'English') {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mountedRef = useRef(true);

  // Stop any speech and ignore late callbacks when the consumer unmounts.
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      try {
        Speech.stop();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const setSpeakingSafe = (value) => {
    if (mountedRef.current) {
      setIsSpeaking(value);
    }
  };

  /**
   * Speak the given text in the selected language.
   * Stops any currently speaking utterance before starting a new one.
   */
  const speak = useCallback((text) => {
    const value = typeof text === 'string' ? text.trim() : '';

    if (!value) {
      return;
    }

    try {
      Speech.stop();
    } catch (e) {
      // ignore
    }

    try {
      Speech.speak(value, {
        language: resolveLocale(language),
        rate: 0.92,
        pitch: 1.0,
        onStart: () => setSpeakingSafe(true),
        onDone: () => setSpeakingSafe(false),
        onStopped: () => setSpeakingSafe(false),
        onError: () => setSpeakingSafe(false),
      });
    } catch (e) {
      setSpeakingSafe(false);
      console.log('TTS ERROR:', e);
    }
  }, [language]);

  /**
   * Stop any currently speaking utterance.
   */
  const stop = useCallback(() => {
    try {
      Speech.stop();
    } catch (e) {
      // ignore
    }
    setSpeakingSafe(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
  };
}

export default useTextToSpeech;