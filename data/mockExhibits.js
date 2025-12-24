/**
 * Mock Exhibits Data
 * Sample exhibit information for testing and development.
 */

/**
 * @typedef {Object} Exhibit
 * @property {number} exhibitId
 * @property {string} name
 * @property {string} title
 * @property {string} artist
 * @property {string[]} category
 * @property {string} description
 * @property {string} historicalInfo
 * @property {string} location
 * @property {{lat: number, lng: number}} coordinates
 * @property {string} status
 * @property {boolean} visitingAvailability
 * @property {Map<number, number>} ratings
 * @property {number} averageRating
 * @property {boolean} wheelchairAccessible
 * @property {boolean} brailleSupport
 * @property {string} audioGuide
 * @property {string} audioGuideUrl
 * @property {string[]} keywords
 * @property {string[]} features
 * @property {string} crowdLevel
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const BASE_DATE = new Date('2024-01-01');

const GALLERY_COORDS = {
  a: { lat: 40.7614, lng: -73.9776 },
  b: { lat: 40.7615, lng: -73.9775 },
  c: { lat: 40.7616, lng: -73.9774 },
  d: { lat: 40.7617, lng: -73.9773 },
  e: { lat: 40.7618, lng: -73.9772 }
};

/**
 * Generates audio guide paths.
 * @param {number} id - Exhibit ID
 * @returns {string}
 */
const audioPath = (id) => `/audio/exhibits/${id}.mp3`;

/**
 * Builds feature list based on accessibility.
 * @param {Object} access - Accessibility options
 * @returns {string[]}
 */
const buildFeatures = (access) => {
  const features = [];
  if (access.wheelchair) features.push('Wheelchair Accessible');
  if (access.audio) features.push('Audio Guide Available');
  if (access.braille) features.push('Braille Support');
  return features;
};

/**
 * Creates exhibit with standard fields.
 * @param {Object} config - Exhibit configuration
 * @returns {Exhibit}
 */
const buildExhibit = (config) => {
  const access = config.access || {};
  return {
    exhibitId: config.id,
    name: config.name,
    title: config.title || config.name,
    artist: config.artist,
    category: config.category,
    description: config.description,
    historicalInfo: config.history,
    location: config.location,
    coordinates: config.coords,
    status: config.status || 'open',
    visitingAvailability: config.status !== 'closed',
    ratings: config.ratings || new Map(),
    averageRating: config.avgRating || 0,
    wheelchairAccessible: access.wheelchair !== false,
    brailleSupport: access.braille || false,
    audioGuide: audioPath(config.id),
    audioGuideUrl: audioPath(config.id),
    keywords: config.keywords,
    features: buildFeatures({ wheelchair: access.wheelchair !== false, audio: true, braille: access.braille }),
    crowdLevel: config.crowd || 'low',
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE
  };
};

// Exhibit definitions
const EXHIBITS = [
  {
    id: 1,
    name: 'The Starry Night',
    artist: 'Vincent van Gogh',
    category: ['paintings', 'post-impressionism', 'modern art'],
    description: 'Vincent van Gogh\'s masterpiece depicting a swirling night sky over a French village. Created in June 1889, this iconic painting captures the view from his asylum room window.',
    history: 'Painted while Van Gogh was in the Saint-Paul-de-Mausole asylum in Saint-Rémy-de-Provence, France. The painting is one of the most recognized pieces in modern culture.',
    location: 'Gallery A, Room 101',
    coords: GALLERY_COORDS.a,
    ratings: new Map([[1, 5], [2, 5]]),
    avgRating: 5,
    access: { braille: true },
    keywords: ['van gogh', 'starry', 'night', 'impressionism', 'oil painting'],
    crowd: 'high'
  },
  {
    id: 2,
    name: 'Greek Amphora',
    title: 'Ancient Greek Amphora',
    artist: 'Unknown',
    category: ['pottery', 'ancient greece', 'archaeology'],
    description: 'A beautifully preserved amphora from the 5th century BCE, featuring black-figure decoration depicting mythological scenes.',
    history: 'This vessel was used for storing wine and olive oil in ancient Greece. The decorative scenes show Hercules\' twelve labors.',
    location: 'Gallery B, Room 205',
    coords: GALLERY_COORDS.b,
    ratings: new Map([[2, 4]]),
    avgRating: 4,
    keywords: ['greece', 'amphora', 'pottery', 'ancient', 'hercules']
  },
  {
    id: 3,
    name: 'Renaissance Sculpture',
    title: 'David - Renaissance Masterpiece',
    artist: 'Michelangelo',
    category: ['sculpture', 'renaissance', 'marble'],
    description: 'A stunning marble sculpture from the Italian Renaissance, showcasing exceptional craftsmanship and anatomical detail.',
    history: 'Created in Florence during the height of the Renaissance period, this sculpture represents the biblical hero David.',
    location: 'Gallery C, Room 301',
    coords: GALLERY_COORDS.c,
    access: { braille: true },
    keywords: ['renaissance', 'sculpture', 'david', 'marble', 'florence'],
    crowd: 'medium'
  },
  {
    id: 4,
    name: 'Egyptian Sarcophagus',
    title: 'Pharaoh\'s Sarcophagus',
    artist: 'Unknown',
    category: ['ancient egypt', 'archaeology', 'artifacts'],
    description: 'An intricately decorated sarcophagus from ancient Egypt, dating back to the New Kingdom period.',
    history: 'This sarcophagus belonged to a high-ranking official and features hieroglyphic inscriptions and colorful depictions of the journey to the afterlife.',
    location: 'Gallery D, Room 150',
    coords: GALLERY_COORDS.d,
    keywords: ['egypt', 'sarcophagus', 'pharaoh', 'hieroglyphics', 'ancient'],
    crowd: 'medium'
  },
  {
    id: 5,
    name: 'Modern Abstract Art',
    title: 'Composition VIII',
    artist: 'Wassily Kandinsky',
    category: ['modern art', 'abstract', 'paintings'],
    description: 'A vibrant abstract composition featuring geometric shapes and bold colors, representing the pinnacle of abstract expressionism.',
    history: 'Created in the early 20th century during the abstract art movement. The artist explored the relationship between color, form, and emotion.',
    location: 'Gallery E, Room 401',
    coords: GALLERY_COORDS.e,
    status: 'closed',
    access: { braille: true },
    keywords: ['abstract', 'modern', 'geometric', 'kandinsky', 'composition']
  }
];

export const mockExhibits = EXHIBITS.map(buildExhibit);