import * as destinationService from '../services/destinationService.js';
import { sendSuccess, sendError, sendNotFound } from '../utils/responses.js';

/**
 * Destination Controller
 * Handles HTTP requests for destination operations
 */

/**
 * List all destinations
 * GET /destinations
 */
export const listDestinations = async (req, res) => {
  try {
    const { map_id } = req.query;
    
    const destinations = await destinationService.getAllDestinations(map_id);
    
    return sendSuccess(res, destinations, 'Destinations retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Upload destinations data
 * POST /destinations
 */
export const uploadDestinations = async (req, res) => {
  try {
    const { map_id, destinations } = req.body;
    
    const result = await destinationService.uploadDestinations(map_id, destinations);
    
    return sendSuccess(res, result, 'Destinations uploaded successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get destination info
 * GET /destinations/:destination_id
 */
export const getDestinationInfo = async (req, res) => {
  try {
    const { destination_id } = req.params;
    const { includeStatus, includeAlternatives } = req.query;
    
    const options = {
      includeStatus: includeStatus === 'true',
      includeAlternatives: includeAlternatives === 'true'
    };
    
    const destination = await destinationService.getDestinationById(destination_id, options);
    
    if (!destination) {
      return sendNotFound(res, 'Destination not found');
    }
    
    return sendSuccess(res, destination, 'Destination data retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Delete destination
 * DELETE /destinations/:destination_id
 */
export const deleteDestination = async (req, res) => {
  try {
    const { destination_id } = req.params;
    
    const result = await destinationService.deleteDestination(destination_id);
    
    if (!result) {
      return sendNotFound(res, 'Destination not found');
    }
    
    return res.status(204).send();
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
