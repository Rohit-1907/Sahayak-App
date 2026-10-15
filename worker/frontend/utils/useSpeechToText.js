import { useState, useEffect, useCallback } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

/**
 * Maps the Workers app language values to Android speech recognition
 * locale codes (BCP-47) supported by expo-speech-recognition.
 *
 * language values come from LanguageSelection.js and translations.js:
 *   "English" | "मराठी" | "हिंदी"
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
 * "english", "hindi", "marathi", etc.
 */
function resolveLocale(language) {
  const matcher = String(language || '').trim().toLowerCase();

  const found = Object.keys(LANGUAGE_TO_LOCALE).find(
    (name) => name.toLowerCase() === matcher
  );

  return found ? LANGUAGE_TO_LOCALE[found] : DEFAULT_LOCALE;
}

/**
 * Shared client-side speech-to-text hook built on expo-speech-recognition.
 *
 * Reuses the proven event pattern from the Sahayak client app:
 *   - start/end/result/error events via useSpeechRecognitionEvent
 *   - permission requested inside start()
 *   - continuous: false so recognition ends automatically when the user
 *     stops speaking
 *
 * Exposes: { start, stop, reset, listening, transcript }
 *
 * @param {string} language one of "English" | "मराठी" | "हिंदी"
 */
export function useSpeechToText(language = 'English') {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useSpeechRecognitionEvent('start', () => {
    setListening(true);
  });

  useSpeechRecognitionEvent('end', () => {
    setListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    if (event.results?.length > 0) {
      const recognized = event.results[0]?.transcript || '';
      if (recognized) {
        setTranscript(recognized);
      }
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.log('STT ERROR:', event.error, event.message);
    setListening(false);
  });

  // Stop any in-flight recognition when the consumer unmounts.
  useEffect(() => {
    return () => {
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const start = useCallback(async () => {
    const permission =
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();

    if (!permission.granted) {
      console.log('STT: microphone / speech permission denied');
      return false;
    }

    setTranscript('');

    ExpoSpeechRecognitionModule.start({
      lang: resolveLocale(language),
      interimResults: true,
      maxAlternatives: 1,
      continuous: false,
    });

    return true;
  }, [language]);

  const stop = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch (e) {
      // ignore
    }
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    start,
    stop,
    reset,
    listening,
    transcript,
  };
}

export default useSpeechToText;