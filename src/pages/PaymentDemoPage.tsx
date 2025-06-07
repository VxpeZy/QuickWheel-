// src/pages/PaymentDemoPage.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useLocalOrders } from "@/hooks/useLocalOrders";
import { v4 as uuidv4 } from 'uuid';

const PaymentDemoPage = () => {
  const navigate = useNavigate();
  const { createOrder } = useLocalOrders();
  const [amount, setAmount] = useState<number>(150);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const handleCreateDemoOrder = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    try {
      // Create a demo order
      const demoOrder = {
        restaurant_id: uuidv4(),
        restaurant_name: "Demo Restaurant",
        customer_name: "Demo Customer",
        customer_phone: "0812345678",
        customer_address: "123 Demo Street, Bangkok",
        items: [
          {
            id: uuidv4(),
            name: "Demo Food Item",
            name_th: "อาหารตัวอย่าง",
            price: amount,
            description: "A demo food item for testing payment",
            quantity: 1
          }
        ],
        total_amount: amount,
        delivery_fee: 40,
        coordinates: { lat: 13.7563, lng: 100.5018 }
      };
      
      const order = await createOrder(demoOrder);
      
      if (order) {
        // Navigate to payment page
        navigate(`/payment/${order.id}`);
      }
    } catch (error) {
      console.error('Error creating demo order:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-8">
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-center">PromptPay Payment Demo</h1>
          <div></div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create Demo Order</CardTitle>
              <CardDescription>
                Create a demo order to test the PromptPay payment system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Order Amount (THB)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(Number(e.target.value))} 
                    min={1}
                  />
                  <p className="text-sm text-gray-500">
                    A delivery fee of ฿40 will be added to this amount
                  </p>
                </div>
                
                <div className="pt-2">
                  <Button 
                    onClick={handleCreateDemoOrder} 
                    className="w-full"
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creating Order...' : 'Create Demo Order & Proceed to Payment'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">About This Demo</h2>
            <p className="mb-4">
              This demo showcases the PromptPay QR code payment system using local storage. In a production environment, 
              this would be connected to a real PromptPay API to generate actual QR codes and verify payments.
            </p>
            <p className="mb-4">
              The demo allows you to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Create a demo order with a custom amount</li>
              <li>View a simulated PromptPay QR code</li>
              <li>Simulate payment completion</li>
              <li>See payment status updates</li>
            </ul>
            <p>
              All data is stored in your browser's local storage, so you can refresh the page and your payment 
              information will persist. This simulates how the system would work with a real payment gateway.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDemoPage;

