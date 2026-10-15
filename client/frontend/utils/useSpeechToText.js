import { useState, useEffect, useCallback } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

/**
 * Maps the app's selectedLanguage values to Android speech recognition
 * locale codes (BCP-47) supported by expo-speech-recognition.
 */
const LANGUAGE_TO_LOCALE = {
  english: 'en-IN',
  hindi: 'hi-IN',
  marathi: 'mr-IN',
};

const DEFAULT_LOCALE = LANGUAGE_TO_LOCALE.english;

/**
 * Shared client-side speech-to-text hook built on expo-speech-recognition.
 *
 * Reuses the proven event pattern from STTTestScreen.js:
 *   - start/end/result/error events via useSpeechRecognitionEvent
 *   - permission requested inside start()
 *   - continuous: false so recognition ends automatically when the user
 *     stops speaking
 *
 * Exposes a simple API: { start, stop, reset, listening, transcript }
 *
 * @param {string} language one of 'english' | 'hindi' | 'marathi'
 */
export function useSpeechToText(language = 'english') {
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
      lang: LANGUAGE_TO_LOCALE[language] || DEFAULT_LOCALE,
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