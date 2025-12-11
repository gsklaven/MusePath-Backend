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
    // NOTE: Lines 28-30 are defensive code - currently unreachable as mapService.getMapById
    // does not throw errors with 'offline' in the message. It returns offline_available flag instead.
    // Kept for potential future implementation of stricter offline validation.
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
    
    // Validate ID format
    if (isNaN(map_id) || !Number.isInteger(Number(map_id))) {
      return sendError(res, 'Invalid map ID format', 400);
    }
    
    const map = await mapService.getFullMapById(map_id);
    
    if (!map) {
      return sendNotFound(res, 'Map not found');
    }
    
    // Return full map details for offline download
    return sendSuccess(res, {
      ...map,
      mapId: map.mapId,
      downloadUrl: `/downloads/maps/${map_id}.png`
    }, 'Map information retrieved for download');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Delete map
 * DELETE /maps/:map_id
 */
export const deleteMap = async (req, res) => {
  try {
    const { map_id } = req.params;
    
    // Validate map_id is a number
    if (isNaN(map_id)) {
      return sendError(res, 'Invalid map ID format', 400);
    }
    
    const deleted = await mapService.deleteMap(Number(map_id));
    
    if (!deleted) {
      return sendNotFound(res, 'Map not found');
    }
    
    return res.status(204).send();
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
