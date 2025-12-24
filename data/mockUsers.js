/**
 * @typedef {Object} User
 * @property {number} userId - Unique identifier for the user.
 * @property {string} username - The user's chosen username for login.
 * @property {string} name - The user's full name.
 * @property {string} email - The user's email address.
 * @property {string} password - The user's hashed password.
 * @property {string} role - The user's role, e.g., 'admin' or 'visitor'.
 * @property {string[]} preferences - A list of the user's interests.
 * @property {number[]} favourites - A list of the user's favorite exhibits.
 * @property {Map<number, number>} ratings - A map of ratings the user has given to exhibits.
 * @property {boolean} personalizationAvailable - A flag indicating if personalization is available for the user.
 * @property {Date} createdAt - The date and time when the user was created.
 * @property {Date} updatedAt - The date and time when the user was last updated.
 */

/**
 * Mock Users Collection
 * Represents mock user data for testing authentication and personalization.
 * @type {User[]}
 */
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