import express from 'express';
import * as exhibitController from '../controllers/exhibitController.js';
import * as mapController from '../controllers/mapController.js';

const router = express.Router();

/**
 * @route   GET /downloads/exhibits/:exhibit_id
 * @desc    Download exhibit information
 * @access  Public
 */
router.get('/exhibits/:exhibit_id', exhibitController.downloadExhibitInfo);

/**
 * @route   GET /downloads/maps/:map_id
 * @desc    Download map file
 * @access  Public
 */
router.get('/maps/:map_id', mapController.downloadMap);

export default router;
