// src/hooks/useNotificationPreferences.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  NotificationPreferences,
  getNotificationPreferences,
  createDefaultNotificationPreferences,
  updateNotificationPreferences,
  generateSampleNotificationPreferences
} from '@/utils/notificationPreferencesService';

export const useNotificationPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load notification preferences
  const loadPreferences = useCallback(() => {
    if (!user?.id) return;
    
    setLoading(true);
    let userPreferences = getNotificationPreferences(user.id);
    
    // If no preferences exist, create default preferences
    if (!userPreferences) {
      userPreferences = createDefaultNotificationPreferences(
        user.id,
        user.user_metadata?.role || 'customer'
      );
    }
    
    setPreferences(userPreferences);
    setLoading(false);
  }, [user?.id]);

  // Initialize notification preferences
  useEffect(() => {
    if (!user?.id) return;
    
    // Generate sample notification preferences if none exist
    if (!getNotificationPreferences(user.id)) {
      generateSampleNotificationPreferences(
        user.id,
        user.user_metadata?.role || 'customer'
      );
    }
    
    loadPreferences();
    
    // Listen for storage events (for cross-tab updates)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'quick-wheel-notification-preferences') {
        loadPreferences();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user?.id, loadPreferences]);

  // Update notification preferences
  const updatePreferences = useCallback((
    updates: Partial<Omit<NotificationPreferences, 'userId' | 'userType'>>
  ) => {
    if (!user?.id) return null;
    
    const updatedPreferences = updateNotificationPreferences(user.id, updates);
    if (updatedPreferences) {
      setPreferences(updatedPreferences);
    }
    
    return updatedPreferences;
  }, [user?.id]);

  // Toggle a specific preference
  const togglePreference = useCallback((
    key: keyof Omit<NotificationPreferences, 'userId' | 'userType'>
  ) => {
    if (!user?.id || !preferences) return null;
    
    const updates = { [key]: !preferences[key] };
    return updatePreferences(updates);
  }, [user?.id, preferences, updatePreferences]);

  return {
    preferences,
    loading,
    updatePreferences,
    togglePreference,
    refresh: loadPreferences
  };
};

