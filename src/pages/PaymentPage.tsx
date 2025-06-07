// src/pages/PaymentPage.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePayment } from "@/hooks/usePayment";
import { useLocalOrders } from "@/hooks/useLocalOrders";
import { PromptPayQRCode } from "@/components/PromptPayQRCode";
import { PaymentStatus } from "@/components/PaymentStatus";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

const PaymentPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { paymentDetails, loading, createPayment, processPayment } = usePayment(orderId);
  const { orders } = useLocalOrders();
  const [isProcessing, setIsProcessing] = useState(false);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    // Find the order
    if (orders && orderId) {
      const foundOrder = orders.find(o => o.id === orderId);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    }
  }, [orders, orderId]);

  useEffect(() => {
    // Create payment if not exists
    const initializePayment = async () => {
      if (order && !paymentDetails && !loading) {
        await createPayment(order.total_amount + order.delivery_fee);
      }
    };

    initializePayment();
  }, [order, paymentDetails, loading]);

  const handleConfirmPayment = async () => {
    if (!paymentDetails) return;
    
    setIsProcessing(true);
    try {
      await processPayment();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!order) return;
    
    setIsProcessing(true);
    try {
      await createPayment(order.total_amount + order.delivery_fee);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    navigate(`/customer`);
  };

  if (loading || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading payment information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-8">
          <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-center">Payment</h1>
          <div></div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <p><span className="font-medium">Restaurant:</span> {order.restaurant_name}</p>
              <p><span className="font-medium">Order ID:</span> {order.id.substring(0, 8)}</p>
              <p><span className="font-medium">Items:</span> {order.items.length}</p>
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>฿{order.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span>฿{order.delivery_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>฿{(order.total_amount + order.delivery_fee).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="mb-6">
            {paymentDetails && (
              paymentDetails.status === 'pending' ? (
                <PromptPayQRCode 
                  paymentDetails={paymentDetails}
                  onConfirmPayment={handleConfirmPayment}
                  isProcessing={isProcessing}
                />
              ) : (
                <PaymentStatus 
                  paymentDetails={paymentDetails}
                  onRetry={handleRetryPayment}
                  onContinue={handleContinue}
                />
              )
            )}
          </div>

          {/* Payment Instructions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">About PromptPay</h2>
            <p className="mb-4">
              PromptPay is Thailand's national e-payment system that allows money transfers using a recipient's mobile number, 
              national ID number, or QR code. It's widely used across Thailand and supported by all major banks.
            </p>
            <h3 className="font-medium mb-2">Benefits of PromptPay:</h3>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>Fast and secure payments</li>
              <li>Lower transaction fees compared to credit cards</li>
              <li>Widely accepted across Thailand</li>
              <li>No need to carry cash or cards</li>
            </ul>
            <p className="text-sm text-gray-500">
              For assistance with your payment, please contact our customer support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

