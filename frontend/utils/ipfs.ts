import axios from 'axios';

const PINATA_API_KEY = process.env.PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY || '';
const PINATA_JWT = process.env.PINATA_JWT || '';

const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs/';

/**
 * Upload file to IPFS via Pinata
 */
export const uploadFileToIPFS = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        type: 'organic-certification',
        timestamp: Date.now().toString()
      }
    });
    formData.append('pinataMetadata', metadata);

    const response = await axios.post(
      `${PINATA_API_URL}/pinning/pinFileToIPFS`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload file to IPFS');
  }
};

/**
 * Upload JSON data to IPFS via Pinata
 */
export const uploadJSONToIPFS = async (jsonData: any): Promise<string> => {
  try {
    const response = await axios.post(
      `${PINATA_API_URL}/pinning/pinJSONToIPFS`,
      jsonData,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw new Error('Failed to upload JSON to IPFS');
  }
};

/**
 * Get IPFS file URL
 */
export const getIPFSUrl = (hash: string): string => {
  if (!hash) return '';
  if (hash.startsWith('mock://')) {
    const data = hash.substring(7);
    if (data.startsWith('%7B') || data.startsWith('{')) {
      return `data:application/json;charset=utf-8,${data}`;
    }
    return `data:text/plain;charset=utf-8,Mock Document Content:%0A${data}`;
  }
  return `${PINATA_GATEWAY_URL}${hash}`;
};

/**
 * Fetch data from IPFS
 */
export const fetchFromIPFS = async (hash: string): Promise<any> => {
  try {
    const response = await axios.get(getIPFSUrl(hash));
    return response.data;
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    throw new Error('Failed to fetch data from IPFS');
  }
};

/**
 * Mock upload for demo purposes (when Pinata keys not configured)
 */
export const mockUploadToIPFS = async (data: string): Promise<string> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Encode the data as a URI component to store it in the mock hash
  const mockHash = `mock://${encodeURIComponent(data)}`;
  console.log(`Mock IPFS upload: generated mock URI with data length ${data.length}`);
  return mockHash;
};

/**
 * Check if Pinata is configured
 */
export const isPinataConfigured = (): boolean => {
  return Boolean(PINATA_JWT || (PINATA_API_KEY && PINATA_SECRET_KEY));
};
