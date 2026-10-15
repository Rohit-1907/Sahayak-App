import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  Animated,
  Easing,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { translate } from "../utils/translations";
import { API_ENDPOINTS } from "../config/api";

/* ============================================================
   COLORS
============================================================ */

const PURPLE = "#49769F";
const BG = "#F8FAFC";
const TEXT = "#111827";
const MUTED = "#6B7280";
const GREEN = "#24935D";
const RED = "#D94C4C";
const BORDER = "#E0E7ED";
const BLUE = "#1F6CC5";
const ORANGE = "#F59E0B";

/* ============================================================
   JOB DATA - Real API integration
   Fetches scheduled work requests from backend
============================================================ */

/* ============================================================
   JOBS SCREEN
============================================================ */

export default function Jobs({
  go,
  setSelectedJob,
  language = "English",
}) {
  const [search, setSearch] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch scheduled jobs on mount
  useEffect(() => {
    fetchScheduledJobs();
  }, []);

  const fetchScheduledJobs = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const userRole = await AsyncStorage.getItem('user_role');
      const cacheKey = `@cache_jobs_near_${userRole || 'worker'}`;
      
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        setJobs(JSON.parse(cached));
        setLoading(false);
      }

      const token = await AsyncStorage.getItem('access_token');
      
      console.log('[JOBS] Jobs Near You: Fetching jobs... User Role:', userRole);
      
      if (token) {
        let loadedJobs = null;
        
        // Organization worker: fetch assigned work
        if (userRole === 'org_worker' || userRole === 'organization_worker') {
          console.log('[JOBS] Fetching organization worker assigned work');
          
          // Get worker ID from AsyncStorage
          const workerDataStr = await AsyncStorage.getItem('worker_data');
          if (workerDataStr) {
            const workerData = JSON.parse(workerDataStr);
            const workerId = workerData.id;
            
            console.log('[JOBS] Worker ID:', workerId);
            
            // Fetch assigned and in-progress work
            const [assignedResponse, inProgressResponse] = await Promise.all([
              fetch(
                API_ENDPOINTS.ORG_WORKER_ASSIGNED(workerId),
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              ),
              fetch(
                API_ENDPOINTS.ORG_WORKER_IN_PROGRESS(workerId),
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              )
            ]);
            
            const assignedData = await assignedResponse.json();
            const inProgressData = await inProgressResponse.json();
            
            console.log('[JOBS] Assigned work:', assignedData);
            console.log('[JOBS] In Progress work:', inProgressData);
            
            const assignedWork = assignedData.work || [];
            const inProgressWork = inProgressData.work || [];
            
            // Combine both arrays
            loadedJobs = [...assignedWork, ...inProgressWork];
            console.log('[OK] Jobs loaded:', loadedJobs.length, 'assigned/in-progress work');
          }
        }
        // Organization admin: fetch accepted organization requests
        else if (userRole === 'organization_admin') {
          console.log('[JOBS] Fetching organization accepted and completed requests');
          
          // Fetch both accepted and completed requests
          const [acceptedResponse, completedResponse] = await Promise.all([
            fetch(
              API_ENDPOINTS.ORG_REQUESTS_BY_STATUS('accepted'),
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            ),
            fetch(
              API_ENDPOINTS.ORG_REQUESTS_BY_STATUS('completed'),
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            )
          ]);
          
          const acceptedData = await acceptedResponse.json();
          const completedData = await completedResponse.json();
          
          console.log('[JOBS] Organization accepted requests:', acceptedData);
          console.log('[JOBS] Organization completed requests:', completedData);
          
          const acceptedJobs = acceptedData.results || [];
          const completedJobs = completedData.results || [];
          
          // Combine both arrays
          loadedJobs = [...acceptedJobs, ...completedJobs];
          console.log('[OK] Jobs loaded:', loadedJobs.length, 'organization requests (accepted + completed)');
        } else {
          // Individual worker: fetch scheduled work requests
          console.log('[JOBS] Fetching worker scheduled jobs');
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
          console.log('[JOBS] Worker API Response:', data);
          
          if (data.success) {
            loadedJobs = data.work_requests || [];
          } else if (Array.isArray(data)) {
            loadedJobs = data;
          }
        }

        if (loadedJobs !== null) {
          setJobs(loadedJobs);
          await AsyncStorage.setItem(cacheKey, JSON.stringify(loadedJobs));
        }
      }
    } catch (error) {
      console.log('[FAIL] Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     HELPER FUNCTIONS FOR DUAL FORMAT SUPPORT
  ========================================================== */

  // Get job title (handles both organization and individual worker formats)
  const getJobTitle = (job) => {
    return job.title || `${job.work_type || job.service_category} Work`;
  };

  // Get service category
  const getServiceCategory = (job) => {
    return job.title || job.work_type || job.service_category || 'Service';
  };

  // Get work location
  const getWorkLocation = (job) => {
    return job.location || job.work_location || job.work_address || 'Location TBD';
  };

  // Get description
  const getDescription = (job) => {
    return job.description || job.work_description || '';
  };

  /* ==========================================================
     SEARCH + FILTER
  ========================================================== */

  const filteredJobs = useMemo(() => {
    const value = search.trim().toLowerCase();

    let result = jobs;

    if (selectedFilter !== "All") {
      result = result.filter((job) => {
        const jobDate = new Date(job.required_date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (selectedFilter === "Today") {
          return jobDate.toDateString() === today.toDateString();
        }

        if (selectedFilter === "Tomorrow") {
          return jobDate.toDateString() === tomorrow.toDateString();
        }

        if (selectedFilter === "High Price") {
          const price = Number(job.estimated_budget || 0);
          return price >= 700;
        }

        return true;
      });
    }

    if (!value) {
      return result;
    }

    return result.filter(
      (job) =>
        getJobTitle(job).toLowerCase().includes(value) ||
        getServiceCategory(job).toLowerCase().includes(value) ||
        getWorkLocation(job).toLowerCase().includes(value) ||
        (job.client_name && job.client_name.toLowerCase().includes(value))
    );
  }, [search, selectedFilter, jobs]);

  /* ==========================================================
     OPEN JOB DETAILS
  ========================================================== */

    const openDetails = async (jobId) => {
    console.log('[SEARCH] Opening job details for ID:', jobId);
    
    // Check user role
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const userRole = await AsyncStorage.getItem('user_role');
    
    if (userRole === 'organization_admin') {
      // For organization admins, navigate to organization request details
      console.log('[ORG] Organization admin - opening request details');
      
      // Find the full request object from jobs array
      const request = jobs.find(job => job.id === jobId);
      
      if (request) {
        console.log('[OK] Found request object:', request);
        go('orgRequestDetails', { request });
      } else {
        console.error('[FAIL] Request not found in jobs array');
        Alert.alert('Error', 'Request details not found');
      }
    } else if (userRole === 'org_worker' || userRole === 'organization_worker') {
      // For organization workers, navigate to org worker job details
      console.log('[WORKER] Organization worker - opening job details');
      go('jobDetails', { workId: jobId });
    } else {
      // For individual workers, navigate to worker job details
      setSelectedJob(jobId);
      go("workerJobDetails", { requestId: jobId });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BG}
      />

      <View style={styles.jobsRoot}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.jobsContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}

          <View style={styles.jobsHeader}>
            <TouchableOpacity
              style={styles.headerBack}
              delayPressIn={0}
              onPress={() => go("home")}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={23}
                color={TEXT}
              />
            </TouchableOpacity>

<Text style={styles.jobsTitle}>
  {translate('jobsNearYou', language)}
</Text>
          </View>

          {/* LOCATION */}

          <View style={styles.locationRow}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={19}
              color={MUTED}
            />

            <Text style={styles.locationText}>
              Pune, Maharashtra
            </Text>
          </View>

          {/* SEARCH + FILTER */}

          <View style={styles.searchFilterRow}>
            <View style={styles.searchBox}>
              <MaterialCommunityIcons
                name="magnify"
                size={22}
                color={MUTED}
              />

              <TextInput
                style={styles.searchInput}
                placeholder="Search jobs..."
                placeholderTextColor="#A3A1AA"
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
              />
            </View>

            <TouchableOpacity
              style={styles.filterButton}
              delayPressIn={0}
              onPress={() => setFilterVisible(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="filter-variant"
                size={20}
                color={TEXT}
              />

              <Text style={styles.filterText}>
                Filter
              </Text>
            </TouchableOpacity>
          </View>

          {/* JOB CARDS */}

          {loading && jobs.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: MUTED, fontSize: 14 }}>Loading scheduled jobs...</Text>
            </View>
          ) : filteredJobs.length === 0 ? (
            <View style={{ 
              backgroundColor: '#fff', 
              padding: 30, 
              borderRadius: 14, 
              alignItems: 'center',
              marginTop: 20,
              borderWidth: 1,
              borderColor: BORDER,
            }}>
              <MaterialCommunityIcons
                name="briefcase-outline"
                size={50}
                color={MUTED}
              />
              <Text style={{ color: TEXT, marginTop: 15, fontSize: 15, fontWeight: '700' }}>
                No Scheduled Jobs
              </Text>
              <Text style={{ color: MUTED, marginTop: 8, fontSize: 12, textAlign: 'center' }}>
                {search || selectedFilter !== "All" 
                  ? "No jobs match your search criteria"
                  : "Check work requests for new opportunities"}
              </Text>
            </View>
          ) : (
            filteredJobs.map((job) => (
              <View style={styles.jobCard} key={job.id}>
                <View style={styles.jobCardTop}>
                  <View style={styles.jobCardMain}>
                    <Text style={styles.jobTitle}>
                      {getServiceCategory(job)} - {getJobTitle(job)}
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                      <MaterialCommunityIcons
                        name="account-outline"
                        size={16}
                        color={MUTED}
                      />
                      <Text style={{ fontSize: 12, color: MUTED, marginLeft: 4 }}>
                        {job.client_name || job.client || 'Client'}
                      </Text>
                    </View>

                    <View style={styles.jobMetaRow}>
                      <MaterialCommunityIcons
                        name="map-marker-outline"
                        size={17}
                        color={MUTED}
                      />

                      <Text style={styles.jobMetaText}>
                        {getWorkLocation(job).split(',').slice(0, 2).join(',') || 'Location TBD'}
                      </Text>
                    </View>

                    <Text style={styles.jobPrice}>
                      {job.estimated_budget ? `Rs. ${job.estimated_budget}` : ''}
                    </Text>

                    <Text style={styles.jobTime}>
                      {(job.required_date || job.assigned_at) ? new Date(job.required_date || job.assigned_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }) : 'Date TBD'} | {job.required_time || 'Time TBD'}
                    </Text>
                  </View>

                  <MaterialCommunityIcons
                    name={job.status === 'completed' ? 'check-circle' : job.status === 'in_progress' ? 'progress-clock' : 'calendar-check'}
                    size={23}
                    color={job.status === 'completed' ? GREEN : BLUE}
                  />
                </View>

                <View style={styles.jobCardBottom}>
                  <View />

                  <TouchableOpacity
                    style={styles.viewJobButton}
                    delayPressIn={0}
                    onPress={() => openDetails(job.id)}
                    activeOpacity={0.8}
                  >
<Text style={styles.viewJobText}>
{translate('viewDetails', language)}
</Text>

                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={18}
                      color={PURPLE}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

        </ScrollView>

        {/* FILTER POPUP */}

        <Modal
          visible={filterVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setFilterVisible(false)}
        >
          <View style={styles.filterOverlay}>
            <View style={styles.filterModal}>
              <View style={styles.filterModalHeader}>
                <Text style={styles.filterModalTitle}>
                  Filter Jobs
                </Text>

                <TouchableOpacity
                  delayPressIn={0}
                  onPress={() => setFilterVisible(false)}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={23}
                    color={TEXT}
                  />
                </TouchableOpacity>
              </View>

              {[
                "All",
                "Today",
                "Tomorrow",
                "High Price",
              ].map((item) => (
                <TouchableOpacity
                  key={item}
                  delayPressIn={0}
                  style={styles.filterOption}
                  onPress={() => {
                    setSelectedFilter(item);
                    setFilterVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedFilter === item &&
                        styles.filterOptionActive,
                    ]}
                  >
                    {item}
                  </Text>

                  {selectedFilter === item && (
                    <MaterialCommunityIcons
                      name="check"
                      size={20}
                      color={PURPLE}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

        {/* BOTTOM NAVIGATION */}

        <BottomNav
          active="jobs"
          go={go}
        />
      </View>
    </SafeAreaView>
  );
}


/* ============================================================
   JOB COMPLETED SCREEN
   ============================================================ */

export function JobCompleted({
  go,
  completedJob,
}) {
  const job = {
    id: completedJob,
    title: 'Completed Work',
    location: 'Work Location',
    price: 'TBD',
  };

  const handleViewEarnings = () => {
    if (go) {
      go("earnings");
    } else {
      Alert.alert(
        "Earnings",
        "Earnings page is ready to open."
      );
    }
  };

  const handleRateCustomer = () => {
    if (go) {
      go("rateCustomer");
    } else {
      Alert.alert(
        "Rate Customer",
        "Customer rating screen is ready to open."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BG}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.completedContent}
      >
        {/* ==================================================
           HEADER
        ================================================== */}

        <View style={styles.completedHeader}>
          <TouchableOpacity
            style={styles.completedBackButton}
            onPress={() =>
              go ? go("jobs") : null
            }
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={TEXT}
            />
          </TouchableOpacity>

          <Text style={styles.completedHeaderTitle}>
            Job Completed
          </Text>

          <View style={styles.completedHeaderSpacer} />
        </View>

        {/* ==================================================
           COMPLETED STATUS
        ================================================== */}

        <View style={styles.completedStatusCard}>
          <View style={styles.completedStatusIcon}>
            <MaterialCommunityIcons
              name="check-circle"
              size={22}
              color={GREEN}
            />
          </View>

          <Text style={styles.completedStatusText}>
            Job Completed
          </Text>
        </View>

        {/* ==================================================
           CUSTOMER
        ================================================== */}

        <View style={styles.completedCard}>
          <Text style={styles.completedSmallTitle}>
            Customer
          </Text>

          <View style={styles.completedCustomerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.completedCustomerName}>
                sayee
              </Text>

              <View style={styles.ratingRow}>
                <MaterialCommunityIcons
                  name="star"
                  size={17}
                  color={ORANGE}
                />

                <Text style={styles.ratingText}>
                  4.7 Rating
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.callCustomerButton}
              onPress={() =>
                Alert.alert(
                  "Call Customer",
                  "Calling 9876543210"
                )
              }
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="phone"
                size={23}
                color={PURPLE}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ==================================================
           WORK SUMMARY
        ================================================== */}

        <View style={styles.completedCard}>
          <Text style={styles.completedSmallTitle}>
            Work Summary
          </Text>

          <Text style={styles.workSummaryText}>
            Electrical fitting and wiring work
            completed successfully.
          </Text>
        </View>

        {/* ==================================================
           EARNINGS
        ================================================== */}

        <View style={styles.completedCard}>
          <Text style={styles.completedSmallTitle}>
            Earnings
          </Text>

          <Text style={styles.completedEarnings}>
            Rs. {(typeof completedJob === 'object' && (completedJob?.total_amount || completedJob?.estimated_budget || completedJob?.budget)) ? parseFloat(completedJob.total_amount || completedJob.estimated_budget || completedJob.budget).toFixed(0) : '800'}
          </Text>
        </View>

        {/* ==================================================
           VIEW EARNINGS
        ================================================== */}

        <TouchableOpacity
          style={styles.viewEarningsButton}
          onPress={handleViewEarnings}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons
            name="cash-multiple"
            size={21}
            color="#fff"
          />

          <Text style={styles.viewEarningsText}>
            View Earnings
          </Text>
        </TouchableOpacity>

        {/* ==================================================
           CUSTOMER RATE BUTTON

           Replaces "Back to Home".
        ================================================== */}

        <TouchableOpacity
          style={styles.customerRateButton}
          onPress={handleRateCustomer}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons
            name="star-outline"
            size={21}
            color={PURPLE}
          />

          <Text style={styles.customerRateText}>
            Rate Customer
          </Text>
        </TouchableOpacity>

        <View style={{ height: 25 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   RATE CUSTOMER SCREEN
   Second screen exactly following the supplied reference:
   - Rate Customer header
   - 5 selectable stars
   - Rating label
   - Review text box
   - Submit Review button
   - Skip option

   Uses the user's existing blue theme instead of changing
   the whole app to purple.
============================================================ */

export function RateCustomer({
  go,
}) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  const ratingLabel =
    rating === 5
      ? "Great!"
      : rating === 4
      ? "Good"
      : rating === 3
      ? "Okay"
      : rating === 2
      ? "Needs Improvement"
      : "Poor";

  const handleSubmitReview = () => {
    Alert.alert(
      "Review Submitted",
      `Thank you for rating the customer ${rating} star${
        rating > 1 ? "s" : ""
      }.`,
      [
        {
          text: "Done",
          onPress: () => {
            if (go) {
              go("earnings");
            }
          },
        },
      ]
    );
  };

  const handleSkip = () => {
    if (go) {
      go("earnings");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BG}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.rateCustomerContent}
      >
        {/* ==================================================
           HEADER
        ================================================== */}

        <View style={styles.rateCustomerHeader}>
          <TouchableOpacity
            style={styles.rateBackButton}
            onPress={() =>
              go ? go("jobCompleted") : null
            }
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={TEXT}
            />
          </TouchableOpacity>

          <Text style={styles.rateCustomerHeaderTitle}>
            Rate Customer
          </Text>

          <View style={styles.rateHeaderSpacer} />
        </View>

        {/* ==================================================
           RATING CARD
        ================================================== */}

        <View style={styles.rateCard}>
          <Text style={styles.rateQuestion}>
            How was your experience?
          </Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                style={styles.starButton}
                onPress={() => setRating(star)}
                activeOpacity={0.75}
              >
                <MaterialCommunityIcons
                  name={
                    star <= rating
                      ? "star"
                      : "star-outline"
                  }
                  size={47}
                  color={
                    star <= rating
                      ? ORANGE
                      : "#D8DDE2"
                  }
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.ratingLabel}>
            {ratingLabel}
          </Text>
        </View>

        {/* ==================================================
           REVIEW CARD
        ================================================== */}

        <View style={styles.reviewCard}>
          <Text style={styles.reviewTitle}>
            Write a review (optional)
          </Text>

          <TextInput
            style={styles.reviewInput}
            value={review}
            onChangeText={setReview}
            placeholder="Write your feedback..."
            placeholderTextColor="#A8AFB7"
            multiline
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        {/* ==================================================
           SUBMIT
        ================================================== */}

        <TouchableOpacity
          style={styles.submitReviewButton}
          onPress={handleSubmitReview}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons
            name="send-outline"
            size={20}
            color="#fff"
          />

          <Text style={styles.submitReviewText}>
            Submit Review
          </Text>
        </TouchableOpacity>

        {/* ==================================================
           SKIP
        ================================================== */}

        <TouchableOpacity
          style={styles.skipReviewButton}
          onPress={handleSkip}
          activeOpacity={0.8}
        >
          <Text style={styles.skipReviewText}>
            Skip
          </Text>
        </TouchableOpacity>

        <View style={{ height: 25 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   BOTTOM NAVIGATION
============================================================ */

function BottomNav({
  active,
  go,
  language,
}) {
  return (
    <View style={styles.bottomNav}>
      <NavItem
        icon="home"
        title={translate('home', language)}
        active={active === "home"}
        onPress={() => go("home")}
      />

      <NavItem
        icon="briefcase"
        title={translate('jobs', language)}
        active={active === "jobs"}
        onPress={() => go("jobs")}
      />

      <NavItem
        icon="cash-multiple"
        title={translate('earnings', language)}
        active={active === "earnings"}
        onPress={() => go("earnings")}
      />

      <NavItem
        icon="account"
        title={translate('profile', language)}
        active={active === "profile"}
        onPress={() => go("profile")}
      />
    </View>
  );
}

/* ============================================================
   NAV ITEM
============================================================ */

function NavItem({
  icon,
  title,
  active,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.navItem}
      delayPressIn={0}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons
        name={icon}
        size={23}
        color={active ? PURPLE : MUTED}
      />

      <Text
        style={[
          styles.navText,
          active && styles.navTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  /* ==========================================================
     JOBS SCREEN
  ========================================================== */

  jobsRoot: {
    flex: 1,
  },

  jobsContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 92,
  },

  jobsHeader: {
    height: 74,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  headerBack: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  jobsTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: TEXT,
    marginLeft: 6,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 3,
    marginBottom: 18,
  },

  locationText: {
    marginLeft: 6,
    color: MUTED,
    fontSize: 14,
  },

  searchFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  searchBox: {
    flex: 1,
    height: 52,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: TEXT,
    fontSize: 14,
  },

  filterButton: {
    height: 52,
    paddingHorizontal: 14,
    marginLeft: 9,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  filterText: {
    marginLeft: 5,
    color: TEXT,
    fontWeight: "700",
    fontSize: 13,
  },

  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 17,
    marginBottom: 14,
  },

  jobCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  jobCardMain: {
    flex: 1,
  },

  jobTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
  },

  jobMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  jobMetaText: {
    color: MUTED,
    fontSize: 13,
    marginLeft: 5,
  },

  jobPrice: {
    color: GREEN,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
  },

  jobTime: {
    color: TEXT,
    fontSize: 12,
  },

  jobCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: -5,
  },

  viewJobButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  viewJobText: {
    color: PURPLE,
    fontSize: 13,
    fontWeight: "700",
  },

  detailsButton: {
    borderWidth: 1,
    borderColor: "#C9C2F6",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 9,
    alignSelf: "flex-end",
  },

  detailsButtonText: {
    color: "#6353C8",
    fontWeight: "800",
    fontSize: 12,
  },

  emptyBox: {
    alignItems: "center",
    paddingVertical: 60,
  },

  emptyText: {
    marginTop: 10,
    color: MUTED,
    fontSize: 14,
  },

  /* ==========================================================
     FILTER MODAL
  ========================================================== */

  filterOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  filterModal: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
  },

  filterModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  filterModalTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "800",
  },

  filterOption: {
    minHeight: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F4",
  },

  filterOptionText: {
    color: TEXT,
    fontSize: 14,
  },

  filterOptionActive: {
    color: PURPLE,
    fontWeight: "800",
  },

  /* ==========================================================
     BOTTOM NAV
  ========================================================== */

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  navItem: {
    width: "25%",
    alignItems: "center",
    justifyContent: "center",
  },

  navText: {
    color: MUTED,
    fontSize: 10,
    marginTop: 3,
  },

  navTextActive: {
    color: PURPLE,
    fontWeight: "700",
  },

  /* ==========================================================
     JOB DETAILS
  ========================================================== */

  detailContent: {
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 20,
  },

  detailHeader: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  detailBack: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },

  detailHeaderTitle: {
    color: TEXT,
    fontSize: 19,
    fontWeight: "800",
  },

  detailHeaderSpacer: {
    width: 42,
  },

  /* ==========================================================
     HERO
  ========================================================== */

  detailHeroIcon: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#EEF4F8",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  detailHeroTitle: {
    color: TEXT,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 17,
  },

  detailHeroRate: {
    color: "#4B7BA7",
    textAlign: "center",
    fontSize: 21,
    fontWeight: "800",
    marginTop: 6,
  },

  /* ==========================================================
     LOCATION + TIME
  ========================================================== */

  detailInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    marginBottom: 19,
    paddingHorizontal: 2,
  },

  detailInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "48%",
  },

  detailInfoText: {
    color: MUTED,
    fontSize: 13,
    marginLeft: 6,
  },

  /* ==========================================================
     ASSIGNED STATUS
  ========================================================== */

  assignedCard: {
    minHeight: 65,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: "#5D86A8",
    backgroundColor: "#EEF4F8",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 14,
  },

  assignedText: {
    color: "#4B7194",
    fontSize: 18,
    fontWeight: "800",
    marginLeft: 11,
  },

  acceptedStatusCard: {
    borderColor: "#9BD5B7",
    backgroundColor: "#EEF9F3",
  },

  acceptedStatusText: {
    color: GREEN,
  },

  rejectedStatusCard: {
    borderColor: "#E7AAAA",
    backgroundColor: "#FFF3F3",
  },

  rejectedStatusText: {
    color: RED,
  },

  /* ==========================================================
     OTP VERIFIED MINI CARD
  ========================================================== */

  otpVerifiedMiniCard: {
    minHeight: 60,
    borderRadius: 14,
    backgroundColor: "#EEF9F3",
    borderWidth: 1,
    borderColor: "#B7DFC8",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  smallVerifiedCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  otpVerifiedTitle: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "800",
  },

  otpVerifiedSubtitle: {
    color: MUTED,
    fontSize: 11,
    marginTop: 2,
  },

  /* ==========================================================
     RESPONSE TIMER
  ========================================================== */

  responseCard: {
    minHeight: 108,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: "#F1D58B",
    backgroundColor: "#FFF8E8",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 17,
    marginBottom: 13,
  },

  responseIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF0C6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  responseTextWrap: {
    flex: 1,
  },

  responseTitle: {
    color: "#6D5114",
    fontSize: 16,
    fontWeight: "800",
  },

  responseTimer: {
    color: "#D88A00",
    fontSize: 27,
    fontWeight: "900",
    marginTop: 1,
  },

  /* ==========================================================
     INFORMATION CARD
  ========================================================== */

  instructionCard: {
    backgroundColor: "#EEF5FB",
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 17,
  },

  instructionText: {
    flex: 1,
    color: "#536577",
    fontSize: 12,
    lineHeight: 17,
    marginLeft: 8,
  },

  /* ==========================================================
     SERVICE CARD
  ========================================================== */

  serviceCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 15,
    padding: 16,
    marginBottom: 19,
  },

  serviceTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  serviceIconBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: "#EEF4F8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  serviceTitleWrap: {
    flex: 1,
  },

  serviceTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },

  serviceSubtitle: {
    color: MUTED,
    fontSize: 12,
    marginTop: 3,
  },

  servicePrice: {
    color: GREEN,
    fontSize: 16,
    fontWeight: "900",
    marginLeft: 5,
  },

  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  serviceRowText: {
    color: TEXT,
    fontSize: 13,
    marginLeft: 9,
  },

  preferredText: {
    color: MUTED,
    fontSize: 11,
    marginTop: 12,
  },

  /* ==========================================================
     SECTION TITLE
  ========================================================== */

  sectionTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },

  /* ==========================================================
     CUSTOMER
  ========================================================== */

  customerCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 15,
    marginBottom: 19,
  },

  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 11,
  },

  customerLabel: {
    flex: 1,
    color: TEXT,
    fontSize: 13,
    marginLeft: 9,
  },

  customerValue: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "700",
  },

  visibleAfterText: {
    color: MUTED,
    fontSize: 10,
    marginLeft: 31,
    marginTop: -3,
  },

  /* ==========================================================
     DESCRIPTION
  ========================================================== */

  descriptionCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 19,
  },

  descriptionText: {
    color: TEXT,
    fontSize: 13,
    lineHeight: 19,
  },

  descriptionLine: {
    height: 1,
    backgroundColor: "#D7DCE1",
    marginVertical: 14,
  },

  locationRowDetail: {
    flexDirection: "row",
    alignItems: "center",
  },

  locationDetailText: {
    color: MUTED,
    fontSize: 13,
    marginLeft: 7,
  },

  /* ==========================================================
     PRICING
  ========================================================== */

  pricingCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 14,
  },

  pricingHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  pricingTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 10,
  },

  finalPriceLabel: {
    color: MUTED,
    fontSize: 12,
    marginTop: 16,
  },

  finalPrice: {
    color: GREEN,
    fontSize: 29,
    fontWeight: "900",
    marginTop: 2,
  },

  /* ==========================================================
     NEGOTIATION INFO
  ========================================================== */

  negotiateInfo: {
    backgroundColor: "#EEF6FF",
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  negotiateText: {
    flex: 1,
    color: "#52677A",
    fontSize: 12,
    lineHeight: 17,
    marginLeft: 8,
  },

  /* ==========================================================
     ACCEPT BUTTON
  ========================================================== */

  acceptButton: {
    height: 53,
    borderRadius: 13,
    backgroundColor: "#249B63",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 8,
  },

  /* ==========================================================
     REJECT BUTTON
  ========================================================== */

  rejectButton: {
    height: 53,
    borderRadius: 13,
    backgroundColor: "#FFF2F2",
    borderWidth: 1.5,
    borderColor: "#F0B5B5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  rejectButtonText: {
    color: RED,
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 8,
  },

  /* ==========================================================
     NAVIGATE TO CLIENT
  ========================================================== */

  navigateClientButton: {
    height: 53,
    borderRadius: 13,
    backgroundColor: "#EEF4F8",
    borderWidth: 1.5,
    borderColor: "#AFC5D7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  navigateClientText: {
    color: "#4B7BA7",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
  },

  /* ==========================================================
     COMPLETED WORK BUTTON
  ========================================================== */

  completedWorkButton: {
    height: 53,
    borderRadius: 13,
    backgroundColor: "#EEF9F3",
    borderWidth: 1.5,
    borderColor: "#A9D8BD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  completedWorkText: {
    color: GREEN,
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
  },

  /* ==========================================================
     OTP POPUP
  ========================================================== */

  otpOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.42)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  otpModal: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 24,
    alignItems: "center",
  },

  otpIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#EEF4F8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  otpTitle: {
    color: TEXT,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },

  otpSubtitle: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 7,
    marginHorizontal: 10,
  },

  otpBoxesRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 10,
  },

  otpBox: {
    width: 60,
    height: 60,
    borderWidth: 1.5,
    borderColor: "#DCE4EA",
    borderRadius: 13,
    backgroundColor: "#FAFBFC",
    color: TEXT,
    fontSize: 25,
    fontWeight: "800",
    textAlign: "center",
  },

  otpBoxError: {
    borderColor: RED,
    backgroundColor: "#FFF8F8",
  },

  otpError: {
    color: RED,
    fontSize: 11,
    marginTop: 8,
    textAlign: "center",
  },

  verifyButton: {
    width: "100%",
    height: 50,
    borderRadius: 12,
    backgroundColor: "#249B63",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },

  verifyButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 7,
  },

  otpCancelButton: {
    marginTop: 13,
    paddingVertical: 5,
  },

  otpCancelText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "700",
  },

  animatedSuccessCircle: {
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },

  successTitle: {
    color: TEXT,
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
  },

  successSubtitle: {
    color: MUTED,
    fontSize: 12,
    textAlign: "center",
    marginTop: 7,
    lineHeight: 17,
  },

  doneButton: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EEF4F8",
    borderWidth: 1,
    borderColor: "#AFC5D7",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  doneButtonText: {
    color: "#4B7BA7",
    fontSize: 15,
    fontWeight: "800",
  },

  /* ==========================================================
     JOB COMPLETED SCREEN
     Same layout idea as reference image, but user's theme.
     "Back to Home" intentionally omitted.
  ========================================================== */

  completedContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 28,
  },

  completedHeader: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  completedHeaderSpacer: {
    width: 34,
  },

  completedBackButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  completedHeaderTitle: {
    color: TEXT,
    fontSize: 20,
    fontWeight: "800",
  },

  completedStatusCard: {
    minHeight: 58,
    borderRadius: 12,
    backgroundColor: "#EEF9F3",
    borderWidth: 1,
    borderColor: "#C8E7D4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  completedStatusIcon: {
    marginRight: 8,
  },

  completedStatusText: {
    color: GREEN,
    fontSize: 15,
    fontWeight: "800",
  },

  completedCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 13,
  },

  completedSmallTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 12,
  },

  completedCustomerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  completedCustomerName: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "800",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  ratingText: {
    color: MUTED,
    fontSize: 12,
    marginLeft: 5,
  },

  callCustomerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F1F6FA",
    borderWidth: 1,
    borderColor: "#D6E3EC",
    alignItems: "center",
    justifyContent: "center",
  },

  workSummaryText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
  },

  completedEarnings: {
    color: GREEN,
    fontSize: 32,
    fontWeight: "900",
    marginTop: 2,
  },

  viewEarningsButton: {
    height: 53,
    borderRadius: 12,
    backgroundColor: PURPLE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
  },

  viewEarningsText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 8,
  },

  /* ==========================================================
     CUSTOMER RATE BUTTON
  ========================================================== */

  customerRateButton: {
    height: 53,
    borderRadius: 12,
    backgroundColor: "#EEF4F8",
    borderWidth: 1.5,
    borderColor: "#AFC5D7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  customerRateText: {
    color: PURPLE,
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 8,
  },

  /* ==========================================================
     RATE CUSTOMER SCREEN
  ========================================================== */

  rateCustomerContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 28,
  },

  rateCustomerHeader: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  rateBackButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  rateCustomerHeaderTitle: {
    color: TEXT,
    fontSize: 20,
    fontWeight: "800",
  },

  rateHeaderSpacer: {
    width: 36,
  },

  rateCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 22,
    marginBottom: 14,
  },

  rateQuestion: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 19,
  },

  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  starButton: {
    width: 51,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
  },

  ratingLabel: {
    color: MUTED,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
  },

  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 15,
    marginBottom: 16,
  },

  reviewTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 10,
  },

  reviewInput: {
    minHeight: 145,
    borderWidth: 1,
    borderColor: "#DCE3E9",
    borderRadius: 12,
    backgroundColor: "#FBFCFD",
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: TEXT,
    fontSize: 13,
    lineHeight: 19,
  },

  submitReviewButton: {
    height: 53,
    borderRadius: 12,
    backgroundColor: PURPLE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
  },

  submitReviewText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 8,
  },

  skipReviewButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },

  skipReviewText: {
    color: PURPLE,
    fontSize: 14,
    fontWeight: "800",
  },
});
