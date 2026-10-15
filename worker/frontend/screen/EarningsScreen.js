import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translate } from '../utils/translations';
import { useTextToSpeech } from '../utils/useTextToSpeech';
import VoiceGuidanceButton from '../components/VoiceGuidanceButton';
import { API_ENDPOINTS } from '../config/api';

const PURPLE = '#49769F';
const LIGHT_PURPLE = '#EEF4F8';
const BG = '#F8FAFC';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E0E7ED';
const GREEN = '#10B981';

export default function EarningsScreen({ navigation, go, language = "English", userRole = "individual_worker" }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [earnings, setEarnings] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    completedJobs: 0,
    averagePerJob: 0,
  });
  const [recentPayments, setRecentPayments] = useState([]);

  const {
    speak: speakEarnings,
    stop: stopEarnings,
    isSpeaking: isEarningsSpeaking,
  } = useTextToSpeech(language);

  const handleEarningsVoiceGuidance = () => {
    if (isEarningsSpeaking) {
      stopEarnings();
      return;
    }
    speakEarnings(translate('earningsVoiceGuidance', language));
  };

  useEffect(() => {
    let isMounted = true;
    const loadCached = async () => {
      try {
        const [cachedEarnings, cachedPayments] = await Promise.all([
          AsyncStorage.getItem('@cache_earnings_data'),
          AsyncStorage.getItem('@cache_recent_payments'),
        ]);
        if (!isMounted) return;
        if (cachedEarnings) {
          setEarnings(JSON.parse(cachedEarnings));
          setLoading(false);
        }
        if (cachedPayments) {
          setRecentPayments(JSON.parse(cachedPayments));
        }
      } catch (e) {}
      if (isMounted) {
        fetchEarningsData(true);
      }
    };
    loadCached();
    return () => { isMounted = false; };
  }, []);

  const fetchEarningsData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const accessToken = await AsyncStorage.getItem('access_token');
      let userRole = await AsyncStorage.getItem('user_role');
      let userType = await AsyncStorage.getItem('user_type');
      const userDataStr = (await AsyncStorage.getItem('user_data')) || (await AsyncStorage.getItem('user'));
      const userData = userDataStr ? JSON.parse(userDataStr) : {};

      if (!userRole && userData.role) userRole = userData.role;
      if (!userRole && userData.role_name) userRole = userData.role_name;

      const isOrgWorker = (
        userRole === 'organization_worker' ||
        userType === 'org_worker' ||
        userType === 'organization_worker' ||
        userData.role === 'organization_worker'
      );

      const isOrgAdmin = (
        userRole === 'organization_admin' ||
        userType === 'organization' ||
        userType === 'organization_admin' ||
        userData.role === 'organization_admin'
      );
      
      let jobsArray = [];

      // 1. Organization Worker
      if (isOrgWorker) {
        const workerDataStr = (await AsyncStorage.getItem('org_worker_data')) || (await AsyncStorage.getItem('worker_data'));
        const workerData = workerDataStr ? JSON.parse(workerDataStr) : {};
        const workerId = workerData.id;

        if (workerId) {
          const headers = { 'Content-Type': 'application/json' };
          if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
          headers['X-Worker-ID'] = workerId.toString();

          const response = await fetch(
            API_ENDPOINTS.ORG_WORKER_COMPLETED(workerId),
            { headers }
          );
          if (response.ok) {
            const data = await response.json();
            if (data.work && Array.isArray(data.work)) {
              jobsArray = data.work;
            }
          }
        }
      }
      // 2. Organization Admin
      else if (isOrgAdmin) {
        if (accessToken) {
            const response = await fetch(
            `${API_ENDPOINTS.ORG_REQUESTS_BY_STATUS('completed')}&page_size=100`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            if (data.results && Array.isArray(data.results)) {
              jobsArray = data.results;
            } else if (Array.isArray(data)) {
              jobsArray = data;
            }
          }
        }
      }
      // 3. Individual Worker (default)
      else {
        if (accessToken) {
          const response = await fetch(
            API_ENDPOINTS.JOBS_WORK_REQUESTS,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.work_requests && Array.isArray(data.work_requests)) {
              jobsArray = data.work_requests;
            } else if (Array.isArray(data)) {
              jobsArray = data;
            } else if (data.results && Array.isArray(data.results)) {
              jobsArray = data.results;
            }
          }
        }
      }

      calculateEarnings(jobsArray);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      setEarnings({
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        completedJobs: 0,
        averagePerJob: 0,
      });
      setRecentPayments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateEarnings = (jobs) => {
    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      setEarnings({
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        completedJobs: 0,
        averagePerJob: 0,
      });
      setRecentPayments([]);
      return;
    }

    const completedJobs = jobs.filter((j) => (j.status || '').toUpperCase() === 'COMPLETED');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    let totalEarnings = 0;
    let todayEarnings = 0;
    let weekEarnings = 0;
    let monthEarnings = 0;

    completedJobs.forEach((job) => {
      const amount = parseFloat(job.total_amount || job.estimated_budget || job.budget || job.service_charge || 0);
      totalEarnings += amount;

      const compDateStr = job.completed_at || job.completedDate || job.updated_at || job.created_at;
      if (compDateStr) {
        const completedDate = new Date(compDateStr);
        if (completedDate >= today) {
          todayEarnings += amount;
        }
        if (completedDate >= weekAgo) {
          weekEarnings += amount;
        }
        if (completedDate >= monthAgo) {
          monthEarnings += amount;
        }
      }
    });

    const averagePerJob = completedJobs.length > 0 ? totalEarnings / completedJobs.length : 0;

    const calculatedEarnings = {
      total: totalEarnings.toFixed(0),
      today: todayEarnings.toFixed(0),
      thisWeek: weekEarnings.toFixed(0),
      thisMonth: monthEarnings.toFixed(0),
      completedJobs: completedJobs.length,
      averagePerJob: averagePerJob.toFixed(0),
    };

    setEarnings(calculatedEarnings);
    AsyncStorage.setItem('@cache_earnings_data', JSON.stringify(calculatedEarnings)).catch(() => {});

    // Get recent 5 completed jobs for payments list
    const recentCompleted = completedJobs
      .sort((a, b) => {
        const dateA = new Date(a.completed_at || a.completedDate || a.created_at || 0);
        const dateB = new Date(b.completed_at || b.completedDate || b.created_at || 0);
        return dateB - dateA;
      })
      .slice(0, 5);
    
    setRecentPayments(recentCompleted);
    AsyncStorage.setItem('@cache_recent_payments', JSON.stringify(recentCompleted)).catch(() => {});
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEarningsData(false);
  };

  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    } else if (go) {
      go('home');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };

  if (loading && earnings.total === 0 && recentPayments.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={PURPLE} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} delayPressIn={0} activeOpacity={0.7}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="#fff" />
          </TouchableOpacity>
<Text style={styles.headerTitle}>{translate('earnings', language)}</Text>
          <View style={{ width: 46 }} />
        </View>
        {userRole === "individual_worker" && (
          <View style={styles.voiceGuidanceWrap}>
            <VoiceGuidanceButton
              labeled
              text={translate('earningsVoiceGuidance', language)}
              language={language}
              onPress={handleEarningsVoiceGuidance}
              title={translate('voiceAssistance', language)}
              subtitle={translate('earningsHearHowToUse', language)}
            />
          </View>
        )}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PURPLE} />
          <Text style={styles.loadingText}>{translate('loading', language)}</Text>
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
        <Text style={styles.headerTitle}>{translate('earnings', language)}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} delayPressIn={0} activeOpacity={0.7}>
          <MaterialCommunityIcons name="refresh" size={25} color="#fff" />
        </TouchableOpacity>
      </View>

      {userRole === "individual_worker" && (
        <View style={styles.voiceGuidanceWrap}>
          <VoiceGuidanceButton
            labeled
            text={translate('earningsVoiceGuidance', language)}
            language={language}
            onPress={handleEarningsVoiceGuidance}
            title={translate('voiceAssistance', language)}
            subtitle={translate('earningsHearHowToUse', language)}
          />
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PURPLE]} />
        }
      >
        {/* TOTAL EARNINGS HERO */}
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>{translate('totalEarnings', language)}</Text>
            <View style={styles.heroAmountRow}>
              <Text style={styles.heroCurrency}>Rs. </Text>
              <Text style={styles.heroAmount}>{earnings.total}</Text>
            </View>
            <View style={styles.heroDetail}>
              <MaterialCommunityIcons name="check-circle" size={16} color={GREEN} />
              <Text style={styles.heroDetailText}>
                From {earnings.completedJobs} completed jobs
              </Text>
            </View>
          </View>
          <View style={styles.heroIconBox}>
            <MaterialCommunityIcons name="wallet" size={48} color={GREEN} />
          </View>
        </View>

        {/* SUMMARY CARDS */}
        <Text style={styles.sectionTitle}>{translate('summary', language)}</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <MaterialCommunityIcons name="calendar-today" size={24} color="#3B82F6" />
            <View style={styles.summaryAmountRow}>
              <Text style={styles.summaryCurrency}>Rs. </Text>
              <Text style={styles.summaryAmount}>{earnings.today}</Text>
            </View>
            <Text style={styles.summaryLabel}>{translate('today', language)}</Text>
          </View>

          <View style={styles.summaryCard}>
            <MaterialCommunityIcons name="calendar-week" size={24} color="#8B5CF6" />
            <View style={styles.summaryAmountRow}>
              <Text style={styles.summaryCurrency}>Rs. </Text>
              <Text style={styles.summaryAmount}>{earnings.thisWeek}</Text>
            </View>
            <Text style={styles.summaryLabel}>{translate('thisWeek', language)}</Text>
          </View>

          <View style={styles.summaryCard}>
            <MaterialCommunityIcons name="calendar-month" size={24} color="#10B981" />
            <View style={styles.summaryAmountRow}>
              <Text style={styles.summaryCurrency}>Rs. </Text>
              <Text style={styles.summaryAmount}>{earnings.thisMonth}</Text>
            </View>
            <Text style={styles.summaryLabel}>{translate('thisMonth', language)}</Text>
          </View>

          <View style={styles.summaryCard}>
            <MaterialCommunityIcons name="chart-line" size={24} color="#F59E0B" />
            <View style={styles.summaryAmountRow}>
              <Text style={styles.summaryCurrency}>Rs. </Text>
              <Text style={styles.summaryAmount}>{earnings.averagePerJob}</Text>
            </View>
            <Text style={styles.summaryLabel}>{translate('averagePerJob', language)}</Text>
          </View>
        </View>

        {/* RECENT PAYMENTS */}
        <Text style={styles.sectionTitle}>{translate('recentPayments', language)}</Text>
        {recentPayments.length > 0 ? (
          <View style={styles.paymentsCard}>
            {recentPayments.map((job, index) => {
              const payAmount = parseFloat(job.total_amount || job.estimated_budget || job.budget || job.service_charge || 0).toFixed(0);
              const payTitle = job.title || job.work_type || job.service_category || 'Service Work';
              const payDate = formatDate(job.completed_at || job.completedDate);
              return (
                <View
                  key={job.id || index}
                  style={[
                    styles.paymentRow,
                    index === recentPayments.length - 1 && styles.paymentRowLast,
                  ]}
                >
                  <View style={styles.paymentIcon}>
                    <MaterialCommunityIcons name="briefcase-check" size={20} color={GREEN} />
                  </View>
                  <View style={styles.paymentContent}>
                    <Text style={styles.paymentTitle} numberOfLines={1}>
                      {payTitle}
                    </Text>
                    <Text style={styles.paymentDate}>{payDate}</Text>
                  </View>
                  <View style={styles.paymentAmountRow}>
                    <Text style={styles.paymentAmount}>+Rs. {payAmount}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="cash-off" size={50} color={MUTED} />
            <Text style={styles.emptyTitle}>{translate('noEarningsYet', language)}</Text>
<Text style={styles.emptyText}>{translate('earningsEmptyDescription', language)}</Text>
          </View>
        )}

        {/* INFO NOTE */}
        <View style={styles.infoNote}>
          <MaterialCommunityIcons name="information-outline" size={18} color={PURPLE} />
          <Text style={styles.infoNoteText}>
            {translate('paymentsProcessedInfo', language)}
          </Text>
        </View>
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

  voiceGuidanceWrap: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
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

  heroCard: {
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: BORDER,
  },

  heroContent: {
    flex: 1,
  },

  heroLabel: {
    fontSize: 13,
    color: MUTED,
    fontWeight: '600',
    marginBottom: 4,
  },

  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  heroCurrency: {
    fontSize: 24,
    fontWeight: '800',
    color: GREEN,
    marginTop: 6,
  },

  heroAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: GREEN,
    marginLeft: 2,
  },

  heroDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroDetailText: {
    fontSize: 12,
    color: MUTED,
    marginLeft: 6,
    fontWeight: '600',
  },

  heroIconBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: GREEN + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 16,
  },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },

  summaryCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
    alignItems: 'center',
  },

  summaryAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 4,
  },

  summaryCurrency: {
    fontSize: 14,
    fontWeight: '700',
    color: MUTED,
    marginTop: 4,
  },

  summaryAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: TEXT,
    marginLeft: 2,
  },

  summaryLabel: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '600',
  },

  paymentsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 20,
  },

  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  paymentRowLast: {
    borderBottomWidth: 0,
  },

  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: GREEN + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  paymentContent: {
    flex: 1,
  },

  paymentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 4,
  },

  paymentDate: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '600',
  },

  paymentAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  paymentAmountPlus: {
    fontSize: 16,
    fontWeight: '800',
    color: GREEN,
  },

  paymentAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: GREEN,
    marginLeft: 1,
  },

  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginBottom: 20,
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

  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 12,
    padding: 16,
  },

  infoNoteText: {
    fontSize: 12,
    color: PURPLE,
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
    fontWeight: '600',
  },
});
