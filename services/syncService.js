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
 * Strategy map for handling different sync operations.
 * @type {Object.<string, Function>}
 */
const operationHandlers = {
  [SYNC_OPERATION.RATING]: (userId, op) => rateExhibit(op.exhibit_id, userId, op.rating),
  [SYNC_OPERATION.ADD_FAVORITE]: (userId, op) => addFavorite(userId, op.exhibit_id),
  [SYNC_OPERATION.REMOVE_FAVORITE]: (userId, op) => removeFavorite(userId, op.exhibit_id)
};

/**
 * Process a single sync operation.
 * @param {number} userId - The user ID.
 * @param {SyncOperation} operation - The operation to process.
 * @returns {Promise<void>}
 * @throws {Error} If operation type is unknown or handler fails.
 */
const processOperation = async (userId, operation) => {
  const handler = operationHandlers[operation.operation_type];
  if (!handler) {
    throw new Error('Unknown operation type');
  }
  await handler(userId, operation);
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
