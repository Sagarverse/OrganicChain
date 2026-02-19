import ContractArtifact from '../contracts/OrganicSupplyChain.json';

export const CONTRACT_ABI = ContractArtifact.abi as any;

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1337');
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545';

export const CROP_TYPES = ['Vegetables', 'Fruits', 'Grains', 'Herbs', 'Other'];

export const PRODUCT_STATUS = [
  'Planted',
  'Harvested',
  'Processing',
  'Processed',
  'Packaged',
  'InTransit',
  'Delivered',
  'Recalled'
];

export const NETWORK_CONFIG = {
  chainId: `0x${CHAIN_ID.toString(16)}`,
  chainName: CHAIN_ID === 1337 ? 'Hardhat Local' : 'Sepolia Testnet',
  rpcUrls: [RPC_URL],
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18
  }
};
