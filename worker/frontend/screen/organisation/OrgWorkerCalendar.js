import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../../config/api';

const PURPLE = '#49769F';
const BG = '#F8FAFC';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E0E7ED';
const GREEN = '#22C55E';

export default function OrgWorkerCalendar({ go }) {
  const [loading, setLoading] = useState(true);
  const [assignedWork, setAssignedWork] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchAssignedWork();
  }, []);

  const fetchAssignedWork = async () => {
    try {
      setLoading(true);
      const tokenStr = await AsyncStorage.getItem('org_worker_token');
      const workerDataStr = await AsyncStorage.getItem('org_worker_data');
      
      if (tokenStr && workerDataStr) {
        const token = JSON.parse(tokenStr);
        const workerData = JSON.parse(workerDataStr);
        const workerId = token.worker_id || workerData.id;
        
        console.log('[CAL] Fetching assigned work for calendar - Worker ID:', workerId);
        
        // Fetch all assigned and in-progress work
        const [assignedResponse, inProgressResponse] = await Promise.all([
          fetch(API_ENDPOINTS.ORG_WORKER_ASSIGNED(workerId), {
            headers: {
              'Content-Type': 'application/json',
              'X-Worker-ID': workerId.toString(),
            },
          }),
          fetch(API_ENDPOINTS.ORG_WORKER_IN_PROGRESS(workerId), {
            headers: {
              'Content-Type': 'application/json',
              'X-Worker-ID': workerId.toString(),
            },
          }),
        ]);
        
        const assignedData = await assignedResponse.json();
        const inProgressData = await inProgressResponse.json();
        
        console.log('[CAL] Calendar - Assigned:', assignedData);
        console.log('[CAL] Calendar - In Progress:', inProgressData);
        
        const allWork = [
          ...(assignedData.success && assignedData.work ? assignedData.work : []),
          ...(inProgressData.success && inProgressData.work ? inProgressData.work : []),
        ];
        
        setAssignedWork(allWork);
      }
    } catch (error) {
      console.log('Error fetching assigned work for calendar:', error);
      setAssignedWork([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => go('home')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={TEXT} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>My Schedule</Text>
            <Text style={styles.headerSubtitle}>Assigned Work Calendar</Text>
          </View>
          
          <TouchableOpacity
            style={styles.todayButton}
            onPress={() => setSelectedDate(new Date())}
            activeOpacity={0.7}
          >
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
        </View>

        {/* Month Display */}
        <View style={styles.monthCard}>
          <MaterialCommunityIcons name="calendar-month" size={24} color={PURPLE} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.monthText}>
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <Text style={styles.workCountText}>
              {assignedWork.length} {assignedWork.length === 1 ? 'task' : 'tasks'} assigned
            </Text>
          </View>
        </View>

        {/* Work List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PURPLE} />
            <Text style={styles.loadingText}>Loading your schedule...</Text>
          </View>
        ) : assignedWork.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={64} color={MUTED} />
            <Text style={styles.emptyTitle}>No Work Assigned Yet</Text>
            <Text style={styles.emptySubtitle}>
              Your assigned tasks will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.workList}>
            <Text style={styles.sectionTitle}>Assigned & In Progress</Text>
            
            {assignedWork.map((work, index) => (
              <TouchableOpacity
                key={index}
                style={styles.workCard}
                onPress={() => go('jobDetails', { workId: work.id })}
                activeOpacity={0.85}
              >
                <View style={styles.workHeader}>
                  <View style={[styles.workIconBox, { 
                    backgroundColor: work.status === 'in_progress' ? '#FFF4E6' : '#F3F0FF' 
                  }]}>
                    <MaterialCommunityIcons
                      name={work.status === 'in_progress' ? 'progress-clock' : 'clipboard-text-outline'}
                      size={24}
                      color={work.status === 'in_progress' ? '#F59E0B' : PURPLE}
                    />
                  </View>
                  
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.workTitle}>{work.title}</Text>
                    <Text style={styles.workClient}>{work.client}</Text>
                  </View>

                  <View style={[styles.statusBadge, { 
                    backgroundColor: work.status === 'in_progress' ? '#FFF4E6' : '#E8F5E9' 
                  }]}>
                    <Text style={[styles.statusBadgeText, { 
                      color: work.status === 'in_progress' ? '#F59E0B' : GREEN 
                    }]}>
                      {work.status === 'in_progress' ? 'IN PROGRESS' : 'ASSIGNED'}
                    </Text>
                  </View>
                </View>

                <View style={styles.workDetails}>
                  <View style={styles.workDetailItem}>
                    <MaterialCommunityIcons name="map-marker" size={16} color={MUTED} />
                    <Text style={styles.workDetailText}>{work.location}</Text>
                  </View>
                  
                  {work.contact && (
                    <View style={styles.workDetailItem}>
                      <MaterialCommunityIcons name="phone" size={16} color={MUTED} />
                      <Text style={styles.workDetailText}>{work.contact}</Text>
                    </View>
                  )}
                </View>

                {work.progress !== undefined && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Progress</Text>
                      <Text style={styles.progressPercent}>{work.progress}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${work.progress}%` }]} />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: TEXT,
  },
  headerSubtitle: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: PURPLE,
    borderRadius: 20,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  monthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '900',
    color: TEXT,
  },
  workCountText: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: MUTED,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: MUTED,
    marginTop: 8,
    textAlign: 'center',
  },
  workList: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: TEXT,
    marginBottom: 12,
  },
  workCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  workHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: TEXT,
  },
  workClient: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  workDetails: {
    marginTop: 12,
    gap: 8,
  },
  workDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workDetailText: {
    fontSize: 12,
    color: MUTED,
  },
  progressContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '900',
    color: PURPLE,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
});
