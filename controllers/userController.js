import * as userService from '../services/userService.js';
import * as routeService from '../services/routeService.js';
import { sendSuccess, sendError, sendNotFound, sendNoContent, sendValidationError } from '../utils/responses.js';

/**
 * User Controller
 * Handles HTTP requests for user operations
 */

/**
 * Update user preferences
 * PUT /users/:user_id/preferences
 */
export const updateUserPreferences = async (req, res) => {
  try {
    const { user_id } = req.params;
    const preferences = req.body;
    if (!preferences || !Array.isArray(preferences.interests)) {
      return sendValidationError(res, 'Invalid or missing interests array');
    }
    const user = await userService.updateUserPreferences(user_id, preferences);
    if (!user) {
      return sendNotFound(res, 'User not found');
    }
    return sendNoContent(res);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Add exhibit to favorites
 * POST /users/:user_id/favourites
 */
export const addExhibitToFavourites = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { exhibit_id } = req.body;
    if (exhibit_id === undefined || exhibit_id === null) {
      return sendValidationError(res, 'Missing exhibit_id');
    }
    const user = await userService.addFavorite(user_id, exhibit_id);
    if (!user) {
      return sendNotFound(res, 'User not found');
    }
    return sendNoContent(res);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Remove exhibit from favorites
 * DELETE /users/:user_id/favourites/:exhibit_id
 */
export const removeExhibitFromFavourites = async (req, res) => {
  try {
    const { user_id, exhibit_id } = req.params;
    
    const user = await userService.removeFavorite(user_id, exhibit_id);
    
    if (!user) {
      return sendNotFound(res, 'User or exhibit not found in favourites');
    }
    
    return sendNoContent(res);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get personalized route for user
 * GET /users/:user_id/routes
 */
export const getPersonalizedRoute = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const route = await routeService.generatePersonalizedRoute(user_id);
    
    return sendSuccess(res, route, 'Personalized route generated successfully');
  } catch (error) {
    if (error.message.includes('preferences')) {
      return sendError(res, error.message, 400);
    }
    if (error.message.includes('not found')) {
      return sendNotFound(res, error.message);
    }
    return sendError(res, error.message, 500);
  }
};
