import express from 'express';
import * as destinationController from '../controllers/destinationController.js';
import { validateDestinationUpload } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   GET /destinations
 * @desc    List all destinations
 * @access  Public
 */
router.get('/', destinationController.listDestinations);

/**
 * @route   POST /destinations
 * @desc    Upload destinations data
 * @access  Public
 */
router.post('/', validateDestinationUpload, destinationController.uploadDestinations);

/**
 * @route   GET /destinations/:destination_id
 * @desc    Get destination info
 * @access  Public
 */
router.get('/:destination_id', destinationController.getDestinationInfo);

export default router;
