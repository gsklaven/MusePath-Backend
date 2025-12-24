/**
 * API Information Configuration
 * Root endpoint metadata.
 */

const API = {
  name: 'MusePath API',
  version: '1.0.0',
  description: 'Interactive museum maps, exhibit details, and personalized navigation REST API'
};

const ENDPOINTS = {
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

export const API_INFO = {
  success: true,
  data: { ...API, endpoints: ENDPOINTS },
  message: `Welcome to ${API.name}`,
  error: null
};