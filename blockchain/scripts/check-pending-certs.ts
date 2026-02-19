import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const deployedPath = path.join(__dirname, '../deployed.json');
  if (!fs.existsSync(deployedPath)) {
    console.error('deployed.json not found.');
    process.exit(1);
  }
  const deployed = JSON.parse(fs.readFileSync(deployedPath, 'utf8'));
  const contractAddress = deployed.contractAddress;
  const contract = await ethers.getContractAt('OrganicSupplyChain', contractAddress);

  const pending = await contract.getPendingCertificates();
  console.log('Pending certificate IDs:', pending.map((p: any) => Number(p)));

  for (const id of pending) {
    const cert = await contract.getCertificate(id);
    console.log('Certificate', Number(id), {
      issuer: cert.issuer,
      documentHash: cert.documentHash,
      approved: cert.approved,
      rejected: cert.rejected
    });
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
