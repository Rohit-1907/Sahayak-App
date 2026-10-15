/**
 * Organisation Worker Jobs Screen
 * Shows jobs assigned to the logged-in org worker
 * Worker can update job status: assigned → in_progress → completed
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

const PURPLE = '#49769F';
const LIGHT_PURPLE = '#EEF4F8';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E0E7ED';
const SUCCESS = '#10B981';
const WARNING = '#F59E0B';
const DANGER = '#EF4444';

const getLanguageCode = (language) => {
  const value = String(language || '').trim().toLowerCase();
  if (value === 'मराठी' || value === 'marathi' || value === 'mr') return 'mr';
  if (value === 'हिंदी' || value === 'hindi' || value === 'hi') return 'hi';
  return 'en';
};

const getOrgWorkDescription = (assignment, language) => {
  return assignment?.translations?.[getLanguageCode(language)]?.work_description
    || assignment?.work_description
    || assignment?.description
    || '';
};

export default function OrgWorkerJobs({ go, language = "English" }) {
  const [workerData, setWorkerData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'assigned', 'in_progress', 'completed'

  useEffect(() => {
    loadWorkerData();
  }, []);

  const loadWorkerData = async () => {
    try {
      const workerDataStr = await AsyncStorage.getItem('org_worker_data');
      if (workerDataStr) {
        const worker = JSON.parse(workerDataStr);
        setWorkerData(worker);
        await loadAssignments(worker.id);
      } else {
        Alert.alert('Error', 'Worker data not found', [
          { text: 'OK', onPress: () => go('organizationLogin') },
        ]);
      }
    } catch (error) {
      console.error('Error loading worker data:', error);
    }
  };

  const loadAssignments = async (workerId) => {
    try {
      // Fetch all assignments (assigned + in_progress + completed)
      const [assignedResponse, inProgressResponse, completedResponse] = await Promise.all([
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
        fetch(API_ENDPOINTS.ORG_WORKER_COMPLETED(workerId), {
          headers: {
            'Content-Type': 'application/json',
            'X-Worker-ID': workerId.toString(),
          },
        }),
      ]);

      const assignedData = await assignedResponse.json();
      const inProgressData = await inProgressResponse.json();
      const completedData = await completedResponse.json();

      console.log('[TASK] Jobs - Assigned:', assignedData);
      console.log('[WAIT] Jobs - In Progress:', inProgressData);
      console.log('[OK] Jobs - Completed:', completedData);

      const allAssignments = [
        ...(assignedData.success && assignedData.work ? assignedData.work.map(w => ({ ...w, status: 'assigned' })) : []),
        ...(inProgressData.success && inProgressData.work ? inProgressData.work.map(w => ({ ...w, status: 'in_progress' })) : []),
        ...(completedData.success && completedData.work ? completedData.work.map(w => ({ ...w, status: 'completed' })) : []),
      ];

      setAssignments(allAssignments);
    } catch (error) {
      console.error('Error loading assignments:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    if (!workerData) return;
    setRefreshing(true);
    await loadAssignments(workerData.id);
    setRefreshing(false);
  };

  const handleUpdateStatus = async (assignmentId, newStatus) => {
    try {
      const response = await fetch(API_ENDPOINTS.ORG_ASSIGNMENT_STATUS(assignmentId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', `Job marked as ${newStatus.replace('_', ' ')}`);
        await loadAssignments(workerData.id);
      } else {
        Alert.alert('Error', data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update job status');
    }
  };

  const getFilteredAssignments = () => {
    if (filter === 'all') return assignments;
    return assignments.filter((a) => a.status === filter);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned':
        return MUTED;
      case 'in_progress':
        return WARNING;
      case 'completed':
        return SUCCESS;
      default:
        return MUTED;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'assigned':
        return 'clipboard-text';
      case 'in_progress':
        return 'progress-clock';
      case 'completed':
        return 'check-circle';
      default:
        return 'clipboard-text';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PURPLE} />
        <Text style={styles.loadingText}>Loading jobs...</Text>
      </View>
    );
  }

  const filteredAssignments = getFilteredAssignments();
  const stats = {
    total: assignments.length,
    assigned: assignments.filter((a) => a.status === 'assigned').length,
    in_progress: assignments.filter((a) => a.status === 'in_progress').length,
    completed: assignments.filter((a) => a.status === 'completed').length,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>My Jobs</Text>
          <Text style={styles.headerSubtitle}>{workerData?.full_name || 'Worker'}</Text>
        </View>
        <TouchableOpacity 
          onPress={async () => {
            try {
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              await AsyncStorage.clear();
              console.log('[OK] Storage cleared on worker logout');
              go('language');
            } catch (error) {
              console.error('Error clearing storage:', error);
              go('language');
            }
          }} 
          style={styles.logoutButton}
        >
          <MaterialCommunityIcons name="logout" size={24} color={DANGER} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: MUTED }]}>{stats.assigned}</Text>
          <Text style={styles.statLabel}>Assigned</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: WARNING }]}>{stats.in_progress}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: SUCCESS }]}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({stats.total})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'assigned' && styles.filterButtonActive]}
          onPress={() => setFilter('assigned')}
        >
          <Text style={[styles.filterText, filter === 'assigned' && styles.filterTextActive]}>
            Assigned ({stats.assigned})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'in_progress' && styles.filterButtonActive]}
          onPress={() => setFilter('in_progress')}
        >
          <Text style={[styles.filterText, filter === 'in_progress' && styles.filterTextActive]}>
            In Progress ({stats.in_progress})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Jobs List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PURPLE]} />
        }
      >
        {filteredAssignments.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="briefcase-outline" size={64} color={MUTED} />
            <Text style={styles.emptyTitle}>No Jobs Found</Text>
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? 'You have no assigned jobs yet'
                : `No ${filter.replace('_', ' ')} jobs`}
            </Text>
          </View>
        ) : (
          <View style={styles.jobsList}>
            {filteredAssignments.map((assignment) => (
              <JobCard
                key={assignment.id}
                assignment={assignment}
                language={language}
                onUpdateStatus={handleUpdateStatus}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// =====================================================
// JOB CARD COMPONENT
// =====================================================

function JobCard({ assignment, onUpdateStatus, getStatusColor, getStatusIcon, language }) {
  const [expanded, setExpanded] = useState(false);

  const statusColor = getStatusColor(assignment.status);
  const statusIcon = getStatusIcon(assignment.status);

  return (
    <View style={styles.jobCard}>
      <TouchableOpacity
        style={styles.jobHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.jobHeaderLeft}>
          <View style={[styles.statusIcon, { backgroundColor: statusColor + '20' }]}>
            <MaterialCommunityIcons name={statusIcon} size={24} color={statusColor} />
          </View>
          <View style={styles.jobInfo}>
            <Text style={styles.jobType}>{assignment.work_type}</Text>
            <Text style={styles.jobClient}>{assignment.client_name}</Text>
          </View>
        </View>
        <View style={styles.jobHeaderRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {assignment.status.replace('_', ' ')}
            </Text>
          </View>
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={MUTED}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.jobDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="text" size={18} color={MUTED} />
            <Text style={styles.detailLabel}>Description:</Text>
          </View>
          <Text style={styles.detailValue}>{getOrgWorkDescription(assignment, language)}</Text>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar" size={18} color={MUTED} />
            <Text style={styles.detailLabel}>Assigned:</Text>
            <Text style={styles.detailValue}>
              {new Date(assignment.assigned_at).toLocaleDateString()}
            </Text>
          </View>

          {assignment.assigned_by_name && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="account" size={18} color={MUTED} />
              <Text style={styles.detailLabel}>Assigned By:</Text>
              <Text style={styles.detailValue}>{assignment.assigned_by_name}</Text>
            </View>
          )}

          {assignment.completed_at && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="check-circle" size={18} color={SUCCESS} />
              <Text style={styles.detailLabel}>Completed:</Text>
              <Text style={styles.detailValue}>
                {new Date(assignment.completed_at).toLocaleDateString()}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          {assignment.status === 'assigned' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: WARNING }]}
              onPress={() => onUpdateStatus(assignment.id, 'in_progress')}
            >
              <MaterialCommunityIcons name="play" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Start Work</Text>
            </TouchableOpacity>
          )}

          {assignment.status === 'in_progress' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: SUCCESS }]}
              onPress={() => onUpdateStatus(assignment.id, 'completed')}
            >
              <MaterialCommunityIcons name="check" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Mark as Completed</Text>
            </TouchableOpacity>
          )}

          {assignment.status === 'completed' && (
            <View style={styles.completedBanner}>
              <MaterialCommunityIcons name="check-circle" size={20} color={SUCCESS} />
              <Text style={styles.completedText}>Job Completed!</Text>
            </View>
          )}
        </View>
      )}
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
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT,
  },
  headerSubtitle: {
    fontSize: 14,
    color: MUTED,
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: LIGHT_PURPLE,
    paddingVertical: 16,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 24,
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: LIGHT_PURPLE,
  },
  filterButtonActive: {
    backgroundColor: PURPLE,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: MUTED,
  },
  filterTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  jobsList: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  jobHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobInfo: {
    flex: 1,
  },
  jobType: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 4,
  },
  jobClient: {
    fontSize: 14,
    color: MUTED,
  },
  jobHeaderRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  jobDetails: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: MUTED,
  },
  detailValue: {
    fontSize: 14,
    color: TEXT,
    flex: 1,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 16,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SUCCESS + '20',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 16,
    gap: 8,
  },
  completedText: {
    color: SUCCESS,
    fontSize: 15,
    fontWeight: '700',
  },
});
