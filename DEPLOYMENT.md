# 🚀 VeriOrganic - Production Deployment Guide

## Overview
This guide will walk you through deploying VeriOrganic to production environments.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Smart Contract Deployment](#smart-contract-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Post-Deployment](#post-deployment)
6. [Monitoring](#monitoring)

---

## Prerequisites

### Required Tools
- Node.js v18+ and npm
- Git
- An Ethereum wallet with test/mainnet ETH
- Pinata account for IPFS storage
- Deployment accounts for:
  - Vercel/Netlify (Frontend)
  - Infura/Alchemy (Blockchain RPC)

### Blockchain Networks
Choose your deployment network:
- **Testnet** (Recommended for initial deployment):
  - Sepolia ([Get testnet ETH](https://sepoliafaucet.com/))
  - Mumbai (Polygon testnet)
  - Goerli (being deprecated)
  
- **Mainnet** (Production):
  - Ethereum Mainnet
  - Polygon Mainnet
  - Arbitrum/Optimism (L2 solutions)

---

## Environment Setup

### 1. Blockchain Environment (.env)

Create `blockchain/.env`:

```bash
# Network Configuration
PRIVATE_KEY=your_deployment_wallet_private_key_here

# RPC URLs (Get from Infura or Alchemy)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/YOUR_INFURA_KEY

# Etherscan API Keys (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# IPFS Configuration
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt_token
```

### 2. Frontend Environment (.env.local for development, .env.production for deployment)

Create `frontend/.env.production`:

```bash
# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_NETWORK_NAME=Sepolia

# IPFS Configuration
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt_token

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

---

## Smart Contract Deployment

### Step 1: Prepare for Deployment

```bash
cd blockchain

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test
```

### Step 2: Deploy to Testest (Sepolia)

```bash
# Deploy contract
npx hardhat run scripts/deploy.ts --network sepolia

# This will output:
# - Proxy contract address
# - Implementation contract address
# - Role account addresses
```

### Step 3: Verify Contract on Etherscan

```bash
# Verify the contract
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS

# For proxy contracts, also verify implementation
npx hardhat verify --network sepolia YOUR_IMPLEMENTATION_ADDRESS
```

### Step 4: Seed Initial Data (Optional)

```bash
# Set contract address and run seed script
CONTRACT_ADDRESS=0xYourContractAddress npx hardhat run scripts/seed-data-enhanced.ts --network sepolia
```

### Step 5: Grant Roles

Update `scripts/assign-roles.ts` with production account addresses and run:

```bash
npx hardhat run scripts/assign-roles.ts --network sepolia
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

#### Using Vercel CLI:

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard or via CLI:
vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS
vercel env add NEXT_PUBLIC_CHAIN_ID
vercel env add NEXT_PUBLIC_RPC_URL
# ... add all required env vars
```

#### Using Vercel Dashboard:

1. Go to [vercel.com](https://vercel.com)
2. Import your Git repository
3. Framework Preset: Next.js
4. Root Directory: `frontend`
5. Add all environment variables from `.env.production`
6. Deploy

### Option 2: Netlify

```bash
cd frontend

# Build the application
npm run build

# Deploy to Netlify
# 1. Install Netlify CLI: npm install -g netlify-cli
# 2. Login: netlify login
# 3. Deploy: netlify deploy --prod --dir=.next
```

### Option 3: Self-Hosted (Docker)

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t veriorganic-frontend .
docker run -p 3000:3000 --env-file .env.production veriorganic-frontend
```

---

## Post-Deployment

### 1. Update Contract Address

After deploying the smart contract, update the frontend environment:

```bash
# Update frontend/.env.production
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

Redeploy the frontend.

### 2. Test All Functionality

- [ ] Wallet connection (MetaMask)
- [ ] Product registration (Farmer)
- [ ] Batch creation (Processor)
- [ ] Status updates (Retailer)
- [ ] Certificate approval (Inspector)
- [ ] QR code generation
- [ ] Consumer verification
- [ ] IPFS uploads

### 3. Configure DNS (if using custom domain)

For Vercel:
1. Add domain in Vercel dashboard
2. Configure DNS records:
   - Type: A, Name: @, Value: 76.76.21.21
   - Type: CNAME, Name: www, Value: cname.vercel-dns.com

### 4. Enable HTTPS

Most hosting platforms (Vercel, Netlify) auto-configure SSL certificates.

For self-hosted:
- Use Let's Encrypt with Certbot
- Configure reverse proxy (Nginx) with SSL

---

## Monitoring

### Smart Contract Monitoring

1. **Etherscan**: Monitor transactions and contract events
   - Sepolia: https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
   - Mainnet: https://etherscan.io/address/YOUR_CONTRACT_ADDRESS

2. **Tenderly**: Advanced contract monitoring and debugging
   - Add your contract to Tenderly dashboard
   - Set up alerts for failed transactions

### Frontend Monitoring

1. **Vercel Analytics**: Built-in for Vercel deployments

2. **Google Analytics**: Track user interactions
   ```typescript
   // Add to _app.tsx
   import { GoogleAnalytics } from 'nextjs-google-analytics';
   
   <GoogleAnalytics gaMeasurementId={process.env.NEXT_PUBLIC_GA_ID} />
   ```

3. **Sentry**: Error tracking
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard -i nextjs
   ```

---

## Security Checklist

### Smart Contract
- [ ] Audited by professional auditors
- [ ] Access control properly configured
- [ ] Role assignments verified
- [ ] Upgrade mechanism tested
- [ ] Emergency pause function working
- [ ] Gas optimizations reviewed

### Frontend
- [ ] API keys not exposed in client-side code
- [ ] Environment variables properly configured
- [ ] CORS policies set correctly
- [ ] Input validation on all forms
- [ ] XSS protection enabled
- [ ] Rate limiting on API routes

### Infrastructure
- [ ] SSL/TLS certificates configured
- [ ] DDoS protection enabled
- [ ] Regular backups scheduled
- [ ] Monitoring and alerts active
- [ ] Incident response plan documented

---

## Rollback Plan

If issues occur after deployment:

### Smart Contract
1. Pause contract (if emergency pause is implemented)
2. Deploy fixed version using UUPS upgrade mechanism
3. Test upgrade on testnet first
4. Execute upgrade on mainnet

### Frontend
1. Revert to previous deployment in Vercel/Netlify
2. Or use Git to rollback: `git revert <commit-hash>`
3. Redeploy with fixed version

---

## Cost Estimates

### Sepolia Testnet (Testing)
- Contract Deployment: ~0.05 testnet ETH
- Transaction costs: ~0.001 testnet ETH per transaction
- Total: FREE (testnet ETH from faucets)

### Ethereum Mainnet (Production)
- Contract Deployment: $50-$200 (varies with gas prices)
- Average transaction: $5-$20
- Monthly operational costs: $500-$2000

### Polygon Mainnet (Lower Cost Alternative)
- Contract Deployment: $1-$5
- Average transaction: $0.01-$0.10
- Monthly operational costs: $50-$200

### Frontend Hosting
- Vercel Free Tier: $0/month (100GB bandwidth)
- Vercel Pro: $20/month (1TB bandwidth)
- Self-hosted: $10-$50/month (VPS costs)

---

## Maintenance

### Weekly
- [ ] Check contract transactions
- [ ] Monitor error logs
- [ ] Review IPFS uploads
- [ ] Check disk space (if self-hosted)

### Monthly
- [ ] Update dependencies
- [ ] Review security alerts
- [ ] Backup data
- [ ] Performance optimization

### Quarterly
- [ ] Security audit
- [ ] Cost optimization review
- [ ] User feedback analysis
- [ ] Feature planning

---

## Support

### Documentation
- Smart Contract: `blockchain/README.md`
- Frontend: `frontend/README.md`
- API Reference: `/docs/api`

### Getting Help
- GitHub Issues: Report bugs and feature requests
- Discord/Telegram: Community support
- Email: support@veriorganic.com

---

## Appendix

### Network Configurations

#### Sepolia Testnet
- Chain ID: 11155111
- RPC: https://sepolia.infura.io/v3/YOUR_KEY
- Explorer: https://sepolia.etherscan.io
- Faucet: https://sepoliafaucet.com

#### Polygon Mainnet
- Chain ID: 137
- RPC: https://polygon-rpc.com
- Explorer: https://polygonscan.com
- Gas Token: MATIC

#### Ethereum Mainnet
- Chain ID: 1
- RPC: https://mainnet.infura.io/v3/YOUR_KEY
- Explorer: https://etherscan.io
- Gas Token: ETH

### Useful Commands

```bash
# Check contract on Etherscan
npx hardhat verify --network sepolia CONTRACT_ADDRESS

# Upgrade contract
npx hardhat run scripts/upgrade.ts --network sepolia

# Transfer ownership
npx hardhat run scripts/transfer-ownership.ts --network sepolia

# Check roles
npx hardhat run scripts/check-roles.ts --network sepolia

# Frontend build
cd frontend && npm run build

# Frontend production server
cd frontend && npm start

# Health check
./check-health.sh
```

---

**Last Updated**: February 2026  
**Version**: 1.0.0
