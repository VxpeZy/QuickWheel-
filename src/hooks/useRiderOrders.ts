import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Order } from './useOrders';

export const useRiderOrders = () => {
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Fetch available orders (pending status, no rider assigned)
      const { data: available, error: availableError } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'pending')
        .is('rider_id', null)
        .order('created_at', { ascending: true });

      if (availableError) throw availableError;

      // Fetch active order for this rider
      const { data: active, error: activeError } = await supabase
        .from('orders')
        .select('*')
        .eq('rider_id', user.user.id)
        .in('status', ['accepted', 'picked_up'])
        .single();

      if (activeError && activeError.code !== 'PGRST116') {
        throw activeError;
      }

      // Type cast the data to match our Order interface
      const typedAvailableOrders: Order[] = (available || []).map(order => ({
        ...order,
        items: Array.isArray(order.items) ? order.items : [],
        coordinates: order.coordinates as { lat: number; lng: number } | undefined,
        status: order.status as Order['status']
      }));

      const typedActiveOrder: Order | null = active ? {
        ...active,
        items: Array.isArray(active.items) ? active.items : [],
        coordinates: active.coordinates as { lat: number; lng: number } | undefined,
        status: active.status as Order['status']
      } : null;

      setAvailableOrders(typedAvailableOrders);
      setActiveOrder(typedActiveOrder);
    } catch (error) {
      console.error('Error fetching rider orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const acceptOrder = async (orderId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'accepted',
          rider_id: user.user.id
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Order Accepted!",
        description: "You have accepted the order"
      });
    } catch (error) {
      console.error('Error accepting order:', error);
      toast({
        title: "Error",
        description: "Failed to accept order",
        variant: "destructive"
      });
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Order marked as ${status}`
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up real-time subscription
    const channel = supabase
      .channel('rider-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Rider order change:', payload);
          fetchOrders(); // Refetch orders on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    availableOrders,
    activeOrder,
    loading,
    acceptOrder,
    updateOrderStatus,
    refetch: fetchOrders
  };
};
