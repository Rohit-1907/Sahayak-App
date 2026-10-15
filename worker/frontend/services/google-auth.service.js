/**
 * Google OAuth Authentication Service - Worker App
 * Handles Google Sign-In using Expo Auth Session
 */

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BACKEND_URL } from '../config/api';

// Complete the authentication session
WebBrowser.maybeCompleteAuthSession();

const API_URL = BACKEND_URL;

/**
 * Google OAuth Configuration
 * You need to get these from Google Cloud Console:
 * https://console.cloud.google.com/
 */
export const GOOGLE_CONFIG = {
  expoClientId: '667363817344-l65o6e0k79ub3bpl5v6r3b2lqr3o4l8c.apps.googleusercontent.com',
  iosClientId: '667363817344-l65o6e0k79ub3bpl5v6r3b2lqr3o4l8c.apps.googleusercontent.com',
  androidClientId: '667363817344-tda4lcjkdoiub0vis24o581e6vlfqos7.apps.googleusercontent.com',
  webClientId: '667363817344-l65o6e0k79ub3bpl5v6r3b2lqr3o4l8c.apps.googleusercontent.com',
};

/**
 * Initialize Google OAuth request
 */
export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_CONFIG.expoClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
    androidClientId: GOOGLE_CONFIG.androidClientId,
    webClientId: GOOGLE_CONFIG.webClientId,
  });

  return { request, response, promptAsync };
};

/**
 * Handle Google OAuth Response
 * Exchanges Google token for backend JWT tokens
 */
export const handleGoogleResponse = async (response) => {
  if (response?.type === 'success') {
    const { authentication } = response;
    
    console.log('[AUTH] Google Auth Success (Worker)');
    console.log('   Access Token:', authentication.accessToken.substring(0, 20) + '...');
    
    try {
      // Get user info from Google
      const userInfo = await fetchGoogleUserInfo(authentication.accessToken);
      console.log('[USER] Google User Info:', userInfo.email);
      
      // Send to backend for authentication
      const backendResponse = await authenticateWithBackend(
        authentication.accessToken,
        userInfo,
        'worker' // User type for worker app
      );
      
      return backendResponse;
    } catch (error) {
      console.error('[FAIL] Error handling Google response:', error);
      throw error;
    }
  } else if (response?.type === 'error') {
    console.error('[FAIL] Google Auth Error:', response.error);
    throw new Error(response.error?.message || 'Google authentication failed');
  }
  
  return null;
};

/**
 * Fetch user information from Google
 */
const fetchGoogleUserInfo = async (accessToken) => {
  try {
    const response = await fetch(
      'https://www.googleapis.com/userinfo/v2/me',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch Google user info');
    }
    
    const userInfo = await response.json();
    return userInfo;
  } catch (error) {
    console.error('Error fetching Google user info:', error);
    throw error;
  }
};

/**
 * Authenticate with backend using Google token
 */
const authenticateWithBackend = async (googleToken, userInfo, userType) => {
  try {
    console.log('[API] Sending Google auth to backend (Worker)...');
    
    const response = await fetch(
      `${API_URL}/api/v1/authentication/google-auth/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: googleToken,
          user_type: userType,
          email: userInfo.email,
          first_name: userInfo.given_name,
          last_name: userInfo.family_name,
          google_id: userInfo.id,
          picture: userInfo.picture,
        }),
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Backend authentication failed');
    }
    
    console.log('[OK] Backend authentication successful (Worker)');
    
    // Store tokens
    await AsyncStorage.setItem('access_token', data.access);
    await AsyncStorage.setItem('refresh_token', data.refresh);
    await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
    
    console.log('[OK] Auth data saved to AsyncStorage');
    
    return data;
  } catch (error) {
    console.error('[FAIL] Backend authentication error:', error);
    throw error;
  }
};

/**
 * Logout - Clear stored tokens
 */
export const googleLogout = async () => {
  try {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('user_data');
    console.log('[AUTH] Logged out successfully');
  } catch (error) {
    console.error('Error logging out:', error);
  }
};
