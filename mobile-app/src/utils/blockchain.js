import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, RPC_URL as DEFAULT_RPC_URL, CHAIN_ID } from './constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize provider (read-only)

let provider;
let contract;
let currentRpcUrl = null;


export const initializeProvider = async () => {
  try {
    // Try to get RPC_URL from AsyncStorage
    let rpcUrl = await AsyncStorage.getItem('RPC_URL');
    if (!rpcUrl) rpcUrl = DEFAULT_RPC_URL;
    if (currentRpcUrl !== rpcUrl || !provider || !contract) {
      provider = new ethers.JsonRpcProvider(rpcUrl);
      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      currentRpcUrl = rpcUrl;
    }
    return { provider, contract };
  } catch (error) {
    console.error('Failed to initialize provider:', error);
    throw error;
  }
};

// Get product history from blockchain
export const getProductHistory = async (productId) => {
  try {
    if (!contract) {
      await initializeProvider();
    }
    const result = await contract.getProductHistory(productId);
    // Parse the result
    const product = {
      id: Number(result[0][0]),
      name: result[0][1],
      cropType: Number(result[0][2]),
      farmer: result[0][3],
      organicCertification: result[0][4],
      farmLocation: {
        latitude: result[0][5][0],
        longitude: result[0][5][1],
        timestamp: Number(result[0][5][2]),
      },
      plantedDate: Number(result[0][6]),
      harvestDate: Number(result[0][7]),
      yieldQuantity: Number(result[0][8]),
      currentQuantity: Number(result[0][9]),
      notes: result[0][10],
      status: Number(result[0][11]),
      batchIds: result[0][12].map(id => Number(id)),
      currentCustodian: result[0][13],
      custodyDetails: result[0][14],
      receivedDate: Number(result[0][15]),
      expiryDate: Number(result[0][16]),
      retailPrice: Number(result[0][17]),
      custodyNotes: result[0][18],
      recalled: result[0][19],
      authenticityScore: Number(result[0][20]),
    };

    const batches = result[1].map(batch => ({
      batchId: Number(batch[0]),
      productId: Number(batch[1]),
      processor: batch[2],
      processedDate: Number(batch[3]),
      quantity: Number(batch[4]),
      locationHistory: batch[5].map(loc => ({
        latitude: loc[0],
        longitude: loc[1],
        timestamp: Number(loc[2]),
      })),
      sensorLogs: batch[6].map(log => ({
        timestamp: Number(log[0]),
        temperature: Number(log[1]),
        humidity: Number(log[2]),
        anomalyDetected: log[3],
      })),
      certificateIds: batch[7].map(id => Number(id)),
      facilityName: batch[8],
      certStoreHash: batch[9],
      notes: batch[10],
      packagingDetails: batch[11],
      status: Number(batch[12]),
    }));

    return { product, batches };
  } catch (error) {
    console.error('Failed to fetch product history:', error);
    throw error;
  }
};

// Verify product authenticity
export const verifyProduct = async (productId) => {
  try {
    if (!contract) {
      initializeProvider();
    }

    const result = await contract.verifyProduct(productId);

    return {
      isAuthentic: result.isAuthentic,
      score: Number(result.score),
      details: result.details,
    };
  } catch (error) {
    console.error('Failed to verify product:', error);
    throw error;
  }
};

// Get authenticity score
export const getAuthenticityScore = async (productId) => {
  try {
    if (!contract) {
      initializeProvider();
    }

    const score = await contract.getAuthenticityScore(productId);
    return Number(score);
  } catch (error) {
    console.error('Failed to get authenticity score:', error);
    throw error;
  }
};

// Format Ethereum address (truncate middle)
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Format timestamp to readable date
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date and time
export const formatDateTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Calculate carbon footprint
export const calculateCarbonFootprint = (distanceKm, storageDays) => {
  // Formula: (Distance × 0.2 kg/km) + (Storage Days × 0.1 kg/day)
  const transportEmissions = distanceKm * 0.2;
  const storageEmissions = storageDays * 0.1;
  return (transportEmissions + storageEmissions).toFixed(2);
};

// Calculate distance between two GPS coordinates (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Get score color based on value
export const getScoreColor = (score) => {
  if (score >= 90) return '#10b981'; // Excellent (green)
  if (score >= 70) return '#84cc16'; // Good (lime)
  if (score >= 50) return '#f59e0b'; // Fair (amber)
  return '#ef4444'; // Poor (red)
};

// Get score label
export const getScoreLabel = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Poor';
};

// Extract product ID from QR code URL
export const extractProductId = (qrData) => {
  try {
    // Handle various QR code formats
    // Format 1: https://veriorganic.vercel.app/consumer/1
    // Format 2: veriorganic://product/1
    // Format 3: Just the number: 1

    if (typeof qrData === 'number') {
      return qrData;
    }

    if (typeof qrData === 'string') {
      // Try URL format
      const urlMatch = qrData.match(/\/consumer\/(\d+)/);
      if (urlMatch) {
        return parseInt(urlMatch[1], 10);
      }

      // Try deep link format
      const deepLinkMatch = qrData.match(/product\/(\d+)/);
      if (deepLinkMatch) {
        return parseInt(deepLinkMatch[1], 10);
      }

      // Try just the number
      const numericMatch = qrData.match(/^\d+$/);
      if (numericMatch) {
        return parseInt(qrData, 10);
      }
    }

    throw new Error('Invalid QR code format');
  } catch (error) {
    console.error('Failed to extract product ID:', error);
    throw error;
  }
};

// Initialize on import
initializeProvider();
