// Mock admin user password (unhashed, for tests and mock data)
export const MOCK_ADMIN_PASSWORD = process.env.MOCK_ADMIN_PASSWORD || 'Password123!';
// Bcrypt salt rounds
export const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
/**
 * Application Constants
 */

// Walking speed in km/h
export const DEFAULT_WALKING_SPEED = Number(process.env.DEFAULT_WALKING_SPEED) || 5;

// Route deviation threshold in meters
export const ROUTE_DEVIATION_THRESHOLD = Number(process.env.ROUTE_DEVIATION_THRESHOLD) || 50;

// Route calculation timeout in seconds
export const ROUTE_CALCULATION_TIMEOUT = 5;

// Exhibit status types
export const EXHIBIT_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  UNDER_MAINTENANCE: 'under_maintenance'
};

// Destination status types
export const DESTINATION_STATUS = {
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
  CLOSED: 'closed'
};

// Crowd level types
export const CROWD_LEVEL = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// Notification types
export const NOTIFICATION_TYPE = {
  ROUTE_DEVIATION: 'route_deviation',
  ARRIVAL: 'arrival',
  DESTINATION_CLOSED: 'destination_closed',
  CROWD_ALERT: 'crowd_alert',
  INFO: 'info'
};

// Mode types
export const MODE = {
  ONLINE: 'online',
  OFFLINE: 'offline'
};

// Destination types
export const DESTINATION_TYPE = {
  EXHIBIT: 'exhibit',
  RESTROOM: 'restroom',
  EXIT: 'exit',
  ENTRANCE: 'entrance',
  CAFE: 'cafe',
  SHOP: 'shop',
  INFORMATION: 'information'
};

// Sync operation types
export const SYNC_OPERATION = {
  RATING: 'rating',
  ADD_FAVORITE: 'add_favorite',
  REMOVE_FAVORITE: 'remove_favorite'
};

// API version
export const API_VERSION = process.env.API_VERSION || 'v1';

// Rate limiting
export const RATE_LIMIT = {
  WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 500 // Increased for testing
};

// JWT Secret
const DEV_FALLBACK_SECRET = "dev-jwt-secret-change-me";
export const getJwtSecret = () => process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || DEV_FALLBACK_SECRET;
