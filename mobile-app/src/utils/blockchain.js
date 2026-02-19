import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, RPC_URL, CHAIN_ID } from './constants';

// Initialize provider (read-only)
let provider;
let contract;

export const initializeProvider = () => {
  try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
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
      initializeProvider();
    }
    
    const result = await contract.getProductHistory(productId);
    
    // Parse the result
    const product = {
      id: Number(result.product.id),
      name: result.product.name,
      cropType: Number(result.product.cropType),
      farmer: result.product.farmer,
      organicCertification: result.product.organicCertification,
      farmLocation: {
        latitude: result.product.farmLocation.latitude,
        longitude: result.product.farmLocation.longitude,
        timestamp: Number(result.product.farmLocation.timestamp),
      },
      plantedDate: Number(result.product.plantedDate),
      harvestDate: Number(result.product.harvestDate),
      status: Number(result.product.status),
      batchIds: result.product.batchIds.map(id => Number(id)),
      currentCustodian: result.product.currentCustodian,
      recalled: result.product.recalled,
      authenticityScore: Number(result.product.authenticityScore),
    };
    
    const batches = result.batches.map(batch => ({
      batchId: Number(batch.batchId),
      productId: Number(batch.productId),
      processor: batch.processor,
      processedDate: Number(batch.processedDate),
      quantity: Number(batch.quantity),
      locationHistory: batch.locationHistory.map(loc => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
        timestamp: Number(loc.timestamp),
      })),
      sensorLogs: batch.sensorLogs.map(log => ({
        timestamp: Number(log.timestamp),
        temperature: Number(log.temperature),
        humidity: Number(log.humidity),
        anomalyDetected: log.anomalyDetected,
      })),
      certificateIds: batch.certificateIds.map(id => Number(id)),
      packagingDetails: batch.packagingDetails,
      status: Number(batch.status),
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
