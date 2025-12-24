/**
 * Mock Destinations Data
 * Represents points of interest within the museum.
 */

const NOW = new Date();
const CREATED = new Date('2024-01-01');

// Predefined coordinates for destinations
const COORDS = {
  entrance: { lat: 40.7610, lng: -73.9780 },
  galleryA: { lat: 40.7614, lng: -73.9776 },
  galleryB: { lat: 40.7615, lng: -73.9775 },
  galleryC: { lat: 40.7616, lng: -73.9774 },
  galleryD: { lat: 40.7617, lng: -73.9773 },
  restroom: { lat: 40.7612, lng: -73.9778 },
  cafe: { lat: 40.7613, lng: -73.9777 }
};

// Common time slots for suggestions
const TIMES = {
  standard: ['10:00 AM', '2:00 PM', '4:00 PM'],
  lunch: ['11:30 AM', '1:00 PM', '3:30 PM'],
  popular: ['11:00 AM', '3:00 PM'],
  offPeak: ['10:30 AM', '2:30 PM'],
  closed: ['Tomorrow 10:00 AM', 'Friday 2:00 PM']
};

/**
 * Mock Destinations Collection
 * @type {Destination[]}
 */
export const mockDestinations = [
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
].map(c => ({
  // Map raw data to Destination structure
  destinationId: c.id,
  name: c.name,
  type: c.type,
  coordinates: c.coords,
  mapId: c.mapId || 1,
  status: c.status || 'available',
  crowdLevel: c.crowd || 'low',
  lastUpdated: NOW,
  alternatives: c.alternatives || [],
  suggestedTimes: c.times || [],
  createdAt: CREATED,
  updatedAt: CREATED
}));