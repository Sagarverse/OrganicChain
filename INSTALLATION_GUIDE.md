# 📦 Quick Installation Guide for Production Features

This guide helps you install all dependencies needed for the production-ready enhancements.

---

## Smart Contract Testing Dependencies

```bash
cd blockchain

# Core dependencies (should already be installed)
npm install --save-dev hardhat
npm install --save-dev @nomicfoundation/hardhat-toolbox
npm install --save-dev @nomicfoundation/hardhat-network-helpers

# For seed script enhancements
npm install --save-dev axios
npm install --save-dev qrcode @types/qrcode

# Optional: For coverage reporting
npm install --save-dev solidity-coverage
```

---

## Frontend Testing Dependencies

```bash
cd frontend

# Cypress for E2E testing
npm install --save-dev cypress
npm install --save-dev @cypress/webpack-dev-server

# TypeScript types for Cypress
npm install --save-dev @types/cypress
```

---

## Complete Package.json Updates

### blockchain/package.json

Add to `dependencies`:
```json
{
  "dependencies": {
    "@openzeppelin/contracts-upgradeable": "^4.9.3",
    "dotenv": "^16.3.1",
    "axios": "^1.6.0",
    "qrcode": "^1.5.3"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^3.0.0",
    "@nomicfoundation/hardhat-network-helpers": "^1.0.0",
    "@openzeppelin/hardhat-upgrades": "^2.3.0",
    "@types/node": "^20.0.0",
    "@types/qrcode": "^1.5.5",
    "hardhat": "^2.19.0",
    "solidity-coverage": "^0.8.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.0.0"
  }
}
```

Add to `scripts`:
```json
{
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "test:comprehensive": "hardhat test test/OrganicSupplyChain.comprehensive.test.ts",
    "coverage": "hardhat coverage",
    "deploy": "hardhat run scripts/deploy.ts --network sepolia",
    "deploy:local": "hardhat run scripts/deploy.ts --network localhost",
    "seed": "hardhat run scripts/seed-data-enhanced.ts --network localhost",
    "node": "hardhat node"
  }
}
```

### frontend/package.json

Add to `devDependencies`:
```json
{
  "devDependencies": {
    "cypress": "^13.6.0",
    "@cypress/webpack-dev-server": "^3.7.0",
    "@types/cypress": "^1.1.3"
  }
}
```

Add to `scripts`:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "cypress": "cypress open",
    "cypress:run": "cypress run",
    "test:e2e": "cypress run --spec 'cypress/e2e/**/*.cy.ts'"
  }
}
```

---

## Environment Variables Setup

### blockchain/.env

```bash
# Network Configuration
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key

# IPFS Configuration (for real uploads)
PINATA_JWT=your_pinata_jwt_token
# OR use API Key/Secret
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Optional: Contract address for seeding
CONTRACT_ADDRESS=0x...
```

### frontend/.env.local

```bash
# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545

# For production (Sepolia)
# NEXT_PUBLIC_CHAIN_ID=11155111
# NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.org

# Optional: Pinata for frontend IPFS uploads
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token
```

---

## Installation Commands (Copy-Paste Ready)

### Complete Fresh Install

```bash
# Clone repository (if needed)
git clone https://github.com/yourusername/verifiable-supply-chain.git
cd verifiable-supply-chain

# Install blockchain dependencies
cd blockchain
npm install
npm install --save-dev axios qrcode @types/qrcode
npm install --save-dev solidity-coverage

# Install frontend dependencies
cd ../frontend
npm install
npm install --save-dev cypress @cypress/webpack-dev-server @types/cypress

# Verify installations
cd ../blockchain
npx hardhat --version

cd ../frontend
npx cypress --version
```

---

## Verification Commands

### Test Smart Contract Setup

```bash
cd blockchain

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Run comprehensive tests
npm run test:comprehensive

# Check coverage
npm run coverage
```

Expected output:
```
✓ Should deploy successfully
✓ Should set admin as DEFAULT_ADMIN_ROLE
...
70 passing (15.3s)
```

### Test Frontend Setup

```bash
cd frontend

# Verify Cypress
npx cypress verify

# Open Cypress (GUI)
npx cypress open

# Run headless
npx cypress run
```

Expected output:
```
Running:  farmer-dashboard.cy.ts                                     (1 of 2)
  Farmer Dashboard - Product Registration
    ✓ should load the farmer dashboard (234ms)
    ✓ should display wallet connection status (123ms)
    ...
  40 passing (12.3s)
```

---

## Troubleshooting

### Issue: `Cannot find module 'qrcode'`

```bash
cd blockchain
npm install --save qrcode @types/qrcode
```

### Issue: `Cannot find module 'axios'`

```bash
cd blockchain
npm install --save axios
```

### Issue: Cypress not opening

```bash
# Clear Cypress cache
npx cypress cache clear

# Reinstall
npm install --save-dev cypress
npx cypress install
```

### Issue: Hardhat network helpers not found

```bash
cd blockchain
npm install --save-dev @nomicfoundation/hardhat-network-helpers
```

### Issue: TypeScript errors in tests

```bash
cd blockchain
npm install --save-dev @types/node
npm install --save-dev ts-node typescript
```

---

## Package Versions (Tested & Working)

```json
{
  "node": ">=18.0.0",
  "npm": ">=9.0.0",
  "hardhat": "^2.19.0",
  "ethers": "^6.0.0",
  "@openzeppelin/contracts-upgradeable": "^4.9.3",
  "axios": "^1.6.0",
  "qrcode": "^1.5.3",
  "cypress": "^13.6.0",
  "next": "^14.1.0",
  "react": "^18.2.0"
}
```

---

## Quick Start After Installation

```bash
# Terminal 1: Start Hardhat node
cd blockchain
npx hardhat node

# Terminal 2: Deploy with seeding
cd blockchain
export PINATA_JWT=your_jwt  # Optional for real IPFS
npx hardhat run scripts/deploy.ts --network localhost

# Terminal 3: Start frontend
cd frontend
npm run dev

# Terminal 4: Run Cypress tests (optional)
cd frontend
npx cypress open
```

---

## CI/CD Requirements

If using GitHub Actions, no additional installation needed! The workflow automatically installs all dependencies.

`.github/workflows/test.yml` handles:
- ✅ Node.js 18 setup
- ✅ Dependency installation
- ✅ Contract compilation
- ✅ Test execution
- ✅ Coverage generation

---

## Success Checklist

- [ ] `npx hardhat compile` works
- [ ] `npx hardhat test` passes 70+ tests
- [ ] `npx hardhat coverage` generates report
- [ ] `npx cypress verify` succeeds
- [ ] `npm run deploy:local` deploys contract
- [ ] QR codes appear in `frontend/public/qrcodes/`
- [ ] `deployed.json` created after deployment
- [ ] GitHub Actions workflow passes (if pushed)

---

## Get Help

If you encounter issues not covered here:

1. Check [Hardhat Documentation](https://hardhat.org/docs)
2. Check [Cypress Documentation](https://docs.cypress.io/)
3. Verify Node.js version: `node --version` (should be 18+)
4. Clear all caches:
   ```bash
   cd blockchain && rm -rf node_modules package-lock.json && npm install
   cd ../frontend && rm -rf node_modules package-lock.json && npm install
   ```

---

**You're all set! 🚀**

All production-ready features are now installed and ready to impress hackathon judges.
