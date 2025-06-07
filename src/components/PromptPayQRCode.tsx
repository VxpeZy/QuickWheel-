// src/components/PromptPayQRCode.tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentDetails } from "@/hooks/usePayment";
import { Loader2 } from "lucide-react";

interface PromptPayQRCodeProps {
  paymentDetails: PaymentDetails;
  onConfirmPayment: () => Promise<void>;
  isProcessing: boolean;
}

export const PromptPayQRCode = ({
  paymentDetails,
  onConfirmPayment,
  isProcessing
}: PromptPayQRCodeProps) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>PromptPay QR Payment</CardTitle>
        <CardDescription>
          Scan this QR code with your mobile banking app to pay
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {paymentDetails.qrCodeImage && (
          <div className="border border-gray-200 p-2 rounded-md">
            <img 
              src={paymentDetails.qrCodeImage} 
              alt="PromptPay QR Code" 
              className="w-64 h-64"
            />
          </div>
        )}
        
        <div className="text-center space-y-2">
          <p className="font-medium">Amount: ฿{paymentDetails.amount.toFixed(2)}</p>
          <p className="text-sm text-gray-500">Reference: {paymentDetails.reference}</p>
          <p className="text-sm text-gray-500">Recipient: Quick Wheel Delivery</p>
        </div>
        
        <div className="bg-amber-50 p-3 rounded-md w-full">
          <h4 className="font-medium text-amber-800 mb-2">Payment Instructions:</h4>
          <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
            <li>Open your mobile banking app</li>
            <li>Scan the QR code above</li>
            <li>Verify the amount and recipient</li>
            <li>Confirm the payment in your app</li>
            <li>Return here and click "I've Paid" button below</li>
          </ol>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={onConfirmPayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying Payment...
            </>
          ) : (
            "I've Paid"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

