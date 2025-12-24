/**
 * API Information Configuration
 * Metadata returned by root endpoint (GET /).
 */

const API_NAME = 'MusePath API';
const API_VERSION = '1.0.0';
const API_DESCRIPTION = 'Interactive museum maps, exhibit details, and personalized navigation REST API';

/**
 * Defines available API endpoints.
 * @returns {Object} Map of endpoint names to paths
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
 * @returns {Object} Complete API metadata
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

export const API_INFO = createApiInfo();