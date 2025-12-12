import express from 'express';
import authRoutes from './authentication.js';
import coordinatesRoutes from './coordinates.js';
import destinationsRoutes from './destinations.js';
import exhibitsRoutes from './exhibits.js';
import mapsRoutes from './maps.js';
import routesRoutes from './routes.js';
import usersRoutes from './users.js';
import notificationsRoutes from './notifications.js';
import syncRoutes from './sync.js';
import downloadsRoutes from './downloads.js';

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
router.use('/auth', authRoutes);
router.use('/coordinates', coordinatesRoutes);
router.use('/destinations', destinationsRoutes);
router.use('/exhibits', exhibitsRoutes);
router.use('/maps', mapsRoutes);
router.use('/routes', routesRoutes);
router.use('/users', usersRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/sync', syncRoutes);
router.use('/downloads', downloadsRoutes);

export default router;
