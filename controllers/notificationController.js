import * as notificationService from '../services/notificationService.js';
import { sendSuccess, sendError, sendNotFound } from '../utils/responses.js';

/**
 * Notification Controller
 * Handles HTTP requests for notification operations
 */

/**
 * Send user notification
 * POST /notifications
 */
export const sendUserNotification = async (req, res) => {
  try {
    const notificationData = req.body;
    
    const notification = await notificationService.sendNotification(notificationData);
    
    return sendSuccess(res, notification, 'Notification sent successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      return sendNotFound(res, error.message);
    }
    return sendError(res, error.message, 500);
  }
};
