// Replace with your actual contract address
export const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// Chain configuration
export const CHAIN_ID = 31337; // Localhost Hardhat
export const RPC_URL = "http://10.1.37.128:8545";
export const DEFAULT_RPC_URL = RPC_URL;

// Contract ABI (partial - key functions)
export const CONTRACT_ABI = [
  'event AdminChanged(address,address)',
  'event AuthenticityScoreUpdated(uint256 indexed,uint256)',
  'event BatchCompleted(uint256 indexed,uint256 indexed,uint256)',
  'event BatchCreated(uint256 indexed,uint256 indexed,address indexed,uint256)',
  'event BatchDeleted(uint256 indexed,address indexed,uint256)',
  'event BatchProcessed(uint256 indexed,uint256 indexed,address indexed,uint256)',
  'event BeaconUpgraded(address indexed)',
  'event CertificateAdded(uint256 indexed,uint256 indexed,string,uint256)',
  'event CertificateApproved(uint256 indexed,address indexed)',
  'event CertificateRejected(uint256 indexed,address indexed,string)',
  'event CustodyTransferred(uint256 indexed,address indexed,address indexed,uint256)',
  'event DeliveryAccepted(uint256 indexed,address indexed,address indexed,uint256)',
  'event Initialized(uint8)',
  'event LocationUpdated(uint256 indexed,string,string,uint256)',
  'event Paused(address)',
  'event ProductCustodyTransferred(uint256 indexed,address indexed,address indexed,string,uint256)',
  'event ProductDeleted(uint256 indexed,address indexed,uint256)',
  'event ProductHarvested(uint256 indexed,uint256,uint256,address indexed,string)',
  'event ProductRecalled(uint256 indexed,string,uint256)',
  'event ProductReceived(uint256 indexed,address indexed,uint256,uint256,uint256,string)',
  'event ProductRegistered(uint256 indexed,string,address indexed,uint256)',
  'event ProductStatusUpdated(uint256 indexed,uint8,uint8,uint256)',
  'event RoleAdminChanged(bytes32 indexed,bytes32 indexed,bytes32 indexed)',
  'event RoleGranted(bytes32 indexed,address indexed,address indexed)',
  'event RoleRevoked(bytes32 indexed,address indexed,address indexed)',
  'event SensorDataRecorded(uint256 indexed,int16,uint16,bool)',
  'event TamperFlagged(uint256 indexed,address indexed,string,uint256)',
  'event Unpaused(address)',
  'event Upgraded(address indexed)',
  'function DEFAULT_ADMIN_ROLE() view returns (bytes32)',
  'function FARMER_ROLE() view returns (bytes32)',
  'function INSPECTOR_ROLE() view returns (bytes32)',
  'function PROCESSOR_ROLE() view returns (bytes32)',
  'function RETAILER_ROLE() view returns (bytes32)',
  'function UPGRADER_ROLE() view returns (bytes32)',
  'function acceptDelivery(uint256)',
  'function addCertificate(uint256,string,uint256,string) returns (uint256)',
  'function addCertificateToBatch(uint256,uint256)',
  'function addSensorData(uint256,int16,uint16)',
  'function approveCertificate(uint256)',
  'function batches(uint256) view returns (uint256,uint256,address,uint256,uint256,string,string,string,string,uint8)',
  'function certificates(uint256) view returns (uint256,string,uint256,uint256,string,bool,bool,address,string)',
  'function completeBatchProcessing(uint256)',
  'function createBatch(uint256,uint256,string) returns (uint256)',
  'function custodianBatches(address,uint256) view returns (uint256)',
  'function deleteBatch(uint256)',
  'function deleteProduct(uint256)',
  'function farmerProducts(address,uint256) view returns (uint256)',
  'function flagTamper(uint256,string)',
  'function getAuthenticityScore(uint256) view returns (uint256)',
  'function getAvailableBatches() view returns (uint256[])',
  'function getBatchDetails(uint256) view returns ((uint256,uint256,address,uint256,uint256,(string,string,uint256)[],(uint256,int16,uint16,bool)[],uint256[],string,string,string,string,uint8))',
  'function getCertificate(uint256) view returns ((uint256,string,uint256,uint256,string,bool,bool,address,string))',
  'function getCustodianBatches(address) view returns (uint256[])',
  'function getFarmerProducts(address) view returns (uint256[])',
  'function getPendingCertificates() view returns (uint256[])',
  'function getProductHistory(uint256) view returns ((uint256,string,uint8,address,string,(string,string,uint256),uint256,uint256,uint256,uint256,string,uint8,uint256[],address,uint256,uint256,uint256,uint256,string,bool,uint256),(uint256,uint256,address,uint256,uint256,(string,string,uint256)[],(uint256,int16,uint16,bool)[],uint256[],string,string,string,string,uint8)[])',
  'function getRoleAdmin(bytes32) view returns (bytes32)',
  'function getTotalBatches() view returns (uint256)',
  'function getTotalCertificates() view returns (uint256)',
  'function getTotalProducts() view returns (uint256)',
  'function grantFarmerRole(address)',
  'function grantInspectorRole(address)',
  'function grantProcessorRole(address)',
  'function grantRetailerRole(address)',
  'function grantRole(bytes32,address)',
  'function harvestProduct(uint256,uint256,string)',
  'function hasRole(bytes32,address) view returns (bool)',
  'function initialize()',
  'function pause()',
  'function paused() view returns (bool)',
  'function processBatch(uint256,uint256,string,int16[],uint16[],string,string) returns (uint256)',
  'function productUpdates(uint256) view returns (uint256)',
  'function products(uint256) view returns (uint256,string,uint8,address,string,(string,string,uint256),uint256,uint256,uint256,uint256,string,uint8,address,uint256,uint256,uint256,uint256,string,bool,uint256)',
  'function proxiableUUID() view returns (bytes32)',
  'function recallProduct(uint256,string)',
  'function receiveProduct(uint256,uint256,uint256,uint256,string)',
  'function registerProduct(string,uint8,string,string,string,uint256,uint256) returns (uint256)',
  'function rejectCertificate(uint256,string)',
  'function renounceRole(bytes32,address)',
  'function revokeRole(bytes32,address)',
  'function supportsInterface(bytes4) view returns (bool)',
  'function transferCustody(uint256,address)',
  'function transferCustody(uint256,address,string)',
  'function unpause()',
  'function updateBatchLocation(uint256,string,string)',
  'function updateProductStatus(uint256,uint8)',
  'function upgradeTo(address)',
  'function upgradeToAndCall(address,bytes) payable',
  'function verifyProduct(uint256) view returns (bool,uint256,string)',
  'function version() pure returns (string)'
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
export const APP_NAME = "OrganicChain";
export const APP_VERSION = "1.0.0";
export const WEB_URL = "http://10.1.37.128:3000";
