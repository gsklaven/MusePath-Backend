/**
 * @typedef {Object} Coordinate
 * @property {number} userId - The ID of the user.
 * @property {number} lat - The latitude of the user's location.
 * @property {number} lng - The longitude of the user's location.
 * @property {Date} timestamp - The timestamp of the location.
 * @property {Date} updatedAt - The date and time when the location was last updated.
 */

/**
 * Shared timestamp for data consistency.
 */
const NOW = new Date();

/**
 * Factory function to create a coordinate entry.
 * @param {number} userId - The user ID.
 * @param {number} lat - Latitude.
 * @param {number} lng - Longitude.
 * @returns {Coordinate}
 */
const createCoordinate = (userId, lat, lng) => ({
  userId,
  lat,
  lng,
  timestamp: NOW,
  updatedAt: NOW
});

/**
 * Mock Coordinates Collection
 * Records the geographical coordinates of users within the museum.
 * @type {Coordinate[]}
 */
export const mockCoordinates = [
  createCoordinate(1, 40.7610, -73.9780), // Near Main Entrance
  createCoordinate(2, 40.7614, -73.9776), // Near Gallery A
  createCoordinate(3, 40.7612, -73.9778)  // Near Restroom
];