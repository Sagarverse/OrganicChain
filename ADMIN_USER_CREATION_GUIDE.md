# Admin User Creation Guide

## Overview

The Admin Dashboard now includes powerful user management capabilities, allowing administrators to create new blockchain users with wallet addresses and private keys, and assign them specific roles in the supply chain system.

## Features

### 1. User Creation
- **Generate Wallet**: Automatically creates a new Ethereum wallet with address and private key
- **Role Assignment**: Assign roles (Farmer, Processor, Retailer, Inspector) during creation
- **Blockchain Integration**: Automatically grants the selected role on the smart contract
- **One-Time Private Key Display**: Private keys are shown only once for security

### 2. User Management
- **User List**: View all created users in the Users tab
- **Role Tracking**: See which role each user has been assigned
- **Creation Timestamps**: Track when each user was created
- **Address Display**: View user wallet addresses

### 3. Security Features
- **Single Private Key Display**: Private keys shown only once at creation
- **Copy to Clipboard**: Easy copying of addresses and private keys
- **Show/Hide Toggle**: Private keys can be hidden with eye icon
- **Warning System**: Multiple warnings about saving private keys
- **Confirmation Modal**: Double-check before closing the private key display
- **Local Storage**: User list stored locally (without actual private keys)

## How to Use

### Creating a New User

1. **Access Admin Dashboard**
   - Navigate to `/admin` in the application
   - Ensure you have admin role permissions

2. **Click "Create New User" Button**
   - Located in the top-right of the Admin Dashboard header
   - Opens the user creation modal

3. **Select Role**
   - Choose from dropdown:
     - 🌱 **Farmer**: Can register products and harvest
     - 🏭 **Processor**: Can create batches and process products
     - 🏪 **Retailer**: Can accept deliveries and update product status
     - 🔍 **Inspector**: Can approve/reject certificates

4. **Generate User**
   - Click "✨ Generate User" button
   - Wait for blockchain transaction to complete
   - User wallet will be created and role assigned on-chain

5. **Save Credentials** (CRITICAL STEP!)
   - **Wallet Address**: Copy and save
   - **Private Key**: MUST copy and save securely
   - Click eye icon to show/hide private key
   - Use copy buttons to copy to clipboard
   - Private key will NOT be shown again!

6. **Confirm Saved**
   - Click "I Have Saved the Private Key ✓"
   - Confirm in the warning dialog
   - Modal will close and user will be added to the list

### Viewing Created Users

1. **Navigate to Users Tab**
   - Click "Users" tab in the Admin Dashboard
   - Shows count: "Users (X)"

2. **User Table Columns**
   - **#**: Sequential number
   - **Address**: Wallet address (truncated)
   - **Role**: Color-coded role badge
   - **Created**: Creation date
   - **Private Key**: Status (Hidden after first display)

### User Table Features

#### Role Color Coding
- 🟢 **Green**: FARMER
- 🔵 **Blue**: PROCESSOR
- 🟡 **Yellow**: RETAILER
- 🟣 **Purple**: INSPECTOR

#### Address Display
- Format: `0x1234567...89abcdef`
- Truncated for better display
- Full address available on hover

## Security Best Practices

### For Administrators

1. **Private Key Management**
   - Never share private keys via insecure channels
   - Use secure password managers (1Password, LastPass, etc.)
   - Consider physical backups in secure locations
   - Do NOT store in plain text files

2. **User Distribution**
   - Send private keys directly to users via secure channels
   - Use encrypted email or secure messaging
   - Consider splitting delivery (address via email, key via SMS)
   - Confirm receipt before clearing your copy

3. **Access Control**
   - Only trusted admins should have user creation access
   - Regularly audit created users
   - Monitor for suspicious role grants
   - Revoke unnecessary admin access

### For End Users

1. **Receiving Credentials**
   - Save private key immediately
   - Never share private key with anyone
   - Use secure password manager
   - Test access before deleting admin's message

2. **Using Private Keys**
   - Import into MetaMask or other wallet
   - Keep backed up in multiple secure locations
   - Do not store in browser or unencrypted files
   - Use hardware wallet for high-value operations

## Technical Details

### Wallet Generation

```typescript
// Uses ethers.js to generate cryptographically secure wallet
const wallet = ethers.Wallet.createRandom();
const address = wallet.address;
const privateKey = wallet.privateKey;
```

### Role Assignment

```typescript
// Calls smart contract to grant role
await grantRole(address, selectedRole);
```

Supported roles:
- `FARMER_ROLE`
- `PROCESSOR_ROLE`
- `RETAILER_ROLE`
- `INSPECTOR_ROLE`

### Data Storage

**LocalStorage** (Frontend):
```json
{
  "address": "0x...",
  "role": "FARMER_ROLE",
  "timestamp": 1708531200000,
  "privateKey": "***HIDDEN***"
}
```

**Smart Contract** (Blockchain):
- Role grants stored on-chain
- Immutable role assignments
- Accessible via `hasRole(roleHash, address)`

## UI Components

### Create User Modal

**Features:**
- Role selection dropdown
- Warning banner about private key
- Generate/Cancel buttons
- Loading state during creation

**Styling:**
- Glassmorphic design
- Green gradient accent
- Yellow warning colors
- Smooth animations

### User Created Modal

**Sections:**
1. **Success Banner**: Green checkmark and confirmation
2. **Warning Box**: Red border with critical warnings
3. **Address Section**: With copy button
4. **Private Key Section**: With show/hide toggle and copy button
5. **Role Badge**: Color-coded role display
6. **Confirmation Button**: Large green button to close

**Interactive Elements:**
- 👁️/🔒 Eye icon to toggle private key visibility
- 📋 Copy icons turn to ✓ after copying
- Warning confirmation before closing

### Users Tab

**Table Layout:**
- Responsive design
- Hover effects on rows
- Empty state message
- Color-coded role badges
- Truncated addresses

## Error Handling

### Common Errors

1. **"Failed to create user"**
   - **Cause**: Insufficient admin permissions
   - **Solution**: Verify admin role on blockchain
   - **Check**: Run `checkRole(yourAddress, 'ADMIN')`

2. **"User already has a role"**
   - **Cause**: Address already has assigned role
   - **Solution**: Use different address or revoke existing role

3. **"Contract not available"**
   - **Cause**: MetaMask not connected or wrong network
   - **Solution**: Connect wallet and switch to correct network

4. **"Failed to copy to clipboard"**
   - **Cause**: Browser permissions
   - **Solution**: Manually select and copy text

### Transaction Failures

If transaction fails:
1. Check gas balance in admin wallet
2. Verify contract address is correct
3. Confirm admin role on contract
4. Try again with higher gas limit

## Integration with MetaMask

### For Created Users

1. **Open MetaMask**
2. **Click Account Icon** (top-right)
3. **Select "Import Account"**
4. **Choose "Private Key"**
5. **Paste Private Key** (received from admin)
6. **Click "Import"**
7. **Account Added** - Now ready to use

### Verify Role Assignment

```typescript
// Check role in frontend
const hasRole = await checkRole(address, 'FARMER_ROLE');
console.log('Has Farmer Role:', hasRole);
```

## Statistics

The Admin Dashboard shows:
- **Total Products**: All registered products
- **Total Batches**: All processing batches
- **Active Products**: Non-recalled products
- **Recalled**: Recalled product count
- **Users**: Created user count in Users tab button

## API Reference

### Frontend Functions

#### `handleCreateUser()`
Creates new user with wallet and role assignment.

**Returns:** Success/error alert

**Side Effects:**
- Creates Ethereum wallet
- Grants role on blockchain
- Saves to localStorage
- Shows success modal

#### `copyToClipboard(text, field)`
Copies text to clipboard with visual feedback.

**Parameters:**
- `text`: String to copy
- `field`: 'address' or 'privateKey'

**Returns:** Sets `copiedField` state for 2 seconds

#### `closeUserCreatedModal()`
Closes user success modal with confirmation.

**Returns:** Confirmation dialog, clears `createdUser` state

### Smart Contract Functions

#### `grantFarmerRole(address)`
Grants FARMER_ROLE to address.

#### `grantProcessorRole(address)`
Grants PROCESSOR_ROLE to address.

#### `grantRetailerRole(address)`
Grants RETAILER_ROLE to address.

#### `grantInspectorRole(address)`
Grants INSPECTOR_ROLE to address.

## Troubleshooting

### Private Key Not Showing
- **Issue**: Modal closes immediately
- **Fix**: Disable popup blockers
- **Fix**: Check browser console for errors

### Role Not Granted
- **Issue**: User created but no role
- **Fix**: Check transaction on block explorer
- **Fix**: Verify admin has DEFAULT_ADMIN_ROLE
- **Fix**: Manually call grantRole again

### Cannot Create User
- **Issue**: Button disabled or errors
- **Fix**: Refresh page and reconnect wallet
- **Fix**: Check network connection
- **Fix**: Verify admin role permissions

## Future Enhancements

Potential improvements for future versions:

1. **Bulk User Creation**: Create multiple users at once
2. **Role Modification**: Change user roles after creation
3. **User Deactivation**: Disable users without deleting
4. **Export Users**: Download user list as CSV
5. **Email Integration**: Automatically email credentials
6. **Multi-Sig Creation**: Require multiple admins to approve
7. **Role Templates**: Predefined permission sets
8. **Audit Logging**: Track all user creation events
9. **2FA Setup**: Integrate two-factor authentication
10. **Hardware Wallet Support**: Generate keys on hardware devices

## Changelog

### Version 1.0.0 (Current)
- ✅ Wallet generation with ethers.js
- ✅ Role assignment integration
- ✅ One-time private key display
- ✅ User list with localStorage
- ✅ Copy to clipboard functionality
- ✅ Show/hide private key toggle
- ✅ Warning system for security
- ✅ Color-coded role badges
- ✅ Responsive UI design
- ✅ Empty state handling

## Support

For issues or questions:
1. Check this guide first
2. Review blockchain.ts for implementation details
3. Check browser console for errors
4. Verify MetaMask connection and network
5. Contact system administrator

---

**⚠️ SECURITY REMINDER**: Private keys grant complete control over accounts. Never share them, store them securely, and treat them like passwords. Loss of private keys means permanent loss of account access.
