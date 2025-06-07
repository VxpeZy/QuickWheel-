// src/utils/messagingService.ts
import { v4 as uuidv4 } from 'uuid';
import { generateMessageNotification } from './notificationService';

// Message Types
export type UserType = 'customer' | 'restaurant' | 'rider' | 'support' | 'system';

// Message Model
export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderType: UserType;
  senderName: string;
  recipientId: string;
  recipientType: UserType;
  recipientName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
  }>;
}

// Message Thread Model
export interface MessageThread {
  id: string;
  participants: Array<{
    id: string;
    type: UserType;
    name: string;
  }>;
  subject?: string;
  lastMessageTimestamp: string;
  lastMessagePreview: string;
  lastMessageSenderId: string;
  unreadCount: number;
  relatedEntityId?: string;
  relatedEntityType?: 'order';
}

// Local Storage Keys
const MESSAGES_STORAGE_KEY = 'quick-wheel-messages';
const THREADS_STORAGE_KEY = 'quick-wheel-message-threads';

// Helper Functions
const getMessagesFromStorage = (): Message[] => {
  try {
    const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
    return storedMessages ? JSON.parse(storedMessages) : [];
  } catch (error) {
    console.error('Error retrieving messages from storage:', error);
    return [];
  }
};

const saveMessagesToStorage = (messages: Message[]): void => {
  try {
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    
    // Dispatch storage event to notify other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: MESSAGES_STORAGE_KEY,
      newValue: JSON.stringify(messages)
    }));
  } catch (error) {
    console.error('Error saving messages to storage:', error);
  }
};

const getThreadsFromStorage = (): MessageThread[] => {
  try {
    const storedThreads = localStorage.getItem(THREADS_STORAGE_KEY);
    return storedThreads ? JSON.parse(storedThreads) : [];
  } catch (error) {
    console.error('Error retrieving message threads from storage:', error);
    return [];
  }
};

const saveThreadsToStorage = (threads: MessageThread[]): void => {
  try {
    localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads));
    
    // Dispatch storage event to notify other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: THREADS_STORAGE_KEY,
      newValue: JSON.stringify(threads)
    }));
  } catch (error) {
    console.error('Error saving message threads to storage:', error);
  }
};

// Messaging Service Functions
export const createMessageThread = (
  participants: Array<{
    id: string;
    type: UserType;
    name: string;
  }>,
  options?: {
    subject?: string;
    relatedEntityId?: string;
    relatedEntityType?: 'order';
  }
): MessageThread => {
  const thread: MessageThread = {
    id: uuidv4(),
    participants,
    subject: options?.subject,
    lastMessageTimestamp: new Date().toISOString(),
    lastMessagePreview: 'No messages yet',
    lastMessageSenderId: '',
    unreadCount: 0,
    relatedEntityId: options?.relatedEntityId,
    relatedEntityType: options?.relatedEntityType
  };
  
  const threads = getThreadsFromStorage();
  threads.push(thread);
  saveThreadsToStorage(threads);
  
  return thread;
};

export const getMessageThreads = (userId: string): MessageThread[] => {
  const threads = getThreadsFromStorage();
  return threads
    .filter(thread => thread.participants.some(participant => participant.id === userId))
    .sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
};

export const getMessageThread = (threadId: string): MessageThread | undefined => {
  const threads = getThreadsFromStorage();
  return threads.find(thread => thread.id === threadId);
};

export const getUnreadThreadCount = (userId: string): number => {
  const threads = getThreadsFromStorage();
  return threads
    .filter(thread => 
      thread.participants.some(participant => participant.id === userId) && 
      thread.unreadCount > 0 &&
      thread.lastMessageSenderId !== userId
    )
    .reduce((total, thread) => total + thread.unreadCount, 0);
};

export const sendMessage = (
  threadId: string,
  senderId: string,
  senderType: UserType,
  senderName: string,
  content: string,
  options?: {
    attachments?: Array<{
      type: 'image' | 'file';
      url: string;
      name: string;
    }>;
  }
): Message | null => {
  // Get the thread
  const threads = getThreadsFromStorage();
  const threadIndex = threads.findIndex(thread => thread.id === threadId);
  
  if (threadIndex === -1) {
    console.error(`Thread with ID ${threadId} not found`);
    return null;
  }
  
  const thread = threads[threadIndex];
  
  // Create the message
  const message: Message = {
    id: uuidv4(),
    threadId,
    senderId,
    senderType,
    senderName,
    recipientId: thread.participants.find(p => p.id !== senderId)?.id || '',
    recipientType: thread.participants.find(p => p.id !== senderId)?.type as UserType,
    recipientName: thread.participants.find(p => p.id !== senderId)?.name || '',
    content,
    timestamp: new Date().toISOString(),
    isRead: false,
    attachments: options?.attachments
  };
  
  // Save the message
  const messages = getMessagesFromStorage();
  messages.push(message);
  saveMessagesToStorage(messages);
  
  // Update the thread
  const updatedThread: MessageThread = {
    ...thread,
    lastMessageTimestamp: message.timestamp,
    lastMessagePreview: content.length > 50 ? `${content.substring(0, 47)}...` : content,
    lastMessageSenderId: senderId,
    unreadCount: thread.unreadCount + 1
  };
  
  threads[threadIndex] = updatedThread;
  saveThreadsToStorage(threads);
  
  // Generate notification for recipient
  const recipient = thread.participants.find(p => p.id !== senderId);
  if (recipient) {
    generateMessageNotification(
      recipient.id,
      senderId,
      senderType as 'customer' | 'restaurant' | 'rider',
      senderName,
      content.length > 50 ? `${content.substring(0, 47)}...` : content,
      threadId
    );
  }
  
  return message;
};

export const getMessages = (threadId: string): Message[] => {
  const messages = getMessagesFromStorage();
  return messages
    .filter(message => message.threadId === threadId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const markThreadAsRead = (threadId: string, userId: string): void => {
  // Mark all messages in the thread as read
  const messages = getMessagesFromStorage();
  const updatedMessages = messages.map(message => 
    message.threadId === threadId && message.recipientId === userId
      ? { ...message, isRead: true }
      : message
  );
  saveMessagesToStorage(updatedMessages);
  
  // Update the thread unread count
  const threads = getThreadsFromStorage();
  const threadIndex = threads.findIndex(thread => thread.id === threadId);
  
  if (threadIndex !== -1) {
    const thread = threads[threadIndex];
    
    // Only reset unread count if the last message was not sent by the current user
    if (thread.lastMessageSenderId !== userId) {
      threads[threadIndex] = {
        ...thread,
        unreadCount: 0
      };
      saveThreadsToStorage(threads);
    }
  }
};

export const deleteThread = (threadId: string): void => {
  // Delete all messages in the thread
  const messages = getMessagesFromStorage();
  const updatedMessages = messages.filter(message => message.threadId !== threadId);
  saveMessagesToStorage(updatedMessages);
  
  // Delete the thread
  const threads = getThreadsFromStorage();
  const updatedThreads = threads.filter(thread => thread.id !== threadId);
  saveThreadsToStorage(updatedThreads);
};

// Sample Data Generator
export const generateSampleMessageThreads = (userId: string, userType: UserType): void => {
  // Clear existing messages and threads
  localStorage.removeItem(MESSAGES_STORAGE_KEY);
  localStorage.removeItem(THREADS_STORAGE_KEY);
  
  const threads: MessageThread[] = [];
  const messages: Message[] = [];
  const currentTime = new Date();
  
  // Generate sample threads and messages based on user type
  if (userType === 'customer') {
    // Thread with a restaurant
    const restaurantThreadId = uuidv4();
    threads.push({
      id: restaurantThreadId,
      participants: [
        { id: userId, type: 'customer', name: 'Somchai T.' },
        { id: 'restaurant-123', type: 'restaurant', name: 'Bangkok Bistro' }
      ],
      subject: 'Order #12345',
      lastMessageTimestamp: new Date(currentTime.getTime() - 30 * 60000).toISOString(), // 30 minutes ago
      lastMessagePreview: 'Your order is being prepared and will be ready soon.',
      lastMessageSenderId: 'restaurant-123',
      unreadCount: 1,
      relatedEntityId: 'order-12345',
      relatedEntityType: 'order'
    });
    
    messages.push({
      id: uuidv4(),
      threadId: restaurantThreadId,
      senderId: userId,
      senderType: 'customer',
      senderName: 'Somchai T.',
      recipientId: 'restaurant-123',
      recipientType: 'restaurant',
      recipientName: 'Bangkok Bistro',
      content: 'Hi, I would like to add extra chili to my Pad Thai, please.',
      timestamp: new Date(currentTime.getTime() - 45 * 60000).toISOString(), // 45 minutes ago
      isRead: true
    });
    
    messages.push({
      id: uuidv4(),
      threadId: restaurantThreadId,
      senderId: 'restaurant-123',
      senderType: 'restaurant',
      senderName: 'Bangkok Bistro',
      recipientId: userId,
      recipientType: 'customer',
      recipientName: 'Somchai T.',
      content: 'Sure, we will add extra chili to your Pad Thai.',
      timestamp: new Date(currentTime.getTime() - 40 * 60000).toISOString(), // 40 minutes ago
      isRead: true
    });
    
    messages.push({
      id: uuidv4(),
      threadId: restaurantThreadId,
      senderId: 'restaurant-123',
      senderType: 'restaurant',
      senderName: 'Bangkok Bistro',
      recipientId: userId,
      recipientType: 'customer',
      recipientName: 'Somchai T.',
      content: 'Your order is being prepared and will be ready soon.',
      timestamp: new Date(currentTime.getTime() - 30 * 60000).toISOString(), // 30 minutes ago
      isRead: false
    });
    
    // Thread with a rider
    const riderThreadId = uuidv4();
    threads.push({
      id: riderThreadId,
      participants: [
        { id: userId, type: 'customer', name: 'Somchai T.' },
        { id: 'rider-456', type: 'rider', name: 'Sompong K.' }
      ],
      subject: 'Delivery for Order #12345',
      lastMessageTimestamp: new Date(currentTime.getTime() - 5 * 60000).toISOString(), // 5 minutes ago
      lastMessagePreview: 'I\'m at the entrance of your building. Could you please come down?',
      lastMessageSenderId: 'rider-456',
      unreadCount: 1,
      relatedEntityId: 'order-12345',
      relatedEntityType: 'order'
    });
    
    messages.push({
      id: uuidv4(),
      threadId: riderThreadId,
      senderId: 'rider-456',
      senderType: 'rider',
      senderName: 'Sompong K.',
      recipientId: userId,
      recipientType: 'customer',
      recipientName: 'Somchai T.',
      content: 'Hello, I\'m on my way with your order from Bangkok Bistro.',
      timestamp: new Date(currentTime.getTime() - 15 * 60000).toISOString(), // 15 minutes ago
      isRead: true
    });
    
    messages.push({
      id: uuidv4(),
      threadId: riderThreadId,
      senderId: userId,
      senderType: 'customer',
      senderName: 'Somchai T.',
      recipientId: 'rider-456',
      recipientType: 'rider',
      recipientName: 'Sompong K.',
      content: 'Great! My address is 123 Sukhumvit Road, Apartment 5B.',
      timestamp: new Date(currentTime.getTime() - 10 * 60000).toISOString(), // 10 minutes ago
      isRead: true
    });
    
    messages.push({
      id: uuidv4(),
      threadId: riderThreadId,
      senderId: 'rider-456',
      senderType: 'rider',
      senderName: 'Sompong K.',
      recipientId: userId,
      recipientType: 'customer',
      recipientName: 'Somchai T.',
      content: 'I\'m at the entrance of your building. Could you please come down?',
      timestamp: new Date(currentTime.getTime() - 5 * 60000).toISOString(), // 5 minutes ago
      isRead: false
    });
  } else if (userType === 'restaurant') {
    // Thread with a customer
    const customerThreadId = uuidv4();
    threads.push({
      id: customerThreadId,
      participants: [
        { id: userId, type: 'restaurant', name: 'Bangkok Bistro' },
        { id: 'customer-789', type: 'customer', name: 'Nattapong S.' }
      ],
      subject: 'Order #67890',
      lastMessageTimestamp: new Date(currentTime.getTime() - 15 * 60000).toISOString(), // 15 minutes ago
      lastMessagePreview: 'Please make sure the food is not too spicy.',
      lastMessageSenderId: 'customer-789',
      unreadCount: 1,
      relatedEntityId: 'order-67890',
      relatedEntityType: 'order'
    });
    
    messages.push({
      id: uuidv4(),
      threadId: customerThreadId,
      senderId: 'customer-789',
      senderType: 'customer',
      senderName: 'Nattapong S.',
      recipientId: userId,
      recipientType: 'restaurant',
      recipientName: 'Bangkok Bistro',
      content: 'Hi, I just placed an order for Green Curry and Pad Thai.',
      timestamp: new Date(currentTime.getTime() - 25 * 60000).toISOString(), // 25 minutes ago
      isRead: true
    });
    
    messages.push({
      id: uuidv4(),
      threadId: customerThreadId,
      senderId: userId,
      senderType: 'restaurant',
      senderName: 'Bangkok Bistro',
      recipientId: 'customer-789',
      recipientType: 'customer',
      recipientName: 'Nattapong S.',
      content: 'Thank you for your order! We\'ll start preparing it right away.',
      timestamp: new Date(currentTime.getTime() - 20 * 60000).toISOString(), // 20 minutes ago
      isRead: true
    });
    
    messages.push({
      id: uuidv4(),
      threadId: customerThreadId,
      senderId: 'customer-789',
      senderType: 'customer',
      senderName: 'Nattapong S.',
      recipientId: userId,
      recipientType: 'restaurant',
      recipientName: 'Bangkok Bistro',
      content: 'Please make sure the food is not too spicy.',
      timestamp: new Date(currentTime.getTime() - 15 * 60000).toISOString(), // 15 minutes ago
      isRead: false
    });
    
    // Thread with support
    const supportThreadId = uuidv4();
    threads.push({
      id: supportThreadId,
      participants: [
        { id: userId, type: 'restaurant', name: 'Bangkok Bistro' },
        { id: 'support-123', type: 'support', name: 'Quick Wheel Support' }
      ],
      subject: 'Menu Update Help',
      lastMessageTimestamp: new Date(currentTime.getTime() - 2 * 60 * 60000).toISOString(), // 2 hours ago
      lastMessagePreview: 'Thank you for your help!',
      lastMessageSenderId: userId,
      unreadCount: 0
    });
    
    messages.push({
      id: uuidv4(),
      threadId: supportThreadId,
      senderId: userId,
      senderType: 'restaurant',
      senderName: 'Bangkok Bistro',
      recipientId: 'support-123',
      recipientType: 'support',
      recipientName: 'Quick Wheel Support',
      content: 'Hello, I need help updating our menu. How can I add new items?',
      timestamp: new Date(currentTime.getTime() - 3 * 60 * 60000).toISOString(), // 3 hours ago
      isRead: true
    });
    
    messages.push({
      id: uuidv4(),
      threadId: supportThreadId,
      senderId: 'support-123',
      senderType: 'support',
      senderName: 'Quick Wheel Support',
      recipientId: userId,
      recipientType: 'restaurant',
      recipientName: 'Bangkok Bistro',
      content: 'Hi there! To add new menu items, go to the Restaurant Dashboard, click on "Menu Management", and then click the "Add New Item" button. You can then fill in the details for your new menu item.',
      timestamp: new Date(currentTime.getTime() - 2.5 * 60 * 60000).toISOString(), // 2.5 hours ago
      isRead: true
    });
    
    messages.push({
      id: uuidv4(),
      threadId: supportThreadId,
      senderId: userId,
      senderType: 'restaurant',
      senderName: 'Bangkok Bistro',
      recipientId: 'support-123',
      recipientType: 'support',
      recipientName: 'Quick Wheel Support',
      content: 'Thank you for your help!',
      timestamp: new Date(currentTime.getTime() - 2 * 60 * 60000).toISOString(), // 2 hours ago
      isRead: true
    });
  } else if (userType === 'rider') {
    // Thread with a customer
    const customerThreadId = uuidv4();
    threads.push({
      id: customerThreadId,
      participants: [
        { id: userId, type: 'rider', name: 'Sompong K.' },
        { id: 'customer-101', type: 'customer', name: 'Supaporn P.' }
      ],
      subject: 'Delivery for Order #54321',
      lastMessageTimestamp: new Date(currentTime.getTime() - 20 * 60000).toISOString(), // 20 minutes ago
      lastMessagePreview: 'Please leave the food at the door. Thank you!',
      lastMessageSenderId: 'customer-101',
      unreadCount: 1,
      relatedEntityId: 'order-54321',
      relatedEntityType: 'order'
    });
    
    messages.push({
      id: uuidv4(),
      threadId: customerThreadId,
      senderId: userId,
      senderType: 'rider',
      senderName: 'Sompong K.',
      recipientId: 'customer-101',
      recipientType: 'customer',
      recipientName: 'Supaporn P.',
      content: 'Hello, I\'m picking up your order from Thai Spice Kitchen now.',
      timestamp: new Date(currentTime.getTime() - 30 * 60000).toISOString(), // 30 minutes ago
      isRead: true
    });
    
    messages.push({
      id: uuidv4(),
      threadId: customerThreadId,
      senderId: 'customer-101',
      senderType: 'customer',
      senderName: 'Supaporn P.',
      recipientId: userId,
      recipientType: 'rider',
      recipientName: 'Sompong K.',
      content: 'Great! My address is 456 Silom Road, House 10.',
      timestamp: new Date(currentTime.getTime() - 25 * 60000).toISOString(), // 25 minutes ago
      isRead: true
    });
    
    messages.push({
      id: uuidv4(),
      threadId: customerThreadId,
      senderId: 'customer-101',
      senderType: 'customer',
      senderName: 'Supaporn P.',
      recipientId: userId,
      recipientType: 'rider',
      recipientName: 'Sompong K.',
      content: 'Please leave the food at the door. Thank you!',
      timestamp: new Date(currentTime.getTime() - 20 * 60000).toISOString(), // 20 minutes ago
      isRead: false
    });
    
    // Thread with support
    const supportThreadId = uuidv4();
    threads.push({
      id: supportThreadId,
      participants: [
        { id: userId, type: 'rider', name: 'Sompong K.' },
        { id: 'support-456', type: 'support', name: 'Quick Wheel Support' }
      ],
      subject: 'Payment Issue',
      lastMessageTimestamp: new Date(currentTime.getTime() - 1 * 60 * 60000).toISOString(), // 1 hour ago
      lastMessagePreview: 'We\'ve resolved the issue with your payment. The funds should be in your account within 24 hours.',
      lastMessageSenderId: 'support-456',
      unreadCount: 1
    });
    
    messages.push({
      id: uuidv4(),
      threadId: supportThreadId,
      senderId: userId,
      senderType: 'rider',
      senderName: 'Sompong K.',
      recipientId: 'support-456',
      recipientType: 'support',
      recipientName: 'Quick Wheel Support',
      content: 'Hello, I haven\'t received my payment for yesterday\'s deliveries. Can you help?',
      timestamp: new Date(currentTime.getTime() - 2 * 60 * 60000).toISOString(), // 2 hours ago
      isRead: true
    });
    
    messages.push({
      id: uuidv4(),
      threadId: supportThreadId,
      senderId: 'support-456',
      senderType: 'support',
      senderName: 'Quick Wheel Support',
      recipientId: userId,
      recipientType: 'rider',
      recipientName: 'Sompong K.',
      content: 'Hi Sompong, I\'m looking into this issue for you. Can you please confirm which deliveries you\'re missing payment for?',
      timestamp: new Date(currentTime.getTime() - 1.5 * 60 * 60000).toISOString(), // 1.5 hours ago
      isRead: true
    });
    
    messages.push({
      id: uuidv4(),
      threadId: supportThreadId,
      senderId: userId,
      senderType: 'rider',
      senderName: 'Sompong K.',
      recipientId: 'support-456',
      recipientType: 'support',
      recipientName: 'Quick Wheel Support',
      content: 'I\'m missing payments for orders #54321, #54322, and #54323 from yesterday.',
      timestamp: new Date(currentTime.getTime() - 1.2 * 60 * 60000).toISOString(), // 1.2 hours ago
      isRead: true
    });
    
    messages.push({
      id: uuidv4(),
      threadId: supportThreadId,
      senderId: 'support-456',
      senderType: 'support',
      senderName: 'Quick Wheel Support',
      recipientId: userId,
      recipientType: 'rider',
      recipientName: 'Sompong K.',
      content: 'We\'ve resolved the issue with your payment. The funds should be in your account within 24 hours.',
      timestamp: new Date(currentTime.getTime() - 1 * 60 * 60000).toISOString(), // 1 hour ago
      isRead: false
    });
  }
  
  // Save all threads and messages to storage
  saveThreadsToStorage(threads);
  saveMessagesToStorage(messages);
};

