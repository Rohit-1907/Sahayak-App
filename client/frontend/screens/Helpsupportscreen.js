import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

export default function HelpSupportScreen({
  onBack,
  onChatbot,
  onCall,
  onReportIssue,
  onFeedback,
  onSuggestions,
}) {
  const supportOptions = [
    {
      id: 1,
      title: 'AI Chatbot',
      subtitle: 'Get instant answers to your questions',
      icon: 'chatbubbles-outline',
      onPress: onChatbot,
    },
    {
      id: 2,
      title: 'Call Support',
      subtitle: 'Talk to our support team',
      icon: 'call-outline',
      onPress: onCall,
    },
    {
      id: 3,
      title: 'Report an Issue',
      subtitle: 'Report a problem with a service or booking',
      icon: 'warning-outline',
      onPress: onReportIssue,
    },
    {
      id: 4,
      title: 'Feedback',
      subtitle: 'Share your experience with us',
      icon: 'star-outline',
      onPress: onFeedback,
    },
    {
      id: 5,
      title: 'Suggestions',
      subtitle: 'Help us improve Sahayak',
      icon: 'bulb-outline',
      onPress: onSuggestions,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <View style={styles.header}>

        <Pressable
          style={styles.backButton}
          onPress={onBack}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#2A2A2A"
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Help & Support
        </Text>

        {/* Keeps title centered */}
        <View style={styles.headerSpace} />

      </View>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* =====================================================
            INTRO
        ===================================================== */}

        <View style={styles.introContainer}>

          <View style={styles.helpIcon}>
            <Ionicons
              name="help-circle-outline"
              size={42}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.heading}>
            How can we help you?
          </Text>

          <Text style={styles.description}>
            Choose an option below and we'll help you
            resolve your question or issue.
          </Text>

        </View>


        {/* =====================================================
            SUPPORT OPTIONS
        ===================================================== */}

        <View style={styles.optionsContainer}>

          {supportOptions.map((item) => (

            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.supportCard,
                pressed && styles.cardPressed,
              ]}
              onPress={item.onPress}
            >

              {/* ICON */}

              <View style={styles.iconContainer}>

                <Ionicons
                  name={item.icon}
                  size={25}
                  color="#4E8EA2"
                />

              </View>


              {/* TEXT */}

              <View style={styles.cardContent}>

                <Text style={styles.cardTitle}>
                  {item.title}
                </Text>

                <Text style={styles.cardSubtitle}>
                  {item.subtitle}
                </Text>

              </View>


              {/* ARROW */}

              <Ionicons
                name="chevron-forward"
                size={21}
                color="#9CA3AF"
              />

            </Pressable>

          ))}

        </View>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <View style={styles.footerCard}>

          <Ionicons
            name="shield-checkmark-outline"
            size={24}
            color="#4E8EA2"
          />

          <View style={styles.footerTextContainer}>

            <Text style={styles.footerTitle}>
              We're here to help
            </Text>

            <Text style={styles.footerSubtitle}>
              Your feedback helps us make Sahayak
              better for everyone.
            </Text>

          </View>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}


/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  /* =====================================================
     CONTAINER
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
    borderBottomColor: '#E5E7EB',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,

    backgroundColor: '#F8FAFC',

    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#2A2A2A',
  },

  headerSpace: {
    width: 42,
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

  introContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 30,
  },

  helpIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,

    backgroundColor: '#49769F',

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 18,
  },

  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2A2A2A',

    textAlign: 'center',
  },

  description: {
    fontSize: 14,
    color: '#6B7280',

    textAlign: 'center',
    lineHeight: 21,

    marginTop: 8,
    paddingHorizontal: 20,
  },


  /* =====================================================
     SUPPORT OPTIONS
  ===================================================== */

  optionsContainer: {
    gap: 14,
  },

  supportCard: {
    minHeight: 82,

    backgroundColor: '#FFFFFF',

    borderRadius: 17,

    borderWidth: 1,
    borderColor: '#E5E7EB',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 15,
    paddingVertical: 14,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.05,
    shadowRadius: 5,

    elevation: 2,
  },

  cardPressed: {
    opacity: 0.7,
  },


  /* =====================================================
     OPTION ICON
  ===================================================== */

  iconContainer: {
    width: 50,
    height: 50,

    borderRadius: 15,

    backgroundColor: '#EAF4F7',

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 14,
  },


  /* =====================================================
     OPTION TEXT
  ===================================================== */

  cardContent: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A2A2A',
  },

  cardSubtitle: {
    fontSize: 12.5,
    color: '#6B7280',

    marginTop: 5,
    lineHeight: 18,
  },


  /* =====================================================
     FOOTER
  ===================================================== */

  footerCard: {
    marginTop: 28,

    backgroundColor: '#F8FAFC',

    borderRadius: 17,

    padding: 18,

    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  footerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  footerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A2A2A',
  },

  footerSubtitle: {
    fontSize: 12.5,
    color: '#6B7280',

    marginTop: 4,
    lineHeight: 18,
  },

});