import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const deployedPath = path.join(__dirname, '../deployed.json');
  if (!fs.existsSync(deployedPath)) {
    console.error('deployed.json not found. Run deploy first.');
    process.exit(1);
  }

  const deployed = JSON.parse(fs.readFileSync(deployedPath, 'utf8'));
  const contractAddress = deployed.contractAddress;
  console.log('Using contract:', contractAddress);

  const [deployer, farmer, processor] = await ethers.getSigners();

  const contract = await ethers.getContractAt('OrganicSupplyChain', contractAddress);

  console.log('Registering a test product as farmer:', farmer.address);
  const plantedDate = Math.floor(Date.now() / 1000) - 86400 * 10;
  const expectedHarvest = plantedDate + 86400 * 20;

  const tx = await contract.connect(farmer).registerProduct(
    'Pending Cert Product',
    0,
    '',
    '12.9716',
    '77.5946',
    plantedDate,
    expectedHarvest
  );
  const receipt = await tx.wait();
  console.log('Registered. tx:', receipt.transactionHash);

  // Get latest product id
  const total = await contract.getTotalProducts();
  const productId = Number(total);
  console.log('Product ID:', productId);

  // Add a certificate (pending) as processor
  const now = Math.floor(Date.now() / 1000);
  const validUntil = now + 365 * 24 * 60 * 60;
  const certHash = 'QmPendingCertMockHash1234567890';

  console.log('Adding certificate (pending) as processor:', processor.address);
  const addTx = await contract.connect(processor).addCertificate(productId, 'Test Issuer', validUntil, certHash);
  await addTx.wait();
  console.log('Certificate added (pending) for product', productId);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
