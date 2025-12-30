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
 * Shared constants.
 */
const PASSWORD_HASH = '$2b$10$z0RDSx0UIh.16pZBQrS4qOtkhHja.fjGV9K6Q6OfI4TM0iq3NzVWe'; // Password123!

/**
 * Factory function to create a user entry.
 * @param {Object} params - The user parameters.
 * @returns {User}
 */
const createUser = ({
  userId, username, name, email, role = 'visitor',
  preferences = [], favourites = [], ratings = new Map(),
  personalizationAvailable = true, createdDate
}) => {
  const date = new Date(createdDate);
  return {
    userId,
    username,
    name,
    email,
    password: PASSWORD_HASH,
    role,
    preferences,
    favourites,
    ratings,
    personalizationAvailable,
    createdAt: date,
    updatedAt: date
  };
};

/**
 * Mock Users Collection
 * Represents mock user data for testing authentication and personalization.
 * @type {User[]}
 */
export const mockUsers = [
  createUser({
    userId: 1,
    username: 'john_smith',
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'admin',
    preferences: ['modern art', 'ancient greece', 'sculpture'],
    createdDate: '2024-01-15'
  }),
  createUser({
    userId: 2,
    username: 'maria_garcia',
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    role: 'admin',
    preferences: ['impressionism', 'renaissance', 'paintings'],
    ratings: new Map([[1, 5], [2, 4]]),
    createdDate: '2024-02-10'
  }),
  createUser({
    userId: 3,
    username: 'chen_wei',
    name: 'Chen Wei',
    email: 'chen.wei@example.com',
    role: 'admin',
    preferences: ['asian art', 'ceramics', 'calligraphy'],
    createdDate: '2024-03-05'
  })
];