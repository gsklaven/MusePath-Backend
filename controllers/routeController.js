import * as routeService from '../services/routeService.js';
import { sendSuccess, sendError, sendNotFound, sendNoContent } from '../utils/responses.js';
import { validateRouteId, validateUserId } from '../utils/validators.js';

const checkRouteAccess = async (req, _, route_id) => {
  if (!validateRouteId(route_id)) return { error: 'Invalid route ID format', code: 400 };

  const routeOwner = await routeService.getRouteOwner(route_id);
  if (!routeOwner) return { error: 'Route not found', code: 404 };

  if (routeOwner !== Number(req.user.id)) {
    return { error: 'Forbidden: cannot access other user routes', code: 403 };
  }
  return { success: true };
};

export const calculateRoute = async (req, res) => {
  try {
    const routeData = { ...req.body, user_id: req.user.id };
    if (!validateUserId(routeData.user_id)) return sendError(res, 'Invalid user ID format', 400);

    const route = await routeService.calculateRoute(routeData);
    return sendSuccess(res, route, 'Route calculated successfully');
  } catch (error) {
    const isNotFound = error.message.includes('not found');
    return isNotFound ? sendNotFound(res, error.message) : sendError(res, error.message, 500);
  }
};

export const getRouteDetails = async (req, res) => {
  try {
    const access = await checkRouteAccess(req, res, req.params.route_id);
    if (access.error) return access.code === 404 ? sendNotFound(res, access.error) : sendError(res, access.error, access.code);

    const route = await routeService.getRouteDetails(req.params.route_id, req.query.walkingSpeed);
    return route ? sendSuccess(res, route, 'Route details retrieved successfully') : sendNotFound(res, 'Route not found');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateRouteStops = async (req, res) => {
  try {
    const access = await checkRouteAccess(req, res, req.params.route_id);
    if (access.error) return access.code === 404 ? sendNotFound(res, access.error) : sendError(res, access.error, access.code);

    const result = await routeService.updateRouteStops(req.params.route_id, req.body);
    return result ? sendSuccess(res, result, 'Route updated successfully') : sendNotFound(res, 'Route not found');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Recalculate route
 * POST /routes/:route_id
 */
export const recalculateRoute = async (req, res) => {
  try {
    const { route_id } = req.params;
    if (!validateRouteId(route_id)) {
      return sendError(res, 'Invalid route ID format', 400);
    }
    // Verify route ownership
    const routeOwner = await routeService.getRouteOwner(route_id);
    if (!routeOwner) {
      return sendNotFound(res, 'Route not found');
    }
    if (routeOwner !== Number(req.user.id)) {
      return sendError(res, 'Forbidden: cannot access other user routes', 403);
    }
    const route = await routeService.recalculateRoute(route_id);
    if (!route) {
      return sendNotFound(res, 'Route not found');
    }
    return sendSuccess(res, route, 'Route recalculated successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Delete route
 * DELETE /routes/:route_id
 */
export const deleteRoute = async (req, res) => {
  try {
    const { route_id } = req.params;
    if (!validateRouteId(route_id)) {
      return sendError(res, 'Invalid route ID format', 400);
    }
    // Verify route ownership
    const routeOwner = await routeService.getRouteOwner(route_id);
    if (!routeOwner) {
      return sendNotFound(res, 'Route not found');
    }
    if (routeOwner !== Number(req.user.id)) {
      return sendError(res, 'Forbidden: cannot access other user routes', 403);
    }
    const deleted = await routeService.deleteRoute(route_id);
    if (!deleted) {
      return sendNotFound(res, 'Route not found');
    }
    return sendNoContent(res);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};