import { rateExhibit } from './exhibitService.js';
import { addFavorite, removeFavorite } from './userService.js';
import { SYNC_OPERATION } from '../config/constants.js';

/**
 * Sync Service
 * Business logic for offline data synchronization.
 * 
 * This service handles the processing of operations that occurred while the client
 * was offline. It iterates through a batch of operations and applies them to the
 * backend, tracking successes and failures.
 */

/**
 * @typedef {Object} SyncOperation
 * @property {string} operation_type - The type of operation (e.g., 'RATING', 'ADD_FAVORITE').
 * @property {number} exhibit_id - The ID of the exhibit involved in the operation.
 * @property {number} [rating] - The rating value (required for RATING operations).
 * @property {string} [timestamp] - When the operation occurred.
 */

/**
 * @typedef {Object} SyncResult
 * @property {Array} conflicts - List of conflicting operations (currently unused).
 * @property {number} successful - Count of successfully processed operations.
 * @property {number} failed - Count of failed operations.
 * @property {Object} details - Detailed lists of successful and failed operations.
 */

/**
 * Process a single sync operation.
 * @param {number} userId - The user ID.
 * @param {SyncOperation} operation - The operation to process.
 * @returns {Promise<void>}
 * @throws {Error} If operation type is unknown or handler fails.
 */
const processOperation = async (userId, operation) => {
  switch (operation.operation_type) {
    case SYNC_OPERATION.RATING:
      await rateExhibit(operation.exhibit_id, userId, operation.rating);
      break;
    case SYNC_OPERATION.ADD_FAVORITE:
      await addFavorite(userId, operation.exhibit_id);
      break;
    case SYNC_OPERATION.REMOVE_FAVORITE:
      await removeFavorite(userId, operation.exhibit_id);
      break;
    default:
      throw new Error('Unknown operation type');
  }
};

/**
 * Synchronize offline operations.
 * 
 * @param {number} userId - The ID of the user performing the synchronization.
 * @param {SyncOperation[]} operations - Array of offline operations to process.
 * @returns {Promise<SyncResult>} The result of the synchronization process.
 */
export const synchronizeOfflineData = async (userId, operations) => {
  const successful = [];
  const failed = [];
  
  for (const operation of operations) {
    try {
      await processOperation(userId, operation);
      successful.push(operation);
    } catch (error) {
      failed.push({ operation, reason: error.message });
    }
  }
  
  return {
    conflicts: [],
    successful: successful.length,
    failed: failed.length,
    details: {
      successful,
      failed
    }
  };
};
