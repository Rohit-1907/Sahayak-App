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

const electricians = [
  {
    id: 1,
    name: 'Aditya Kulkarni',
    rating: '4.9',
    experience: '7 years',
    price: 'Rs. 599',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
  },

  {
    id: 2,
    name: 'Nikhil Patil',
    rating: '4.8',
    experience: '5 years',
    price: 'Rs. 549',
    image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300',
  },

  {
    id: 3,
    name: 'Sagar More',
    rating: '5.0',
    experience: '9 years',
    price: 'Rs. 699',
    image:
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=300',
  },
];

export default function ElectricianScreen({ onBack }) {
  return (
    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
            Electrician Services
          </Text>


          {/* HEADER ICONS */}

          <View style={styles.headerIcons}>

            {/* FAVOURITE */}

            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Ionicons
                name="heart-outline"
                size={22}
                color="#111827"
              />
            </Pressable>


            {/* SHARE */}

            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.pressedButton,
              ]}
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
          style={styles.slider}
          contentContainerStyle={styles.sliderContent}
        >

          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=900',
            }}
            style={styles.sliderImage}
          />

          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900',
            }}
            style={styles.sliderImage}
          />

          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900',
            }}
            style={styles.sliderImage}
          />

        </ScrollView>


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

              <View style={styles.featureIconCircle}>

                <Ionicons
                  name="shield-checkmark"
                  size={22}
                  color="#49769F"
                />

              </View>

              <Text style={styles.featureText}>
                Verified Electricians
              </Text>

            </View>


            {/* QUICK SERVICE */}

            <View style={styles.featureBox}>

              <View style={styles.featureIconCircle}>

                <Ionicons
                  name="flash"
                  size={22}
                  color="#49769F"
                />

              </View>

              <Text style={styles.featureText}>
                Quick Service
              </Text>

            </View>


            {/* TOP RATED */}

            <View style={styles.featureBox}>

              <View style={styles.featureIconCircle}>

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

          <View style={styles.descriptionCard}>

            <Ionicons
              name="flash-outline"
              size={24}
              color="#49769F"
              style={styles.descriptionIcon}
            />

            <Text style={styles.description}>
              Professional electrician services for fan installation,
              light fitting, switchboard repair, wiring, inverter setup,
              appliance connections, and emergency electrical repairs.
              Our certified electricians ensure safe and reliable
              service at your doorstep.
            </Text>

          </View>

        </View>


        {/* =====================================================
            EXPLORE ELECTRICIANS
        ===================================================== */}

        <View style={styles.section}>

          <View style={styles.exploreHeader}>

            <Text style={styles.sectionTitle}>
              Explore Electricians
            </Text>

            <Text style={styles.workerCount}>
              {electricians.length} available
            </Text>

          </View>


          {electricians.map((worker) => (

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


const styles = StyleSheet.create({

  /* =========================================================
     CONTAINER
  ========================================================= */

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    paddingBottom: 30,
  },


  /* =========================================================
     HEADER
  ========================================================= */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 10,
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

    fontSize: 21,
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

    marginLeft: 8,
  },


  /* =========================================================
     IMAGE SLIDER
  ========================================================= */

  slider: {
    marginTop: 10,
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

    backgroundColor: '#E5E7EB',
  },


  /* =========================================================
     SECTION
  ========================================================= */

  section: {
    paddingHorizontal: 20,
    marginTop: 26,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '700',

    color: '#111827',

    marginBottom: 15,
  },


  /* =========================================================
     WHY CHOOSE US
  ========================================================= */

  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  featureBox: {
    width: '31%',
    minHeight: 115,

    backgroundColor: '#F8FAFC',

    borderRadius: 16,

    paddingVertical: 15,
    paddingHorizontal: 7,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  featureIconCircle: {
    width: 45,
    height: 45,

    borderRadius: 23,

    backgroundColor: '#EAF3F8',

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 8,
  },

  featureText: {
    fontSize: 11.5,

    textAlign: 'center',

    color: '#374151',

    fontWeight: '600',

    lineHeight: 16,
  },


  /* =========================================================
     DESCRIPTION
  ========================================================= */

  descriptionCard: {
    backgroundColor: '#F8FAFC',

    borderRadius: 17,

    borderWidth: 1,

    borderColor: '#E5E7EB',

    padding: 16,

    flexDirection: 'row',

    alignItems: 'flex-start',
  },

  descriptionIcon: {
    marginRight: 10,
    marginTop: 2,
  },

  description: {
    flex: 1,

    fontSize: 14,

    lineHeight: 23,

    color: '#4B5563',
  },


  /* =========================================================
     EXPLORE HEADER
  ========================================================= */

  exploreHeader: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',
  },

  workerCount: {
    fontSize: 12,

    color: '#6B7280',

    marginBottom: 15,
  },


  /* =========================================================
     WORKER CARD
  ========================================================= */

  workerCard: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#F8FAFC',

    borderRadius: 18,

    padding: 14,

    marginBottom: 14,

    borderWidth: 1,

    borderColor: '#E5E7EB',
  },

  workerImage: {
    width: 62,
    height: 62,

    borderRadius: 31,

    backgroundColor: '#E5E7EB',
  },

  workerInfo: {
    flex: 1,

    marginLeft: 13,

    marginRight: 8,
  },

  workerName: {
    fontSize: 16,

    fontWeight: '700',

    color: '#111827',
  },


  /* =========================================================
     RATING
  ========================================================= */

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


  /* =========================================================
     PRICE
  ========================================================= */

  price: {
    marginTop: 6,

    fontSize: 15,

    fontWeight: '700',

    color: '#4E8EA2',
  },


  /* =========================================================
     PRESS EFFECT
  ========================================================= */

  pressedButton: {
    opacity: 0.65,
  },

});