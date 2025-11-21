import * as mapService from '../services/mapService.js';
import { sendSuccess, sendError, sendNotFound } from '../utils/responses.js';

/**
 * Map Controller
 * Handles HTTP requests for map operations
 */

/**
 * Get map by ID
 * GET /maps/:map_id
 */
export const getMapById = async (req, res) => {
  try {
    const { map_id } = req.params;
    const { zoom, rotation, mode } = req.query;
    
    const options = { zoom, rotation, mode };
    
    const map = await mapService.getMapById(map_id, options);
    
    if (!map) {
      return sendNotFound(res, 'Map not found');
    }
    
    return sendSuccess(res, map, 'Map details retrieved successfully');
  } catch (error) {
    if (error.message.includes('offline')) {
      return sendError(res, 'Service unavailable (offline mode, no cached data)', 503);
    }
    return sendError(res, error.message, 500);
  }
};

/**
 * Upload map
 * POST /maps
 */
export const uploadMap = async (req, res) => {
  try {
    const { mapData, format } = req.body;
    
    const result = await mapService.uploadMap({ mapData, format });
    
    return sendSuccess(res, result, 'Map uploaded successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Download map
 * GET /downloads/maps/:map_id
 */
export const downloadMap = async (req, res) => {
  try {
    const { map_id } = req.params;
    
    const map = await mapService.getMapById(map_id);
    
    if (!map) {
      return sendNotFound(res, 'Map not found');
    }
    
    // In a real application, return actual image file
    return sendSuccess(res, {
      downloadUrl: `/downloads/maps/${map_id}.png`,
      map_id: Number(map_id)
    }, 'Map download link generated');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
