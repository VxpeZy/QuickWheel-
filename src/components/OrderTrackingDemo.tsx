// src/components/OrderTrackingDemo.tsx
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OrderStatusTimeline } from './OrderStatusTimeline';
import { OrderProgressIndicator } from './OrderProgressIndicator';
import { useLocalOrderTracking } from '@/hooks/useLocalOrderTracking';
import { useLocalOrders } from '@/hooks/useLocalOrders';
import { v4 as uuidv4 } from 'uuid';

export const OrderTrackingDemo = () => {
  const [demoOrderId, setDemoOrderId] = useState<string>('');
  const [prepTime, setPrepTime] = useState<number>(15);
  const [deliveryTime, setDeliveryTime] = useState<number>(20);
  
  // Create a demo order if none exists
  const createDemoOrder = () => {
    const newOrderId = uuidv4();
    setDemoOrderId(newOrderId);
    
    // Initialize order tracking
    const trackingKey = `quick-wheel-order-tracking-${newOrderId}`;
    const initialStatus = 'pending';
    const initialHistory = [{
      status: initialStatus,
      timestamp: new Date().toISOString()
    }];
    
    const initialTrackingInfo = {
      currentStatus: initialStatus,
      statusHistory: initialHistory,
      estimatedArrivalTime: null
    };
    
    localStorage.setItem(trackingKey, JSON.stringify(initialTrackingInfo));
    
    return newOrderId;
  };
  
  const orderId = demoOrderId || createDemoOrder();
  const { trackingInfo, updateOrderStatus, estimateDeliveryTime, advanceToNextStatus } = useLocalOrderTracking(orderId);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Tracking Demo</CardTitle>
          <CardDescription>
            This demo shows how the order tracking system works using local storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Demo Order ID: {orderId}</p>
              <p className="text-sm text-gray-500 mb-4">Current Status: {trackingInfo.currentStatus}</p>
            </div>
            
            {/* Order Progress Indicator */}
            <OrderProgressIndicator 
              currentStatus={trackingInfo.currentStatus} 
              estimatedArrivalTime={trackingInfo.estimatedArrivalTime} 
            />
            
            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Update Status</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => updateOrderStatus('pending')}>
                    Set Pending
                  </Button>
                  <Button onClick={() => updateOrderStatus('accepted')}>
                    Set Accepted
                  </Button>
                  <Button onClick={() => updateOrderStatus('preparing')}>
                    Set Preparing
                  </Button>
                  <Button onClick={() => updateOrderStatus('ready_for_pickup')}>
                    Set Ready
                  </Button>
                  <Button onClick={() => updateOrderStatus('picked_up')}>
                    Set Picked Up
                  </Button>
                  <Button onClick={() => updateOrderStatus('on_the_way')}>
                    Set On The Way
                  </Button>
                  <Button onClick={() => updateOrderStatus('delivered')}>
                    Set Delivered
                  </Button>
                  <Button onClick={() => updateOrderStatus('cancelled')} variant="destructive">
                    Set Cancelled
                  </Button>
                </div>
                
                <Button 
                  onClick={advanceToNextStatus} 
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Advance to Next Status
                </Button>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Estimate Delivery Time</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prep-time">Preparation Time (min)</Label>
                    <Input 
                      id="prep-time" 
                      type="number" 
                      value={prepTime} 
                      onChange={(e) => setPrepTime(parseInt(e.target.value))} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="delivery-time">Delivery Time (min)</Label>
                    <Input 
                      id="delivery-time" 
                      type="number" 
                      value={deliveryTime} 
                      onChange={(e) => setDeliveryTime(parseInt(e.target.value))} 
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={() => estimateDeliveryTime(prepTime, deliveryTime)} 
                  className="w-full"
                >
                  Set Estimated Delivery Time
                </Button>
                
                <Button 
                  onClick={() => {
                    setDemoOrderId('');
                    createDemoOrder();
                  }} 
                  variant="outline" 
                  className="w-full"
                >
                  Create New Demo Order
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Order Status Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderStatusTimeline statusHistory={trackingInfo.statusHistory} />
        </CardContent>
      </Card>
    </div>
  );
};

