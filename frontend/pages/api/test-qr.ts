import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  status: string;
  message: string;
  timestamp: string;
};

/**
 * Simple health check endpoint for QR API
 * Visit: http://localhost:3000/api/test-qr
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  res.status(200).json({
    status: 'ok',
    message: 'QR API is working. Use POST to /api/generateQR with {productId, baseUrl}',
    timestamp: new Date().toISOString(),
  });
}
