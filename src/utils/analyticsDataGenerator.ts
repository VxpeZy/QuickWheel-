// src/utils/analyticsDataGenerator.ts
import { v4 as uuidv4 } from 'uuid';

// Types for analytics data
export interface OrderAnalytics {
  // Time dimensions
  date: string;                 // YYYY-MM-DD format
  hour: number;                 // 0-23
  dayOfWeek: number;            // 0-6 (Sunday to Saturday)
  
  // Order metrics
  orderId: string;
  restaurantId: string;
  customerId: string;
  riderId: string | null;
  
  // Financial metrics
  orderAmount: number;
  deliveryFee: number;
  totalAmount: number;
  
  // Time metrics
  orderPlacedTime: string;      // ISO timestamp
  orderAcceptedTime: string | null;
  preparationStartTime: string | null;
  preparationEndTime: string | null;
  pickupTime: string | null;
  deliveryTime: string | null;
  
  // Calculated time metrics
  acceptanceTimeMinutes: number | null;  // Time to accept order
  preparationTimeMinutes: number | null; // Time to prepare order
  deliveryTimeMinutes: number | null;    // Time to deliver after pickup
  totalTimeMinutes: number | null;       // Total order fulfillment time
  
  // Status metrics
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: 'promptpay';
  
  // Location data
  deliveryLocationLat: number | null;
  deliveryLocationLng: number | null;
  restaurantLocationLat: number | null;
  restaurantLocationLng: number | null;
  deliveryDistanceKm: number | null;
}

export interface RestaurantAnalytics {
  // Identification
  restaurantId: string;
  restaurantName: string;
  
  // Time dimensions
  date: string;                 // YYYY-MM-DD format
  hour: number;                 // 0-23
  dayOfWeek: number;            // 0-6 (Sunday to Saturday)
  
  // Order metrics
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  
  // Financial metrics
  totalRevenue: number;
  averageOrderValue: number;
  
  // Time metrics
  averagePreparationTimeMinutes: number;
  
  // Menu metrics
  topSellingItems: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    revenue: number;
  }>;
  
  // Customer metrics
  newCustomers: number;
  returningCustomers: number;
}

export interface RiderAnalytics {
  // Identification
  riderId: string;
  riderName: string;
  
  // Time dimensions
  date: string;                 // YYYY-MM-DD format
  hour: number;                 // 0-23
  dayOfWeek: number;            // 0-6 (Sunday to Saturday)
  
  // Delivery metrics
  totalDeliveries: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
  
  // Financial metrics
  totalEarnings: number;
  deliveryFees: number;
  tips: number;
  
  // Time metrics
  averageDeliveryTimeMinutes: number;
  totalActiveTimeHours: number;
  
  // Distance metrics
  totalDistanceKm: number;
  averageDeliveryDistanceKm: number;
  
  // Rating metrics
  averageRating: number;
  ratingCount: number;
}

export interface CustomerAnalytics {
  // Identification
  customerId: string;
  customerName: string;
  
  // Time dimensions
  date: string;                 // YYYY-MM-DD format
  
  // Order metrics
  totalOrders: number;
  
  // Financial metrics
  totalSpent: number;
  averageOrderValue: number;
  
  // Behavior metrics
  favoriteRestaurants: Array<{
    restaurantId: string;
    restaurantName: string;
    orderCount: number;
  }>;
  
  favoriteItems: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
  }>;
  
  // Time metrics
  mostFrequentOrderDays: Array<{
    dayOfWeek: number;
    orderCount: number;
  }>;
  
  mostFrequentOrderHours: Array<{
    hour: number;
    orderCount: number;
  }>;
}

// Sample data constants
const RESTAURANT_NAMES = [
  'Pad Thai Paradise', 'Bangkok Bistro', 'Chiang Mai Cuisine', 
  'Siam Street Food', 'Thai Spice Kitchen', 'Royal Thai Dining',
  'Phuket Plates', 'Mango Tree Thai', 'Golden Elephant', 'Basil & Chili'
];

const CUSTOMER_NAMES = [
  'Somchai T.', 'Nattapong S.', 'Supaporn P.', 'Kanokwan R.',
  'Thaksin C.', 'Malee W.', 'Apinya K.', 'Chatri L.',
  'Siriwan N.', 'Pichit B.', 'Pranee S.', 'Anong T.'
];

const RIDER_NAMES = [
  'Sompong K.', 'Rattana P.', 'Kittipong S.', 'Wichai T.',
  'Narong C.', 'Sumalee R.', 'Preecha N.', 'Boonmee L.'
];

const MENU_ITEMS = [
  { name: 'Pad Thai', name_th: 'ผัดไทย', price: 120 },
  { name: 'Green Curry', name_th: 'แกงเขียวหวาน', price: 150 },
  { name: 'Tom Yum Soup', name_th: 'ต้มยำกุ้ง', price: 180 },
  { name: 'Mango Sticky Rice', name_th: 'ข้าวเหนียวมะม่วง', price: 100 },
  { name: 'Papaya Salad', name_th: 'ส้มตำ', price: 90 },
  { name: 'Basil Chicken', name_th: 'ผัดกระเพราไก่', price: 120 },
  { name: 'Massaman Curry', name_th: 'แกงมัสมั่น', price: 160 },
  { name: 'Pineapple Fried Rice', name_th: 'ข้าวผัดสับปะรด', price: 140 },
  { name: 'Spring Rolls', name_th: 'ปอเปี๊ยะทอด', price: 80 },
  { name: 'Coconut Soup', name_th: 'ต้มข่าไก่', price: 130 }
];

// Helper functions
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomFloat = (min: number, max: number, decimals: number = 2): number => {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
};

const randomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60000);
};

// Generate sample entities
const generateRestaurants = (count: number): { id: string, name: string }[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: uuidv4(),
    name: RESTAURANT_NAMES[i % RESTAURANT_NAMES.length]
  }));
};

const generateCustomers = (count: number): { id: string, name: string }[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: uuidv4(),
    name: CUSTOMER_NAMES[i % CUSTOMER_NAMES.length]
  }));
};

const generateRiders = (count: number): { id: string, name: string }[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: uuidv4(),
    name: RIDER_NAMES[i % RIDER_NAMES.length]
  }));
};

const generateMenuItems = (count: number): { id: string, name: string, name_th: string, price: number }[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: uuidv4(),
    ...MENU_ITEMS[i % MENU_ITEMS.length]
  }));
};

// Generate sample order analytics data
export const generateOrderAnalytics = (count: number): OrderAnalytics[] => {
  const restaurants = generateRestaurants(10);
  const customers = generateCustomers(20);
  const riders = generateRiders(8);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30); // Last 30 days
  
  return Array.from({ length: count }, () => {
    // Generate random order date and time
    const orderDate = randomDate(startDate, endDate);
    const orderHour = orderDate.getHours();
    const orderDayOfWeek = orderDate.getDay();
    
    // Select random entities
    const restaurant = randomElement(restaurants);
    const customer = randomElement(customers);
    const assignRider = Math.random() > 0.1; // 90% of orders have riders
    const rider = assignRider ? randomElement(riders) : null;
    
    // Generate order financial data
    const orderAmount = randomFloat(100, 800);
    const deliveryFee = randomFloat(30, 80);
    const totalAmount = orderAmount + deliveryFee;
    
    // Generate order status
    const statusOptions: OrderAnalytics['status'][] = [
      'pending', 'accepted', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'
    ];
    const statusIndex = randomInt(0, statusOptions.length - 1);
    const status = statusOptions[statusIndex];
    
    // Generate payment status based on order status
    let paymentStatus: OrderAnalytics['paymentStatus'] = 'pending';
    if (status === 'cancelled') {
      paymentStatus = Math.random() > 0.5 ? 'failed' : 'pending';
    } else if (status === 'pending') {
      paymentStatus = 'pending';
    } else if (status === 'accepted' || status === 'preparing') {
      paymentStatus = Math.random() > 0.7 ? 'completed' : 'processing';
    } else {
      paymentStatus = Math.random() > 0.05 ? 'completed' : 'failed';
    }
    
    // Generate order time metrics
    const orderPlacedTime = orderDate.toISOString();
    
    let orderAcceptedTime: string | null = null;
    let preparationStartTime: string | null = null;
    let preparationEndTime: string | null = null;
    let pickupTime: string | null = null;
    let deliveryTime: string | null = null;
    
    // Calculate time metrics based on status
    if (statusIndex >= 1) { // accepted or later
      const acceptanceDelay = randomInt(1, 10);
      orderAcceptedTime = addMinutes(orderDate, acceptanceDelay).toISOString();
    }
    
    if (statusIndex >= 2) { // preparing or later
      const prepStartDelay = randomInt(1, 5);
      preparationStartTime = addMinutes(new Date(orderAcceptedTime!), prepStartDelay).toISOString();
    }
    
    if (statusIndex >= 3) { // ready or later
      const prepTime = randomInt(10, 30);
      preparationEndTime = addMinutes(new Date(preparationStartTime!), prepTime).toISOString();
    }
    
    if (statusIndex >= 4) { // picked_up or later
      const pickupDelay = randomInt(5, 15);
      pickupTime = addMinutes(new Date(preparationEndTime!), pickupDelay).toISOString();
    }
    
    if (statusIndex >= 5) { // delivered
      const deliveryTime = randomInt(10, 40);
      deliveryTime = addMinutes(new Date(pickupTime!), deliveryTime).toISOString();
    }
    
    // Calculate time differences
    const acceptanceTimeMinutes = orderAcceptedTime 
      ? Math.round((new Date(orderAcceptedTime).getTime() - new Date(orderPlacedTime).getTime()) / 60000) 
      : null;
      
    const preparationTimeMinutes = (preparationStartTime && preparationEndTime) 
      ? Math.round((new Date(preparationEndTime).getTime() - new Date(preparationStartTime).getTime()) / 60000) 
      : null;
      
    const deliveryTimeMinutes = (pickupTime && deliveryTime) 
      ? Math.round((new Date(deliveryTime).getTime() - new Date(pickupTime).getTime()) / 60000) 
      : null;
      
    const totalTimeMinutes = (orderPlacedTime && deliveryTime) 
      ? Math.round((new Date(deliveryTime).getTime() - new Date(orderPlacedTime).getTime()) / 60000) 
      : null;
    
    // Generate location data
    // Bangkok area coordinates
    const bangkokCenterLat = 13.7563;
    const bangkokCenterLng = 100.5018;
    
    const restaurantLocationLat = bangkokCenterLat + randomFloat(-0.05, 0.05, 6);
    const restaurantLocationLng = bangkokCenterLng + randomFloat(-0.05, 0.05, 6);
    
    const deliveryLocationLat = restaurantLocationLat + randomFloat(-0.03, 0.03, 6);
    const deliveryLocationLng = restaurantLocationLng + randomFloat(-0.03, 0.03, 6);
    
    // Calculate approximate distance in km (simplified)
    const deliveryDistanceKm = Math.sqrt(
      Math.pow((deliveryLocationLat - restaurantLocationLat) * 111, 2) +
      Math.pow((deliveryLocationLng - restaurantLocationLng) * 111 * Math.cos(deliveryLocationLat * Math.PI / 180), 2)
    );
    
    return {
      // Time dimensions
      date: formatDate(orderDate),
      hour: orderHour,
      dayOfWeek: orderDayOfWeek,
      
      // Order metrics
      orderId: uuidv4(),
      restaurantId: restaurant.id,
      customerId: customer.id,
      riderId: rider?.id || null,
      
      // Financial metrics
      orderAmount,
      deliveryFee,
      totalAmount,
      
      // Time metrics
      orderPlacedTime,
      orderAcceptedTime,
      preparationStartTime,
      preparationEndTime,
      pickupTime,
      deliveryTime,
      
      // Calculated time metrics
      acceptanceTimeMinutes,
      preparationTimeMinutes,
      deliveryTimeMinutes,
      totalTimeMinutes,
      
      // Status metrics
      status,
      paymentStatus,
      paymentMethod: 'promptpay',
      
      // Location data
      deliveryLocationLat,
      deliveryLocationLng,
      restaurantLocationLat,
      restaurantLocationLng,
      deliveryDistanceKm: parseFloat(deliveryDistanceKm.toFixed(2))
    };
  });
};

// Generate restaurant analytics by aggregating order data
export const generateRestaurantAnalytics = (orderData: OrderAnalytics[]): RestaurantAnalytics[] => {
  // Group orders by restaurant and date
  const restaurantDateMap = new Map<string, Map<string, OrderAnalytics[]>>();
  
  // Create a map of restaurant IDs to names
  const restaurantNames = new Map<string, string>();
  RESTAURANT_NAMES.forEach((name, index) => {
    const restaurantId = orderData.find(order => 
      order.restaurantId && RESTAURANT_NAMES.indexOf(name) === index % RESTAURANT_NAMES.length
    )?.restaurantId;
    
    if (restaurantId) {
      restaurantNames.set(restaurantId, name);
    }
  });
  
  // Group orders by restaurant and date
  orderData.forEach(order => {
    if (!restaurantDateMap.has(order.restaurantId)) {
      restaurantDateMap.set(order.restaurantId, new Map<string, OrderAnalytics[]>());
    }
    
    const dateMap = restaurantDateMap.get(order.restaurantId)!;
    if (!dateMap.has(order.date)) {
      dateMap.set(order.date, []);
    }
    
    dateMap.get(order.date)!.push(order);
  });
  
  // Generate analytics for each restaurant and date
  const restaurantAnalytics: RestaurantAnalytics[] = [];
  
  restaurantDateMap.forEach((dateMap, restaurantId) => {
    dateMap.forEach((orders, date) => {
      // Get restaurant name
      const restaurantName = restaurantNames.get(restaurantId) || 'Unknown Restaurant';
      
      // Calculate metrics
      const totalOrders = orders.length;
      const completedOrders = orders.filter(order => order.status === 'delivered').length;
      const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
      
      const totalRevenue = orders
        .filter(order => order.paymentStatus === 'completed')
        .reduce((sum, order) => sum + order.orderAmount, 0);
        
      const averageOrderValue = totalOrders > 0 
        ? totalRevenue / totalOrders 
        : 0;
      
      const preparationTimes = orders
        .filter(order => order.preparationTimeMinutes !== null)
        .map(order => order.preparationTimeMinutes!);
        
      const averagePreparationTimeMinutes = preparationTimes.length > 0 
        ? preparationTimes.reduce((sum, time) => sum + time, 0) / preparationTimes.length 
        : 0;
      
      // Generate top selling items (simulated)
      const menuItems = generateMenuItems(10);
      const topSellingItems = menuItems
        .slice(0, randomInt(3, 5))
        .map(item => ({
          itemId: item.id,
          itemName: item.name,
          quantity: randomInt(5, 30),
          revenue: randomInt(5, 30) * item.price
        }))
        .sort((a, b) => b.quantity - a.quantity);
      
      // Generate customer metrics
      const customerIds = new Set(orders.map(order => order.customerId));
      const newCustomers = Math.floor(customerIds.size * randomFloat(0.2, 0.4));
      const returningCustomers = customerIds.size - newCustomers;
      
      // Get a random hour and day for this date
      const hour = randomInt(0, 23);
      const dayOfWeek = new Date(date).getDay();
      
      restaurantAnalytics.push({
        restaurantId,
        restaurantName,
        date,
        hour,
        dayOfWeek,
        totalOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue,
        averageOrderValue,
        averagePreparationTimeMinutes,
        topSellingItems,
        newCustomers,
        returningCustomers
      });
    });
  });
  
  return restaurantAnalytics;
};

// Generate rider analytics by aggregating order data
export const generateRiderAnalytics = (orderData: OrderAnalytics[]): RiderAnalytics[] => {
  // Group orders by rider and date
  const riderDateMap = new Map<string, Map<string, OrderAnalytics[]>>();
  
  // Create a map of rider IDs to names
  const riderNames = new Map<string, string>();
  RIDER_NAMES.forEach((name, index) => {
    const riderId = orderData.find(order => 
      order.riderId && RIDER_NAMES.indexOf(name) === index % RIDER_NAMES.length
    )?.riderId;
    
    if (riderId) {
      riderNames.set(riderId, name);
    }
  });
  
  // Group orders by rider and date
  orderData.forEach(order => {
    if (!order.riderId) return;
    
    if (!riderDateMap.has(order.riderId)) {
      riderDateMap.set(order.riderId, new Map<string, OrderAnalytics[]>());
    }
    
    const dateMap = riderDateMap.get(order.riderId)!;
    if (!dateMap.has(order.date)) {
      dateMap.set(order.date, []);
    }
    
    dateMap.get(order.date)!.push(order);
  });
  
  // Generate analytics for each rider and date
  const riderAnalytics: RiderAnalytics[] = [];
  
  riderDateMap.forEach((dateMap, riderId) => {
    dateMap.forEach((orders, date) => {
      // Get rider name
      const riderName = riderNames.get(riderId) || 'Unknown Rider';
      
      // Calculate metrics
      const totalDeliveries = orders.length;
      const completedDeliveries = orders.filter(order => order.status === 'delivered').length;
      const cancelledDeliveries = orders.filter(order => order.status === 'cancelled').length;
      
      const deliveryFees = orders
        .filter(order => order.paymentStatus === 'completed')
        .reduce((sum, order) => sum + order.deliveryFee, 0);
        
      const tips = randomFloat(0, deliveryFees * 0.2); // Simulate tips as 0-20% of delivery fees
      const totalEarnings = deliveryFees + tips;
      
      const deliveryTimes = orders
        .filter(order => order.deliveryTimeMinutes !== null)
        .map(order => order.deliveryTimeMinutes!);
        
      const averageDeliveryTimeMinutes = deliveryTimes.length > 0 
        ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length 
        : 0;
      
      // Calculate active time (simulated)
      const totalActiveTimeHours = randomFloat(4, 8);
      
      // Calculate distance metrics
      const distances = orders
        .filter(order => order.deliveryDistanceKm !== null)
        .map(order => order.deliveryDistanceKm!);
        
      const totalDistanceKm = distances.reduce((sum, distance) => sum + distance, 0);
      const averageDeliveryDistanceKm = distances.length > 0 
        ? totalDistanceKm / distances.length 
        : 0;
      
      // Generate rating metrics
      const ratingCount = completedDeliveries;
      const averageRating = randomFloat(3.5, 5.0);
      
      // Get a random hour and day for this date
      const hour = randomInt(0, 23);
      const dayOfWeek = new Date(date).getDay();
      
      riderAnalytics.push({
        riderId,
        riderName,
        date,
        hour,
        dayOfWeek,
        totalDeliveries,
        completedDeliveries,
        cancelledDeliveries,
        totalEarnings,
        deliveryFees,
        tips,
        averageDeliveryTimeMinutes,
        totalActiveTimeHours,
        totalDistanceKm,
        averageDeliveryDistanceKm,
        averageRating,
        ratingCount
      });
    });
  });
  
  return riderAnalytics;
};

// Generate customer analytics by aggregating order data
export const generateCustomerAnalytics = (orderData: OrderAnalytics[]): CustomerAnalytics[] => {
  // Group orders by customer
  const customerMap = new Map<string, OrderAnalytics[]>();
  
  // Create a map of customer IDs to names
  const customerNames = new Map<string, string>();
  CUSTOMER_NAMES.forEach((name, index) => {
    const customerId = orderData.find(order => 
      order.customerId && CUSTOMER_NAMES.indexOf(name) === index % CUSTOMER_NAMES.length
    )?.customerId;
    
    if (customerId) {
      customerNames.set(customerId, name);
    }
  });
  
  // Group orders by customer
  orderData.forEach(order => {
    if (!customerMap.has(order.customerId)) {
      customerMap.set(order.customerId, []);
    }
    
    customerMap.get(order.customerId)!.push(order);
  });
  
  // Generate analytics for each customer
  const customerAnalytics: CustomerAnalytics[] = [];
  
  customerMap.forEach((orders, customerId) => {
    // Get customer name
    const customerName = customerNames.get(customerId) || 'Unknown Customer';
    
    // Get the most recent date
    const dates = orders.map(order => order.date);
    const latestDate = dates.sort().pop() || new Date().toISOString().split('T')[0];
    
    // Calculate metrics
    const totalOrders = orders.length;
    
    const totalSpent = orders
      .filter(order => order.paymentStatus === 'completed')
      .reduce((sum, order) => sum + order.totalAmount, 0);
      
    const averageOrderValue = totalOrders > 0 
      ? totalSpent / totalOrders 
      : 0;
    
    // Generate favorite restaurants
    const restaurantCounts = new Map<string, { id: string, name: string, count: number }>();
    
    orders.forEach(order => {
      if (!restaurantCounts.has(order.restaurantId)) {
        const restaurantName = RESTAURANT_NAMES[Math.floor(Math.random() * RESTAURANT_NAMES.length)];
        restaurantCounts.set(order.restaurantId, { 
          id: order.restaurantId, 
          name: restaurantName, 
          count: 0 
        });
      }
      
      restaurantCounts.get(order.restaurantId)!.count++;
    });
    
    const favoriteRestaurants = Array.from(restaurantCounts.values())
      .map(item => ({
        restaurantId: item.id,
        restaurantName: item.name,
        orderCount: item.count
      }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 3);
    
    // Generate favorite items (simulated)
    const menuItems = generateMenuItems(10);
    const favoriteItems = menuItems
      .slice(0, randomInt(3, 5))
      .map(item => ({
        itemId: item.id,
        itemName: item.name,
        quantity: randomInt(1, 10)
      }))
      .sort((a, b) => b.quantity - a.quantity);
    
    // Generate time metrics
    const dayOfWeekCounts = Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      orderCount: orders.filter(order => new Date(order.date).getDay() === i).length
    })).sort((a, b) => b.orderCount - a.orderCount);
    
    const hourCounts = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      orderCount: orders.filter(order => order.hour === i).length
    })).sort((a, b) => b.orderCount - a.orderCount);
    
    customerAnalytics.push({
      customerId,
      customerName,
      date: latestDate,
      totalOrders,
      totalSpent,
      averageOrderValue,
      favoriteRestaurants,
      favoriteItems,
      mostFrequentOrderDays: dayOfWeekCounts,
      mostFrequentOrderHours: hourCounts
    });
  });
  
  return customerAnalytics;
};

// Generate all analytics data
export const generateAllAnalyticsData = (orderCount: number = 500) => {
  const orderAnalytics = generateOrderAnalytics(orderCount);
  const restaurantAnalytics = generateRestaurantAnalytics(orderAnalytics);
  const riderAnalytics = generateRiderAnalytics(orderAnalytics);
  const customerAnalytics = generateCustomerAnalytics(orderAnalytics);
  
  return {
    orderAnalytics,
    restaurantAnalytics,
    riderAnalytics,
    customerAnalytics
  };
};

// Save analytics data to local storage
export const saveAnalyticsData = (data: ReturnType<typeof generateAllAnalyticsData>) => {
  localStorage.setItem('quick-wheel-order-analytics', JSON.stringify(data.orderAnalytics));
  localStorage.setItem('quick-wheel-restaurant-analytics', JSON.stringify(data.restaurantAnalytics));
  localStorage.setItem('quick-wheel-rider-analytics', JSON.stringify(data.riderAnalytics));
  localStorage.setItem('quick-wheel-customer-analytics', JSON.stringify(data.customerAnalytics));
};

// Load analytics data from local storage
export const loadAnalyticsData = () => {
  try {
    const orderAnalytics = JSON.parse(localStorage.getItem('quick-wheel-order-analytics') || '[]');
    const restaurantAnalytics = JSON.parse(localStorage.getItem('quick-wheel-restaurant-analytics') || '[]');
    const riderAnalytics = JSON.parse(localStorage.getItem('quick-wheel-rider-analytics') || '[]');
    const customerAnalytics = JSON.parse(localStorage.getItem('quick-wheel-customer-analytics') || '[]');
    
    return {
      orderAnalytics,
      restaurantAnalytics,
      riderAnalytics,
      customerAnalytics
    };
  } catch (error) {
    console.error('Error loading analytics data:', error);
    return {
      orderAnalytics: [],
      restaurantAnalytics: [],
      riderAnalytics: [],
      customerAnalytics: []
    };
  }
};

// Initialize analytics data if not exists
export const initializeAnalyticsData = (orderCount: number = 500) => {
  const existingData = loadAnalyticsData();
  
  if (
    existingData.orderAnalytics.length === 0 ||
    existingData.restaurantAnalytics.length === 0 ||
    existingData.riderAnalytics.length === 0 ||
    existingData.customerAnalytics.length === 0
  ) {
    const newData = generateAllAnalyticsData(orderCount);
    saveAnalyticsData(newData);
    return newData;
  }
  
  return existingData;
};

