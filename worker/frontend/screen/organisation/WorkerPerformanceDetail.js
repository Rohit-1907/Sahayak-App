import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
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
  INFO: '#2196F3',
  TEXT: '#2C3E50',
  TEXT_LIGHT: '#7F8C8D',
  BACKGROUND: '#F8F9FA',
  WHITE: '#FFFFFF',
  BORDER: '#E1E8ED',
};

let workerPerformanceDetailIntroSpoken = false;

export default function WorkerPerformanceDetail({ go, language = "English", workerId, workerName }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { speak: speakOrgPerformance, stop: stopOrgPerformance } = useTextToSpeech(language);

  useEffect(() => {
    if (workerPerformanceDetailIntroSpoken) {
      return;
    }
    workerPerformanceDetailIntroSpoken = true;
    const intro = translate('workerPerformanceDetailAutoIntro', language);
    speakOrgPerformance(intro);
    return () => {
      stopOrgPerformance();
    };
  }, [language, speakOrgPerformance, stopOrgPerformance]);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      
      const url = API_ENDPOINTS.ORG_WORKER_PERFORMANCE(workerId);
      console.log('[STATS] Fetching worker performance:', url);
      console.log('[AUTH] Token exists:', !!token);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[RES] Response status:', response.status);
      console.log('[RES] Response headers:', response.headers);
      
      // Get response text first to see what we're actually getting
      const responseText = await response.text();
      console.log('[RES] Response text (first 200 chars):', responseText.substring(0, 200));
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[FAIL] JSON parse error:', parseError);
        console.error('[FAIL] Response was HTML, not JSON. Full response:', responseText);
        Alert.alert(translate('error', language), translate('serverErrorPage', language));
        return;
      }
      
      console.log('[STATS] Performance data:', data);
      
      if (data.success && data.stats) {
        setStats(data.stats);
      } else {
        Alert.alert(translate('error', language), data.error || translate('failedToLoadPerformance', language));
      }
    } catch (error) {
      console.error('[FAIL] Error fetching performance:', error);
      Alert.alert(translate('error', language), `${translate('failedToLoadPerformance', language)}: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPerformance();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return COLORS.SUCCESS;
      case 'in_progress':
        return COLORS.WARNING;
      case 'assigned':
        return COLORS.INFO;
      default:
        return COLORS.TEXT_LIGHT;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'in_progress':
        return 'progress-clock';
      case 'assigned':
        return 'clipboard-text';
      default:
        return 'help-circle';
    }
  };

  const renderAssignmentCard = (assignment) => (
    <View key={assignment.id} style={styles.assignmentCard}>
      <View style={styles.assignmentHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assignment.status) + '20' }]}>
          <MaterialCommunityIcons
            name={getStatusIcon(assignment.status)}
            size={16}
            color={getStatusColor(assignment.status)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(assignment.status) }]}>
            {assignment.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.assignmentDate}>
          {new Date(assignment.assigned_at).toLocaleDateString()}
        </Text>
      </View>

      <Text style={styles.assignmentWork}>{translate('workIdLabel', language)} #{assignment.request}</Text>
      
      {assignment.completed_at && (
        <Text style={styles.completedText}>
           {translate('completed', language)}: {new Date(assignment.completed_at).toLocaleDateString()}
        </Text>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => go('orgPerformance')} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.TEXT} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{translate('workerPerformanceTitle', language)}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>{translate('performanceLoading', language)}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => go('orgPerformance')} style={styles.backButton}>
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

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.PRIMARY]}
          />
        }
      >
        {stats && (
          <>
            {/* Worker Info */}
            <View style={styles.workerInfoCard}>
              <View style={styles.avatarCircle}>
                <MaterialCommunityIcons name="account" size={48} color={COLORS.PRIMARY} />
              </View>
              <Text style={styles.workerName}>{stats.worker_name}</Text>
              <View style={styles.contactInfo}>
                <View style={styles.contactRow}>
                  <MaterialCommunityIcons name="phone" size={16} color={COLORS.TEXT_LIGHT} />
                  <Text style={styles.contactText}>{stats.worker_phone}</Text>
                </View>
                <View style={styles.contactRow}>
                  <MaterialCommunityIcons name="email" size={16} color={COLORS.TEXT_LIGHT} />
                  <Text style={styles.contactText}>{stats.worker_email}</Text>
                </View>
              </View>
            </View>

            {/* Stats Summary */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="clipboard-list" size={32} color={COLORS.PRIMARY} />
                <Text style={styles.statValue}>{stats.total_assigned}</Text>
                <Text style={styles.statLabel}>{translate('totalAssigned', language)}</Text>
              </View>

              <View style={styles.statCard}>
                <MaterialCommunityIcons name="progress-clock" size={32} color={COLORS.WARNING} />
                <Text style={styles.statValue}>{stats.in_progress}</Text>
                <Text style={styles.statLabel}>{translate('inProgress', language)}</Text>
              </View>

              <View style={styles.statCard}>
                <MaterialCommunityIcons name="check-circle" size={32} color={COLORS.SUCCESS} />
                <Text style={styles.statValue}>{stats.completed}</Text>
                <Text style={styles.statLabel}>{translate('completed', language)}</Text>
              </View>

              <View style={styles.statCard}>
                <MaterialCommunityIcons name="clock-outline" size={32} color={COLORS.INFO} />
                <Text style={styles.statValue}>{stats.pending}</Text>
                <Text style={styles.statLabel}>{translate('pending', language)}</Text>
              </View>
            </View>

            {/* Assignments List */}
            <View style={styles.assignmentsSection}>
              <Text style={styles.sectionTitle}>{translate('workAssignmentsSection', language)}</Text>
              
              {stats.assignments && stats.assignments.length > 0 ? (
                stats.assignments.map(assignment => renderAssignmentCard(assignment))
              ) : (
                <View style={styles.emptyAssignments}>
                  <MaterialCommunityIcons name="clipboard-off-outline" size={48} color={COLORS.TEXT_LIGHT} />
                  <Text style={styles.emptyText}>{translate('noAssignmentsYet', language)}</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
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
  content: {
    flex: 1,
  },
  workerInfoCard: {
    backgroundColor: COLORS.WHITE,
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EDE7F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  workerName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 8,
  },
  contactInfo: {
    alignItems: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.TEXT_LIGHT,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
    marginTop: 4,
    textAlign: 'center',
  },
  assignmentsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 16,
  },
  assignmentCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  assignmentDate: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
  },
  assignmentWork: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT,
  },
  completedText: {
    fontSize: 14,
    color: COLORS.SUCCESS,
    marginTop: 8,
  },
  emptyAssignments: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.TEXT_LIGHT,
    marginTop: 12,
  },
});
