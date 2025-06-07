// src/hooks/useLocalOrderTracking.ts
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface StatusUpdate {
  status: string;
  timestamp: string;
}

export interface OrderTrackingInfo {
  currentStatus: string;
  statusHistory: StatusUpdate[];
  estimatedArrivalTime: string | null;
  isLoading: boolean;
}

// Define the order status flow
const ORDER_STATUS_FLOW = [
  'pending',
  'accepted',
  'preparing',
  'ready_for_pickup',
  'rider_assigned',
  'picked_up',
  'on_the_way',
  'delivered'
];

// Local storage keys
const ORDERS_STORAGE_KEY = 'quick-wheel-orders';
const ORDER_TRACKING_KEY = 'quick-wheel-order-tracking';

export const useLocalOrderTracking = (orderId: string | undefined) => {
  const [trackingInfo, setTrackingInfo] = useState<OrderTrackingInfo>({
    currentStatus: 'pending',
    statusHistory: [],
    estimatedArrivalTime: null,
    isLoading: true
  });
  const { toast } = useToast();

  // Load tracking info from local storage
  useEffect(() => {
    if (!orderId) return;

    const loadTrackingInfo = () => {
      try {
        // Get tracking data from local storage
        const trackingData = localStorage.getItem(`${ORDER_TRACKING_KEY}-${orderId}`);
        
        if (trackingData) {
          const parsedData = JSON.parse(trackingData);
          setTrackingInfo({
            ...parsedData,
            isLoading: false
          });
        } else {
          // Initialize with default values if no data exists
          const initialStatus = 'pending';
          const initialHistory = [{
            status: initialStatus,
            timestamp: new Date().toISOString()
          }];
          
          const newTrackingInfo = {
            currentStatus: initialStatus,
            statusHistory: initialHistory,
            estimatedArrivalTime: null,
            isLoading: false
          };
          
          // Save to local storage
          localStorage.setItem(
            `${ORDER_TRACKING_KEY}-${orderId}`, 
            JSON.stringify(newTrackingInfo)
          );
          
          setTrackingInfo(newTrackingInfo);
        }
      } catch (error) {
        console.error('Error loading order tracking info:', error);
        setTrackingInfo(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadTrackingInfo();

    // Set up event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `${ORDER_TRACKING_KEY}-${orderId}` && e.newValue) {
        const newData = JSON.parse(e.newValue);
        
        setTrackingInfo({
          ...newData,
          isLoading: false
        });
        
        // Show toast notification for status update
        if (newData.currentStatus !== trackingInfo.currentStatus) {
          toast({
            title: "Order Status Updated",
            description: `Your order is now ${getStatusText(newData.currentStatus)}`
          });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [orderId]);

  // Update order status
  const updateOrderStatus = async (newStatus: string) => {
    if (!orderId) return false;

    try {
      // Get current tracking info
      const trackingData = localStorage.getItem(`${ORDER_TRACKING_KEY}-${orderId}`);
      const currentData = trackingData ? JSON.parse(trackingData) : {
        currentStatus: 'pending',
        statusHistory: [],
        estimatedArrivalTime: null
      };
      
      // Create new status update
      const statusUpdate = {
        status: newStatus,
        timestamp: new Date().toISOString()
      };
      
      // Update tracking info
      const updatedData = {
        currentStatus: newStatus,
        statusHistory: [...currentData.statusHistory, statusUpdate],
        estimatedArrivalTime: currentData.estimatedArrivalTime
      };
      
      // Save to local storage
      localStorage.setItem(
        `${ORDER_TRACKING_KEY}-${orderId}`, 
        JSON.stringify(updatedData)
      );
      
      // Update state
      setTrackingInfo({
        ...updatedData,
        isLoading: false
      });
      
      // Trigger storage event for other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: `${ORDER_TRACKING_KEY}-${orderId}`,
        newValue: JSON.stringify(updatedData)
      }));
      
      toast({
        title: 'Status Updated',
        description: `Order status updated to ${getStatusText(newStatus)}`,
      });

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Estimate delivery time
  const estimateDeliveryTime = async (prepTimeMinutes: number, deliveryTimeMinutes: number) => {
    if (!orderId) return false;

    try {
      // Calculate estimated arrival time
      const now = new Date();
      const estimatedArrival = new Date(
        now.getTime() + ((prepTimeMinutes + deliveryTimeMinutes) * 60 * 1000)
      );
      
      // Get current tracking info
      const trackingData = localStorage.getItem(`${ORDER_TRACKING_KEY}-${orderId}`);
      const currentData = trackingData ? JSON.parse(trackingData) : {
        currentStatus: 'pending',
        statusHistory: [],
        estimatedArrivalTime: null
      };
      
      // Update tracking info
      const updatedData = {
        ...currentData,
        estimatedArrivalTime: estimatedArrival.toISOString()
      };
      
      // Save to local storage
      localStorage.setItem(
        `${ORDER_TRACKING_KEY}-${orderId}`, 
        JSON.stringify(updatedData)
      );
      
      // Update state
      setTrackingInfo({
        ...updatedData,
        isLoading: false
      });
      
      // Trigger storage event for other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: `${ORDER_TRACKING_KEY}-${orderId}`,
        newValue: JSON.stringify(updatedData)
      }));
      
      toast({
        title: 'Delivery Time Estimated',
        description: `Estimated delivery time: ${estimatedArrival.toLocaleTimeString()}`,
      });

      return true;
    } catch (error) {
      console.error('Error estimating delivery time:', error);
      toast({
        title: 'Error',
        description: 'Failed to estimate delivery time',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Advance to next status (for demo purposes)
  const advanceToNextStatus = async () => {
    if (!orderId) return false;
    
    const currentIndex = ORDER_STATUS_FLOW.indexOf(trackingInfo.currentStatus);
    if (currentIndex < 0 || currentIndex >= ORDER_STATUS_FLOW.length - 1) {
      return false;
    }
    
    const nextStatus = ORDER_STATUS_FLOW[currentIndex + 1];
    return await updateOrderStatus(nextStatus);
  };

  return {
    trackingInfo,
    updateOrderStatus,
    estimateDeliveryTime,
    advanceToNextStatus
  };
};

// Helper function to convert status codes to human-readable text
export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Order Placed',
    'accepted': 'Order Accepted',
    'preparing': 'Preparing Food',
    'ready_for_pickup': 'Ready for Pickup',
    'rider_assigned': 'Rider Assigned',
    'picked_up': 'Order Picked Up',
    'on_the_way': 'On the Way to You',
    'delivered': 'Order Delivered',
    'cancelled': 'Order Cancelled'
  };
  
  return statusMap[status] || status;
}

