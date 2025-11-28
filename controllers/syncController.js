import * as syncService from '../services/syncService.js';
import { sendSuccess, sendError } from '../utils/responses.js';

/**
 * Sync Controller
 * Handles HTTP requests for offline data synchronization
 */

/**
 * Synchronize offline changes
 * POST /sync
 */
export const synchronizeOfflineData = async (req, res) => {
  try {
    const operations = req.body;
    const userId = req.user?.userId || 1; // Default to user 1 if not authenticated
    
    if (!Array.isArray(operations)) {
      return sendError(res, 'Invalid operations payload', 400);
    }
    
    const result = await syncService.synchronizeOfflineData(userId, operations);
    
    return sendSuccess(res, result, 'Synchronization completed');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
