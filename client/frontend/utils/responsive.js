/**
 * Responsive Utilities for React Native
 * 
 * Provides scaling functions to make UI responsive across different Android screen sizes.
 * Base dimensions: iPhone 12 (390x844) as reference
 * 
 * Usage:
 * import { scale, verticalScale, moderateScale, wp, hp } from './utils/responsive';
 * 
 * width: scale(100)           // Scales horizontally
 * height: verticalScale(100)  // Scales vertically
 * fontSize: moderateScale(16) // Balanced scaling for text
 * width: wp(80)               // 80% of screen width
 * height: hp(50)              // 50% of screen height
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';

// Get device screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 12 as reference device)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

/**
 * Scale size horizontally based on screen width
 * Use for: widths, horizontal margins/padding, horizontal positions
 * 
 * @param {number} size - Size in pixels based on design
 * @returns {number} Scaled size
 */
export const scale = (size) => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Scale size vertically based on screen height
 * Use for: heights, vertical margins/padding, vertical positions
 * 
 * @param {number} size - Size in pixels based on design
 * @returns {number} Scaled size
 */
export const verticalScale = (size) => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Moderate scale - balances between scale and verticalScale
 * Use for: font sizes, border radius, icon sizes
 * 
 * @param {number} size - Size in pixels based on design
 * @param {number} factor - Scaling factor (0 = no scaling, 1 = full scaling). Default: 0.5
 * @returns {number} Moderately scaled size
 */
export const moderateScale = (size, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

/**
 * Width percentage
 * Use for: responsive widths as percentage of screen
 * 
 * @param {number} percentage - Percentage of screen width (0-100)
 * @returns {number} Width in pixels
 */
export const wp = (percentage) => {
  return (SCREEN_WIDTH * percentage) / 100;
};

/**
 * Height percentage
 * Use for: responsive heights as percentage of screen
 * 
 * @param {number} percentage - Percentage of screen height (0-100)
 * @returns {number} Height in pixels
 */
export const hp = (percentage) => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

/**
 * Check if device is small (< 5.5" screens)
 * Typical: 360x640 (Galaxy S10e, older phones)
 * 
 * @returns {boolean}
 */
export const isSmallDevice = () => {
  return SCREEN_WIDTH < 375;
};

/**
 * Check if device is medium (5.5" - 6.2" screens)
 * Typical: 375-390x812-844 (iPhone 12, Galaxy S21)
 * 
 * @returns {boolean}
 */
export const isMediumDevice = () => {
  return SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
};

/**
 * Check if device is large (> 6.2" screens)
 * Typical: 414-428x896-926 (iPhone 14 Pro Max, Galaxy S22 Ultra)
 * 
 * @returns {boolean}
 */
export const isLargeDevice = () => {
  return SCREEN_WIDTH >= 414;
};

/**
 * Get device screen dimensions
 * 
 * @returns {Object} { width, height }
 */
export const getScreenDimensions = () => {
  return {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  };
};

/**
 * Get device pixel ratio
 * 
 * @returns {number} Pixel ratio
 */
export const getPixelRatio = () => {
  return PixelRatio.get();
};

/**
 * Convert font scale to normalized size
 * Useful for accessibility (respects user's font size settings)
 * 
 * @param {number} size - Base font size
 * @returns {number} Scaled font size
 */
export const fontScale = (size) => {
  return size * PixelRatio.getFontScale();
};

/**
 * Minimum touch target size (44x44 for iOS, 48x48 for Android)
 * Ensures accessibility compliance
 */
export const MIN_TOUCH_TARGET = Platform.OS === 'ios' ? 44 : 48;

/**
 * Ensure minimum touch target size
 * 
 * @param {number} size - Desired size
 * @returns {number} Size that meets minimum touch target
 */
export const touchableScale = (size) => {
  const scaled = scale(size);
  return Math.max(scaled, MIN_TOUCH_TARGET);
};

// Export all screen dimensions for reference
export const DEVICE = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: isSmallDevice(),
  isMedium: isMediumDevice(),
  isLarge: isLargeDevice(),
  pixelRatio: getPixelRatio(),
};

// Responsive spacing scale (use for consistent spacing)
export const SPACING = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(20),
  xxl: moderateScale(24),
  xxxl: moderateScale(32),
};

// Responsive font sizes (use for consistent typography)
export const FONT_SIZE = {
  xs: moderateScale(10),
  sm: moderateScale(12),
  md: moderateScale(14),
  lg: moderateScale(16),
  xl: moderateScale(18),
  xxl: moderateScale(20),
  xxxl: moderateScale(24),
  huge: moderateScale(28),
  massive: moderateScale(32),
};

// Responsive border radius (use for consistent rounded corners)
export const BORDER_RADIUS = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(20),
  xxl: moderateScale(24),
  circle: 999, // For circular elements
};

// Export helper for debugging
export const logDeviceInfo = () => {
  console.log('[DEV] Device Info:', {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    pixelRatio: getPixelRatio(),
    size: isSmallDevice() ? 'Small' : isMediumDevice() ? 'Medium' : 'Large',
    platform: Platform.OS,
  });
};
