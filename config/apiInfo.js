/**
 * API Information Configuration
 * Centralizes metadata about the API and its available endpoints.
 */

/**
 * API Version
 */
const VERSION = '1.0.0';

/**
 * Base path for API routes
 */
const BASE_PATH = '/v1';

/**
 * Available API Endpoints
 * Maps resource names to their route paths.
 */
const ENDPOINTS = {
  authentication: `${BASE_PATH}/auth`,
  health: `${BASE_PATH}/health`,
  coordinates: `${BASE_PATH}/coordinates`,
  destinations: `${BASE_PATH}/destinations`,
  exhibits: `${BASE_PATH}/exhibits`,
  maps: `${BASE_PATH}/maps`,
  routes: `${BASE_PATH}/routes`,
  users: `${BASE_PATH}/users`,
  notifications: `${BASE_PATH}/notifications`,
  sync: `${BASE_PATH}/sync`,
  downloads: `${BASE_PATH}/downloads`
};

/**
 * Standard API Response Object for Root Endpoint
 * @type {Object}
 */
export const API_INFO = {
  success: true,
  data: {
    name: 'MusePath API',
    version: VERSION,
    description: 'Interactive museum maps, exhibit details, and personalized navigation REST API',
    endpoints: ENDPOINTS
  },
  message: 'Welcome to MusePath API',
  error: null
};
