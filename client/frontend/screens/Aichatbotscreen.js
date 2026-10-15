import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

/* =====================================================
   ANIMATED PRESSABLE
===================================================== */

function AnimatedPressable({ children, onPress, style }) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
      }}
    >
      <Pressable
        style={style}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

/* =====================================================
   ANIMATED MESSAGE
===================================================== */

function AnimatedMessage({ message, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(
    new Animated.Value(message.type === 'user' ? 20 : -20)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 70,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.messageRow,
        message.type === 'user'
          ? styles.userRow
          : styles.botRow,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateX: slideAnim,
            },
          ],
        },
      ]}
    >
      {message.type === 'bot' && (
        <View style={styles.smallBotIcon}>
          <Ionicons
            name="sparkles"
            size={17}
            color="#FFFFFF"
          />
        </View>
      )}

      <View
        style={[
          styles.messageBubble,
          message.type === 'user'
            ? styles.userBubble
            : styles.botBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.type === 'user'
              ? styles.userText
              : styles.botText,
          ]}
        >
          {message.text}
        </Text>
      </View>
    </Animated.View>
  );
}

/* =====================================================
   ANIMATED QUESTION
===================================================== */

function AnimatedQuestion({ item, index, onPress }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        delay: 300 + index * 100,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        delay: 300 + index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: slideAnim,
          },
        ],
      }}
    >
      <AnimatedPressable
        style={styles.questionButton}
        onPress={onPress}
      >
        <Text style={styles.questionText}>
          {item.question}
        </Text>

        <Ionicons
          name="chevron-forward"
          size={19}
          color="#49769F"
        />
      </AnimatedPressable>
    </Animated.View>
  );
}

/* =====================================================
   MAIN SCREEN
===================================================== */

export default function AIChatbotscreen({ onBack }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! 👋 I’m Sahayak AI Assistant. How can I help you today?',
    },
  ]);

  /* =====================================================
     SCREEN ANIMATION
  ===================================================== */

  const screenFade = useRef(
    new Animated.Value(0)
  ).current;

  const screenSlide = useRef(
    new Animated.Value(25)
  ).current;

  const headerFade = useRef(
    new Animated.Value(0)
  ).current;

  const botIconScale = useRef(
    new Animated.Value(0.6)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenFade, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),

      Animated.timing(screenSlide, {
        toValue: 0,
        duration: 550,
        useNativeDriver: true,
      }),

      Animated.timing(headerFade, {
        toValue: 1,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),

      Animated.spring(botIconScale, {
        toValue: 1,
        delay: 250,
        useNativeDriver: true,
        speed: 18,
        bounciness: 8,
      }),
    ]).start();
  }, []);

  /* =====================================================
     QUESTIONS
  ===================================================== */

  const questions = [
    {
      id: 1,
      question: 'I have a payment issue',
      answer:
        'If your payment was deducted but your booking is not confirmed, please wait a few minutes. If the amount is still not updated, you can raise a support ticket from the Help & Support section.',
    },
    {
      id: 2,
      question: 'How can I raise a ticket?',
      answer:
        'To raise a ticket, go to Help & Support → Report an Issue. Select your booking, describe the problem and submit the request. Our support team will review it.',
    },
    {
      id: 3,
      question: 'The worker has not arrived on time',
      answer:
        'We are sorry for the inconvenience. Please check your booking details first. If the worker is significantly delayed, you can report the issue through Help & Support → Report an Issue.',
    },
    {
      id: 4,
      question: 'How can I cancel or reschedule my booking?',
      answer:
        'Open My Bookings and select the booking you want to manage. From the booking details, you can check the available cancellation or rescheduling options.',
    },
  ];

  /* =====================================================
     QUESTION HANDLER
  ===================================================== */

  const handleQuestion = (item) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: item.question,
    };

    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      text: item.answer,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
      botMessage,
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>

      <Animated.View
        style={[
          styles.mainAnimatedContainer,
          {
            opacity: screenFade,
            transform: [
              {
                translateY: screenSlide,
              },
            ],
          },
        ]}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerFade,
            },
          ]}
        >

          <AnimatedPressable
            style={styles.backButton}
            onPress={onBack}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#111827"
            />
          </AnimatedPressable>

          <View style={styles.headerCenter}>

            <Animated.View
              style={[
                styles.botHeaderIcon,
                {
                  transform: [
                    {
                      scale: botIconScale,
                    },
                  ],
                },
              ]}
            >
              <Ionicons
                name="sparkles"
                size={20}
                color="#FFFFFF"
              />
            </Animated.View>

            <View>
              <Text style={styles.headerTitle}>
                Sahayak AI
              </Text>

              <Text style={styles.onlineText}>
                ● Online
              </Text>
            </View>

          </View>

          <View style={{ width: 42 }} />

        </Animated.View>

        {/* =================================================
            CHAT
        ================================================= */}

        <ScrollView
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >

          {messages.map((message, index) => (
            <AnimatedMessage
              key={message.id}
              message={message}
              index={index}
            />
          ))}

          {/* =================================================
              QUESTIONS
          ================================================= */}

          <Text style={styles.questionHeading}>
            Common questions
          </Text>

          {questions.map((item, index) => (
            <AnimatedQuestion
              key={item.id}
              item={item}
              index={index}
              onPress={() => handleQuestion(item)}
            />
          ))}

        </ScrollView>

        {/* =================================================
            BOTTOM INFO
        ================================================= */}

        <View style={styles.bottomContainer}>

          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#49769F"
          />

          <Text style={styles.bottomText}>
            Select a question above to get instant help.
          </Text>

        </View>

      </Animated.View>

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
  },

  mainAnimatedContainer: {
    flex: 1,
  },

  /* =====================================================
     HEADER
  ===================================================== */

  header: {
    height: 102,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingTop:30,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF3FA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  botHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#49769F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },

  onlineText: {
    fontSize: 11,
    color: '#49769F',
    marginTop: 2,
  },

  /* =====================================================
     CHAT
  ===================================================== */

  chatContainer: {
    flex: 1,
  },

  chatContent: {
    padding: 20,
    paddingBottom: 25,
  },

  messageRow: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },

  botRow: {
    justifyContent: 'flex-start',
  },

  userRow: {
    justifyContent: 'flex-end',
  },

  /* =====================================================
     BOT ICON
  ===================================================== */

  smallBotIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#49769F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  /* =====================================================
     MESSAGE BUBBLES
  ===================================================== */

  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 17,
  },

  botBubble: {
    backgroundColor: '#EAF3FA',
    borderBottomLeftRadius: 5,
  },

  userBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomRightRadius: 5,
  },

  messageText: {
    fontSize: 14,
    lineHeight: 21,
  },

  botText: {
    color: '#374151',
  },

  userText: {
    color: '#111827',
    fontWeight: '500',
  },

  /* =====================================================
     QUESTIONS
  ===================================================== */

  questionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 15,
    marginBottom: 15,
  },

  questionButton: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',

    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  questionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginRight: 10,
  },

  /* =====================================================
     BOTTOM INFO
  ===================================================== */

  bottomContainer: {
    minHeight: 55,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },

  bottomText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#64748B',
  },

});