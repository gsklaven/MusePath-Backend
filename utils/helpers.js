import Exhibit from '../models/Exhibit.js';

/** Utility helpers for service layer */

export const toNumber = (v) => {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

export const now = () => new Date();

/**
 * Find a document's ObjectId by a numeric field value.
 * @param {Model} Model - Mongoose model
 * @param {string} fieldName - Numeric field name on the model (e.g. 'exhibitId')
 * @param {number|string} value - Numeric value to match
 * @returns {Promise<ObjectId|null>} Document _id or null
 */
export const getModelIdByNumericField = async (Model, fieldName, value) => {
  const num = toNumber(value);
  if (num === null) return null;
  const query = {};
  query[fieldName] = num;
  const doc = await Model.findOne(query).select('_id');
  return doc ? doc._id : null;
};

export const findExhibitObjectId = async (exhibitId) => {
  return await getModelIdByNumericField(Exhibit, 'exhibitId', exhibitId);
};

export default {
  toNumber,
  now,
  getModelIdByNumericField,
  findExhibitObjectId,
};
/**
 * Helper utility functions
 */

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - First latitude
 * @param {number} lng1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lng2 - Second longitude
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Calculate estimated time based on distance and walking speed
 * @param {number} distance - Distance in meters
 * @param {number} walkingSpeed - Walking speed in km/h (default 5)
 * @returns {number} Estimated time in seconds
 */
export const calculateEstimatedTime = (distance, walkingSpeed = 5) => {
  const speedMetersPerSecond = (walkingSpeed * 1000) / 3600;
  return Math.round(distance / speedMetersPerSecond);
};

/**
 * Calculate arrival time
 * @param {number} estimatedSeconds - Estimated time in seconds
 * @returns {string} Arrival time string
 */
export const calculateArrivalTime = (estimatedSeconds) => {
  const now = new Date();
  const arrivalDate = new Date(now.getTime() + estimatedSeconds * 1000);
  return arrivalDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

/**
 * Generate simple path between two points
 * @param {Object} start - Start coordinates {lat, lng}
 * @param {Object} end - End coordinates {lat, lng}
 * @returns {Array} Array of path points
 */
export const generatePath = (start, end) => {
  // Simple path generation (linear interpolation)
  const path = [];
  const steps = 3;
  
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    path.push({
      lat: start.lat + (end.lat - start.lat) * ratio,
      lng: start.lng + (end.lng - start.lng) * ratio
    });
  }
  
  return path;
};

/**
 * Generate navigation instructions
 * @param {number} distance - Distance in meters
 * @returns {Array<string>} Array of instruction strings
 */
export const generateInstructions = (distance) => {
  const instructions = [];
  
  instructions.push('Start from your current location');
  
  if (distance > 100) {
    instructions.push(`Walk straight for ${Math.round(distance / 2)} meters`);
    instructions.push('Continue following the path');
  } else {
    instructions.push(`Walk ${Math.round(distance)} meters to your destination`);
  }
  
  instructions.push('You have arrived at your destination');
  
  return instructions;
};

/**
 * Calculate average rating from ratings map
 * @param {Map} ratings - Map of user ratings
 * @returns {number} Average rating
 */
export const calculateAverageRating = (ratings) => {
  if (!ratings || ratings.size === 0) return 0;
  
  const values = Array.from(ratings.values());
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / values.length) * 10) / 10; // Round to 1 decimal
};

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

/**
 * Format duration for display
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Generate unique ID
 * @param {Array} items - Array of items with ID property
 * @param {string} idField - Name of ID field
 * @returns {number} New unique ID
 */
export const generateUniqueId = (items, idField = 'id') => {
  if (!items || items.length === 0) return 1;
  const maxId = Math.max(...items.map(item => item[idField] || 0));
  return maxId + 1;
};

/**
 * Check if route deviation exceeds threshold
 * @param {Object} currentPos - Current position {lat, lng}
 * @param {Array} routePath - Route path array
 * @param {number} threshold - Deviation threshold in meters
 * @returns {boolean} True if deviated
 */
export const isRouteDeviated = (currentPos, routePath, threshold = 50) => {
  if (!routePath || routePath.length === 0) return false;
  
  // Find minimum distance to any point on the path
  const distances = routePath.map(point => 
    calculateDistance(currentPos.lat, currentPos.lng, point.lat, point.lng)
  );
  
  const minDistance = Math.min(...distances);
  return minDistance > threshold;
};

/**
 * Sanitize search term for consistent comparison
 * @param {string} term - The search term
 * @returns {string} Sanitized term
 */
export const sanitizeSearchTerm = (term = '') => {
  return String(term).trim().toLowerCase();
};