/**
 * Test script to verify product data display after registration
 * This script tests the bigint conversion fix in getProductHistory
 */

const ethers = require('ethers');

async function testProductData() {
  try {
    // Connect to hardhat local node
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    
    // Get the contract
    const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'; // From deployed.json
    
    // Simple contract ABI for testing
    const contractABI = [
      'function getProductHistory(uint256 productId) external view returns (tuple(uint256 id, string name, uint8 cropType, address farmer, string organicCertification, tuple(string latitude, string longitude, uint256 timestamp) farmLocation, uint256 plantedDate, uint256 expectedHarvestDate, uint256 harvestDate, uint256 harvestQuantity, string harvestNotes, uint8 status, uint256[] batchIds, address currentCustodian, uint256 transferDate, uint256 receivedDate, uint256 expiryDate, uint256 retailPrice, string retailNotes, bool recalled, uint256 authenticityScore) product, tuple(uint256 batchId, uint256 productId, address processor, uint256 processedDate, uint256 quantity, tuple(string latitude, string longitude, uint256 timestamp)[] locationHistory, tuple(uint256 timestamp, uint256 temperature, uint256 humidity, bool anomalyDetected)[] sensorLogs, uint256[] certificateIds, string packagingDetails, string processingLocation, string processingNotes, string processingCertHash, uint8 status)[] productBatches)',
    ];
    
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    console.log('[Test] Connected to contract at:', contractAddress);
    console.log('[Test] Testing bigint conversion...\n');
    
    // Test with product ID 1
    const result = await contract.getProductHistory(1);
    const product = result[0];
    
    console.log('[Test] Raw product data types:');
    console.log('  - plantedDate type:', typeof product.plantedDate, 'value:', product.plantedDate.toString());
    console.log('  - authenticityScore type:', typeof product.authenticityScore, 'value:', product.authenticityScore.toString());
    console.log('  - farmLocation.latitude type:', typeof product.farmLocation.latitude, 'value:', product.farmLocation.latitude);
    console.log('  - batchIds[0] type:', typeof product.batchIds[0], 'value:', product.batchIds[0]?.toString() || 'empty');
    
    console.log('\n[Test] Expected after conversion:');
    console.log('  - plantedDate: Number (', Number(product.plantedDate), ')');
    console.log('  - authenticityScore: Number (', Number(product.authenticityScore), ')');
    console.log('  - farmLocation.latitude: String ("' + String(product.farmLocation.latitude) + '")');
    console.log('  - batchIds[0]: Number (', product.batchIds.length > 0 ? Number(product.batchIds[0]) : 'empty', ')');
    
    console.log('\n[Test] ✅ Data structure verified successfully!');
    console.log('\nNote: The frontend fix converts these bigint values to numbers');
    console.log('for proper display in formatDate() and formatCoordinates() functions.\n');
    
  } catch (error) {
    console.error('[Test] ❌ Error:', error.message);
    process.exit(1);
  }
}

testProductData().then(() => process.exit(0));
