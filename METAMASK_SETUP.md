# 🚀 MetaMask Setup for Local Development

## Prerequisites
- MetaMask browser extension installed
- Hardhat node running on localhost:8545
- Smart contract deployed at: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

## Step 1: Add Local Network to MetaMask

1. Open MetaMask
2. Click on the network dropdown (top center)
3. Click "Add Network" → "Add a network manually"
4. Enter the following details:
   - **Network Name**: `Hardhat Local`
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
5. Click "Save"

## Step 2: Import Test Accounts

Import the following test accounts to MetaMask using their private keys:

### Account #0 - Deployer (Admin)
- **Address**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **Private Key**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **Balance**: 10,000 ETH
- **Roles**: All roles (FARMER, PROCESSOR, RETAILER, INSPECTOR, UPGRADER)

### Account #1 - Farmer
- **Address**: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- **Private Key**: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
- **Balance**: 10,000 ETH
- **Roles**: FARMER_ROLE

### Account #2 - Processor
- **Address**: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- **Private Key**: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`
- **Balance**: 10,000 ETH
- **Roles**: PROCESSOR_ROLE

### Account #3 - Retailer
- **Address**: `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
- **Private Key**: `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`
- **Balance**: 10,000 ETH
- **Roles**: RETAILER_ROLE

### Account #4 - Inspector
- **Address**: `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65`
- **Private Key**: `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a`
- **Balance**: 10,000 ETH
- **Roles**: INSPECTOR_ROLE

## Step 3: Import Account to MetaMask

1. Open MetaMask
2. Click on the account icon (top right)
3. Click "Import Account"
4. Paste the private key from above
5. Click "Import"
6. Repeat for all accounts you want to use

## Step 4: Switch to Local Network

1. Make sure MetaMask is connected to "Hardhat Local" network
2. Your account should show 10,000 ETH balance

## Step 5: Test the Application

1. Visit http://localhost:3000
2. Click "Connect Wallet" 
3. Select your imported account
4. Navigate to the appropriate dashboard:
   - Farmer: http://localhost:3000/farmer
   - Processor: http://localhost:3000/processor
   - Retailer: http://localhost:3000/retailer
   - Inspector: http://localhost:3000/inspector

## Troubleshooting

### "User rejected the request"
- This means you declined the MetaMask popup. Try again and approve the request.

### "network changed" or "chain ID mismatch"
- Make sure MetaMask is connected to the "Hardhat Local" network (Chain ID: 31337)
- Check that the RPC URL is exactly: http://127.0.0.1:8545

### "insufficient funds" or "gas estimation failed"
- Import one of the test accounts above - they have 10,000 ETH each
- Make sure you're using an account that has the correct role for the operation

### "execution reverted" or "AccessControl"
- This means your account doesn't have the required role
- Use Account #0 (Deployer) which has all roles
- Or use the appropriate account for the role you need

### Contract not found
- Make sure the Hardhat node is running: `cd blockchain && npx hardhat node`
- Verify the contract is deployed: Check blockchain/deployed.json
- If needed, redeploy: `cd blockchain && npx hardhat run scripts/deploy.ts --network localhost`

## Security Warning

⚠️ **These are public test accounts. NEVER use them on mainnet or send real funds to them!**

All test account private keys are publicly known and included in Hardhat by default. They are safe to use ONLY for local development and testing.
