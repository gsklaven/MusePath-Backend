import express from 'express';
import * as exhibitController from '../controllers/exhibitController.js';
import { validateRatingRequest, validateExhibitCreate } from '../middleware/validation.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /exhibits/search
 * @desc    Search for exhibits
 * @access  Public
 */
router.get('/search', exhibitController.searchExhibits);

/**
 * @route   GET /exhibits/:exhibit_id
 * @desc    View exhibit information
 * @access  Public
 */
router.get('/:exhibit_id', exhibitController.viewExhibitInfo);

/**
 * @route   GET /exhibits/:exhibit_id/audio
 * @desc    Get audio guide for exhibit
 * @access  Public
 */
router.get('/:exhibit_id/audio', exhibitController.getAudioGuide);

/**
 * @route   POST /exhibits/:exhibit_id/ratings
 * @desc    Rate an exhibit
 * @access  Private - Requires authentication
 */
router.post('/:exhibit_id/ratings', verifyToken, validateRatingRequest, exhibitController.rateExhibit);

/**
 * @route   POST /exhibits
 * @desc    Create a new exhibit
 * @access  Private - Admin only
 */
router.post('/', verifyToken, requireAdmin, validateExhibitCreate, exhibitController.createExhibit);

/**
 * @route   DELETE /exhibits/:exhibit_id
 * @desc    Delete an exhibit
 * @access  Private - Admin only
 */
router.delete('/:exhibit_id', verifyToken, requireAdmin, exhibitController.deleteExhibit);

export default router;
