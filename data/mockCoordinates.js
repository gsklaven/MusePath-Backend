/**
 * Mock Coordinates Collection
 * Records the geographical coordinates of users within the museum.
 */
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