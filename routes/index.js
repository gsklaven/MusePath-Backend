import express from 'express';
import * as routeModules from './routeModules.js';

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
