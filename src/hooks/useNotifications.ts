// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Notification,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  generateSampleNotifications
} from '@/utils/notificationService';
import { shouldShowNotification } from '@/utils/notificationPreferencesService';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Load notifications
  const loadNotifications = useCallback(() => {
    if (!user?.id) return;
    
    setLoading(true);
    const userNotifications = getNotifications(user.id);
    
    // Filter notifications based on user preferences
    const filteredNotifications = userNotifications.filter(notification => 
      shouldShowNotification(user.id, notification.type, 'inApp')
    );
    
    setNotifications(filteredNotifications);
    setUnreadCount(getUnreadNotificationCount(user.id));
    setLoading(false);
  }, [user?.id]);

  // Initialize notifications
  useEffect(() => {
    if (!user?.id) return;
    
    // Generate sample notifications if none exist
    if (getNotifications(user.id).length === 0) {
      generateSampleNotifications(user.id, user.user_metadata?.role || 'customer');
    }
    
    loadNotifications();
    
    // Listen for storage events (for cross-tab updates)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'quick-wheel-notifications') {
        loadNotifications();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user?.id, loadNotifications]);

  // Mark a notification as read
  const markAsRead = useCallback((notificationId: string) => {
    if (!user?.id) return;
    
    markNotificationAsRead(notificationId);
    loadNotifications();
  }, [user?.id, loadNotifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    if (!user?.id) return;
    
    markAllNotificationsAsRead(user.id);
    loadNotifications();
  }, [user?.id, loadNotifications]);

  // Delete a notification
  const removeNotification = useCallback((notificationId: string) => {
    if (!user?.id) return;
    
    deleteNotification(notificationId);
    loadNotifications();
  }, [user?.id, loadNotifications]);

  // Clear all notifications
  const clearAll = useCallback(() => {
    if (!user?.id) return;
    
    clearAllNotifications(user.id);
    loadNotifications();
  }, [user?.id, loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    refresh: loadNotifications
  };
};

