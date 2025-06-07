// src/hooks/useMessaging.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  MessageThread,
  Message,
  getMessageThreads,
  getMessageThread,
  getMessages,
  sendMessage,
  markThreadAsRead,
  deleteThread,
  getUnreadThreadCount,
  generateSampleMessageThreads,
  UserType
} from '@/utils/messagingService';

export const useMessaging = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeThread, setActiveThread] = useState<MessageThread | null>(null);
  const [activeThreadMessages, setActiveThreadMessages] = useState<Message[]>([]);

  // Load message threads
  const loadThreads = useCallback(() => {
    if (!user?.id) return;
    
    setLoading(true);
    const userThreads = getMessageThreads(user.id);
    setThreads(userThreads);
    setUnreadCount(getUnreadThreadCount(user.id));
    setLoading(false);
  }, [user?.id]);

  // Initialize message threads
  useEffect(() => {
    if (!user?.id) return;
    
    // Generate sample message threads if none exist
    if (getMessageThreads(user.id).length === 0) {
      generateSampleMessageThreads(user.id, user.user_metadata?.role as UserType || 'customer');
    }
    
    loadThreads();
    
    // Listen for storage events (for cross-tab updates)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'quick-wheel-message-threads' || event.key === 'quick-wheel-messages') {
        loadThreads();
        
        // Reload active thread messages if there's an active thread
        if (activeThread) {
          setActiveThreadMessages(getMessages(activeThread.id));
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user?.id, loadThreads, activeThread]);

  // Load a specific thread and its messages
  const loadThread = useCallback((threadId: string) => {
    if (!user?.id) return;
    
    const thread = getMessageThread(threadId);
    if (thread) {
      setActiveThread(thread);
      setActiveThreadMessages(getMessages(threadId));
      
      // Mark thread as read when opened
      markThreadAsRead(threadId, user.id);
      loadThreads(); // Reload threads to update unread count
    }
  }, [user?.id, loadThreads]);

  // Send a message in the active thread
  const sendNewMessage = useCallback((content: string, attachments?: Array<{ type: 'image' | 'file', url: string, name: string }>) => {
    if (!user?.id || !activeThread) return null;
    
    const message = sendMessage(
      activeThread.id,
      user.id,
      user.user_metadata?.role as UserType || 'customer',
      user.user_metadata?.username || user.email || 'User',
      content,
      { attachments }
    );
    
    if (message) {
      // Reload active thread messages
      setActiveThreadMessages(getMessages(activeThread.id));
      loadThreads(); // Reload threads to update last message preview
    }
    
    return message;
  }, [user, activeThread, loadThreads]);

  // Create a new thread
  const createThread = useCallback((
    recipientId: string,
    recipientType: UserType,
    recipientName: string,
    initialMessage: string,
    options?: {
      subject?: string;
      relatedEntityId?: string;
      relatedEntityType?: 'order';
      attachments?: Array<{ type: 'image' | 'file', url: string, name: string }>;
    }
  ) => {
    if (!user?.id) return null;
    
    // Import here to avoid circular dependency
    const { createMessageThread } = require('@/utils/messagingService');
    
    const thread = createMessageThread(
      [
        { 
          id: user.id, 
          type: user.user_metadata?.role as UserType || 'customer',
          name: user.user_metadata?.username || user.email || 'User'
        },
        { id: recipientId, type: recipientType, name: recipientName }
      ],
      {
        subject: options?.subject,
        relatedEntityId: options?.relatedEntityId,
        relatedEntityType: options?.relatedEntityType
      }
    );
    
    // Send initial message
    const message = sendMessage(
      thread.id,
      user.id,
      user.user_metadata?.role as UserType || 'customer',
      user.user_metadata?.username || user.email || 'User',
      initialMessage,
      { attachments: options?.attachments }
    );
    
    loadThreads(); // Reload threads to include the new thread
    return { thread, message };
  }, [user, loadThreads]);

  // Mark a thread as read
  const markAsRead = useCallback((threadId: string) => {
    if (!user?.id) return;
    
    markThreadAsRead(threadId, user.id);
    loadThreads(); // Reload threads to update unread count
  }, [user?.id, loadThreads]);

  // Delete a thread
  const removeThread = useCallback((threadId: string) => {
    if (!user?.id) return;
    
    deleteThread(threadId);
    
    // If the active thread is deleted, clear it
    if (activeThread && activeThread.id === threadId) {
      setActiveThread(null);
      setActiveThreadMessages([]);
    }
    
    loadThreads(); // Reload threads to remove the deleted thread
  }, [user?.id, activeThread, loadThreads]);

  return {
    threads,
    unreadCount,
    loading,
    activeThread,
    activeThreadMessages,
    loadThread,
    sendMessage: sendNewMessage,
    createThread,
    markAsRead,
    removeThread,
    refresh: loadThreads
  };
};

