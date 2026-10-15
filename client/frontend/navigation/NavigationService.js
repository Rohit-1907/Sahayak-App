/**
 * NavigationService - Global navigation helper
 * 
 * Allows navigation from outside React components (like NotificationService).
 * Used for deep linking from push notifications.
 */

import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

let customNavigator = null;

export function setNavigator(navFn) {
  customNavigator = navFn;
}

export function navigate(name, params) {
  if (customNavigator) {
    try {
      customNavigator(name, params);
      return;
    } catch (e) {
      console.error('Custom navigator error:', e);
    }
  }
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    console.warn('Navigation not ready yet');
  }
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}
