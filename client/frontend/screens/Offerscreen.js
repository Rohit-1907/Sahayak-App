import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

export default function OffersScreen({ onBack, onBook }) {
  const offers = [
    {
      id: 1,
      title: 'Home Cleaning',
      discount: '25% OFF',
      subtitle: 'Complete Home Cleaning',
      description:
        'Get your entire home cleaned by trained professionals.',
      validity: 'Valid for first booking',
      image:
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900',
    },

    {
      id: 2,
      title: 'Professional Painting',
      discount: '20% OFF',
      subtitle: 'Give Your Walls a Fresh Look',
      description:
        'Professional painting services for rooms and complete homes.',
      validity: 'Limited time offer',
      image:
        'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=900',
    },

    {
      id: 3,
      title: 'Electrical Services',
      discount: '15% OFF',
      subtitle: 'Electrical Repair at Your Doorstep',
      description:
        'Get reliable electrical repair and installation services.',
      validity: 'Valid on selected services',
      image:
        'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=900',
    },

    {
      id: 4,
      title: 'Plumbing Services',
      discount: '20% OFF',
      subtitle: 'Quick Plumbing Solutions',
      description:
        'Fix leaks, taps, pipes and other plumbing problems easily.',
      validity: 'Valid this month',
      image:
        'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=900',
    },

    {
      id: 5,
      title: 'AC Repair & Service',
      discount: '30% OFF',
      subtitle: 'Beat the Heat',
      description:
        'Get professional AC servicing and repair at your doorstep.',
      validity: 'Summer special offer',
      image:
        'https://images.unsplash.com/photo-1631545806609-1c7c5f3a7d9d?w=900',
    },

    {
      id: 6,
      title: 'Carpenter Services',
      discount: '15% OFF',
      subtitle: 'Furniture & Woodwork',
      description:
        'Professional carpentry services for your home and furniture.',
      validity: 'Valid on selected services',
      image:
        'https://images.unsplash.com/photo-1601058268499-e52658b8bb88?w=900',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>

        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressedButton,
          ]}
          onPress={onBack}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#111827"
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Special Offers
        </Text>

        <View style={styles.headerSpacer} />

      </View>

      {/* CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* OFFER INTRO */}
        <View style={styles.intro}>

          <View style={styles.offerIcon}>
            <Ionicons
              name="pricetag"
              size={35}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.mainTitle}>
            Exclusive Offers
          </Text>

          <Text style={styles.mainSubtitle}>
            Save more on your favourite home services.
            Grab these offers before they expire!
          </Text>

        </View>

        {/* OFFER CARDS */}
        {offers.map((offer) => (
          <View
            key={offer.id}
            style={styles.offerCard}
          >

            {/* IMAGE */}
            <View style={styles.imageContainer}>

              <Image
                source={{
                  uri: offer.image,
                }}
                style={styles.offerImage}
              />

              {/* DISCOUNT BADGE */}
              <View style={styles.discountBadge}>

                <Ionicons
                  name="pricetag"
                  size={14}
                  color="#FFFFFF"
                />

                <Text style={styles.discountText}>
                  {offer.discount}
                </Text>

              </View>

            </View>

            {/* CARD CONTENT */}
            <View style={styles.cardContent}>

              <Text style={styles.offerTitle}>
                {offer.title}
              </Text>

              <Text style={styles.offerSubtitle}>
                {offer.subtitle}
              </Text>

              <Text style={styles.description}>
                {offer.description}
              </Text>

              {/* VALIDITY */}
              <View style={styles.validityRow}>

                <Ionicons
                  name="time-outline"
                  size={16}
                  color="#49769F"
                />

                <Text style={styles.validity}>
                  {offer.validity}
                </Text>

              </View>

              {/* BOOK BUTTON */}
              <Pressable
                style={({ pressed }) => [
                  styles.bookButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {
                  if (onBook) {
                    onBook(offer);
                  }
                }}
              >

                <Text style={styles.bookButtonText}>
                  Book Now
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color="#FFFFFF"
                />

              </Pressable>

            </View>

          </View>
        ))}

        {/* BOTTOM MESSAGE */}
        <View style={styles.bottomCard}>

          <Ionicons
            name="gift-outline"
            size={25}
            color="#49769F"
          />

          <View style={styles.bottomContent}>

            <Text style={styles.bottomTitle}>
              More offers coming soon!
            </Text>

            <Text style={styles.bottomText}>
              Keep checking Sahayak for new discounts
              and exciting deals.
            </Text>

          </View>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  /* =====================================================
     MAIN
  ===================================================== */

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* =====================================================
     HEADER
  ===================================================== */

  header: {
    height: 102,
    paddingTop:30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,

    borderBottomWidth: 1,
    borderBottomColor: '#D6E4EE',

    backgroundColor: '#FFFFFF',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,

    backgroundColor: '#F5F9FC',

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#D6E4EE',
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#111827',
  },

  headerSpacer: {
    width: 42,
  },

  pressedButton: {
    opacity: 0.65,
  },

  /* =====================================================
     CONTENT
  ===================================================== */

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  /* =====================================================
     INTRO
  ===================================================== */

  intro: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 25,
  },

  offerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,

    backgroundColor: '#49769F',

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 14,

    shadowColor: '#49769F',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },

  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },

  mainSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 7,
    paddingHorizontal: 10,
  },

  /* =====================================================
     OFFER CARD
  ===================================================== */

  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,

    overflow: 'hidden',

    borderWidth: 1,
    borderColor: '#D6E4EE',

    shadowColor: '#49769F',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 7,

    elevation: 3,
  },

  /* =====================================================
     IMAGE
  ===================================================== */

  imageContainer: {
    height: 180,
    position: 'relative',
  },

  offerImage: {
    width: '100%',
    height: '100%',
  },

  /* =====================================================
     DISCOUNT
  ===================================================== */

  discountBadge: {
    position: 'absolute',

    top: 14,
    left: 14,

    backgroundColor: '#49769F',

    paddingHorizontal: 12,
    paddingVertical: 8,

    borderRadius: 20,

    flexDirection: 'row',
    alignItems: 'center',
  },

  discountText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 5,
  },

  /* =====================================================
     CARD CONTENT
  ===================================================== */

  cardContent: {
    padding: 17,
  },

  offerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },

  offerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#49769F',
    marginTop: 4,
  },

  description: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginTop: 9,
  },

  /* =====================================================
     VALIDITY
  ===================================================== */

  validityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  validity: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 6,
  },

  /* =====================================================
     BOOK BUTTON
  ===================================================== */

  bookButton: {
    height: 46,

    backgroundColor: '#49769F',

    borderRadius: 12,

    marginTop: 15,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#49769F',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },

  buttonPressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 7,
  },

  /* =====================================================
     BOTTOM CARD
  ===================================================== */

  bottomCard: {
    backgroundColor: '#F5F9FC',

    borderRadius: 17,

    padding: 16,

    flexDirection: 'row',
    alignItems: 'center',

    marginTop: 5,

    borderWidth: 1,
    borderColor: '#D6E4EE',
  },

  bottomContent: {
    flex: 1,
    marginLeft: 12,
  },

  bottomTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  bottomText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 4,
  },

});