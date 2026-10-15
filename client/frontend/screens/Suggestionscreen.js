import React, { useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  Animated,
  Easing,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

export default function Suggestionscreen({ onBack }) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [suggestion, setSuggestion] = useState('');

  // ==========================================
  // ANIMATIONS
  // ==========================================

  const introOpacity = useRef(new Animated.Value(0)).current;
  const introTranslate = useRef(new Animated.Value(25)).current;

  const categoryOpacity = useRef(new Animated.Value(0)).current;
  const categoryTranslate = useRef(new Animated.Value(20)).current;

  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslate = useRef(new Animated.Value(20)).current;

  const buttonScale = useRef(new Animated.Value(1)).current;

  // ==========================================
  // CATEGORIES
  // ==========================================

  const categories = [
    {
      id: 'services',
      title: 'New Services',
      icon: 'add-circle-outline',
    },
    {
      id: 'app',
      title: 'App Improvement',
      icon: 'phone-portrait-outline',
    },
    {
      id: 'booking',
      title: 'Booking',
      icon: 'calendar-outline',
    },
    {
      id: 'voice',
      title: 'Voice Assistant',
      icon: 'mic-outline',
    },
    {
      id: 'other',
      title: 'Other',
      icon: 'bulb-outline',
    },
  ];

  // ==========================================
  // START ANIMATIONS
  // ==========================================

  React.useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(introOpacity, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(introTranslate, {
          toValue: 0,
          duration: 650,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(categoryOpacity, {
          toValue: 1,
          duration: 550,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(categoryTranslate, {
          toValue: 0,
          duration: 550,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 550,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(formTranslate, {
          toValue: 0,
          duration: 550,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // ==========================================
  // CATEGORY PRESS
  // ==========================================

  const handleCategoryPress = (id) => {
    setSelectedCategory(id);
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = () => {
    if (!selectedCategory) {
      Alert.alert(
        'Select Category',
        'Please select a suggestion category.'
      );
      return;
    }

    if (!suggestion.trim()) {
      Alert.alert(
        'Suggestion Required',
        'Please enter your suggestion before submitting.'
      );
      return;
    }

    Alert.alert(
      'Thank You! ',
      'Your suggestion has been submitted successfully. We appreciate your help in making Sahayak better.',
      [
        {
          text: 'Done',
          onPress: onBack,
        },
      ]
    );
  };

  // ==========================================
  // BUTTON PRESS ANIMATION
  // ==========================================

  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <SafeAreaView style={styles.container}>

      {/* ======================================
          HEADER
      ====================================== */}

      <View style={styles.header}>

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
            color="#2A2A2A"
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Suggestions
        </Text>

        <View style={styles.headerSpace} />

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >

        {/* ======================================
            INTRO
        ====================================== */}

        <Animated.View
          style={[
            styles.intro,
            {
              opacity: introOpacity,
              transform: [
                {
                  translateY: introTranslate,
                },
              ],
            },
          ]}
        >

          <Animated.View style={styles.iconCircle}>

            <Ionicons
              name="bulb"
              size={40}
              color="#FFFFFF"
            />

          </Animated.View>

          <Text style={styles.title}>
            Have an idea?
          </Text>

          <Text style={styles.subtitle}>
            We'd love to hear your ideas. Your suggestions
            can help us make Sahayak better.
          </Text>

        </Animated.View>

        {/* ======================================
            CATEGORY
        ====================================== */}

        <Animated.View
          style={{
            opacity: categoryOpacity,
            transform: [
              {
                translateY: categoryTranslate,
              },
            ],
          }}
        >

          <Text style={styles.sectionTitle}>
            What is your suggestion about?
          </Text>

          <View style={styles.categoryContainer}>

            {categories.map((item, index) => {

              const selected =
                selectedCategory === item.id;

              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.categoryCard,
                    selected && styles.selectedCategory,
                    pressed && styles.categoryPressed,
                  ]}
                  onPress={() =>
                    handleCategoryPress(item.id)
                  }
                >

                  <View
                    style={[
                      styles.categoryIconCircle,
                      selected &&
                        styles.selectedCategoryIcon,
                    ]}
                  >

                    <Ionicons
                      name={item.icon}
                      size={23}
                      color={
                        selected
                          ? '#FFFFFF'
                          : '#4E8EA2'
                      }
                    />

                  </View>

                  <Text
                    style={[
                      styles.categoryText,
                      selected &&
                        styles.selectedCategoryText,
                    ]}
                  >
                    {item.title}
                  </Text>

                  {selected && (
                    <View style={styles.checkIcon}>

                      <Ionicons
                        name="checkmark"
                        size={13}
                        color="#4E8EA2"
                      />

                    </View>
                  )}

                </Pressable>
              );

            })}

          </View>

        </Animated.View>

        {/* ======================================
            SUGGESTION FORM
        ====================================== */}

        <Animated.View
          style={{
            opacity: formOpacity,
            transform: [
              {
                translateY: formTranslate,
              },
            ],
          }}
        >

          <Text style={styles.sectionTitle}>
            Your Suggestion
          </Text>

          <View style={styles.textAreaContainer}>

            <View style={styles.textAreaTop}>

              <Ionicons
                name="create-outline"
                size={19}
                color="#4E8EA2"
              />

              <Text style={styles.textAreaHint}>
                Share your idea with us
              </Text>

            </View>

            <TextInput
              style={styles.textArea}
              placeholder="Tell us your idea or suggestion..."
              placeholderTextColor="#9CA3AF"
              value={suggestion}
              onChangeText={setSuggestion}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />

            <Text style={styles.characterCount}>
              {suggestion.length}/500
            </Text>

          </View>

          {/* ======================================
              EXAMPLE CARD
          ====================================== */}

          <View style={styles.exampleCard}>

            <View style={styles.exampleIcon}>

              <Ionicons
                name="bulb-outline"
                size={22}
                color="#4E8EA2"
              />

            </View>

            <View style={styles.exampleContent}>

              <Text style={styles.exampleTitle}>
                Example
              </Text>

              <Text style={styles.exampleText}>
                "It would be helpful if I could schedule
                a service for a specific time."
              </Text>

            </View>

          </View>

          {/* ======================================
              SUBMIT BUTTON
          ====================================== */}

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
              style={styles.submitButton}
              onPress={handleSubmit}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
            >

              <View style={styles.submitIconCircle}>

                <Ionicons
                  name="send"
                  size={17}
                  color="#FFFFFF"
                />

              </View>

              <Text style={styles.submitText}>
                Submit Suggestion
              </Text>

            </Pressable>

          </Animated.View>

          <Text style={styles.bottomText}>
            Thank you for helping us improve Sahayak.
          </Text>

        </Animated.View>

      </ScrollView>

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

  /* ================= HEADER ================= */

  header: {
height: 102,
    paddingTop:30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backButtonPressed: {
    backgroundColor: '#EAF4F7',
    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#2A2A2A',
  },

  headerSpace: {
    width: 42,
  },

  /* ================= CONTENT ================= */

  content: {
    padding: 20,
    paddingBottom: 45,
  },

  /* ================= INTRO ================= */

  intro: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 28,
  },

  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4E8EA2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,

    shadowColor: '#4E8EA2',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },

  title: {
    fontSize: 25,
    fontWeight: '700',
    color: '#2A2A2A',
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 7,
    paddingHorizontal: 12,
  },

  /* ================= SECTION ================= */

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A2A2A',
    marginTop: 8,
    marginBottom: 13,
  },

  /* ================= CATEGORY ================= */

  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  categoryCard: {
    width: '48%',
    minHeight: 92,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    backgroundColor: '#FFFFFF',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 5,
    elevation: 1,
  },

  categoryPressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  selectedCategory: {
    backgroundColor: '#4E8EA2',
    borderColor: '#4E8EA2',

    shadowColor: '#4E8EA2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 4,
  },

  categoryIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EAF4F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedCategoryIcon: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  categoryText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#374151',
    marginTop: 7,
    textAlign: 'center',
  },

  selectedCategoryText: {
    color: '#FFFFFF',
  },

  checkIcon: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ================= TEXT AREA ================= */

  textAreaContainer: {
    minHeight: 165,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 13,
    backgroundColor: '#FFFFFF',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.025,
    shadowRadius: 5,
    elevation: 1,
  },

  textAreaTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },

  textAreaHint: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4E8EA2',
    marginLeft: 7,
  },

  textArea: {
    flex: 1,
    fontSize: 14,
    color: '#2A2A2A',
    lineHeight: 20,
    minHeight: 95,
  },

  characterCount: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },

  /* ================= EXAMPLE ================= */

  exampleCard: {
    backgroundColor: '#F1F7F9',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E1EEF2',
  },

  exampleIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  exampleContent: {
    flex: 1,
    marginLeft: 12,
  },

  exampleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2A2A2A',
    marginBottom: 4,
  },

  exampleText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },

  /* ================= SUBMIT ================= */

  submitButton: {
    height: 57,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  submitIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4E8EA2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  /* ================= FOOTER ================= */

  bottomText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 13,
  },

});