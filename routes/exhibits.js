import express from 'express';
import * as exhibitController from '../controllers/exhibitController.js';
import { validateRatingRequest } from '../middleware/validation.js';
import { optionalAuth } from '../middleware/auth.js';

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
 * @access  Public
 */
router.post('/:exhibit_id/ratings', optionalAuth, validateRatingRequest, exhibitController.rateExhibit);

export default router;
