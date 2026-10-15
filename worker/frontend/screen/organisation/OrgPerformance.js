import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../../config/api';
import { translate } from '../../utils/translations';
import { useTextToSpeech } from '../../utils/useTextToSpeech';
import VoiceGuidanceButton from '../../components/VoiceGuidanceButton';

const COLORS = {
  PRIMARY: '#6C63FF',
  SUCCESS: '#4CAF50',
  WARNING: '#FF9800',
  DANGER: '#F44336',
  TEXT: '#2C3E50',
  TEXT_LIGHT: '#7F8C8D',
  BACKGROUND: '#F8F9FA',
  WHITE: '#FFFFFF',
  BORDER: '#E1E8ED',
};

let orgPerformanceIntroSpoken = false;

export default function OrgPerformance({ go, language = "English" }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orgId, setOrgId] = useState('');

  const { speak: speakOrgPerformance, stop: stopOrgPerformance } = useTextToSpeech(language);

  useEffect(() => {
    if (orgPerformanceIntroSpoken) {
      return;
    }
    orgPerformanceIntroSpoken = true;
    const intro = translate('orgPerformanceAutoIntro', language);
    speakOrgPerformance(intro);
    return () => {
      stopOrgPerformance();
    };
  }, [language, speakOrgPerformance, stopOrgPerformance]);

  useEffect(() => {
    loadOrgIdAndWorkers();
  }, []);

  const loadOrgIdAndWorkers = async () => {
    try {
      const storedOrgId = await AsyncStorage.getItem('org_id');
      if (storedOrgId) {
        setOrgId(storedOrgId);
        fetchWorkers(storedOrgId);
      }
    } catch (error) {
      console.error('Error loading org ID:', error);
      setLoading(false);
    }
  };

  const fetchWorkers = async (org_id) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      
      console.log('[TEAM] Fetching workers for org:', org_id);
      console.log('[AUTH] Token exists:', !!token);

      const response = await fetch(`${API_ENDPOINTS.ORG_WORKERS}?org_id=${org_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[API] Response status:', response.status);
      
      const data = await response.json();
      console.log('[RES] Workers data:', data);
      
      if (data.results) {
        console.log('[OK] Found workers:', data.results.length);
        setWorkers(data.results);
      } else if (Array.isArray(data)) {
        console.log('[OK] Found workers (array):', data.length);
        setWorkers(data);
      } else {
        console.log('[WARN] No results field, setting empty');
        setWorkers([]);
      }
    } catch (error) {
      console.error('[FAIL] Error fetching workers:', error);
      Alert.alert(translate('error', language), translate('failedToLoadWorkers', language));
      setWorkers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (orgId) {
      fetchWorkers(orgId);
    }
  };

  const viewWorkerPerformance = (worker) => {
    go('workerPerformance', { workerId: worker.id, workerName: worker.full_name });
  };

  const renderWorkerCard = ({ item }) => (
    <TouchableOpacity
      style={styles.workerCard}
      onPress={() => viewWorkerPerformance(item)}
      activeOpacity={0.7}
    >
      <View style={styles.workerHeader}>
        <View style={styles.avatarCircle}>
          <MaterialCommunityIcons name="account" size={32} color={COLORS.PRIMARY} />
        </View>
        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>{item.full_name}</Text>
          <Text style={styles.workerExperience}>{item.experience}</Text>
          <View style={styles.contactRow}>
            <MaterialCommunityIcons name="phone" size={14} color={COLORS.TEXT_LIGHT} />
            <Text style={styles.contactText}>{item.phone_number}</Text>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.TEXT_LIGHT} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="clipboard-check" size={20} color={COLORS.SUCCESS} />
          <Text style={styles.statLabel}>{translate('tapToViewPerformance', language)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => go('home')} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translate('workerPerformanceTitle', language)}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.voiceGuidanceWrap}>
        <VoiceGuidanceButton
          labeled
          text={translate('orgPerformanceVoiceGuidance', language)}
          language={language}
          title={translate('voiceAssistance', language)}
          subtitle={translate('orgPerformanceHearHowToUse', language)}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>{translate('loadingWorkers', language)}</Text>
        </View>
      ) : workers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="chart-line" size={80} color={COLORS.TEXT_LIGHT} />
          <Text style={styles.emptyTitle}>{translate('noWorkersYetTitle', language)}</Text>
          <Text style={styles.emptySubtitle}>
            {translate('addWorkersToViewPerformance', language)}
          </Text>
          <TouchableOpacity
            style={styles.addWorkerButton}
            onPress={() => go('orgAddWorker')}
          >
            <MaterialCommunityIcons name="plus" size={20} color={COLORS.WHITE} />
            <Text style={styles.addWorkerButtonText}>{translate('addWorker', language)}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={workers}
          renderItem={renderWorkerCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.PRIMARY]}
            />
          }
          ListHeaderComponent={
            <View style={styles.headerInfo}>
              <Text style={styles.headerInfoText}>
                {translate('selectWorkerToViewDetails', language)}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.TEXT,
    flex: 1,
    textAlign: 'center',
  },
  voiceGuidanceWrap: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.TEXT_LIGHT,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_LIGHT,
    textAlign: 'center',
    marginTop: 8,
  },
  addWorkerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  addWorkerButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  headerInfo: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  headerInfoText: {
    fontSize: 14,
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  workerCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EDE7F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  workerName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT,
  },
  workerExperience: {
    fontSize: 14,
    color: COLORS.TEXT_LIGHT,
    marginTop: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  contactText: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
  },
  statsRow: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
});
