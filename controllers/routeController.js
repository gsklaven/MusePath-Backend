import * as routeService from '../services/routeService.js';
import { sendSuccess, sendError, sendNotFound, sendNoContent } from '../utils/responses.js';

/**
 * Route Controller
 * Handles HTTP requests for route operations
 */

/**
 * Calculate route
 * POST /routes
 */
export const calculateRoute = async (req, res) => {
  try {
    const routeData = req.body;
    
    // Add authenticated user's ID to the route data
    routeData.user_id = req.user.id;
    
    const route = await routeService.calculateRoute(routeData);
    
    return sendSuccess(res, route, 'Route calculated successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      return sendNotFound(res, error.message);
    }
    return sendError(res, error.message, 500);
  }
};

/**
 * Get route details
 * GET /routes/:route_id
 */
export const getRouteDetails = async (req, res) => {
  try {
    const { route_id } = req.params;
    const { walkingSpeed } = req.query;
    
    // Verify route ownership
    const routeOwner = await routeService.getRouteOwner(route_id);
    if (!routeOwner) {
      return sendNotFound(res, 'Route not found');
    }
    if (routeOwner !== Number(req.user.id)) {
      return sendError(res, 'Forbidden: cannot access other user routes', 403);
    }
    
    const route = await routeService.getRouteDetails(route_id, walkingSpeed);
    
    // NOTE: Lines 52-53 are defensive code - typically unreachable as getRouteOwner
    // already verified the route exists. Could only occur in race conditions.
    if (!route) {
      return sendNotFound(res, 'Route not found');
    }
    
    return sendSuccess(res, route, 'Route details retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Update route stops
 * PUT /routes/:route_id
 */
export const updateRouteStops = async (req, res) => {
  try {
    const { route_id } = req.params;
    const updateData = req.body;
    
    // Verify route ownership
    const routeOwner = await routeService.getRouteOwner(route_id);
    if (!routeOwner) {
      return sendNotFound(res, 'Route not found');
    }
    if (routeOwner !== Number(req.user.id)) {
      return sendError(res, 'Forbidden: cannot access other user routes', 403);
    }
    
    const result = await routeService.updateRouteStops(route_id, updateData);
    
    // NOTE: Lines 82-83 are defensive code - typically unreachable as getRouteOwner
    // already verified the route exists. Could only occur in race conditions.
    if (!result) {
      return sendNotFound(res, 'Route not found');
    }
    
    return sendSuccess(res, result, 'Route updated successfully');
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
    
    // Verify route ownership
    const routeOwner = await routeService.getRouteOwner(route_id);
    if (!routeOwner) {
      return sendNotFound(res, 'Route not found');
    }
    if (routeOwner !== Number(req.user.id)) {
      return sendError(res, 'Forbidden: cannot access other user routes', 403);
    }
    
    const route = await routeService.recalculateRoute(route_id);
    
    // NOTE: Lines 102-103 are defensive code - typically unreachable as getRouteOwner
    // already verified the route exists. Could only occur in race conditions.
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
    
    // Verify route ownership
    const routeOwner = await routeService.getRouteOwner(route_id);
    if (!routeOwner) {
      return sendNotFound(res, 'Route not found');
    }
    if (routeOwner !== Number(req.user.id)) {
      return sendError(res, 'Forbidden: cannot access other user routes', 403);
    }
    
    const deleted = await routeService.deleteRoute(route_id);
    
    // NOTE: Lines 140-141 are defensive code - typically unreachable as getRouteOwner
    // already verified the route exists. Could only occur in race conditions.
    if (!deleted) {
      return sendNotFound(res, 'Route not found');
    }
    
    return sendNoContent(res);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
