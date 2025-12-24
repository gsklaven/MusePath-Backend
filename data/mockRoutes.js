/**
 * Mock Routes Collection
 * Defines pre-calculated routes between destinations.
 */
export const mockRoutes = [
  {
    // Unique identifier for the route.
    routeId: 1,
    // The ID of the user who owns the route.
    userId: 1,
    // The ID of the destination of the route.
    destinationId: 2,
    // The starting coordinates of the route.
    startCoordinates: { lat: 40.7610, lng: -73.9780 },
    // The ending coordinates of the route.
    endCoordinates: { lat: 40.7614, lng: -73.9776 },
    // The path of the route.
    path: [
      { lat: 40.7610, lng: -73.9780 },
      { lat: 40.7612, lng: -73.9778 },
      { lat: 40.7614, lng: -73.9776 }
    ],
    // The instructions for the route.
    instructions: [
      'Start at Main Entrance',
      'Walk straight for 50 meters',
      'Turn right',
      'Gallery A is on your left'
    ],
    // A list of stops along the route.
    stops: [],
    // The distance of the route in meters.
    distance: 75.5,
    // The estimated time to complete the route in seconds.
    estimatedTime: 54,
    // The estimated arrival time.
    arrivalTime: '10:54 AM',
    // The time taken to calculate the route in seconds.
    calculationTime: 2,
    // A flag indicating if the route is personalized.
    isPersonalized: false,
    // The URL of the map image for the route.
    mapUrl: '/maps/1/route_1.png',
    // The date and time when the route was created.
    createdAt: new Date(),
    // The date and time when the route was last updated.
    updatedAt: new Date()
  },
  {
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
    mapUrl: '/maps/1/route_2.png',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];