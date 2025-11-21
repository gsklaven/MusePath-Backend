import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { validateNotificationRequest } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /notifications
 * @desc    Send user notification
 * @access  Public
 */
router.post('/', validateNotificationRequest, notificationController.sendUserNotification);

export default router;
