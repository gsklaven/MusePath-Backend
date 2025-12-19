/**
 * Mock Data for MusePath Backend
 *
 * Purpose:
 * - Provide deterministic in-memory data for tests and local development
 * - Mirror key fields and shapes used by the MongoDB models so services
 *   and controllers can operate transparently in "mock mode"
 *
 * Notes:
 * - Keep this file minimal and representative; tests rely on stable IDs.
 * - When adding new fields, update services that read mock objects.
 */

// Represents mock user data for testing authentication and personalization.
export const mockUsers = [
  {
    // Unique identifier for the user.
    userId: 1,
    // The user's chosen username for login.
    username: 'john_smith',
    // The user's full name.
    name: 'John Smith',
    // The user's email address.
    email: 'john.smith@example.com',
    // The user's hashed password.
    password: '$2b$10$z0RDSx0UIh.16pZBQrS4qOtkhHja.fjGV9K6Q6OfI4TM0iq3NzVWe', // Password123!
    // The user's role, e.g., 'admin' or 'visitor'.
    role: 'admin',
    // A list of the user's interests.
    preferences: ['modern art', 'ancient greece', 'sculpture'],
    // A list of the user's favorite exhibits.
    favourites: [],
    // A map of ratings the user has given to exhibits.
    ratings: new Map(),
    // A flag indicating if personalization is available for the user.
    personalizationAvailable: true,
    // The date and time when the user was created.
    createdAt: new Date('2024-01-15'),
    // The date and time when the user was last updated.
    updatedAt: new Date('2024-01-15')
  },
  {
    userId: 2,
    username: 'maria_garcia',
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    password: '$2b$10$z0RDSx0UIh.16pZBQrS4qOtkhHja.fjGV9K6Q6OfI4TM0iq3NzVWe', // Password123!
    role: 'admin',
    preferences: ['impressionism', 'renaissance', 'paintings'],
    favourites: [],
    ratings: new Map([[1, 5], [2, 4]]),
    personalizationAvailable: true,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10')
  },
  {
    userId: 3,
    username: 'chen_wei',
    name: 'Chen Wei',
    email: 'chen.wei@example.com',
    password: '$2b$10$z0RDSx0UIh.16pZBQrS4qOtkhHja.fjGV9K6Q6OfI4TM0iq3NzVWe', // Password123!
    role: 'admin',
    preferences: ['asian art', 'ceramics', 'calligraphy'],
    favourites: [],
    ratings: new Map(),
    personalizationAvailable: true, // Changed to true to test "no matching exhibits" case
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05')
  }
];

// Represents mock exhibit data, including metadata for filtering and display.
export const mockExhibits = [
  {
    // Unique identifier for the exhibit.
    exhibitId: 1,
    // The name of the exhibit.
    name: 'The Starry Night',
    // The title of the exhibit.
    title: 'The Starry Night',
    // The artist of the exhibit.
    artist: 'Vincent van Gogh',
    // The category of the exhibit.
    category: ['paintings', 'post-impressionism', 'modern art'],
    // A short description of the exhibit.
    description: 'Vincent van Gogh\'s masterpiece depicting a swirling night sky over a French village. Created in June 1889, this iconic painting captures the view from his asylum room window.',
    // Historical information about the exhibit.
    historicalInfo: 'Painted while Van Gogh was in the Saint-Paul-de-Mausole asylum in Saint-Rémy-de-Provence, France. The painting is one of the most recognized pieces in modern culture.',
    // The location of the exhibit within the museum.
    location: 'Gallery A, Room 101',
    // The geographical coordinates of the exhibit.
    coordinates: { lat: 40.7614, lng: -73.9776 },
    // The status of the exhibit, e.g., 'open' or 'closed'.
    status: 'open',
    // A flag indicating if the exhibit is available for visiting.
    visitingAvailability: true,
    // A map of ratings given to the exhibit by users.
    ratings: new Map([[1, 5], [2, 5]]),
    // The average rating of the exhibit.
    averageRating: 5,
    // A flag indicating if the exhibit is wheelchair accessible.
    wheelchairAccessible: true,
    // A flag indicating if the exhibit has braille support.
    brailleSupport: true,
    // The path to the audio guide for the exhibit.
    audioGuide: '/audio/exhibits/1.mp3',
    // The URL of the audio guide for the exhibit.
    audioGuideUrl: '/audio/exhibits/1.mp3',
    // Keywords associated with the exhibit for searching.
    keywords: ['van gogh', 'starry', 'night', 'impressionism', 'oil painting'],
    // A list of features available for the exhibit.
    features: ['Wheelchair Accessible', 'Audio Guide Available', 'Braille Support'],
    // The current crowd level at the exhibit.
    crowdLevel: 'high',
    // The date and time when the exhibit was created.
    createdAt: new Date('2024-01-01'),
    // The date and time when the exhibit was last updated.
    updatedAt: new Date('2024-01-01')
  },
  {
    exhibitId: 2,
    name: 'Greek Amphora',
    title: 'Ancient Greek Amphora',
    artist: 'Unknown',
    category: ['pottery', 'ancient greece', 'archaeology'],
    description: 'A beautifully preserved amphora from the 5th century BCE, featuring black-figure decoration depicting mythological scenes.',
    historicalInfo: 'This vessel was used for storing wine and olive oil in ancient Greece. The decorative scenes show Hercules\' twelve labors.',
    location: 'Gallery B, Room 205',
    coordinates: { lat: 40.7615, lng: -73.9775 },
    status: 'open',
    visitingAvailability: true,
    ratings: new Map([[2, 4]]),
    averageRating: 4,
    wheelchairAccessible: true,
    brailleSupport: false,
    audioGuide: '/audio/exhibits/2.mp3',
    audioGuideUrl: '/audio/exhibits/2.mp3',
    keywords: ['greece', 'amphora', 'pottery', 'ancient', 'hercules'],
    features: ['Wheelchair Accessible', 'Audio Guide Available'],
    crowdLevel: 'low',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    exhibitId: 3,
    name: 'Renaissance Sculpture',
    title: 'David - Renaissance Masterpiece',
    artist: 'Michelangelo',
    category: ['sculpture', 'renaissance', 'marble'],
    description: 'A stunning marble sculpture from the Italian Renaissance, showcasing exceptional craftsmanship and anatomical detail.',
    historicalInfo: 'Created in Florence during the height of the Renaissance period, this sculpture represents the biblical hero David.',
    location: 'Gallery C, Room 301',
    coordinates: { lat: 40.7616, lng: -73.9774 },
    status: 'open',
    visitingAvailability: true,
    ratings: new Map(),
    averageRating: 0,
    wheelchairAccessible: true,
    brailleSupport: true,
    audioGuide: '/audio/exhibits/3.mp3',
    audioGuideUrl: '/audio/exhibits/3.mp3',
    keywords: ['renaissance', 'sculpture', 'david', 'marble', 'florence'],
    features: ['Wheelchair Accessible', 'Audio Guide Available', 'Braille Support'],
    crowdLevel: 'medium',
    // NOTE: Fields included here are representative of what services expect:
    // - `keywords` and `category` are used for search and filtering
    // - `ratings` is a Map keyed by userId for quick updates in mock mode
    // - `audioGuideUrl` and `features` are used by frontend to enable UI elements
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    exhibitId: 4,
    name: 'Egyptian Sarcophagus',
    title: 'Pharaoh\'s Sarcophagus',
    artist: 'Unknown',
    category: ['ancient egypt', 'archaeology', 'artifacts'],
    description: 'An intricately decorated sarcophagus from ancient Egypt, dating back to the New Kingdom period.',
    historicalInfo: 'This sarcophagus belonged to a high-ranking official and features hieroglyphic inscriptions and colorful depictions of the journey to the afterlife.',
    location: 'Gallery D, Room 150',
    coordinates: { lat: 40.7617, lng: -73.9773 },
    status: 'open',
    visitingAvailability: true,
    ratings: new Map(),
    averageRating: 0,
    wheelchairAccessible: true,
    brailleSupport: false,
    audioGuide: '/audio/exhibits/4.mp3',
    audioGuideUrl: '/audio/exhibits/4.mp3',
    keywords: ['egypt', 'sarcophagus', 'pharaoh', 'hieroglyphics', 'ancient'],
    features: ['Wheelchair Accessible', 'Audio Guide Available'],
    crowdLevel: 'medium',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    exhibitId: 5,
    name: 'Modern Abstract Art',
    title: 'Composition VIII',
    artist: 'Wassily Kandinsky',
    category: ['modern art', 'abstract', 'paintings'],
    description: 'A vibrant abstract composition featuring geometric shapes and bold colors, representing the pinnacle of abstract expressionism.',
    historicalInfo: 'Created in the early 20th century during the abstract art movement. The artist explored the relationship between color, form, and emotion.',
    location: 'Gallery E, Room 401',
    coordinates: { lat: 40.7618, lng: -73.9772 },
    status: 'closed',
    visitingAvailability: false,
    ratings: new Map(),
    averageRating: 0,
    wheelchairAccessible: true,
    brailleSupport: true,
    audioGuide: '/audio/exhibits/5.mp3',
    audioGuideUrl: '/audio/exhibits/5.mp3',
    keywords: ['abstract', 'modern', 'geometric', 'kandinsky', 'composition'],
    features: ['Wheelchair Accessible', 'Audio Guide Available', 'Braille Support'],
    crowdLevel: 'low',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Mock map data, defining the museum's floor plans.
export const mockMaps = [
  {
    // Unique identifier for the map.
    mapId: 1,
    // The name of the map.
    name: 'Museum Ground Floor',
    // The title of the map.
    title: 'Museum Ground Floor',
    // The base64 encoded map data.
    mapData: 'base64_encoded_map_data_here',
    // The URL of the map image.
    mapUrl: '/maps/1/museum_ground_floor.png',
    // The URL of the map image.
    imageUrl: '/maps/1/museum_ground_floor.png',
    // The format of the map image.
    format: 'png',
    // The zoom level of the map.
    zoom: 1,
    // The rotation of the map.
    rotation: 0,
    // The floor number of the map.
    floor: 1,
    // A flag indicating if the map is available for offline use.
    isOfflineAvailable: true,
    // The date and time when the map was created.
    createdAt: new Date('2024-01-01'),
    // The date and time when the map was last updated.
    updatedAt: new Date('2024-01-01')
  },
  {
    mapId: 2,
    name: 'Museum First Floor',
    title: 'Museum First Floor',
    mapData: 'base64_encoded_map_data_here',
    mapUrl: '/maps/2/museum_first_floor.png',
    imageUrl: '/maps/2/museum_first_floor.png',
    format: 'png',
    zoom: 1,
    rotation: 0,
    floor: 2,
    isOfflineAvailable: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Mock destination points of interest within the museum.
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

// Records the geographical coordinates of users within the museum.
export const mockCoordinates = [
  {
    // The ID of the user.
    userId: 1,
    // The latitude of the user's location.
    lat: 40.7610,
    // The longitude of the user's location.
    lng: -73.9780,
    // The timestamp of the location.
    timestamp: new Date(),
    // The date and time when the location was last updated.
    updatedAt: new Date()
  },
  {
    userId: 2,
    lat: 40.7614,
    lng: -73.9776,
    timestamp: new Date(),
    updatedAt: new Date()
  },
  {
    userId: 3,
    lat: 40.7612,
    lng: -73.9778,
    timestamp: new Date(),
    updatedAt: new Date()
  }
];

// Defines pre-calculated routes between destinations.
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

// Contains mock notifications for events like route deviations.
export const mockNotifications = [
  {
    // Unique identifier for the notification.
    notificationId: 1,
    // The ID of the user who received the notification.
    userId: 1,
    // The ID of the route associated with the notification.
    routeId: 1,
    // The type of the notification.
    type: 'route_deviation',
    // The message of the notification.
    message: 'You have deviated from the suggested route. Recalculating...',
    // A flag indicating if the notification has been read.
    isRead: false,
    // The date and time when the notification was created.
    createdAt: new Date()
  }
];
