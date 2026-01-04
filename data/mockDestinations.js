/**
 * Mock Destinations Data
 * 
 * Provides sample destination data for museum points of interest.
 * Used when database is unavailable for testing and development.
 * 
 * @module data/mockDestinations
 */

const NOW = new Date();
const CREATED = new Date('2024-01-01');

/**
 * Predefined coordinate locations for museum destinations.
 * @constant {Object}
 */
const COORDS = {
  entrance: { lat: 40.7610, lng: -73.9780 },
  galleryA: { lat: 40.7614, lng: -73.9776 },
  galleryB: { lat: 40.7615, lng: -73.9775 },
  galleryC: { lat: 40.7616, lng: -73.9774 },
  galleryD: { lat: 40.7617, lng: -73.9773 },
  restroom: { lat: 40.7612, lng: -73.9778 },
  cafe: { lat: 40.7613, lng: -73.9777 }
};

/**
 * Common time slot suggestions for different destination types.
 * @constant {Object}
 */
const TIMES = {
  standard: ['10:00 AM', '2:00 PM', '4:00 PM'],
  lunch: ['11:30 AM', '1:00 PM', '3:30 PM'],
  popular: ['11:00 AM', '3:00 PM'],
  offPeak: ['10:30 AM', '2:30 PM'],
  closed: ['Tomorrow 10:00 AM', 'Friday 2:00 PM']
};

/**
 * Raw destination definitions with minimal structure.
 * Each entry contains only essential properties.
 * @private
 */
const RAW_DESTINATIONS = [
  {
    id: 1,
    name: 'Main Entrance',
    type: 'entrance',
    coords: COORDS.entrance,
    crowd: 'medium',
    times: TIMES.standard
  },
  {
    id: 2,
    name: 'Gallery A - Modern Art',
    type: 'exhibit',
    coords: COORDS.galleryA,
    crowd: 'high',
    alternatives: [3, 5],
    times: TIMES.popular
  },
  {
    id: 3,
    name: 'Gallery B - Ancient Greece',
    type: 'exhibit',
    coords: COORDS.galleryB,
    alternatives: [4],
    times: TIMES.standard
  },
  {
    id: 4,
    name: 'Restroom - Ground Floor',
    type: 'restroom',
    coords: COORDS.restroom
  },
  {
    id: 5,
    name: 'Museum Cafe',
    type: 'cafe',
    coords: COORDS.cafe,
    crowd: 'medium',
    times: TIMES.lunch
  },
  {
    id: 6,
    name: 'Gallery C - Renaissance',
    type: 'exhibit',
    coords: COORDS.galleryC,
    mapId: 2,
    crowd: 'medium',
    times: TIMES.offPeak
  },
  {
    id: 7,
    name: 'Gallery D - Temporarily Closed',
    type: 'exhibit',
    coords: COORDS.galleryD,
    status: 'closed',
    crowd: 'none',
    alternatives: [2, 3, 6],
    times: TIMES.closed
  }
];

/**
 * Transforms a raw destination object into the full Destination schema.
 * Applies defaults for optional fields and normalizes property names.
 * 
 * @param {Object} raw - Raw destination data
 * @returns {Object} Fully structured destination object
 * @private
 */
function transformToDestination(raw) {
  return {
    destinationId: raw.id,
    name: raw.name,
    type: raw.type,
    coordinates: raw.coords,
    mapId: raw.mapId || 1,
    status: raw.status || 'available',
    crowdLevel: raw.crowd || 'low',
    lastUpdated: NOW,
    alternatives: raw.alternatives || [],
    suggestedTimes: raw.times || [],
    createdAt: CREATED,
    updatedAt: CREATED
  };
}

/**
 * Mock Destinations Collection.
 * Complete destination objects ready for use in controllers and tests.
 * 
 * @constant {Array<Object>}
 */
export const mockDestinations = RAW_DESTINATIONS.map(transformToDestination);