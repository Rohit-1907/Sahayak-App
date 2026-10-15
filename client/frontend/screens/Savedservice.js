import React, { useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

const savedServices = [
  {
    id: 1,
    name: 'Home Cleaning',
    description: 'Professional home cleaning service',
    price: 'From Rs. 399',
    icon: 'sparkles-outline',
    screen: 'cleaning',
  },
  {
    id: 2,
    name: 'Painting',
    description: 'Professional wall painting service',
    price: 'From Rs. 1,499',
    icon: 'color-palette-outline',
    screen: 'painting',
  },
  {
    id: 3,
    name: 'Plumbing',
    description: 'Reliable plumbing service at your doorstep',
    price: 'From Rs. 449',
    icon: 'water-outline',
    screen: 'plumbing',
  },
  {
    id: 4,
    name: 'Electrician',
    description: 'Electrical repair and installation',
    price: 'From Rs. 599',
    icon: 'flash-outline',
    screen: 'electrician',
  },
  {
    id: 5,
    name: 'Carpenter',
    description: 'Professional carpentry service',
    price: 'From Rs. 799',
    icon: 'hammer-outline',
    screen: 'carpenter',
  },
];

/* =====================================================
   ANIMATED SERVICE CARD
===================================================== */

function ServiceCard({ service, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
      bounciness: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.animatedCard,
        {
          transform: [{ scale }],
        },
      ]}
    >
      <Pressable
        style={styles.serviceCard}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >

        {/* ICON */}

        <View style={styles.iconContainer}>
          <Ionicons
            name={service.icon}
            size={28}
            color="#4E8EA2"
          />
        </View>

        {/* SERVICE INFO */}

        <View style={styles.serviceInfo}>

          <Text style={styles.serviceName}>
            {service.name}
          </Text>

          <Text style={styles.serviceDescription}>
            {service.description}
          </Text>

          <Text style={styles.servicePrice}>
            {service.price}
          </Text>

        </View>

        {/* ARROW */}

        <View style={styles.arrowButton}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#4E8EA2"
          />
        </View>

      </Pressable>
    </Animated.View>
  );
}

/* =====================================================
   MAIN SCREEN
===================================================== */

export default function SavedServices({
  onBack,
  onServicePress,
}) {
  const headerScale = useRef(new Animated.Value(1)).current;

  const handleBackPressIn = () => {
    Animated.spring(headerScale, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 30,
      bounciness: 5,
    }).start();
  };

  const handleBackPressOut = () => {
    Animated.spring(headerScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 6,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* =================================================
          HEADER
      ================================================= */}

      <View style={styles.header}>

        <Animated.View
          style={{
            transform: [{ scale: headerScale }],
          }}
        >
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            onPress={onBack}
            onPressIn={handleBackPressIn}
            onPressOut={handleBackPressOut}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#2A2A2A"
            />
          </Pressable>
        </Animated.View>

        <Text style={styles.headerTitle}>
          Saved Services
        </Text>

        <View style={styles.headerSpace} />

      </View>

      {/* =================================================
          CONTENT
      ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* PAGE INTRO */}

        <View style={styles.introContainer}>

          <View style={styles.introIcon}>
            <Ionicons
              name="heart"
              size={23}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.introTextContainer}>

            <Text style={styles.pageTitle}>
              Your Favourite Services
            </Text>

            <Text style={styles.pageSubtitle}>
              Tap a service to book it again.
            </Text>

          </View>

        </View>

        {/* SERVICE LIST */}

        {savedServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onPress={() =>
              onServicePress(service.screen)
            }
          />
        ))}

        {/* FOOTER */}

        <View style={styles.footer}>

          <Ionicons
            name="heart-outline"
            size={18}
            color="#9CA3AF"
          />

          <Text style={styles.footerText}>
            Your favourite services are saved here
          </Text>

        </View>

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
    backgroundColor: '#F7FAFC',
  },

  /* ================= HEADER ================= */

  header: {
    height: 102,
    paddingTop:30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',

    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#EAF3F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backButtonPressed: {
    backgroundColor: '#DCEAF1',
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#2A2A2A',
  },

  headerSpace: {
    width: 43,
  },

  /* ================= CONTENT ================= */

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 45,
  },

  /* ================= INTRO ================= */

  introContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#E5E7EB',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,

    marginBottom: 20,
  },

  introIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#4E8EA2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  introTextContainer: {
    flex: 1,
    marginLeft: 13,
  },

  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2A2A2A',
  },

  pageSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  /* ================= SERVICE CARD ================= */

  animatedCard: {
    marginBottom: 14,
  },

  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 18,
    padding: 15,

    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  /* ================= SERVICE ICON ================= */

  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#EAF4F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ================= SERVICE INFO ================= */

  serviceInfo: {
    flex: 1,
    marginLeft: 13,
    paddingRight: 8,
  },

  serviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2A2A2A',
  },

  serviceDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 17,
  },

  servicePrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4E8EA2',
    marginTop: 6,
  },

  /* ================= ARROW ================= */

  arrowButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF4F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ================= FOOTER ================= */

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 15,
  },

  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 7,
  },

});