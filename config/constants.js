/**
 * Mock admin user password (unhashed).
 * Used for tests and mock data initialization.
 */
export const MOCK_ADMIN_PASSWORD = process.env.MOCK_ADMIN_PASSWORD || 'Password123!';

/**
 * Number of salt rounds for bcrypt hashing.
 * Higher values increase security but take longer to compute.
 */
export const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

/**
 * Application Constants
 * Centralized configuration values for the application.
 */

/**
 * Default walking speed in km/h.
 * Used for route time estimation.
 */
export const DEFAULT_WALKING_SPEED = Number(process.env.DEFAULT_WALKING_SPEED) || 5;

/**
 * Route deviation threshold in meters.
 * Distance at which a user is considered off-route.
 */
export const ROUTE_DEVIATION_THRESHOLD = Number(process.env.ROUTE_DEVIATION_THRESHOLD) || 50;

/**
 * Route calculation timeout in seconds.
 * Maximum time allowed for pathfinding algorithms.
 */
export const ROUTE_CALCULATION_TIMEOUT = 5;

/**
 * Exhibit status types.
 * @enum {string}
 */
export const EXHIBIT_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  UNDER_MAINTENANCE: 'under_maintenance'
};

/**
 * Destination status types.
 * @enum {string}
 */
export const DESTINATION_STATUS = {
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
  CLOSED: 'closed'
};

/**
 * Crowd level types.
 * Indicates the density of visitors at a location.
 * @enum {string}
 */
export const CROWD_LEVEL = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

/**
 * Notification types.
 * Categories for system alerts sent to users.
 * @enum {string}
 */
export const NOTIFICATION_TYPE = {
  ROUTE_DEVIATION: 'route_deviation',
  ARRIVAL: 'arrival',
  DESTINATION_CLOSED: 'destination_closed',
  CROWD_ALERT: 'crowd_alert',
  INFO: 'info'
};

/**
 * Operation modes.
 * Defines if the application is running with live data or offline capabilities.
 * @enum {string}
 */
export const MODE = {
  ONLINE: 'online',
  OFFLINE: 'offline'
};

/**
 * Destination types.
 * Classifies points of interest on the map.
 * @enum {string}
 */
export const DESTINATION_TYPE = {
  EXHIBIT: 'exhibit',
  RESTROOM: 'restroom',
  EXIT: 'exit',
  ENTRANCE: 'entrance',
  CAFE: 'cafe',
  SHOP: 'shop',
  INFORMATION: 'information'
};

/**
 * Sync operation types.
 * Actions that can be synchronized from offline state.
 * @enum {string}
 */
export const SYNC_OPERATION = {
  RATING: 'rating',
  ADD_FAVORITE: 'add_favorite',
  REMOVE_FAVORITE: 'remove_favorite'
};

/**
 * API version string.
 * Used for route prefixing (e.g., /v1/...).
 */
export const API_VERSION = process.env.API_VERSION || 'v1';

/**
 * Rate limiting configuration.
 * Controls request throttling parameters.
 */
export const RATE_LIMIT = {
  WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 500 // Increased for testing
};

/**
 * Retrieves the JWT secret key.
 * Prioritizes environment variables, falls back to a default for development.
 * @returns {string} The JWT secret key.
 */
const DEV_FALLBACK_SECRET = "dev-jwt-secret-change-me";
export const getJwtSecret = () => process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || DEV_FALLBACK_SECRET;