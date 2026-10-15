import React, { useState } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';


/* =====================================================
   WORKERS - Removed hardcoded data
   Now fetched from real API via service search
===================================================== */

// Workers are now fetched dynamically when user searches for Plumbing service
// See: WorkRequestScreen.js and Availaiblescreen.js for real API integration
// User should search for "Plumber" to find real workers from database


/* =====================================================
   MAIN SCREEN
===================================================== */

export default function Plumbingscreen({
  onBack,
}) {
  const [liked, setLiked] = useState(false);


  /* ===================================================
     SHARE
  =================================================== */

  const handleShare = () => {
    console.log('Share plumbing service');
  };


  return (
    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* =====================================================
            HEADER
        ===================================================== */}

        <View style={styles.header}>

          {/* BACK */}

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


          {/* TITLE */}

          <Text
            style={styles.headerTitle}
            numberOfLines={1}
          >
            Plumbing Services
          </Text>


          {/* HEADER ICONS */}

          <View style={styles.headerIcons}>

            {/* FAVOURITE */}

            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.pressedButton,
              ]}
              onPress={() =>
                setLiked(!liked)
              }
            >
              <Ionicons
                name={
                  liked
                    ? 'heart'
                    : 'heart-outline'
                }
                size={22}
                color={
                  liked
                    ? '#E85D75'
                    : '#111827'
                }
              />
            </Pressable>


            {/* SHARE */}

            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.pressedButton,
              ]}
              onPress={handleShare}
            >
              <Ionicons
                name="share-social-outline"
                size={22}
                color="#111827"
              />
            </Pressable>

          </View>

        </View>


        {/* =====================================================
            IMAGE SLIDER
        ===================================================== */}

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.sliderContent
          }
          style={styles.slider}
        >

          <Image
            source={{
              uri:
                'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=900',
            }}
            style={styles.sliderImage}
          />

          <Image
            source={{
              uri:
                'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=900',
            }}
            style={styles.sliderImage}
          />

          <Image
            source={{
              uri:
                'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=900',
            }}
            style={styles.sliderImage}
          />

        </ScrollView>


        {/* =====================================================
            SERVICE INTRO
        ===================================================== */}

        <View style={styles.introSection}>

          <View style={styles.serviceTag}>

            <Ionicons
              name="construct-outline"
              size={15}
              color="#49769F"
            />

            <Text style={styles.serviceTagText}>
              Professional Service
            </Text>

          </View>


          <Text style={styles.serviceTitle}>
            Reliable Plumbing Services
          </Text>


          <Text style={styles.serviceSubtitle}>
            Trusted plumbers for quick and reliable
            repairs at your doorstep.
          </Text>

        </View>


        {/* =====================================================
            WHY CHOOSE US
        ===================================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Why choose us
          </Text>


          <View style={styles.featureRow}>

            {/* VERIFIED */}

            <View style={styles.featureBox}>

              <View style={styles.featureIcon}>

                <Ionicons
                  name="shield-checkmark"
                  size={22}
                  color="#49769F"
                />

              </View>

              <Text style={styles.featureText}>
                Verified Plumbers
              </Text>

            </View>


            {/* QUICK REPAIRS */}

            <View style={styles.featureBox}>

              <View style={styles.featureIcon}>

                <Ionicons
                  name="flash"
                  size={22}
                  color="#49769F"
                />

              </View>

              <Text style={styles.featureText}>
                Quick Repairs
              </Text>

            </View>


            {/* TOP RATED */}

            <View style={styles.featureBox}>

              <View style={styles.featureIcon}>

                <Ionicons
                  name="star"
                  size={22}
                  color="#49769F"
                />

              </View>

              <Text style={styles.featureText}>
                Top Rated
              </Text>

            </View>

          </View>

        </View>


        {/* =====================================================
            DESCRIPTION
        ===================================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Description
          </Text>

          <Text style={styles.description}>
            Professional plumbing services including pipe leakage
            repair, blocked drain cleaning, tap installation, sink
            fitting, bathroom fittings, and emergency plumbing
            solutions. Our verified plumbers ensure reliable and
            timely service at your doorstep.
          </Text>

        </View>


        {/* =====================================================
            SERVICES INCLUDED
        ===================================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Services included
          </Text>


          <View style={styles.servicesCard}>

            <ServiceItem
              icon="water-outline"
              text="Pipe leakage repair"
            />

            <ServiceItem
              icon="funnel-outline"
              text="Blocked drain cleaning"
            />

            <ServiceItem
              icon="water"
              text="Tap & faucet installation"
            />

            <ServiceItem
              icon="home-outline"
              text="Bathroom fittings"
            />

            <ServiceItem
              icon="construct-outline"
              text="Emergency plumbing"
              last
            />

          </View>

        </View>


        {/* =====================================================
            EXPLORE WORKERS
        ===================================================== */}

        <View style={styles.section}>

          <View style={styles.workerHeadingRow}>

            <Text style={styles.sectionTitle}>
              Explore Workers
            </Text>

            <Text style={styles.workerCount}>
              {workers.length} available
            </Text>

          </View>


          {workers.map((worker) => (

            <View
              key={worker.id}
              style={styles.workerCard}
            >

              {/* WORKER IMAGE */}

              <Image
                source={{
                  uri: worker.image,
                }}
                style={styles.workerImage}
              />


              {/* WORKER INFORMATION */}

              <View style={styles.workerInfo}>

                <Text
                  style={styles.workerName}
                  numberOfLines={1}
                >
                  {worker.name}
                </Text>


                {/* RATING */}

                <View style={styles.ratingRow}>

                  <Ionicons
                    name="star"
                    size={14}
                    color="#F59E0B"
                  />

                  <Text style={styles.ratingText}>
                    {worker.rating}
                  </Text>

                  <View style={styles.dot} />

                  <Text style={styles.ratingText}>
                    {worker.experience}
                  </Text>

                </View>


                {/* PRICE */}

                <Text style={styles.price}>
                  Starting from {worker.price}
                </Text>

              </View>

            </View>

          ))}

        </View>


        {/* =====================================================
            TRUST CARD
        ===================================================== */}

        <View style={styles.trustCard}>

          <View style={styles.trustIcon}>

            <Ionicons
              name="shield-checkmark"
              size={25}
              color="#49769F"
            />

          </View>


          <View style={styles.trustInfo}>

            <Text style={styles.trustTitle}>
              Safe & verified service
            </Text>

            <Text style={styles.trustSubtitle}>
              All workers are verified before providing
              services through our platform.
            </Text>

          </View>

        </View>


      </ScrollView>

    </SafeAreaView>
  );
}


/* =====================================================
   SERVICE ITEM
===================================================== */

function ServiceItem({
  icon,
  text,
  last = false,
}) {
  return (
    <View
      style={[
        styles.serviceItem,
        last && styles.lastServiceItem,
      ]}
    >

      <View style={styles.serviceItemIcon}>

        <Ionicons
          name={icon}
          size={18}
          color="#49769F"
        />

      </View>


      <Text style={styles.serviceItemText}>
        {text}
      </Text>


      <Ionicons
        name="checkmark-circle"
        size={20}
        color="#49769F"
      />

    </View>
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

  scrollContent: {
    paddingBottom: 35,
  },


  /* =====================================================
     HEADER
  ===================================================== */

  header: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 20,

    height: 102,

    paddingTop: 30,

    paddingBottom: 12,
  },

  backButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: '#F3F4F6',

    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    flex: 1,

    textAlign: 'center',

    fontSize: 20,

    fontWeight: '700',

    color: '#111827',

    marginHorizontal: 10,
  },

  headerIcons: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  iconButton: {
    width: 40,
    height: 40,

    borderRadius: 20,

    backgroundColor: '#F3F4F6',

    justifyContent: 'center',
    alignItems: 'center',

    marginLeft: 7,
  },

  pressedButton: {
    opacity: 0.65,

    transform: [
      {
        scale: 0.94,
      },
    ],
  },


  /* =====================================================
     IMAGE SLIDER
  ===================================================== */

  slider: {
    marginTop: 5,
  },

  sliderContent: {
    paddingLeft: 20,
    paddingRight: 5,
  },

  sliderImage: {
    width: 320,
    height: 220,

    borderRadius: 20,

    marginRight: 15,
  },


  /* =====================================================
     INTRO
  ===================================================== */

  introSection: {
    paddingHorizontal: 20,

    marginTop: 22,
  },

  serviceTag: {
    alignSelf: 'flex-start',

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#EAF3FA',

    paddingHorizontal: 11,
    paddingVertical: 6,

    borderRadius: 20,
  },

  serviceTagText: {
    color: '#49769F',

    fontSize: 11,

    fontWeight: '700',

    marginLeft: 5,
  },

  serviceTitle: {
    fontSize: 25,

    fontWeight: '800',

    color: '#111827',

    marginTop: 12,
  },

  serviceSubtitle: {
    fontSize: 14,

    lineHeight: 21,

    color: '#64748B',

    marginTop: 6,
  },


  /* =====================================================
     SECTIONS
  ===================================================== */

  section: {
    paddingHorizontal: 20,

    marginTop: 27,
  },

  sectionTitle: {
    fontSize: 21,

    fontWeight: '700',

    color: '#111827',

    marginBottom: 15,
  },


  /* =====================================================
     FEATURES
  ===================================================== */

  featureRow: {
    flexDirection: 'row',

    justifyContent: 'space-between',
  },

  featureBox: {
    width: '31%',

    backgroundColor: '#F8FAFC',

    borderRadius: 16,

    paddingVertical: 15,
    paddingHorizontal: 5,

    alignItems: 'center',

    borderWidth: 1,

    borderColor: '#E5E7EB',
  },

  featureIcon: {
    width: 43,
    height: 43,

    borderRadius: 14,

    backgroundColor: '#EAF3FA',

    justifyContent: 'center',
    alignItems: 'center',
  },

  featureText: {
    marginTop: 9,

    fontSize: 11,

    textAlign: 'center',

    color: '#374151',

    fontWeight: '600',
  },


  /* =====================================================
     DESCRIPTION
  ===================================================== */

  description: {
    fontSize: 14,

    lineHeight: 23,

    color: '#4B5563',
  },


  /* =====================================================
     SERVICES
  ===================================================== */

  servicesCard: {
    backgroundColor: '#F8FAFC',

    borderRadius: 17,

    paddingHorizontal: 15,

    borderWidth: 1,

    borderColor: '#E5E7EB',
  },

  serviceItem: {
    minHeight: 55,

    flexDirection: 'row',

    alignItems: 'center',

    borderBottomWidth: 1,

    borderBottomColor: '#E5E7EB',
  },

  lastServiceItem: {
    borderBottomWidth: 0,
  },

  serviceItemIcon: {
    width: 35,
    height: 35,

    borderRadius: 11,

    backgroundColor: '#EAF3FA',

    justifyContent: 'center',
    alignItems: 'center',
  },

  serviceItemText: {
    flex: 1,

    marginLeft: 11,

    fontSize: 13,

    fontWeight: '600',

    color: '#374151',
  },


  /* =====================================================
     WORKERS
  ===================================================== */

  workerHeadingRow: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',
  },

  workerCount: {
    fontSize: 12,

    color: '#64748B',

    marginBottom: 15,
  },

  workerCard: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#F8FAFC',

    borderRadius: 18,

    padding: 13,

    marginBottom: 13,

    borderWidth: 1,

    borderColor: '#E5E7EB',
  },

  workerImage: {
    width: 62,
    height: 62,

    borderRadius: 31,
  },

  workerInfo: {
    flex: 1,

    marginLeft: 12,

    marginRight: 8,
  },

  workerName: {
    fontSize: 16,

    fontWeight: '700',

    color: '#111827',
  },


  /* =====================================================
     RATING
  ===================================================== */

  ratingRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 5,
  },

  ratingText: {
    marginLeft: 4,

    color: '#6B7280',

    fontSize: 12,
  },

  dot: {
    width: 3,
    height: 3,

    borderRadius: 2,

    backgroundColor: '#9CA3AF',

    marginHorizontal: 6,
  },


  /* =====================================================
     PRICE
  ===================================================== */

  price: {
    marginTop: 5,

    fontSize: 12,

    fontWeight: '700',

    color: '#49769F',
  },


  /* =====================================================
     TRUST CARD
  ===================================================== */

  trustCard: {
    marginHorizontal: 20,

    marginTop: 10,

    backgroundColor: '#F0F7F9',

    borderRadius: 17,

    padding: 15,

    flexDirection: 'row',

    alignItems: 'center',
  },

  trustIcon: {
    width: 45,
    height: 45,

    borderRadius: 14,

    backgroundColor: '#EAF3FA',

    justifyContent: 'center',
    alignItems: 'center',
  },

  trustInfo: {
    flex: 1,

    marginLeft: 11,
  },

  trustTitle: {
    fontSize: 13,

    fontWeight: '700',

    color: '#374151',
  },

  trustSubtitle: {
    fontSize: 11,

    color: '#6B7280',

    lineHeight: 17,

    marginTop: 3,
  },

});