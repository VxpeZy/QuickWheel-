// src/pages/OrderTrackingDemoPage.tsx
import { Button } from "@/components/ui/button";
import { OrderTrackingDemo } from "@/components/OrderTrackingDemo";
import { useNavigate } from "react-router-dom";

const OrderTrackingDemoPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-8">
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-center">Order Tracking System Demo</h1>
          <div></div>
        </div>

        <div className="max-w-4xl mx-auto">
          <OrderTrackingDemo />
          
          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">About This Demo</h2>
            <p className="mb-4">
              This demo showcases the real-time order tracking system using local storage. In a production environment, 
              this would be connected to a backend database with WebSocket connections for real-time updates.
            </p>
            <p className="mb-4">
              The demo allows you to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Update the order status manually to see how the UI changes</li>
              <li>Set estimated delivery times to simulate restaurant preparation and delivery estimates</li>
              <li>View the order status timeline that records all status changes</li>
              <li>Create new demo orders to test the system with different scenarios</li>
            </ul>
            <p>
              All data is stored in your browser's local storage, so you can refresh the page and your order tracking 
              information will persist. This simulates how the system would work with a real database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingDemoPage;

