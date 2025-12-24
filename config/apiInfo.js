/**
 * @typedef {Object} ApiEndpoints
 * @property {string} authentication - Authentication endpoints.
 * @property {string} health - Health check endpoint.
 * @property {string} coordinates - User coordinates endpoints.
 * @property {string} destinations - Destination endpoints.
 * @property {string} exhibits - Exhibit endpoints.
 * @property {string} maps - Map endpoints.
 * @property {string} routes - Routing endpoints.
 * @property {string} users - User management endpoints.
 * @property {string} notifications - Notification endpoints.
 * @property {string} sync - Offline synchronization endpoints.
 * @property {string} downloads - Download endpoints.
 */

/**
 * @typedef {Object} ApiInfoResponse
 * @property {boolean} success - Indicates if the request was successful.
 * @property {Object} data - The payload containing API details.
 * @property {string} data.name - API name.
 * @property {string} data.version - API version.
 * @property {string} data.description - API description.
 * @property {ApiEndpoints} data.endpoints - Dictionary of available endpoints.
 * @property {string} message - Welcome message.
 * @property {Object|null} error - Error object, if any.
 */

/**
 * API Information Configuration
 * Metadata returned by root endpoint (GET /).
 */

const API_NAME = 'MusePath API';
const API_VERSION = '1.0.0';
const API_DESCRIPTION = 'Interactive museum maps, exhibit details, and personalized navigation REST API';

/**
 * Defines available API endpoints.
 * @returns {ApiEndpoints} Map of endpoint names to paths
 */
const getEndpoints = () => ({
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
});

/**
 * Creates API info response object.
 * @returns {ApiInfoResponse} Complete API metadata
 */
const createApiInfo = () => ({
  success: true,
  data: {
    name: API_NAME,
    version: API_VERSION,
    description: API_DESCRIPTION,
    endpoints: getEndpoints()
  },
  message: `Welcome to ${API_NAME}`,
  error: null
});

/**
 * The API information object.
 * @type {ApiInfoResponse}
 */
export const API_INFO = createApiInfo();