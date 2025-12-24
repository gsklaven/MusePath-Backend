/**
 * Mock Exhibits Data
 * Represents mock exhibit data, including metadata for filtering and display.
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
 * @property {{lat: number, lng: number}} coordinates - The geographical coordinates of the exhibit.
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

const BASE_DATE = new Date('2024-01-01');

/**
 * Coordinates for specific galleries.
 * @type {Object.<string, {lat: number, lng: number}>}
 */
const GALLERY = {
  a: { lat: 40.7614, lng: -73.9776 },
  b: { lat: 40.7615, lng: -73.9775 },
  c: { lat: 40.7616, lng: -73.9774 },
  d: { lat: 40.7617, lng: -73.9773 },
  e: { lat: 40.7618, lng: -73.9772 }
};

/**
 * Generates the audio path for an exhibit.
 * @param {number} id - The exhibit ID.
 * @returns {string} The path to the audio file.
 */
const audioPath = (id) => `/audio/exhibits/${id}.mp3`;

/**
 * Generates a list of features based on accessibility options.
 * @param {Object} access - Accessibility configuration.
 * @returns {string[]} List of feature strings.
 */
const getFeatures = (access) => {
  const list = [];
  if (access.wheelchair) list.push('Wheelchair Accessible');
  if (access.audio) list.push('Audio Guide Available');
  if (access.braille) list.push('Braille Support');
  return list;
};

/**
 * Factory function to create an exhibit entry.
 * @param {Object} config - The exhibit configuration.
 * @returns {Exhibit} The constructed exhibit object.
 */
const createExhibit = (config) => {
  const access = config.access || {};
  const isOpen = config.status !== 'closed';
  
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
    visitingAvailability: isOpen,
    ratings: config.ratings || new Map(),
    averageRating: config.avgRating || 0,
    wheelchairAccessible: access.wheelchair !== false,
    brailleSupport: access.braille || false,
    audioGuide: audioPath(config.id),
    audioGuideUrl: audioPath(config.id),
    keywords: config.keywords,
    features: getFeatures({
      wheelchair: access.wheelchair !== false,
      audio: true,
      braille: access.braille
    }),
    crowdLevel: config.crowd || 'low',
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE
  };
};

/**
 * Raw configuration data for exhibits.
 * @type {Array<Object>}
 */
const EXHIBITS_DATA = [
  {
    id: 1,
    name: 'The Starry Night',
    artist: 'Vincent van Gogh',
    category: ['paintings', 'post-impressionism', 'modern art'],
    description: 'Vincent van Gogh\'s masterpiece depicting a swirling night sky over a French village. Created in June 1889, this iconic painting captures the view from his asylum room window.',
    history: 'Painted while Van Gogh was in the Saint-Paul-de-Mausole asylum in Saint-Rémy-de-Provence, France. The painting is one of the most recognized pieces in modern culture.',
    location: 'Gallery A, Room 101',
    coords: GALLERY.a,
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
    coords: GALLERY.b,
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
    coords: GALLERY.c,
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
    coords: GALLERY.d,
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
    coords: GALLERY.e,
    status: 'closed',
    access: { braille: true },
    keywords: ['abstract', 'modern', 'geometric', 'kandinsky', 'composition']
  }
];

/**
 * Mock Exhibits Collection.
 * Exported array of processed Exhibit objects.
 * @type {Exhibit[]}
 */
export const mockExhibits = EXHIBITS_DATA.map(createExhibit);