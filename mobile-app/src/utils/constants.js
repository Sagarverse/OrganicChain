// Replace with your actual contract address
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Chain configuration
export const CHAIN_ID = 11155111; // Sepolia
export const RPC_URL = "https://sepolia.infura.io/v3/YOUR_PROJECT_ID";

// Contract ABI (partial - key functions)
export const CONTRACT_ABI = [
  "function initialize() public",
  "function registerProduct(string memory _name, uint8 _cropType, string memory _certificationHash, string memory _latitude, string memory _longitude, uint256 _plantedDate, uint256 _harvestDate) public returns (uint256)",
  "function updateProductStatus(uint256 _productId, uint8 _newStatus) public",
  "function createBatch(uint256 _productId, uint256 _quantity, string memory _packagingDetails) public returns (uint256)",
  "function addSensorData(uint256 _batchId, int16 _temperature, uint16 _humidity) public",
  "function updateBatchLocation(uint256 _batchId, string memory _latitude, string memory _longitude) public",
  "function transferCustody(uint256 _productId, address _newCustodian) public",
  "function getProductHistory(uint256 _productId) public view returns (tuple(uint256 id, string name, uint8 cropType, address farmer, string organicCertification, tuple(string latitude, string longitude, uint256 timestamp) farmLocation, uint256 plantedDate, uint256 harvestDate, uint8 status, uint256[] batchIds, address currentCustodian, bool recalled, uint256 authenticityScore) product, tuple(uint256 batchId, uint256 productId, address processor, uint256 processedDate, uint256 quantity, tuple(string latitude, string longitude, uint256 timestamp)[] locationHistory, tuple(uint256 timestamp, int16 temperature, uint16 humidity, bool anomalyDetected)[] sensorLogs, uint256[] certificateIds, string packagingDetails, uint8 status)[] batches)",
  "function verifyProduct(uint256 _productId) public view returns (bool isAuthentic, uint256 score, string memory details)",
  "function getAuthenticityScore(uint256 _productId) public view returns (uint256)",
  "function getFarmerProducts(address _farmer) public view returns (uint256[] memory)",
  "function getTotalProducts() public view returns (uint256)",
  "event ProductRegistered(uint256 indexed productId, string name, address indexed farmer, uint256 timestamp)",
  "event ProductStatusUpdated(uint256 indexed productId, uint8 newStatus, uint256 timestamp)",
  "event BatchCreated(uint256 indexed batchId, uint256 indexed productId, address processor, uint256 timestamp)",
  "event CustodyTransferred(uint256 indexed productId, address indexed from, address indexed to, uint256 timestamp)",
  "event SensorDataRecorded(uint256 indexed batchId, int16 temperature, uint16 humidity, bool anomalyDetected, uint256 timestamp)",
  "event LocationUpdated(uint256 indexed batchId, string latitude, string longitude, uint256 timestamp)",
  "event AuthenticityScoreUpdated(uint256 indexed productId, uint256 newScore, uint256 timestamp)"
];

// Enums
export const CROP_TYPES = [
  "Vegetables",
  "Fruits",
  "Grains",
  "Herbs",
  "Other"
];

export const PRODUCT_STATUS = [
  "Planted",
  "Harvested",
  "Processing",
  "Processed",
  "Packaged",
  "In Transit",
  "Delivered",
  "Recalled"
];

// IPFS Configuration
export const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

// App Configuration
export const APP_NAME = "VeriOrganic";
export const APP_VERSION = "1.0.0";
export const WEB_URL = "https://veriorganic.vercel.app";
