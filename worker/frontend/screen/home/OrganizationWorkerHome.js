import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale, wp } from '../../utils/responsive';
import { translate } from '../../utils/translations';
import { useTextToSpeech } from '../../utils/useTextToSpeech';
import VoiceGuidanceButton from '../../components/VoiceGuidanceButton';
import { API_ENDPOINTS } from '../../config/api';

/* ============================================================
   COLORS
============================================================ */

const PURPLE = "#49769F";
const LIGHT_PURPLE = "#EEF4F8";
const TEXT = "#111827";
const MUTED = "#6B7280";
const BORDER = "#E0E7ED";

/* ============================================================
   ORGANIZATION WORKER HOME
   
   For workers who belong to an organization.
   Shows: Assigned work by admin, work progress, completed work.
   Removes: Client requests, availability toggle (managed by admin).
============================================================ */

// Session-level guard (module scope): the automatic spoken intro plays
// at most ONCE per app session and is separate from the Voice Guidance
// button, which repeats the full guidance on tap. TTS only, no STT.
let orgWorkerIntroSpoken = false;

export default function OrganizationWorkerHome({
  screen,
  go,
  search,
  setSearch,
  setSelectedJob,
  SectionTitle,
  JobCard,
  onMenuPress,
  language = "English",
}) {
  const [assignedCount, setAssignedCount] = React.useState(0);
  const [inProgressCount, setInProgressCount] = React.useState(0);
  const [assignedWork, setAssignedWork] = React.useState([]);
  const [inProgressWork, setInProgressWork] = React.useState([]);
  const [completedWork, setCompletedWork] = React.useState([]);
  const [completedCount, setCompletedCount] = React.useState(0);
  const [userName, setUserName] = React.useState('');
  const [orgName, setOrgName] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  // VOICE GUIDANCE (TTS)
  // Automatic spoken intro runs at most once per app session (module-scope
  // guard); the reusable Voice Guidance button speaks screen help on tap.
  const { speak: speakOrgWorker, stop: stopOrgWorker } = useTextToSpeech(language);

  React.useEffect(() => {
    if (orgWorkerIntroSpoken) {
      return;
    }

    // Only speak when this screen actually owns the Dashboard home area.
    if (screen && screen !== 'home') {
      return;
    }

    orgWorkerIntroSpoken = true;

    const spokenIntro = translate('orgWorkerAutoIntro', language);

    speakOrgWorker(spokenIntro);

    return () => {
      stopOrgWorker();
    };
  }, [screen, language, speakOrgWorker, stopOrgWorker]);

  // Fetch organization worker data
  React.useEffect(() => {
    const loadCache = async () => {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const cached = await AsyncStorage.getItem('@cache_org_worker_home');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.userName) setUserName(parsed.userName);
          if (parsed.orgName) setOrgName(parsed.orgName);
          if (parsed.assignedWork) setAssignedWork(parsed.assignedWork);
          if (parsed.assignedCount !== undefined) setAssignedCount(parsed.assignedCount);
          if (parsed.inProgressWork) setInProgressWork(parsed.inProgressWork);
          if (parsed.inProgressCount !== undefined) setInProgressCount(parsed.inProgressCount);
          if (parsed.completedWork) setCompletedWork(parsed.completedWork);
          if (parsed.completedCount !== undefined) setCompletedCount(parsed.completedCount);
          setLoading(false);
        }
      } catch (e) {}
    };
    loadCache();

    Promise.all([
      fetchUserData(),
      fetchAssignedWork(),
      fetchInProgressWork(),
      fetchCompletedWork(),
    ]).then(() => {
      setLoading(false);
    });
  }, []);

  const fetchUserData = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const workerDataStr = await AsyncStorage.getItem('worker_data');
      
      if (workerDataStr) {
        const worker = JSON.parse(workerDataStr);
        console.log('[USER] Organization Worker Data:', worker);
        
        const fullName = worker.full_name || worker.username || translate('worker', language);
        const firstName = fullName.split(' ')[0];
        setUserName(firstName);
        
        // Get organization name from worker data
        const orgName = worker.organization_name || worker.organization?.name || translate('organization', language);
        setOrgName(orgName);
      }
    } catch (error) {
      console.log('Error fetching worker data:', error);
      setUserName(translate('worker', language));
      setOrgName(translate('organization', language));
    }
  };

  const fetchAssignedWork = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('access_token');
      const workerDataStr = await AsyncStorage.getItem('worker_data');
      
      if (token && workerDataStr) {
        const workerData = JSON.parse(workerDataStr);
        const workerId = workerData.id;
        
        console.log('[TASK] Fetching assigned work for worker ID:', workerId);
        
        // Fetch assigned work from API
        const response = await fetch(
          API_ENDPOINTS.ORG_WORKER_ASSIGNED(workerId),
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Worker-ID': workerId.toString(),
            },
          }
        );
        
        const data = await response.json();
        console.log('[TASK] Assigned Work Response:', data);
        
        if (data.success && data.work) {
          setAssignedCount(data.total || data.work.length || 0);
          setAssignedWork(data.work || []);
        } else {
          // No data - start with empty
          console.log('No assigned work found');
          setAssignedCount(0);
          setAssignedWork([]);
        }
      } else {
        // No token - empty state
        setAssignedCount(0);
        setAssignedWork([]);
      }
    } catch (error) {
      console.log('Error fetching assigned work:', error);
      // On error, show empty state
      setAssignedCount(0);
      setAssignedWork([]);
    }
  };

  const fetchInProgressWork = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('access_token');
      const workerDataStr = await AsyncStorage.getItem('worker_data');
      
      if (token && workerDataStr) {
        const workerData = JSON.parse(workerDataStr);
        const workerId = workerData.id;
        
        console.log('[WAIT] Fetching in-progress work for worker ID:', workerId);
        
        const response = await fetch(
          API_ENDPOINTS.ORG_WORKER_IN_PROGRESS(workerId),
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Worker-ID': workerId.toString(),
            },
          }
        );
        
        const data = await response.json();
        console.log('[WAIT] In Progress Work Response:', data);
        
        if (data.success && data.work) {
          setInProgressCount(data.total || data.work.length || 0);
          setInProgressWork(data.work || []);
        } else {
          // No data - start with empty
          console.log('No in-progress work found');
          setInProgressCount(0);
          setInProgressWork([]);
        }
      } else {
        setInProgressCount(0);
        setInProgressWork([]);
      }
    } catch (error) {
      console.log('Error fetching in-progress work:', error);
      // On error, show empty state
      setInProgressCount(0);
      setInProgressWork([]);
    }
  };

  const fetchCompletedWork = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('access_token');
      const workerDataStr = await AsyncStorage.getItem('worker_data');
      
      if (token && workerDataStr) {
        const workerData = JSON.parse(workerDataStr);
        const workerId = workerData.id;
        
        console.log('[OK] Fetching completed work for worker ID:', workerId);
        
        const response = await fetch(
          API_ENDPOINTS.ORG_WORKER_COMPLETED(workerId),
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Worker-ID': workerId.toString(),
            },
          }
        );
        
        const data = await response.json();
        console.log('[OK] Completed Work Response:', data);
        
        if (data.success && data.work) {
          setCompletedCount(data.total || data.work.length || 0);
          setCompletedWork(data.work || []);
        } else {
          // No data - start with empty
          console.log('No completed work found');
          setCompletedCount(0);
          setCompletedWork([]);
        }
      } else {
        setCompletedCount(0);
        setCompletedWork([]);
      }
    } catch (error) {
      console.log('Error fetching completed work:', error);
      // On error, show empty state
      setCompletedCount(0);
      setCompletedWork([]);
    }
  };

  return (
    <View>
      {/* HEADER */}
      <View style={styles.dashboardHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.menuButton}
            delayPressIn={0}
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
              {translate('hello', language)}, {userName || translate('worker', language)}
            </Text>

            <Text style={styles.location}>
              {orgName}
            </Text>
          </View>
        </View>
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
          placeholder={translate('searchAssignedWork', language)}
          placeholderTextColor="#9996A4"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => go("search")}
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

      {/* VOICE GUIDANCE (TTS) — labeled card in the content area; speaks
          orgWorkerVoiceGuidance on tap and stops on a second tap while
          speaking. TTS only, no STT. */}
      <View style={styles.orgWorkerVoiceGuidanceWrap}>
        <VoiceGuidanceButton
          labeled
          text={translate('orgWorkerVoiceGuidance', language)}
          language={language}
          title={translate('voiceAssistance', language)}
          subtitle={translate('orgWorkerHearHowToUse', language)}
        />
      </View>

      {/* ASSIGNED WORK BY ADMIN */}
      <SectionTitle
        title={translate('assignedWork', language)}
        action={translate('seeAll', language)}
        onPress={null}
      />

      <View style={styles.requestCard}>
        <View style={styles.requestIconBox}>
          <MaterialCommunityIcons
            name="clipboard-text-outline"
            size={27}
            color={PURPLE}
          />
        </View>

        <View style={styles.requestContent}>
          <Text style={styles.requestTitle}>
            {translate('workAssignedByAdmin', language)}
          </Text>

          <Text style={styles.requestSubtitle}>
            {translate('tasksAssignedToYou', language)}
          </Text>

          <View style={styles.requestStats}>
            <View style={styles.requestStat}>
              <MaterialCommunityIcons
                name="briefcase-outline"
                size={16}
                color={PURPLE}
              />

              <Text style={styles.requestStatText}>
                {assignedCount} {assignedCount === 1 ? translate('task', language) : translate('tasks', language)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.requestActions}>
          <View style={styles.requestNumber}>
            <Text style={styles.requestNumberText}>
              {assignedCount}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.requestPlus}
            delayPressIn={0}
            onPress={assignedWork.length > 0 ? () => go("jobDetails", { workId: assignedWork[0].id }) : null}
          >
            <MaterialCommunityIcons
              name="arrow-right"
              size={21}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* IN PROGRESS WORK */}
      {loading ? (
        <View style={{ marginTop: verticalScale(12) }}>
          <SectionTitle title={translate('in_progress', language)} />
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
      ) : inProgressCount > 0 && inProgressWork.length > 0 ? (
        <View style={{ marginTop: verticalScale(12) }}>
          <SectionTitle
            title={translate('in_progress', language)}
            action={inProgressCount > 1 ? `${inProgressCount} ${translate('jobs', language)}` : ""}
            onPress={null}
          />
          
          {inProgressWork.map((work) => (
            <TouchableOpacity
              key={work.id}
              style={styles.scheduledJobCard}
              delayPressIn={0}
              onPress={() => go("jobDetails", { workId: work.id })}
              activeOpacity={0.85}
            >
              <View style={styles.scheduledJobHeader}>
                <View style={styles.scheduledJobIcon}>
                  <MaterialCommunityIcons
                    name="progress-clock"
                    size={20}
                    color="#F59E0B"
                  />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={styles.scheduledJobTitle}>
                    {work.title}
                  </Text>
                  
                  <Text style={styles.scheduledJobClient}>
                    {work.client}
                  </Text>
                </View>

                <View style={[styles.scheduledBadge, { backgroundColor: '#FFF4E6' }]}>
                  <Text style={[styles.scheduledBadgeText, { color: '#F59E0B' }]}>{translate('inProgressStatus', language)}</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={{ marginTop: verticalScale(12) }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(6) }}>
                  <Text style={{ fontSize: moderateScale(11), color: MUTED, fontWeight: '700' }}>{translate('progress', language)}</Text>
                  <Text style={{ fontSize: moderateScale(12), color: PURPLE, fontWeight: '900' }}>{work.progress}%</Text>
                </View>
                <View style={{ height: verticalScale(6), backgroundColor: '#F1F5F9', borderRadius: moderateScale(3), overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${work.progress}%`, backgroundColor: '#F59E0B', borderRadius: moderateScale(3) }} />
                </View>
              </View>

              <View style={styles.scheduledJobDetails}>
                <View style={styles.scheduledJobDetailItem}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={14}
                    color={MUTED}
                  />
                  <Text style={styles.scheduledJobDetailText}>
                    {work.location}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {/* PERFORMANCE */}
      <View style={{ marginTop: verticalScale(16) }}>
        <SectionTitle title={translate('yourPerformance', language)} />
        
        <View style={styles.performanceCard}>
          <View style={styles.performanceHeader}>
            <MaterialCommunityIcons
              name="chart-line"
              size={24}
              color={PURPLE}
            />
            <Text style={styles.performanceTitle}>{translate('monthlyOverview', language)}</Text>
          </View>

          <View style={styles.performanceStats}>
            <View style={styles.performanceStat}>
              <Text style={styles.performanceStatValue}>{completedCount}</Text>
              <Text style={styles.performanceStatLabel}>{translate('completed', language)}</Text>
            </View>

            <View style={styles.performanceStatDivider} />

            <View style={styles.performanceStat}>
              <Text style={styles.performanceStatValue}>{inProgressCount}</Text>
              <Text style={styles.performanceStatLabel}>{translate('in_progress', language)}</Text>
            </View>

            <View style={styles.performanceStatDivider} />

            <View style={styles.performanceStat}>
              <Text style={styles.performanceStatValue}>{assignedCount}</Text>
              <Text style={styles.performanceStatLabel}>{translate('assigned', language)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.performanceButton}
            delayPressIn={0}
            onPress={() => go("performance")}
            activeOpacity={0.8}
          >
            <Text style={styles.performanceButtonText}>{translate('viewDetailedStats', language)}</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={18}
              color={PURPLE}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* CALENDAR */}
      <SectionTitle
        title={translate('mySchedule', language)}
        action={translate('viewAll', language)}
        onPress={() => go("calendar")}
      />

      <View style={styles.calendarDashboardCard}>
        <View style={styles.calendarHeaderRow}>
          <View>
            <Text style={styles.calendarHeading}>
              {translate('assignedWorkSchedule', language)}
            </Text>

            <Text style={styles.calendarSubHeading}>
              {translate('workAssignedByOrganization', language)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.calendarIcon}
            delayPressIn={0}
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
            const dayNames = [
              translate('sunday', language),
              translate('monday', language),
              translate('tuesday', language),
              translate('wednesday', language),
              translate('thursday', language),
              translate('friday', language),
              translate('saturday', language),
            ];
            
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
                delayPressIn={0}
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
        {assignedCount > 0 && (
          <TouchableOpacity
            style={styles.upcomingJob}
            delayPressIn={0}
            onPress={() => go("jobDetails", { workId: assignedWork[0]?.id })}
            activeOpacity={0.85}
          >
            <View style={styles.upcomingJobLine} />

            <View style={{ flex: 1 }}>
              <Text style={styles.upcomingJobTitle}>
                {translate('viewYourAssignedWork', language)}
              </Text>

              <Text style={styles.upcomingJobTime}>
                {assignedCount} {assignedCount === 1 ? translate('taskSingular', language) : translate('taskPlural', language)} {translate('assignedWord', language)}
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
      ) : completedCount > 0 && completedWork.length > 0 ? (
        <View style={{ marginTop: verticalScale(8) }}>
          <SectionTitle
            title={translate('completedWork', language)}
            action={completedCount > 1 ? `${completedCount} ${translate('jobs', language)}` : ""}
            onPress={null}
          />
          
          {completedWork.slice(0, 3).map((work) => (
            <TouchableOpacity
              key={work.id}
              style={styles.completedJobCard}
              delayPressIn={0}
              onPress={() => {
                console.log('[LOC] Clicked completed job:', work.id);
                go("jobDetails", { workId: work.id });
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
                    {work.title}
                  </Text>
                  
                  <Text style={styles.completedJobClient}>
                    {translate('ratedByAdmin', language)}
                  </Text>
                </View>

                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>{translate('completedStatus', language)}</Text>
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
                    {new Date(work.completedDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </View>

                {work.location && (
                  <View style={styles.completedJobDetailItem}>
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={14}
                      color={MUTED}
                    />
                    <Text style={styles.completedJobDetailText} numberOfLines={1}>
                      {work.location.split(',')[0]}
                    </Text>
                  </View>
                )}
              </View>

              {work.rating && (
                <View style={styles.completedJobEarnings}>
                  <MaterialCommunityIcons
                    name="star"
                    size={16}
                    color="#F59E0B"
                  />
                  <Text style={styles.completedJobEarningsText}>
                    {work.rating.toFixed(1)} {translate('ratingWord', language)}
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
  orgWorkerVoiceGuidanceWrap: {
    marginTop: verticalScale(2),
    marginBottom: verticalScale(14),
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

  micButton: {
    width: scale(39),
    height: scale(39),
    borderRadius: moderateScale(11),
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: moderateScale(6),
  },

  searchButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(11),
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
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

  // Performance card styles
  performanceCard: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(14),
    padding: moderateScale(16),
    marginTop: verticalScale(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  performanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },

  performanceTitle: {
    fontSize: moderateScale(16),
    fontWeight: "900",
    color: TEXT,
    marginLeft: moderateScale(8),
  },

  performanceStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: verticalScale(16),
  },

  performanceStat: {
    alignItems: "center",
  },

  performanceStatValue: {
    fontSize: moderateScale(24),
    fontWeight: "900",
    color: PURPLE,
    marginBottom: verticalScale(4),
  },

  performanceStatLabel: {
    fontSize: moderateScale(11),
    fontWeight: "700",
    color: MUTED,
  },

  performanceStatDivider: {
    width: 1,
    height: verticalScale(40),
    backgroundColor: "#E5E7EB",
  },

  performanceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F0FF",
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
  },

  performanceButtonText: {
    fontSize: moderateScale(13),
    fontWeight: "800",
    color: PURPLE,
    marginRight: moderateScale(6),
  },
});
