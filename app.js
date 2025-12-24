import express from 'express';
import { setupMiddleware, setupSecurity } from './middleware/setup.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

/**
 * Express Application Setup
 */
const app = express();

/**
 * Security & Request Processing Middleware
 */
setupSecurity(app);
setupMiddleware(app);

/**
 * API Routes
 */
app.use('/v1', routes);

// Root endpoint
app.get('/', (_, res) => {
  res.json({
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
  });
});

/**
 * Error Handling Middleware
 */
app.use(notFoundHandler);
app.use(errorHandler);

export default app;