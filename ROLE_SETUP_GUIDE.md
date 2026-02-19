# 🔐 Role Management & MetaMask Setup Guide

## Problem: "execution reverted (unknown custom error) 0x344fd586"

This error occurs when trying to register a product because the connected MetaMask account doesn't have the **FARMER_ROLE** permission.

---

## ✅ Solution 1: Import Test Account with Roles (Recommended)

### Option A: Import Account #0 (Has ALL Roles - Best for Testing)

1. **Open MetaMask**
2. **Click on your account icon** (top right)
3. **Select "Import Account"**
4. **Choose "Select Type" → "Private Key"**
5. **Paste this private key:**
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
6. **Click "Import"**
7. **This account has:**
   - ✅ FARMER_ROLE (can register products)
   - ✅ PROCESSOR_ROLE (can create batches)
   - ✅ RETAILER_ROLE (can update delivery status)
   - ✅ INSPECTOR_ROLE (can approve certificates)
   - ✅ ADMIN_ROLE (can grant roles to others)
   - **Address:** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

### Option B: Import Account #1 (Farmer Only)

1. Follow steps 1-4 above
2. **Paste this private key instead:**
   ```
   0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
   ```
3. **This account has:**
   - ✅ FARMER_ROLE only
   - **Address:** `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`

---

## ✅ Solution 2: Grant Roles Using Admin Panel

If you want to use your own MetaMask account:

1. **First, import Account #0** (the admin account) using Solution 1
2. **Navigate to:** [http://localhost:3000/admin/roles](http://localhost:3000/admin/roles)
3. **Enter your MetaMask address** in the "Target Address" field
4. **Click "Grant Farmer Role"** (or any other role you need)
5. **Switch back to your original account** in MetaMask
6. **Try registering the product again**

---

## 📋 Available Test Accounts

The Hardhat local network provides 20 test accounts with 10,000 ETH each:

| Account | Address | Role | Private Key |
|---------|---------|------|-------------|
| #0 | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | ALL ROLES | `0xac0974bec...` |
| #1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | FARMER | `0x59c6995e99...` |
| #2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | PROCESSOR | `0x5de4111aea...` |
| #3 | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | RETAILER | `0x7c852118294...` |
| #4 | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | INSPECTOR | `0x47e179ec197...` |

> **Note:** These are test accounts on a local network. Never use these private keys on mainnet!

---

## 🔍 Understanding the Error

### What is `0x344fd586`?

This is the error selector for the `UnauthorizedAccess()` custom error in the smart contract.

```solidity
// In OrganicSupplyChain.sol
error UnauthorizedAccess();

modifier onlyFarmer() {
    if (!hasRole(FARMER_ROLE, msg.sender)) revert UnauthorizedAccess();
    _;
}

function registerProduct(...) external onlyFarmer {
    // Product registration logic
}
```

When you try to call `registerProduct()` without FARMER_ROLE, the contract reverts with this error.

---

## 🛠️ Verifying Your Roles

You can check which roles your account has:

1. **Visit the Admin Panel:** [http://localhost:3000/admin/roles](http://localhost:3000/admin/roles)
2. **Connect your MetaMask**
3. **Your current roles are displayed at the top**

---

## ⚠️ Network Configuration

Make sure MetaMask is connected to:
- **Network Name:** Localhost 8545
- **RPC URL:** http://127.0.0.1:8545
- **Chain ID:** 31337
- **Currency Symbol:** ETH

---

## 🔄 Reset Instructions

If something goes wrong, you can reset everything:

```bash
# Stop Hardhat
pkill -f "hardhat node"

# Restart Hardhat
cd blockchain
npx hardhat node

# In a new terminal, redeploy
npx hardhat run scripts/deploy.ts --network localhost

# Seed demo data (optional)
npx hardhat run scripts/seed-data.ts --network localhost
```

---

## 📝 Next Steps After Fixing

Once you've imported the correct account:

1. ✅ Navigate to Farmer Dashboard
2. ✅ Fill out the product registration form
3. ✅ Click "Register Product"
4. ✅ Approve the transaction in MetaMask
5. ✅ Your product will be registered with a QR code!

---

## 🆘 Still Having Issues?

Check these common problems:

- [ ] MetaMask is connected to **Localhost 8545** (not mainnet!)
- [ ] You imported the **correct private key**
- [ ] Hardhat node is **running** (`npx hardhat node`)
- [ ] Contract is **deployed** (check terminal logs)
- [ ] You're using the **imported account** (not your default MetaMask account)

---

## 📚 Additional Resources

- **Admin Panel:** `/admin/roles` - Manage roles for any address
- **Farmer Dashboard:** `/dashboard/farmer` - Register products
- **Consumer Verification:** `/consumer` - Scan QR codes
- **Contract Address:** `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

---

**Happy Testing! 🚀**
