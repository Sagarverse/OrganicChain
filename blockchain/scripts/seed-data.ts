import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * This script seeds the blockchain with realistic demo data
 * Creates 5 organic products with full lifecycle tracking
 */

interface ProductData {
  name: string;
  cropType: number;
  certHash: string;
  lat: string;
  long: string;
  plantedDate: number;
  location: string;
  farmerName: string;
}

const products: ProductData[] = [
  {
    name: "Organic Hass Avocados",
    cropType: 1, // Fruits
    certHash: "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX",
    lat: "34.0522",
    long: "-118.2437",
    plantedDate: Date.now() - 180 * 24 * 60 * 60 * 1000, // 180 days ago
    location: "California, USA",
    farmerName: "Green Valley Farms"
  },
  {
    name: "Heirloom Tomatoes",
    cropType: 0, // Vegetables
    certHash: "QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqB",
    lat: "27.9506",
    long: "-82.4572",
    plantedDate: Date.now() - 120 * 24 * 60 * 60 * 1000, // 120 days ago
    location: "Florida, USA",
    farmerName: "Sunshine Organic Gardens"
  },
  {
    name: "Wild Blueberries",
    cropType: 1, // Fruits
    certHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    lat: "44.3106",
    long: "-69.7795",
    plantedDate: Date.now() - 240 * 24 * 60 * 60 * 1000, // 240 days ago
    location: "Maine, USA",
    farmerName: "Coastal Berry Co-op"
  },
  {
    name: "Organic Honeycrisp Apples",
    cropType: 1, // Fruits
    certHash: "QmRKs3JX98P9xDgGqg9eWVWdqwYiZx5bfVobRvFZja8GVk",
    lat: "47.7511",
    long: "-120.7401",
    plantedDate: Date.now() - 200 * 24 * 60 * 60 * 1000, // 200 days ago
    location: "Washington, USA",
    farmerName: "Cascade Orchards"
  },
  {
    name: "Heritage Purple Potatoes",
    cropType: 0, // Vegetables
    certHash: "QmNrEidQrAbxx3FzxNt9E6qjEDZrtvzxUVh97c4CXv5VeN",
    lat: "43.6150",
    long: "-116.2023",
    plantedDate: Date.now() - 150 * 24 * 60 * 60 * 1000, // 150 days ago
    location: "Idaho, USA",
    farmerName: "Mountain View Farm"
  }
];

async function main() {
  console.log("🌱 Starting seed data generation...\n");

  // Get contract instance
  const contractAddress = process.env.CONTRACT_ADDRESS || "";
  if (!contractAddress) {
    console.error("❌ Please set CONTRACT_ADDRESS environment variable");
    process.exit(1);
  }

  const [deployer, processor, retailer, inspector] = await ethers.getSigners();
  const OrganicSupplyChain = await ethers.getContractFactory("OrganicSupplyChain");
  const contract = OrganicSupplyChain.attach(contractAddress);

  console.log("📝 Using contract at:", contractAddress);
  console.log("👤 Deployer:", deployer.address);
  console.log("🏭 Processor:", processor.address);
  console.log("🏪 Retailer:", retailer.address);
  console.log("🔍 Inspector:", inspector.address);
  console.log();

  // Grant roles
  console.log("🔐 Setting up roles...");
  await contract.grantProcessorRole(processor.address);
  await contract.grantRetailerRole(retailer.address);
  await contract.grantInspectorRole(inspector.address);
  console.log("✓ Roles granted\n");

  const createdProducts: any[] = [];

  // Create products and simulate lifecycle
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📦 Creating Product ${i + 1}: ${product.name}`);
    console.log(`${"=".repeat(60)}`);

    // Register product
    console.log("1️⃣ Registering product...");
    const plantedDate = Math.floor(product.plantedDate / 1000);
    const expectedHarvestDate = plantedDate + (90 * 24 * 60 * 60);
    const tx = await contract.registerProduct(
      product.name,
      product.cropType,
      product.certHash,
      product.lat,
      product.long,
      plantedDate,
      expectedHarvestDate
    );
    await tx.wait();
    
    const productId = Number(await contract.getTotalProducts());
    console.log(`   ✓ Product ID: ${productId}`);

    // Simulate harvest
    console.log("2️⃣ Harvesting product...");
    await (await contract.harvestProduct(productId, 250, "Harvested at peak ripeness")).wait();
    console.log("   ✓ Status: Harvested");

    // Process batch (processor)
    console.log("3️⃣ Processing batch...");
    const temperatures = Array.from({ length: 5 }, () => Math.floor(Math.random() * 1000) + 200);
    const humidities = Array.from({ length: 5 }, () => Math.floor(Math.random() * 2000) + 6000);
    const batchTx = await contract.connect(processor).processBatch(
      productId,
      Math.floor(Math.random() * 500) + 100, // 100-600 kg
      `${product.location} Processing Facility`,
      temperatures,
      humidities,
      "Washed, sorted, and packed",
      `QmProcessingCert${productId}${Date.now()}`
    );
    await batchTx.wait();
    const batchId = Number(await contract.getTotalBatches());
    console.log(`   ✓ Batch ID: ${batchId}`);

    console.log("4️⃣ Recording sensor data during processing...");
    console.log(`   ✓ Sample reading: ${temperatures[0]/100}°C, ${humidities[0]/100}% humidity`);

    // Add location tracking
    console.log("5️⃣ Tracking location during transport...");
    const locations = [
      { lat: product.lat, long: product.long }, // Origin
      { lat: (parseFloat(product.lat) + 0.5).toString(), long: (parseFloat(product.long) + 0.5).toString() },
      { lat: (parseFloat(product.lat) + 1.0).toString(), long: (parseFloat(product.long) + 1.0).toString() }
    ];
    
    for (const loc of locations) {
      await (await contract.connect(processor).updateBatchLocation(batchId, loc.lat, loc.long)).wait();
    }
    console.log(`   ✓ Tracked ${locations.length} location points`);

    // Add certificate
    console.log("6️⃣ Adding organic certification...");
    const validUntil = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60); // Valid for 1 year
    const certTx = await contract.connect(processor).addCertificate(
      productId,
      `USDA Organic Certifier - ${product.location}`,
      validUntil,
      `QmCert${productId}${Date.now()}`
    );
    await certTx.wait();
    const certId = Number(await contract.getTotalCertificates());
    
    // Approve certificate
    await (await contract.connect(inspector).approveCertificate(certId)).wait();
    console.log(`   ✓ Certificate ${certId} approved by inspector`);

    // Add certificate to batch
    await (await contract.connect(processor).addCertificateToBatch(batchId, certId)).wait();
    console.log("   ✓ Certificate linked to batch");

    // Transfer custody to retailer
    console.log("8️⃣ Transferring to retailer...");
    await (await contract.connect(processor)["transferCustody(uint256,address,string)"](
      productId,
      retailer.address,
      "Shipment dispatched to retailer"
    )).wait();
    console.log("   ✓ Custody transferred to retailer");

    // Retailer receives product
    console.log("9️⃣ Retailer receiving product...");
    const receivedDate = Math.floor(Date.now() / 1000);
    const expiryDate = receivedDate + (14 * 24 * 60 * 60);
    await (await contract.connect(retailer).receiveProduct(
      productId,
      receivedDate,
      expiryDate,
      4999,
      "Received in good condition"
    )).wait();
    console.log("   ✓ Status: Delivered");

    // Get authenticity score
    const score = await contract.getAuthenticityScore(productId);
    console.log(`\n🎯 Final Authenticity Score: ${score}/100`);

    createdProducts.push({
      productId,
      batchId,
      name: product.name,
      farmer: product.farmerName,
      location: product.location,
      score: score.toString(),
      qrData: `${productId}`
    });
  }

  // Create demo fraud scenario (Product 6)
  console.log(`\n${"=".repeat(60)}`);
  console.log("⚠️  DEMO: Creating Fraudulent Product");
  console.log(`${"=".repeat(60)}`);
  
  const fraudPlantedDate = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
  const fraudExpectedHarvestDate = fraudPlantedDate + (60 * 24 * 60 * 60);
  const fraudTx = await contract.registerProduct(
    "Suspicious Organic Kale",
    0,
    "QmFraud123", // Suspicious cert
    "0.0000",
    "0.0000",
    fraudPlantedDate,
    fraudExpectedHarvestDate
  );
  await fraudTx.wait();
  
  const fraudId = Number(await contract.getTotalProducts());
  
  // Harvest and process with anomalous sensor data
  await (await contract.harvestProduct(fraudId, 50, "Harvested under questionable conditions")).wait();

  const fraudTemps = Array.from({ length: 5 }, () => 5000); // 50C anomaly
  const fraudHumidities = Array.from({ length: 5 }, () => 9500);
  const fraudBatchTx = await contract.connect(processor).processBatch(
    fraudId,
    50,
    "Unknown Facility",
    fraudTemps,
    fraudHumidities,
    "Questionable Processing",
    "QmFraudProcessing"
  );
  await fraudBatchTx.wait();
  
  // Flag tamper to demonstrate score drop
  await (await contract.flagTamper(fraudId, "Tamper test: inconsistent logs")).wait();
  const fraudScore = await contract.getAuthenticityScore(fraudId);
  console.log(`🚨 Fraud Detection Score: ${fraudScore}/100 (Multiple anomalies detected!)`);

  createdProducts.push({
    productId: fraudId,
    batchId: Number(await contract.getTotalBatches()),
    name: "Suspicious Organic Kale",
    farmer: "Unknown Supplier",
    location: "Unknown",
    score: fraudScore.toString(),
    qrData: `${fraudId}`,
    isFraud: true
  });

  // Save data to JSON for frontend
  console.log("\n💾 Saving demo data...");
  const outputData = {
    contractAddress,
    network: "localhost",
    timestamp: new Date().toISOString(),
    products: createdProducts,
    accounts: {
      deployer: deployer.address,
      processor: processor.address,
      retailer: retailer.address,
      inspector: inspector.address
    }
  };

  const outputPath = path.join(__dirname, "../../frontend/data/seed-data.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  console.log("✓ Data saved to:", outputPath);

  console.log("\n" + "=".repeat(60));
  console.log("✅ SEED DATA GENERATION COMPLETE");
  console.log("=".repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   • Products created: ${createdProducts.length}`);
  console.log(`   • Legitimate products: ${createdProducts.filter(p => !p.isFraud).length}`);
  console.log(`   • Fraud demo: 1`);
  console.log(`   • Total batches: ${createdProducts.length}`);
  console.log(`   • Certificates issued: ${products.length}`);
  console.log(`\n🔗 Contract: ${contractAddress}`);
  console.log(`\n🌐 Next Steps:`);
  console.log(`   1. Copy contract address to frontend .env`);
  console.log(`   2. Generate QR codes for products`);
  console.log(`   3. Start the frontend: cd frontend && npm run dev`);
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
