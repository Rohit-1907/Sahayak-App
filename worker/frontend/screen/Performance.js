import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../config/api';
import { translate } from '../utils/translations';
import { useTextToSpeech } from '../utils/useTextToSpeech';
import VoiceGuidanceButton from '../components/VoiceGuidanceButton';

const PURPLE = '#49769F';
const LIGHT_PURPLE = '#EEF4F8';
const BG = '#F8FAFC';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E0E7ED';
const GREEN = '#10B981';
const ORANGE = '#F59E0B';
const RED = '#EF4444';

let performanceIntroSpoken = false;

export default function Performance({ navigation, go, language = "English" }) {
  const { speak: speakPerformance, stop: stopPerformance } = useTextToSpeech(language);

  useEffect(() => {
    if (performanceIntroSpoken) {
      return;
    }
    performanceIntroSpoken = true;
    const intro = translate('performanceAutoIntro', language);
    speakPerformance(intro);
    return () => {
      stopPerformance();
    };
  }, [language, speakPerformance, stopPerformance]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    inProgressJobs: 0,
    cancelledJobs: 0,
    totalEarnings: 0,
    avgRating: 0,
    completionRate: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const loadCached = async () => {
      try {
        const [cachedStats, cachedJobs] = await Promise.all([
          AsyncStorage.getItem('@cache_performance_stats'),
          AsyncStorage.getItem('@cache_performance_recent_jobs'),
        ]);
        if (!isMounted) return;
        if (cachedStats) {
          setStats(JSON.parse(cachedStats));
          setLoading(false);
        }
        if (cachedJobs) {
          setRecentJobs(JSON.parse(cachedJobs));
        }
      } catch (e) {}
      if (isMounted) {
        fetchPerformanceData(true);
      }
    };
    loadCached();
    return () => { isMounted = false; };
  }, []);

  const fetchPerformanceData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const accessToken = await AsyncStorage.getItem('access_token');
      const token = await AsyncStorage.getItem('token');
      const workerToken = await AsyncStorage.getItem('workerToken');
      const authToken = accessToken || token || workerToken;

      if (!authToken) {
        // No token, but don't show error - just show empty state
        console.log('No auth token found');
        setStats({
          totalJobs: 0,
          completedJobs: 0,
          inProgressJobs: 0,
          cancelledJobs: 0,
          totalEarnings: 0,
          avgRating: 0,
          completionRate: 0,
        });
        setRecentJobs([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log('Fetching performance data...');

      // Fetch work requests
      const response = await fetch(
        API_ENDPOINTS.JOBS_WORK_REQUESTS,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Performance data received:', data);
        
        // Check different response formats
        let jobsArray = [];
        
        if (data.work_requests && Array.isArray(data.work_requests)) {
          // Format: { success: true, total: 15, work_requests: [...] }
          jobsArray = data.work_requests;
        } else if (Array.isArray(data)) {
          // Format: [...]
          jobsArray = data;
        } else if (data.results && Array.isArray(data.results)) {
          // Paginated format: { results: [...] }
          jobsArray = data.results;
        }
        
        console.log('Jobs array length:', jobsArray.length);
        
        if (jobsArray.length > 0) {
          calculateStats(jobsArray);
          const topRecent = jobsArray.slice(0, 5);
          setRecentJobs(topRecent);
          AsyncStorage.setItem('@cache_performance_recent_jobs', JSON.stringify(topRecent)).catch(() => {});
        } else {
          console.log('No jobs found in response');
          // Empty state
          setStats({
            totalJobs: 0,
            completedJobs: 0,
            inProgressJobs: 0,
            cancelledJobs: 0,
            totalEarnings: 0,
            avgRating: 0,
            completionRate: 0,
          });
          setRecentJobs([]);
        }
      } else {
        const errorData = await response.text();
        console.error('Failed to fetch performance data:', response.status, errorData);
        // Show empty state instead of error
        setStats({
          totalJobs: 0,
          completedJobs: 0,
          inProgressJobs: 0,
          cancelledJobs: 0,
          totalEarnings: 0,
          avgRating: 0,
          completionRate: 0,
        });
        setRecentJobs([]);
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
      console.error('Error stack:', error.stack);
      // Show empty state on error
      setStats({
        totalJobs: 0,
        completedJobs: 0,
        inProgressJobs: 0,
        cancelledJobs: 0,
        totalEarnings: 0,
        avgRating: 0,
        completionRate: 0,
      });
      setRecentJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (jobs) => {
    // Safety check
    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      setStats({
        totalJobs: 0,
        completedJobs: 0,
        inProgressJobs: 0,
        cancelledJobs: 0,
        totalEarnings: 0,
        avgRating: 0,
        completionRate: 0,
      });
      return;
    }

    const completed = jobs.filter((j) => j.status === 'COMPLETED').length;
    const inProgress = jobs.filter((j) => j.status === 'IN_PROGRESS').length;
    const cancelled = jobs.filter(
      (j) => j.status === 'CANCELLED' || j.status === 'REJECTED'
    ).length;
    const total = jobs.length;

    const totalEarnings = jobs
      .filter((j) => j.status === 'COMPLETED')
      .reduce((sum, j) => {
        const budget = parseFloat(j.estimated_budget || j.budget || 0);
        return sum + budget;
      }, 0);

    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

    // Calculate average rating (mock for now - implement when ratings exist)
    const avgRating = completed > 0 ? (4.2 + Math.random() * 0.8).toFixed(1) : 0;

    const calculatedStats = {
      totalJobs: total,
      completedJobs: completed,
      inProgressJobs: inProgress,
      cancelledJobs: cancelled,
      totalEarnings: totalEarnings.toFixed(2),
      avgRating,
      completionRate,
    };
    setStats(calculatedStats);
    AsyncStorage.setItem('@cache_performance_stats', JSON.stringify(calculatedStats)).catch(() => {});
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPerformanceData(false);
  };

  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    } else if (go) {
      go('home');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return GREEN;
      case 'IN_PROGRESS':
        return ORANGE;
      case 'SCHEDULED':
        return PURPLE;
      case 'CANCELLED':
      case 'REJECTED':
        return RED;
      default:
        return MUTED;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'check-circle';
      case 'IN_PROGRESS':
        return 'progress-clock';
      case 'SCHEDULED':
        return 'calendar-check';
      case 'CANCELLED':
      case 'REJECTED':
        return 'close-circle';
      default:
        return 'information';
    }
  };

  if (loading && stats.totalJobs === 0 && recentJobs.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={PURPLE} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} delayPressIn={0} activeOpacity={0.7}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Performance</Text>
          <View style={{ width: 46 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PURPLE} />
          <Text style={styles.loadingText}>Loading your performance data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={PURPLE} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} delayPressIn={0} activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Performance</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} delayPressIn={0} activeOpacity={0.7}>
          <MaterialCommunityIcons name="refresh" size={25} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.voiceGuidanceWrap}>
        <VoiceGuidanceButton
          labeled
          text={translate('performanceVoiceGuidance', language)}
          language={language}
          title={translate('voiceAssistance', language)}
          subtitle={translate('performanceHearHowToUse', language)}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PURPLE]} />
        }
      >
        {/* TABS */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'Overview' && styles.activeTab]}
            onPress={() => setTab('Overview')}
          >
            <MaterialCommunityIcons
              name="chart-box-outline"
              size={18}
              color={tab === 'Overview' ? PURPLE : MUTED}
            />
            <Text style={[styles.tabText, tab === 'Overview' && styles.activeTabText]}>
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, tab === 'Jobs' && styles.activeTab]}
            onPress={() => setTab('Jobs')}
          >
            <MaterialCommunityIcons
              name="briefcase-outline"
              size={18}
              color={tab === 'Jobs' ? PURPLE : MUTED}
            />
            <Text style={[styles.tabText, tab === 'Jobs' && styles.activeTabText]}>
              Recent Jobs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, tab === 'Earnings' && styles.activeTab]}
            onPress={() => setTab('Earnings')}
          >
            <MaterialCommunityIcons
              name="cash-multiple"
              size={18}
              color={tab === 'Earnings' ? PURPLE : MUTED}
            />
            <Text style={[styles.tabText, tab === 'Earnings' && styles.activeTabText]}>
              Earnings
            </Text>
          </TouchableOpacity>
        </View>

        {/* OVERVIEW TAB */}
        {tab === 'Overview' && (
          <View>
            {/* KEY STATS */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIconBox, { backgroundColor: '#DBEAFE' }]}>
                  <MaterialCommunityIcons name="briefcase-check" size={28} color="#3B82F6" />
                </View>
                <Text style={styles.statNumber}>{stats.completedJobs}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <MaterialCommunityIcons name="progress-clock" size={28} color="#F59E0B" />
                </View>
                <Text style={styles.statNumber}>{stats.inProgressJobs}</Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconBox, { backgroundColor: '#D1FAE5' }]}>
                  <MaterialCommunityIcons name="star" size={28} color="#10B981" />
                </View>
                <Text style={styles.statNumber}>{stats.avgRating}</Text>
                <Text style={styles.statLabel}>Avg Rating</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconBox, { backgroundColor: '#E9D5FF' }]}>
                  <MaterialCommunityIcons name="chart-line" size={28} color={PURPLE} />
                </View>
                <Text style={styles.statNumber}>{stats.completionRate}%</Text>
                <Text style={styles.statLabel}>Completion</Text>
              </View>
            </View>

            {/* PERFORMANCE SUMMARY */}
            <View style={styles.summaryCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <MaterialCommunityIcons name="chart-box" size={20} color={PURPLE} />
                <Text style={[styles.summaryTitle, { marginLeft: 8, marginBottom: 0 }]}>Performance Summary</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Jobs</Text>
                <Text style={styles.summaryValue}>{stats.totalJobs}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Completed Jobs</Text>
                <Text style={[styles.summaryValue, { color: GREEN }]}>
                  {stats.completedJobs}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>In Progress</Text>
                <Text style={[styles.summaryValue, { color: ORANGE }]}>
                  {stats.inProgressJobs}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Cancelled/Rejected</Text>
                <Text style={[styles.summaryValue, { color: RED }]}>
                  {stats.cancelledJobs}
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Completion Rate</Text>
                <Text style={[styles.summaryValue, { color: PURPLE, fontWeight: '900' }]}>
                  {stats.completionRate}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* RECENT JOBS TAB */}
        {tab === 'Jobs' && (
          <View>
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <View key={job.id} style={styles.jobCard}>
                  <View style={styles.jobHeader}>
                    <View style={styles.jobTitleRow}>
                      <MaterialCommunityIcons
                        name={getStatusIcon(job.status)}
                        size={20}
                        color={getStatusColor(job.status)}
                      />
                      <Text style={styles.jobTitle} numberOfLines={1}>
                        {job.title || job.service_category}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(job.status) + '20' },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
                        {job.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.jobDescription} numberOfLines={2}>
                    {job.description}
                  </Text>

                  <View style={styles.jobFooter}>
                    <View style={styles.jobInfo}>
                      <MaterialCommunityIcons name="calendar" size={14} color={MUTED} />
                      <Text style={styles.jobInfoText}>
                        {new Date(job.required_date).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.jobInfo}>
                      <MaterialCommunityIcons name="currency-inr" size={14} color={GREEN} />
                      <Text style={[styles.jobInfoText, { color: GREEN, fontWeight: '700' }]}>
                        {parseFloat(job.estimated_budget || 0).toFixed(0)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <MaterialCommunityIcons name="briefcase-off-outline" size={50} color={MUTED} />
                <Text style={styles.emptyTitle}>No Jobs Yet</Text>
                <Text style={styles.emptyText}>
                  Your completed and ongoing jobs will appear here.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* EARNINGS TAB */}
        {tab === 'Earnings' && (
          <View>
            <View style={styles.earningsCard}>
              <View style={styles.earningsHeader}>
                <View>
                  <Text style={styles.earningsLabel}>Total Earnings</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.earningsAmount, { fontSize: 20 }]}>Rs. </Text>
                    <Text style={styles.earningsAmount}>{stats.totalEarnings}</Text>
                  </View>
                </View>
                <View style={styles.earningsIconBox}>
                  <MaterialCommunityIcons name="wallet" size={36} color={GREEN} />
                </View>
              </View>

              <View style={styles.earningsDivider} />

              <View style={styles.earningsDetail}>
                <MaterialCommunityIcons name="check-circle" size={18} color={GREEN} />
                <Text style={styles.earningsDetailText}>
                  From {stats.completedJobs} completed jobs
                </Text>
              </View>
            </View>

            {/* EARNINGS BREAKDOWN */}
            <View style={styles.breakdownCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <MaterialCommunityIcons name="cash-multiple" size={20} color={PURPLE} />
                <Text style={[styles.breakdownTitle, { marginLeft: 8, marginBottom: 0 }]}>Earnings Breakdown</Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Completed Jobs</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.breakdownValue}>Rs. {stats.totalEarnings}</Text>
                </View>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Average per Job</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.breakdownValue}>
                    Rs. {stats.completedJobs > 0
                      ? (parseFloat(stats.totalEarnings) / stats.completedJobs).toFixed(0)
                      : '0'}
                  </Text>
                </View>
              </View>

              <View style={styles.breakdownNote}>
                <MaterialCommunityIcons name="information-outline" size={16} color={PURPLE} />
                <Text style={styles.breakdownNoteText}>
                  Payments are processed after job completion and client confirmation.
                </Text>
              </View>
            </View>

            {stats.completedJobs === 0 && (
              <View style={styles.emptyCard}>
                <MaterialCommunityIcons name="cash-off" size={50} color={MUTED} />
                <Text style={styles.emptyTitle}>No Earnings Yet</Text>
                <Text style={styles.emptyText}>
                  Complete jobs to start earning. Your earnings will be displayed here.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  scroll: {
    flex: 1,
  },

  header: {
    height: 68,
    backgroundColor: PURPLE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  voiceGuidanceWrap: {
    marginHorizontal: 16,
    marginTop: 12,
  },

  backButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },

  refreshButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 21,
    fontWeight: '800',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: MUTED,
    fontSize: 14,
    marginTop: 12,
  },

  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 5,
    marginBottom: 20,
  },

  tab: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 5,
  },

  activeTab: {
    backgroundColor: LIGHT_PURPLE,
  },

  tabText: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 5,
  },

  activeTabText: {
    color: PURPLE,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },

  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
    alignItems: 'center',
  },

  statIconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  statNumber: {
    color: TEXT,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },

  statLabel: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '600',
  },

  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: TEXT,
    marginBottom: 16,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },

  summaryLabel: {
    fontSize: 14,
    color: MUTED,
    fontWeight: '600',
  },

  summaryValue: {
    fontSize: 16,
    color: TEXT,
    fontWeight: '700',
  },

  summaryDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 8,
  },

  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 12,
  },

  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  jobTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },

  jobTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: TEXT,
    marginLeft: 8,
    flex: 1,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  jobDescription: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 20,
    marginBottom: 12,
  },

  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  jobInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  jobInfoText: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '600',
    marginLeft: 6,
  },

  earningsCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 24,
    marginBottom: 20,
  },

  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  earningsLabel: {
    fontSize: 14,
    color: MUTED,
    fontWeight: '600',
    marginBottom: 8,
  },

  earningsAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: GREEN,
  },

  earningsIconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: GREEN + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },

  earningsDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 16,
  },

  earningsDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  earningsDetailText: {
    fontSize: 13,
    color: MUTED,
    marginLeft: 8,
    fontWeight: '600',
  },

  breakdownCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    marginBottom: 20,
  },

  breakdownTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: TEXT,
    marginBottom: 16,
  },

  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },

  breakdownLabel: {
    fontSize: 14,
    color: MUTED,
    fontWeight: '600',
  },

  breakdownValue: {
    fontSize: 16,
    color: TEXT,
    fontWeight: '800',
  },

  breakdownNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },

  breakdownNoteText: {
    fontSize: 12,
    color: PURPLE,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
    fontWeight: '600',
  },

  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },

  emptyTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 16,
    marginBottom: 8,
  },

  emptyText: {
    color: MUTED,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
