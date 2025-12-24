import express from 'express';
import * as routes from './routeModules.js';

const router = express.Router();

/**
 * API Health Check
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
 * Mount all route modules
 */
router.use('/auth', routes.auth);
router.use('/coordinates', routes.coordinates);
router.use('/destinations', routes.destinations);
router.use('/exhibits', routes.exhibits);
router.use('/maps', routes.maps);
router.use('/routes', routes.routesModule);
router.use('/users', routes.users);
router.use('/notifications', routes.notifications);
router.use('/sync', routes.sync);
router.use('/downloads', routes.downloads);

export default router;