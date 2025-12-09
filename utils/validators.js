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

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 * - Only latin letters, digits and common special characters allowed
 *
 * @param {string} password
 * @returns {{isValid: boolean, message: string}}
 */
export const validatePasswordStrength = (password) => {
  if (typeof password !== 'string') {
    return { isValid: false, message: 'Password must be a string' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  // Allowed characters: A-Z a-z 0-9 and common ASCII special characters
  const allowedChars = /^[A-Za-z0-9!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]+$/;
  if (!allowedChars.test(password)) {
    return { isValid: false, message: 'Password contains invalid characters. Use only latin letters, digits and common special characters' };
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/.test(password);

  if (!hasUpper) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!hasLower) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!hasDigit) {
    return { isValid: false, message: 'Password must contain at least one digit' };
  }
  if (!hasSpecial) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }

  return { isValid: true, message: 'Password is strong' };
};
