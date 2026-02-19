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
    const tx = await contract.registerProduct(
      product.name,
      product.cropType,
      product.certHash,
      product.lat,
      product.long,
      product.plantedDate
    );
    await tx.wait();
    
    const productId = i + 1;
    console.log(`   ✓ Product ID: ${productId}`);

    // Simulate harvest
    console.log("2️⃣ Updating to Harvested...");
    await (await contract.updateProductStatus(productId, 1)).wait(); // Harvested
    console.log("   ✓ Status: Harvested");

    // Create batch (processor)
    console.log("3️⃣ Creating processing batch...");
    const batchTx = await contract.connect(processor).createBatch(
      productId,
      Math.floor(Math.random() * 500) + 100, // 100-600 kg
      `Certified Organic Packaging - Batch ${productId}-${Date.now()}`
    );
    await batchTx.wait();
    const batchId = i + 1;
    console.log(`   ✓ Batch ID: ${batchId}`);

    // Add sensor data during processing
    console.log("4️⃣ Recording sensor data during processing...");
    const sensorReadings = 5;
    for (let j = 0; j < sensorReadings; j++) {
      const temp = Math.floor(Math.random() * 1000) + 200; // 2-12°C
      const humidity = Math.floor(Math.random() * 2000) + 6000; // 60-80%
      await (await contract.connect(processor).addSensorData(batchId, temp, humidity)).wait();
      
      if (j === 0) {
        console.log(`   ✓ Sample reading: ${temp/100}°C, ${humidity/100}% humidity`);
      }
    }
    console.log(`   ✓ Recorded ${sensorReadings} sensor readings`);

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
    const certId = i + 1;
    
    // Approve certificate
    await (await contract.connect(inspector).approveCertificate(certId)).wait();
    console.log(`   ✓ Certificate ${certId} approved by inspector`);

    // Add certificate to batch
    await (await contract.connect(processor).addCertificateToBatch(batchId, certId)).wait();
    console.log("   ✓ Certificate linked to batch");

    // Update to processed
    console.log("7️⃣ Completing processing...");
    await (await contract.connect(processor).updateProductStatus(productId, 3)).wait(); // Processed
    console.log("   ✓ Status: Processed");

    // Transfer custody to processor first (current custodian starts as deployer)
    console.log("8️⃣ Transferring to processor...");
    await (await contract.connect(deployer).transferCustody(batchId, processor.address)).wait();
    console.log("   ✓ Custody transferred to processor");

    // Transfer custody to retailer
    console.log("9️⃣ Transferring to retailer...");
    await (await contract.connect(processor).transferCustody(batchId, retailer.address)).wait();
    console.log("   ✓ Custody transferred to retailer");

    // Update to delivered
    await (await contract.connect(retailer).updateProductStatus(productId, 6)).wait(); // Delivered
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
  
  const fraudTx = await contract.registerProduct(
    "Suspicious Organic Kale",
    0,
    "QmFraud123", // Suspicious cert
    "0.0000",
    "0.0000",
    Date.now() - 30 * 24 * 60 * 60 * 1000
  );
  await fraudTx.wait();
  
  const fraudId = 6;
  
  // Create batch with anomalous sensor data
  const fraudBatchTx = await contract.connect(processor).createBatch(
    fraudId,
    50,
    "Questionable Packaging"
  );
  await fraudBatchTx.wait();
  
  // Add anomalous sensor data (temperature too high)
  for (let j = 0; j < 5; j++) {
    await (await contract.connect(processor).addSensorData(6, 5000, 9500)).wait(); // 50°C - anomaly!
  }
  
  const fraudScore = await contract.getAuthenticityScore(fraudId);
  console.log(`🚨 Fraud Detection Score: ${fraudScore}/100 (Multiple anomalies detected!)`);

  createdProducts.push({
    productId: fraudId,
    batchId: 6,
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
