import express from 'express';
import * as userController from '../controllers/userController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   PUT /users/:user_id/preferences
 * @desc    Update user preferences
 * @access  Public
 */
router.put('/:user_id/preferences', userController.updateUserPreferences);

/**
 * @route   POST /users/:user_id/favourites
 * @desc    Add exhibit to favourites
 * @access  Public
 */
router.post('/:user_id/favourites', userController.addExhibitToFavourites);

/**
 * @route   DELETE /users/:user_id/favourites/:exhibit_id
 * @desc    Remove exhibit from favourites
 * @access  Public
 */
router.delete('/:user_id/favourites/:exhibit_id', userController.removeExhibitFromFavourites);

/**
 * @route   GET /users/:user_id/routes
 * @desc    Get personalized route
 * @access  Public
 */
router.get('/:user_id/routes', userController.getPersonalizedRoute);

export default router;
