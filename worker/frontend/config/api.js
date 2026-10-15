/**
 * API Configuration for Worker App
 * Centralized API endpoint management
 */

// Base URL - Update this when deploying
export const BACKEND_URL = 'https://campaigns-persian-apply-marks.trycloudflare.com';
export const API_BASE_URL = `${BACKEND_URL}/api/v1`;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/auth/login/`,
  REGISTER: `${API_BASE_URL}/auth/register/`,
  REGISTER_WORKER: `${API_BASE_URL}/auth/register-worker/`,
  LOGOUT: `${API_BASE_URL}/auth/logout/`,
  CURRENT_USER: `${API_BASE_URL}/auth/me/`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/token/refresh/`,
  
  // Organizations (existing)
  REGISTER_ORGANIZATION: `${API_BASE_URL}/organizations/register/`,
  ORGANIZATIONS: `${API_BASE_URL}/organizations/`,
  
  // Organisation System (new)
  ORG_CREATE: `${API_BASE_URL}/org/create/`,
  ORG_LIST: `${API_BASE_URL}/org/list/`,
  ORG_WORKERS: `${API_BASE_URL}/org/workers/`,
  ORG_WORKERS_ADD: `${API_BASE_URL}/org/workers/add/`,
  ORG_WORKER_CREDENTIALS: (workerId) => `${API_BASE_URL}/org/workers/${workerId}/credentials/`,
  ORG_WORKER_ASSIGNMENTS: (workerId) => `${API_BASE_URL}/org/workers/${workerId}/assignments/`,
  ORG_WORKER_LOGIN: `${API_BASE_URL}/org/auth/login/`,
  ORG_REQUESTS: `${API_BASE_URL}/org/requests/`,
  ORG_REQUESTS_CREATE: `${API_BASE_URL}/org/requests/create/`,
  ORG_REQUEST_ACCEPT: (requestId) => `${API_BASE_URL}/org/requests/${requestId}/accept/`,
  ORG_REQUEST_REJECT: (requestId) => `${API_BASE_URL}/org/requests/${requestId}/reject/`,
  ORG_ASSIGN_WORK: `${API_BASE_URL}/org/assignments/assign/`,
  ORG_ASSIGNMENT_STATUS: (assignmentId) => `${API_BASE_URL}/org/assignments/${assignmentId}/status/`,
  ORG_PERFORMANCE: (orgId) => `${API_BASE_URL}/org/performance/${orgId}/`,
  ORG_WORKER_PERFORMANCE: (workerId) => `${API_BASE_URL}/org/performance/worker/${workerId}/`,
  ORG_WORKER_ASSIGNED: (workerId) => `${API_BASE_URL}/org/worker/assigned-work/?worker_id=${workerId}`,
  ORG_WORKER_IN_PROGRESS: (workerId) => `${API_BASE_URL}/org/worker/in-progress/?worker_id=${workerId}`,
  ORG_WORKER_COMPLETED: (workerId) => `${API_BASE_URL}/org/worker/completed/?worker_id=${workerId}`,
  ORG_WORK_ASSIGNMENT_START: (assignmentId) => `${API_BASE_URL}/org/work-assignments/${assignmentId}/start/`,
  ORG_WORK_ASSIGNMENT_COMPLETE: (assignmentId) => `${API_BASE_URL}/org/work-assignments/${assignmentId}/complete/`,
  ORG_REQUESTS_BY_STATUS: (status) => `${API_BASE_URL}/org/requests/?status=${status}`,

  // Jobs / Work Requests (individual worker)
  JOBS_WORK_REQUESTS: `${API_BASE_URL}/jobs/work-requests/worker/`,
  JOB_WORK_REQUEST_DETAIL: (id) => `${API_BASE_URL}/jobs/work-requests/${id}/`,
  JOB_WORK_REQUEST_ACTION: (id) => `${API_BASE_URL}/jobs/work-requests/${id}/action/`,
  JOB_GENERATE_OTP: (id) => `${API_BASE_URL}/jobs/work-requests/${id}/generate-otp/`,
  JOB_VERIFY_OTP: (id) => `${API_BASE_URL}/jobs/work-requests/${id}/verify-otp/`,

  // User Profile
  USER_PROFILE: `${API_BASE_URL}/users/profile/`,

  // Notifications
  NOTIFICATIONS: `${API_BASE_URL}/notifications/`,
  NOTIFICATIONS_MARK_READ: (id) => `${API_BASE_URL}/notifications/${id}/mark-read/`,
  NOTIFICATIONS_MARK_ALL_READ: `${API_BASE_URL}/notifications/mark-all-read/`,
};

// Legacy exports for backward compatibility
export const AUTH_ENDPOINTS = {
  LOGIN: API_ENDPOINTS.LOGIN,
  REGISTER: API_ENDPOINTS.REGISTER,
  REGISTER_WORKER: API_ENDPOINTS.REGISTER_WORKER,
  ME: API_ENDPOINTS.CURRENT_USER,
  LOGOUT: API_ENDPOINTS.LOGOUT,
  TOKEN_REFRESH: API_ENDPOINTS.REFRESH_TOKEN,
};

export const ORGANIZATION_ENDPOINTS = {
  REGISTER: API_ENDPOINTS.REGISTER_ORGANIZATION,
  LIST: API_ENDPOINTS.ORGANIZATIONS,
  DETAIL: (id) => `${API_BASE_URL}/organizations/${id}/`,
};

export const USER_ENDPOINTS = {
  PROFILE: API_ENDPOINTS.USER_PROFILE,
  UPDATE_PROFILE: `${API_BASE_URL}/users/profile/update/`,
  ME: `${API_BASE_URL}/auth/me/`,
  COMPLETE_DATA: `${API_BASE_URL}/auth/me/complete/`,
};

export const WORKER_ENDPOINTS = {
  TOGGLE_AVAILABILITY: `${API_BASE_URL}/users/workers/toggle-availability/`,
  UPDATE_LOCATION: `${API_BASE_URL}/users/workers/update-location/`,
  STATUS: `${API_BASE_URL}/users/workers/status/`,
  SEARCH: `${API_BASE_URL}/users/workers/search/`,
};

/**
 * Make API request with proper error handling
 */
export const apiRequest = async (url, method = 'GET', data = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  try {
    console.log(`[API] API Request: ${method} ${url}`);
    if (data) {
      // Don't log sensitive data like passwords
      const safeData = { ...data };
      if (safeData.password) {
        safeData.password = '***HIDDEN***';
      }
      console.log('[REQ] Request data:', safeData);
    }
    
    const response = await fetch(url, config);
    const responseData = await response.json();

    console.log(`[RES] Response status: ${response.status}`);
    console.log('[RES] Response data:', responseData);

    if (!response.ok) {
      // Create error object with status
      const error = new Error(responseData.error || responseData.message || responseData.detail || 'Request failed');
      error.status = response.status;
      error.data = responseData;
      throw error;
    }

    return responseData;
  } catch (error) {
    console.error('[FAIL] API Request Error:', error);
    throw error;
  }
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  AUTH_ENDPOINTS,
  ORGANIZATION_ENDPOINTS,
  USER_ENDPOINTS,
  HTTP_METHODS,
  apiRequest,
};

