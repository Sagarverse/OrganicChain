import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';

async function main() {
  const deployedPath = path.join(__dirname, '..', 'deployed.json');
  const deployed = JSON.parse(fs.readFileSync(deployedPath, 'utf8'));
  const proxyAddr = deployed.contractAddress;
  const implAddr = deployed.implementationAddress;
  const provider = ethers.provider;
  const proxyCode = await provider.getCode(proxyAddr);
  const implCode = implAddr ? await provider.getCode(implAddr) : 'none';
  console.log('Proxy address:', proxyAddr);
  console.log('Proxy code length:', proxyCode.length);
  console.log('Implementation address:', implAddr);
  console.log('Implementation code length:', implCode.length);
  console.log('Proxy code sample:', proxyCode.slice(0, 200));
}

main().catch((e) => { console.error(e); process.exit(1); });
