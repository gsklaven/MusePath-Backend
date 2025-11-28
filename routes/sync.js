import express from 'express';
import * as syncController from '../controllers/syncController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /sync
 * @desc    Synchronize offline changes
 * @access  Public
 */
router.post('/', optionalAuth, syncController.synchronizeOfflineData);

export default router;
