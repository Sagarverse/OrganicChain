import QRCode from 'qrcode';

/**
 * Generate QR code data URL for a product
 * @param productId Product ID
 * @param contractAddress Contract address (optional)
 * @returns Data URL of the QR code image
 */
export const generateProductQRCode = async (
  productId: number,
  contractAddress?: string
): Promise<string> => {
  try {
    // Create the verification URL
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/consumer/${productId}`;
    
    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Download QR code as PNG file
 * @param productId Product ID
 * @param productName Product name (for filename)
 */
export const downloadProductQRCode = async (
  productId: number,
  productName: string
): Promise<void> => {
  try {
    const qrDataUrl = await generateProductQRCode(productId);
    
    // Create download link
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${productName.replace(/\s+/g, '-')}-product-${productId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw error;
  }
};

/**
 * Format timestamp to readable date
 */
export const formatDate = (timestamp: number | string): string => {
  if (!timestamp || timestamp === '0') return 'Not set';
  
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format GPS coordinates
 */
export const formatCoordinates = (lat: string, lng: string): string => {
  if (!lat || !lng || lat === '0' || lng === '0') return 'Not set';
  
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  
  return `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
};
