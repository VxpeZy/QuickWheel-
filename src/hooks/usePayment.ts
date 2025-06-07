// src/hooks/usePayment.ts
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generatePromptPayQR, validatePromptPayPayment } from '@/utils/promptpayQRGenerator';

// Local storage key
const PAYMENT_STORAGE_KEY = 'quick-wheel-payments';

export interface PaymentDetails {
  id: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'promptpay';
  qrCodeImage?: string;
  reference: string;
  timestamp: string;
  completedAt?: string;
}

export const usePayment = (orderId?: string) => {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Load payment details from local storage
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const loadPaymentDetails = () => {
      try {
        const storedPayments = localStorage.getItem(PAYMENT_STORAGE_KEY);
        if (storedPayments) {
          const payments: PaymentDetails[] = JSON.parse(storedPayments);
          const payment = payments.find(p => p.orderId === orderId);
          
          if (payment) {
            setPaymentDetails(payment);
          }
        }
      } catch (error) {
        console.error('Error loading payment details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentDetails();

    // Set up event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PAYMENT_STORAGE_KEY && e.newValue) {
        const payments: PaymentDetails[] = JSON.parse(e.newValue);
        const payment = payments.find(p => p.orderId === orderId);
        
        if (payment) {
          setPaymentDetails(payment);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [orderId]);

  // Create a new payment
  const createPayment = async (amount: number): Promise<PaymentDetails | null> => {
    if (!orderId) return null;

    try {
      setLoading(true);
      
      // Generate a unique reference number
      const reference = `REF${Date.now().toString().slice(-8)}`;
      
      // Generate QR code
      const { qrCodeImage, paymentInfo } = generatePromptPayQR(amount, reference);
      
      // Create payment details
      const newPayment: PaymentDetails = {
        id: `PAY-${Date.now()}`,
        orderId,
        amount,
        status: 'pending',
        method: 'promptpay',
        qrCodeImage,
        reference,
        timestamp: new Date().toISOString()
      };
      
      // Save to local storage
      const storedPayments = localStorage.getItem(PAYMENT_STORAGE_KEY);
      const payments: PaymentDetails[] = storedPayments ? JSON.parse(storedPayments) : [];
      
      // Check if payment already exists for this order
      const existingPaymentIndex = payments.findIndex(p => p.orderId === orderId);
      
      if (existingPaymentIndex >= 0) {
        // Update existing payment
        payments[existingPaymentIndex] = newPayment;
      } else {
        // Add new payment
        payments.push(newPayment);
      }
      
      localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(payments));
      
      // Update state
      setPaymentDetails(newPayment);
      
      // Trigger storage event for other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: PAYMENT_STORAGE_KEY,
        newValue: JSON.stringify(payments)
      }));
      
      return newPayment;
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to create payment',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Process payment (simulate payment verification)
  const processPayment = async (): Promise<boolean> => {
    if (!paymentDetails) return false;

    try {
      setLoading(true);
      
      // Update payment status to processing
      await updatePaymentStatus('processing');
      
      // Simulate payment verification
      const isSuccess = await validatePromptPayPayment(
        paymentDetails.reference, 
        paymentDetails.amount
      );
      
      if (isSuccess) {
        // Update payment status to completed
        await updatePaymentStatus('completed', new Date().toISOString());
        
        toast({
          title: 'Payment Successful',
          description: 'Your payment has been processed successfully'
        });
        
        return true;
      } else {
        // Update payment status to failed
        await updatePaymentStatus('failed');
        
        toast({
          title: 'Payment Failed',
          description: 'Your payment could not be processed',
          variant: 'destructive'
        });
        
        return false;
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      
      // Update payment status to failed
      await updatePaymentStatus('failed');
      
      toast({
        title: 'Error',
        description: 'Failed to process payment',
        variant: 'destructive'
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update payment status
  const updatePaymentStatus = async (
    status: PaymentDetails['status'], 
    completedAt?: string
  ): Promise<boolean> => {
    if (!paymentDetails) return false;

    try {
      // Get current payments
      const storedPayments = localStorage.getItem(PAYMENT_STORAGE_KEY);
      const payments: PaymentDetails[] = storedPayments ? JSON.parse(storedPayments) : [];
      
      // Find and update the payment
      const paymentIndex = payments.findIndex(p => p.id === paymentDetails.id);
      
      if (paymentIndex >= 0) {
        // Update payment
        const updatedPayment = {
          ...payments[paymentIndex],
          status,
          ...(completedAt && { completedAt })
        };
        
        payments[paymentIndex] = updatedPayment;
        
        // Save to local storage
        localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(payments));
        
        // Update state
        setPaymentDetails(updatedPayment);
        
        // Trigger storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', {
          key: PAYMENT_STORAGE_KEY,
          newValue: JSON.stringify(payments)
        }));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating payment status:', error);
      return false;
    }
  };

  return {
    paymentDetails,
    loading,
    createPayment,
    processPayment,
    updatePaymentStatus
  };
};

