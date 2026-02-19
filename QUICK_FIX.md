# 🚀 QUICK FIX for Product Registration Error

## ❌ The Problem
Error: `execution reverted (unknown custom error) 0x344fd586`

**Cause:** Your MetaMask account doesn't have FARMER_ROLE permission.

---

## ✅ FASTEST SOLUTION (2 Minutes)

### Step 1: Import Test Account into MetaMask

1. **Open MetaMask** browser extension
2. Click **account icon** (top right) → **"Import Account"**
3. Select **"Private Key"** from dropdown
4. **Paste this private key:**
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
5. Click **"Import"**
6. ✅ **Done!** This account has ALL roles

### Step 2: Try Registering Again

1. Make sure you're on **"Localhost 8545"** network in MetaMask
2. Go to **Farmer Dashboard**: http://localhost:3000/farmer
3. Fill out the product registration form
4. Click **"Register Product"**
5. **Approve** the transaction in MetaMask
6. ✅ Product registered successfully!

---

## 🎯 ALTERNATIVE: Use Admin Panel

If you want to keep using your current MetaMask account:

1. **First, import Account #0** (admin) using the private key above
2. **Visit Admin Panel**: http://localhost:3000/admin/roles
3. **Enter your original address** in the "Target Address" field
4. Click **"Grant Farmer Role"**
5. **Switch back** to your original account in MetaMask
6. ✅ Now you can register products!

---

## 📋 Test Account Details

**Account #0 (RECOMMENDED - Has ALL Roles)**
- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- Roles: ✅ Farmer, ✅ Processor, ✅ Retailer, ✅ Inspector, ✅ Admin

**Account #1 (Farmer Only)**
- Address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
- Roles: ✅ Farmer

---

## 🔍 Understanding the Error

- **Error Code:** `0x344fd586` = `UnauthorizedAccess()` 
- **Location:** Smart contract `OrganicSupplyChain.sol`
- **Cause:** The `registerProduct()` function has an `onlyFarmer` modifier
- **Fix:** Use an account with FARMER_ROLE

---

## ⚠️ Important Notes

- 🔒 These are **LOCAL TEST ACCOUNTS ONLY** - DO NOT use on mainnet!
- 📡 Make sure Hardhat node is running: `cd blockchain && npx hardhat node`
- 🌐 Make sure MetaMask is on **Localhost 8545** (Chain ID: 31337)
- 💰 Each test account has 10,000 ETH for testing

---

## 📚 Additional Resources

- **Full Guide:** See `ROLE_SETUP_GUIDE.md` in project root
- **Admin Panel:** http://localhost:3000/admin/roles (manage roles)
- **Farmer Dashboard:** http://localhost:3000/farmer (register products)
- **Consumer Verification:** http://localhost:3000/consumer (scan QR codes)

---

**Need More Help?**
Check the full setup guide or look at the smart contract error definitions in:
`blockchain/contracts/OrganicSupplyChain.sol` (lines 23-32)
