import Coordinate from '../models/Coordinate.js';
import { isMockDataMode } from '../config/database.js';
import { mockCoordinates } from '../data/mockData.js';

/**
 * Coordinate Service
 * Business logic for user coordinate tracking
 */

/**
 * Get user coordinates
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Coordinate object
 */
export const getUserCoordinates = async (userId) => {
  if (isMockDataMode()) {
    const coord = mockCoordinates.find(c => c.userId === Number(userId));
    return coord || null;
  }
  
  return await Coordinate.findOne({ userId: Number(userId) });
};

/**
 * Update user coordinates
 * @param {number} userId - User ID
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Updated coordinate
 */
export const updateUserCoordinates = async (userId, lat, lng) => {
  if (isMockDataMode()) {
    let coord = mockCoordinates.find(c => c.userId === Number(userId));
    
    if (coord) {
      coord.lat = lat;
      coord.lng = lng;
      coord.timestamp = new Date();
      coord.updatedAt = new Date();
    } else {
      coord = {
        userId: Number(userId),
        lat,
        lng,
        timestamp: new Date(),
        updatedAt: new Date()
      };
      mockCoordinates.push(coord);
    }
    
    return coord;
  }
  
  return await Coordinate.findOneAndUpdate(
    { userId: Number(userId) },
    { 
      lat, 
      lng, 
      timestamp: new Date(),
      updatedAt: new Date()
    },
    { new: true, upsert: true }
  );
};
