/**
 * Mock Routes Data
 * Pre-calculated routes between museum destinations.
 */

/**
 * @typedef {Object} Route
 * @property {number} routeId - Unique identifier.
 * @property {number} userId - ID of the user requesting the route.
 * @property {number} destinationId - ID of the target destination.
 * @property {{lat: number, lng: number}} startCoordinates - Starting location.
 * @property {{lat: number, lng: number}} endCoordinates - Target location.
 * @property {{lat: number, lng: number}[]} path - Array of waypoints.
 * @property {string[]} instructions - Navigation instructions.
 * @property {any[]} stops - Intermediate stops.
 * @property {number} distance - Total distance in meters.
 * @property {number} estimatedTime - Estimated duration in seconds.
 * @property {string} arrivalTime - Formatted arrival time string.
 * @property {number} calculationTime - Time taken to calculate route in seconds.
 * @property {boolean} isPersonalized - Whether route considers user preferences.
 * @property {string} mapUrl - URL to the route visualization image.
 * @property {Date} createdAt - Creation timestamp.
 * @property {Date} updatedAt - Update timestamp.
 */

const ROUTE_TIMESTAMP = new Date();

/**
 * Key locations used for route generation.
 * @type {Object.<string, {lat: number, lng: number}>}
 */
const LOCATIONS = {
  entrance: { lat: 40.7610, lng: -73.9780 },
  galleryA: { lat: 40.7614, lng: -73.9776 },
  galleryB: { lat: 40.7615, lng: -73.9775 },
  waypoint1: { lat: 40.7612, lng: -73.9778 },
  waypoint2: { lat: 40.7613, lng: -73.9777 }
};

/**
 * Calculates estimated time based on distance.
 * @param {number} distance - Distance in meters
 * @param {number} speed - Walking speed in m/s (default: 1.4 m/s)
 * @returns {number} Time in seconds
 */
const estimateTime = (distance, speed = 1.4) => Math.ceil(distance / speed);

/**
 * Generates arrival time string.
 * @param {number} timeInSeconds - Time to add
 * @returns {string}
 */
const calculateArrival = (timeInSeconds) => {
  const now = new Date();
  now.setSeconds(now.getSeconds() + timeInSeconds);
  return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

/**
 * Generates map URL.
 * @param {number} mapId - Map identifier
 * @param {number} routeId - Route identifier
 * @returns {string}
 */
const mapUrl = (mapId, routeId) => `/maps/${mapId}/route_${routeId}.png`;

/**
 * Creates route with standard fields.
 * @param {Object} config - Route configuration
 * @returns {Route}
 */
const buildRoute = (config) => ({
  routeId: config.id,
  userId: config.userId,
  destinationId: config.destId,
  startCoordinates: config.start,
  endCoordinates: config.end,
  path: config.path,
  instructions: config.instructions,
  stops: config.stops || [],
  distance: config.distance,
  estimatedTime: config.time || estimateTime(config.distance),
  arrivalTime: config.arrival || calculateArrival(config.time || estimateTime(config.distance)),
  calculationTime: config.calcTime || 1,
  isPersonalized: config.personalized || false,
  mapUrl: mapUrl(1, config.id),
  createdAt: ROUTE_TIMESTAMP,
  updatedAt: ROUTE_TIMESTAMP
});

/**
 * Raw configuration data for routes.
 * @type {Array<Object>}
 */
const ROUTES = [
  {
    id: 1,
    userId: 1,
    destId: 2,
    start: LOCATIONS.entrance,
    end: LOCATIONS.galleryA,
    path: [LOCATIONS.entrance, LOCATIONS.waypoint1, LOCATIONS.galleryA],
    instructions: [
      'Start at Main Entrance',
      'Walk straight for 50 meters',
      'Turn right',
      'Gallery A is on your left'
    ],
    distance: 75.5,
    time: 54,
    arrival: '10:54 AM',
    calcTime: 2
  },
  {
    id: 2,
    userId: 1,
    destId: 1,
    start: LOCATIONS.entrance,
    end: LOCATIONS.galleryB,
    path: [LOCATIONS.entrance, LOCATIONS.waypoint2, LOCATIONS.galleryB],
    instructions: [
      'Start at Main Entrance',
      'Walk straight for 60 meters',
      'Turn left',
      'Gallery B is on your right'
    ],
    distance: 85.2,
    time: 61,
    arrival: '11:01 AM'
  }
];

/**
 * Mock Routes Collection.
 * Exported array of processed Route objects.
 * @type {Route[]}
 */
export const mockRoutes = ROUTES.map(buildRoute);