// src/hooks/useLocalRiderOrders.ts
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Order } from './useLocalOrders';

// Local storage keys
const ORDERS_STORAGE_KEY = 'quick-wheel-orders';
const CURRENT_USER_KEY = 'quick-wheel-current-user';

// Get current user
const getCurrentUser = () => {
  const storedUser = localStorage.getItem(CURRENT_USER_KEY);
  return storedUser ? JSON.parse(storedUser) : null;
};

export const useLocalRiderOrders = () => {
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  const fetchOrders = () => {
    try {
      const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (!storedOrders) {
        setLoading(false);
        return;
      }
      
      const allOrders: Order[] = JSON.parse(storedOrders);
      
      // Filter available orders (pending status, no rider assigned)
      const available = allOrders.filter(order => 
        order.status === 'pending' && !order.rider_id
      );
      
      // Find active order for this rider
      const active = allOrders.find(order => 
        order.rider_id === currentUser?.id && 
        ['accepted', 'picked_up'].includes(order.status)
      ) || null;
      
      setAvailableOrders(available);
      setActiveOrder(active);
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

  useEffect(() => {
    fetchOrders();
    
    // Set up event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ORDERS_STORAGE_KEY) {
        fetchOrders();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const acceptOrder = async (orderId: string) => {
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Get existing orders
      const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (!storedOrders) {
        throw new Error('No orders found');
      }
      
      const allOrders: Order[] = JSON.parse(storedOrders);
      
      // Find and update the order
      const updatedOrders = allOrders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            status: 'accepted',
            rider_id: currentUser.id,
            updated_at: new Date().toISOString()
          };
        }
        return order;
      });
      
      // Save to local storage
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
      
      // Trigger storage event for other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: ORDERS_STORAGE_KEY,
        newValue: JSON.stringify(updatedOrders)
      }));
      
      // Update local state
      fetchOrders();
      
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
      // Get existing orders
      const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (!storedOrders) {
        throw new Error('No orders found');
      }
      
      const allOrders: Order[] = JSON.parse(storedOrders);
      
      // Find and update the order
      const updatedOrders = allOrders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            status,
            updated_at: new Date().toISOString()
          };
        }
        return order;
      });
      
      // Save to local storage
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
      
      // Trigger storage event for other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: ORDERS_STORAGE_KEY,
        newValue: JSON.stringify(updatedOrders)
      }));
      
      // Update local state
      fetchOrders();
      
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

  return {
    availableOrders,
    activeOrder,
    loading,
    acceptOrder,
    updateOrderStatus,
    refetch: fetchOrders
  };
};

