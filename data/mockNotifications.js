/**
 * Mock Notifications Collection
 * Contains mock notifications for events like route deviations.
 */
export const mockNotifications = [
  {
    // Unique identifier for the notification.
    notificationId: 1,
    // The ID of the user who received the notification.
    userId: 1,
    // The ID of the route associated with the notification.
    routeId: 1,
    // The type of the notification.
    type: 'route_deviation',
    // The message of the notification.
    message: 'You have deviated from the suggested route. Recalculating...',
    // A flag indicating if the notification has been read.
    isRead: false,
    // The date and time when the notification was created.
    createdAt: new Date()
  }
];