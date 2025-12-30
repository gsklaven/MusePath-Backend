import * as routeService from '../services/routeService.js';
import { sendSuccess, sendError, sendNotFound, sendNoContent } from '../utils/responses.js';
import { validateRouteId, validateUserId } from '../utils/validators.js';
import { validateIdOrRespond, withErrorHandling } from '../utils/helpers.js';

/**
 * A higher-order function that acts as a middleware to verify route ownership before executing a controller handler.
 * This pattern centralizes authorization logic, reduces code duplication, and simplifies the route handlers themselves.
 *
 * @param {Function} handler - The async controller function to execute if ownership is verified. It receives `(req, res, route_id)`.
 * @returns {Function} An Express request handler `(req, res)` that wraps the original handler with the ownership check.
 */
const withRouteOwnership = (handler) => withErrorHandling(async (req, res) => {
  const { route_id } = req.params;
  if (!validateIdOrRespond(route_id, validateRouteId, res, 'route ID')) return;
  const routeOwner = await routeService.getRouteOwner(route_id);
  if (!routeOwner) return sendNotFound(res, 'Route not found');
  if (routeOwner !== Number(req.user.id)) return sendError(res, 'Forbidden: cannot access other user routes', 403);
  await handler(req, res, route_id);
});

/**
 * Route Controller
 * This controller handles all HTTP requests related to route management,
 * such as creation, retrieval, and deletion.
 */

/**
 * Calculates a new route based on provided data.
 * @route POST /routes
 * @param {import('express').Request} req - The Express request object, containing route data in the body.
 * @param {import('express').Response} res - The Express response object.
 */
export const calculateRoute = withErrorHandling(async (req, res) => {
  const routeData = req.body;
  routeData.user_id = req.user.id;
  if (!validateIdOrRespond(routeData.user_id, validateUserId, res, 'user ID')) return;
  const route = await routeService.calculateRoute(routeData);
  return sendSuccess(res, route, 'Route calculated successfully');
}, (error, res) => {
  if (error.message.includes('not found')) return sendNotFound(res, error.message);
  return sendError(res, error.message, 500);
});

/**
 * Retrieves the details of a specific route.
 * Note: Route ownership is verified by the `withRouteOwnership` wrapper.
 * @route GET /routes/:route_id
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
export const getRouteDetails = withRouteOwnership(async (req, res, route_id) => {
    const { walkingSpeed } = req.query;
    const route = await routeService.getRouteDetails(route_id, walkingSpeed);
    // The route should exist if ownership was verified, but this is a good safety check.
    if (!route) {
      return sendNotFound(res, 'Route not found');
    }
    return sendSuccess(res, route, 'Route details retrieved successfully');
});

/**
 * Updates the stops for a given route.
 * Note: Route ownership is verified by the `withRouteOwnership` wrapper.
 * @route PUT /routes/:route_id
 * @param {import('express').Request} req - The Express request object, containing update data in the body.
 * @param {import('express').Response} res - The Express response object.
 */
export const updateRouteStops = withRouteOwnership(async (req, res, route_id) => {
    const updateData = req.body;
    const result = await routeService.updateRouteStops(route_id, updateData);
    if (!result) {
      return sendNotFound(res, 'Route not found');
    }
    return sendSuccess(res, result, 'Route updated successfully');
});

/**
 * Triggers a recalculation of an existing route.
 * Note: Route ownership is verified by the `withRouteOwnership` wrapper.
 * @route POST /routes/:route_id
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
export const recalculateRoute = withRouteOwnership(async (_, res, route_id) => {
    const route = await routeService.recalculateRoute(route_id);
    if (!route) {
      return sendNotFound(res, 'Route not found');
    }
    return sendSuccess(res, route, 'Route recalculated successfully');
});

/**
 * Deletes a specified route.
 * Note: Route ownership is verified by the `withRouteOwnership` wrapper.
 * @route DELETE /routes/:route_id
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
export const deleteRoute = withRouteOwnership(async (_, res, route_id) => {
    const deleted = await routeService.deleteRoute(route_id);
    if (!deleted) {
      return sendNotFound(res, 'Route not found');
    }
    // On successful deletion, return a 204 No Content response.
    return sendNoContent(res);
});
