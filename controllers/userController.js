import * as userService from '../services/userService.js';
import * as routeService from '../services/routeService.js';
import { sendSuccess, sendError, sendNotFound, sendNoContent } from '../utils/responses.js';
import { validateUserId, validateExhibitId } from '../utils/validators.js';

/**
 * User Controller
 * This controller manages HTTP requests for user-specific operations, such as managing preferences and favorites.
 */

/**
 * Updates a user's preferences.
 * @route PUT /users/:user_id/preferences
 * @param {import('express').Request} req - The Express request object, with user ID in params and preferences in body.
 * @param {import('express').Response} res - The Express response object.
 */
export const updateUserPreferences = async (req, res) => {
  try {
    const { user_id } = req.params;
    const preferences = req.body;

    // Validate the user ID format.
    if (!validateUserId(user_id)) {
      return sendError(res, 'Invalid user ID format', 400);
    }
    
    // Delegate the update logic to the user service.
    const user = await userService.updateUserPreferences(user_id, preferences);
    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // A 204 No Content response is appropriate for a successful update with no body.
    return sendNoContent(res);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Adds an exhibit to a user's list of favorites.
 * @route POST /users/:user_id/favourites
 * @param {import('express').Request} req - The Express request object, with user ID in params and exhibit ID in body.
 * @param {import('express').Response} res - The Express response object.
 */
export const addExhibitToFavourites = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { exhibit_id } = req.body;

    // Validate both the user and exhibit ID formats.
    if (!validateUserId(user_id)) {
      return sendError(res, 'Invalid user ID format', 400);
    }
    if (!validateExhibitId(exhibit_id)) {
      return sendError(res, 'Invalid exhibit ID format', 400);
    }

    // Delegate the core logic to the user service.
    const user = await userService.addFavorite(user_id, exhibit_id);
    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Return 204 No Content for a successful addition.
    return sendNoContent(res);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Removes an exhibit from a user's list of favorites.
 * @route DELETE /users/:user_id/favourites/:exhibit_id
 * @param {import('express').Request} req - The Express request object, with user and exhibit IDs in params.
 * @param {import('express').Response} res - The Express response object.
 */
export const removeExhibitFromFavourites = async (req, res) => {
  try {
    const { user_id, exhibit_id } = req.params;

    // Validate both ID formats from the URL parameters.
    if (!validateUserId(user_id)) {
      return sendError(res, 'Invalid user ID format', 400);
    }
    if (!validateExhibitId(exhibit_id)) {
      return sendError(res, 'Invalid exhibit ID format', 400);
    }

    // Delegate the removal logic to the user service.
    const user = await userService.removeFavorite(user_id, exhibit_id);
    if (!user) {
      return sendNotFound(res, 'User or exhibit not found in favourites');
    }

    // Return 204 No Content for a successful removal.
    return sendNoContent(res);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Generates and retrieves a personalized route for a user based on their preferences.
 * @route GET /users/:user_id/routes
 * @param {import('express').Request} req - The Express request object, with user ID in params.
 * @param {import('express').Response} res - The Express response object.
 */
export const getPersonalizedRoute = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!validateUserId(user_id)) {
      return sendError(res, 'Invalid user ID format', 400);
    }

    // The route service handles the logic for generating the personalized route.
    const route = await routeService.generatePersonalizedRoute(user_id);
    return sendSuccess(res, route, 'Personalized route generated successfully');
  } catch (error) {
    // Handle specific error cases from the service layer with appropriate responses.
    if (error.message.includes('preferences')) {
      // e.g., "Cannot generate personalized route - missing user preferences"
      return sendError(res, error.message, 400);
    }
    if (error.message.includes('not found')) {
      // e.g., "No matching exhibits found for user preferences"
      return sendNotFound(res, error.message);
    }
    // Generic error for anything else.
    return sendError(res, error.message, 500);
  }
};
