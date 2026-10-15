/**
 * API Configuration
 * 
 * IMPORTANT: Use your computer's IP address (not localhost) for mobile apps
 * Your IP: 10.197.201.150 (Updated for Wi-Fi)
 */

// Base API URL - Django server
export const API_BASE_URL = 'https://sahayak-app-production.up.railway.app';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  REGISTER: `${API_BASE_URL}/api/v1/auth/register/`,
  LOGIN: `${API_BASE_URL}/api/v1/auth/login/`,
  LOGOUT: `${API_BASE_URL}/api/v1/auth/logout/`,
  REFRESH_TOKEN: `${API_BASE_URL}/api/v1/auth/refresh/`,
  CURRENT_USER: `${API_BASE_URL}/api/v1/auth/me/`,
  
  // User Management (to be implemented)
  USERS: `${API_BASE_URL}/api/v1/users/`,
  
  // Services (to be implemented)
  SERVICES: `${API_BASE_URL}/api/v1/services/`,
  
  // Jobs (to be implemented)
  JOBS: `${API_BASE_URL}/api/v1/jobs/`,
  
  // Organizations (to be implemented)
  ORGANIZATIONS: `${API_BASE_URL}/api/v1/organizations/`,
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

// Request Headers
export const getHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// API Request Helper
export const apiRequest = async (url, method = 'GET', body = null, token = null) => {
  try {
    const options = {
      method,
      headers: getHeaders(token),
    };
    
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || data.detail || 'Request failed',
        errors: data.errors || data,
      };
    }
    
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  HTTP_METHODS,
  getHeaders,
  apiRequest,
};
