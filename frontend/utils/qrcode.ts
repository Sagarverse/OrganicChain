/**
 * Generate QR code data URL for a product via API
 * @param productId Product ID
 * @returns Data URL of the QR code image
 */
export const generateProductQRCode = async (
  productId: number
): Promise<string> => {
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    
    console.log('[QRCode] Starting QR generation for product:', productId);
    console.log('[QRCode] Base URL:', baseUrl);
    console.log('[QRCode] Calling /api/generateQR...');
    
    const response = await fetch('/api/generateQR', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        baseUrl,
      }),
    });

    console.log('[QRCode] API Response Status:', response.status, response.statusText);
    console.log('[QRCode] Response Headers:', response.headers.get('content-type'));

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        // Only try to parse as JSON if the content type is JSON
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.log('[QRCode] API Error details:', errorData);
        } else {
          console.warn('[QRCode] Response is not JSON, type:', contentType);
          const textContent = await response.text();
          if (textContent) {
            console.log('[QRCode] Response text (first 200 chars):', textContent.substring(0, 200));
          }
        }
      } catch (parseError) {
        // If parsing fails, just use the status text
        console.warn('[QRCode] Could not parse error response:', parseError);
      }
      
      throw new Error(`Failed to generate QR code: ${errorMessage}`);
    }

    const data = await response.json();
    console.log('[QRCode] API Response received, has qrCodeDataUrl:', !!data.qrCodeDataUrl);
    
    if (!data.qrCodeDataUrl) {
      throw new Error('No QR code data URL received from API');
    }
    
    console.log('[QRCode] QR code generated successfully');
    return data.qrCodeDataUrl;
  } catch (error) {
    console.error('[QRCode] Error generating QR code:', error);
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
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    
    // Use API to get base64 encoded QR code
    const response = await fetch('/api/generateQR', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        baseUrl,
      }),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        // Only try to parse as JSON if the content type is JSON
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        }
      } catch (parseError) {
        // If parsing fails, just use the status text
        console.warn('Could not parse error response:', parseError);
      }
      
      throw new Error(`Failed to generate QR code: ${errorMessage}`);
    }

    const data = await response.json();
    
    if (!data.qrCodeBase64) {
      throw new Error('No QR code data received from API');
    }

    // Convert base64 to blob
    const byteCharacters = atob(data.qrCodeBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

    // Create blob URL and download
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    
    // Safely handle product name - fallback to productId if name is undefined/empty
    const sanitizedName = (productName || `product`).replace(/\s+/g, '-').replace(/[^a-z0-9\-]/gi, '');
    link.download = `${sanitizedName}-qr-code-${productId}.png`;
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 100);
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
