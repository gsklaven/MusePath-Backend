/**
 * Mock Destinations Data
 * Sample destination points within the museum for testing and development.
 */

/**
 * @typedef {Object} Destination
 * @property {number} destinationId - Unique identifier for the destination.
 * @property {string} name - Display name of the destination.
 * @property {string} type - Category of the destination (e.g., 'exhibit', 'restroom').
 * @property {{lat: number, lng: number}} coordinates - Geographical location (latitude, longitude).
 * @property {number} mapId - ID of the map floor plan this destination belongs to.
 * @property {string} status - Operational status (e.g., 'available', 'closed').
 * @property {string} crowdLevel - Current crowd density estimation.
 * @property {Date} lastUpdated - Timestamp of the last status update.
 * @property {number[]} alternatives - IDs of alternative destinations if this one is crowded/closed.
 * @property {string[]} suggestedTimes - Recommended visiting times.
 * @property {Date} createdAt - Record creation timestamp.
 * @property {Date} updatedAt - Record last modification timestamp.
 */

/**
 * Shared timestamps for data consistency.
 */
const TIMESTAMP = {
  now: new Date(),
  created: new Date('2024-01-01')
};

/**
 * Predefined coordinates for museum locations.
 * @type {Object.<string, {lat: number, lng: number}>}
 */
const COORDINATES = {
  mainEntrance: { lat: 40.7610, lng: -73.9780 },
  galleryA: { lat: 40.7614, lng: -73.9776 },
  galleryB: { lat: 40.7615, lng: -73.9775 },
  galleryC: { lat: 40.7616, lng: -73.9774 },
  galleryD: { lat: 40.7617, lng: -73.9773 },
  restroom: { lat: 40.7612, lng: -73.9778 },
  cafe: { lat: 40.7613, lng: -73.9777 }
};

/**
 * Common suggested visiting time slots.
 * @type {Object.<string, string[]>}
 */
const SUGGESTED_TIMES = {
  standard: ['10:00 AM', '2:00 PM', '4:00 PM'],
  lunch: ['11:30 AM', '1:00 PM', '3:30 PM'],
  popular: ['11:00 AM', '3:00 PM'],
  offPeak: ['10:30 AM', '2:30 PM'],
  closed: ['Tomorrow 10:00 AM', 'Friday 2:00 PM']
};

/**
 * Creates destination with standard fields.
 * @param {Object} config - Destination configuration
 * @returns {Destination}
 */
const buildDestination = (config) => ({
  destinationId: config.id,
  name: config.name,
  type: config.type,
  coordinates: config.coords,
  mapId: config.mapId || 1,
  status: config.status || 'available',
  crowdLevel: config.crowd || 'low',
  lastUpdated: TIMESTAMP.now,
  alternatives: config.alternatives || [],
  suggestedTimes: config.times || [],
  createdAt: TIMESTAMP.created,
  updatedAt: TIMESTAMP.created
});

/**
 * Raw configuration data for destinations.
 * @type {Array<Object>}
 */
const DESTINATIONS = [
  { id: 1, name: 'Main Entrance', type: 'entrance', coords: COORDINATES.mainEntrance, crowd: 'medium', times: SUGGESTED_TIMES.standard },
  { id: 2, name: 'Gallery A - Modern Art', type: 'exhibit', coords: COORDINATES.galleryA, crowd: 'high', alternatives: [3, 5], times: SUGGESTED_TIMES.popular },
  { id: 3, name: 'Gallery B - Ancient Greece', type: 'exhibit', coords: COORDINATES.galleryB, alternatives: [4], times: SUGGESTED_TIMES.standard },
  { id: 4, name: 'Restroom - Ground Floor', type: 'restroom', coords: COORDINATES.restroom },
  { id: 5, name: 'Museum Cafe', type: 'cafe', coords: COORDINATES.cafe, crowd: 'medium', times: SUGGESTED_TIMES.lunch },
  { id: 6, name: 'Gallery C - Renaissance', type: 'exhibit', coords: COORDINATES.galleryC, mapId: 2, crowd: 'medium', times: SUGGESTED_TIMES.offPeak },
  { id: 7, name: 'Gallery D - Temporarily Closed', type: 'exhibit', coords: COORDINATES.galleryD, status: 'closed', crowd: 'none', alternatives: [2, 3, 6], times: SUGGESTED_TIMES.closed }
];

/**
 * Mock Destinations Collection.
 * Exported array of processed Destination objects.
 * @type {Destination[]}
 */
export const mockDestinations = DESTINATIONS.map(buildDestination);