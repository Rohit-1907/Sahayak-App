import React, { useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Alert,
  Animated,
} from 'react-native';

import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function Workerinfo({ onBack, onBook }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const bookScale = useRef(new Animated.Value(1)).current;

  // =====================================================
  // BOOK NOW
  // =====================================================

  const handleBookPressIn = () => {
    Animated.spring(bookScale, {
      toValue: 0.95,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleBookPressOut = () => {
    Animated.spring(bookScale, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleBook = () => {
    console.log('WORKER INFO -> BOOK NOW');

    if (typeof onBook === 'function') {
      onBook();
    } else {
      Alert.alert(
        'Navigation Error',
        'Booking Summary navigation is not connected in App.js.'
      );
    }
  };

  // =====================================================
  // FAVORITE
  // =====================================================

  const handleFavorite = () => {
    setIsFavorite((previous) => !previous);
  };

  // =====================================================
  // RESUME
  // =====================================================

  const handleResume = () => {
    Alert.alert(
      'Resume',
      'Rahul Sharma resume is available for viewing.'
    );
  };

  // =====================================================
  // VOICE
  // =====================================================

  const handleVoice = () => {
    setIsPlaying((previous) => !previous);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* =================================================
          HEADER
      ================================================= */}

      <View style={styles.header}>

        <Pressable
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.pressed,
          ]}
          onPress={onBack}
        >
          <Ionicons
            name="arrow-back"
            size={25}
            color="#111827"
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Worker Information
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.pressed,
          ]}
          onPress={handleFavorite}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={26}
            color={isFavorite ? '#EF4444' : '#49769F'}
          />
        </Pressable>

      </View>

      {/* =================================================
          CONTENT
      ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* WORKER PROFILE */}

        <View style={styles.profileCard}>

          <Image
            source={{
              uri:
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
            }}
            style={styles.profileImage}
          />

          <View style={styles.nameRow}>

            <Text style={styles.name}>
              Rahul Sharma
            </Text>

            <MaterialIcons
              name="verified"
              size={22}
              color="#49769F"
            />

          </View>

          <Text style={styles.profession}>
            Professional Painter
          </Text>

          <View style={styles.ratingRow}>

            <Ionicons
              name="star"
              size={18}
              color="#FBBF24"
            />

            <Text style={styles.rating}>
              4.8 • 350 Reviews
            </Text>

          </View>

          <View style={styles.available}>

            <View style={styles.dot} />

            <Text style={styles.availableText}>
              Available Today
            </Text>

          </View>

          <View style={styles.locationRow}>

            <Ionicons
              name="location"
              size={18}
              color="#49769F"
            />

            <Text style={styles.location}>
              Pune, Maharashtra
            </Text>

          </View>

        </View>

        {/* TRUST SCORE */}

        <View style={styles.trustCard}>

          <View>

            <Text style={styles.trustTitle}>
              Trust Score
            </Text>

            <Text style={styles.trustNumber}>
              92%
            </Text>

          </View>

          <View style={styles.verifyContainer}>

            <View style={styles.verifyRow}>
              <Ionicons
                name="checkmark-circle"
                size={17}
                color="#FFFFFF"
              />

              <Text style={styles.verify}>
                Verified ID
              </Text>
            </View>

            <View style={styles.verifyRow}>
              <Ionicons
                name="checkmark-circle"
                size={17}
                color="#FFFFFF"
              />

              <Text style={styles.verify}>
                500+ Completed Jobs
              </Text>
            </View>

            <View style={styles.verifyRow}>
              <Ionicons
                name="checkmark-circle"
                size={17}
                color="#FFFFFF"
              />

              <Text style={styles.verify}>
                Positive Reviews
              </Text>
            </View>

          </View>

        </View>

        {/* ABOUT */}

        <View style={styles.section}>

          <Text style={styles.heading}>
            About Worker
          </Text>

          <Text style={styles.description}>
            I am an experienced professional with 5+
            years of experience. I provide reliable,
            high-quality painting services with a focus
            on safety and customer satisfaction.
          </Text>

        </View>

        {/* EXPERIENCE */}

        <View style={styles.section}>

          <Text style={styles.heading}>
            Experience
          </Text>

          <View style={styles.infoCard}>

            <View style={styles.infoIcon}>

              <Ionicons
                name="briefcase"
                size={24}
                color="#49769F"
              />

            </View>

            <View style={styles.infoContent}>

              <Text style={styles.infoTitle}>
                5+ Years Experience
              </Text>

              <Text style={styles.infoSub}>
                Professional home painting experience
              </Text>

            </View>

          </View>

        </View>

        {/* RESUME */}

        <View style={styles.section}>

          <Text style={styles.heading}>
            Resume
          </Text>

          <View style={styles.resumeCard}>

            <View style={styles.resumeIcon}>

              <Ionicons
                name="document-text"
                size={32}
                color="#49769F"
              />

            </View>

            <View style={styles.resumeInfo}>

              <Text style={styles.resumeName}>
                Rahul_Sharma_Resume.pdf
              </Text>

              <Text style={styles.resumeSub}>
                Experience & Qualification Details
              </Text>

            </View>

            <Pressable
              style={({ pressed }) => [
                styles.viewBtn,
                pressed && styles.viewPressed,
              ]}
              onPress={handleResume}
            >
              <Text style={styles.viewText}>
                View
              </Text>
            </Pressable>

          </View>

        </View>

        {/* VOICE INTRODUCTION */}

        <View style={styles.section}>

          <Text style={styles.heading}>
            Voice Introduction
          </Text>

          <View style={styles.voiceCard}>

            <Pressable
              style={({ pressed }) => [
                styles.playBtn,
                pressed && styles.playPressed,
              ]}
              onPress={handleVoice}
            >

              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={24}
                color="#FFFFFF"
              />

            </Pressable>

            <View style={styles.voiceInfo}>

              <Text style={styles.voiceTitle}>
                Worker Introduction
              </Text>

              <Text style={styles.voiceSub}>
                {isPlaying
                  ? 'Playing introduction...'
                  : 'Listen to introduction'}
              </Text>

            </View>

          </View>

        </View>

        {/* SKILLS */}

        <View style={styles.section}>

          <Text style={styles.heading}>
            Skills & Services
          </Text>

          <View style={styles.skillContainer}>

            <Text style={styles.skill}>
              Wall Painting
            </Text>

            <Text style={styles.skill}>
              Interior Painting
            </Text>

            <Text style={styles.skill}>
              Exterior Painting
            </Text>

            <Text style={styles.skill}>
              Color Consultation
            </Text>

          </View>

        </View>

        {/* PREVIOUS WORK */}

        <View style={styles.section}>

          <Text style={styles.heading}>
            Previous Work
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.gallery}
          >

            <Image
              source={{
                uri:
                  'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=500',
              }}
              style={styles.workImage}
            />

            <Image
              source={{
                uri:
                  'https://images.unsplash.com/photo-1595814432314-90095f342694?w=500',
              }}
              style={styles.workImage}
            />

            <Image
              source={{
                uri:
                  'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500',
              }}
              style={styles.workImage}
            />

          </ScrollView>

        </View>

        {/* REVIEWS */}

        <View style={styles.section}>

          <Text style={styles.heading}>
            Customer Reviews
          </Text>

          <View style={styles.reviewCard}>

            <Text style={styles.stars}>
              ⭐⭐⭐⭐⭐
            </Text>

            <Text style={styles.reviewText}>
              "Very professional worker. Completed my
              home painting perfectly and on time."
            </Text>

            <Text style={styles.customer}>
              — Priya Patil
            </Text>

          </View>

        </View>

      </ScrollView>

      {/* =================================================
          BOTTOM BOOKING BAR
      ================================================= */}

      <View style={styles.bottomBar}>

        <View style={styles.bottomInfo}>

          <Text style={styles.bottomLabel}>
            Ready to book?
          </Text>

          <Text style={styles.bottomSub}>
            Select this professional
          </Text>

        </View>

        <Animated.View
          style={{
            transform: [
              {
                scale: bookScale,
              },
            ],
          }}
        >

          

        </Animated.View>

      </View>

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

  scrollContent: {
    paddingBottom: 120,
  },

  // HEADER

  header: {
    height: 102,
    paddingTop:30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3F6F8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },

  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.94 }],
  },

  // PROFILE

  profileCard: {
    margin: 20,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },

  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginRight: 6,
  },

  profession: {
    marginTop: 6,
    fontSize: 15,
    color: '#64748B',
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  rating: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  available: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 7,
  },

  availableText: {
    color: '#15803D',
    fontWeight: '600',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  location: {
    marginLeft: 5,
    color: '#64748B',
  },

  // TRUST

  trustCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#49769F',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  trustTitle: {
    color: '#E5E7EB',
    fontSize: 14,
  },

  trustNumber: {
    marginTop: 3,
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },

  verifyContainer: {
    justifyContent: 'center',
  },

  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },

  verify: {
    marginLeft: 6,
    color: '#FFFFFF',
    fontSize: 13,
  },

  // SECTIONS

  section: {
    marginHorizontal: 20,
    marginTop: 25,
  },

  heading: {
    fontSize: 21,
    fontWeight: '700',
    color: '#111827',
  },

  description: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    color: '#64748B',
  },

  // EXPERIENCE

  infoCard: {
    marginTop: 15,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EAF2F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  infoSub: {
    marginTop: 5,
    fontSize: 12,
    color: '#64748B',
  },

  // RESUME

  resumeCard: {
    marginTop: 15,
    padding: 15,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },

  resumeIcon: {
    marginRight: 15,
  },

  resumeInfo: {
    flex: 1,
  },

  resumeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  resumeSub: {
    marginTop: 5,
    fontSize: 12,
    color: '#64748B',
  },

  viewBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#49769F',
  },

  viewPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },

  viewText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // VOICE

  voiceCard: {
    marginTop: 15,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },

  playBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#49769F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  playPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.94 }],
  },

  voiceInfo: {
    flex: 1,
  },

  voiceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  voiceSub: {
    marginTop: 5,
    color: '#64748B',
  },

  // SKILLS

  skillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
  },

  skill: {
    marginRight: 10,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#EAF2F8',
    color: '#49769F',
    fontWeight: '600',
  },

  // GALLERY

  gallery: {
    paddingTop: 15,
  },

  workImage: {
    width: 140,
    height: 110,
    borderRadius: 15,
    marginRight: 12,
  },

  // REVIEWS

  reviewCard: {
    marginTop: 15,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  stars: {
    fontSize: 18,
  },

  reviewText: {
    marginTop: 10,
    lineHeight: 21,
    color: '#374151',
  },

  customer: {
    marginTop: 10,
    fontWeight: '700',
    color: '#111827',
  },

  // BOOKING BAR

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 80,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 10,
  },

  bottomInfo: {
    flex: 1,
    marginRight: 12,
  },

  bottomLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  bottomSub: {
    marginTop: 3,
    fontSize: 11,
    color: '#64748B',
  },

  bookBtn: {
    minWidth: 145,
    height: 50,
    paddingHorizontal: 18,
    borderRadius: 15,
    backgroundColor: '#49769F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },

  bookPressed: {
    opacity: 0.85,
  },

  bookText: {
    marginRight: 8,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

});