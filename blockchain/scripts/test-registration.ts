import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  
  try {
    const contract = await ethers.getContractAt("OrganicSupplyChain", contractAddress);
    console.log("✅ Contract found at:", contractAddress);
    
    // Get signers
    const [deployer, farmer] = await ethers.getSigners();
    console.log("\n👤 Testing with Farmer:", farmer.address);
    
    // Check if farmer has FARMER_ROLE
    const FARMER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("FARMER_ROLE"));
    const hasFarmerRole = await contract.hasRole(FARMER_ROLE, farmer.address);
    console.log("Has FARMER_ROLE:", hasFarmerRole);
    
    // Get product count
    const productCount = await contract.getTotalProducts();
    console.log(`\n📦 Total products: ${productCount}`);
    
    // Try to register a test product
    console.log("\n🌱 Attempting to register a test product...");
    const plantedDate = Math.floor(Date.now() / 1000) - 86400 * 30;
    const expectedHarvestDate = plantedDate + 86400 * 15;

    const tx = await contract.connect(farmer).registerProduct(
      "Test Product",
      0, // CropType.Vegetables
      "QmTestHash123",
      "34.0522",
      "-118.2437",
      plantedDate,
      expectedHarvestDate
    );
    
    const receipt = await tx.wait();
    console.log("✅ Product registered successfully!");
    console.log("Transaction hash:", receipt.hash);
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Get new product count
    const newProductCount = await contract.getTotalProducts();
    console.log(`\n📦 New total products: ${newProductCount}`);
    
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    if (error.reason) console.error("Reason:", error.reason);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
