/**
 * OpenStreetMap Routing Service
 * Uses OSRM (Open Source Routing Machine) for route calculation
 */

const OSRM_API = 'https://router.project-osrm.org/route/v1/driving';

/**
 * Get route between two points using OSRM
 * @param {Object} start - {latitude, longitude}
 * @param {Object} end - {latitude, longitude}
 * @returns {Promise<Object>} Route data with coordinates, distance, duration
 */
export const getRoute = async (start, end) => {
  try {
    const url = `${OSRM_API}/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
    
    console.log('[MAP] Fetching route from OSRM:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }
    
    const route = data.routes[0];
    const coordinates = route.geometry.coordinates.map(coord => ({
      latitude: coord[1],
      longitude: coord[0],
    }));
    
    return {
      coordinates,
      distance: route.distance, // in meters
      duration: route.duration, // in seconds
    };
  } catch (error) {
    console.error('[FAIL] Error fetching route:', error);
    throw error;
  }
};

/**
 * Calculate distance between two points (Haversine formula)
 * @param {Object} point1 - {latitude, longitude}
 * @param {Object} point2 - {latitude, longitude}
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.latitude)) *
    Math.cos(toRad(point2.latitude)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance
 */
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Format duration for display
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
};
