import * as syncService from '../services/syncService.js';
import { sendSuccess, sendError } from '../utils/responses.js';

/**
 * Sync Controller
 * Handles HTTP requests for offline data synchronization
 */

/**
 * Synchronize offline changes.
 * 
 * Processes a batch of operations performed while the client was offline.
 * 
 * @route POST /sync
 * @param {import('express').Request} req - Express request object containing an array of operations in body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with synchronization results (successes, failures, conflicts).
 */
export const synchronizeOfflineData = async (req, res) => {
  try {
    const operations = req.body;
    
    // verifyToken middleware ensures req.user exists
    const userId = req.user.id || req.user.userId || req.user._id;
    
    // NOTE: Lines 21-22 are defensive code - unreachable as verifyToken middleware
    // always sets req.user.id. Kept for safety in case of future auth changes.
    if (!userId) {
      return sendError(res, 'User authentication required', 401);
    }
    
    if (!Array.isArray(operations)) {
      return sendError(res, 'Invalid operations payload. Expected an array of operations.', 400);
    }
    
    if (operations.length === 0) {
      return sendSuccess(res, { 
        conflicts: [], 
        successful: 0, 
        failed: 0,
        details: { successful: [], failed: [] }
      }, 'No operations to synchronize');
    }
    
    const result = await syncService.synchronizeOfflineData(userId, operations);
    
    return sendSuccess(res, result, 'Synchronization completed');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
