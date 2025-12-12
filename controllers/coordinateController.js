import * as coordinateService from '../services/coordinateService.js';
import { sendSuccess, sendError, sendNotFound } from '../utils/responses.js';

/**
 * Coordinate Controller
 * Handles HTTP requests for coordinate operations
 */

/**
 * Get current user coordinates
 * GET /coordinates/:user_id
 */
export const getCurrentCoordinates = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const coordinates = await coordinateService.getUserCoordinates(user_id);
    
    if (!coordinates) {
      return sendNotFound(res, 'User coordinates not found');
    }
    
    return sendSuccess(res, coordinates, 'Current location retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Update current user coordinates
 * PUT /coordinates/:user_id
 */
export const updateCurrentCoordinates = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { lat, lng } = req.body;
    
    const coordinates = await coordinateService.updateUserCoordinates(user_id, lat, lng);
    
    return sendSuccess(res, coordinates, 'Coordinates updated successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
