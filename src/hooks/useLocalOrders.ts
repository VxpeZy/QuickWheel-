// src/hooks/useLocalOrders.ts
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export interface OrderItem {
  id: string;
  name: string;
  name_th: string;
  price: number;
  description: string;
  quantity: number;
}

export interface Order {
  id: string;
  customer_id: string | null;
  restaurant_id: string;
  restaurant_name: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: OrderItem[];
  total_amount: number;
  delivery_fee: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  rider_id?: string | null;
  estimated_delivery_time?: string;
  coordinates?: { lat: number; lng: number };
  created_at: string;
  updated_at: string;
}

// Local storage key
const ORDERS_STORAGE_KEY = 'quick-wheel-orders';
const CURRENT_USER_KEY = 'quick-wheel-current-user';

// Mock current user
const getCurrentUser = () => {
  const storedUser = localStorage.getItem(CURRENT_USER_KEY);
  if (storedUser) {
    return JSON.parse(storedUser);
  }
  
  // Create a mock user if none exists
  const mockUser = {
    id: uuidv4(),
    email: 'user@example.com',
    role: 'customer'
  };
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(mockUser));
  return mockUser;
};

export const useLocalOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  // Load orders from local storage
  const fetchOrders = () => {
    try {
      const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
        setOrders(parsedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
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
      if (e.key === ORDERS_STORAGE_KEY && e.newValue) {
        setOrders(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Create a new order
  const createOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'status' | 'customer_id'>) => {
    try {
      const now = new Date().toISOString();
      
      // Create new order
      const newOrder: Order = {
        ...orderData,
        id: uuidv4(),
        customer_id: currentUser.id,
        status: 'pending',
        created_at: now,
        updated_at: now
      };
      
      // Get existing orders
      const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      const existingOrders = storedOrders ? JSON.parse(storedOrders) : [];
      
      // Add new order
      const updatedOrders = [newOrder, ...existingOrders];
      
      // Save to local storage
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
      
      // Update state
      setOrders(updatedOrders);
      
      // Trigger storage event for other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: ORDERS_STORAGE_KEY,
        newValue: JSON.stringify(updatedOrders)
      }));
      
      toast({
        title: "Order Created!",
        description: "Your order has been placed successfully"
      });
      
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: Order['status'], riderId?: string) => {
    try {
      // Get existing orders
      const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (!storedOrders) {
        throw new Error('No orders found');
      }
      
      const existingOrders = JSON.parse(storedOrders);
      
      // Find and update the order
      const updatedOrders = existingOrders.map((order: Order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status,
            rider_id: riderId || order.rider_id,
            updated_at: new Date().toISOString()
          };
        }
        return order;
      });
      
      // Save to local storage
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
      
      // Update state
      setOrders(updatedOrders);
      
      // Trigger storage event for other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: ORDERS_STORAGE_KEY,
        newValue: JSON.stringify(updatedOrders)
      }));
      
      toast({
        title: "Order Updated",
        description: `Order status changed to ${status}`
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    refetch: fetchOrders
  };
};

