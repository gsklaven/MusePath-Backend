/**
 * Application Configuration
 * Centralized constants with environment variable overrides.
 */

/**
 * Helper to parse environment variables as numbers.
 * @param {string} key - The environment variable key.
 * @param {number} defaultValue - The default value if the key is missing.
 * @returns {number} The parsed number or default value.
 */
const getEnvNumber = (key, defaultValue) => {
  const value = process.env[key];
  return value ? Number(value) : defaultValue;
};

/**
 * Helper to get environment variables as strings.
 * @param {string} key - The environment variable key.
 * @param {string} defaultValue - The default value if the key is missing.
 * @returns {string} The environment variable value or default.
 */
const getEnvString = (key, defaultValue) => process.env[key] || defaultValue;

// ============================================================================
// Authentication & Security
// ============================================================================

/**
 * Mock admin user password (unhashed).
 * Used for tests and mock data initialization.
 */
export const MOCK_ADMIN_PASSWORD = getEnvString('MOCK_ADMIN_PASSWORD', 'Password123!');

/**
 * Number of salt rounds for bcrypt hashing.
 * Higher values increase security but take longer to compute.
 */
export const BCRYPT_SALT_ROUNDS = getEnvNumber('BCRYPT_SALT_ROUNDS', 10);

// ============================================================================
// Routing & Navigation
// ============================================================================

/**
 * Default walking speed in km/h.
 * Used for route time estimation.
 */
export const DEFAULT_WALKING_SPEED = getEnvNumber('DEFAULT_WALKING_SPEED', 5);

/**
 * Route deviation threshold in meters.
 * Distance at which a user is considered off-route.
 */
export const ROUTE_DEVIATION_THRESHOLD = getEnvNumber('ROUTE_DEVIATION_THRESHOLD', 50);

/**
 * Route calculation timeout in seconds.
 * Maximum time allowed for pathfinding algorithms.
 */
export const ROUTE_CALCULATION_TIMEOUT = 5;

// ============================================================================
// Status Enums
// ============================================================================

/**
 * Exhibit status types.
 * @enum {string}
 */
export const EXHIBIT_STATUS = Object.freeze({
  OPEN: 'open',
  CLOSED: 'closed',
  UNDER_MAINTENANCE: 'under_maintenance'
});

/**
 * Destination status types.
 * @enum {string}
 */
export const DESTINATION_STATUS = Object.freeze({
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
  CLOSED: 'closed'
});

/**
 * Crowd level types.
 * @enum {string}
 */
export const CROWD_LEVEL = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
});

// ============================================================================
// Application Types
// ============================================================================

/**
 * Notification types.
 * @enum {string}
 */
export const NOTIFICATION_TYPE = Object.freeze({
  ROUTE_DEVIATION: 'route_deviation',
  ARRIVAL: 'arrival',
  DESTINATION_CLOSED: 'destination_closed',
  CROWD_ALERT: 'crowd_alert',
  INFO: 'info'
});

/**
 * Operation modes.
 * @enum {string}
 */
export const MODE = Object.freeze({
  ONLINE: 'online',
  OFFLINE: 'offline'
});

/**
 * Destination types.
 * @enum {string}
 */
export const DESTINATION_TYPE = Object.freeze({
  EXHIBIT: 'exhibit',
  RESTROOM: 'restroom',
  EXIT: 'exit',
  ENTRANCE: 'entrance',
  CAFE: 'cafe',
  SHOP: 'shop',
  INFORMATION: 'information'
});

/**
 * Sync operation types.
 * @enum {string}
 */
export const SYNC_OPERATION = Object.freeze({
  RATING: 'rating',
  ADD_FAVORITE: 'add_favorite',
  REMOVE_FAVORITE: 'remove_favorite'
});

// ============================================================================
// API Configuration
// ============================================================================

/**
 * API version string.
 * Used for route prefixing (e.g., /v1/...).
 */
export const API_VERSION = getEnvString('API_VERSION', 'v1');

/**
 * Rate limiting configuration.
 * Controls request throttling parameters.
 */
export const RATE_LIMIT = Object.freeze({
  WINDOW_MS: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
  MAX_REQUESTS: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 500)
});

// ============================================================================
// JWT Secret
// ============================================================================

/**
 * Retrieves the JWT secret key.
 * Prioritizes environment variables, falls back to a default for development.
 * @returns {string} The JWT secret key.
 */
const DEV_FALLBACK_SECRET = "dev-jwt-secret-change-me";
export const getJwtSecret = () => 
  process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || DEV_FALLBACK_SECRET;