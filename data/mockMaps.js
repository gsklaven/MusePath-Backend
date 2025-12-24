/**
 * Mock Maps Collection
 * Mock map data, defining the museum's floor plans.
 */
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