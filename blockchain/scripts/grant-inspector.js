const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const inspectorAddress = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";

  console.log(`Granting INSPECTOR_ROLE to ${inspectorAddress}...`);

  const SupplyChain = await ethers.getContractFactory("OrganicSupplyChain");
  const contract = SupplyChain.attach(contractAddress);

  // Get the INSPECTOR_ROLE hash
  const INSPECTOR_ROLE = await contract.INSPECTOR_ROLE();
  
  const tx = await contract.grantRole(INSPECTOR_ROLE, inspectorAddress);
  console.log("Tx hash:", tx.hash);
  
  await tx.wait();
  console.log("Success! Role granted.");
  
  const hasRole = await contract.hasRole(INSPECTOR_ROLE, inspectorAddress);
  console.log(`Verification - Has role: ${hasRole}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
