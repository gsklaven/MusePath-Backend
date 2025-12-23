import Map from '../models/Map.js';
import { isMockDataMode } from '../config/database.js';
import { mockMaps } from '../data/mockData.js';
import { generateUniqueId } from '../utils/helpers.js';
import { toNumber, now } from '../utils/helpers.js';

/**
 * Map Service
 * Business logic for map operations
 */

/**
 * Get full map details by ID (for downloads)
 * @param {number} mapId - Map ID
 * @returns {Promise<Object>} Full map object
 */
export const getFullMapById = async (mapId) => {
  if (isMockDataMode()) {
    return mockMaps.find(m => m.mapId === toNumber(mapId)) || null;
  }
  
  const map = await Map.findOne({ mapId: toNumber(mapId) });
  if (!map) return null;
  // Normalize MongoDB Map document to match mock data shape used by downloads
  const obj = map.toObject();
  return {
    mapId: obj.mapId,
    name: obj.title,
    title: obj.title,
    mapData: obj.mapData,
    mapUrl: obj.mapUrl,
    imageUrl: obj.mapUrl,
    format: obj.format,
    zoom: obj.zoom,
    rotation: obj.rotation,
    floor: obj.floor,
    isOfflineAvailable: obj.isOfflineAvailable,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
};

/**
 * Get map by ID
 * @param {number} mapId - Map ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Map object
 */
export const getMapById = async (mapId, options = {}) => {
  if (isMockDataMode()) {
    const map = mockMaps.find(m => m.mapId === toNumber(mapId));
    
    if (!map) return null;
    
    const response = {
      map_id: map.mapId,
      title: map.title,
      map_url: map.mapUrl
    };
    
      if (options.zoom !== undefined) {
        response.zoom = toNumber(options.zoom);
    }
    
      if (options.rotation !== undefined) {
        response.rotation = toNumber(options.rotation);
    }
    
    if (options.mode === 'offline') {
      response.offline_available = map.isOfflineAvailable;
    }
    
    return response;
  }
  
  const map = await Map.findOne({ mapId: toNumber(mapId) });
  
  if (!map) return null;
  
  const response = {
    map_id: map.mapId,
    title: map.title,
    map_url: map.mapUrl
  };
  
  if (options.zoom !== undefined) {
    response.zoom = toNumber(options.zoom);
  }
  
  if (options.rotation !== undefined) {
    response.rotation = toNumber(options.rotation);
  }
  
  if (options.mode === 'offline') {
    response.offline_available = map.isOfflineAvailable;
  }
  
  return response;
};

/**
 * Upload map
 * @param {Object} mapData - Map data
 * @returns {Promise<Object>} Created map
 */
export const uploadMap = async (mapData) => {
  if (isMockDataMode()) {
    const newMap = {
      mapId: generateUniqueId(mockMaps, 'mapId'),
      title: `Museum Map ${mockMaps.length + 1}`,
      mapData: mapData.mapData,
      mapUrl: `/maps/${mockMaps.length + 1}/uploaded_map.${mapData.format}`,
      format: mapData.format,
      zoom: 1,
      rotation: 0,
      isOfflineAvailable: true,
      createdAt: now(),
      updatedAt: now()
    };
    
    mockMaps.push(newMap);
    return { map_id: newMap.mapId };
  }
  
  const mapId = await generateNextMapId();
  
  const map = new Map({
    mapId,
    title: `Museum Map ${mapId}`,
    mapData: mapData.mapData,
    mapUrl: `/maps/${mapId}/uploaded_map.${mapData.format}`,
    format: mapData.format,
    isOfflineAvailable: true
  });
  
    const saved = await map.save();
  return { map_id: saved.mapId };
};

/**
 * Get all maps
 * NOTE: Lines 125-130 - Unused function, no endpoint calls this.
 * Could be used for GET /maps endpoint if needed in future.
 * @returns {Promise<Array>} Array of maps
 */
export const getAllMaps = async () => {
  if (isMockDataMode()) {
    return mockMaps;
  }
  
  return await Map.find();
};

/**
 * Delete map
 * @param {number} mapId - Map ID
 * @returns {Promise<boolean>} True if deleted
 */
export const deleteMap = async (mapId) => {
  if (isMockDataMode()) {
    const index = mockMaps.findIndex(m => m.mapId === toNumber(mapId));
    if (index === -1) return false;
    
    mockMaps.splice(index, 1);
    return true;
  }
  
  const result = await Map.deleteOne({ mapId: toNumber(mapId) });
  return result.deletedCount > 0;
};

/**
 * Generate next map ID (for database mode)
 * @returns {Promise<number>} Next ID
 */
const generateNextMapId = async () => {
  const lastMap = await Map.findOne().sort({ mapId: -1 });
  return lastMap ? lastMap.mapId + 1 : 1;
};
