/**
 * @typedef {Object} RouteCoordinates
 * @property {number} lat - Latitude.
 * @property {number} lng - Longitude.
 */

/**
 * @typedef {Object} Route
 * @property {number} routeId - Unique identifier for the route.
 * @property {number} userId - The ID of the user who owns the route.
 * @property {number} destinationId - The ID of the destination of the route.
 * @property {RouteCoordinates} startCoordinates - The starting coordinates of the route.
 * @property {RouteCoordinates} endCoordinates - The ending coordinates of the route.
 * @property {RouteCoordinates[]} path - The path of the route.
 * @property {string[]} instructions - The instructions for the route.
 * @property {any[]} stops - A list of stops along the route.
 * @property {number} distance - The distance of the route in meters.
 * @property {number} estimatedTime - The estimated time to complete the route in seconds.
 * @property {string} arrivalTime - The estimated arrival time.
 * @property {number} calculationTime - The time taken to calculate the route in seconds.
 * @property {boolean} isPersonalized - A flag indicating if the route is personalized.
 * @property {string} mapUrl - The URL of the map image for the route.
 * @property {Date} createdAt - The date and time when the route was created.
 * @property {Date} updatedAt - The date and time when the route was last updated.
 */

/**
 * Shared timestamp for data consistency.
 */
const NOW = new Date();

/**
 * Factory function to create a route entry.
 * @param {Object} route - The route data.
 * @returns {Route}
 */
const createRoute = (route) => ({
  ...route,
  stops: route.stops || [],
  createdAt: NOW,
  updatedAt: NOW
});

/**
 * Mock Routes Collection
 * Defines pre-calculated routes between destinations.
 * @type {Route[]}
 */
export const mockRoutes = [
  createRoute({
    routeId: 1,
    userId: 1,
    destinationId: 2,
    startCoordinates: { lat: 40.7610, lng: -73.9780 },
    endCoordinates: { lat: 40.7614, lng: -73.9776 },
    path: [
      { lat: 40.7610, lng: -73.9780 },
      { lat: 40.7612, lng: -73.9778 },
      { lat: 40.7614, lng: -73.9776 }
    ],
    instructions: [
      'Start at Main Entrance',
      'Walk straight for 50 meters',
      'Turn right',
      'Gallery A is on your left'
    ],
    distance: 75.5,
    estimatedTime: 54,
    arrivalTime: '10:54 AM',
    calculationTime: 2,
    isPersonalized: false,
    mapUrl: '/maps/1/route_1.png'
  }),
  createRoute({
    routeId: 2,
    userId: 1,
    destinationId: 1,
    startCoordinates: { lat: 40.7610, lng: -73.9780 },
    endCoordinates: { lat: 40.7615, lng: -73.9775 },
    path: [
      { lat: 40.7610, lng: -73.9780 },
      { lat: 40.7613, lng: -73.9777 },
      { lat: 40.7615, lng: -73.9775 }
    ],
    instructions: [
      'Start at Main Entrance',
      'Walk straight for 60 meters',
      'Turn left',
      'Gallery B is on your right'
    ],
    stops: [],
    distance: 85.2,
    estimatedTime: 61,
    arrivalTime: '11:01 AM',
    calculationTime: 1,
    isPersonalized: false,
    mapUrl: '/maps/1/route_2.png'
  })
];