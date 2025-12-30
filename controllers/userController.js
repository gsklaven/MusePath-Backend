import * as userService from '../services/userService.js';
import * as routeService from '../services/routeService.js';
import { sendSuccess, sendError, sendNotFound, sendNoContent } from '../utils/responses.js';
import { validateUserId, validateExhibitId } from '../utils/validators.js';
import { validateIdOrRespond, withErrorHandling } from '../utils/helpers.js';

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
export const updateUserPreferences = withErrorHandling(async (req, res) => {
  const { user_id } = req.params;
  const preferences = req.body;
  if (!validateIdOrRespond(user_id, validateUserId, res, 'user ID')) return;
  const user = await userService.updateUserPreferences(user_id, preferences);
  if (!user) return sendNotFound(res, 'User not found');
  return sendNoContent(res);
});

/**
 * Adds an exhibit to a user's list of favorites.
 * @route POST /users/:user_id/favourites
 * @param {import('express').Request} req - The Express request object, with user ID in params and exhibit ID in body.
 * @param {import('express').Response} res - The Express response object.
 */
export const addExhibitToFavourites = withErrorHandling(async (req, res) => {
  const { user_id } = req.params;
  const { exhibit_id } = req.body;
  if (!validateIdOrRespond(user_id, validateUserId, res, 'user ID')) return;
  if (!validateIdOrRespond(exhibit_id, validateExhibitId, res, 'exhibit ID')) return;
  const user = await userService.addFavorite(user_id, exhibit_id);
  if (!user) return sendNotFound(res, 'User not found');
  return sendNoContent(res);
});

/**
 * Removes an exhibit from a user's list of favorites.
 * @route DELETE /users/:user_id/favourites/:exhibit_id
 * @param {import('express').Request} req - The Express request object, with user and exhibit IDs in params.
 * @param {import('express').Response} res - The Express response object.
 */
export const removeExhibitFromFavourites = withErrorHandling(async (req, res) => {
  const { user_id, exhibit_id } = req.params;
  if (!validateIdOrRespond(user_id, validateUserId, res, 'user ID')) return;
  if (!validateIdOrRespond(exhibit_id, validateExhibitId, res, 'exhibit ID')) return;
  const user = await userService.removeFavorite(user_id, exhibit_id);
  if (!user) return sendNotFound(res, 'User or exhibit not found in favourites');
  return sendNoContent(res);
});

/**
 * Generates and retrieves a personalized route for a user based on their preferences.
 * @route GET /users/:user_id/routes
 * @param {import('express').Request} req - The Express request object, with user ID in params.
 * @param {import('express').Response} res - The Express response object.
 */

/**
 * Handles errors from personalized route generation and sends the appropriate response.
 * @param {Error} error - The error object
 * @param {import('express').Response} res - The Express response object
 */
const handlePersonalizedRouteError = (error, res) => {
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
};

/**
 * Generates and retrieves a personalized route for a user based on their preferences.
 * @route GET /users/:user_id/routes
 * @param {import('express').Request} req - The Express request object, with user ID in params.
 * @param {import('express').Response} res - The Express response object.
 */
export const getPersonalizedRoute = withErrorHandling(async (req, res) => {
  const { user_id } = req.params;
  if (!validateIdOrRespond(user_id, validateUserId, res, 'user ID')) return;
  const route = await routeService.generatePersonalizedRoute(user_id);
  return sendSuccess(res, route, 'Personalized route generated successfully');
}, handlePersonalizedRouteError);
