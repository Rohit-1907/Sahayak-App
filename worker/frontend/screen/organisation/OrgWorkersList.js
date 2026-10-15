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
  DANGER: '#F44336',
  WARNING: '#FF9800',
  TEXT: '#2C3E50',
  TEXT_LIGHT: '#7F8C8D',
  BACKGROUND: '#F8F9FA',
  WHITE: '#FFFFFF',
  BORDER: '#E1E8ED',
};

let orgWorkersListIntroSpoken = false;

export default function OrgWorkersList({ go, language = "English" }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orgId, setOrgId] = useState('');

  const { speak: speakOrgWorkersList, stop: stopOrgWorkersList } = useTextToSpeech(language);

  useEffect(() => {
    if (orgWorkersListIntroSpoken) {
      return;
    }
    orgWorkersListIntroSpoken = true;
    const intro = translate('orgWorkersListAutoIntro', language);
    speakOrgWorkersList(intro);
    return () => {
      stopOrgWorkersList();
    };
  }, [language, speakOrgWorkersList, stopOrgWorkersList]);

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

      const response = await fetch(`${API_ENDPOINTS.ORG_WORKERS}?org_id=${org_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.results) {
        setWorkers(data.results);
      } else {
        setWorkers([]);
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
      Alert.alert(translate('error', language), translate('failedToLoadWorkers', language));
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

  const renderWorkerCard = ({ item }) => (
    <View style={styles.workerCard}>
      <View style={styles.workerHeader}>
        <View style={styles.avatarCircle}>
          <MaterialCommunityIcons name="account" size={32} color={COLORS.PRIMARY} />
        </View>
        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>{item.full_name}</Text>
          <Text style={styles.workerExperience}>{item.experience}</Text>
        </View>
      </View>

      <View style={styles.credentialsSection}>
        <View style={styles.credentialRow}>
          <MaterialCommunityIcons name="phone" size={18} color={COLORS.TEXT_LIGHT} />
          <Text style={styles.credentialLabel}>{translate('phone', language)}:</Text>
          <Text style={styles.credentialValue}>{item.phone_number}</Text>
        </View>

        <View style={styles.credentialRow}>
          <MaterialCommunityIcons name="email" size={18} color={COLORS.TEXT_LIGHT} />
          <Text style={styles.credentialLabel}>{translate('email', language)}:</Text>
          <Text style={styles.credentialValue}>{item.email}</Text>
        </View>

        {item.credentials && (
          <>
            <View style={styles.divider} />
            <Text style={styles.credentialsHeading}>{translate('loginCredentials', language)}</Text>
            
            <View style={styles.credentialRow}>
              <MaterialCommunityIcons name="account-key" size={18} color={COLORS.SUCCESS} />
              <Text style={styles.credentialLabel}>{translate('usernameLabel', language)}:</Text>
              <Text style={[styles.credentialValue, styles.credentialCode]}>
                {item.credentials.username}
              </Text>
            </View>

            <View style={styles.credentialRow}>
              <MaterialCommunityIcons name="lock" size={18} color={COLORS.SUCCESS} />
              <Text style={styles.credentialLabel}>{translate('password', language)}:</Text>
              <Text style={[styles.credentialValue, styles.credentialCode]}>
                {item.credentials.password}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.workerFooter}>
        <Text style={styles.workerDate}>
          {translate('added', language)}: {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => go('home')} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translate('organizationWorkersTitle', language)}</Text>
        <TouchableOpacity onPress={() => go('orgAddWorker')} style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={24} color={COLORS.PRIMARY} />
        </TouchableOpacity>
      </View>

      <View style={styles.voiceGuidanceWrap}>
        <VoiceGuidanceButton
          labeled
          text={translate('orgWorkersListVoiceGuidance', language)}
          language={language}
          title={translate('voiceAssistance', language)}
          subtitle={translate('orgWorkersListHearHowToUse', language)}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>{translate('loadingWorkers', language)}</Text>
        </View>
      ) : workers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="account-group-outline" size={80} color={COLORS.TEXT_LIGHT} />
          <Text style={styles.emptyTitle}>{translate('noWorkersAddedYetTitle', language)}</Text>
          <Text style={styles.emptySubtitle}>
            {translate('addWorkersToGetStarted', language)}
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
  addButton: {
    padding: 8,
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
    marginBottom: 16,
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
  credentialsSection: {
    marginTop: 8,
  },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  credentialLabel: {
    fontSize: 14,
    color: COLORS.TEXT_LIGHT,
    width: 80,
  },
  credentialValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.TEXT,
  },
  credentialCode: {
    fontFamily: 'monospace',
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginVertical: 12,
  },
  credentialsHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.SUCCESS,
    marginBottom: 12,
  },
  workerFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  workerDate: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
  },
});
