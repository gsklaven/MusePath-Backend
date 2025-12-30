import express from 'express';
import * as routeModules from './routeModules.js';

const router = express.Router();

/**
 * Main API Router
 * 
 * This file serves as the central router for the entire v1 API. It aggregates all the
 * individual route modules from the `routeModules.js` file and mounts them on their
 * respective URL prefixes. It also provides a basic health check endpoint.
 */

/**
 * Provides a simple health check endpoint to verify that the API is running and responsive.
 * @route GET /health
 */
router.get('/health', (_, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    },
    message: 'MusePath API is running',
    error: null
  });
});

/**
 * Mount all the individual route modules.
 * Each module defines the endpoints for a specific API resource (e.g., auth, exhibits, routes).
 */
router.use('/auth', routeModules.auth);
router.use('/coordinates', routeModules.coordinates);
router.use('/destinations', routeModules.destinations);
router.use('/exhibits', routeModules.exhibits);
router.use('/maps', routeModules.maps);
router.use('/routes', routeModules.routesModule);
router.use('/users', routeModules.users);
router.use('/notifications', routeModules.notifications);
router.use('/sync', routeModules.sync);
router.use('/downloads', routeModules.downloads);

export default router;
