import dotenv from 'dotenv';
import app from './app.js';
import { connectDatabase } from './config/database.js';

/**
 * Load Environment Variables
 */
dotenv.config();

/**
 * Server Configuration
 */
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start Server
 */
const startServer = async () => {
  try {
    console.log('🚀 Starting MusePath Backend Server...');
    console.log(`📝 Environment: ${NODE_ENV}`);
    
    // Connect to database (will fall back to mock data if MongoDB unavailable)
    await connectDatabase();
    
    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ API Base URL: http://localhost:${PORT}/v1`);
      console.log(`✓ Health Check: http://localhost:${PORT}/v1/health`);
      console.log('');
      console.log('📋 Available Endpoints:');
      console.log(`   GET    /v1/health`);
      console.log(`   POST   /v1/auth/register`);
      console.log(`   POST   /v1/auth/login`);
      console.log(`   POST   /v1/auth/logout`);
      console.log(`   GET    /v1/coordinates/:user_id`);
      console.log(`   PUT    /v1/coordinates/:user_id`);
      console.log(`   GET    /v1/destinations`);
      console.log(`   POST   /v1/destinations`);
      console.log(`   GET    /v1/destinations/:destination_id`);
      console.log(`   GET    /v1/exhibits/search`);
      console.log(`   GET    /v1/exhibits/:exhibit_id`);
      console.log(`   GET    /v1/exhibits/:exhibit_id/audio`);
      console.log(`   POST   /v1/exhibits/:exhibit_id/ratings`);
      console.log(`   GET    /v1/maps/:map_id`);
      console.log(`   POST   /v1/maps`);
      console.log(`   POST   /v1/routes`);
      console.log(`   GET    /v1/routes/:route_id`);
      console.log(`   PUT    /v1/routes/:route_id`);
      console.log(`   POST   /v1/routes/:route_id`);
      console.log(`   DELETE /v1/routes/:route_id`);
      console.log(`   PUT    /v1/users/:user_id/preferences`);
      console.log(`   POST   /v1/users/:user_id/favourites`);
      console.log(`   DELETE /v1/users/:user_id/favourites/:exhibit_id`);
      console.log(`   GET    /v1/users/:user_id/routes`);
      console.log(`   POST   /v1/notifications`);
      console.log(`   POST   /v1/sync`);
      console.log(`   GET    /v1/downloads/exhibits/:exhibit_id`);
      console.log(`   GET    /v1/downloads/maps/:map_id`);
      console.log('');
      console.log('🎯 Server ready to accept connections!');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('✓ HTTP server closed');
      });
    });

  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();
