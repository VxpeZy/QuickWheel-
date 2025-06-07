// src/utils/notificationPreferencesService.ts
import { UserType } from './messagingService';

// Notification Preferences Model
export interface NotificationPreferences {
  userId: string;
  userType: 'customer' | 'restaurant' | 'rider';
  
  // Channel preferences
  inAppEnabled: boolean;
  browserEnabled: boolean;
  emailEnabled: boolean;
  
  // Notification type preferences
  orderUpdates: boolean;
  messages: boolean;
  promotions: boolean;
  systemUpdates: boolean;
}

// Local Storage Key
const PREFERENCES_STORAGE_KEY = 'quick-wheel-notification-preferences';

// Helper Functions
const getPreferencesFromStorage = (): NotificationPreferences[] => {
  try {
    const storedPreferences = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    return storedPreferences ? JSON.parse(storedPreferences) : [];
  } catch (error) {
    console.error('Error retrieving notification preferences from storage:', error);
    return [];
  }
};

const savePreferencesToStorage = (preferences: NotificationPreferences[]): void => {
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    
    // Dispatch storage event to notify other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: PREFERENCES_STORAGE_KEY,
      newValue: JSON.stringify(preferences)
    }));
  } catch (error) {
    console.error('Error saving notification preferences to storage:', error);
  }
};

// Notification Preferences Service Functions
export const getNotificationPreferences = (userId: string): NotificationPreferences | null => {
  const preferences = getPreferencesFromStorage();
  return preferences.find(pref => pref.userId === userId) || null;
};

export const createDefaultNotificationPreferences = (
  userId: string,
  userType: 'customer' | 'restaurant' | 'rider'
): NotificationPreferences => {
  const defaultPreferences: NotificationPreferences = {
    userId,
    userType,
    inAppEnabled: true,
    browserEnabled: true,
    emailEnabled: true,
    orderUpdates: true,
    messages: true,
    promotions: userType === 'customer', // Only enable promotions by default for customers
    systemUpdates: true
  };
  
  const preferences = getPreferencesFromStorage();
  const existingIndex = preferences.findIndex(pref => pref.userId === userId);
  
  if (existingIndex !== -1) {
    // Update existing preferences
    preferences[existingIndex] = defaultPreferences;
  } else {
    // Add new preferences
    preferences.push(defaultPreferences);
  }
  
  savePreferencesToStorage(preferences);
  return defaultPreferences;
};

export const updateNotificationPreferences = (
  userId: string,
  updates: Partial<Omit<NotificationPreferences, 'userId' | 'userType'>>
): NotificationPreferences | null => {
  const preferences = getPreferencesFromStorage();
  const existingIndex = preferences.findIndex(pref => pref.userId === userId);
  
  if (existingIndex === -1) {
    console.error(`Notification preferences for user ${userId} not found`);
    return null;
  }
  
  const updatedPreferences: NotificationPreferences = {
    ...preferences[existingIndex],
    ...updates
  };
  
  preferences[existingIndex] = updatedPreferences;
  savePreferencesToStorage(preferences);
  
  return updatedPreferences;
};

export const deleteNotificationPreferences = (userId: string): void => {
  const preferences = getPreferencesFromStorage();
  const updatedPreferences = preferences.filter(pref => pref.userId !== userId);
  savePreferencesToStorage(updatedPreferences);
};

// Check if a notification should be shown based on user preferences
export const shouldShowNotification = (
  userId: string,
  notificationType: 'order_update' | 'message' | 'promotion' | 'system',
  channel: 'inApp' | 'browser' | 'email'
): boolean => {
  const preferences = getNotificationPreferences(userId);
  
  // If no preferences are found, create default preferences
  if (!preferences) {
    return true; // Default to showing notifications if preferences don't exist
  }
  
  // Check channel preference
  const channelEnabled = preferences[`${channel}Enabled`];
  if (!channelEnabled) {
    return false;
  }
  
  // Check notification type preference
  switch (notificationType) {
    case 'order_update':
      return preferences.orderUpdates;
    case 'message':
      return preferences.messages;
    case 'promotion':
      return preferences.promotions;
    case 'system':
      return preferences.systemUpdates;
    default:
      return true;
  }
};

// Generate sample notification preferences
export const generateSampleNotificationPreferences = (
  userId: string,
  userType: 'customer' | 'restaurant' | 'rider'
): void => {
  // Create default preferences first
  const defaultPreferences = createDefaultNotificationPreferences(userId, userType);
  
  // Customize based on user type
  let customPreferences: Partial<NotificationPreferences> = {};
  
  if (userType === 'customer') {
    customPreferences = {
      // Most customers want all notifications
      inAppEnabled: true,
      browserEnabled: true,
      emailEnabled: true,
      orderUpdates: true,
      messages: true,
      promotions: true,
      systemUpdates: true
    };
  } else if (userType === 'restaurant') {
    customPreferences = {
      // Restaurants typically don't want promotions
      inAppEnabled: true,
      browserEnabled: true,
      emailEnabled: true,
      orderUpdates: true,
      messages: true,
      promotions: false,
      systemUpdates: true
    };
  } else if (userType === 'rider') {
    customPreferences = {
      // Riders typically want only essential notifications
      inAppEnabled: true,
      browserEnabled: true,
      emailEnabled: false, // Riders often prefer not to get emails
      orderUpdates: true,
      messages: true,
      promotions: false,
      systemUpdates: true
    };
  }
  
  // Update with custom preferences
  updateNotificationPreferences(userId, customPreferences);
};

