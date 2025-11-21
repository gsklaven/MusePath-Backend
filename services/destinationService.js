import Destination from '../models/Destination.js';
import { isMockDataMode } from '../config/database.js';
import { mockDestinations } from '../data/mockData.js';
import { generateUniqueId } from '../utils/helpers.js';

/**
 * Destination Service
 * Business logic for destination operations
 */

/**
 * Get all destinations
 * @param {number} mapId - Optional map ID filter
 * @returns {Promise<Array>} Array of destinations
 */
export const getAllDestinations = async (mapId) => {
  if (isMockDataMode()) {
    if (mapId) {
      return mockDestinations.filter(d => d.mapId === Number(mapId));
    }
    return mockDestinations;
  }
  
  const query = mapId ? { mapId: Number(mapId) } : {};
  return await Destination.find(query);
};

/**
 * Get destination by ID
 * @param {number} destinationId - Destination ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Destination object
 */
export const getDestinationById = async (destinationId, options = {}) => {
  if (isMockDataMode()) {
    const destination = mockDestinations.find(d => d.destinationId === Number(destinationId));
    
    if (!destination) return null;
    
    const response = {
      destination_id: destination.destinationId,
      name: destination.name,
      type: destination.type,
      coordinates: destination.coordinates
    };
    
    if (options.includeStatus) {
      response.status = destination.status;
      response.crowdLevel = destination.crowdLevel;
      response.lastUpdated = destination.lastUpdated.toISOString();
    }
    
    if (options.includeAlternatives && destination.status !== 'available') {
      response.alternatives = destination.alternatives.map(id => `Destination ${id}`);
      response.suggestedTimes = destination.suggestedTimes;
    }
    
    return response;
  }
  
  const destination = await Destination.findOne({ destinationId: Number(destinationId) });
  
  if (!destination) return null;
  
  const response = {
    destination_id: destination.destinationId,
    name: destination.name,
    type: destination.type,
    coordinates: destination.coordinates
  };
  
  if (options.includeStatus) {
    response.status = destination.status;
    response.crowdLevel = destination.crowdLevel;
    response.lastUpdated = destination.lastUpdated.toISOString();
  }
  
  if (options.includeAlternatives && destination.status !== 'available') {
    response.alternatives = destination.alternatives.map(id => `Destination ${id}`);
    response.suggestedTimes = destination.suggestedTimes;
  }
  
  return response;
};

/**
 * Upload destinations
 * @param {number} mapId - Map ID
 * @param {Array} destinations - Array of destination objects
 * @returns {Promise<Object>} Upload result
 */
export const uploadDestinations = async (mapId, destinations) => {
  if (isMockDataMode()) {
    const destinationIds = [];
    
    for (const dest of destinations) {
      const newDest = {
        destinationId: generateUniqueId(mockDestinations, 'destinationId'),
        mapId: Number(mapId),
        ...dest,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockDestinations.push(newDest);
      destinationIds.push(newDest.destinationId);
    }
    
    return {
      destinationsId: destinationIds[0],
      destinationData: `${destinationIds.length} destinations uploaded`
    };
  }
  
  const savedDestinations = [];
  
  for (const dest of destinations) {
    const destinationData = {
      ...dest,
      mapId: Number(mapId),
      destinationId: await generateNextDestinationId()
    };
    
    const destination = new Destination(destinationData);
    const saved = await destination.save();
    savedDestinations.push(saved);
  }
  
  return {
    destinationsId: savedDestinations[0].destinationId,
    destinationData: `${savedDestinations.length} destinations uploaded`
  };
};

/**
 * Generate next destination ID (for database mode)
 * @returns {Promise<number>} Next ID
 */
const generateNextDestinationId = async () => {
  const lastDestination = await Destination.findOne().sort({ destinationId: -1 });
  return lastDestination ? lastDestination.destinationId + 1 : 1;
};
