/**
 * API Information Configuration
 * 
 * Provides metadata about the MusePath API including version, description,
 * and available endpoint base paths. Returned by the root endpoint (GET /).
 * 
 * @module config/apiInfo
 * @constant {Object} API_INFO
 * @property {boolean} success - Request success indicator
 * @property {Object} data - API metadata
 * @property {string} data.name - API name
 * @property {string} data.version - API version (semantic versioning)
 * @property {string} data.description - Brief API description
 * @property {Object} data.endpoints - Base paths for all endpoint groups
 * @property {string} message - Welcome message for API consumers
 * @property {null} error - Error information (null when successful)
 */
export const API_INFO = {
  success: true,
  data: {
    name: 'MusePath API',
    version: '1.0.0',
    description: 'Interactive museum maps, exhibit details, and personalized navigation REST API',
    endpoints: {
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
    }
  },
  message: 'Welcome to MusePath API',
  error: null
};
