import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { validateNotificationRequest } from '../middleware/validation.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /notifications
 * @desc    Send user notification
 * @access  Private
 */
router.post('/', verifyToken, validateNotificationRequest, notificationController.sendUserNotification);

export default router;
