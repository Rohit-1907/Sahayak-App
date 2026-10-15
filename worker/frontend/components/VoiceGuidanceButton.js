import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Animated,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTextToSpeech } from '../utils/useTextToSpeech';

/* ============================================================
   COLORS
   Matches the Client app Voice Guidance button colors.
============================================================ */

const PURPLE = '#49769F';
const CARD_BG = '#FFFFFF';
const CARD_BORDER = '#D8E8EF';
const MIC_BG = '#EAF3F7';
const MIC_BORDER = '#DCEAF0';
const TITLE_COLOR = '#1F2937';
const SUBTITLE_COLOR = '#64748B';

/**
 * VoiceGuidanceButton
 *
 * Reusable Text-to-Speech button for Worker screens.
 * Tapping it speaks the supplied `text` in the supplied `language`.
 * Tapping again while speech is playing stops the speech.
 *
 * Two appearances:
 *  - `labeled` truthy: the Client-app style Voice Guidance card
 *    (mic circle + title + optional subtitle + chevron) with the
 *    same spring-scale pressed animation.
 *  - otherwise: a small speaker icon pressable (default).
 *
 * Uses the same MaterialCommunityIcons set as the rest of the app.
 * Callers can pass `style` freely to fit their layout.
 */

export default function VoiceGuidanceButton({
  text,
  language,
  disabled = false,
  style,
  iconColor = PURPLE,
  iconSize = 22,
  onPress,
  labeled = false,
  title,
  subtitle,
}) {
  const { speak, stop, isSpeaking } = useTextToSpeech(language);

  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    if (isSpeaking) {
      stop();
      return;
    }
    speak(text);
  };

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 10,
    }).start();
  };

  if (labeled) {
    return (
      <Animated.View
        style={{
          transform: [{ scale }],
        }}
      >
        <Pressable
          style={[styles.cardButton, disabled && styles.disabled, style]}
          onPressIn={pressIn}
          onPressOut={pressOut}
          onPress={handlePress}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={typeof text === 'string' ? text : ''}
        >
          <View style={styles.cardMic}>
            <MaterialCommunityIcons
              name="microphone"
              size={16}
              color={PURPLE}
            />
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {title || 'Voice Guidance'}
            </Text>

            {subtitle ? (
              <Text style={styles.cardSubtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={18}
            color={PURPLE}
          />
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={typeof text === 'string' ? text : ''}
    >
      <MaterialCommunityIcons
        name="volume-high"
        size={iconSize}
        color={disabled ? '#CBD5E1' : iconColor}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 6,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Client-app Voice Guidance card styles (matches Clientprofilescreen.js) */

  cardButton: {
    backgroundColor: CARD_BG,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 13,
  },

  cardMic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MIC_BG,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: MIC_BORDER,
  },

  cardInfo: {
    marginLeft: 12,
    flexShrink: 1,
    marginRight: 6,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TITLE_COLOR,
  },

  cardSubtitle: {
    fontSize: 11,
    color: SUBTITLE_COLOR,
    marginTop: 3,
  },

  disabled: {
    opacity: 0.4,
  },
});