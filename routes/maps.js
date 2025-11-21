import express from 'express';
import * as mapController from '../controllers/mapController.js';
import { validateMapUpload } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /maps
 * @desc    Upload map
 * @access  Public
 */
router.post('/', validateMapUpload, mapController.uploadMap);

/**
 * @route   GET /maps/:map_id
 * @desc    Get map data
 * @access  Public
 */
router.get('/:map_id', mapController.getMapById);

export default router;
