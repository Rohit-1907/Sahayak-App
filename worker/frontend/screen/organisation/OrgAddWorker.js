/**
 * Add Organisation Worker Screen
 * Form to add new workers with auto-generated credentials
 * Password formula: org_id + first_name + birth_year
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
  Platform,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../../config/api';
import { translate } from '../../utils/translations';
import { useTextToSpeech } from '../../utils/useTextToSpeech';
import VoiceGuidanceButton from '../../components/VoiceGuidanceButton';

const PURPLE = '#49769F';
const LIGHT_PURPLE = '#EEF4F8';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E0E7ED';
const SUCCESS = '#10B981';

export default function OrgAddWorker({ go, language = "English" }) {
  const [orgId, setOrgId] = useState('');
  const [numberOfWorkers, setNumberOfWorkers] = useState('');
  const [workers, setWorkers] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState({ visible: false, workerIndex: null });
  const [generatedCredentials, setGeneratedCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  // VOICE GUIDANCE (TTS)
  const { speak: speakOrgAddWorker, stop: stopOrgAddWorker } = useTextToSpeech(language);

  useEffect(() => {
    const introText = translate('orgAddWorkerAutoIntro', language);
    speakOrgAddWorker(introText);
    return () => {
      stopOrgAddWorker();
    };
  }, [language, speakOrgAddWorker, stopOrgAddWorker]);

  useEffect(() => {
    loadOrgId();
  }, []);

  const loadOrgId = async () => {
    try {
      // First try to get org_id from AsyncStorage (stored during registration)
      const storedOrgId = await AsyncStorage.getItem('org_id');
      
      if (storedOrgId) {
        console.log('[OK] Found org_id in storage:', storedOrgId);
        setOrgId(storedOrgId);
        return;
      }
      
      // If not found, try to fetch from user data
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('User data:', user);
        
        if (user.registration_number) {
          console.log('[OK] Found registration_number in user data:', user.registration_number);
          setOrgId(user.registration_number);
          // Store it for next time
          await AsyncStorage.setItem('org_id', user.registration_number);
          return;
        }
      }
      
      // If still not found, show error
      console.error('[FAIL] No org_id found in storage or user data');
      Alert.alert(
        translate('setupRequired', language),
        translate('orgIdNotFoundLogout', language),
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Error loading org ID:', error);
      Alert.alert(
        translate('error', language),
        translate('failedToLoadOrgData', language)
      );
    }
  };

  const handleNumberChange = (text) => {
    // Only allow numbers
    const num = text.replace(/[^0-9]/g, '');
    setNumberOfWorkers(num);
    
    if (num && parseInt(num) > 0) {
      // Generate empty worker forms
      const count = parseInt(num);
      const newWorkers = Array.from({ length: count }, () => ({
        first_name: '',
        last_name: '',
        dob: new Date(2000, 0, 1),
        address: '',
        experience: '',
        email: '',
        phone_number: '',
      }));
      setWorkers(newWorkers);
    } else {
      setWorkers([]);
    }
  };

  const updateWorker = (index, field, value) => {
    const updatedWorkers = [...workers];
    updatedWorkers[index][field] = value;
    setWorkers(updatedWorkers);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker({ visible: false, workerIndex: null });
    if (selectedDate && showDatePicker.workerIndex !== null) {
      updateWorker(showDatePicker.workerIndex, 'dob', selectedDate);
    }
  };

  const validateForm = () => {
    if (workers.length === 0) {
      Alert.alert(translate('error', language), translate('pleaseEnterWorkerCountFirst', language));
      return false;
    }

    for (let i = 0; i < workers.length; i++) {
      const worker = workers[i];
      const workerNum = i + 1;
      const workerLabel = `${translate('worker', language)} ${workerNum}`;

      if (!worker.first_name.trim()) {
        Alert.alert(translate('error', language), `${workerLabel}: ${translate('pleaseEnterFirstName', language)}`);
        return false;
      }
      if (!worker.last_name.trim()) {
        Alert.alert(translate('error', language), `${workerLabel}: ${translate('pleaseEnterLastName', language)}`);
        return false;
      }
      if (!worker.address.trim()) {
        Alert.alert(translate('error', language), `${workerLabel}: ${translate('pleaseEnterWorkerAddress', language)}`);
        return false;
      }
      if (!worker.experience.trim()) {
        Alert.alert(translate('error', language), `${workerLabel}: ${translate('pleaseEnterWorkerExperience', language)}`);
        return false;
      }
      if (!worker.email.trim()) {
        Alert.alert(translate('error', language), `${workerLabel}: ${translate('pleaseEnterWorkerEmail', language)}`);
        return false;
      }
      if (!worker.phone_number.trim()) {
        Alert.alert(translate('error', language), `${workerLabel}: ${translate('pleaseEnterWorkerPhone', language)}`);
        return false;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(worker.email)) {
        Alert.alert(translate('error', language), `${workerLabel}: ${translate('pleaseEnterValidWorkerEmail', language)}`);
        return false;
      }

      // Phone validation
      if (worker.phone_number.length < 10) {
        Alert.alert(translate('error', language), `${workerLabel}: ${translate('pleaseEnterValidWorkerPhone', language)}`);
        return false;
      }
    }

    return true;
  };

  const handleGenerateAndSave = async () => {
    if (!validateForm()) return;
    if (!orgId) {
      Alert.alert(translate('error', language), translate('orgIdNotFoundTryAgain', language));
      return;
    }

    setLoading(true);
    const allCredentials = [];
    let successCount = 0;
    let failedWorkers = [];

    try {
      const token = await AsyncStorage.getItem('access_token');

      // Loop through all workers and save them
      for (let i = 0; i < workers.length; i++) {
        const worker = workers[i];
        const workerNum = i + 1;

        try {
          // Format date as YYYY-MM-DD
          const dobFormatted = worker.dob.toISOString().split('T')[0];

          const payload = {
            org_id: orgId,
            first_name: worker.first_name.trim(),
            last_name: worker.last_name.trim(),
            dob: dobFormatted,
            address: worker.address.trim(),
            experience: worker.experience.trim(),
            email: worker.email.trim().toLowerCase(),
            phone_number: worker.phone_number.trim(),
          };

          console.log(`Adding worker ${workerNum}:`, payload);

          const response = await fetch(API_ENDPOINTS.ORG_WORKERS_ADD, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          const data = await response.json();

          if (data.success) {
            allCredentials.push({
              workerNumber: workerNum,
              name: `${worker.first_name} ${worker.last_name}`,
              ...data.credentials,
            });
            successCount++;
          } else {
            // Extract detailed error message
            let errorMsg = data.error || 'Unknown error';
            
            // If validation errors exist, format them
            if (data.errors) {
              const errors = data.errors;
              const errorDetails = [];
              
              if (errors.phone_number) {
                errorDetails.push(`Phone: ${errors.phone_number[0]}`);
              }
              if (errors.email) {
                errorDetails.push(`Email: ${errors.email[0]}`);
              }
              if (errors.org_id) {
                errorDetails.push(`Org: ${errors.org_id[0]}`);
              }
              
              if (errorDetails.length > 0) {
                errorMsg = errorDetails.join(', ');
              }
            }
            
            failedWorkers.push({
              workerNumber: workerNum,
              name: `${worker.first_name} ${worker.last_name}`,
              error: errorMsg,
            });
          }
        } catch (error) {
          console.error(`Error adding worker ${workerNum}:`, error);
          failedWorkers.push({
            workerNumber: workerNum,
            name: `${worker.first_name} ${worker.last_name}`,
            error: error.message,
          });
        }
      }

      // Show results
      if (successCount > 0) {
        setGeneratedCredentials(allCredentials);
        setShowCredentialsModal(true);
      }

      if (failedWorkers.length > 0) {
        const failedList = failedWorkers
          .map(w => `${translate('worker', language)} ${w.workerNumber} (${w.name}): ${w.error}`)
          .join('\n');
        
        Alert.alert(
          translate('partialSuccess', language),
          `${successCount} ${translate('workerPartialFailed', language)}\n\n${failedList}`,
        );
      }

    } catch (error) {
      console.error('Error adding workers:', error);
      Alert.alert(translate('error', language), translate('failedToAddWorkers', language));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCredentials = () => {
    setShowCredentialsModal(false);
    // Reset form
    setNumberOfWorkers('');
    setWorkers([]);
    setGeneratedCredentials([]);
    // Go back to home
    go('home');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => go('orgAdminDashboard')} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translate('addWorker', language)}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Number of Workers Input */}
          <View style={styles.numberSection}>
            <Text style={styles.sectionTitle}>{translate('howManyWorkersToAdd', language)}</Text>

            {/* VOICE GUIDANCE (TTS) */}
            <View style={{ marginBottom: 16 }}>
              <VoiceGuidanceButton
                labeled
                text={translate('orgAddWorkerVoiceGuidance', language)}
                language={language}
                title={translate('voiceAssistance', language)}
                subtitle={translate('orgAddWorkerHearHowToUse', language)}
              />
            </View>
            <View style={styles.numberInputBox}>
              <MaterialCommunityIcons name="account-multiple-plus" size={24} color={PURPLE} />
              <TextInput
                style={styles.numberInput}
                placeholder={translate('enterNumberOfWorkers', language)}
                placeholderTextColor={MUTED}
                value={numberOfWorkers}
                onChangeText={handleNumberChange}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
            {workers.length > 0 && (
              <Text style={styles.workerCountText}>
                {workers.length} {workers.length > 1 ? translate('workerFormsGenerated', language) : translate('workerFormGenerated', language)}
              </Text>
            )}
          </View>

          {/* Dynamic Worker Forms */}
          {workers.map((worker, index) => (
            <View key={index} style={styles.workerCard}>
              <View style={styles.workerCardHeader}>
                <MaterialCommunityIcons name="account" size={24} color={PURPLE} />
                <Text style={styles.workerCardTitle}>{translate('worker', language)} {index + 1}</Text>
              </View>

              <InputBox
                icon="account"
                placeholder={`${translate('firstName', language)} *`}
                value={worker.first_name}
                onChangeText={(text) => updateWorker(index, 'first_name', text)}
                autoCapitalize="words"
              />

              <InputBox
                icon="account"
                placeholder={`${translate('lastName', language)} *`}
                value={worker.last_name}
                onChangeText={(text) => updateWorker(index, 'last_name', text)}
                autoCapitalize="words"
              />

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker({ visible: true, workerIndex: index })}
              >
                <MaterialCommunityIcons name="calendar" size={22} color={PURPLE} />
                <Text style={styles.dateText}>
                  {translate('dateOfBirth', language)}: {worker.dob.toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              <InputBox
                icon="map-marker"
                placeholder={`${translate('address', language)} *`}
                value={worker.address}
                onChangeText={(text) => updateWorker(index, 'address', text)}
                multiline
              />

              <InputBox
                icon="briefcase"
                placeholder={`${translate('experienceEgExpert', language)} *`}
                value={worker.experience}
                onChangeText={(text) => updateWorker(index, 'experience', text)}
              />

              <InputBox
                icon="email"
                placeholder={`${translate('email', language)} *`}
                value={worker.email}
                onChangeText={(text) => updateWorker(index, 'email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <InputBox
                icon="phone"
                placeholder={`${translate('phoneNumber', language)} *`}
                value={worker.phone_number}
                onChangeText={(text) => updateWorker(index, 'phone_number', text)}
                keyboardType="phone-pad"
              />
            </View>
          ))}

          {showDatePicker.visible && (
            <DateTimePicker
              value={workers[showDatePicker.workerIndex]?.dob || new Date(2000, 0, 1)}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          {workers.length > 0 && (
            <>
              <TouchableOpacity
                style={[styles.generateButton, loading && styles.disabledButton]}
                onPress={handleGenerateAndSave}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.generateButtonText}>{translate('savingWorkers', language)}</Text>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons name="key-plus" size={24} color="#fff" />
                    <Text style={styles.generateButtonText}>
                      {translate('generateCredentialsAndSaveAll', language)}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <Text style={styles.noteText}>
                {translate('autoGenNote', language)}
              </Text>
            </>
          )}
        </View>
      </ScrollView>

      {/* Credentials Modal */}
      <Modal
        visible={showCredentialsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseCredentials}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="check-circle" size={48} color={SUCCESS} />
              <Text style={styles.modalTitle}>
                {generatedCredentials.length} {generatedCredentials.length > 1 ? translate('workers', language) : translate('worker', language)} {translate('workersAddedSuccessfully', language)}
              </Text>
            </View>

            <ScrollView style={styles.credentialsScrollView}>
              {generatedCredentials.map((cred, index) => (
                <View key={index} style={styles.credentialsBox}>
                  <Text style={styles.credentialsTitle}>{translate('worker', language)} {cred.workerNumber}: {cred.name}</Text>

                  <View style={styles.credentialItem}>
                    <Text style={styles.credentialLabel}>{translate('usernameLabel', language)}</Text>
                    <Text style={[styles.credentialValue, styles.credentialCode]}>
                      {cred.username}
                    </Text>
                  </View>

                  <View style={styles.credentialItem}>
                    <Text style={styles.credentialLabel}>{translate('password', language)}</Text>
                    <Text style={[styles.credentialValue, styles.credentialCode]}>
                      {cred.password}
                    </Text>
                  </View>
                </View>
              ))}

              <Text style={styles.credentialsNote}>
                {translate('saveCredentialsShareWithWorkers', language)}
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCloseCredentials}
            >
              <Text style={styles.modalButtonText}>{translate('done', language)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  secureTextEntry = false,
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
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backButton: {
    padding: 8,
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
    padding: 16,
  },
  numberSection: {
    marginBottom: 32,
  },
  numberInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: PURPLE,
  },
  numberInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
  },
  workerCountText: {
    fontSize: 14,
    color: SUCCESS,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  workerCard: {
    backgroundColor: '#FAFBFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  workerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  workerCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: PURPLE,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 16,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT,
  },
  textInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    gap: 12,
  },
  dateText: {
    fontSize: 15,
    color: TEXT,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: TEXT,
  },
  infoValue: {
    fontWeight: '700',
    color: PURPLE,
  },
  generateButton: {
    backgroundColor: PURPLE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  noteText: {
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT,
    marginTop: 12,
    textAlign: 'center',
  },
  credentialsScrollView: {
    maxHeight: 400,
  },
  credentialsBox: {
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  credentialsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 12,
    textAlign: 'center',
  },
  credentialsNote: {
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 18,
  },
  credentialItem: {
    marginBottom: 16,
  },
  credentialLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: MUTED,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  credentialValue: {
    fontSize: 16,
    color: TEXT,
    fontWeight: '600',
  },
  credentialCode: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  passwordFormulaBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  formulaLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  formulaText: {
    fontSize: 13,
    color: '#92400E',
    marginBottom: 4,
  },
  formulaExample: {
    fontSize: 12,
    color: '#B45309',
    fontStyle: 'italic',
  },
  modalButton: {
    backgroundColor: PURPLE,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
