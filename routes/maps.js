import express from 'express';
import * as mapController from '../controllers/mapController.js';
import { validateMapUpload } from '../middleware/validation.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /maps
 * @desc    Upload map
 * @access  Private - Admin only
 */
router.post('/', verifyToken, requireAdmin, validateMapUpload, mapController.uploadMap);

/**
 * @route   GET /maps/:map_id
 * @desc    Get map data
 * @access  Public
 */
router.get('/:map_id', mapController.getMapById);

/**
 * @route   DELETE /maps/:map_id
 * @desc    Delete map
 * @access  Private - Admin only
 */
router.delete('/:map_id', verifyToken, requireAdmin, mapController.deleteMap);

export default router;
