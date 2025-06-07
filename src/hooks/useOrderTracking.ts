// src/hooks/useOrderTracking.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Order } from './useOrders';

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

export const useOrderTracking = (orderId: string | undefined) => {
  const [trackingInfo, setTrackingInfo] = useState<OrderTrackingInfo>({
    currentStatus: 'pending',
    statusHistory: [],
    estimatedArrivalTime: null,
    isLoading: true
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderTrackingInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('order_tracking_status, order_tracking_history, estimated_arrival_time')
          .eq('id', orderId)
          .single();

        if (error) throw error;

        setTrackingInfo({
          currentStatus: data.order_tracking_status || 'pending',
          statusHistory: data.order_tracking_history || [],
          estimatedArrivalTime: data.estimated_arrival_time,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching order tracking info:', error);
        setTrackingInfo(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchOrderTrackingInfo();

    // Set up real-time subscription for order updates
    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          const { new: newData } = payload;
          
          // Update tracking info with new data
          setTrackingInfo({
            currentStatus: newData.order_tracking_status || newData.status,
            statusHistory: newData.order_tracking_history || [],
            estimatedArrivalTime: newData.estimated_arrival_time,
            isLoading: false
          });
          
          // Show toast notification for status update
          if (newData.order_tracking_status !== trackingInfo.currentStatus) {
            toast({
              title: "Order Status Updated",
              description: `Your order is now ${getStatusText(newData.order_tracking_status)}`
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const updateOrderStatus = async (newStatus: string) => {
    if (!orderId) return;

    try {
      // Call the Supabase function to update order status
      const { data, error } = await supabase.rpc('update_order_tracking_status', {
        order_id: orderId,
        new_status: newStatus
      });

      if (error) throw error;

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

  const estimateDeliveryTime = async (prepTimeMinutes: number, deliveryTimeMinutes: number) => {
    if (!orderId) return;

    try {
      const { data, error } = await supabase.rpc('estimate_delivery_time', {
        order_id: orderId,
        prep_time_minutes: prepTimeMinutes,
        delivery_time_minutes: deliveryTimeMinutes
      });

      if (error) throw error;

      toast({
        title: 'Delivery Time Estimated',
        description: `Estimated delivery time: ${new Date(data).toLocaleTimeString()}`,
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

  return {
    trackingInfo,
    updateOrderStatus,
    estimateDeliveryTime
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

