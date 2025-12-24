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
 * The operations array should contain objects with `operation_type`, `exhibit_id`, etc.
 * 
 * @route POST /sync
 * @param {import('express').Request} req - Express request object. Body must be an array of operation objects.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with synchronization results:
 *  - `success`: boolean
 *  - `data`: Object containing `successful` (count), `failed` (count), `conflicts` (array), and `details`.
 *  - `message`: Status message.
 */
export const synchronizeOfflineData = async (req, res) => {
  try {
    // Extract operations from request body
    const operations = req.body;
    
    // Extract user ID from the authenticated user object attached by middleware
    // Supports various user object structures (id, userId, _id)
    const userId = req.user?.id || req.user?.userId || req.user?._id;
    
    // Validate that the payload is an array
    if (!Array.isArray(operations)) {
      return sendError(res, 'Invalid operations payload. Expected an array of operations.', 400);
    }
    
    // Handle empty operations array immediately
    if (operations.length === 0) {
      return sendSuccess(res, {
        conflicts: [],
        successful: 0,
        failed: 0,
        details: { successful: [], failed: [] }
      }, 'No operations to synchronize');
    }
    
    // Delegate processing to the sync service
    const result = await syncService.synchronizeOfflineData(userId, operations);
    
    return sendSuccess(res, result, 'Synchronization completed');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
