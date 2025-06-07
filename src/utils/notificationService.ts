// src/utils/notificationService.ts
import { v4 as uuidv4 } from 'uuid';

// Notification Types
export type NotificationType = 'order_update' | 'message' | 'promotion' | 'system';
export type SenderType = 'system' | 'customer' | 'restaurant' | 'rider';
export type RelatedEntityType = 'order' | 'message_thread' | 'promotion';

// Notification Model
export interface Notification {
  id: string;
  recipientId: string;
  senderId?: string;
  senderType?: SenderType;
  type: NotificationType;
  title: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  relatedEntityId?: string;
  relatedEntityType?: RelatedEntityType;
}

// Local Storage Keys
const NOTIFICATIONS_STORAGE_KEY = 'quick-wheel-notifications';

// Helper Functions
const getNotificationsFromStorage = (): Notification[] => {
  try {
    const storedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return storedNotifications ? JSON.parse(storedNotifications) : [];
  } catch (error) {
    console.error('Error retrieving notifications from storage:', error);
    return [];
  }
};

const saveNotificationsToStorage = (notifications: Notification[]): void => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    
    // Dispatch storage event to notify other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: NOTIFICATIONS_STORAGE_KEY,
      newValue: JSON.stringify(notifications)
    }));
  } catch (error) {
    console.error('Error saving notifications to storage:', error);
  }
};

// Notification Service Functions
export const createNotification = (
  recipientId: string,
  type: NotificationType,
  title: string,
  content: string,
  options?: {
    senderId?: string;
    senderType?: SenderType;
    actionUrl?: string;
    relatedEntityId?: string;
    relatedEntityType?: RelatedEntityType;
  }
): Notification => {
  const notification: Notification = {
    id: uuidv4(),
    recipientId,
    type,
    title,
    content,
    timestamp: new Date().toISOString(),
    isRead: false,
    ...options
  };
  
  const notifications = getNotificationsFromStorage();
  notifications.push(notification);
  saveNotificationsToStorage(notifications);
  
  return notification;
};

export const getNotifications = (recipientId: string): Notification[] => {
  const notifications = getNotificationsFromStorage();
  return notifications
    .filter(notification => notification.recipientId === recipientId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getUnreadNotificationCount = (recipientId: string): number => {
  const notifications = getNotificationsFromStorage();
  return notifications.filter(
    notification => notification.recipientId === recipientId && !notification.isRead
  ).length;
};

export const markNotificationAsRead = (notificationId: string): void => {
  const notifications = getNotificationsFromStorage();
  const updatedNotifications = notifications.map(notification => 
    notification.id === notificationId
      ? { ...notification, isRead: true }
      : notification
  );
  saveNotificationsToStorage(updatedNotifications);
};

export const markAllNotificationsAsRead = (recipientId: string): void => {
  const notifications = getNotificationsFromStorage();
  const updatedNotifications = notifications.map(notification => 
    notification.recipientId === recipientId
      ? { ...notification, isRead: true }
      : notification
  );
  saveNotificationsToStorage(updatedNotifications);
};

export const deleteNotification = (notificationId: string): void => {
  const notifications = getNotificationsFromStorage();
  const updatedNotifications = notifications.filter(
    notification => notification.id !== notificationId
  );
  saveNotificationsToStorage(updatedNotifications);
};

export const clearAllNotifications = (recipientId: string): void => {
  const notifications = getNotificationsFromStorage();
  const updatedNotifications = notifications.filter(
    notification => notification.recipientId !== recipientId
  );
  saveNotificationsToStorage(updatedNotifications);
};

// Notification Generator Functions
export const generateOrderStatusNotification = (
  recipientId: string,
  orderId: string,
  status: string,
  restaurantName: string
): Notification => {
  let title = '';
  let content = '';
  
  switch (status) {
    case 'accepted':
      title = 'Order Accepted';
      content = `${restaurantName} has accepted your order and is preparing it.`;
      break;
    case 'preparing':
      title = 'Order Being Prepared';
      content = `${restaurantName} is now preparing your order.`;
      break;
    case 'ready':
      title = 'Order Ready for Pickup';
      content = `Your order from ${restaurantName} is ready for pickup by a rider.`;
      break;
    case 'picked_up':
      title = 'Order Picked Up';
      content = `Your order from ${restaurantName} has been picked up and is on its way.`;
      break;
    case 'delivered':
      title = 'Order Delivered';
      content = `Your order from ${restaurantName} has been delivered. Enjoy your meal!`;
      break;
    case 'cancelled':
      title = 'Order Cancelled';
      content = `Your order from ${restaurantName} has been cancelled.`;
      break;
    default:
      title = 'Order Update';
      content = `There's an update to your order from ${restaurantName}.`;
  }
  
  return createNotification(
    recipientId,
    'order_update',
    title,
    content,
    {
      senderType: 'system',
      relatedEntityId: orderId,
      relatedEntityType: 'order',
      actionUrl: `/customer/orders/${orderId}`
    }
  );
};

export const generatePaymentNotification = (
  recipientId: string,
  orderId: string,
  status: 'completed' | 'failed',
  amount: number
): Notification => {
  if (status === 'completed') {
    return createNotification(
      recipientId,
      'order_update',
      'Payment Successful',
      `Your payment of ฿${amount.toFixed(2)} has been processed successfully.`,
      {
        senderType: 'system',
        relatedEntityId: orderId,
        relatedEntityType: 'order',
        actionUrl: `/customer/orders/${orderId}`
      }
    );
  } else {
    return createNotification(
      recipientId,
      'order_update',
      'Payment Failed',
      `Your payment of ฿${amount.toFixed(2)} could not be processed. Please try again.`,
      {
        senderType: 'system',
        relatedEntityId: orderId,
        relatedEntityType: 'order',
        actionUrl: `/payment/${orderId}`
      }
    );
  }
};

export const generateMessageNotification = (
  recipientId: string,
  senderId: string,
  senderType: 'customer' | 'restaurant' | 'rider',
  senderName: string,
  messagePreview: string,
  threadId: string
): Notification => {
  return createNotification(
    recipientId,
    'message',
    `New Message from ${senderName}`,
    messagePreview,
    {
      senderId,
      senderType,
      relatedEntityId: threadId,
      relatedEntityType: 'message_thread',
      actionUrl: `/messages/${threadId}`
    }
  );
};

export const generatePromotionNotification = (
  recipientId: string,
  title: string,
  content: string,
  promotionId: string
): Notification => {
  return createNotification(
    recipientId,
    'promotion',
    title,
    content,
    {
      senderType: 'system',
      relatedEntityId: promotionId,
      relatedEntityType: 'promotion',
      actionUrl: `/promotions/${promotionId}`
    }
  );
};

export const generateSystemNotification = (
  recipientId: string,
  title: string,
  content: string,
  actionUrl?: string
): Notification => {
  return createNotification(
    recipientId,
    'system',
    title,
    content,
    {
      senderType: 'system',
      actionUrl
    }
  );
};

// Sample Data Generator
export const generateSampleNotifications = (userId: string, userType: 'customer' | 'restaurant' | 'rider'): void => {
  // Clear existing notifications
  clearAllNotifications(userId);
  
  const notifications: Notification[] = [];
  const currentTime = new Date();
  
  // Generate sample notifications based on user type
  if (userType === 'customer') {
    // Order status notifications
    notifications.push({
      id: uuidv4(),
      recipientId: userId,
      type: 'order_update',
      title: 'Order Delivered',
      content: 'Your order from Bangkok Bistro has been delivered. Enjoy your meal!',
      timestamp: new Date(currentTime.getTime() - 30 * 60000).toISOString(), // 30 minutes ago
      isRead: true,
      senderType: 'system',
      relatedEntityId: 'order-123',
      relatedEntityType: 'order',
      actionUrl: '/customer/orders/order-123'
    });
    
    notifications.push({
      id: uuidv4(),
      recipientId: userId,
      type: 'order_update',
      title: 'Order Being Prepared',
      content: 'Thai Spice Kitchen is now preparing your order.',
      timestamp: new Date(currentTime.getTime() - 10 * 60000).toISOString(), // 10 minutes ago
      isRead: false,
      senderType: 'system',
      relatedEntityId: 'order-456',
      relatedEntityType: 'order',
      actionUrl: '/customer/orders/order-456'
    });
    
    // Message notification
    notifications.push({
      id: uuidv4(),
      recipientId: userId,
      senderId: 'rider-789',
      senderType: 'rider',
      type: 'message',
      title: 'New Message from Sompong K.',
      content: 'I\'m at the entrance of your building. Could you please come down?',
      timestamp: new Date(currentTime.getTime() - 5 * 60000).toISOString(), // 5 minutes ago
      isRead: false,
      relatedEntityId: 'thread-123',
      relatedEntityType: 'message_thread',
      actionUrl: '/messages/thread-123'
    });
    
    // Promotion notification
    notifications.push({
      id: uuidv4(),
      recipientId: userId,
      type: 'promotion',
      title: 'Special Discount!',
      content: 'Get 20% off your next order with code SAVE20',
      timestamp: new Date(currentTime.getTime() - 2 * 60 * 60000).toISOString(), // 2 hours ago
      isRead: false,
      senderType: 'system',
      relatedEntityId: 'promo-123',
      relatedEntityType: 'promotion',
      actionUrl: '/promotions/promo-123'
    });
  } else if (userType === 'restaurant') {
    // New order notification
    notifications.push({
      id: uuidv4(),
      recipientId: userId,
      type: 'order_update',
      title: 'New Order Received',
      content: 'You have received a new order from Somchai T.',
      timestamp: new Date(currentTime.getTime() - 5 * 60000).toISOString(), // 5 minutes ago
      isRead: false,
      senderType: 'system',
      relatedEntityId: 'order-789',
      relatedEntityType: 'order',
      actionUrl: '/restaurant/orders/order-789'
    });
    
    // Message notification
    notifications.push({
      id: uuidv4(),
      recipientId: userId,
      senderId: 'customer-456',
      senderType: 'customer',
      type: 'message',
      title: 'New Message from Nattapong S.',
      content: 'Please make sure the food is not too spicy.',
      timestamp: new Date(currentTime.getTime() - 15 * 60000).toISOString(), // 15 minutes ago
      isRead: true,
      relatedEntityId: 'thread-456',
      relatedEntityType: 'message_thread',
      actionUrl: '/messages/thread-456'
    });
    
    // System notification
    notifications.push({
      id: uuidv4(),
      recipientId: userId,
      type: 'system',
      title: 'Menu Update Reminder',
      content: 'Don\'t forget to update your menu for the upcoming weekend.',
      timestamp: new Date(currentTime.getTime() - 1 * 60 * 60000).toISOString(), // 1 hour ago
      isRead: false,
      senderType: 'system',
      actionUrl: '/restaurant/menu'
    });
  } else if (userType === 'rider') {
    // New delivery notification
    notifications.push({
      id: uuidv4(),
      recipientId: userId,
      type: 'order_update',
      title: 'New Delivery Available',
      content: 'There\'s a new delivery available in your area.',
      timestamp: new Date(currentTime.getTime() - 2 * 60000).toISOString(), // 2 minutes ago
      isRead: false,
      senderType: 'system',
      relatedEntityId: 'order-101',
      relatedEntityType: 'order',
      actionUrl: '/rider/deliveries/order-101'
    });
    
    // Message notification
    notifications.push({
      id: uuidv4(),
      recipientId: userId,
      senderId: 'customer-789',
      senderType: 'customer',
      type: 'message',
      title: 'New Message from Supaporn P.',
      content: 'Please leave the food at the door. Thank you!',
      timestamp: new Date(currentTime.getTime() - 20 * 60000).toISOString(), // 20 minutes ago
      isRead: true,
      relatedEntityId: 'thread-789',
      relatedEntityType: 'message_thread',
      actionUrl: '/messages/thread-789'
    });
    
    // System notification
    notifications.push({
      id: uuidv4(),
      recipientId: userId,
      type: 'system',
      title: 'Earnings Update',
      content: 'Your weekly earnings have been calculated. You earned ฿2,450 this week!',
      timestamp: new Date(currentTime.getTime() - 12 * 60 * 60000).toISOString(), // 12 hours ago
      isRead: false,
      senderType: 'system',
      actionUrl: '/rider/earnings'
    });
  }
  
  // Add common system notification
  notifications.push({
    id: uuidv4(),
    recipientId: userId,
    type: 'system',
    title: 'App Update Available',
    content: 'A new version of the app is available with improved features.',
    timestamp: new Date(currentTime.getTime() - 24 * 60 * 60000).toISOString(), // 24 hours ago
    isRead: true,
    senderType: 'system'
  });
  
  // Save all notifications to storage
  const existingNotifications = getNotificationsFromStorage();
  saveNotificationsToStorage([...existingNotifications, ...notifications]);
};

