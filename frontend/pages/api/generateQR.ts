import type { NextApiRequest, NextApiResponse } from 'next';
import QRCode from 'qrcode';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: '#1a3f2c',
        light: '#ffffff',
      },
      width: 512,
    });

    // Also generate as buffer for download
    const qrCodeBuffer = await QRCode.toBuffer(url, {
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: '#1a3f2c',
        light: '#ffffff',
      },
      width: 512,
    }) as Buffer;

    return res.status(200).json({
      success: true,
      productId,
      url,
      qrCodeDataUrl,
      qrCodeBase64: Buffer.from(qrCodeBuffer).toString('base64'),
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return res.status(500).json({ 
      error: 'Failed to generate QR code',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
