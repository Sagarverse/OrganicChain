import type { NextApiRequest, NextApiResponse } from 'next';
import QRCode from 'qrcode';

type ResponseData = {
  success?: boolean;
  productId?: number;
  url?: string;
  qrCodeDataUrl?: string;
  qrCodeBase64?: string;
  error?: string;
  details?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId, baseUrl } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Generate URL for product verification
    const url = `${baseUrl || 'http://localhost:3000'}/consumer/${productId}`;

    console.log(`[QR API] Generating QR code for product ${productId} with URL: ${url}`);

    // Generate QR code as data URL
    let qrCodeDataUrl: string;
    try {
      qrCodeDataUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
          dark: '#1a3f2c',
          light: '#ffffff',
        },
        width: 512,
      });
    } catch (qrError) {
      console.error('[QR API] Error generating data URL:', qrError);
      throw new Error(`Failed to generate QR data URL: ${qrError instanceof Error ? qrError.message : 'Unknown error'}`);
    }

    // Also generate as buffer for download
    let qrCodeBuffer: Buffer;
    try {
      qrCodeBuffer = (await QRCode.toBuffer(url, {
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
          dark: '#1a3f2c',
          light: '#ffffff',
        },
        width: 512,
      })) as Buffer;
    } catch (bufferError) {
      console.error('[QR API] Error generating buffer:', bufferError);
      throw new Error(`Failed to generate QR buffer: ${bufferError instanceof Error ? bufferError.message : 'Unknown error'}`);
    }

    const base64String = Buffer.from(qrCodeBuffer).toString('base64');

    console.log(`[QR API] Successfully generated QR code (${base64String.length} bytes base64)`);

    return res.status(200).json({
      success: true,
      productId,
      url,
      qrCodeDataUrl,
      qrCodeBase64: base64String,
    });
  } catch (error) {
    console.error('[QR API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ 
      error: 'Failed to generate QR code',
      details: errorMessage
    });
  }
}
