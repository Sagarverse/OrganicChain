import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';

async function main() {
  const deployedPath = path.join(__dirname, '..', 'deployed.json');
  if (!fs.existsSync(deployedPath)) {
    throw new Error('deployed.json not found. Deploy contract first.');
  }

  const deployed = JSON.parse(fs.readFileSync(deployedPath, 'utf8'));
  const contractAddress = deployed.contractAddress || process.env.CONTRACT_ADDRESS;
  if (!contractAddress) throw new Error('Contract address not found in deployed.json or CONTRACT_ADDRESS env');

  const signers = await ethers.getSigners();
  const adminSigner = signers[0];
  const target = process.env.TARGET_ADDRESS || adminSigner.address;

  console.log('Using contract:', contractAddress);
  console.log('Admin signer:', adminSigner.address);
  console.log('Target address to grant roles to:', target);

  const contract = await ethers.getContractAt('OrganicSupplyChain', contractAddress, adminSigner);

  const roles = [
    { name: 'FARMER_ROLE', getter: 'FARMER_ROLE' },
    { name: 'PROCESSOR_ROLE', getter: 'PROCESSOR_ROLE' },
    { name: 'RETAILER_ROLE', getter: 'RETAILER_ROLE' },
    { name: 'INSPECTOR_ROLE', getter: 'INSPECTOR_ROLE' },
  ];

  for (const r of roles) {
    try {
      // call the public constant accessor, e.g. contract.FARMER_ROLE()
      // @ts-ignore
      const roleBytes: string = await contract[r.getter]();
      console.log(`${r.name} bytes:`, roleBytes);
      const already = await contract.hasRole(roleBytes, target);
      console.log(`${r.name} already assigned to target?`, already);
      if (!already) {
        const tx = await contract.grantRole(roleBytes, target);
        console.log(`Granting ${r.name} -> tx:`, tx.hash);
        await tx.wait();
        console.log(`${r.name} granted`);
      }
    } catch (err) {
      console.error(`Error handling role ${r.name}:`, err);
    }
  }

  // Final verification
  console.log('Final role verification:');
  for (const r of roles) {
    try {
      // @ts-ignore
      const roleBytes: string = await contract[r.getter]();
      const has = await contract.hasRole(roleBytes, target);
      console.log(`${r.name}: ${has}`);
    } catch (err) {
      console.error('Verify error', r.name, err);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
