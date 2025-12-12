import express from 'express';
import * as userController from '../controllers/userController.js';
import { verifyToken, authorizeSameUser } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   PUT /users/:user_id/preferences
 * @desc    Update user preferences
 * @access  Private - Requires authentication and same user
 */
router.put('/:user_id/preferences', verifyToken, authorizeSameUser(), userController.updateUserPreferences);

/**
 * @route   POST /users/:user_id/favourites
 * @desc    Add exhibit to favourites
 * @access  Private - Requires authentication and same user
 */
router.post('/:user_id/favourites', verifyToken, authorizeSameUser(), userController.addExhibitToFavourites);

/**
 * @route   DELETE /users/:user_id/favourites/:exhibit_id
 * @desc    Remove exhibit from favourites
 * @access  Private - Requires authentication and same user
 */
router.delete('/:user_id/favourites/:exhibit_id', verifyToken, authorizeSameUser(), userController.removeExhibitFromFavourites);

/**
 * @route   GET /users/:user_id/routes
 * @desc    Get personalized route
 * @access  Private - Requires authentication and same user
 */
router.get('/:user_id/routes', verifyToken, authorizeSameUser(), userController.getPersonalizedRoute);

export default router;
