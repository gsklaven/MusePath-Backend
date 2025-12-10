import { sendValidationError } from '../utils/responses.js';
import { 
  validateCoordinates, 
  validateRating, 
  validateRequiredFields 
} from '../utils/validators.js';

/**
 * Validation Middleware Functions
 */

/**
 * Validate coordinate update request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateCoordinateUpdate = (req, res, next) => {
  const { lat, lng } = req.body;
  
  if (!validateCoordinates(lat, lng)) {
    return sendValidationError(res, 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180');
  }
  
  next();
};

/**
 * Validate route request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateRouteRequest = (req, res, next) => {
  // user_id comes from req.user.id (authentication), not from request body
  const validation = validateRequiredFields(req.body, ['destination_id', 'startLat', 'startLng']);
  
  if (!validation.isValid) {
    return sendValidationError(res, validation.message);
  }
  
  const { startLat, startLng } = req.body;
  
  if (!validateCoordinates(startLat, startLng)) {
    return sendValidationError(res, 'Invalid start coordinates');
  }
  
  next();
};

/**
 * Validate rating request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateRatingRequest = (req, res, next) => {
  const { rating } = req.body;
  
  if (rating === undefined || rating === null) {
    return sendValidationError(res, 'Rating is required');
  }
  
  if (!validateRating(rating)) {
    return sendValidationError(res, 'Invalid rating. Rating must be an integer between 1 and 5');
  }
  
  next();
};

/**
 * Validate map upload request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateMapUpload = (req, res, next) => {
  const validation = validateRequiredFields(req.body, ['mapData', 'format']);
  
  if (!validation.isValid) {
    return sendValidationError(res, validation.message);
  }
  
  next();
};

/**
 * Validate destination upload request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateDestinationUpload = (req, res, next) => {
  const validation = validateRequiredFields(req.body, ['map_id', 'destinations']);
  
  if (!validation.isValid) {
    return sendValidationError(res, validation.message);
  }
  
  if (!Array.isArray(req.body.destinations)) {
    return sendValidationError(res, 'Destinations must be an array');
  }
  
  next();
};

/**
 * Validate notification request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateNotificationRequest = (req, res, next) => {
  const validation = validateRequiredFields(req.body, ['user_id', 'route_id', 'currentLat', 'currentLng']);
  
  if (!validation.isValid) {
    return sendValidationError(res, validation.message);
  }
  
  const { currentLat, currentLng } = req.body;
  
  if (!validateCoordinates(currentLat, currentLng)) {
    return sendValidationError(res, 'Invalid current coordinates');
  }
  
  next();
};

/**
 * Validate exhibit creation request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateExhibitCreate = (req, res, next) => {
  const validation = validateRequiredFields(req.body, ['title', 'description', 'location']);
  
  if (!validation.isValid) {
    return sendValidationError(res, validation.message);
  }
  
  const { category } = req.body;
  
  // Category can be a string or array
  if (category && !Array.isArray(category) && typeof category !== 'string') {
    return sendValidationError(res, 'Category must be a string or array');
  }
  
  next();
};
