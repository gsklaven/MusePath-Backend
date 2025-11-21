import { rateExhibit } from './exhibitService.js';
import { addFavorite, removeFavorite } from './userService.js';
import { SYNC_OPERATION } from '../config/constants.js';

/**
 * Sync Service
 * Business logic for offline data synchronization
 */

/**
 * Synchronize offline operations
 * @param {number} userId - User ID
 * @param {Array} operations - Array of offline operations
 * @returns {Promise<Object>} Sync result
 */
export const synchronizeOfflineData = async (userId, operations) => {
  const conflicts = [];
  const successful = [];
  const failed = [];
  
  for (const operation of operations) {
    try {
      switch (operation.operation_type) {
        case SYNC_OPERATION.RATING:
          await rateExhibit(operation.exhibit_id, userId, operation.rating);
          successful.push(operation);
          break;
          
        case SYNC_OPERATION.ADD_FAVORITE:
          await addFavorite(userId, operation.exhibit_id);
          successful.push(operation);
          break;
          
        case SYNC_OPERATION.REMOVE_FAVORITE:
          await removeFavorite(userId, operation.exhibit_id);
          successful.push(operation);
          break;
          
        default:
          failed.push({
            operation,
            reason: 'Unknown operation type'
          });
      }
    } catch (error) {
      failed.push({
        operation,
        reason: error.message
      });
    }
  }
  
  return {
    conflicts,
    successful: successful.length,
    failed: failed.length,
    details: {
      successful,
      failed
    }
  };
};
