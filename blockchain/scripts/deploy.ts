import { ethers } from "hardhat";
import { upgrades } from "hardhat";
const network = require("hardhat").network;
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

async function main() {
  console.log("🚀 Deploying OrganicSupplyChain contract...");
  console.log("📡 Network:", network.name);

  // Check for --reset flag
  const args = process.argv.slice(2);
  const shouldReset = args.includes("--reset");
  const shouldSeed = !args.includes("--no-seed");
  
  if (shouldReset) {
    console.log("🔄 Reset flag detected - forcing fresh deployment");
  }

  const signers = await ethers.getSigners();
  const [deployer, farmer, processor, retailer, inspector, consumer] = signers;
  
  console.log("\n👤 Account Setup:");
  console.log("Deployer:  ", deployer.address);
  console.log("Farmer:    ", farmer?.address || "N/A");
  console.log("Processor: ", processor?.address || "N/A");
  console.log("Retailer:  ", retailer?.address || "N/A");
  console.log("Inspector: ", inspector?.address || "N/A");
  console.log("\nDeployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Deploy the contract as upgradeable proxy
  const OrganicSupplyChain = await ethers.getContractFactory("OrganicSupplyChain");
  
  console.log("\n📦 Deploying UUPS proxy...");
  const contract = await upgrades.deployProxy(
    OrganicSupplyChain,
    [],
    { 
      initializer: "initialize",
      kind: "uups"
    }
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(contractAddress);

  console.log("✅ Proxy deployed to:         ", contractAddress);
  console.log("📝 Implementation address:    ", implementationAddress);
  
  // Grant roles to multiple test accounts
  console.log("\n🔐 Setting up role-based access control...");

  if (farmer) {
    await contract.grantFarmerRole(farmer.address);
    console.log("✓ Granted FARMER_ROLE to:     ", farmer.address);
  }
  
  if (processor) {
    await contract.grantProcessorRole(processor.address);
    console.log("✓ Granted PROCESSOR_ROLE to:  ", processor.address);
  }
  
  if (retailer) {
    await contract.grantRetailerRole(retailer.address);
    console.log("✓ Granted RETAILER_ROLE to:   ", retailer.address);
  }
  
  if (inspector) {
    await contract.grantInspectorRole(inspector.address);
    console.log("✓ Granted INSPECTOR_ROLE to:  ", inspector.address);
  }

  // Also grant deployer all roles for convenience
  await contract.grantFarmerRole(deployer.address);
  await contract.grantProcessorRole(deployer.address);
  await contract.grantRetailerRole(deployer.address);
  await contract.grantInspectorRole(deployer.address);
  console.log("✓ Granted all roles to deployer for testing");

  // Save deployment information
  const deploymentInfo = {
    network: network.name,
    contractAddress,
    implementationAddress,
    deployer: deployer.address,
    farmer: farmer?.address || deployer.address,
    processor: processor?.address || deployer.address,
    retailer: retailer?.address || deployer.address,
    inspector: inspector?.address || deployer.address,
    timestamp: new Date().toISOString(),
    version: await contract.version(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  // Write deployed.json
  const deployedPath = path.join(__dirname, "..", "deployed.json");
  fs.writeFileSync(deployedPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", deployedPath);

  // Copy ABI to frontend
  const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "OrganicSupplyChain.sol", "OrganicSupplyChain.json");
  if (fs.existsSync(artifactPath)) {
    const frontendAbiPath = path.join(__dirname, "..", "..", "frontend", "contracts", "OrganicSupplyChain.json");
    fs.mkdirSync(path.dirname(frontendAbiPath), { recursive: true });
    fs.copyFileSync(artifactPath, frontendAbiPath);
    console.log("✓ ABI copied to frontend/contracts/");
  }

  // Run seed script if requested
  if (shouldSeed) {
    console.log("\n🌱 Seeding demo data...");
    try {
      execSync(`npx hardhat run scripts/seed-data.ts --network ${network.name}`, {
        stdio: "inherit",
        cwd: path.join(__dirname, "..")
      });
      console.log("✓ Demo data seeded successfully");
    } catch (error: any) {
      console.log("⚠️  Seeding failed (this is optional):", error.message);
    }
  } else {
    console.log("\n⏭️  Skipping seed data (--no-seed flag)");
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:              ", network.name);
  console.log("Contract Address:     ", contractAddress);
  console.log("Implementation:       ", implementationAddress);
  console.log("Version:              ", deploymentInfo.version);
  console.log("Block Number:         ", deploymentInfo.blockNumber);
  console.log("Timestamp:            ", deploymentInfo.timestamp);
  console.log("=".repeat(60));

  console.log("\n💡 Next Steps:");
  console.log("1. Update frontend/.env.local with:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`   NEXT_PUBLIC_NETWORK=${network.name}`);
  console.log("\n2. Verify contract (optional):");
  console.log(`   npx hardhat verify --network ${network.name} ${contractAddress}`);
  console.log("\n3. Start the frontend:");
  console.log("   cd frontend && npm run dev");
  console.log("\n4. View demo products (if seeded):");
  console.log("   Open http://localhost:3000/consumer");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
