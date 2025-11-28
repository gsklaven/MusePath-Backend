import express from 'express';
import * as routeController from '../controllers/routeController.js';
import { validateRouteRequest } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /routes
 * @desc    Calculate route
 * @access  Public
 */
router.post('/', validateRouteRequest, routeController.calculateRoute);

/**
 * @route   GET /routes/:route_id
 * @desc    Get route details
 * @access  Public
 */
router.get('/:route_id', routeController.getRouteDetails);

/**
 * @route   PUT /routes/:route_id
 * @desc    Update route stops
 * @access  Public
 */
router.put('/:route_id', routeController.updateRouteStops);

/**
 * @route   POST /routes/:route_id
 * @desc    Recalculate route
 * @access  Public
 */
router.post('/:route_id', routeController.recalculateRoute);

/**
 * @route   DELETE /routes/:route_id
 * @desc    Delete route
 * @access  Public
 */
router.delete('/:route_id', routeController.deleteRoute);

export default router;
