/**
 * API Information Configuration
 * 
 * Provides metadata about the MusePath API including version,
 * description, and available endpoint paths.
 * 
 * @module config/apiInfo
 */

/**
 * API version number following semantic versioning.
 * @constant {string}
 */
const API_VERSION = '1.0.0';

/**
 * API name displayed in responses and documentation.
 * @constant {string}
 */
const API_NAME = 'MusePath API';

/**
 * Brief description of the API's purpose and capabilities.
 * @constant {string}
 */
const API_DESCRIPTION = 'Interactive museum maps, exhibit details, and personalized navigation REST API';

/**
 * Base paths for all API endpoint groups.
 * Each endpoint represents a major resource collection.
 * 
 * @constant {Object}
 */
const API_ENDPOINTS = {
  authentication: '/v1/auth',
  health: '/v1/health',
  coordinates: '/v1/coordinates',
  destinations: '/v1/destinations',
  exhibits: '/v1/exhibits',
  maps: '/v1/maps',
  routes: '/v1/routes',
  users: '/v1/users',
  notifications: '/v1/notifications',
  sync: '/v1/sync',
  downloads: '/v1/downloads'
};

/**
 * Complete API information object.
 * Used for root endpoint response and API documentation.
 * 
 * @constant {Object}
 * @property {boolean} success - Request success status
 * @property {Object} data - API metadata
 * @property {string} data.name - API name
 * @property {string} data.version - API version
 * @property {string} data.description - API description
 * @property {Object} data.endpoints - Available endpoint paths
 * @property {string} message - Welcome message
 * @property {null} error - Error information (null for success)
 */
export const API_INFO = {
  success: true,
  data: {
    name: API_NAME,
    version: API_VERSION,
    description: API_DESCRIPTION,
    endpoints: API_ENDPOINTS
  },
  message: 'Welcome to MusePath API',
  error: null
};
