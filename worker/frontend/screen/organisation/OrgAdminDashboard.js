/**
 * Organisation Admin Dashboard
 * Main hub for organisation admins with three tabs:
 * - Work Requests (pending client requests)
 * - Workers (manage org workers)
 * - Performance (worker performance stats)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
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
const DANGER = '#EF4444';
const WARNING = '#F59E0B';

let orgAdminDashboardIntroSpoken = false;

export default function OrgAdminDashboard({ go, language = "English" }) {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'workers', 'performance'
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [workRequests, setWorkRequests] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);

  // VOICE GUIDANCE (TTS) — one-time auto-intro, no STT
  const { speak: speakOrgAdminDashboard, stop: stopOrgAdminDashboard } = useTextToSpeech(language);

  useEffect(() => {
    if (orgAdminDashboardIntroSpoken) {
      return;
    }
    orgAdminDashboardIntroSpoken = true;
    const intro = translate('orgAdminDashboardAutoIntro', language);
    speakOrgAdminDashboard(intro);
    return () => {
      stopOrgAdminDashboard();
    };
  }, [language, speakOrgAdminDashboard, stopOrgAdminDashboard]);

  useEffect(() => {
    loadOrganisationData();
  }, []);

  useEffect(() => {
    // Load tab-specific data when tab changes
    if (activeTab === 'requests') {
      loadWorkRequests();
    } else if (activeTab === 'workers') {
      loadWorkers();
    } else if (activeTab === 'performance') {
      loadPerformance();
    }
  }, [activeTab]);

  const loadOrganisationData = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (!token) {
        Alert.alert(translate('error', language), translate('pleaseLogInAgain', language));
        go('login');
        return;
      }

      // Fetch user's organisation
      const response = await fetch(API_ENDPOINTS.ORG_WORKERS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success && data.results && data.results.length > 0) {
        // Get org_id from first worker (they all belong to same org)
        const orgId = data.results[0].org_id;
        setOrgData({ org_id: orgId });
      }

    } catch (error) {
      console.error('Error loading organisation:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkRequests = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      const response = await fetch(`${API_ENDPOINTS.ORG_REQUESTS}?status=pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data.results && Array.isArray(data.results)) {
        list = data.results;
      } else if (data.work_requests && Array.isArray(data.work_requests)) {
        list = data.work_requests;
      }
      const pendingList = list.filter(r => (r.status || '').toLowerCase() === 'pending');
      setWorkRequests(pendingList);
    } catch (error) {
      console.error('Error loading work requests:', error);
    }
  };

  const loadWorkers = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      const response = await fetch(API_ENDPOINTS.ORG_WORKERS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success || Array.isArray(data.results)) {
        setWorkers(data.results || []);
      }
    } catch (error) {
      console.error('Error loading workers:', error);
    }
  };

  const loadPerformance = async () => {
    try {
      if (!orgData?.org_id) return;
      
      const token = await AsyncStorage.getItem('access_token');
      
      const response = await fetch(API_ENDPOINTS.ORG_PERFORMANCE(orgData.org_id), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setPerformanceData(data.workers || []);
      }
    } catch (error) {
      console.error('Error loading performance:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrganisationData();
    if (activeTab === 'requests') {
      await loadWorkRequests();
    } else if (activeTab === 'workers') {
      await loadWorkers();
    } else if (activeTab === 'performance') {
      await loadPerformance();
    }
    setRefreshing(false);
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      const response = await fetch(API_ENDPOINTS.ORG_REQUEST_ACCEPT(requestId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setWorkRequests(prev => prev.filter(r => r.id !== requestId));
        Alert.alert(translate('success', language), translate('workRequestAcceptedMsg', language));
        loadWorkRequests();
      } else {
        Alert.alert(translate('error', language), data.error || translate('failedAcceptRequest', language));
      }
    } catch (error) {
      Alert.alert(translate('error', language), translate('failedAcceptRequest', language));
    }
  };

  const handleRejectRequest = async (requestId) => {
    Alert.alert(
      translate('rejectRequest', language),
      translate('confirmRejectMessage', language),
      [
        { text: translate('cancel', language), style: 'cancel' },
        {
          text: translate('reject', language),
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('access_token');
              
              const response = await fetch(API_ENDPOINTS.ORG_REQUEST_REJECT(requestId), {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              const data = await response.json();
              
              if (data.success) {
                setWorkRequests(prev => prev.filter(r => r.id !== requestId));
                Alert.alert(translate('success', language), translate('workRequestRejected', language));
                loadWorkRequests();
              } else {
                Alert.alert(translate('error', language), data.error || translate('failedRejectRequest', language));
              }
            } catch (error) {
              Alert.alert(translate('error', language), translate('failedRejectRequest', language));
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PURPLE} />
        <Text style={styles.loadingText}>{translate('loadingOrganisation', language)}</Text>
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
        <Text style={styles.headerTitle}>{translate('orgDashboardTitle', language)}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <MaterialCommunityIcons
            name="clipboard-text"
            size={20}
            color={activeTab === 'requests' ? PURPLE : MUTED}
          />
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            {translate('tabRequests', language)}
          </Text>
          {workRequests.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{workRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'workers' && styles.activeTab]}
          onPress={() => setActiveTab('workers')}
        >
          <MaterialCommunityIcons
            name="account-group"
            size={20}
            color={activeTab === 'workers' ? PURPLE : MUTED}
          />
          <Text style={[styles.tabText, activeTab === 'workers' && styles.activeTabText]}>
            {translate('workers', language)}
          </Text>
          {workers.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{workers.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'performance' && styles.activeTab]}
          onPress={() => setActiveTab('performance')}
        >
          <MaterialCommunityIcons
            name="chart-line"
            size={20}
            color={activeTab === 'performance' ? PURPLE : MUTED}
          />
          <Text style={[styles.tabText, activeTab === 'performance' && styles.activeTabText]}>
            {translate('performance', language)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Voice Guidance */}
      <View style={styles.voiceGuidanceWrap}>
        <VoiceGuidanceButton
          labeled
          text={translate('orgAdminDashboardVoiceGuidance', language)}
          language={language}
          title={translate('voiceAssistance', language)}
          subtitle={translate('orgAdminDashboardHearHowToUse', language)}
        />
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PURPLE]} />
        }
      >
        {activeTab === 'requests' && (
          <WorkRequestsTab
            requests={workRequests}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
            onAssign={(requestId) => go('orgAssignWork', { requestId })}
            go={go}
            language={language}
          />
        )}

        {activeTab === 'workers' && (
          <WorkersTab
            workers={workers}
            onAddWorker={() => go('orgAddWorker')}
            onWorkerPress={(workerId) => go('orgWorkerDetails', { workerId })}
            language={language}
          />
        )}

        {activeTab === 'performance' && (
          <PerformanceTab
            performanceData={performanceData}
            onWorkerPress={(workerId) => go('orgWorkerPerformance', { workerId })}
            language={language}
          />
        )}
      </ScrollView>
    </View>
  );
}

// =====================================================
// WORK REQUESTS TAB
// =====================================================

function WorkRequestsTab({ requests, onAccept, onReject, onAssign, go, language = "English" }) {
  if (requests.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={MUTED} />
        <Text style={styles.emptyTitle}>{translate('noPendingRequestsTitle', language)}</Text>
        <Text style={styles.emptyText}>
          {translate('workRequestsWillAppear', language)}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>{translate('pendingRequestsTitle', language)} ({requests.length})</Text>
      {requests.map((request) => (
        <View key={request.id} style={styles.requestCard}>
          <View style={styles.requestHeader}>
            <View style={styles.requestInfo}>
              <Text style={styles.requestClient}>{request.client_name}</Text>
              <Text style={styles.requestType}>{request.work_type}</Text>
            </View>
            <View style={[styles.statusBadge, styles.pendingBadge]}>
              <Text style={styles.statusText}>{translate('pendingStatus', language)}</Text>
            </View>
          </View>

          <Text style={styles.requestDescription} numberOfLines={2}>
            {request.work_description}
          </Text>

          <View style={styles.requestMeta}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="phone" size={16} color={MUTED} />
              <Text style={styles.metaText}>{request.client_contact}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={MUTED} />
              <Text style={styles.metaText}>
                {new Date(request.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.requestActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => onReject(request.id)}
            >
              <MaterialCommunityIcons name="close" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>{translate('reject', language)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => onAccept(request.id)}
            >
              <MaterialCommunityIcons name="check" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>{translate('accept', language)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.viewAcceptedButton}
        onPress={() => go('orgAcceptedRequests')}
      >
        <Text style={styles.viewAcceptedText}>{translate('viewAcceptedRequests', language)}</Text>
        <MaterialCommunityIcons name="arrow-right" size={20} color={PURPLE} />
      </TouchableOpacity>
    </View>
  );
}

// =====================================================
// WORKERS TAB
// =====================================================

function WorkersTab({ workers, onAddWorker, onWorkerPress, language = "English" }) {
  return (
    <View style={styles.tabContent}>
      <TouchableOpacity style={styles.addButton} onPress={onAddWorker}>
        <MaterialCommunityIcons name="account-plus" size={24} color="#fff" />
        <Text style={styles.addButtonText}>{translate('addWorker', language)}</Text>
      </TouchableOpacity>

      {workers.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="account-group-outline" size={64} color={MUTED} />
          <Text style={styles.emptyTitle}>{translate('noWorkersYetTitle', language)}</Text>
          <Text style={styles.emptyText}>
            {translate('addWorkersToGetStarted', language)}
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>{translate('workers', language)} ({workers.length})</Text>
          {workers.map((worker) => (
            <TouchableOpacity
              key={worker.id}
              style={styles.workerCard}
              onPress={() => onWorkerPress(worker.id)}
            >
              <View style={styles.workerAvatar}>
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

              <MaterialCommunityIcons name="chevron-right" size={24} color={MUTED} />
            </TouchableOpacity>
          ))}
        </>
      )}
    </View>
  );
}

// =====================================================
// PERFORMANCE TAB
// =====================================================

function PerformanceTab({ performanceData, onWorkerPress, language = "English" }) {
  if (performanceData.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="chart-line-variant" size={64} color={MUTED} />
        <Text style={styles.emptyTitle}>{translate('noPerformanceDataTitle', language)}</Text>
        <Text style={styles.emptyText}>
          {translate('addWorkersAssignJobsMetrics', language)}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>{translate('workerPerformanceTitle', language)}</Text>
      {performanceData.map((worker) => (
        <TouchableOpacity
          key={worker.worker_id}
          style={styles.performanceCard}
          onPress={() => onWorkerPress(worker.worker_id)}
        >
          <View style={styles.performanceHeader}>
            <View style={styles.workerAvatar}>
              <Text style={styles.workerInitials}>
                {worker.worker_name.split(' ')[0][0]}
                {worker.worker_name.split(' ')[1]?.[0] || ''}
              </Text>
            </View>
            <View style={styles.performanceInfo}>
              <Text style={styles.performanceName}>{worker.worker_name}</Text>
              <Text style={styles.performancePhone}>{worker.worker_phone}</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{worker.total_assigned}</Text>
              <Text style={styles.statLabel}>{translate('assigned', language)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: WARNING }]}>{worker.in_progress}</Text>
              <Text style={styles.statLabel}>{translate('in_progress', language)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: SUCCESS }]}>{worker.completed}</Text>
              <Text style={styles.statLabel}>{translate('completed', language)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: MUTED }]}>{worker.pending}</Text>
              <Text style={styles.statLabel}>{translate('pendingStatus', language)}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: LIGHT_PURPLE,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: MUTED,
  },
  activeTabText: {
    color: PURPLE,
  },
  badge: {
    backgroundColor: DANGER,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 16,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestClient: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 4,
  },
  requestType: {
    fontSize: 14,
    color: PURPLE,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  requestDescription: {
    fontSize: 14,
    color: TEXT,
    lineHeight: 20,
    marginBottom: 12,
  },
  requestMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: MUTED,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: SUCCESS,
  },
  rejectButton: {
    backgroundColor: DANGER,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  viewAcceptedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
    gap: 8,
  },
  viewAcceptedText: {
    fontSize: 15,
    fontWeight: '600',
    color: PURPLE,
  },
  addButton: {
    backgroundColor: PURPLE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  workerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
  performanceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  performanceInfo: {
    flex: 1,
  },
  performanceName: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 4,
  },
  performancePhone: {
    fontSize: 13,
    color: MUTED,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: LIGHT_PURPLE,
    paddingVertical: 12,
    borderRadius: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: PURPLE,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: MUTED,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
