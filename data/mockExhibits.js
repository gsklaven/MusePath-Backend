/**
 * @typedef {Object} ExhibitCoordinates
 * @property {number} lat - The latitude of the exhibit.
 * @property {number} lng - The longitude of the exhibit.
 */

/**
 * @typedef {Object} Exhibit
 * @property {number} exhibitId - Unique identifier for the exhibit.
 * @property {string} name - The name of the exhibit.
 * @property {string} title - The title of the exhibit.
 * @property {string} artist - The artist of the exhibit.
 * @property {string[]} category - The category of the exhibit.
 * @property {string} description - A short description of the exhibit.
 * @property {string} historicalInfo - Historical information about the exhibit.
 * @property {string} location - The location of the exhibit within the museum.
 * @property {ExhibitCoordinates} coordinates - The geographical coordinates of the exhibit.
 * @property {string} status - The status of the exhibit, e.g., 'open' or 'closed'.
 * @property {boolean} visitingAvailability - A flag indicating if the exhibit is available for visiting.
 * @property {Map<number, number>} ratings - A map of ratings given to the exhibit by users.
 * @property {number} averageRating - The average rating of the exhibit.
 * @property {boolean} wheelchairAccessible - A flag indicating if the exhibit is wheelchair accessible.
 * @property {boolean} brailleSupport - A flag indicating if the exhibit has braille support.
 * @property {string} audioGuide - The path to the audio guide for the exhibit.
 * @property {string} audioGuideUrl - The URL of the audio guide for the exhibit.
 * @property {string[]} keywords - Keywords associated with the exhibit for searching.
 * @property {string[]} features - A list of features available for the exhibit.
 * @property {string} crowdLevel - The current crowd level at the exhibit.
 * @property {Date} createdAt - The date and time when the exhibit was created.
 * @property {Date} updatedAt - The date and time when the exhibit was last updated.
 */

/**
 * Mock Exhibits Collection
 * Represents mock exhibit data, including metadata for filtering and display.
 * @type {Exhibit[]}
 */
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