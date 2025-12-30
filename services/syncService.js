import { rateExhibit } from './exhibitService.js';
import { addFavorite, removeFavorite } from './userService.js';
import { SYNC_OPERATION } from '../config/constants.js';

/**
 * Sync Service
 * 
 * This service provides the business logic for synchronizing data that was generated
 * by a client while they were offline. When the client comes back online, they can
 * send a batch of operations to the backend. This service processes each operation,
 * applying the changes to the database and tracking the outcome of each one.
 */

/**
 * Represents a single operation performed by the user while offline.
 * @typedef {Object} SyncOperation
 * @property {string} operation_type - The specific type of the operation (e.g., 'RATING', 'ADD_FAVORITE').
 * @property {number} exhibit_id - The identifier for the exhibit that the operation targets.
 * @property {number} [rating] - The numerical rating value, required only for 'RATING' operations.
 * @property {string} [timestamp] - An ISO 8601 timestamp indicating when the operation occurred.
 */

/**
 * The structured result of a synchronization request, summarizing which operations were successful and which failed.
 * @typedef {Object} SyncResult
 * @property {Array} conflicts - A list of operations that could not be processed due to data conflicts. (Currently a placeholder, not implemented).
 * @property {number} successful - The total count of successfully processed operations.
 * @property {number} failed - The total count of failed operations.
 * @property {Object} details - Provides detailed lists of the successful and failed operations.
 * @property {Array<SyncOperation>} details.successful - The list of operations that were successfully applied.
 * @property {Array<{operation: SyncOperation, reason: string}>} details.failed - The list of operations that failed, including the reason for failure.
 */

/**
 * Processes a single sync operation by delegating to the appropriate service.
 * 
 * @param {number} userId - The ID of the user for whom the operation is being processed.
 * @param {SyncOperation} operation - The operation object to process.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 * @throws {Error} Throws an error if the operation type is unknown or if the underlying service action fails.
 */
const processOperation = async (userId, operation) => {
  switch (operation.operation_type) {
    case SYNC_OPERATION.RATING:
      // Apply a user's rating to an exhibit.
      await rateExhibit(operation.exhibit_id, userId, operation.rating);
      break;
    case SYNC_OPERATION.ADD_FAVORITE:
      // Add an exhibit to the user's list of favorites.
      await addFavorite(userId, operation.exhibit_id);
      break;
    case SYNC_OPERATION.REMOVE_FAVORITE:
      // Remove an exhibit from the user's list of favorites.
      await removeFavorite(userId, operation.exhibit_id);
      break;
    default:
      // If the operation type is not recognized, throw an error.
      throw new Error('Unknown operation type');
  }
};

/**
 * Iterates over a batch of offline operations and processes them sequentially.
 * This function ensures that all operations are attempted, and it compiles a detailed
 * report of which operations succeeded and which failed.
 * 
 * @param {number} userId - The ID of the user performing the synchronization.
 * @param {SyncOperation[]} operations - An array of offline operations to be processed.
 * @returns {Promise<SyncResult>} A promise that resolves to an object detailing the synchronization results.
 */
export const synchronizeOfflineData = async (userId, operations) => {
  const successful = [];
  const failed = [];
  
  // Sequentially process each operation in the batch.
  for (const operation of operations) {
    try {
      // Attempt to process the operation.
      await processOperation(userId, operation);
      successful.push(operation);
    } catch (error) {
      // If an error occurs, record the failure along with the reason.
      failed.push({ operation, reason: error.message });
    }
  }
  
  // Return a structured result object summarizing the outcomes.
  return {
    conflicts: [], // Placeholder for future conflict resolution logic.
    successful: successful.length,
    failed: failed.length,
    details: {
      successful,
      failed
    }
  };
};
