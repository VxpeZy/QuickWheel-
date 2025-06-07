// src/hooks/useAnalytics.ts
import { useState, useEffect } from 'react';
import { 
  OrderAnalytics, 
  RestaurantAnalytics, 
  RiderAnalytics, 
  CustomerAnalytics,
  initializeAnalyticsData,
  loadAnalyticsData
} from '@/utils/analyticsDataGenerator';

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  restaurantId?: string;
  riderId?: string;
  customerId?: string;
  status?: string;
  paymentStatus?: string;
}

export const useAnalytics = (initialFilters: AnalyticsFilters = {}) => {
  const [filters, setFilters] = useState<AnalyticsFilters>(initialFilters);
  const [orderAnalytics, setOrderAnalytics] = useState<OrderAnalytics[]>([]);
  const [restaurantAnalytics, setRestaurantAnalytics] = useState<RestaurantAnalytics[]>([]);
  const [riderAnalytics, setRiderAnalytics] = useState<RiderAnalytics[]>([]);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load analytics data
  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      try {
        // Initialize data if not exists
        const data = initializeAnalyticsData();
        
        setOrderAnalytics(data.orderAnalytics);
        setRestaurantAnalytics(data.restaurantAnalytics);
        setRiderAnalytics(data.riderAnalytics);
        setCustomerAnalytics(data.customerAnalytics);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply filters to get filtered data
  const getFilteredOrderAnalytics = (): OrderAnalytics[] => {
    return orderAnalytics.filter(order => {
      // Date range filter
      if (filters.startDate && order.date < filters.startDate) return false;
      if (filters.endDate && order.date > filters.endDate) return false;
      
      // Entity filters
      if (filters.restaurantId && order.restaurantId !== filters.restaurantId) return false;
      if (filters.riderId && order.riderId !== filters.riderId) return false;
      if (filters.customerId && order.customerId !== filters.customerId) return false;
      
      // Status filters
      if (filters.status && order.status !== filters.status) return false;
      if (filters.paymentStatus && order.paymentStatus !== filters.paymentStatus) return false;
      
      return true;
    });
  };

  const getFilteredRestaurantAnalytics = (): RestaurantAnalytics[] => {
    return restaurantAnalytics.filter(restaurant => {
      // Date range filter
      if (filters.startDate && restaurant.date < filters.startDate) return false;
      if (filters.endDate && restaurant.date > filters.endDate) return false;
      
      // Restaurant filter
      if (filters.restaurantId && restaurant.restaurantId !== filters.restaurantId) return false;
      
      return true;
    });
  };

  const getFilteredRiderAnalytics = (): RiderAnalytics[] => {
    return riderAnalytics.filter(rider => {
      // Date range filter
      if (filters.startDate && rider.date < filters.startDate) return false;
      if (filters.endDate && rider.date > filters.endDate) return false;
      
      // Rider filter
      if (filters.riderId && rider.riderId !== filters.riderId) return false;
      
      return true;
    });
  };

  const getFilteredCustomerAnalytics = (): CustomerAnalytics[] => {
    return customerAnalytics.filter(customer => {
      // Date range filter
      if (filters.startDate && customer.date < filters.startDate) return false;
      if (filters.endDate && customer.date > filters.endDate) return false;
      
      // Customer filter
      if (filters.customerId && customer.customerId !== filters.customerId) return false;
      
      return true;
    });
  };

  // Update filters
  const updateFilters = (newFilters: Partial<AnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({});
  };

  // Get aggregated metrics
  const getOrderMetrics = () => {
    const filteredOrders = getFilteredOrderAnalytics();
    
    const totalOrders = filteredOrders.length;
    const completedOrders = filteredOrders.filter(order => order.status === 'delivered').length;
    const cancelledOrders = filteredOrders.filter(order => order.status === 'cancelled').length;
    
    const totalRevenue = filteredOrders
      .filter(order => order.paymentStatus === 'completed')
      .reduce((sum, order) => sum + order.totalAmount, 0);
      
    const averageOrderValue = totalOrders > 0 
      ? totalRevenue / totalOrders 
      : 0;
    
    const preparationTimes = filteredOrders
      .filter(order => order.preparationTimeMinutes !== null)
      .map(order => order.preparationTimeMinutes!);
      
    const averagePreparationTime = preparationTimes.length > 0 
      ? preparationTimes.reduce((sum, time) => sum + time, 0) / preparationTimes.length 
      : 0;
    
    const deliveryTimes = filteredOrders
      .filter(order => order.deliveryTimeMinutes !== null)
      .map(order => order.deliveryTimeMinutes!);
      
    const averageDeliveryTime = deliveryTimes.length > 0 
      ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length 
      : 0;
    
    const totalTimes = filteredOrders
      .filter(order => order.totalTimeMinutes !== null)
      .map(order => order.totalTimeMinutes!);
      
    const averageTotalTime = totalTimes.length > 0 
      ? totalTimes.reduce((sum, time) => sum + time, 0) / totalTimes.length 
      : 0;
    
    return {
      totalOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      averageOrderValue,
      averagePreparationTime,
      averageDeliveryTime,
      averageTotalTime
    };
  };

  const getRestaurantMetrics = () => {
    const filteredRestaurants = getFilteredRestaurantAnalytics();
    
    const totalRestaurants = new Set(filteredRestaurants.map(r => r.restaurantId)).size;
    
    const totalOrders = filteredRestaurants.reduce((sum, r) => sum + r.totalOrders, 0);
    const completedOrders = filteredRestaurants.reduce((sum, r) => sum + r.completedOrders, 0);
    const cancelledOrders = filteredRestaurants.reduce((sum, r) => sum + r.cancelledOrders, 0);
    
    const totalRevenue = filteredRestaurants.reduce((sum, r) => sum + r.totalRevenue, 0);
    
    const averageOrderValue = totalOrders > 0 
      ? totalRevenue / totalOrders 
      : 0;
    
    const preparationTimes = filteredRestaurants.map(r => r.averagePreparationTimeMinutes);
    const averagePreparationTime = preparationTimes.length > 0 
      ? preparationTimes.reduce((sum, time) => sum + time, 0) / preparationTimes.length 
      : 0;
    
    // Get top restaurants by revenue
    const restaurantRevenueMap = new Map<string, { id: string, name: string, revenue: number }>();
    
    filteredRestaurants.forEach(restaurant => {
      if (!restaurantRevenueMap.has(restaurant.restaurantId)) {
        restaurantRevenueMap.set(restaurant.restaurantId, {
          id: restaurant.restaurantId,
          name: restaurant.restaurantName,
          revenue: 0
        });
      }
      
      restaurantRevenueMap.get(restaurant.restaurantId)!.revenue += restaurant.totalRevenue;
    });
    
    const topRestaurantsByRevenue = Array.from(restaurantRevenueMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    return {
      totalRestaurants,
      totalOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      averageOrderValue,
      averagePreparationTime,
      topRestaurantsByRevenue
    };
  };

  const getRiderMetrics = () => {
    const filteredRiders = getFilteredRiderAnalytics();
    
    const totalRiders = new Set(filteredRiders.map(r => r.riderId)).size;
    
    const totalDeliveries = filteredRiders.reduce((sum, r) => sum + r.totalDeliveries, 0);
    const completedDeliveries = filteredRiders.reduce((sum, r) => sum + r.completedDeliveries, 0);
    const cancelledDeliveries = filteredRiders.reduce((sum, r) => sum + r.cancelledDeliveries, 0);
    
    const totalEarnings = filteredRiders.reduce((sum, r) => sum + r.totalEarnings, 0);
    const totalDeliveryFees = filteredRiders.reduce((sum, r) => sum + r.deliveryFees, 0);
    const totalTips = filteredRiders.reduce((sum, r) => sum + r.tips, 0);
    
    const deliveryTimes = filteredRiders.map(r => r.averageDeliveryTimeMinutes);
    const averageDeliveryTime = deliveryTimes.length > 0 
      ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length 
      : 0;
    
    const totalActiveHours = filteredRiders.reduce((sum, r) => sum + r.totalActiveTimeHours, 0);
    
    const totalDistance = filteredRiders.reduce((sum, r) => sum + r.totalDistanceKm, 0);
    
    const averageDistances = filteredRiders.map(r => r.averageDeliveryDistanceKm);
    const averageDeliveryDistance = averageDistances.length > 0 
      ? averageDistances.reduce((sum, distance) => sum + distance, 0) / averageDistances.length 
      : 0;
    
    const ratings = filteredRiders.map(r => r.averageRating);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;
    
    // Get top riders by deliveries
    const riderDeliveryMap = new Map<string, { id: string, name: string, deliveries: number }>();
    
    filteredRiders.forEach(rider => {
      if (!riderDeliveryMap.has(rider.riderId)) {
        riderDeliveryMap.set(rider.riderId, {
          id: rider.riderId,
          name: rider.riderName,
          deliveries: 0
        });
      }
      
      riderDeliveryMap.get(rider.riderId)!.deliveries += rider.completedDeliveries;
    });
    
    const topRidersByDeliveries = Array.from(riderDeliveryMap.values())
      .sort((a, b) => b.deliveries - a.deliveries)
      .slice(0, 5);
    
    return {
      totalRiders,
      totalDeliveries,
      completedDeliveries,
      cancelledDeliveries,
      totalEarnings,
      totalDeliveryFees,
      totalTips,
      averageDeliveryTime,
      totalActiveHours,
      totalDistance,
      averageDeliveryDistance,
      averageRating,
      topRidersByDeliveries
    };
  };

  const getCustomerMetrics = () => {
    const filteredCustomers = getFilteredCustomerAnalytics();
    
    const totalCustomers = filteredCustomers.length;
    
    const totalOrders = filteredCustomers.reduce((sum, c) => sum + c.totalOrders, 0);
    
    const totalSpent = filteredCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
    
    const averageOrderValue = totalOrders > 0 
      ? totalSpent / totalOrders 
      : 0;
    
    const averageOrdersPerCustomer = totalCustomers > 0 
      ? totalOrders / totalCustomers 
      : 0;
    
    const averageSpendPerCustomer = totalCustomers > 0 
      ? totalSpent / totalCustomers 
      : 0;
    
    // Get top customers by spending
    const topCustomersBySpending = filteredCustomers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)
      .map(customer => ({
        id: customer.customerId,
        name: customer.customerName,
        spent: customer.totalSpent,
        orders: customer.totalOrders
      }));
    
    // Get most popular order days
    const dayOfWeekCounts = new Map<number, number>();
    
    filteredCustomers.forEach(customer => {
      customer.mostFrequentOrderDays.forEach(day => {
        dayOfWeekCounts.set(day.dayOfWeek, (dayOfWeekCounts.get(day.dayOfWeek) || 0) + day.orderCount);
      });
    });
    
    const mostPopularOrderDays = Array.from(dayOfWeekCounts.entries())
      .map(([dayOfWeek, count]) => ({ dayOfWeek, count }))
      .sort((a, b) => b.count - a.count);
    
    // Get most popular order hours
    const hourCounts = new Map<number, number>();
    
    filteredCustomers.forEach(customer => {
      customer.mostFrequentOrderHours.forEach(hour => {
        hourCounts.set(hour.hour, (hourCounts.get(hour.hour) || 0) + hour.orderCount);
      });
    });
    
    const mostPopularOrderHours = Array.from(hourCounts.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count);
    
    return {
      totalCustomers,
      totalOrders,
      totalSpent,
      averageOrderValue,
      averageOrdersPerCustomer,
      averageSpendPerCustomer,
      topCustomersBySpending,
      mostPopularOrderDays,
      mostPopularOrderHours
    };
  };

  // Get time series data for charts
  const getOrdersTimeSeries = () => {
    const filteredOrders = getFilteredOrderAnalytics();
    
    // Group orders by date
    const ordersByDate = new Map<string, number>();
    
    filteredOrders.forEach(order => {
      ordersByDate.set(order.date, (ordersByDate.get(order.date) || 0) + 1);
    });
    
    // Convert to array and sort by date
    return Array.from(ordersByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const getRevenueTimeSeries = () => {
    const filteredOrders = getFilteredOrderAnalytics();
    
    // Group revenue by date
    const revenueByDate = new Map<string, number>();
    
    filteredOrders
      .filter(order => order.paymentStatus === 'completed')
      .forEach(order => {
        revenueByDate.set(order.date, (revenueByDate.get(order.date) || 0) + order.totalAmount);
      });
    
    // Convert to array and sort by date
    return Array.from(revenueByDate.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const getOrdersByHourDistribution = () => {
    const filteredOrders = getFilteredOrderAnalytics();
    
    // Group orders by hour
    const ordersByHour = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: filteredOrders.filter(order => order.hour === hour).length
    }));
    
    return ordersByHour;
  };

  const getOrdersByDayDistribution = () => {
    const filteredOrders = getFilteredOrderAnalytics();
    
    // Group orders by day of week
    const ordersByDay = Array.from({ length: 7 }, (_, day) => ({
      day,
      count: filteredOrders.filter(order => order.dayOfWeek === day).length
    }));
    
    return ordersByDay;
  };

  return {
    // Data
    orderAnalytics: getFilteredOrderAnalytics(),
    restaurantAnalytics: getFilteredRestaurantAnalytics(),
    riderAnalytics: getFilteredRiderAnalytics(),
    customerAnalytics: getFilteredCustomerAnalytics(),
    
    // Filters
    filters,
    updateFilters,
    resetFilters,
    
    // Metrics
    orderMetrics: getOrderMetrics(),
    restaurantMetrics: getRestaurantMetrics(),
    riderMetrics: getRiderMetrics(),
    customerMetrics: getCustomerMetrics(),
    
    // Time series
    ordersTimeSeries: getOrdersTimeSeries(),
    revenueTimeSeries: getRevenueTimeSeries(),
    ordersByHourDistribution: getOrdersByHourDistribution(),
    ordersByDayDistribution: getOrdersByDayDistribution(),
    
    // Status
    loading
  };
};

