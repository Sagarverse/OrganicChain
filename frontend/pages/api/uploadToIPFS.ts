import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { uploadFileToIPFS, mockUploadToIPFS, isPinataConfigured } from '../../utils/ipfs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form data
    const form = formidable({});
    const [fields, files] = await form.parse(req);

    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    let ipfsHash: string;

    // Check if Pinata is configured, otherwise use mock
    if (isPinataConfigured()) {
      // Read file buffer
      const fileBuffer = fs.readFileSync(file.filepath);
      const fileObj = new File([fileBuffer], file.originalFilename || 'file', {
        type: file.mimetype || 'application/octet-stream',
      });

      ipfsHash = await uploadFileToIPFS(fileObj);
    } else {
      // Use mock upload for demo
      ipfsHash = await mockUploadToIPFS(file.originalFilename || 'file');
    }

    return res.status(200).json({
      success: true,
      ipfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
    });
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return res.status(500).json({
      error: 'Failed to upload to IPFS',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
