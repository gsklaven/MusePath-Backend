import * as routeService from '../services/routeService.js';
import { sendSuccess, sendError, sendNotFound, sendNoContent } from '../utils/responses.js';
import { validateRouteId, validateUserId } from '../utils/validators.js';

/**
 * Unified route access verification
 * Returns standardized response or null if access is granted
 */
const verifyRouteAccess = async (req, res, route_id) => {
  if (!validateRouteId(route_id)) {
    return sendError(res, 'Invalid route ID format', 400);
  }

  const routeOwner = await routeService.getRouteOwner(route_id);
  
  if (!routeOwner) {
    return sendNotFound(res, 'Route not found');
  }

  if (routeOwner !== Number(req.user.id)) {
    return sendError(res, 'Forbidden: cannot access other user routes', 403);
  }

  return null; // Access granted
};

/**
 * Handle service errors with appropriate responses
 */
const handleServiceError = (res, error) => {
  const isNotFound = error.message.includes('not found');
  const statusCode = isNotFound ? 404 : 500;
  const handler = isNotFound ? sendNotFound : sendError;
  
  return handler(res, error.message, statusCode);
};

/**
 * Calculate new route
 * POST /routes
 */
export const calculateRoute = async (req, res) => {
  try {
    const routeData = { ...req.body, user_id: req.user.id };
    
    if (!validateUserId(routeData.user_id)) {
      return sendError(res, 'Invalid user ID format', 400);
    }

    const route = await routeService.calculateRoute(routeData);
    return sendSuccess(res, route, 'Route calculated successfully');
  } catch (error) {
    return handleServiceError(res, error);
  }
};

/**
 * Get route details
 * GET /routes/:route_id
 */
export const getRouteDetails = async (req, res) => {
  try {
    const accessDenied = await verifyRouteAccess(req, res, req.params.route_id);
    if (accessDenied) return accessDenied;

    const route = await routeService.getRouteDetails(
      req.params.route_id, 
      req.query.walkingSpeed
    );
    
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
 * PUT /routes/:route_id/stops
 */
export const updateRouteStops = async (req, res) => {
  try {
    const accessDenied = await verifyRouteAccess(req, res, req.params.route_id);
    if (accessDenied) return accessDenied;

    const result = await routeService.updateRouteStops(
      req.params.route_id, 
      req.body
    );
    
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
    const accessDenied = await verifyRouteAccess(req, res, req.params.route_id);
    if (accessDenied) return accessDenied;

    const route = await routeService.recalculateRoute(req.params.route_id);
    
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
    const accessDenied = await verifyRouteAccess(req, res, req.params.route_id);
    if (accessDenied) return accessDenied;

    const deleted = await routeService.deleteRoute(req.params.route_id);
    
    if (!deleted) {
      return sendNotFound(res, 'Route not found');
    }
    
    return sendNoContent(res);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};