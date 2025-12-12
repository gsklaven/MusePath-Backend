import express from 'express';
import * as syncController from '../controllers/syncController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /sync
 * @desc    Synchronize offline changes
 * @access  Private - Requires authentication
 */
router.post('/', verifyToken, syncController.synchronizeOfflineData);

export default router;
