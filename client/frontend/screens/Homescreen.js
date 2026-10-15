import React from 'react';

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
import { translate } from '../utils/translations';


/* =====================================================
   WORKERS - Removed hardcoded data
   Now fetched from real API via worker search
===================================================== */

// Workers are now fetched dynamically when user searches for a service
// See: Availaiblescreen.js for real API integration


/* =====================================================
   MAIN SCREEN
===================================================== */

export default function Homescreen({ onBack, language = "english" }) {
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

          {/* BACK BUTTON */}

          <Pressable
            style={styles.backButton}
            onPress={onBack}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#111827"
            />
          </Pressable>


          {/* RIGHT ICONS */}

          <View style={styles.headerRight}>

            <Pressable
              style={styles.iconButton}
            >
              <Ionicons
                name="heart-outline"
                size={22}
                color="#111827"
              />
            </Pressable>


            <Pressable
              style={styles.iconButton}
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
            TITLE
        ===================================================== */}

        <Text style={styles.title}>
          {translate(language, 'homeCleaning')}
        </Text>


        {/* =====================================================
            IMAGE SLIDER
        ===================================================== */}

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.slider}
        >

          <Image
            source={{
              uri:
                'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900',
            }}
            style={styles.sliderImage}
          />

          <Image
            source={{
              uri:
                'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=900',
            }}
            style={styles.sliderImage}
          />

          <Image
            source={{
              uri:
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900',
            }}
            style={styles.sliderImage}
          />

        </ScrollView>


        {/* =====================================================
            WHY CHOOSE US
        ===================================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            {translate(language, 'whyChooseUs')}
          </Text>

          <View style={styles.featureRow}>

            {/* VERIFIED */}

            <View style={styles.featureBox}>

              <Ionicons
                name="shield-checkmark"
                size={22}
                color="#49769F"
              />

              <Text style={styles.featureText}>
                {translate(language, 'verifiedWorkers')}
              </Text>

            </View>


            {/* TOP RATED */}

            <View style={styles.featureBox}>

              <Ionicons
                name="star"
                size={22}
                color="#49769F"
              />

              <Text style={styles.featureText}>
                {translate(language, 'topRated')}
              </Text>

            </View>


            {/* ON TIME */}

            <View style={styles.featureBox}>

              <Ionicons
                name="time"
                size={22}
                color="#49769F"
              />

              <Text style={styles.featureText}>
                {translate(language, 'onTime')}
              </Text>

            </View>

          </View>

        </View>


        {/* =====================================================
            DESCRIPTION
        ===================================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            {translate(language, 'description')}
          </Text>

          <Text style={styles.description}>
            {translate(language, 'homeCleaningDescription')}
          </Text>

        </View>


        {/* =====================================================
            EXPLORE WORKERS
        ===================================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            {translate(language, 'exploreWorkers')}
          </Text>


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
                    {worker.rating} • {worker.experience}
                  </Text>

                </View>


                {/* PRICE */}

                <Text style={styles.price}>
                  {worker.price}
                </Text>

              </View>

            </View>

          ))}

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}


/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({

  /* =====================================================
     CONTAINER
  ===================================================== */

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    paddingBottom: 30,
  },


  /* =====================================================
     HEADER
  ===================================================== */

  header: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    paddingHorizontal: 20,

    height: 102,

    paddingTop: 30,
  },

  backButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: '#F3F4F6',

    justifyContent: 'center',

    alignItems: 'center',
  },

  headerRight: {
    flexDirection: 'row',
  },

  iconButton: {
    width: 40,
    height: 40,

    borderRadius: 20,

    backgroundColor: '#F3F4F6',

    justifyContent: 'center',

    alignItems: 'center',

    marginLeft: 10,
  },


  /* =====================================================
     TITLE
  ===================================================== */

  title: {
    fontSize: 28,

    fontWeight: '700',

    color: '#111827',

    paddingHorizontal: 20,

    marginTop: 15,

    marginBottom: 15,
  },


  /* =====================================================
     IMAGE SLIDER
  ===================================================== */

  slider: {
    paddingLeft: 20,
  },

  sliderImage: {
    width: 320,

    height: 220,

    borderRadius: 20,

    marginRight: 15,
  },


  /* =====================================================
     SECTION
  ===================================================== */

  section: {
    paddingHorizontal: 20,

    marginTop: 25,
  },

  sectionTitle: {
    fontSize: 22,

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
    width: '30%',

    backgroundColor: '#F8FAFC',

    borderRadius: 16,

    paddingVertical: 18,

    alignItems: 'center',

    borderWidth: 1,

    borderColor: '#E5E7EB',
  },

  featureText: {
    marginTop: 8,

    fontSize: 12,

    textAlign: 'center',

    color: '#374151',

    fontWeight: '600',
  },


  /* =====================================================
     DESCRIPTION
  ===================================================== */

  description: {
    fontSize: 15,

    lineHeight: 24,

    color: '#4B5563',
  },


  /* =====================================================
     WORKER CARD
  ===================================================== */

  workerCard: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#F8FAFC',

    borderRadius: 18,

    padding: 15,

    marginBottom: 15,

    borderWidth: 1,

    borderColor: '#E5E7EB',
  },

  workerImage: {
    width: 60,

    height: 60,

    borderRadius: 30,
  },

  workerInfo: {
    flex: 1,

    marginLeft: 15,

    marginRight: 8,
  },

  workerName: {
    fontSize: 17,

    fontWeight: '700',

    color: '#111827',
  },


  /* =====================================================
     RATING
  ===================================================== */

  ratingRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 4,
  },

  ratingText: {
    marginLeft: 5,

    color: '#6B7280',

    fontSize: 13,
  },


  /* =====================================================
     PRICE
  ===================================================== */

  price: {
    marginTop: 6,

    fontSize: 16,

    fontWeight: '700',

    color: '#4E8EA2',
  },

});