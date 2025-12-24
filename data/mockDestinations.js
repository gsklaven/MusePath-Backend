/**
 * @typedef {Object} DestinationCoordinates
 * @property {number} lat - The latitude of the destination.
 * @property {number} lng - The longitude of the destination.
 */

/**
 * @typedef {Object} Destination
 * @property {number} destinationId - Unique identifier for the destination.
 * @property {string} name - The name of the destination.
 * @property {string} type - The type of the destination.
 * @property {DestinationCoordinates} coordinates - The geographical coordinates of the destination.
 * @property {number} mapId - The ID of the map where the destination is located.
 * @property {string} status - The status of the destination.
 * @property {string} crowdLevel - The current crowd level at the destination.
 * @property {Date} lastUpdated - The date and time when the destination was last updated.
 * @property {number[]} alternatives - A list of alternative destinations.
 * @property {string[]} suggestedTimes - A list of suggested times to visit the destination.
 * @property {Date} createdAt - The date and time when the destination was created.
 * @property {Date} updatedAt - The date and time when the destination was last updated.
 */

/**
 * Shared constants for data consistency.
 */
const NOW = new Date();
const CREATED_AT = new Date('2024-01-01');

/**
 * Factory function to create a destination entry.
 * @param {Object} params - The destination parameters.
 * @returns {Destination}
 */
const createDestination = ({
  destinationId, name, type, lat, lng, mapId, status, crowdLevel,
  suggestedTimes = [], alternatives = []
}) => ({
  destinationId,
  name,
  type,
  coordinates: { lat, lng },
  mapId,
  status,
  crowdLevel,
  lastUpdated: NOW,
  alternatives,
  suggestedTimes,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT
});

/**
 * Mock Destinations Collection
 * Mock destination points of interest within the museum.
 * @type {Destination[]}
 */
export const mockDestinations = [
  createDestination({
    destinationId: 1,
    name: 'Main Entrance',
    type: 'entrance',
    lat: 40.7610, lng: -73.9780,
    mapId: 1,
    status: 'available',
    crowdLevel: 'medium',
    suggestedTimes: ['10:00 AM', '2:00 PM', '4:00 PM']
  }),
  createDestination({
    destinationId: 2,
    name: 'Gallery A - Modern Art',
    type: 'exhibit',
    lat: 40.7614, lng: -73.9776,
    mapId: 1,
    status: 'available',
    crowdLevel: 'high',
    alternatives: [3, 5],
    suggestedTimes: ['11:00 AM', '3:00 PM']
  }),
  createDestination({
    destinationId: 3,
    name: 'Gallery B - Ancient Greece',
    type: 'exhibit',
    lat: 40.7615, lng: -73.9775,
    mapId: 1,
    status: 'available',
    crowdLevel: 'low',
    alternatives: [4],
    suggestedTimes: ['10:00 AM', '2:00 PM', '4:00 PM']
  }),
  createDestination({
    destinationId: 4,
    name: 'Restroom - Ground Floor',
    type: 'restroom',
    lat: 40.7612, lng: -73.9778,
    mapId: 1,
    status: 'available',
    crowdLevel: 'low'
  }),
  createDestination({
    destinationId: 5,
    name: 'Museum Cafe',
    type: 'cafe',
    lat: 40.7613, lng: -73.9777,
    mapId: 1,
    status: 'available',
    crowdLevel: 'medium',
    suggestedTimes: ['11:30 AM', '1:00 PM', '3:30 PM']
  }),
  createDestination({
    destinationId: 6,
    name: 'Gallery C - Renaissance',
    type: 'exhibit',
    lat: 40.7616, lng: -73.9774,
    mapId: 2,
    status: 'available',
    crowdLevel: 'medium',
    suggestedTimes: ['10:30 AM', '2:30 PM']
  }),
  createDestination({
    destinationId: 7,
    name: 'Gallery D - Temporarily Closed',
    type: 'exhibit',
    lat: 40.7617, lng: -73.9773,
    mapId: 1,
    status: 'closed',
    crowdLevel: 'none',
    alternatives: [2, 3, 6],
    suggestedTimes: ['Tomorrow 10:00 AM', 'Friday 2:00 PM']
  })
];