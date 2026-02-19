export const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "enum OrganicSupplyChain.CropType", "name": "cropType", "type": "uint8"},
      {"internalType": "string", "name": "organicCertHash", "type": "string"},
      {"internalType": "string", "name": "latitude", "type": "string"},
      {"internalType": "string", "name": "longitude", "type": "string"},
      {"internalType": "uint256", "name": "plantedDate", "type": "uint256"}
    ],
    "name": "registerProduct",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "productId", "type": "uint256"},
      {"internalType": "enum OrganicSupplyChain.ProductStatus", "name": "newStatus", "type": "uint8"}
    ],
    "name": "updateProductStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "productId", "type": "uint256"},
      {"internalType": "uint256", "name": "quantity", "type": "uint256"},
      {"internalType": "string", "name": "packagingDetails", "type": "string"}
    ],
    "name": "createBatch",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "batchId", "type": "uint256"},
      {"internalType": "int16", "name": "temperature", "type": "int16"},
      {"internalType": "uint16", "name": "humidity", "type": "uint16"}
    ],
    "name": "addSensorData",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "batchId", "type": "uint256"},
      {"internalType": "string", "name": "latitude", "type": "string"},
      {"internalType": "string", "name": "longitude", "type": "string"}
    ],
    "name": "updateBatchLocation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "batchId", "type": "uint256"},
      {"internalType": "address", "name": "newCustodian", "type": "address"}
    ],
    "name": "transferCustody",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "productId", "type": "uint256"},
      {"internalType": "string", "name": "issuer", "type": "string"},
      {"internalType": "uint256", "name": "validUntil", "type": "uint256"},
      {"internalType": "string", "name": "documentHash", "type": "string"}
    ],
    "name": "addCertificate",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "certificateId", "type": "uint256"}
    ],
    "name": "approveCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "productId", "type": "uint256"}
    ],
    "name": "getProductHistory",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "enum OrganicSupplyChain.CropType", "name": "cropType", "type": "uint8"},
          {"internalType": "address", "name": "farmer", "type": "address"},
          {"internalType": "string", "name": "organicCertification", "type": "string"},
          {
            "components": [
              {"internalType": "string", "name": "latitude", "type": "string"},
              {"internalType": "string", "name": "longitude", "type": "string"},
              {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
            ],
            "internalType": "struct OrganicSupplyChain.GPSCoordinates",
            "name": "farmLocation",
            "type": "tuple"
          },
          {"internalType": "uint256", "name": "plantedDate", "type": "uint256"},
          {"internalType": "uint256", "name": "harvestDate", "type": "uint256"},
          {"internalType": "enum OrganicSupplyChain.ProductStatus", "name": "status", "type": "uint8"},
          {"internalType": "uint256[]", "name": "batchIds", "type": "uint256[]"},
          {"internalType": "address", "name": "currentCustodian", "type": "address"},
          {"internalType": "bool", "name": "recalled", "type": "bool"},
          {"internalType": "uint256", "name": "authenticityScore", "type": "uint256"}
        ],
        "internalType": "struct OrganicSupplyChain.Product",
        "name": "product",
        "type": "tuple"
      },
      {
        "components": [
          {"internalType": "uint256", "name": "batchId", "type": "uint256"},
          {"internalType": "uint256", "name": "productId", "type": "uint256"},
          {"internalType": "address", "name": "processor", "type": "address"},
          {"internalType": "uint256", "name": "processedDate", "type": "uint256"},
          {"internalType": "uint256", "name": "quantity", "type": "uint256"},
          {
            "components": [
              {"internalType": "string", "name": "latitude", "type": "string"},
              {"internalType": "string", "name": "longitude", "type": "string"},
              {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
            ],
            "internalType": "struct OrganicSupplyChain.GPSCoordinates[]",
            "name": "locationHistory",
            "type": "tuple[]"
          },
          {
            "components": [
              {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
              {"internalType": "int16", "name": "temperature", "type": "int16"},
              {"internalType": "uint16", "name": "humidity", "type": "uint16"},
              {"internalType": "bool", "name": "anomalyDetected", "type": "bool"}
            ],
            "internalType": "struct OrganicSupplyChain.SensorData[]",
            "name": "sensorLogs",
            "type": "tuple[]"
          },
          {"internalType": "uint256[]", "name": "certificateIds", "type": "uint256[]"},
          {"internalType": "string", "name": "packagingDetails", "type": "string"},
          {"internalType": "enum OrganicSupplyChain.ProductStatus", "name": "status", "type": "uint8"}
        ],
        "internalType": "struct OrganicSupplyChain.Batch[]",
        "name": "productBatches",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "productId", "type": "uint256"}
    ],
    "name": "verifyProduct",
    "outputs": [
      {"internalType": "bool", "name": "isAuthentic", "type": "bool"},
      {"internalType": "uint256", "name": "score", "type": "uint256"},
      {"internalType": "string", "name": "details", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "productId", "type": "uint256"}
    ],
    "name": "getAuthenticityScore",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "farmer", "type": "address"}
    ],
    "name": "getFarmerProducts",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalProducts",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "productId", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
      {"indexed": true, "internalType": "address", "name": "farmer", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "plantedDate", "type": "uint256"}
    ],
    "name": "ProductRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "productId", "type": "uint256"},
      {"indexed": false, "internalType": "enum OrganicSupplyChain.ProductStatus", "name": "oldStatus", "type": "uint8"},
      {"indexed": false, "internalType": "enum OrganicSupplyChain.ProductStatus", "name": "newStatus", "type": "uint8"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "ProductStatusUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "batchId", "type": "uint256"},
      {"indexed": true, "internalType": "uint256", "name": "productId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "processor", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "quantity", "type": "uint256"}
    ],
    "name": "BatchCreated",
    "type": "event"
  }
] as const;

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "1337");
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";

export const CROP_TYPES = ["Vegetables", "Fruits", "Grains", "Herbs", "Other"];

export const PRODUCT_STATUS = [
  "Planted",
  "Harvested",
  "Processing",
  "Processed",
  "Packaged",
  "InTransit",
  "Delivered",
  "Recalled"
];

export const NETWORK_CONFIG = {
  chainId: `0x${CHAIN_ID.toString(16)}`,
  chainName: CHAIN_ID === 1337 ? "Hardhat Local" : "Sepolia Testnet",
  rpcUrls: [RPC_URL],
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18
  }
};
