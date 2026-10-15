import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

export default function ReportIssueScreen({ onBack }) {
  const [selectedIssue, setSelectedIssue] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const issueTypes = [
    {
      id: 'payment',
      title: 'Payment Issue',
      icon: 'card-outline',
    },
    {
      id: 'worker',
      title: 'Worker Issue',
      icon: 'person-outline',
    },
    {
      id: 'booking',
      title: 'Booking Issue',
      icon: 'calendar-outline',
    },
    {
      id: 'service',
      title: 'Service Issue',
      icon: 'construct-outline',
    },
    {
      id: 'other',
      title: 'Other',
      icon: 'ellipsis-horizontal-circle-outline',
    },
  ];

  const handleSubmit = async () => {
    if (!selectedIssue) {
      Alert.alert(
        'Select Issue Type',
        'Please select the type of issue you want to report.'
      );
      return;
    }

    if (!bookingId.trim()) {
      Alert.alert(
        'Booking ID Required',
        'Please enter your booking ID.'
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        'Description Required',
        'Please describe your issue in detail.'
      );
      return;
    }

    try {
      setSubmitting(true);
      
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'Please login to submit an issue report');
        return;
      }

      console.log('[NOTE] Submitting issue report...');
      console.log('   Type:', selectedIssue);
      console.log('   Booking ID:', bookingId || 'N/A');

      const response = await fetch(
        `${API_BASE_URL}/api/v1/jobs/issue-reports/create/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            issue_type: selectedIssue,
            booking_id: bookingId.trim(),
            description: description.trim(),
          }),
        }
      );

      const data = await response.json();
      console.log('[DATA] Issue report response:', data);

      if (response.ok && data.success) {
        Alert.alert(
          'Issue Reported Successfully',
          'Thank you for bringing this to our attention. Our support team will review your issue and reach out to you as soon as possible to help resolve it.',
          [
            {
              text: 'OK',
              onPress: onBack,
            },
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to submit issue report');
      }
    } catch (error) {
      console.error('[FAIL] Error submitting issue:', error);
      Alert.alert('Error', 'Failed to submit issue report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ================= HEADER ================= */}

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
            color={COLORS.dark}
          />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Report an Issue
          </Text>

          <Text style={styles.headerSubtitle}>
            We're here to help
          </Text>
        </View>

        <View style={styles.headerSpacer} />

      </View>

      {/* ================= CONTENT ================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >

        {/* ================= INTRO ================= */}

        <View style={styles.intro}>

          <View style={styles.iconCircle}>
            <Ionicons
              name="warning-outline"
              size={36}
              color={COLORS.white}
            />
          </View>

          <Text style={styles.title}>
            What went wrong?
          </Text>

          <Text style={styles.subtitle}>
            Tell us about the problem and we'll help
            you resolve it as quickly as possible.
          </Text>

        </View>

        {/* ================= ISSUE TYPE ================= */}

        <Text style={styles.sectionTitle}>
          Select Issue Type
        </Text>

        <View style={styles.issueGrid}>

          {issueTypes.map((item) => {
            const selected = selectedIssue === item.id;

            return (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.issueCard,
                  selected && styles.selectedIssueCard,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => setSelectedIssue(item.id)}
              >

                <View
                  style={[
                    styles.issueIconCircle,
                    selected && styles.selectedIssueIconCircle,
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={23}
                    color={
                      selected
                        ? COLORS.white
                        : COLORS.secondary
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.issueText,
                    selected && styles.selectedIssueText,
                  ]}
                >
                  {item.title}
                </Text>

                {selected && (
                  <View style={styles.checkIcon}>
                    <Ionicons
                      name="checkmark"
                      size={13}
                      color={COLORS.secondary}
                    />
                  </View>
                )}

              </Pressable>
            );
          })}

        </View>

        {/* ================= BOOKING ID ================= */}

        <Text style={styles.sectionTitle}>
          Booking ID
        </Text>

        <View style={styles.inputContainer}>

          <View style={styles.inputIcon}>
            <Ionicons
              name="receipt-outline"
              size={20}
              color={COLORS.primary}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Enter your booking ID"
            placeholderTextColor={COLORS.placeholder}
            value={bookingId}
            onChangeText={setBookingId}
          />

        </View>

        {/* ================= DESCRIPTION ================= */}

        <Text style={styles.sectionTitle}>
          Describe Your Issue
        </Text>

        <View style={styles.textAreaContainer}>

          <TextInput
            style={styles.textArea}
            placeholder="Please describe what happened..."
            placeholderTextColor={COLORS.placeholder}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />

          <View style={styles.characterRow}>

            <Ionicons
              name="create-outline"
              size={14}
              color={COLORS.muted}
            />

            <Text style={styles.characterCount}>
              {description.length}/500
            </Text>

          </View>

        </View>

        {/* ================= IMPORTANT INFO ================= */}

        <View style={styles.infoCard}>

          <View style={styles.infoIcon}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.infoContent}>

            <Text style={styles.infoTitle}>
              Important Information
            </Text>

            <Text style={styles.infoText}>
              Our support team reviews all reports and will contact you within 24-48 hours to help resolve your issue.
            </Text>

          </View>

        </View>

        {/* ================= SUBMIT ================= */}

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.submitButtonPressed,
            submitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={submitting}
        >

          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <View style={styles.submitIcon}>
                <Ionicons
                  name="send-outline"
                  size={18}
                  color={COLORS.white}
                />
              </View>

              <Text style={styles.submitText}>
                Submit Issue
              </Text>

              <Ionicons
                name="arrow-forward"
                size={19}
                color={COLORS.white}
                style={styles.submitArrow}
              />
            </>
          )}

        </Pressable>

        {/* ================= FOOTER ================= */}

        <View style={styles.footer}>

          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color={COLORS.secondary}
          />

          <Text style={styles.footerText}>
            Your information is safe with Sahayak
          </Text>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}

/* =====================================================
   COLOURS
===================================================== */

const COLORS = {
  primary: '#49769F',
  secondary: '#4E8EA2',
  dark: '#2A2A2A',
  white: '#FFFFFF',

  background: '#F7FAFC',
  softBlue: '#EAF3F7',
  softBlue2: '#EEF6F9',

  border: '#E5E7EB',
  muted: '#6B7280',
  placeholder: '#9CA3AF',

  error: '#EF4444',
};

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({

  /* ================= CONTAINER ================= */

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* ================= HEADER ================= */

  header: {
    height: 102,
    paddingTop:30,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,

    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.softBlue,

    justifyContent: 'center',
    alignItems: 'center',
  },

  backButtonPressed: {
    transform: [{ scale: 0.92 }],
    backgroundColor: '#DCECF2',
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
  },

  headerSubtitle: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 3,
  },

  headerSpacer: {
    width: 44,
  },

  /* ================= CONTENT ================= */

  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 45,
  },

  /* ================= INTRO ================= */

  intro: {
    alignItems: 'center',
    marginBottom: 27,
  },

  iconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: COLORS.secondary,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 16,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.dark,
  },

  subtitle: {
    fontSize: 13.5,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 7,
    paddingHorizontal: 12,
  },

  /* ================= SECTION ================= */

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 12,
    marginTop: 8,
  },

  /* ================= ISSUE GRID ================= */

  issueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  issueCard: {
    width: '48%',
    minHeight: 104,

    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,

    backgroundColor: COLORS.white,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 12,

    position: 'relative',

    shadowColor: '#000',
    shadowOpacity: 0.025,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 1,
  },

  selectedIssueCard: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,

    shadowOpacity: 0.08,
    elevation: 3,
  },

  cardPressed: {
    transform: [{ scale: 0.97 }],
  },

  issueIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,

    backgroundColor: COLORS.softBlue,

    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedIssueIconCircle: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  issueText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginTop: 9,
    textAlign: 'center',
  },

  selectedIssueText: {
    color: COLORS.white,
  },

  checkIcon: {
    position: 'absolute',
    top: 7,
    right: 7,

    width: 21,
    height: 21,
    borderRadius: 11,

    backgroundColor: COLORS.white,

    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ================= INPUT ================= */

  inputContainer: {
    minHeight: 57,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 12,

    marginBottom: 18,
  },

  inputIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,

    backgroundColor: COLORS.softBlue2,

    justifyContent: 'center',
    alignItems: 'center',
  },

  input: {
    flex: 1,

    fontSize: 14,
    color: COLORS.dark,

    marginLeft: 10,

    minHeight: 55,
  },

  /* ================= TEXT AREA ================= */

  textAreaContainer: {
    height: 150,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,

    padding: 13,

    marginBottom: 16,
  },

  textArea: {
    flex: 1,

    fontSize: 14,
    color: COLORS.dark,

    lineHeight: 21,
  },

  characterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  characterCount: {
    fontSize: 11,
    color: COLORS.muted,
    marginLeft: 5,
  },

  /* ================= INFO CARD ================= */

  infoCard: {
    backgroundColor: COLORS.softBlue,

    borderRadius: 16,

    padding: 14,

    flexDirection: 'row',
    alignItems: 'flex-start',

    borderWidth: 1,
    borderColor: '#D8E8EF',

    marginBottom: 20,
  },

  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,

    backgroundColor: COLORS.white,

    justifyContent: 'center',
    alignItems: 'center',
  },

  infoContent: {
    flex: 1,
    marginLeft: 10,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 3,
  },

  infoText: {
    fontSize: 12,
    color: COLORS.muted,
    lineHeight: 18,
  },

  /* ================= SUBMIT ================= */

  submitButton: {
    height: 58,

    backgroundColor: COLORS.dark,

    borderRadius: 16,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  submitButtonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#202020',
  },

  submitButtonDisabled: {
    opacity: 0.6,
  },

  submitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,

    backgroundColor: COLORS.secondary,

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 9,
  },

  submitText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },

  submitArrow: {
    marginLeft: 10,
  },

  /* ================= FOOTER ================= */

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 23,
  },

  footerText: {
    fontSize: 11.5,
    color: '#9CA3AF',
    marginLeft: 6,
  },

});
