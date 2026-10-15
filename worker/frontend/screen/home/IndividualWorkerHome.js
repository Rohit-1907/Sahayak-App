import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale, wp } from '../../utils/responsive';
import { API_ENDPOINTS } from '../../config/api';
import AvailabilityToggle from '../../components/AvailabilityToggle';
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
   INDIVIDUAL WORKER HOME
   
   For independent workers who do NOT belong to any organization.
   Shows: Client work requests, performance, calendar, recommended jobs.
   Removes: Organization features, Add Worker, Worker Login.
============================================================ */

let homeIntroSpoken = false;

export default function IndividualWorkerHome({
  go,
  setSelectedJob,
  SectionTitle,
  JobCard,
  onMenuPress,  // Add this prop for menu functionality
  language = "English",
}) {
  const [requestCount, setRequestCount] = React.useState(0);
  const [scheduledCount, setScheduledCount] = React.useState(0);
  const [scheduledRequests, setScheduledRequests] = React.useState([]);
  const [completedRequests, setCompletedRequests] = React.useState([]);
  const [completedCount, setCompletedCount] = React.useState(0);
  const [userName, setUserName] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  // TTS greeting (one-time) + tap-only Voice Assistance. Never speaks
  // names or other dynamic personal/job data.
  const { speak: speakHome, stop: stopHome } = useTextToSpeech(language);

  React.useEffect(() => {
    if (homeIntroSpoken) {
      return;
    }
    homeIntroSpoken = true;
    const intro =
      translate('welcomeToSahayak', language) + ' ' +
      translate('homeGuidancePrompt', language);
    speakHome(intro);
    return () => {
      stopHome();
    };
  }, [language, speakHome, stopHome]);

  // Fetch real request count and user data
  React.useEffect(() => {
    let isMounted = true;
    const loadCacheAndFetch = async () => {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const [userData, cachedReqCount, cachedSched, cachedComp] = await Promise.all([
          AsyncStorage.getItem('user_data'),
          AsyncStorage.getItem('cached_request_count'),
          AsyncStorage.getItem('cached_scheduled_requests'),
          AsyncStorage.getItem('cached_completed_requests'),
        ]);

        if (!isMounted) return;

        if (userData) {
          const user = JSON.parse(userData);
          const fullName = user.full_name || user.username || 'User';
          setUserName(fullName.split(' ')[0]);
        }
        if (cachedReqCount !== null) {
          setRequestCount(Number(cachedReqCount) || 0);
        }
        if (cachedSched) {
          const parsed = JSON.parse(cachedSched);
          setScheduledCount(parsed.total || 0);
          setScheduledRequests(parsed.work_requests || []);
        }
        if (cachedComp) {
          const parsed = JSON.parse(cachedComp);
          setCompletedCount(parsed.total || 0);
          setCompletedRequests(parsed.work_requests || []);
        }
        if (userData || cachedSched || cachedComp) {
          setLoading(false);
        }
      } catch (e) {
        // Cache fallback
      }

      // Fetch fresh data in background
      Promise.all([
        fetchUserData(),
        fetchRequestCount(),
        fetchScheduledRequests(),
        fetchCompletedRequests(),
      ]).finally(() => {
        if (isMounted) setLoading(false);
      });
    };

    loadCacheAndFetch();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchUserData = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const userData = await AsyncStorage.getItem('user_data');
      
      if (userData) {
        const user = JSON.parse(userData);
        // Extract first name from full_name or use username
        const fullName = user.full_name || user.username || 'User';
        const firstName = fullName.split(' ')[0];
        setUserName(firstName);
      }
    } catch (error) {
      console.log('Error fetching user data:', error);
      setUserName('User');
    }
  };

  const fetchRequestCount = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('access_token');
      
      if (token) {
        const response = await fetch(
          `${API_ENDPOINTS.JOBS_WORK_REQUESTS}?status=REQUESTED`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        const data = await response.json();
        if (data.success) {
          setRequestCount(data.total || 0);
          AsyncStorage.setItem('cached_request_count', String(data.total || 0)).catch(() => {});
        }
      }
    } catch (error) {
      console.log('Error fetching request count:', error);
    }
  };

  const fetchScheduledRequests = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      // Check cache first
      const cachedData = await AsyncStorage.getItem('cached_scheduled_requests');
      if (cachedData) {
        const cached = JSON.parse(cachedData);
        const cacheAge = Date.now() - new Date(cached.timestamp).getTime();
        
        // Use cache if less than 5 minutes old
        if (cacheAge < 5 * 60 * 1000) {
          setScheduledCount(cached.total || 0);
          setScheduledRequests(cached.work_requests || []);
          // Still fetch in background to update
        }
      }

      const token = await AsyncStorage.getItem('access_token');
      
      if (token) {
        const response = await fetch(
          `${API_ENDPOINTS.JOBS_WORK_REQUESTS}?status=SCHEDULED`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        const data = await response.json();
        if (data.success) {
          setScheduledCount(data.total || 0);
          setScheduledRequests(data.work_requests || []);
          
          // Update cache
          await AsyncStorage.setItem('cached_scheduled_requests', JSON.stringify({
            total: data.total,
            work_requests: data.work_requests,
            timestamp: new Date().toISOString(),
          }));
        }
      }
    } catch (error) {
      console.log('Error fetching scheduled requests:', error);
    }
  };

  const fetchCompletedRequests = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      // Check cache first
      const cachedData = await AsyncStorage.getItem('cached_completed_requests');
      if (cachedData) {
        const cached = JSON.parse(cachedData);
        const cacheAge = Date.now() - new Date(cached.timestamp).getTime();
        
        // Use cache if less than 10 minutes old (completed jobs change less frequently)
        if (cacheAge < 10 * 60 * 1000) {
          setCompletedCount(cached.total || 0);
          setCompletedRequests(cached.work_requests || []);
          // Still fetch in background to update
        }
      }

      const token = await AsyncStorage.getItem('access_token');
      
      if (token) {
        const response = await fetch(
          `${API_ENDPOINTS.JOBS_WORK_REQUESTS}?status=COMPLETED`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        const data = await response.json();
        if (data.success) {
          setCompletedCount(data.total || 0);
          setCompletedRequests(data.work_requests || []);
          
          // Update cache
          await AsyncStorage.setItem('cached_completed_requests', JSON.stringify({
            total: data.total,
            work_requests: data.work_requests,
            timestamp: new Date().toISOString(),
          }));
        }
      }
    } catch (error) {
      console.log('Error fetching completed requests:', error);
    }
  };

  return (
    <View>
      {/* HEADER */}
      <View style={styles.dashboardHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={onMenuPress || (() => {})} // Open sidebar menu
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
              {translate('hello', language)}, {userName || translate('user', language)}
            </Text>

            <Text style={styles.location}>
              {translate('puneMaharashtra', language)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.homeVoiceGuidanceWrap}>
        <VoiceGuidanceButton
          labeled
          text={translate('homeVoiceGuidance', language)}
          language={language}
          title={translate('voiceAssistance', language)}
          subtitle={translate('homeHearHowToUse', language)}
        />
      </View>

      {/* AVAILABILITY TOGGLE - NEW */}
      <AvailabilityToggle
        onStatusChange={(available) => {
          console.log('Availability changed:', available);
          // Parent component can handle status change if needed
        }}
        language={language}
      />

      {/* WORK REQUESTS - CLIENT ONLY */}
      <SectionTitle
        title={translate('workRequests', language)}
        action={translate('seeAll', language)}
        onPress={() => go("requests")}
      />

      <View style={styles.requestCard}>
        <View style={styles.requestIconBox}>
          <MaterialCommunityIcons
            name="briefcase-account-outline"
            size={27}
            color={PURPLE}
          />
        </View>

        <View style={styles.requestContent}>
          <Text style={styles.requestTitle}>
            {translate('newWorkRequests', language)}
          </Text>

          <Text style={styles.requestSubtitle}>
            {translate('clientsSentRequests', language)}
          </Text>

          <View style={styles.requestStats}>
            <View style={styles.requestStat}>
              <MaterialCommunityIcons
                name="account-outline"
                size={16}
                color={PURPLE}
              />

              <Text style={styles.requestStatText}>
                {requestCount} {requestCount === 1 ? translate('client', language) : translate('clients', language)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.requestActions}>
          <View style={styles.requestNumber}>
            <Text style={styles.requestNumberText}>
              {requestCount}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.requestPlus}
            onPress={() => go("requests")}
          >
            <MaterialCommunityIcons
              name="plus"
              size={21}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* SCHEDULED WORK REQUESTS */}
      {loading ? (
        <View style={{ marginTop: verticalScale(12) }}>
          <SectionTitle title={translate('scheduledWork', language)} />
          <View style={styles.skeletonCard}>
            <View style={styles.skeletonRow}>
              <View style={styles.skeletonCircle} />
              <View style={styles.skeletonContent}>
                <View style={styles.skeletonLine} />
                <View style={[styles.skeletonLine, { width: '60%', marginTop: 8 }]} />
              </View>
            </View>
          </View>
        </View>
      ) : scheduledCount > 0 && scheduledRequests.length > 0 ? (
        <View style={{ marginTop: verticalScale(12) }}>
          <SectionTitle
            title={translate('scheduledWork', language)}
            action={scheduledCount > 1 ? `${scheduledCount} ${translate('jobs', language)}` : ""}
            onPress={scheduledCount > 1 ? () => go("calendar") : null}
          />
          
          {scheduledRequests.map((request) => (
            <TouchableOpacity
              key={request.id}
              style={styles.scheduledJobCard}
              onPress={() => {
                console.log('[LOC] Clicked scheduled job:', request.id);
                go("workerJobDetails", { requestId: request.id });
              }}
              activeOpacity={0.85}
            >
              <View style={styles.scheduledJobHeader}>
                <View style={styles.scheduledJobIcon}>
                  <MaterialCommunityIcons
                    name="calendar-check"
                    size={20}
                    color="#24935D"
                  />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={styles.scheduledJobTitle}>
                    {request.service_category}
                  </Text>
                  
                    <Text style={styles.scheduledJobClient}>
                      {request.client_name || translate('client', language)}
                    </Text>
                </View>

                <View style={styles.scheduledBadge}>
                  <Text style={styles.scheduledBadgeText}>{translate('scheduled', language)}</Text>
                </View>
              </View>

              <View style={styles.scheduledJobDetails}>
                <View style={styles.scheduledJobDetailItem}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={14}
                    color={MUTED}
                  />
                  <Text style={styles.scheduledJobDetailText}>
                    {new Date(request.required_date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </View>

                <View style={styles.scheduledJobDetailItem}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={14}
                    color={MUTED}
                  />
                    <Text style={styles.scheduledJobDetailText}>
                      {request.required_time || translate('tbd', language)}
                    </Text>
                </View>

                <View style={styles.scheduledJobDetailItem}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={14}
                    color={MUTED}
                  />
                    <Text style={styles.scheduledJobDetailText} numberOfLines={1}>
                      {request.work_address ? request.work_address.split(',')[0] : translate('location', language)}
                    </Text>
                </View>
              </View>

              {request.estimated_budget && (
                <View style={styles.scheduledJobBudget}>
                  <MaterialCommunityIcons
                    name="currency-inr"
                    size={16}
                    color="#24935D"
                  />
                  <Text style={styles.scheduledJobBudgetText}>
                    Rs. {request.estimated_budget}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {/* PERFORMANCE */}
      <SectionTitle title={translate('performance', language)} />

      <TouchableOpacity
        style={styles.workerActionCard}
        onPress={() => go("performance")}
        activeOpacity={0.85}
      >
        <View style={styles.workerActionIconBox}>
          <MaterialCommunityIcons
            name="chart-line"
            size={27}
            color={PURPLE}
          />
        </View>

        <View style={styles.workerActionContent}>
          <Text style={styles.workerActionTitle}>
            {translate('performance', language)}
          </Text>

          <Text style={styles.workerActionSubtitle}>
            {translate('trackWorkPerformance', language)}
          </Text>
        </View>

        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={MUTED}
        />
      </TouchableOpacity>

      {/* CALENDAR */}
      <SectionTitle
        title={translate('myCalendar', language)}
        action={translate('viewAll', language)}
        onPress={() => go("calendar")}
      />

      <View style={styles.calendarDashboardCard}>
        <View style={styles.calendarHeaderRow}>
          <View>
            <Text style={styles.calendarHeading}>
              {translate('upcomingWork', language)}
            </Text>

            <Text style={styles.calendarSubHeading}>
              {translate('yourScheduledJobs', language)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.calendarIcon}
            onPress={() => go("calendar")}
          >
            <MaterialCommunityIcons
              name="calendar-month-outline"
              size={25}
              color={PURPLE}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarWeek}>
          {(() => {
            // Get current date and generate next 5 days
            const today = new Date();
            const days = [];
              const dayNames = [translate('sunday', language), translate('monday', language), translate('tuesday', language), translate('wednesday', language), translate('thursday', language), translate('friday', language), translate('saturday', language)];
            
            for (let i = 0; i < 5; i++) {
              const date = new Date(today);
              date.setDate(today.getDate() + i);
              days.push({
                day: dayNames[date.getDay()],
                date: date.getDate().toString(),
                isToday: i === 0,
              });
            }
            
            return days.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  item.isToday && styles.calendarDayActive,
                ]}
                onPress={() => go("calendar")}
              >
                <Text
                  style={[
                    styles.calendarDayName,
                    item.isToday && styles.calendarActiveText,
                  ]}
                >
                  {item.day}
                </Text>

                <Text
                  style={[
                    styles.calendarDate,
                    item.isToday && styles.calendarActiveText,
                  ]}
                >
                  {item.date}
                </Text>

                {item.isToday && (
                  <View style={styles.calendarDot} />
                )}
              </TouchableOpacity>
            ));
          })()}
        </View>

        {/* Upcoming jobs will show real scheduled work requests */}
        {requestCount > 0 && (
          <TouchableOpacity
            style={styles.upcomingJob}
            onPress={() => go("requests")}
            activeOpacity={0.85}
          >
            <View style={styles.upcomingJobLine} />

            <View style={{ flex: 1 }}>
              <Text style={styles.upcomingJobTitle}>
                {translate('viewYourWorkRequests', language)}
              </Text>

              <Text style={styles.upcomingJobTime}>
                {requestCount} {requestCount === 1 ? translate('request', language) : translate('requests', language)} {translate('pending', language)}
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={MUTED}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* RECOMMENDED JOBS - Removed hardcoded jobs */}
      {/* Jobs will be shown in the Jobs screen instead */}

      {/* COMPLETED WORK SECTION */}
      {loading ? (
        <View style={{ marginTop: verticalScale(8) }}>
          <SectionTitle title={translate('completedWork', language)} />
          <View style={styles.skeletonCard}>
            <View style={styles.skeletonRow}>
              <View style={styles.skeletonCircle} />
              <View style={styles.skeletonContent}>
                <View style={styles.skeletonLine} />
                <View style={[styles.skeletonLine, { width: '60%', marginTop: 8 }]} />
              </View>
            </View>
          </View>
        </View>
      ) : completedCount > 0 && completedRequests.length > 0 ? (
        <View style={{ marginTop: verticalScale(8) }}>
          <SectionTitle
            title={translate('completedWork', language)}
            action={completedCount > 1 ? `${completedCount} ${translate('jobs', language)}` : ""}
            onPress={completedCount > 1 ? () => go("performance") : null}
          />
          
          {completedRequests.slice(0, 3).map((request) => (
            <TouchableOpacity
              key={request.id}
              style={styles.completedJobCard}
              onPress={() => {
                console.log('[LOC] Clicked completed job:', request.id);
                go("workerJobDetails", { requestId: request.id });
              }}
              activeOpacity={0.85}
            >
              <View style={styles.completedJobHeader}>
                <View style={styles.completedJobIcon}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color="#16A34A"
                  />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={styles.completedJobTitle}>
                    {request.service_category}
                  </Text>
                  
                    <Text style={styles.completedJobClient}>
                      {request.client_name || translate('client', language)}
                    </Text>
                </View>

                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>{translate('completed', language)}</Text>
                </View>
              </View>

              <View style={styles.completedJobDetails}>
                <View style={styles.completedJobDetailItem}>
                  <MaterialCommunityIcons
                    name="calendar-check"
                    size={14}
                    color={MUTED}
                  />
                  <Text style={styles.completedJobDetailText}>
                    {new Date(request.completed_at || request.updated_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </View>

                {request.work_address && (
                  <View style={styles.completedJobDetailItem}>
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={14}
                      color={MUTED}
                    />
                    <Text style={styles.completedJobDetailText} numberOfLines={1}>
                      {request.work_address.split(',')[0]}
                    </Text>
                  </View>
                )}
              </View>

              {request.final_price && (
                <View style={styles.completedJobEarnings}>
                  <MaterialCommunityIcons
                    name="currency-inr"
                    size={16}
                    color="#16A34A"
                  />
                  <Text style={styles.completedJobEarningsText}>
                    Rs. {request.final_price} earned
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      <View style={{ height: verticalScale(30) }} />
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
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

  homeVoiceGuidanceWrap: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
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

  requestCard: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: BORDER,
    padding: moderateScale(14),
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(10),
  },

  requestIconBox: {
    width: scale(52),
    height: scale(52),
    borderRadius: moderateScale(15),
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  requestContent: {
    flex: 1,
    marginLeft: moderateScale(11),
  },

  requestTitle: {
    fontSize: moderateScale(14),
    fontWeight: "900",
    color: TEXT,
  },

  requestSubtitle: {
    fontSize: moderateScale(10),
    color: MUTED,
    marginTop: verticalScale(3),
  },

  requestStats: {
    flexDirection: "row",
    gap: moderateScale(10),
    marginTop: verticalScale(8),
  },

  requestStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(3),
  },

  requestStatText: {
    fontSize: moderateScale(9),
    color: MUTED,
    fontWeight: "700",
  },

  requestActions: {
    alignItems: "center",
    gap: verticalScale(8),
  },

  requestNumber: {
    width: scale(29),
    height: scale(29),
    borderRadius: scale(15),
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  requestNumberText: {
    color: PURPLE,
    fontWeight: "900",
    fontSize: moderateScale(12),
  },

  requestPlus: {
    width: scale(37),
    height: scale(37),
    borderRadius: moderateScale(11),
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  smallRequestCard: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(13),
    borderWidth: 1,
    borderColor: BORDER,
    padding: moderateScale(13),
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(15),
  },

  smallRequestIcon: {
    width: scale(43),
    height: scale(43),
    borderRadius: moderateScale(12),
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: moderateScale(11),
  },

  smallRequestTitle: {
    fontSize: moderateScale(13),
    fontWeight: "900",
    color: TEXT,
  },

  smallRequestText: {
    fontSize: moderateScale(10),
    color: MUTED,
    marginTop: verticalScale(3),
  },

  workerActionCard: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(13),
    borderWidth: 1,
    borderColor: BORDER,
    padding: moderateScale(13),
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(10),
  },

  workerActionIconBox: {
    width: scale(49),
    height: scale(49),
    borderRadius: moderateScale(14),
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  workerActionContent: {
    flex: 1,
    marginLeft: moderateScale(12),
  },

  workerActionTitle: {
    fontSize: moderateScale(13),
    fontWeight: "900",
    color: TEXT,
  },

  workerActionSubtitle: {
    fontSize: moderateScale(10),
    color: MUTED,
    marginTop: verticalScale(3),
  },

  calendarDashboardCard: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: BORDER,
    padding: moderateScale(14),
    marginBottom: verticalScale(18),
  },

  calendarHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(14),
  },

  calendarHeading: {
    fontSize: moderateScale(14),
    fontWeight: "900",
    color: TEXT,
  },

  calendarSubHeading: {
    fontSize: moderateScale(10),
    color: MUTED,
    marginTop: verticalScale(3),
  },

  calendarIcon: {
    width: scale(38),
    height: scale(38),
    borderRadius: moderateScale(11),
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  calendarWeek: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(13),
  },

  calendarDay: {
    flex: 1,
    alignItems: "center",
    paddingVertical: verticalScale(9),
    borderRadius: moderateScale(12),
    marginHorizontal: moderateScale(2),
  },

  calendarDayActive: {
    backgroundColor: PURPLE,
  },

  calendarDayName: {
    fontSize: moderateScale(9),
    fontWeight: "900",
    color: MUTED,
    marginBottom: verticalScale(3),
  },

  calendarDate: {
    fontSize: moderateScale(14),
    fontWeight: "900",
    color: TEXT,
  },

  calendarActiveText: {
    color: "#fff",
  },

  calendarDot: {
    width: scale(4),
    height: scale(4),
    borderRadius: scale(2),
    backgroundColor: "#fff",
    marginTop: verticalScale(4),
  },

  upcomingJob: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(11),
    paddingHorizontal: moderateScale(12),
    backgroundColor: "#F8FAFC",
    borderRadius: moderateScale(12),
  },

  upcomingJobLine: {
    width: scale(3),
    height: verticalScale(48),
    backgroundColor: PURPLE,
    borderRadius: moderateScale(2),
    marginRight: moderateScale(11),
  },

  upcomingJobTitle: {
    fontSize: moderateScale(12),
    fontWeight: "900",
    color: TEXT,
  },

  upcomingJobTime: {
    fontSize: moderateScale(10),
    color: MUTED,
    marginTop: verticalScale(3),
  },

  upcomingJobPrice: {
    fontSize: moderateScale(11),
    color: "#24935D",
    fontWeight: "700",
    marginTop: verticalScale(3),
  },

  // Scheduled job card styles
  scheduledJobCard: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: BORDER,
    padding: moderateScale(14),
    marginBottom: verticalScale(10),
  },

  scheduledJobHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(10),
  },

  scheduledJobIcon: {
    width: scale(38),
    height: scale(38),
    borderRadius: moderateScale(10),
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: moderateScale(10),
  },

  scheduledJobTitle: {
    fontSize: moderateScale(14),
    fontWeight: "900",
    color: TEXT,
  },

  scheduledJobClient: {
    fontSize: moderateScale(11),
    color: MUTED,
    marginTop: verticalScale(2),
  },

  scheduledBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(6),
  },

  scheduledBadgeText: {
    fontSize: moderateScale(8),
    fontWeight: "900",
    color: "#24935D",
  },

  scheduledJobDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: moderateScale(10),
    marginBottom: verticalScale(10),
  },

  scheduledJobDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
  },

  scheduledJobDetailText: {
    fontSize: moderateScale(11),
    color: MUTED,
  },

  scheduledJobBudget: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(8),
    alignSelf: "flex-start",
  },

  scheduledJobBudgetText: {
    fontSize: moderateScale(13),
    fontWeight: "900",
    color: "#24935D",
    marginLeft: moderateScale(2),
  },

  // Completed job card styles
  completedJobCard: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: BORDER,
    padding: moderateScale(14),
    marginBottom: verticalScale(10),
  },

  completedJobHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(10),
  },

  completedJobIcon: {
    width: scale(38),
    height: scale(38),
    borderRadius: moderateScale(10),
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: moderateScale(10),
  },

  completedJobTitle: {
    fontSize: moderateScale(14),
    fontWeight: "900",
    color: TEXT,
  },

  completedJobClient: {
    fontSize: moderateScale(11),
    color: MUTED,
    marginTop: verticalScale(2),
  },

  completedBadge: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(6),
  },

  completedBadgeText: {
    fontSize: moderateScale(8),
    fontWeight: "900",
    color: "#16A34A",
  },

  completedJobDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: moderateScale(10),
    marginBottom: verticalScale(10),
  },

  completedJobDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
  },

  completedJobDetailText: {
    fontSize: moderateScale(11),
    color: MUTED,
  },

  completedJobEarnings: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(8),
    alignSelf: "flex-start",
  },

  completedJobEarningsText: {
    fontSize: moderateScale(13),
    fontWeight: "900",
    color: "#16A34A",
    marginLeft: moderateScale(2),
  },

  // Skeleton loading styles
  skeletonCard: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: BORDER,
    padding: moderateScale(14),
    marginBottom: verticalScale(10),
  },

  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  skeletonCircle: {
    width: scale(38),
    height: scale(38),
    borderRadius: moderateScale(10),
    backgroundColor: "#E5E7EB",
  },

  skeletonContent: {
    flex: 1,
    marginLeft: moderateScale(10),
  },

  skeletonLine: {
    height: verticalScale(12),
    backgroundColor: "#E5E7EB",
    borderRadius: moderateScale(4),
  },
});
