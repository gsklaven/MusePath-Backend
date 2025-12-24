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
 * Shared timestamp for data consistency.
 */
const CREATED_AT = new Date('2024-01-01');

/**
 * Factory function to create an exhibit entry.
 * @param {Object} exhibit - The exhibit data.
 * @returns {Exhibit}
 */
const createExhibit = (exhibit) => ({
  ...exhibit,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT
});

/**
 * Mock Exhibits Collection
 * Represents mock exhibit data, including metadata for filtering and display.
 * @type {Exhibit[]}
 */
export const mockExhibits = [
  createExhibit({
    exhibitId: 1,
    name: 'The Starry Night',
    title: 'The Starry Night',
    artist: 'Vincent van Gogh',
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
    audioGuide: '/audio/exhibits/1.mp3',
    audioGuideUrl: '/audio/exhibits/1.mp3',
    keywords: ['van gogh', 'starry', 'night', 'impressionism', 'oil painting'],
    features: ['Wheelchair Accessible', 'Audio Guide Available', 'Braille Support'],
    crowdLevel: 'high'
  }),
  createExhibit({
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
    crowdLevel: 'low'
  }),
  createExhibit({
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
  }),
  createExhibit({
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
    crowdLevel: 'medium'
  }),
  createExhibit({
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
    crowdLevel: 'low'
  })
];