/**
 * Client Work Request Form (Public)
 * Allows clients to submit work requests to organisations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { API_ENDPOINTS } from '../../config/api';
import { translate } from '../../utils/translations';
import { useTextToSpeech } from '../../utils/useTextToSpeech';
import VoiceGuidanceButton from '../../components/VoiceGuidanceButton';

const PURPLE = '#49769F';
const LIGHT_PURPLE = '#EEF4F8';
const TEXT = '#111827';
const MUTED = '#6B7280';
const SUCCESS = '#10B981';

let clientWorkRequestIntroSpoken = false;

export default function ClientWorkRequestForm({ go, language = "English" }) {
  const [organisations, setOrganisations] = useState([]);
  const [formData, setFormData] = useState({
    org_id: '',
    client_name: '',
    client_contact: '',
    work_type: '',
    work_description: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const { speak: speakClientWorkRequest, stop: stopClientWorkRequest } = useTextToSpeech(language);

  useEffect(() => {
    if (clientWorkRequestIntroSpoken) {
      return;
    }
    clientWorkRequestIntroSpoken = true;
    const intro = translate('clientWorkRequestAutoIntro', language);
    speakClientWorkRequest(intro);
    return () => {
      stopClientWorkRequest();
    };
  }, [language, speakClientWorkRequest, stopClientWorkRequest]);

  useEffect(() => {
    loadOrganisations();
  }, []);

  const loadOrganisations = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.ORG_LIST);
      const data = await response.json();

      if (data.success) {
        setOrganisations(data.organisations || []);
      }
    } catch (error) {
      console.error('Error loading organisations:', error);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const validateForm = () => {
    const { org_id, client_name, client_contact, work_type, work_description } = formData;

    if (!org_id) {
      Alert.alert(translate('error', language), translate('pleaseSelectOrganisation', language));
      return false;
    }
    if (!client_name.trim()) {
      Alert.alert(translate('error', language), translate('pleaseEnterName', language));
      return false;
    }
    if (!client_contact.trim()) {
      Alert.alert(translate('error', language), translate('pleaseEnterContact', language));
      return false;
    }
    if (client_contact.length < 10) {
      Alert.alert(translate('error', language), translate('validContactNumber', language));
      return false;
    }
    if (!work_type.trim()) {
      Alert.alert(translate('error', language), translate('pleaseEnterWorkType', language));
      return false;
    }
    if (!work_description.trim()) {
      Alert.alert(translate('error', language), translate('pleaseEnterWorkDescription', language));
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.ORG_REQUESTS_CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          org_id: formData.org_id,
          client_name: formData.client_name.trim(),
          client_contact: formData.client_contact.trim(),
          work_type: formData.work_type.trim(),
          work_description: formData.work_description.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          translate('successExclamation', language),
          translate('requestSubmittedBody', language),
          [
            {
              text: translate('ok', language),
              onPress: () => {
                // Reset form
                setFormData({
                  org_id: '',
                  client_name: '',
                  client_contact: '',
                  work_type: '',
                  work_description: '',
                });
              },
            },
          ]
        );
      } else {
        Alert.alert(translate('error', language), data.error || translate('failedToSubmitRequest', language));
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      Alert.alert(translate('error', language), translate('failedSubmitRetry', language));
    } finally {
      setLoading(false);
    }
  };

  if (loadingOrgs) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PURPLE} />
        <Text style={styles.loadingText}>{translate('loadingOrganisations', language)}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => go('welcome')} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translate('requestWorkTitle', language)}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.voiceGuidanceWrap}>
        <VoiceGuidanceButton
          labeled
          text={translate('clientWorkRequestVoiceGuidance', language)}
          language={language}
          title={translate('voiceAssistance', language)}
          subtitle={translate('clientWorkRequestHearHowToUse', language)}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.heroSection}>
            <MaterialCommunityIcons name="clipboard-text" size={64} color={PURPLE} />
            <Text style={styles.heroTitle}>{translate('submitWorkRequestTitle', language)}</Text>
            <Text style={styles.heroText}>
              {translate('connectOrganisationsSub', language)}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>{translate('organisationLabel', language)}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.org_id}
              onValueChange={(value) => setFormData({ ...formData, org_id: value })}
              style={styles.picker}
            >
              <Picker.Item label={translate('selectOrganisation', language)} value="" />
              {organisations.map((org) => (
                <Picker.Item key={org.org_id} label={org.org_name} value={org.org_id} />
              ))}
            </Picker>
          </View>

          <Text style={styles.sectionTitle}>{translate('yourInformation', language)}</Text>

          <InputBox
            icon="account"
            placeholder={translate('yourNamePlaceholder', language)}
            value={formData.client_name}
            onChangeText={(text) => setFormData({ ...formData, client_name: text })}
            autoCapitalize="words"
          />

          <InputBox
            icon="phone"
            placeholder={translate('contactNumber', language) + ' *'}
            value={formData.client_contact}
            onChangeText={(text) => setFormData({ ...formData, client_contact: text })}
            keyboardType="phone-pad"
          />

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{translate('workDetailsSection', language)}</Text>

          <InputBox
            icon="briefcase"
            placeholder={translate('workTypePlaceholder', language)}
            value={formData.work_type}
            onChangeText={(text) => setFormData({ ...formData, work_type: text })}
          />

          <InputBox
            icon="text"
            placeholder={translate('describeWorkPlaceholder', language)}
            value={formData.work_description}
            onChangeText={(text) => setFormData({ ...formData, work_description: text })}
            multiline
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="send" size={24} color="#fff" />
                <Text style={styles.submitButtonText}>{translate('submitRequestButton', language)}</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="information" size={20} color={PURPLE} />
            <Text style={styles.infoText}>
              {translate('requestReviewInfo', language)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// =====================================================
// INPUT BOX COMPONENT
// =====================================================

function InputBox({
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
}) {
  return (
    <View style={styles.inputBox}>
      <MaterialCommunityIcons name={icon} size={22} color={PURPLE} />
      <TextInput
        style={[styles.textInput, multiline && styles.textInputMultiline]}
        placeholder={placeholder}
        placeholderTextColor={MUTED}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: MUTED,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7ED',
  },
  backButton: {
    padding: 8,
  },
  voiceGuidanceWrap: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT,
    marginTop: 16,
    marginBottom: 8,
  },
  heroText: {
    fontSize: 15,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 12,
  },
  pickerContainer: {
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT,
  },
  textInputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: PURPLE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: TEXT,
    lineHeight: 18,
  },
});
