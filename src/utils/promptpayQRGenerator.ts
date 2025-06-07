// src/utils/promptpayQRGenerator.ts

/**
 * Utility for generating simulated PromptPay QR codes
 * In a production environment, this would connect to a PromptPay API
 * or use a library like `promptpay-qr` to generate actual PromptPay QR codes
 */

// Function to generate a base64 QR code image URL
// This is a simulation - in production, use a proper QR code library
export const generateQRCodeImage = (text: string): string => {
  // This is a placeholder function that returns a simulated QR code image
  // In a real implementation, you would use a library like qrcode.react or promptpay-qr
  
  // For simulation purposes, we're using a simple SVG QR code
  const size = 200;
  const color = '#000';
  
  // Create a simple QR-like pattern (just for visual representation)
  const svgContent = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white" />
      
      <!-- QR code frame -->
      <rect x="10" y="10" width="${size - 20}" height="${size - 20}" fill="white" stroke="${color}" stroke-width="2" />
      
      <!-- QR code position markers -->
      <rect x="20" y="20" width="30" height="30" fill="${color}" />
      <rect x="25" y="25" width="20" height="20" fill="white" />
      <rect x="30" y="30" width="10" height="10" fill="${color}" />
      
      <rect x="${size - 50}" y="20" width="30" height="30" fill="${color}" />
      <rect x="${size - 45}" y="25" width="20" height="20" fill="white" />
      <rect x="${size - 40}" y="30" width="10" height="10" fill="${color}" />
      
      <rect x="20" y="${size - 50}" width="30" height="30" fill="${color}" />
      <rect x="25" y="${size - 45}" width="20" height="20" fill="white" />
      <rect x="30" y="${size - 40}" width="10" height="10" fill="${color}" />
      
      <!-- QR code data pattern (simplified) -->
      ${generateRandomQRPattern(size, color)}
      
      <!-- PromptPay logo in the center -->
      <circle cx="${size/2}" cy="${size/2}" r="20" fill="white" />
      <text x="${size/2}" y="${size/2 + 5}" font-family="Arial" font-size="10" text-anchor="middle" fill="#0066CC">PromptPay</text>
    </svg>
  `;
  
  // Convert SVG to base64
  const base64 = btoa(svgContent);
  return `data:image/svg+xml;base64,${base64}`;
};

// Helper function to generate a random QR-like pattern
const generateRandomQRPattern = (size: number, color: string): string => {
  let pattern = '';
  const blockSize = 10;
  const margin = 60; // Keep clear of the position markers
  
  for (let y = margin; y < size - margin; y += blockSize) {
    for (let x = margin; x < size - margin; x += blockSize) {
      // Skip the center area for the logo
      if (Math.abs(x - size/2) < 30 && Math.abs(y - size/2) < 30) continue;
      
      // Randomly add blocks
      if (Math.random() > 0.6) {
        pattern += `<rect x="${x}" y="${y}" width="${blockSize}" height="${blockSize}" fill="${color}" />`;
      }
    }
  }
  
  return pattern;
};

// Function to generate a PromptPay QR code for a specific amount
export const generatePromptPayQR = (amount: number, reference: string): { 
  qrCodeImage: string;
  paymentInfo: {
    amount: number;
    reference: string;
    recipient: string;
    timestamp: string;
  }
} => {
  // Format the amount to 2 decimal places
  const formattedAmount = amount.toFixed(2);
  
  // Generate a QR code with the payment information
  // In a real implementation, this would follow the PromptPay QR format
  const qrText = `PromptPay|${formattedAmount}|REF:${reference}`;
  const qrCodeImage = generateQRCodeImage(qrText);
  
  // Return the QR code image and payment information
  return {
    qrCodeImage,
    paymentInfo: {
      amount: amount,
      reference: reference,
      recipient: "Quick Wheel Delivery",
      timestamp: new Date().toISOString()
    }
  };
};

// Function to validate a PromptPay payment (simulation)
export const validatePromptPayPayment = async (
  reference: string, 
  amount: number
): Promise<boolean> => {
  // This is a simulation - in production, you would check with a payment gateway
  // For simulation, we'll just return true after a short delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate a 95% success rate
      const isSuccess = Math.random() < 0.95;
      resolve(isSuccess);
    }, 1500); // Simulate a network delay
  });
};

