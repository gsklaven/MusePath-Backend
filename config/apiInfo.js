/**
 * API Information Configuration
 * 
 * This constant defines the metadata response returned by the root endpoint (GET /).
 * It provides clients with basic information about the API, including versioning,
 * description, and a directory of available resource endpoints.
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