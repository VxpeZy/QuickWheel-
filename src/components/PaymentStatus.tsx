// src/components/PaymentStatus.tsx
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { PaymentDetails } from "@/hooks/usePayment";
import { Button } from "@/components/ui/button";

interface PaymentStatusProps {
  paymentDetails: PaymentDetails;
  onRetry?: () => Promise<void>;
  onContinue?: () => void;
}

export const PaymentStatus = ({
  paymentDetails,
  onRetry,
  onContinue
}: PaymentStatusProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {paymentDetails.status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">Payment Successful</h3>
          <p className="text-green-700 mb-4">
            Your payment of ฿{paymentDetails.amount.toFixed(2)} has been processed successfully.
          </p>
          <div className="text-sm text-green-600 space-y-1 mb-6">
            <p>Reference: {paymentDetails.reference}</p>
            <p>Completed at: {formatDate(paymentDetails.completedAt)}</p>
          </div>
          {onContinue && (
            <Button onClick={onContinue} className="bg-green-600 hover:bg-green-700">
              Continue
            </Button>
          )}
        </div>
      )}

      {paymentDetails.status === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-800 mb-2">Payment Failed</h3>
          <p className="text-red-700 mb-4">
            We couldn't process your payment of ฿{paymentDetails.amount.toFixed(2)}.
          </p>
          <div className="text-sm text-red-600 space-y-1 mb-6">
            <p>Reference: {paymentDetails.reference}</p>
            <p>Attempted at: {formatDate(paymentDetails.timestamp)}</p>
          </div>
          {onRetry && (
            <Button onClick={onRetry} className="bg-red-600 hover:bg-red-700">
              Try Again
            </Button>
          )}
        </div>
      )}

      {paymentDetails.status === 'pending' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-blue-800 mb-2">Payment Pending</h3>
          <p className="text-blue-700 mb-4">
            Your payment of ฿{paymentDetails.amount.toFixed(2)} is waiting to be processed.
          </p>
          <div className="text-sm text-blue-600 space-y-1">
            <p>Reference: {paymentDetails.reference}</p>
            <p>Created at: {formatDate(paymentDetails.timestamp)}</p>
          </div>
        </div>
      )}

      {paymentDetails.status === 'processing' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-amber-800 mb-2">Payment Processing</h3>
          <p className="text-amber-700 mb-4">
            Your payment of ฿{paymentDetails.amount.toFixed(2)} is being processed.
          </p>
          <div className="text-sm text-amber-600 space-y-1">
            <p>Reference: {paymentDetails.reference}</p>
            <p>Created at: {formatDate(paymentDetails.timestamp)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

