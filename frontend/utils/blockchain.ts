import { ethers, BrowserProvider, Contract } from 'ethers';
import { CONTRACT_ADDRESS, CROP_TYPES } from './constants';
import ContractArtifact from '../contracts/OrganicSupplyChain.json';

const CONTRACT_ABI = ContractArtifact.abi;

declare global {
  interface Window {
    ethereum?: any;
    __contractMocks?: Record<string, any>;
  }
}

const getMock = (method: string) => {
  if (typeof window === 'undefined') return undefined;
  if (window.__contractMocks?.[method] !== undefined) {
    return window.__contractMocks[method];
  }
  const cypress = (window as any).Cypress;
  if (cypress?.env) {
    const envMocks = cypress.env('contractMocks');
    if (envMocks?.[method] !== undefined) {
      return envMocks[method];
    }
  }
  try {
    const stored = window.localStorage?.getItem('contractMocks');
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, any>;
      return parsed?.[method];
    }
  } catch (error) {
    console.warn('Failed to read contract mocks from storage', error);
  }
  return undefined;
};

export const hasContractMock = (method: string) => getMock(method) !== undefined;

export const getContractMock = (method: string) => getMock(method);

const ensureNoMockError = (mock: any) => {
  if (mock && typeof mock === 'object' && 'error' in mock) {
    throw new Error(mock.error);
  }
};

/**
 * Get the Ethereum provider from MetaMask
 */
export const getProvider = (): BrowserProvider | null => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new BrowserProvider(window.ethereum);
  }
  return null;
};

/**
 * Get the signer (connected wallet)
 */
export const getSigner = async (): Promise<ethers.JsonRpcSigner | null> => {
  const provider = getProvider();
  if (!provider) return null;

  try {
    const signer = await provider.getSigner();
    return signer;
  } catch (error) {
    console.error('Error getting signer:', error);
    return null;
  }
};

/**
 * Get contract instance
 */
export const getContract = async (withSigner = false): Promise<Contract | null> => {
  try {
    if (withSigner) {
      const signer = await getSigner();
      if (!signer) return null;
      return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }

    const provider = getProvider();
    if (!provider) return null;
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  } catch (error) {
    console.error('Error getting contract:', error);
    return null;
  }
};

/**
 * Connect wallet
 */
export const connectWallet = async (): Promise<string | null> => {
  if (typeof window === 'undefined' || !window.ethereum) {
    alert('Please install MetaMask to use this application!');
    return null;
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return null;
  }
};

/**
 * Get current connected account
 */
export const getCurrentAccount = async (): Promise<string | null> => {
  if (typeof window === 'undefined' || !window.ethereum) return null;

  try {
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_accounts', []);
    return accounts[0] || null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

/**
 * Register a new product (Farmer)
 */
export const registerProduct = async (
  name: string,
  cropType: number,
  certHash: string,
  latitude: string,
  longitude: string,
  plantedDate: number,
  expectedHarvestDate: number
) => {
  const mock = getMock('registerProduct');
  if (mock !== undefined) {
    ensureNoMockError(mock);
    return mock;
  }

  const contract = await getContract(true);
  if (!contract) throw new Error('Contract not available');

  const tx = await contract.registerProduct(
    name,
    cropType,
    certHash,
    latitude,
    longitude,
    plantedDate,
    expectedHarvestDate
  );

  const receipt = await tx.wait();
  return receipt;
};

/**
 * Update product status
 */
export const updateProductStatus = async (
  productId: number,
  status: number
) => {
  const mock = getMock('updateProductStatus');
  if (mock !== undefined) {
    ensureNoMockError(mock);
    return mock;
  }

  const contract = await getContract(true);
  if (!contract) throw new Error('Contract not available');

  const tx = await contract.updateProductStatus(productId, status);
  const receipt = await tx.wait();
  return receipt;
};

/**
 * Harvest product (Farmer)
 */
export const harvestProduct = async (
  productId: number,
  estimatedQuantity: number,
  notes: string
) => {
  const mock = getMock('harvestProduct');
  if (mock !== undefined) {
    ensureNoMockError(mock);
    return mock;
  }

  const contract = await getContract(true);
  if (!contract) throw new Error('Contract not available');

  const tx = await contract.harvestProduct(productId, estimatedQuantity, notes);
  const receipt = await tx.wait();
  return receipt;
};

/**
 * Accept delivery (Processor/Retailer)
 */
export const acceptDelivery = async (productId: number) => {
  const contract = await getContract(true);
  if (!contract) throw new Error('Contract not available');

  const tx = await contract.acceptDelivery(productId);
  const receipt = await tx.wait();
  return receipt;
};

/**
 * Transfer custody (Product)
 */
export const transferCustody = async (
  productId: number,
  newCustodian: string,
  notes: string
) => {
  const mock = getMock('transferCustody');
  if (mock !== undefined) {
    ensureNoMockError(mock);
    return mock;
  }

  const contract = await getContract(true);
  if (!contract) throw new Error('Contract not available');

  const tx = await contract['transferCustody(uint256,address,string)'](
    productId,
    newCustodian,
    notes
  );
  const receipt = await tx.wait();
  return receipt;
};

/**
 * Receive product at retail
 */
export const receiveProduct = async (
  productId: number,
  receivedDate: number,
  expiryDate: number,
  retailPrice: number,
  notes: string
) => {
  const mock = getMock('receiveProduct');
  if (mock !== undefined) {
    ensureNoMockError(mock);
    return mock;
  }

  const contract = await getContract(true);
  if (!contract) throw new Error('Contract not available');

  const tx = await contract.receiveProduct(
    productId,
    receivedDate,
    expiryDate,
    retailPrice,
    notes
  );
  const receipt = await tx.wait();
  return receipt;
};

/**
 * Complete batch processing (Processor)
 */
export const completeBatchProcessing = async (batchId: number) => {
  const contract = await getContract(true);
  if (!contract) throw new Error('Contract not available');

  const tx = await contract.completeBatchProcessing(batchId);
  const receipt = await tx.wait();
  return receipt;
};

/**
 * Process a batch (Processor)
 */
export const processBatch = async (
  productId: number,
  quantity: number,
  processingLocation: string,
  temperatures: number[],
  humidities: number[],
  processingNotes: string,
  processingCertHash: string
) => {
  const mock = getMock('processBatch');
  if (mock !== undefined) {
    ensureNoMockError(mock);
    return mock;
  }

  const contract = await getContract(true);
  if (!contract) throw new Error('Contract not available');

  const tx = await contract.processBatch(
    productId,
    quantity,
    processingLocation,
    temperatures,
    humidities,
    processingNotes,
    processingCertHash
  );
  const receipt = await tx.wait();
  return receipt;
};

/**
 * Approve a certificate (Inspector)
 */
export const approveCertificate = async (certificateId: number) => {
  const contract = await getContract(true);
  if (!contract) throw new Error('Contract not available');

  const tx = await contract.approveCertificate(certificateId);
  const receipt = await tx.wait();
  return receipt;
};

/**
 * Reject a certificate (Inspector)
 */
export const rejectCertificate = async (certificateId: number, reason: string) => {
  const contract = await getContract(true);
  if (!contract) throw new Error('Contract not available');

  const tx = await contract.rejectCertificate(certificateId, reason);
  const receipt = await tx.wait();
  return receipt;
};

/**
 * Create a batch (Processor)
 */
export const createBatch = async (
  productId: number,
  quantity: number,
  packagingDetails: string
) => {
  const contract = await getContract(true);
  if (!contract) throw new Error('Contract not available');

  const tx = await contract.createBatch(productId, quantity, packagingDetails);
  const receipt = await tx.wait();
  return receipt;
};

/**
 * Add sensor data
 */
export const addSensorData = async (
  batchId: number,
  temperature: number,
  humidity: number
) => {
  const contract = await getContract(true);
  if (!contract) throw new Error('Contract not available');

  const tx = await contract.addSensorData(batchId, temperature, humidity);
  const receipt = await tx.wait();
  return receipt;
};

/**
 * Update batch location
 */
export const updateBatchLocation = async (
  batchId: number,
  latitude: string,
  longitude: string
) => {
  const contract = await getContract(true);
  if (!contract) throw new Error('Contract not available');

  const tx = await contract.updateBatchLocation(batchId, latitude, longitude);
  const receipt = await tx.wait();
  return receipt;
};

/**
 * Get product history
 */
export const getProductHistory = async (productId: number) => {
  const mock = getMock('getProductHistory');
  if (mock !== undefined) {
    return mock;
  }

  const contract = await getContract(false);
  if (!contract) throw new Error('Contract not available');

  const [product, batches] = await contract.getProductHistory(productId);
  
  // Convert bigint values to numbers for frontend compatibility
  const convertedProduct = {
    ...product,
    id: Number(product.id),
    cropType: Number(product.cropType),
    plantedDate: Number(product.plantedDate),
    expectedHarvestDate: Number(product.expectedHarvestDate),
    harvestDate: Number(product.harvestDate),
    harvestQuantity: Number(product.harvestQuantity),
    status: Number(product.status),
    batchIds: product.batchIds.map((id: bigint) => Number(id)),
    transferDate: Number(product.transferDate),
    receivedDate: Number(product.receivedDate),
    expiryDate: Number(product.expiryDate),
    retailPrice: Number(product.retailPrice),
    authenticityScore: Number(product.authenticityScore),
    farmLocation: {
      ...product.farmLocation,
      latitude: String(product.farmLocation.latitude),
      longitude: String(product.farmLocation.longitude),
      timestamp: Number(product.farmLocation.timestamp)
    }
  };
  
  console.log('[BlockchainUtils] getProductHistory converted product:', convertedProduct);
  
  return { product: convertedProduct, batches };
};

/**
 * Get available products for processing
 */
export const getAvailableBatches = async () => {
  const mock = getMock('getAvailableBatches');
  if (mock !== undefined) {
    return mock;
  }

  const contract = await getContract(false);
  if (!contract) throw new Error('Contract not available');

  const productIds = await contract.getAvailableBatches();
  return productIds.map((id: bigint) => Number(id));
};

/**
 * Verify product
 */
export const verifyProduct = async (productId: number) => {
  const mock = getMock('verifyProduct');
  if (mock !== undefined) {
    return mock;
  }

  const contract = await getContract(false);
  if (!contract) throw new Error('Contract not available');

  const [isAuthentic, score, details] = await contract.verifyProduct(productId);
  return { isAuthentic, score: Number(score), details };
};

/**
 * Get certificate details
 */
export const getCertificate = async (certificateId: number) => {
  const mock = getMock('getCertificate');
  if (mock !== undefined) {
    return mock;
  }

  const contract = await getContract(false);
  if (!contract) throw new Error('Contract not available');

  const cert = await contract.getCertificate(certificateId);
  return {
    certId: Number(cert.certId),
    issuer: cert.issuer,
    issueDate: Number(cert.issueDate),
    validUntil: Number(cert.validUntil),
    documentHash: cert.documentHash,
    approved: cert.approved,
    rejected: cert.rejected,
    approvedBy: cert.approvedBy,
    rejectionReason: cert.rejectionReason || ''
  };
};

/**
 * Get farmer's products
 */
export const getFarmerProducts = async (farmerAddress: string) => {
  const mock = getMock('getFarmerProducts');
  if (mock !== undefined) {
    return mock;
  }

  const contract = await getContract(false);
  if (!contract) throw new Error('Contract not available');

  const productIds = await contract.getFarmerProducts(farmerAddress);
  return productIds.map((id: bigint) => Number(id));
};

/**
 * Get total products count
 */
export const getTotalProducts = async () => {
  const contract = await getContract(false);
  if (!contract) throw new Error('Contract not available');

  const count = await contract.getTotalProducts();
  return Number(count);
};

/**
 * Get all products (for display purposes)
 */
export const getAllProducts = async () => {
  const mockAll = getMock('getAllProducts');
  if (mockAll !== undefined) {
    return mockAll;
  }

  const mockFarmer = getMock('getFarmerProducts');
  if (Array.isArray(mockFarmer) && mockFarmer.length > 0 && mockFarmer[0]?.name) {
    return mockFarmer;
  }

  const contract = await getContract(false);
  if (!contract) throw new Error('Contract not available');

  const totalCount = await contract.getTotalProducts();
  const count = Number(totalCount);

  const products = [] as any[];
  for (let i = 1; i <= count; i++) {
    try {
      const { product } = await getProductHistory(i);
      products.push({
        ...product,
        id: i,
        category: CROP_TYPES[Number(product.cropType)] || 'Unknown'
      });
    } catch (error) {
      console.error(`Error loading product ${i}:`, error);
    }
  }

  return products;
};

/**
 * Get all batches (for display purposes)
 */
export const getAllBatches = async () => {
  const contract = await getContract(false);
  if (!contract) throw new Error('Contract not available');

  const totalCount = await contract.getTotalBatches();
  const count = Number(totalCount);

  const batches = [] as any[];
  for (let i = 1; i <= count; i++) {
    try {
      const batch = await contract.batches(i);

      const locationHistoryLength = Number(batch.locationHistory?.length || 0);
      const locationHistory = [] as any[];

      for (let j = 0; j < locationHistoryLength; j++) {
        try {
          const location = batch.locationHistory[j];
          locationHistory.push({
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: Number(location.timestamp)
          });
        } catch (err) {
          console.error(`Error loading location ${j} for batch ${i}:`, err);
        }
      }

      batches.push({
        id: i,
        productId: Number(batch.productId),
        processor: batch.processor,
        quantity: Number(batch.quantity),
        processingDate: Number(batch.processedDate),
        status: Number(batch.status),
        processingLocation: batch.processingLocation,
        processingNotes: batch.processingNotes,
        processingCertHash: batch.processingCertHash,
        locationHistory
      });
    } catch (error) {
      console.error(`Error loading batch ${i}:`, error);
    }
  }

  return batches;
};

/**
 * Add certificate
 */
export const addCertificate = async (
  productId: number,
  issuer: string,
  validUntil: number,
  documentHash: string
) => {
  const contract = await getContract(true);
  if (!contract) throw new Error('Contract not available');

  const tx = await contract.addCertificate(productId, issuer, validUntil, documentHash);
  const receipt = await tx.wait();
  return receipt;
};

/**
 * Get pending certificates (Inspector)
 */
export const getPendingCertificates = async () => {
  const contract = await getContract(false);
  if (!contract) throw new Error('Contract not available');

  const pendingIds = await contract.getPendingCertificates();
  const certificates = [] as any[];

  for (const certId of pendingIds) {
    try {
      const cert = await contract.getCertificate(certId);
      certificates.push({
        certId: Number(cert.certId),
        issuer: cert.issuer,
        issueDate: Number(cert.issueDate),
        validUntil: Number(cert.validUntil),
        documentHash: cert.documentHash,
        approved: cert.approved,
        rejected: cert.rejected,
        approvedBy: cert.approvedBy,
        rejectionReason: cert.rejectionReason || ''
      });
    } catch (error) {
      console.error(`Error loading certificate ${certId}:`, error);
    }
  }

  return certificates;
};

/**
 * Format address for display
 */
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Format timestamp to readable date
 */
export const formatDate = (timestamp: number): string => {
  if (!timestamp) return 'N/A';
  const normalized = timestamp > 1000000000000 ? Math.floor(timestamp / 1000) : timestamp;
  const date = new Date(normalized * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculate carbon footprint based on distance and conditions
 */
export const calculateCarbonFootprint = (
  distanceKm: number,
  storageDays: number
): number => {
  const transportEmissions = distanceKm * 0.2;
  const storageEmissions = storageDays * 0.1;
  return Math.round((transportEmissions + storageEmissions) * 100) / 100;
};

/**
 * Calculate distance between two GPS coordinates (Haversine formula)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Wait for transaction confirmation
 */
export const waitForTransaction = async (
  txHash: string,
  confirmations = 1
): Promise<any> => {
  const provider = getProvider();
  if (!provider) throw new Error('Provider not available');

  const receipt = await provider.waitForTransaction(txHash, confirmations);
  return receipt;
};

/**
 * Grant a role to an address (Admin only)
 */
export const grantRole = async (address: string, roleName: string) => {
  const contract = await getContract(true);
  if (!contract) throw new Error('Contract not available');

  try {
    let tx;
    switch (roleName) {
      case 'FARMER_ROLE':
        tx = await contract.grantFarmerRole(address);
        break;
      case 'PROCESSOR_ROLE':
        tx = await contract.grantProcessorRole(address);
        break;
      case 'RETAILER_ROLE':
        tx = await contract.grantRetailerRole(address);
        break;
      case 'INSPECTOR_ROLE':
        tx = await contract.grantInspectorRole(address);
        break;
      default:
        throw new Error('Invalid role name');
    }
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error granting role:', error);
    throw error;
  }
};

/**
 * Check if an address has a specific role
 */
export const checkRole = async (address: string, roleName: string) => {
  const contract = await getContract();
  if (!contract) throw new Error('Contract not available');

  try {
    let roleHash;

    if (roleName === 'DEFAULT_ADMIN_ROLE' || roleName === 'ADMIN') {
      roleHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
    } else {
      roleHash = ethers.keccak256(ethers.toUtf8Bytes(roleName));
    }

    const hasRole = await contract.hasRole(roleHash, address);
    return hasRole;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
};

/**
 * Delete a product (admin only)
 */
export const deleteProduct = async (productId: number) => {
  const contract = await getContract(true);
  if (!contract) throw new Error('Contract not available');

  try {
    const tx = await contract.deleteProduct(productId);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * Delete a batch (admin only)
 */
export const deleteBatch = async (batchId: number) => {
  const contract = await getContract(true);
  if (!contract) throw new Error('Contract not available');

  try {
    const tx = await contract.deleteBatch(batchId);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error deleting batch:', error);
    throw error;
  }
};

/**
 * Recall a product (admin/inspector only)
 */
export const recallProduct = async (productId: number, reason: string) => {
  const contract = await getContract(true);
  if (!contract) throw new Error('Contract not available');

  try {
    const tx = await contract.recallProduct(productId, reason);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error recalling product:', error);
    throw error;
  }
};

/**
 * Flag tamper (admin/inspector demo)
 */
export const flagTamper = async (productId: number, reason: string) => {
  const contract = await getContract(true);
  if (!contract) throw new Error('Contract not available');

  try {
    const tx = await contract.flagTamper(productId, reason);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error flagging tamper:', error);
    throw error;
  }
};
/**
 * Grant DEFAULT_ADMIN_ROLE to an address (requires current admin)
 */
export const grantAdminRole = async (address: string) => {
  const contract = await getContract(true);
  if (!contract) throw new Error('Contract not available');

  try {
    // DEFAULT_ADMIN_ROLE is 0x0000000000000000000000000000000000000000000000000000000000000000
    const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const tx = await contract.grantRole(DEFAULT_ADMIN_ROLE, address);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error granting admin role:', error);
    throw error;
  }
};

/**
 * Check if address has DEFAULT_ADMIN_ROLE
 */
export const hasAdminRole = async (address: string) => {
  return await checkRole(address, 'DEFAULT_ADMIN_ROLE');
};