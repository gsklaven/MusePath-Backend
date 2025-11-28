/**
 * Validation utility functions
 */

/**
 * Validate required fields
 * @param {Object} data - Data object to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {Object} Validation result
 */
export const validateRequiredFields = (data, requiredFields) => {
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
    message: missingFields.length > 0 
      ? `Missing required fields: ${missingFields.join(', ')}` 
      : 'All required fields are present'
  };
};

/**
 * Validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} Validation result
 */
export const validateCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * Validate rating value
 * @param {number} rating - Rating value
 * @returns {boolean} Validation result
 */
export const validateRating = (rating) => {
  return (
    typeof rating === 'number' &&
    rating >= 0 &&
    rating <= 5
  );
};

/**
 * Validate exhibit search mode
 * @param {string} mode - Mode value ('online' or 'offline')
 * @returns {boolean} Validation result
 */
export const validateMode = (mode) => {
  return mode === 'online' || mode === 'offline';
};

/**
 * Validate user ID
 * @param {*} userId - User ID
 * @returns {boolean} Validation result
 */
export const validateUserId = (userId) => {
  const id = Number(userId);
  return !isNaN(id) && id > 0 && Number.isInteger(id);
};

/**
 * Validate exhibit ID
 * @param {*} exhibitId - Exhibit ID
 * @returns {boolean} Validation result
 */
export const validateExhibitId = (exhibitId) => {
  const id = Number(exhibitId);
  return !isNaN(id) && id > 0 && Number.isInteger(id);
};

/**
 * Validate destination ID
 * @param {*} destinationId - Destination ID
 * @returns {boolean} Validation result
 */
export const validateDestinationId = (destinationId) => {
  const id = Number(destinationId);
  return !isNaN(id) && id > 0 && Number.isInteger(id);
};

/**
 * Validate route ID
 * @param {*} routeId - Route ID
 * @returns {boolean} Validation result
 */
export const validateRouteId = (routeId) => {
  const id = Number(routeId);
  return !isNaN(id) && id > 0 && Number.isInteger(id);
};

/**
 * Validate map ID
 * @param {*} mapId - Map ID
 * @returns {boolean} Validation result
 */
export const validateMapId = (mapId) => {
  const id = Number(mapId);
  return !isNaN(id) && id > 0 && Number.isInteger(id);
};

/**
 * Sanitize search term
 * @param {string} term - Search term
 * @returns {string} Sanitized term
 */
export const sanitizeSearchTerm = (term) => {
  if (typeof term !== 'string') return '';
  return term.trim().toLowerCase();
};
