/**
 * @typedef {Object} MuseumMap
 * @property {number} mapId - Unique identifier for the map.
 * @property {string} name - The name of the map.
 * @property {string} title - The title of the map.
 * @property {string} mapData - The base64 encoded map data.
 * @property {string} mapUrl - The URL of the map image.
 * @property {string} imageUrl - The URL of the map image.
 * @property {string} format - The format of the map image.
 * @property {number} zoom - The zoom level of the map.
 * @property {number} rotation - The rotation of the map.
 * @property {number} floor - The floor number of the map.
 * @property {boolean} isOfflineAvailable - A flag indicating if the map is available for offline use.
 * @property {Date} createdAt - The date and time when the map was created.
 * @property {Date} updatedAt - The date and time when the map was last updated.
 */

/**
 * Shared timestamp for data consistency.
 */
const CREATED_AT = new Date('2024-01-01');

/**
 * Factory function to create a map entry.
 * @param {number} mapId - The map ID.
 * @param {string} name - The map name.
 * @param {number} floor - The floor number.
 * @param {string} filename - The filename of the map image.
 * @returns {MuseumMap}
 */
const createMap = (mapId, name, floor, filename) => ({
  mapId,
  name,
  title: name,
  mapData: 'base64_encoded_map_data_here',
  mapUrl: `/maps/${mapId}/${filename}`,
  imageUrl: `/maps/${mapId}/${filename}`,
  format: 'png',
  zoom: 1,
  rotation: 0,
  floor,
  isOfflineAvailable: true,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT
});

/**
 * Mock Maps Collection
 * Mock map data, defining the museum's floor plans.
 * @type {MuseumMap[]}
 */
export const mockMaps = [
  createMap(1, 'Museum Ground Floor', 1, 'museum_ground_floor.png'),
  createMap(2, 'Museum First Floor', 2, 'museum_first_floor.png')
];