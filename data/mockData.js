/**
 * Mock Data for MusePath Backend
 * This data is used when MongoDB is not available
 */

export const mockUsers = [
  {
    userId: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'admin',
    preferences: ['modern art', 'ancient greece', 'sculpture'],
    favourites: [],
    ratings: new Map(),
    personalizationAvailable: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    userId: 2,
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
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
    name: 'Chen Wei',
    email: 'chen.wei@example.com',
    role: 'admin',
    preferences: ['asian art', 'ceramics', 'calligraphy'],
    favourites: [],
    ratings: new Map(),
    personalizationAvailable: false,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05')
  }
];

export const mockExhibits = [
  {
    exhibitId: 1,
    name: 'The Starry Night',
    title: 'The Starry Night',
    category: ['paintings', 'post-impressionism', 'modern art'],
    description: 'Vincent van Gogh\'s masterpiece depicting a swirling night sky over a French village. Created in June 1889, this iconic painting captures the view from his asylum room window.',
    historicalInfo: 'Painted while Van Gogh was in the Saint-Paul-de-Mausole asylum in Saint-Rémy-de-Provence, France. The painting is one of the most recognized pieces in modern culture.',
    location: 'Gallery A, Room 101',
    coordinates: { lat: 40.7614, lng: -73.9776 },
    status: 'open',
    visitingAvailability: true,
    ratings: new Map([[1, 5], [2, 5]]),
    averageRating: 5,
    wheelchairAccessible: true,
    brailleSupport: true,
    audioGuideUrl: '/audio/exhibits/1.mp3',
    keywords: ['van gogh', 'starry', 'night', 'impressionism', 'oil painting'],
    features: ['Wheelchair Accessible', 'Audio Guide Available', 'Braille Support'],
    crowdLevel: 'high',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    exhibitId: 2,
    name: 'Greek Amphora',
    title: 'Ancient Greek Amphora',
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
    audioGuideUrl: '/audio/exhibits/3.mp3',
    keywords: ['renaissance', 'sculpture', 'david', 'marble', 'florence'],
    features: ['Wheelchair Accessible', 'Audio Guide Available', 'Braille Support'],
    crowdLevel: 'medium',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    exhibitId: 4,
    name: 'Egyptian Sarcophagus',
    title: 'Pharaoh\'s Sarcophagus',
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
    audioGuideUrl: '/audio/exhibits/5.mp3',
    keywords: ['abstract', 'modern', 'geometric', 'kandinsky', 'composition'],
    features: ['Wheelchair Accessible', 'Audio Guide Available', 'Braille Support'],
    crowdLevel: 'low',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const mockMaps = [
  {
    mapId: 1,
    title: 'Museum Ground Floor',
    mapData: 'base64_encoded_map_data_here',
    mapUrl: '/maps/1/museum_ground_floor.png',
    format: 'png',
    zoom: 1,
    rotation: 0,
    floor: 1,
    isOfflineAvailable: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    mapId: 2,
    title: 'Museum First Floor',
    mapData: 'base64_encoded_map_data_here',
    mapUrl: '/maps/2/museum_first_floor.png',
    format: 'png',
    zoom: 1,
    rotation: 0,
    floor: 2,
    isOfflineAvailable: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const mockDestinations = [
  {
    destinationId: 1,
    name: 'Main Entrance',
    type: 'entrance',
    coordinates: { lat: 40.7610, lng: -73.9780 },
    mapId: 1,
    status: 'available',
    crowdLevel: 'medium',
    lastUpdated: new Date(),
    alternatives: [],
    suggestedTimes: ['10:00 AM', '2:00 PM', '4:00 PM'],
    createdAt: new Date('2024-01-01'),
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
  }
];

export const mockCoordinates = [
  {
    userId: 1,
    lat: 40.7610,
    lng: -73.9780,
    timestamp: new Date(),
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

export const mockRoutes = [
  {
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
    stops: [],
    distance: 75.5,
    estimatedTime: 54,
    arrivalTime: '10:54 AM',
    calculationTime: 2,
    isPersonalized: false,
    mapUrl: '/maps/1/route_1.png',
    createdAt: new Date(),
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

export const mockNotifications = [
  {
    notificationId: 1,
    userId: 1,
    routeId: 1,
    type: 'route_deviation',
    message: 'You have deviated from the suggested route. Recalculating...',
    isRead: false,
    createdAt: new Date()
  }
];
