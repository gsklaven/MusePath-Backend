import Notification from '../models/Notification.js';
import { isMockDataMode } from '../config/database.js';
import { mockNotifications } from '../data/mockData.js';
import { getRouteDetails } from './routeService.js';
import { generateUniqueId, isRouteDeviated } from '../utils/helpers.js';
import { ROUTE_DEVIATION_THRESHOLD, NOTIFICATION_TYPE } from '../config/constants.js';

/**
 * Notification Service
 * Business logic for notification operations
 */

/**
 * Send notification to user
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} Notification result
 */
export const sendNotification = async (notificationData) => {
  const { user_id, route_id, currentLat, currentLng } = notificationData;
  
  // Get route details
  const route = await getRouteDetails(route_id);
  
  if (!route) {
    throw new Error('Route not found');
  }
  
  // Check for route deviation
  const currentPos = { lat: currentLat, lng: currentLng };
  const routePath = route.path.map(p => {
    const [lat, lng] = p.split(',');
    return { lat: parseFloat(lat), lng: parseFloat(lng) };
  });
  
  let notificationType = NOTIFICATION_TYPE.INFO;
  let message = 'You are on track';
  
  if (isRouteDeviated(currentPos, routePath, ROUTE_DEVIATION_THRESHOLD)) {
    notificationType = NOTIFICATION_TYPE.ROUTE_DEVIATION;
    message = `You have deviated from the route by more than ${ROUTE_DEVIATION_THRESHOLD} meters. Recalculating route...`;
  }
  
  const notificationId = isMockDataMode()
    ? generateUniqueId(mockNotifications, 'notificationId')
    : await generateNextNotificationId();
  
  const notification = {
    notificationId,
    userId: Number(user_id),
    routeId: Number(route_id),
    type: notificationType,
    message,
    isRead: false,
    createdAt: new Date()
  };
  
  if (isMockDataMode()) {
    mockNotifications.push(notification);
  } else {
    const notif = new Notification(notification);
    await notif.save();
  }
  
  return {
    notificationId,
    type: notificationType,
    message
  };
};

/**
 * Generate next notification ID (for database mode)
 * @returns {Promise<number>} Next ID
 */
const generateNextNotificationId = async () => {
  const lastNotification = await Notification.findOne().sort({ notificationId: -1 });
  return lastNotification ? lastNotification.notificationId + 1 : 1;
};
