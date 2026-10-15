/**
 * Organisation Work Assignment Screen
 * Assign accepted work request to one or more org workers
 * Shows work details + list of workers with selection
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

let orgAssignWorkIntroSpoken = false;

export default function OrgAssignWork({ go, requestId, language = "English" }) {
  const [workRequest, setWorkRequest] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const { speak: speakOrgAssignWork, stop: stopOrgAssignWork } = useTextToSpeech(language);

  useEffect(() => {
    if (orgAssignWorkIntroSpoken) {
      return;
    }
    orgAssignWorkIntroSpoken = true;
    const intro = translate('orgAssignWorkAutoIntro', language);
    speakOrgAssignWork(intro);
    return () => {
      stopOrgAssignWork();
    };
  }, [language, speakOrgAssignWork, stopOrgAssignWork]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');

      // Load work request details and organisation workers in parallel
      const [requestResponse, workersResponse] = await Promise.all([
        fetch(`${API_ENDPOINTS.ORG_REQUESTS}${requestId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${API_ENDPOINTS.ORG_WORKERS}?page_size=100`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      const [requestData, workersData] = await Promise.all([
        requestResponse.json(),
        workersResponse.json(),
      ]);

      if (requestData) {
        setWorkRequest(requestData);
      }

      if (workersData.success || Array.isArray(workersData.results)) {
        setWorkers(workersData.results || []);
      } else if (Array.isArray(workersData)) {
        setWorkers(workersData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert(translate('error', language), translate('failedToLoadData', language));
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkerSelection = (workerId) => {
    if (selectedWorkers.includes(workerId)) {
      setSelectedWorkers(selectedWorkers.filter((id) => id !== workerId));
    } else {
      setSelectedWorkers([...selectedWorkers, workerId]);
    }
  };

  const handleAssign = async () => {
    if (selectedWorkers.length === 0) {
      Alert.alert(translate('error', language), translate('selectAtLeastOneWorker', language));
      return;
    }

    setAssigning(true);

    try {
      const token = await AsyncStorage.getItem('access_token');

      const response = await fetch(API_ENDPOINTS.ORG_ASSIGN_WORK, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: requestId,
          worker_ids: selectedWorkers,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          translate('successExclamation', language),
          translate('workAssignedNotifications', language).replace('{{count}}', String(selectedWorkers.length)),
          [{ text: translate('ok', language), onPress: () => go('home') }]
        );
      } else {
        Alert.alert(translate('error', language), data.error || translate('failedToAssignWork', language));
      }
    } catch (error) {
      console.error('Error assigning work:', error);
      Alert.alert(translate('error', language), translate('failedToAssignWorkRetry', language));
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PURPLE} />
        <Text style={styles.loadingText}>{translate('loadingData', language)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => go('home')} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translate('assignWorkTitle', language)}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.voiceGuidanceWrap}>
        <VoiceGuidanceButton
          labeled
          text={translate('orgAssignWorkVoiceGuidance', language)}
          language={language}
          title={translate('voiceAssistance', language)}
          subtitle={translate('orgAssignWorkHearHowToUse', language)}
        />
      </View>

      <ScrollView style={styles.content}>
        {/* Work Request Details */}
        {workRequest && (
          <View style={styles.requestCard}>
            <Text style={styles.cardTitle}>{translate('workRequestDetailsTitle', language)}</Text>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="account" size={20} color={MUTED} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{translate('client', language)}</Text>
                <Text style={styles.detailValue}>{workRequest.client_name}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="phone" size={20} color={MUTED} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{translate('contactLabel', language)}</Text>
                <Text style={styles.detailValue}>{workRequest.client_contact}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="briefcase" size={20} color={MUTED} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{translate('workTypeLabel', language)}</Text>
                <Text style={styles.detailValue}>{workRequest.work_type}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="text" size={20} color={MUTED} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{translate('description', language)}</Text>
                <Text style={styles.detailValue}>{workRequest.work_description}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Worker Selection */}
        <View style={styles.workersSection}>
          <Text style={styles.sectionTitle}>
            {translate('selectWorkersCount', language).replace('{{count}}', String(selectedWorkers.length))}
          </Text>

          {workers.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-group-outline" size={48} color={MUTED} />
              <Text style={styles.emptyText}>{translate('noWorkersAvailable', language)}</Text>
            </View>
          ) : (
            workers.map((worker) => (
              <TouchableOpacity
                key={worker.id}
                style={[
                  styles.workerCard,
                  selectedWorkers.includes(worker.id) && styles.workerCardSelected,
                ]}
                onPress={() => toggleWorkerSelection(worker.id)}
                activeOpacity={0.7}
              >
                <View style={styles.workerLeft}>
                  <View
                    style={[
                      styles.workerAvatar,
                      selectedWorkers.includes(worker.id) && styles.workerAvatarSelected,
                    ]}
                  >
                    <Text style={styles.workerInitials}>
                      {worker.first_name[0]}{worker.last_name[0]}
                    </Text>
                  </View>
                  <View style={styles.workerInfo}>
                    <Text style={styles.workerName}>{worker.full_name}</Text>
                    <View style={styles.workerMeta}>
                      <MaterialCommunityIcons name="phone" size={14} color={MUTED} />
                      <Text style={styles.workerMetaText}>{worker.phone_number}</Text>
                    </View>
                    <View style={styles.workerMeta}>
                      <MaterialCommunityIcons name="briefcase" size={14} color={MUTED} />
                      <Text style={styles.workerMetaText}>{worker.experience}</Text>
                    </View>
                  </View>
                </View>
                <View
                  style={[
                    styles.checkbox,
                    selectedWorkers.includes(worker.id) && styles.checkboxSelected,
                  ]}
                >
                  {selectedWorkers.includes(worker.id) && (
                    <MaterialCommunityIcons name="check" size={18} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Assign Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.assignButton,
            (selectedWorkers.length === 0 || assigning) && styles.disabledButton,
          ]}
          onPress={handleAssign}
          disabled={selectedWorkers.length === 0 || assigning}
        >
          {assigning ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="account-check" size={24} color="#fff" />
              <Text style={styles.assignButtonText}>
                {selectedWorkers.length === 1
                  ? translate('assignToWorker', language).replace('{{count}}', String(selectedWorkers.length))
                  : translate('assignToWorkers', language).replace('{{count}}', String(selectedWorkers.length))}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  voiceGuidanceWrap: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  content: {
    flex: 1,
  },
  requestCard: {
    backgroundColor: LIGHT_PURPLE,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: MUTED,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: TEXT,
    lineHeight: 20,
  },
  workersSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: MUTED,
    marginTop: 12,
  },
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: BORDER,
  },
  workerCardSelected: {
    borderColor: PURPLE,
    backgroundColor: LIGHT_PURPLE,
  },
  workerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: MUTED + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerAvatarSelected: {
    backgroundColor: PURPLE,
  },
  workerInitials: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 4,
  },
  workerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  workerMetaText: {
    fontSize: 13,
    color: MUTED,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  assignButton: {
    backgroundColor: PURPLE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
