import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale, wp } from '../../utils/responsive';
import { API_ENDPOINTS } from '../../config/api';
import { translate } from '../../utils/translations';
import { useTextToSpeech } from '../../utils/useTextToSpeech';
import VoiceGuidanceButton from '../../components/VoiceGuidanceButton';

/* ============================================================
   COLORS
============================================================ */

const PURPLE = "#49769F";
const LIGHT_PURPLE = "#EEF4F8";
const TEXT = "#111827";
const MUTED = "#6B7280";
const BORDER = "#E0E7ED";

/* ============================================================
   ORGANIZATION ADMIN HOME
   
   For organization leaders/admins.
   Shows: New Work Requests, Accepted Work Requests, Add Worker,
   Performance, and other organization management features.
============================================================ */

// Session-level guard (module scope): the automatic spoken intro plays
// at most ONCE per app session and is separate from the Voice Guidance
// button, which repeats the full guidance on tap. TTS only, no STT.
let orgAdminIntroSpoken = false;

export default function OrganizationAdminHome({
  screen,
  go,
  search,
  setSearch,
  SectionTitle,
  onMenuPress,
  language = "English",
}) {
  const [userName, setUserName] = React.useState('Admin');
  const [orgData, setOrgData] = React.useState(null);
  const [newRequests, setNewRequests] = React.useState([]);
  const [acceptedRequests, setAcceptedRequests] = React.useState([]);
  const [completedRequests, setCompletedRequests] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  // VOICE GUIDANCE (TTS)
  // Automatic spoken intro runs at most once per app session (module-scope
  // guard); the reusable Voice Guidance button speaks screen help on tap.
  const { speak: speakOrgAdmin, stop: stopOrgAdmin } = useTextToSpeech(language);

  React.useEffect(() => {
    if (orgAdminIntroSpoken) {
      return;
    }

    // Only speak when this screen actually owns the Dashboard home area.
    if (screen && screen !== 'home') {
      return;
    }

    orgAdminIntroSpoken = true;

    const spokenIntro = translate('orgAdminAutoIntro', language);

    speakOrgAdmin(spokenIntro);

    return () => {
      stopOrgAdmin();
    };
  }, [screen, language, speakOrgAdmin, stopOrgAdmin]);

  // Fetch all data on mount and whenever screen returns to 'home'
  React.useEffect(() => {
    if (screen === 'home' || !screen) {
      fetchAllData();
    }
  }, [screen]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchUserData(),
      fetchWorkRequests(),
    ]);
  };

  const fetchUserData = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const userData = await AsyncStorage.getItem('user_data');
      
      if (userData) {
        const user = JSON.parse(userData);
        const fullName = user.full_name || user.username || 'Admin';
        const firstName = fullName.split(' ')[0];
        setUserName(firstName);
        
        // Store org data if available
        if (user.organization_name || user.org_id) {
          setOrgData({
            org_id: user.org_id || 'N/A',
            org_name: user.organization_name || 'Organization'
          });
        }
      }
    } catch (error) {
      console.log('Error fetching user data:', error);
    }
  };

  const fetchWorkRequests = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const cached = await AsyncStorage.getItem('@cache_org_admin_requests');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setNewRequests(parsed.pending || []);
          setAcceptedRequests(parsed.accepted || []);
          setCompletedRequests(parsed.completed || []);
          setLoading(false);
        } catch (e) {}
      }

      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        console.log('No auth token found');
        setLoading(false);
        return;
      }

      // Fetch all requests in a single optimized call
      const response = await fetch(
        `${API_ENDPOINTS.ORG_REQUESTS}?page_size=100`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const data = await response.json();
      
      let allList = [];
      if (Array.isArray(data)) {
        allList = data;
      } else if (data.results && Array.isArray(data.results)) {
        allList = data.results;
      } else if (data.work_requests && Array.isArray(data.work_requests)) {
        allList = data.work_requests;
      }

      const strictlyPending = allList.filter(
        r => (r.status || '').toLowerCase() === 'pending'
      );
      const strictlyAccepted = allList.filter(
        r => (r.status || '').toLowerCase() === 'accepted'
      );
      const strictlyCompleted = allList.filter(
        r => (r.status || '').toLowerCase() === 'completed'
      );

      setNewRequests(strictlyPending);
      setAcceptedRequests(strictlyAccepted);
      setCompletedRequests(strictlyCompleted);
      await AsyncStorage.setItem(
        '@cache_org_admin_requests',
        JSON.stringify({
          pending: strictlyPending,
          accepted: strictlyAccepted,
          completed: strictlyCompleted,
        })
      );
    } catch (error) {
      console.log('Error fetching work requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  const handleViewRequestDetails = (request) => {
    console.log('[TASK] Viewing request details:', request.id);
    if (go) {
      go('orgRequestDetails', { 
        request,
        onRefresh: () => fetchWorkRequests(),
      });
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      // Optimistically move request from newRequests to acceptedRequests
      const acceptedItem = newRequests.find(r => r.id === requestId);
      setNewRequests(prev => prev.filter(r => r.id !== requestId));
      if (acceptedItem) {
        setAcceptedRequests(prev => [
          { ...acceptedItem, status: 'accepted' },
          ...prev.filter(r => r.id !== requestId)
        ]);
      }

      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('access_token');
      
      const response = await fetch(
        API_ENDPOINTS.ORG_REQUEST_ACCEPT(requestId),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        await fetchWorkRequests();
        Alert.alert(translate('success', language), translate('workRequestAccepted', language));
      } else {
        await fetchWorkRequests();
        Alert.alert(translate('error', language), data.error || translate('failedAcceptRequest', language));
      }
    } catch (error) {
      console.log('Error accepting request:', error);
      await fetchWorkRequests();
      Alert.alert(translate('error', language), translate('failedAcceptRequest', language));
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      // Optimistically remove from newRequests
      setNewRequests(prev => prev.filter(r => r.id !== requestId));

      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('access_token');
      
      const response = await fetch(
        API_ENDPOINTS.ORG_REQUEST_REJECT(requestId),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        await fetchWorkRequests();
        Alert.alert(translate('success', language), translate('workRequestRejected', language));
      } else {
        await fetchWorkRequests();
        Alert.alert(translate('error', language), data.error || translate('failedRejectRequest', language));
      }
    } catch (error) {
      console.log('Error rejecting request:', error);
      await fetchWorkRequests();
      Alert.alert(translate('error', language), translate('failedRejectRequest', language));
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[PURPLE]} />
      }
    >
      {/* HEADER */}
      <View style={styles.dashboardHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.menuButton}
            delayPressIn={0}
            onPress={onMenuPress}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="menu"
              size={28}
              color={PURPLE}
            />
          </TouchableOpacity>

          <View style={styles.headerUserInfo}>
            <Text style={styles.greeting}>
              {translate('hello', language)}, {userName}
            </Text>

            <Text style={styles.location}>
              {orgData ? orgData.org_name : translate('puneMaharashtra', language)}
            </Text>
          </View>
        </View>
      </View>

      {/* VOICE GUIDANCE (TTS) — labeled card below the greeting; speaks
          orgAdminVoiceGuidance on tap and stops on a second tap while
          speaking. TTS only, no STT. */}
      <View style={styles.orgAdminVoiceGuidanceWrap}>
        <VoiceGuidanceButton
          labeled
          text={translate('orgAdminVoiceGuidance', language)}
          language={language}
          title={translate('voiceAssistance', language)}
          subtitle={translate('orgAdminHearHowToUse', language)}
        />
      </View>

      {/* SEARCH */}
      <View style={styles.dashboardSearch}>
        <MaterialCommunityIcons
          name="magnify"
          size={23}
          color={MUTED}
        />

        <TextInput
          style={styles.dashboardSearchInput}
          placeholder={translate('searchWorkersRequests', language)}
          placeholderTextColor="#9996A4"
          value={search}
          onChangeText={setSearch}
        />

        <TouchableOpacity
          style={styles.searchButton}
          delayPressIn={0}
          onPress={() => go("search")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* QUICK ACTIONS - ORGANIZATION ADMIN */}
      <SectionTitle title={translate('quickActions', language)} />

      <View style={styles.quickActionsRow}>
        {/* ADD WORKER */}
        <TouchableOpacity
          style={styles.quickActionCard}
          delayPressIn={0}
          onPress={() => go("orgAddWorker")}
          activeOpacity={0.85}
        >
          <View style={styles.quickActionIcon}>
            <MaterialCommunityIcons
              name="account-plus-outline"
              size={24}
              color={PURPLE}
            />
          </View>
          <Text style={styles.quickActionText}>{translate('addWorker', language)}</Text>
        </TouchableOpacity>

        {/* PERFORMANCE */}
        <TouchableOpacity
          style={styles.quickActionCard}
          delayPressIn={0}
          onPress={() => go("orgPerformance")}
          activeOpacity={0.85}
        >
          <View style={styles.quickActionIcon}>
            <MaterialCommunityIcons
              name="chart-line"
              size={24}
              color={PURPLE}
            />
          </View>
          <Text style={styles.quickActionText}>{translate('performance', language)}</Text>
        </TouchableOpacity>

        {/* WORKERS LIST */}
        <TouchableOpacity
          style={styles.quickActionCard}
          delayPressIn={0}
          onPress={() => go("orgWorkersList")}
          activeOpacity={0.85}
        >
          <View style={styles.quickActionIcon}>
            <MaterialCommunityIcons
              name="account-group-outline"
              size={24}
              color={PURPLE}
            />
          </View>
          <Text style={styles.quickActionText}>{translate('workers', language)}</Text>
        </TouchableOpacity>
      </View>

      {/* NEW WORK REQUESTS (PENDING) */}
      <SectionTitle 
        title={translate('newWorkRequests', language)}
        count={newRequests.length}
      />

      {loading && newRequests.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="briefcase-clock-outline" size={48} color={MUTED} />
          <Text style={styles.emptyStateText}>{translate('loadingRequests', language)}</Text>
        </View>
      ) : newRequests.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="briefcase-check-outline" size={48} color={MUTED} />
          <Text style={styles.emptyStateText}>{translate('noNewRequests', language)}</Text>
          <Text style={styles.emptyStateSubtext}>{translate('newRequestsAppearHere', language)}</Text>
        </View>
      ) : (
        newRequests.map((request) => (
          <WorkRequestCard
            key={request.id}
            request={request}
            language={language}
            onAccept={() => handleAcceptRequest(request.id)}
            onReject={() => handleRejectRequest(request.id)}
            onViewDetails={handleViewRequestDetails}
            isPending={true}
          />
        ))
      )}

      {/* ACCEPTED WORK REQUESTS (TO ASSIGN) */}
      <SectionTitle 
        title={translate('acceptedWorkRequests', language)}
        count={acceptedRequests.length}
        action={translate('assignWorkers', language)}
      />

      {acceptedRequests.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="account-check-outline" size={48} color={MUTED} />
          <Text style={styles.emptyStateText}>{translate('noAcceptedRequests', language)}</Text>
          <Text style={styles.emptyStateSubtext}>{translate('acceptToAssignWorkers', language)}</Text>
        </View>
      ) : (
        acceptedRequests.map((request) => (
          <AcceptedRequestCard
            key={request.id}
            request={request}
            language={language}
            onAssign={() => go("orgAssignWork", { requestId: request.id })}
          />
        ))
      )}

      {/* COMPLETED WORK REQUESTS */}
      <SectionTitle 
        title={translate('completedWork', language)}
        count={completedRequests.length}
      />

      {completedRequests.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="briefcase-check" size={48} color={MUTED} />
          <Text style={styles.emptyStateText}>{translate('noCompletedWorkYet', language)}</Text>
          <Text style={styles.emptyStateSubtext}>{translate('completedWorkAppearHere', language)}</Text>
        </View>
      ) : (
        completedRequests.map((request) => (
          <CompletedRequestCard
            key={request.id}
            request={request}
            language={language}
            onViewDetails={handleViewRequestDetails}
          />
        ))
      )}

      <View style={{ height: verticalScale(30) }} />
    </ScrollView>
  );
}

/* ============================================================
   HELPER COMPONENTS
============================================================ */

// Work Request Card (Pending - with Accept/Reject buttons)
function WorkRequestCard({ request, onAccept, onReject, isPending, onViewDetails, language }) {
  return (
    <TouchableOpacity 
      style={styles.requestCard}
      delayPressIn={0}
      onPress={() => onViewDetails && onViewDetails(request)}
      activeOpacity={0.9}
    >
      <View style={styles.requestHeader}>
        <View style={styles.requestIconBox}>
          <MaterialCommunityIcons
            name="briefcase-outline"
            size={24}
            color={PURPLE}
          />
        </View>
        <View style={{ flex: 1, marginLeft: moderateScale(12) }}>
          <Text style={styles.requestClientName}>{request.client_name || translate('client', language)}</Text>
          <Text style={styles.requestWorkType}>{request.work_type || translate('workRequestFallback', language)}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={MUTED} />
      </View>

      <View style={styles.requestDetails}>
        <View style={styles.requestDetailRow}>
          <MaterialCommunityIcons name="phone" size={14} color={MUTED} />
          <Text style={styles.requestDetailText}>
            {request.client_contact || translate('noContact', language)}
          </Text>
        </View>

        <View style={styles.requestDetailRow}>
          <MaterialCommunityIcons name="clock-outline" size={14} color={MUTED} />
          <Text style={styles.requestDetailText}>
            {new Date(request.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {request.work_description && (
        <Text style={styles.requestDescription} numberOfLines={2}>
          {request.work_description}
        </Text>
      )}

      {isPending && (
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={[styles.requestButton, styles.rejectButton]}
            delayPressIn={0}
            onPress={(e) => {
              e.stopPropagation();
              onReject();
            }}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="close" size={18} color="#D94C4C" />
            <Text style={styles.rejectButtonText}>{translate('reject', language)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.requestButton, styles.acceptButton]}
            delayPressIn={0}
            onPress={(e) => {
              e.stopPropagation();
              onAccept();
            }}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="check" size={18} color="#fff" />
            <Text style={styles.acceptButtonText}>{translate('accept', language)}</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Accepted Request Card (with Assign button)
function AcceptedRequestCard({ request, onAssign, language }) {
  return (
    <TouchableOpacity
      style={styles.acceptedRequestCard}
      delayPressIn={0}
      onPress={onAssign}
      activeOpacity={0.85}
    >
      <View style={styles.acceptedRequestHeader}>
        <View style={styles.acceptedIconBox}>
          <MaterialCommunityIcons
            name="briefcase-check-outline"
            size={24}
            color="#24935D"
          />
        </View>
        <View style={{ flex: 1, marginLeft: moderateScale(12) }}>
          <Text style={styles.acceptedRequestTitle}>{request.work_type || translate('workFallback', language)}</Text>
          <Text style={styles.acceptedRequestClient}>{request.client_name || translate('client', language)}</Text>
        </View>
        <View style={styles.assignBadge}>
          <Text style={styles.assignBadgeText}>{translate('assign', language)}</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color={PURPLE} />
        </View>
      </View>

      {request.description && (
        <Text style={styles.acceptedRequestDescription} numberOfLines={1}>
          {request.description}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// Completed Request Card
function CompletedRequestCard({ request, onViewDetails, language }) {
  return (
    <TouchableOpacity
      style={styles.completedRequestCard}
      delayPressIn={0}
      onPress={() => onViewDetails && onViewDetails(request)}
      activeOpacity={0.85}
    >
      <View style={styles.completedRequestHeader}>
        <View style={styles.completedIconBox}>
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color="#24935D"
          />
        </View>
        <View style={{ flex: 1, marginLeft: moderateScale(12) }}>
          <Text style={styles.completedRequestTitle}>{request.work_type || translate('workFallback', language)}</Text>
          <Text style={styles.completedRequestClient}>{request.client_name || translate('client', language)}</Text>
        </View>
        <View style={styles.completedBadge}>
          <MaterialCommunityIcons name="check" size={14} color="#24935D" />
          <Text style={styles.completedBadgeText}>{translate('completed', language)}</Text>
        </View>
      </View>

      <View style={styles.completedDetails}>
        {request.completed_at && (
          <View style={styles.completedDetailRow}>
            <MaterialCommunityIcons name="calendar-check" size={14} color={MUTED} />
            <Text style={styles.completedDetailText}>
              {new Date(request.completed_at).toLocaleDateString()}
            </Text>
          </View>
        )}

        {request.total_amount && (
          <View style={styles.completedDetailRow}>
            <MaterialCommunityIcons name="cash" size={14} color={MUTED} />
            <Text style={styles.completedDetailText}>
              Rs. {request.total_amount}
            </Text>
          </View>
        )}

        {request.rating && (
          <View style={styles.completedDetailRow}>
            <MaterialCommunityIcons name="star" size={14} color="#FFA500" />
            <Text style={styles.completedDetailText}>
              {request.rating}/5
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  orgAdminVoiceGuidanceWrap: {
    marginTop: verticalScale(12),
    marginBottom: verticalScale(8),
  },

  dashboardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(5),
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  headerUserInfo: {
    marginLeft: moderateScale(10),
    flexShrink: 1,
  },

  menuButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: moderateScale(13),
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },

  greeting: {
    fontSize: moderateScale(21),
    fontWeight: "900",
    color: TEXT,
  },

  location: {
    fontSize: moderateScale(11),
    color: MUTED,
    marginTop: verticalScale(4),
  },

  notificationButton: {
    width: scale(42),
    height: scale(42),
    borderRadius: moderateScale(13),
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },

  notificationDot: {
    position: "absolute",
    right: moderateScale(8),
    top: verticalScale(7),
    width: scale(7),
    height: scale(7),
    borderRadius: scale(4),
    backgroundColor: "#D94C4C",
  },

  dashboardSearch: {
    minHeight: verticalScale(52),
    backgroundColor: "#fff",
    borderRadius: moderateScale(13),
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: moderateScale(13),
    paddingRight: moderateScale(6),
    marginTop: verticalScale(15),
    marginBottom: verticalScale(20),
    paddingVertical: verticalScale(6),
  },

  dashboardSearchInput: {
    flex: 1,
    minHeight: verticalScale(50),
    marginLeft: moderateScale(8),
    color: TEXT,
    fontSize: moderateScale(13),
  },

  searchButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(11),
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  // Quick Actions Row
  quickActionsRow: {
    flexDirection: "row",
    gap: moderateScale(10),
    marginBottom: verticalScale(20),
  },

  quickActionCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: BORDER,
    padding: moderateScale(14),
    alignItems: "center",
  },

  quickActionIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: moderateScale(13),
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(8),
  },

  quickActionText: {
    fontSize: moderateScale(11),
    fontWeight: "700",
    color: TEXT,
    textAlign: "center",
  },

  // Empty State
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: BORDER,
    padding: moderateScale(24),
    alignItems: "center",
    marginBottom: verticalScale(12),
  },

  emptyStateText: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: TEXT,
    marginTop: verticalScale(12),
  },

  emptyStateSubtext: {
    fontSize: moderateScale(11),
    color: MUTED,
    marginTop: verticalScale(4),
    textAlign: "center",
  },

  // Request Cards
  requestCard: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: BORDER,
    padding: moderateScale(14),
    marginBottom: verticalScale(10),
  },

  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(10),
  },

  requestIconBox: {
    width: scale(48),
    height: scale(48),
    borderRadius: moderateScale(13),
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  requestClientName: {
    fontSize: moderateScale(14),
    fontWeight: "900",
    color: TEXT,
  },

  requestWorkType: {
    fontSize: moderateScale(11),
    color: PURPLE,
    fontWeight: "600",
    marginTop: verticalScale(2),
  },

  requestDetails: {
    flexDirection: "row",
    gap: moderateScale(12),
    marginBottom: verticalScale(8),
  },

  requestDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
  },

  requestDetailText: {
    fontSize: moderateScale(10),
    color: MUTED,
  },

  requestDescription: {
    fontSize: moderateScale(11),
    color: TEXT,
    lineHeight: moderateScale(16),
    marginBottom: verticalScale(12),
  },

  requestActions: {
    flexDirection: "row",
    gap: moderateScale(8),
  },

  requestButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(6),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(10),
  },

  rejectButton: {
    backgroundColor: "#FFF1F1",
    borderWidth: 1,
    borderColor: "#FFE0E0",
  },

  rejectButtonText: {
    fontSize: moderateScale(12),
    fontWeight: "700",
    color: "#D94C4C",
  },

  acceptButton: {
    backgroundColor: PURPLE,
  },

  acceptButtonText: {
    fontSize: moderateScale(12),
    fontWeight: "700",
    color: "#fff",
  },

  // Accepted Request Card
  acceptedRequestCard: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: BORDER,
    padding: moderateScale(14),
    marginBottom: verticalScale(10),
  },

  acceptedRequestHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  acceptedIconBox: {
    width: scale(48),
    height: scale(48),
    borderRadius: moderateScale(13),
    backgroundColor: "#F0FAF5",
    alignItems: "center",
    justifyContent: "center",
  },

  acceptedRequestTitle: {
    fontSize: moderateScale(14),
    fontWeight: "900",
    color: TEXT,
  },

  acceptedRequestClient: {
    fontSize: moderateScale(11),
    color: MUTED,
    marginTop: verticalScale(2),
  },

  acceptedRequestDescription: {
    fontSize: moderateScale(11),
    color: TEXT,
    marginTop: verticalScale(10),
  },

  assignBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
    backgroundColor: LIGHT_PURPLE,
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(8),
  },

  assignBadgeText: {
    fontSize: moderateScale(11),
    fontWeight: "700",
    color: PURPLE,
  },

  // Completed Request Card
  completedRequestCard: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: BORDER,
    padding: moderateScale(14),
    marginBottom: verticalScale(10),
  },

  completedRequestHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(10),
  },

  completedIconBox: {
    width: scale(48),
    height: scale(48),
    borderRadius: moderateScale(13),
    backgroundColor: "#F0FAF5",
    alignItems: "center",
    justifyContent: "center",
  },

  completedRequestTitle: {
    fontSize: moderateScale(14),
    fontWeight: "900",
    color: TEXT,
  },

  completedRequestClient: {
    fontSize: moderateScale(11),
    color: MUTED,
    marginTop: verticalScale(2),
  },

  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
    backgroundColor: "#F0FAF5",
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(8),
  },

  completedBadgeText: {
    fontSize: moderateScale(11),
    fontWeight: "700",
    color: "#24935D",
  },

  completedDetails: {
    flexDirection: "row",
    gap: moderateScale(12),
    flexWrap: "wrap",
  },

  completedDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
  },

  completedDetailText: {
    fontSize: moderateScale(10),
    color: MUTED,
  },
});
