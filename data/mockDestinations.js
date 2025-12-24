/**
 * Mock Destinations Collection
 * Mock destination points of interest within the museum.
 */
export const mockDestinations = [
  {
    // Unique identifier for the destination.
    destinationId: 1,
    // The name of the destination.
    name: 'Main Entrance',
    // The type of the destination.
    type: 'entrance',
    // The geographical coordinates of the destination.
    coordinates: { lat: 40.7610, lng: -73.9780 },
    // The ID of the map where the destination is located.
    mapId: 1,
    // The status of the destination.
    status: 'available',
    // The current crowd level at the destination.
    crowdLevel: 'medium',
    // The date and time when the destination was last updated.
    lastUpdated: new Date(),
    // A list of alternative destinations.
    alternatives: [],
    // A list of suggested times to visit the destination.
    suggestedTimes: ['10:00 AM', '2:00 PM', '4:00 PM'],
    // The date and time when the destination was created.
    createdAt: new Date('2024-01-01'),
    // The date and time when the destination was last updated.
    updatedAt: new Date('2024-01-01')
  },
  {
    destinationId: 2,
    name: 'Gallery A - Modern Art',
    type: 'exhibit',
    coordinates: { lat: 40.7614, lng: -73.9776 },
    mapId: 1,
    status: 'available',
    crowdLevel: 'high',
    lastUpdated: new Date(),
    alternatives: [3, 5],
    suggestedTimes: ['11:00 AM', '3:00 PM'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    destinationId: 3,
    name: 'Gallery B - Ancient Greece',
    type: 'exhibit',
    coordinates: { lat: 40.7615, lng: -73.9775 },
    mapId: 1,
    status: 'available',
    crowdLevel: 'low',
    lastUpdated: new Date(),
    alternatives: [4],
    suggestedTimes: ['10:00 AM', '2:00 PM', '4:00 PM'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    destinationId: 4,
    name: 'Restroom - Ground Floor',
    type: 'restroom',
    coordinates: { lat: 40.7612, lng: -73.9778 },
    mapId: 1,
    status: 'available',
    crowdLevel: 'low',
    lastUpdated: new Date(),
    alternatives: [],
    suggestedTimes: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    destinationId: 5,
    name: 'Museum Cafe',
    type: 'cafe',
    coordinates: { lat: 40.7613, lng: -73.9777 },
    mapId: 1,
    status: 'available',
    crowdLevel: 'medium',
    lastUpdated: new Date(),
    alternatives: [],
    suggestedTimes: ['11:30 AM', '1:00 PM', '3:30 PM'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    destinationId: 6,
    name: 'Gallery C - Renaissance',
    type: 'exhibit',
    coordinates: { lat: 40.7616, lng: -73.9774 },
    mapId: 2,
    status: 'available',
    crowdLevel: 'medium',
    lastUpdated: new Date(),
    alternatives: [],
    suggestedTimes: ['10:30 AM', '2:30 PM'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    destinationId: 7,
    name: 'Gallery D - Temporarily Closed',
    type: 'exhibit',
    coordinates: { lat: 40.7617, lng: -73.9773 },
    mapId: 1,
    status: 'closed',
    crowdLevel: 'none',
    lastUpdated: new Date(),
    alternatives: [2, 3, 6],
    suggestedTimes: ['Tomorrow 10:00 AM', 'Friday 2:00 PM'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];