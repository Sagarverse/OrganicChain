import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import QRCode from "qrcode";

// Pinata configuration
const PINATA_API_KEY = process.env.PINATA_API_KEY ||  "";
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY || "";
const PINATA_JWT = process.env.PINATA_JWT || "";

interface ProductData {
  name: string;
  cropType: number;
  location: string;
  farmerName: string;
  certificationBody: string;
  description: string;
}

const products: ProductData[] = [
  {
    name: "Organic Hass Avocados",
    cropType: 1, // Fruits
    location: "California, USA",
    farmerName: "Green Valley Farms",
    certificationBody: "USDA Organic",
    description: "Premium Hass avocados grown in rich California soil, certified 100% organic. Hand-picked at peak ripeness."
  },
  {
    name: "Heirloom Tomatoes",
    cropType: 0, // Vegetables
    location: "Florida, USA",
    farmerName: "Sunshine Organic Gardens",
    certificationBody: "USDA Organic",
    description: "Heritage variety tomatoes with exceptional flavor. Grown using traditional organic farming methods."
  },
  {
    name: "Wild Blueberries",
    cropType: 1, // Fruits
    location: "Maine, USA",
    farmerName: "Coastal Berry Co-op",
    certificationBody: "Maine Organic Farmers",
    description: "Wild-harvested blueberries from pristine Maine forests. Rich in antioxidants and natural sweetness."
  },
  {
    name: "Organic Honeycrisp Apples",
    cropType: 1, // Fruits
    location: "Washington, USA",
    farmerName: "Cascade Orchards",
    certificationBody: "Washington State Organic",
    description: "Crisp, sweet apples from high-altitude orchards. Perfect balance of sweet and tart flavors."
  },
  {
    name: "Heritage Purple Potatoes",
    cropType: 0, // Vegetables
    location: "Idaho, USA",
    farmerName: "Mountain View Farm",
    certificationBody: "Idaho Organic Certification",
    description: "Rare purple potatoes rich in anthocyanins. Unique nutty flavor and vibrant color."
  }
];

// Farm coordinates for each product
const farmCoordinates = [
  { lat: "34.0522", long: "-118.2437" }, // California
  { lat: "27.9506", long: "-82.4572" },  // Florida
  { lat: "44.3106", long: "-69.7795" },  // Maine
  { lat: "47.7511", long: "-120.7401" }, // Washington
  { lat: "43.6150", long: "-116.2023" }  // Idaho
];

/**
 * Upload certification document to Pinata IPFS
 */
async function uploadCertificateToPinata(productName: string, certBody: string): Promise<string> {
  if (!PINATA_API_KEY && !PINATA_JWT) {
    console.log("   ⚠️  Skipping IPFS upload (no API keys) - using mock hash");
    return `Qm${Buffer.from(productName + certBody).toString("hex").substring(0, 44)}`;
  }

  try {
    // Create mock certificate data
    const certData = {
      product: productName,
      certificationBody: certBody,
      issueDate: new Date().toISOString(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      standards: ["USDA Organic Regulations", "NOP Standards", "Non-GMO Verified"],
      inspectionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      certificationNumber: `CERT-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`
    };

    const data = JSON.stringify({
      pinataContent: certData,
      pinataMetadata: {
        name: `${productName} - Organic Certificate`,
        keyvalues: {
          product: productName,
          type: "organic-certificate"
        }
      }
    });

    const headers = PINATA_JWT
      ? { 'Authorization': `Bearer ${PINATA_JWT}`, 'Content-Type': 'application/json' }
      : { 'pinata_api_key': PINATA_API_KEY, 'pinata_secret_api_key': PINATA_SECRET_KEY, 'Content-Type': 'application/json' };

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      data,
      { headers }
    );

    console.log(`   ✓ Uploaded to IPFS: ${response.data.IpfsHash}`);
    return response.data.IpfsHash;
  } catch (error: any) {
    console.log(`   ⚠️  IPFS upload failed: ${error.message} - using mock hash`);
    return `Qm${Buffer.from(productName + certBody).toString("hex").substring(0, 44)}`;
  }
}

/**
 * Generate QR code for product and save to frontend
 */
async function generateQRCode(productId: number, contractAddress: string): Promise<string> {
  const qrData = JSON.stringify({
    productId,
    contractAddress,
    network: network.name,
    timestamp: Date.now()
  });

  const qrDir = path.join(__dirname, "../../frontend/public/qrcodes");
  fs.mkdirSync(qrDir, { recursive: true });

  const qrPath = path.join(qrDir, `product-${productId}.png`);
  
  await QRCode.toFile(qrPath, qrData, {
    width: 400,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF"
    }
  });

  console.log(`   ✓ QR code saved: qrcodes/product-${productId}.png`);
  return qrPath;
}

async function main() {
  console.log("🌱 Enhanced Seed Data Script with Real IPFS & QR Generation");
  console.log("=".repeat(70));

  // Parse CLI arguments
  const args = process.argv.slice(2);
  let contractAddress = process.env.CONTRACT_ADDRESS || "";
  
  // Check for --address flag
  const addressIdx = args.findIndex(arg => arg === "--address");
  if (addressIdx !== -1 && args[addressIdx + 1]) {
    contractAddress = args[addressIdx + 1];
  }

  // Try to load from deployed.json if no address provided
  if (!contractAddress) {
    try {
      const deployedPath = path.join(__dirname, "../deployed.json");
      if (fs.existsSync(deployedPath)) {
        const deployed = JSON.parse(fs.readFileSync(deployedPath, "utf-8"));
        contractAddress = deployed.contractAddress;
        console.log("✓ Loaded contract address from deployed.json");
      }
    } catch (error) {
      // Ignore
    }
  }

  if (!contractAddress) {
    console.error("❌ Contract address not provided!");
    console.error("Usage: npx hardhat run scripts/seed-data.ts --network <network> --address <contract>");
    console.error("Or set CONTRACT_ADDRESS environment variable");
    process.exit(1);
  }

  if (!PINATA_API_KEY && !PINATA_JWT) {
    console.log("⚠️  Note: PINATA_API_KEY/PINATA_JWT not set - will use mock IPFS hashes");
    console.log("   To enable real IPFS uploads, set PINATA_JWT in .env\n");
  }

  const signers = await ethers.getSigners();
  const [deployer, farmer, processor, retailer, inspector] = signers;

  console.log("\n📡 Network:   ", network.name);
  console.log("📝 Contract:  ", contractAddress);
  console.log("👤 Farmer:    ", farmer?.address || deployer.address);
  console.log("🏭 Processor: ", processor?.address || deployer.address);
  console.log("🏪 Retailer:  ", retailer?.address || deployer.address);
  console.log("🔍 Inspector: ", inspector?.address || deployer.address);
  console.log();

  const OrganicSupplyChain = await ethers.getContractFactory("OrganicSupplyChain");
  const contract = OrganicSupplyChain.attach(contractAddress) as any;

  const farmerAccount = farmer || deployer;
  const processorAccount = processor || deployer;
  const retailerAccount = retailer || deployer;
  const inspectorAccount = inspector || deployer;

  const createdProducts: any[] = [];
  const ipfsHashes: string[] = [];

  // Create 5 realistic products
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const coords = farmCoordinates[i];
    
    console.log(`\n${"=".repeat(70)}`);
    console.log(`📦 Product ${i + 1}/5: ${product.name}`);
    console.log(`${"=".repeat(70)}`);

    // Upload certificate to IPFS
    console.log("1️⃣  Uploading organic certificate to IPFS...");
    const ipfsHash = await uploadCertificateToPinata(product.name, product.certificationBody);
    ipfsHashes.push(ipfsHash);

    // Calculate dates (planted 90 days ago, harvested 30 days ago)
    const now = Math.floor(Date.now() / 1000);
    const plantedDate = now - (90 * 24 * 60 * 60);
    const harvestDate = now - (30 * 24 * 60 * 60);
    const expectedHarvestDate = plantedDate + (60 * 24 * 60 * 60);

    // Register product as farmer
    console.log("2️⃣  Registering product on blockchain...");
    const regTx = await contract.connect(farmerAccount).registerProduct(
      product.name,
      product.cropType,
      ipfsHash,
      coords.lat,
      coords.long,
      plantedDate,
      expectedHarvestDate
    );
    await regTx.wait();
    const productId = i + 1;
    console.log(`   ✓ Product ID: ${productId}`);

    // Update to harvested
    console.log("3️⃣  Harvesting product...");
    const harvestNotes = `Harvested with care at ${product.location}`;
    await (await contract.connect(farmerAccount).harvestProduct(productId, 250, harvestNotes)).wait();

    // Create batch (processor)
    console.log("4️⃣  Processing batch...");
    const quantity = Math.floor(Math.random() * 400) + 200; // 200-600 kg
    const temperatures = Array.from({ length: 3 }, () => Math.floor(Math.random() * 800) + 200);
    const humidities = Array.from({ length: 3 }, () => Math.floor(Math.random() * 1500) + 6500);
    const batchTx = await contract.connect(processorAccount).processBatch(
      productId,
      quantity,
      `${product.location} Processing Facility`,
      temperatures,
      humidities,
      "Washed, sorted, and packed",
      ipfsHash
    );
    await batchTx.wait();
    const batchId = productId;
    console.log(`   ✓ Batch ID: ${batchId}, Quantity: ${quantity}kg`);
    console.log("5️⃣  Recording IoT sensor data...");
    console.log(`   ✓ Sample reading: ${temperatures[0] / 100}°C, ${humidities[0] / 100}% humidity`);

    // Track location
    console.log("6️⃣  Tracking GPS location...");
    await (await contract.connect(processorAccount).updateBatchLocation(
      batchId,
      coords.lat,
      coords.long
    )).wait();
    console.log(`   ✓ Location: ${coords.lat}, ${coords.long}`);

    // Add certificate
    console.log("7️⃣  Adding & approving organic certificate...");
    const validUntil = now + (365 * 24 * 60 * 60); // Valid 1 year
    const certTx = await contract.connect(processorAccount).addCertificate(
      productId,
      product.certificationBody,
      validUntil,
      ipfsHash
    );
    await certTx.wait();
    const certId = productId;
    
    // Inspector approves
    await (await contract.connect(inspectorAccount).approveCertificate(certId)).wait();
    await (await contract.connect(processorAccount).addCertificateToBatch(batchId, certId)).wait();
    console.log(`   ✓ Certificate ${certId} approved and linked`);

    // Transfer custody
    console.log("8️⃣  Transferring custody to retailer...");
    await (await contract.connect(processorAccount).transferCustody(
      productId,
      retailerAccount.address,
      "Shipment dispatched to retailer"
    )).wait();

    // Retailer receives product
    const receivedDate = now;
    const expiryDate = now + (14 * 24 * 60 * 60);
    await (await contract.connect(retailerAccount).receiveProduct(
      productId,
      receivedDate,
      expiryDate,
      4999,
      "Received in good condition"
    )).wait();
    console.log("   ✓ Status: Delivered");

    // Get final score
    const score = await contract.getAuthenticityScore(productId);
    console.log(`🎯 Authenticity Score: ${score}/100`);

    // Generate QR code
    console.log("🔟 Generating QR code...");
    await generateQRCode(productId, contractAddress);

    createdProducts.push({
      productId,
      batchId,
      name: product.name,
      farmer: product.farmerName,
      location: product.location,
      description: product.description,
      ipfsHash,
      score: score.toString(),
      certificationBody: product.certificationBody,
      quantity,
      qrCodePath: `qrcodes/product-${productId}.png`
    });
  }

  // Save comprehensive seed data
  console.log("\n💾 Saving seed data summary...");
  const summary = {
    network: network.name,
    contractAddress,
    timestamp: new Date().toISOString(),
    totalProducts: createdProducts.length,
    products: createdProducts,
    ipfsGateway: "https://gateway.pinata.cloud/ipfs/",
    accounts: {
      farmer: farmerAccount.address,
      processor: processorAccount.address,
      retailer: retailerAccount.address,
      inspector: inspectorAccount.address
    }
  };

  const seedDataPath = path.join(__dirname, "../seed-output.json");
  fs.writeFileSync(seedDataPath, JSON.stringify(summary, null, 2));
  console.log(`✓ Saved to: ${seedDataPath}`);

  // Also save to frontend if exists
  const frontendDataPath = path.join(__dirname, "../../frontend/data/seed-data.json");
  try {
    fs.mkdirSync(path.dirname(frontendDataPath), { recursive: true });
    fs.writeFileSync(frontendDataPath, JSON.stringify(summary, null, 2));
    console.log(`✓ Saved to: ${frontendDataPath}`);
  } catch (e) {
    // Frontend might not exist
  }

  // Print summary
  console.log("\n" + "=".repeat(70));
  console.log("✅ SEEDING COMPLETE");
  console.log("=".repeat(70));
  console.log(`\n📊 Summary:`);
  console.log(`   • Products created:        ${createdProducts.length}`);
  console.log(`   • Batches processed:       ${createdProducts.length}`);
  console.log(`   • Certificates approved:   ${createdProducts.length}`);
  console.log(`   • IPFS uploads:            ${ipfsHashes.length}`);
  console.log(`   • QR codes generated:      ${createdProducts.length}`);
  console.log(`   • Average score:           ${Math.round(createdProducts.reduce((sum, p) => sum + parseInt(p.score), 0) / createdProducts.length)}/100`);
  
  console.log(`\n🔗 Resources:`);
  console.log(`   • Contract: ${contractAddress}`);
  console.log(`   • Network: ${network.name}`);
  console.log(`   • QR Codes: frontend/public/qrcodes/`);
  console.log(`   • Seed Data: ${seedDataPath}`);

  console.log(`\n📋 IPFS Hashes:`);
  ipfsHashes.forEach((hash, idx) => {
    console.log(`   ${idx + 1}. ${hash}`);
    console.log(`      View: https://gateway.pinata.cloud/ipfs/${hash}`);
  });

  console.log(`\n🎯 Next Steps:`);
  console.log(`   1. View QR codes in frontend/public/qrcodes/`);
  console.log(`   2. Start frontend: cd frontend && npm run dev`);
  console.log(`   3. Scan QR codes with mobile app`);
  console.log(`   4. View products at http://localhost:3000/consumer\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Seeding failed:");
    console.error(error);
    process.exit(1);
  });
