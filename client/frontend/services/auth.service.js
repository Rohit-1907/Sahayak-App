/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, apiRequest, HTTP_METHODS } from '../config/api';

// Storage Keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
};

/**
 * Register a new user
 */
export const register = async (userData) => {
  try {
    const response = await apiRequest(
      API_ENDPOINTS.REGISTER,
      HTTP_METHODS.POST,
      userData
    );
    
    console.log('[OK] Registration successful:', response);
    
    // Save tokens and user data (don't fail if storage fails)
    if (response.success && response.tokens) {
      await saveAuthData(response.tokens, response.user);
    }
    
    return response;
  } catch (error) {
    console.error('Register Error:', error);
    throw error;
  }
};

/**
 * Login user
 */
export const login = async (username, password) => {
  try {
    console.log('[AUTH] Attempting login for:', username);
    
    const response = await apiRequest(
      API_ENDPOINTS.LOGIN,
      HTTP_METHODS.POST,
      { 
        username, 
        password,
        app_type: 'client'  // Validate that only customers can login to client app
      }
    );
    
    console.log('[OK] Login successful:', response.user.username);
    
    // Save tokens and user data (don't fail if storage fails)
    if (response.access && response.refresh) {
      await saveAuthData(
        {
          access: response.access,
          refresh: response.refresh,
        },
        response.user
      );
    }
    
    return response;
  } catch (error) {
    console.error('Login Error:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    
    if (refreshToken && accessToken) {
      await apiRequest(
        API_ENDPOINTS.LOGOUT,
        HTTP_METHODS.POST,
        { refresh: refreshToken },
        accessToken
      );
    }
  } catch (error) {
    console.error('Logout Error:', error);
  } finally {
    // Clear local storage regardless of API call result
    await clearAuthData();
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    
    if (!token) {
      throw new Error('No access token found');
    }
    
    const response = await apiRequest(
      API_ENDPOINTS.CURRENT_USER,
      HTTP_METHODS.GET,
      null,
      token
    );
    
    return response;
  } catch (error) {
    console.error('Get Current User Error:', error);
    throw error;
  }
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }
    
    const response = await apiRequest(
      API_ENDPOINTS.REFRESH_TOKEN,
      HTTP_METHODS.POST,
      { refresh: refreshToken }
    );
    
    // Update tokens
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access);
    if (response.refresh) {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh);
    }
    
    return response;
  } catch (error) {
    console.error('Refresh Token Error:', error);
    await clearAuthData();
    throw error;
  }
};

/**
 * Save authentication data to AsyncStorage
 */
const saveAuthData = async (tokens, user) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access);
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    console.log('[OK] Auth data saved successfully');
  } catch (error) {
    console.error('Save Auth Data Error:', error);
    // Don't throw - allow login to continue even if storage fails
    console.warn('[WARN] Could not save to storage, but login succeeded');
  }
};

/**
 * Clear authentication data from AsyncStorage
 */
const clearAuthData = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  } catch (error) {
    console.error('Clear Auth Data Error:', error);
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return !!token;
  } catch (error) {
    console.error('Check Auth Error:', error);
    return false;
  }
};

/**
 * Get stored user data
 */
export const getStoredUser = async () => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Get Stored User Error:', error);
    return null;
  }
};

/**
 * Get stored access token
 */
export const getAccessToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Get Access Token Error:', error);
    return null;
  }
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  refreshAccessToken,
  isAuthenticated,
  getStoredUser,
  getAccessToken,
};
