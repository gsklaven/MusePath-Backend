/**
 * Mock Exhibits Data
 */

const BASE_DATE = new Date('2024-01-01');

const GALLERY = {
  a: { lat: 40.7614, lng: -73.9776 },
  b: { lat: 40.7615, lng: -73.9775 },
  c: { lat: 40.7616, lng: -73.9774 },
  d: { lat: 40.7617, lng: -73.9773 },
  e: { lat: 40.7618, lng: -73.9772 }
};

const audioPath = (id) => `/audio/exhibits/${id}.mp3`;

const buildFeatures = (wheelchair, braille) => {
  const features = ['Audio Guide Available'];
  if (wheelchair) features.unshift('Wheelchair Accessible');
  if (braille) features.push('Braille Support');
  return features;
};

const buildExhibit = (cfg) => {
  const { wheelchair = true, braille = false } = cfg.access || {};
  
  return {
    exhibitId: cfg.id,
    name: cfg.name,
    title: cfg.title || cfg.name,
    artist: cfg.artist,
    category: cfg.category,
    description: cfg.description,
    historicalInfo: cfg.history,
    location: cfg.location,
    coordinates: cfg.coords,
    status: cfg.status || 'open',
    visitingAvailability: cfg.status !== 'closed',
    ratings: cfg.ratings || new Map(),
    averageRating: cfg.avgRating || 0,
    wheelchairAccessible: wheelchair,
    brailleSupport: braille,
    audioGuide: audioPath(cfg.id),
    audioGuideUrl: audioPath(cfg.id),
    keywords: cfg.keywords,
    features: buildFeatures(wheelchair, braille),
    crowdLevel: cfg.crowd || 'low',
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE
  };
};

const EXHIBITS = [
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

export const mockExhibits = EXHIBITS.map(buildExhibit);