import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  
  try {
    const contract = await ethers.getContractAt("OrganicSupplyChain", contractAddress);
    console.log("✅ Contract found at:", contractAddress);
    
    // Test contract functions availability
    console.log("\n📋 Testing contract methods:");
    
    // Check if key methods exist
    console.log("\nKey functions:");
    console.log("- registerProduct:", typeof contract.registerProduct === "function");
    console.log("- updateProductStatus:", typeof contract.updateProductStatus === "function");
    console.log("- createBatch:", typeof contract.createBatch === "function");
    console.log("- getProduct:", typeof contract.getProduct === "function");
    
    // Get product counter
    const productCounter = await contract.productCounter();
    console.log(`\n📦 Total products registered: ${productCounter}`);
    
    // If products exist, show first product
    if (productCounter > 0) {
      const product = await contract.getProduct(1);
      console.log("\n🌱 Sample Product #1:");
      console.log("  Name:", product.name);
      console.log("  Farmer:", product.farmer);
      console.log("  Status:", product.status);
    }
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
