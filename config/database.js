import mongoose from 'mongoose';

/**
 * Database Configuration and Connection
 */

let isConnected = false;
let useMockData = false;

/**
 * Connect to MongoDB database
 * @returns {Promise<boolean>} Connection status
 */
export const connectDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    // If no MongoDB URI provided, use mock data
    if (!mongoURI || mongoURI.trim() === '') {
      console.log('ℹ️  No MongoDB URI provided. Using mock data.');
      useMockData = true;
      isConnected = false;
      return false;
    }

    // Skip if already connected
    if (isConnected) {
      console.log('✓ Using existing database connection');
      return true;
    }

    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    useMockData = false;
    console.log('✓ MongoDB connected successfully');
    return true;

  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    console.log('ℹ️  Falling back to mock data');
    useMockData = true;
    isConnected = false;
    return false;
  }
};

/**
 * Disconnect from MongoDB database
 * @returns {Promise<void>}
 */
export const disconnectDatabase = async () => {
  try {
    if (isConnected) {
      await mongoose.disconnect();
      isConnected = false;
      console.log('✓ MongoDB disconnected');
    }
  } catch (error) {
    console.error('✗ Error disconnecting from MongoDB:', error.message);
  }
};

/**
 * Check if using mock data
 * @returns {boolean}
 */
export const isMockDataMode = () => {
  return useMockData;
};

/**
 * Check if database is connected
 * @returns {boolean}
 */
export const isDatabaseConnected = () => {
  return isConnected;
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to database');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from database');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});
