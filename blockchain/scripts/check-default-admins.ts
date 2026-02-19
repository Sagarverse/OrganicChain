import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';

async function main() {
  const deployedPath = path.join(__dirname, '..', 'deployed.json');
  if (!fs.existsSync(deployedPath)) {
    throw new Error('deployed.json not found');
  }
  const deployed = JSON.parse(fs.readFileSync(deployedPath, 'utf8'));
  const contractAddress = deployed.contractAddress;
  const contract = await ethers.getContractAt('OrganicSupplyChain', contractAddress);

  const signers = await ethers.getSigners();
  console.log('Using provider signer for reads:', signers[1].address);
  const ZERO_BYTES32 = '0x' + '0'.repeat(64);

  for (let i = 0; i < Math.min(signers.length, 10); i++) {
    const addr = signers[i].address;
    try {
      const hasAdmin = await contract.connect(signers[1]).hasRole(ZERO_BYTES32, addr);
      console.log(`Signer[${i}] ${addr} has DEFAULT_ADMIN_ROLE?`, hasAdmin);
    } catch (err) {
      console.error('read error for', addr, err);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
