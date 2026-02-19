# 🚀 Complete Deployment Guide
## Deploy VeriOrganic to Production

This guide walks through deploying the entire system from scratch, including smart contract, IPFS setup, frontend, and demo data.

---

## Prerequisites

### Required Software
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Git**: Latest version
- **MetaMask**: Browser extension installed

### Required Accounts
1. **Ethereum Wallet** with Sepolia testnet ETH
2. **Pinata Account** (for IPFS) - [pinata.cloud](https://pinata.cloud)
3. **Vercel Account** (for frontend) - [vercel.com](https://vercel.com)
4. **Sepolia RPC** - [Infura](https://infura.io) or [Alchemy](https://alchemy.com)

### Get Test ETH
Visit [Sepolia Faucet](https://sepoliafaucet.com) and request test ETH (you'll need ~0.5 ETH for deployment and seeding)

---

## Part 1: Smart Contract Deployment

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourname/organicchain.git
cd organicchain

# Install blockchain dependencies
cd blockchain
npm install
```

Expected output:
```
added 487 packages in 45s
```

### Step 2: Configure Environment

Create `.env` file in `blockchain/` directory:

```bash
# blockchain/.env
PRIVATE_KEY=your_wallet_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

⚠️ **Security Warning**: Never commit `.env` files to Git. They're already in `.gitignore`.

#### How to Get Your Private Key:
1. Open MetaMask
2. Click the three dots → Account Details
3. Click "Export Private Key"
4. Enter password and copy the key

#### How to Get Sepolia RPC URL:
1. Sign up at [Infura](https://infura.io) or [Alchemy](https://alchemy.com)
2. Create a new project
3. Copy the Sepolia endpoint URL

#### How to Get Etherscan API Key:
1. Sign up at [Etherscan](https://etherscan.io/register)
2. Go to API Keys tab
3. Create a new API key

### Step 3: Compile Contract

```bash
npx hardhat compile
```

Expected output:
```
Compiled 15 Solidity files successfully
Generated typings for: 15 artifacts
```

This creates:
- `artifacts/` - Contract ABIs and bytecode
- `typechain-types/` - TypeScript types for the contract

### Step 4: Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

Expected output:
```
Deploying OrganicSupplyChain with UUPS proxy...
OrganicSupplyChain deployed to: 0x1234567890abcdef1234567890abcdef12345678
Implementation at: 0xabcdef1234567890abcdef1234567890abcdef12
Roles granted to deployer: 0xYourWalletAddress

✅ Deployment complete!

🔑 Add this to your frontend .env.local:
CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

**Save the contract address** - you'll need it multiple times.

### Step 5: Verify Contract on Etherscan (Optional but Recommended)

```bash
npx hardhat verify --network sepolia 0xYourContractAddress
```

This makes your contract's code publicly viewable on Etherscan, adding credibility.

### Step 6: Seed Demo Data

```bash
npx hardhat run scripts/seed-data.ts --network sepolia
```

This creates 6 products:
1. Organic Hass Avocados (California) - Score: 100
2. Heirloom Tomatoes (Florida) - Score: 92
3. Wild Blueberries (Maine) - Score: 95
4. Organic Honeycrisp Apples (Washington) - Score: 100
5. Heritage Purple Potatoes (Idaho) - Score: 98
6. **Suspicious Organic Kale** (Unknown) - Score: 45 ⚠️ (fraud demo)

Expected output:
```
Seeding OrganicSupplyChain with demo data...
Connected to contract at: 0x123...
Creating 6 demo products...

✅ Product 1: Organic Hass Avocados - ID: 1
✅ Product 2: Heirloom Tomatoes - ID: 2
...
⚠️  Product 6: Suspicious Organic Kale - ID: 6 (FRAUD DEMO)

📊 Seed data saved to: frontend/data/seed-data.json
🎉 Seeding complete! 6 products created.
```

The script takes ~5 minutes to complete (many blockchain transactions).

---

## Part 2: IPFS Setup (Pinata)

### Step 1: Create Pinata Account

1. Go to [pinata.cloud](https://pinata.cloud)
2. Sign up for free account
3. Verify email

### Step 2: Get API Keys

1. Navigate to **API Keys** in the sidebar
2. Click **"New Key"**
3. Permissions:
   - ✅ pinFileToIPFS
   - ✅ pinJSONToIPFS
4. Name: `VeriOrganic Production`
5. Click **"Create Key"**
6. **Copy both**:
   - API Key
   - API Secret

⚠️ **You can only see the secret once!** Save it immediately.

### Step 3: Test IPFS Upload (Optional)

```bash
# Test upload using curl
curl -X POST "https://api.pinata.cloud/pinning/pinJSONToIPFS" \
  -H "Content-Type: application/json" \
  -H "pinata_api_key: YOUR_API_KEY" \
  -H "pinata_secret_api_key: YOUR_SECRET" \
  -d '{"pinataContent":{"test":"Hello IPFS"}}'
```

Expected response:
```json
{
  "IpfsHash": "QmXYZ...",
  "PinSize": 23,
  "Timestamp": "2026-02-19T12:00:00.000Z"
}
```

---

## Part 3: Frontend Deployment

### Step 1: Install Frontend Dependencies

```bash
# Navigate to frontend folder
cd ../frontend
npm install
```

Expected output:
```
added 1247 packages in 2m
```

### Step 2: Update Contract Constants

Open `frontend/utils/constants.ts` and update:

```typescript
// Replace with your deployed contract address
export const CONTRACT_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";

// Update the contract ABI if you made changes
// (If using deployed version as-is, no changes needed)
```

### Step 3: Configure Environment Variables

Create `.env.local` in `frontend/` directory:

```bash
# frontend/.env.local

# Required: Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
NEXT_PUBLIC_NETWORK_NAME=Sepolia

# Required: IPFS (Pinata)
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_optional

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Optional: Custom Domain
NEXT_PUBLIC_APP_URL=https://veriorganic.vercel.app
```

**Chain IDs**:
- Sepolia (testnet): `11155111`
- Ethereum Mainnet: `1`
- Polygon: `137`
- Localhost: `1337`

### Step 4: Test Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Test Checklist**:
- [ ] Landing page loads with 3D globe
- [ ] Connect MetaMask wallet (switch to Sepolia)
- [ ] Navigate to `/farmer` - dashboard loads
- [ ] Register new product - transaction confirms
- [ ] Navigate to `/consumer/1` - product verification shows

If any fails, check:
1. MetaMask is on Sepolia network
2. Contract address in `.env.local` is correct
3. Browser console for errors

### Step 5: Build for Production

```bash
npm run build
```

Expected output:
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages (5/5)
✓ Finalizing page optimization

Route (pages)                              Size     First Load JS
┌ ○ /                                     15.2 kB        123 kB
├ ○ /404                                  3.4 kB         108 kB
├ ○ /api/generateQR                       0 B            0 B
├ ○ /api/uploadToIPFS                     0 B            0 B
├ ○ /consumer/[productId]                 18.6 kB        126 kB
└ ○ /farmer                               12.3 kB        120 kB

○ (Static)  prerendered as static content
```

### Step 6: Deploy to Vercel

#### Option A: GitHub Integration (Recommended)

1. Push code to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click **"New Project"**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Add **Environment Variables** (copy from `.env.local`):
   - Click "Environment Variables"
   - Paste each variable (name and value)
   - Select all environments (Production, Preview, Development)
7. Click **"Deploy"**

Deployment takes ~2-3 minutes.

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Follow prompts:
- Set up and deploy? **Y**
- Which scope? (select your account)
- Link to existing project? **N**
- Project name? `veriorganic`
- Directory? `./frontend`
- Override settings? **N**

### Step 7: Verify Deployment

Visit your deployed URL (e.g., `https://veriorganic.vercel.app`)

**Production Checklist**:
- [ ] Landing page loads (check 3D globe)
- [ ] All assets load (no 404s in Network tab)
- [ ] Connect wallet works
- [ ] Farmer dashboard accessible
- [ ] Consumer verification loads for `/consumer/1`
- [ ] IPFS uploads work (try registering product)
- [ ] Mobile responsive (test on phone)

---

## Part 4: QR Code Generation

### Generate QR Codes for All Products

```bash
# Navigate back to blockchain folder
cd ../blockchain

# Run QR generation script
node scripts/generate-qr-codes.js
```

Or use the API endpoint:

```bash
# Generate QR for Product #1
curl "https://veriorganic.vercel.app/api/generateQR?productId=1" \
  --output product-1-qr.png
```

This creates QR codes that link to:
```
https://veriorganic.vercel.app/consumer/1
```

### Print QR Codes for Demo

1. Download all 6 QR codes
2. Create a demo sheet:
   - **Product 1**: "Scan me! Organic Avocados 🥑"
   - **Product 6**: "Fraud Alert Demo ⚠️"
3. Print on cardstock
4. Bring to hackathon for judges to scan

---

## Part 5: Custom Domain (Optional)

### Step 1: Purchase Domain

Buy domain from:
- **Namecheap** (~$10/year)
- **Google Domains** (~$12/year)
- **GoDaddy** (~$15/year)

Suggested names:
- `veriorganic.com`
- `organicchain.app`
- `truthchain.io`

### Step 2: Configure DNS

In your domain provider's DNS settings:

#### For Vercel:

Add these records:
```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### Step 3: Add Domain in Vercel

1. Go to your Vercel project
2. Click **"Settings"** → **"Domains"**
3. Enter your domain: `veriorganic.com`
4. Click **"Add"**
5. Vercel verifies DNS (takes 1-24 hours)

### Step 4: Force HTTPS

In Vercel project settings:
- ✅ Enable **"Automatically issue SSL"**
- ✅ Enable **"Redirect HTTP to HTTPS"**

---

## Part 6: Post-Deployment Testing

### Smart Contract Tests

```bash
cd blockchain
npx hardhat test
```

Should show:
```
  OrganicSupplyChain
    Deployment
      ✓ Should set the right owner
      ✓ Should grant default roles
    Product Registration
      ✓ Should register a product
      ✓ Should emit ProductRegistered event
    ... (40+ tests)

  44 passing (3.2s)
```

### Frontend E2E Testing

Manual test checklist:

#### Landing Page
- [ ] 3D globe renders and rotates
- [ ] Stats cards show data
- [ ] "Get Started" button navigates
- [ ] All role cards link correctly

#### Farmer Dashboard
- [ ] Connect wallet prompts MetaMask
- [ ] "Register Product" opens modal
- [ ] Form validation works (try empty fields)
- [ ] Product registration succeeds
- [ ] New product appears in grid
- [ ] Stats update after registration

#### Consumer Verification
- [ ] Navigate to `/consumer/1`
- [ ] Authenticity badge shows score
- [ ] Product timeline renders all events
- [ ] Carbon footprint calculates correctly
- [ ] Certificates display
- [ ] GPS coordinates show

#### Fraud Detection
- [ ] Navigate to `/consumer/6`
- [ ] Score should be **45** (low)
- [ ] Red "Warning" badge appears
- [ ] Details explain fraud indicators
- [ ] Sensor anomalies highlighted

### Performance Testing

Check lighthouse scores:
```bash
npm install -g lighthouse
lighthouse https://veriorganic.vercel.app --view
```

Target scores:
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 100
- **SEO**: 90+

---

## Part 7: Monitoring & Maintenance

### Set Up Error Tracking

Add [Sentry](https://sentry.io) for error monitoring:

```bash
npm install @sentry/nextjs
```

Update `next.config.js`:
```javascript
const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig({
  // Your Next.js config
}, {
  // Sentry config
  org: "your-org",
  project: "veriorganic"
});
```

### Set Up Analytics

Add Google Analytics to `pages/_document.tsx`:

```tsx
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
  strategy="afterInteractive"
/>
```

### Monitor Contract Activity

Use Etherscan to watch:
- Transaction count
- Event logs
- Gas usage trends

Create alerts for:
- Failed transactions
- High gas fees
- Unusual activity patterns

### Backup Contract Data

Regularly export product data:

```bash
npx hardhat run scripts/export-data.ts --network sepolia
```

Save to:
- Local backup
- Cloud storage (S3, Google Cloud)
- IPFS for redundancy

---

## Part 8: Upgrades (UUPS Pattern)

Your contract is upgradeable using UUPS proxy. To deploy a new version:

### Step 1: Edit Contract

Make changes to `OrganicSupplyChain.sol` (add functions, fix bugs).

### Step 2: Deploy Upgrade

```bash
npx hardhat run scripts/upgrade.ts --network sepolia
```

```javascript
// scripts/upgrade.ts
const { ethers, upgrades } = require("hardhat");

async function main() {
  const OrganicSupplyChainV2 = await ethers.getContractFactory("OrganicSupplyChain");
  
  const upgraded = await upgrades.upgradeProxy(
    "0xYourProxyAddress", // original proxy address
    OrganicSupplyChainV2
  );
  
  console.log("Contract upgraded!");
  console.log("Proxy:", upgraded.address); // same address
}
```

**Important**: Proxy address stays the same, only implementation changes.

---

## Part 9: Multi-Network Deployment

### Deploy to Polygon (Lower Gas Fees)

Update `hardhat.config.ts`:

```typescript
polygon: {
  url: process.env.POLYGON_RPC_URL,
  accounts: [process.env.PRIVATE_KEY],
  chainId: 137
}
```

Deploy:
```bash
npx hardhat run scripts/deploy.ts --network polygon
```

Update frontend `.env.local`:
```bash
NEXT_PUBLIC_CHAIN_ID=137
NEXT_PUBLIC_RPC_URL=https://polygon-rpc.com
```

### Deploy to Mainnet (Production)

⚠️ **Warning**: Mainnet deployment costs real ETH (~$50-100 in gas).

1. Get mainnet ETH
2. Triple-check contract code
3. Run audit (OpenZeppelin Defender)
4. Update config:
```typescript
mainnet: {
  url: process.env.MAINNET_RPC_URL,
  accounts: [process.env.PRIVATE_KEY],
  chainId: 1
}
```
5. Deploy:
```bash
npx hardhat run scripts/deploy.ts --network mainnet
```

---

## Part 10: Troubleshooting

### Common Issues

#### Issue 1: "Insufficient funds"
**Error**: `sender doesn't have enough funds`

**Solution**:
- Get more Sepolia ETH from faucet
- Check wallet balance: `npx hardhat balance --account 0xYourAddress --network sepolia`

#### Issue 2: "Nonce too high"
**Error**: `replacement transaction underpriced`

**Solution**:
- Reset MetaMask account (Settings → Advanced → Reset Account)
- Or wait 5 minutes for pending transactions

#### Issue 3: "Cannot find module 'hardhat'"
**Error**: `Cannot find module '@nomiclabs/hardhat-ethers'`

**Solution**:
```bash
cd blockchain
rm -rf node_modules package-lock.json
npm install
```

#### Issue 4: Frontend shows "Wrong Network"
**Error**: MetaMask on wrong network

**Solution**:
- Click MetaMask → Switch to Sepolia
- Or add Sepolia network manually:
  - Network Name: Sepolia
  - RPC URL: https://sepolia.infura.io/v3/YOUR_ID
  - Chain ID: 11155111
  - Currency: ETH

#### Issue 5: IPFS Upload Fails
**Error**: `401 Unauthorized` from Pinata

**Solution**:
- Verify API keys in `.env.local`
- Check Pinata dashboard for rate limits
- Use mock upload for demo (already implemented)

#### Issue 6: Vercel Build Fails
**Error**: `Module not found: '@/utils/blockchain'`

**Solution**:
- Check `tsconfig.json` has correct paths
- Verify all imports use correct casing
- Clear Vercel cache and redeploy

---

## Part 11: Production Checklist

Before going live:

### Security
- [ ] Private keys stored securely (never in code)
- [ ] Environment variables set in Vercel (not hardcoded)
- [ ] Contract verified on Etherscan
- [ ] CORS configured correctly on API routes
- [ ] Rate limiting added to API endpoints

### Performance
- [ ] Images optimized (WebP format, compressed)
- [ ] Code splitting enabled (Next.js automatic)
- [ ] Lazy loading for heavy components
- [ ] CDN configured (Vercel automatic)
- [ ] Lighthouse score >90

### SEO
- [ ] Meta tags added to all pages
- [ ] Open Graph images set
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Schema markup for products

### Monitoring
- [ ] Sentry error tracking active
- [ ] Google Analytics installed
- [ ] Uptime monitoring (e.g., UptimeRobot)
- [ ] Contract event monitoring
- [ ] Backup strategy in place

### Legal
- [ ] Privacy policy page
- [ ] Terms of service
- [ ] Cookie consent banner
- [ ] GDPR compliance (if EU users)
- [ ] Disclaimer about testnet usage

---

## Part 12: Demo Day Preparation

### 1 Day Before
- [ ] Deploy latest code to Vercel
- [ ] Verify all 6 products exist on blockchain
- [ ] Test QR codes print correctly
- [ ] Check demo on mobile device
- [ ] Prepare backup video recording
- [ ] Charge laptop fully
- [ ] Bring phone charger

### 1 Hour Before
- [ ] Connect to venue WiFi
- [ ] Test demo flow 3 times
- [ ] Open all tabs:
  - Landing page
  - Farmer dashboard
  - Consumer verification (Product 1)
  - Consumer verification (Product 6 - fraud)
- [ ] MetaMask unlocked with Sepolia selected
- [ ] Have contract address visible in notes

### During Demo
- [ ] Speak clearly and enthusiastically
- [ ] Show, don't just tell (live clicks)
- [ ] Highlight glassmorphism UI
- [ ] Demonstrate fraud detection (Product 6)
- [ ] Invite judges to scan QR code
- [ ] Have business cards/GitHub QR ready

---

## 🎉 Success Metrics

You'll know deployment succeeded when:

✅ Smart contract visible on Sepolia Etherscan  
✅ 6 products retrievable via blockchain  
✅ Frontend loads in <2 seconds  
✅ QR codes scannable by any phone  
✅ Demo flows smoothly without errors  
✅ Judges can interact with live system  

---

## 📞 Support Resources

If you get stuck:

- **Hardhat Docs**: https://hardhat.org/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Support**: https://vercel.com/support
- **Ethers.js Docs**: https://docs.ethers.org
- **OpenZeppelin Forum**: https://forum.openzeppelin.com

**Emergency Contact**: (if team-based project, add team lead email)

---

**Deployment Time Estimates**:
- Smart contract: 15-20 minutes
- IPFS setup: 5 minutes
- Frontend deployment: 10 minutes
- QR generation: 5 minutes
- Testing: 30 minutes

**Total**: ~1.5 hours from scratch

Good luck! 🚀
