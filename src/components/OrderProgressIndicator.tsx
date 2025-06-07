// src/components/OrderProgressIndicator.tsx
import { CheckCircle, Clock, CookingPot, Bike, Package, Home } from 'lucide-react';
import { getStatusText } from '@/hooks/useOrderTracking';

interface OrderProgressIndicatorProps {
  currentStatus: string;
  estimatedArrivalTime: string | null;
}

export const OrderProgressIndicator = ({ 
  currentStatus, 
  estimatedArrivalTime 
}: OrderProgressIndicatorProps) => {
  const steps = [
    { id: 'pending', label: 'Order Placed', icon: <Clock className="h-5 w-5" /> },
    { id: 'accepted', label: 'Accepted', icon: <CheckCircle className="h-5 w-5" /> },
    { id: 'preparing', label: 'Preparing', icon: <CookingPot className="h-5 w-5" /> },
    { id: 'picked_up', label: 'Picked Up', icon: <Package className="h-5 w-5" /> },
    { id: 'on_the_way', label: 'On the Way', icon: <Bike className="h-5 w-5" /> },
    { id: 'delivered', label: 'Delivered', icon: <Home className="h-5 w-5" /> }
  ];
  
  // Map status to step index
  const statusToStepMap: Record<string, number> = {
    'pending': 0,
    'accepted': 1,
    'preparing': 2,
    'ready_for_pickup': 2,
    'rider_assigned': 3,
    'picked_up': 3,
    'on_the_way': 4,
    'delivered': 5,
    'cancelled': -1
  };
  
  const currentStepIndex = statusToStepMap[currentStatus] ?? 0;
  
  // If order is cancelled, show special UI
  if (currentStatus === 'cancelled') {
    return (
      <div className="w-full py-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-red-600 font-medium">This order has been cancelled</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full py-4">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`flex flex-col items-center ${
              index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            {step.icon}
            <span className="text-xs mt-1 hidden md:block">{step.label}</span>
          </div>
        ))}
      </div>
      
      <div className="relative w-full h-2 bg-gray-200 rounded-full">
        <div 
          className="absolute top-0 left-0 h-2 bg-blue-600 rounded-full transition-all duration-500"
          style={{ 
            width: `${Math.min(100, (currentStepIndex / (steps.length - 1)) * 100)}%` 
          }}
        />
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          {currentStatus === 'pending' && 'Waiting for restaurant to accept your order...'}
          {currentStatus === 'accepted' && 'Restaurant is preparing your order...'}
          {currentStatus === 'preparing' && 'Your food is being prepared...'}
          {currentStatus === 'ready_for_pickup' && 'Your order is ready for pickup...'}
          {currentStatus === 'rider_assigned' && 'A rider has been assigned to your order...'}
          {currentStatus === 'picked_up' && 'Your order has been picked up...'}
          {currentStatus === 'on_the_way' && 'Your order is on the way...'}
          {currentStatus === 'delivered' && 'Your order has been delivered!'}
        </p>
        
        {estimatedArrivalTime && currentStatus !== 'delivered' && currentStatus !== 'cancelled' && (
          <p className="text-sm font-medium mt-2">
            Estimated delivery: {new Date(estimatedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
};

