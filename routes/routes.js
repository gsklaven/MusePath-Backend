import express from 'express';
import * as routeController from '../controllers/routeController.js';
import { validateRouteRequest } from '../middleware/validation.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /routes
 * @desc    Calculate route
 * @access  Private - Requires authentication
 */
router.post('/', verifyToken, validateRouteRequest, routeController.calculateRoute);

/**
 * @route   GET /routes/:route_id
 * @desc    Get route details
 * @access  Private - Requires authentication
 */
router.get('/:route_id', verifyToken, routeController.getRouteDetails);

/**
 * @route   PUT /routes/:route_id
 * @desc    Update route stops
 * @access  Private - Requires authentication
 */
router.put('/:route_id', verifyToken, routeController.updateRouteStops);

/**
 * @route   POST /routes/:route_id
 * @desc    Recalculate route
 * @access  Private - Requires authentication
 */
router.post('/:route_id', verifyToken, routeController.recalculateRoute);

/**
 * @route   DELETE /routes/:route_id
 * @desc    Delete route
 * @access  Private - Requires authentication
 */
router.delete('/:route_id', verifyToken, routeController.deleteRoute);

export default router;
