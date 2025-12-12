import express from 'express';
import * as coordinateController from '../controllers/coordinateController.js';
import { validateCoordinateUpdate } from '../middleware/validation.js';
import { verifyToken, authorizeSameUser } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /coordinates/:user_id
 * @desc    Get current user coordinates
 * @access  Public
 */
router.get('/:user_id', verifyToken, authorizeSameUser(), coordinateController.getCurrentCoordinates);

/**
 * @route   PUT /coordinates/:user_id
 * @desc    Update current user coordinates
 * @access  Public
 */
router.put('/:user_id', verifyToken, authorizeSameUser(), validateCoordinateUpdate, coordinateController.updateCurrentCoordinates);

export default router;
