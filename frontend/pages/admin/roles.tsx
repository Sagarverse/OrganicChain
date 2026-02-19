import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaUsers, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { grantRole, checkRole, getCurrentAccount } from '@/utils/blockchain';

const ROLES = [
  { name: 'FARMER_ROLE', label: 'Farmer', color: 'green' },
  { name: 'PROCESSOR_ROLE', label: 'Processor', color: 'blue' },
  { name: 'RETAILER_ROLE', label: 'Retailer', color: 'purple' },
  { name: 'INSPECTOR_ROLE', label: 'Inspector', color: 'orange' },
];

const TEST_ACCOUNTS = [
  {
    name: 'Admin (All Roles)',
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  },
];

export default function RolesAdmin() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [targetAddress, setTargetAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userRoles, setUserRoles] = useState<Record<string, boolean>>({});
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadAccount();
    
    // Listen for MetaMask account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        console.log('Account changed, reloading...');
        loadAccount();
      });
    }
    
    return () => {
      // Cleanup listener
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  useEffect(() => {
    if (account) {
      checkUserRoles(account);
    }
  }, [account]);

  const loadAccount = async () => {
    try {
      const addr = await getCurrentAccount();
      if (addr) {
        setAccount(addr);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error loading account:', error);
    }
  };

  const checkUserRoles = async (address: string) => {
    console.log('Checking roles for address:', address);
    const roles: Record<string, boolean> = {};
    for (const role of ROLES) {
      try {
        const hasRole = await checkRole(address, role.name);
        roles[role.name] = hasRole;
        console.log(`${role.name}:`, hasRole);
      } catch (error) {
        roles[role.name] = false;
      }
    }
    setUserRoles(roles);

    // Check if user has admin role
    try {
      const adminRole = await checkRole(address, 'DEFAULT_ADMIN_ROLE');
      console.log('DEFAULT_ADMIN_ROLE:', adminRole);
      setIsAdmin(adminRole);
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
    }
  };

  const handleGrantRole = async (roleName: string) => {
    if (!targetAddress) {
      setMessage('❌ Please enter an address');
      return;
    }

    if (!isAdmin) {
      setMessage('❌ You need ADMIN_ROLE to grant roles. Import the admin account (see instructions below).');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await grantRole(targetAddress, roleName);
      setMessage(`✅ Successfully granted ${roleName} to ${targetAddress}`);
      
      // If granting to current user, refresh roles
      if (targetAddress.toLowerCase() === account?.toLowerCase()) {
        await checkUserRoles(account);
      }
    } catch (error: any) {
      console.error('Error granting role:', error);
      
      let errorMsg = '❌ Failed: ';
      if (error.message?.includes('missing role')) {
        errorMsg += 'You need ADMIN_ROLE. Import the admin account below.';
      } else {
        errorMsg += error.message || 'Unknown error';
      }
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaShieldAlt className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Role Management</h1>
          </div>
          <p className="text-gray-300">Grant roles to addresses for the Organic Supply Chain</p>
        </motion.div>

        {/* Current User Roles */}
        {isConnected && account && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaUsers className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">Your Roles</h2>
              </div>
              <button
                onClick={() => account && checkUserRoles(account)}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
            <p className="text-sm text-gray-300 mb-3">
              Connected: <span className="font-mono">{account}</span>
            </p>
            
            {/* Admin Role Status */}
            <div className={`mb-4 p-3 rounded-lg ${isAdmin ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}`}>
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <>
                    <FaCheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-300 font-semibold">✅ ADMIN_ROLE - You can grant roles!</span>
                  </>
                ) : (
                  <>
                    <FaTimesCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-300 font-semibold">❌ NO ADMIN_ROLE - Cannot grant roles</span>
                  </>
                )}
              </div>
            </div>

            {/* Other Roles */}
            <p className="text-xs text-gray-400 mb-2">Other Roles:</p>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <div
                  key={role.name}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    userRoles[role.name]
                      ? 'bg-green-500/20 border border-green-500'
                      : 'bg-red-500/20 border border-red-500'
                  }`}
                >
                  {userRoles[role.name] ? (
                    <FaCheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <FaTimesCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-sm text-white">{role.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Grant Role Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Grant Role to Address</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Address
            </label>
            <input
              type="text"
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {ROLES.map((role) => (
              <button
                key={role.name}
                onClick={() => handleGrantRole(role.name)}
                disabled={loading || !targetAddress}
                className={`px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  role.color === 'green'
                    ? 'bg-green-500 hover:bg-green-600'
                    : role.color === 'blue'
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : role.color === 'purple'
                    ? 'bg-purple-500 hover:bg-purple-600'
                    : 'bg-orange-500 hover:bg-orange-600'
                } text-white`}
              >
                Grant {role.label} Role
              </button>
            ))}
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-4 rounded-lg ${
                message.startsWith('✅')
                  ? 'bg-green-500/20 border border-green-500'
                  : 'bg-red-500/20 border border-red-500'
              }`}
            >
              <p className="text-white">{message}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Admin Warning */}
        {!isAdmin && isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-red-500/20 backdrop-blur-lg rounded-2xl p-6 border border-red-500 mb-6"
          >
            <div className="flex items-start gap-3">
              <FaTimesCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-red-400 mb-2">⚠️ No Admin Privileges</h3>
                <p className="text-red-200 mb-3">
                  Your current account <span className="font-mono text-red-300">{account?.slice(0, 10)}...{account?.slice(-8)}</span> does not have ADMIN_ROLE.
                </p>
                <p className="text-red-200 mb-3">
                  Only accounts with ADMIN_ROLE can grant roles to other addresses.
                </p>
                <div className="bg-red-950/50 rounded-lg p-4 mt-3">
                  <p className="text-red-200 font-semibold mb-2">🔑 Solution:</p>
                  <p className="text-red-200 text-sm mb-3">
                    Import the admin account into MetaMask:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-red-200 text-sm">
                    <li>Open MetaMask → Click account icon (top right)</li>
                    <li>Select "Import Account"</li>
                    <li>Choose "Private Key"</li>
                    <li>Paste the private key from below</li>
                    <li>Switch to the imported account and refresh this page</li>
                  </ol>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Access Accounts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mt-6"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Test Accounts</h2>
          <p className="text-gray-300 mb-4 text-sm">
            These accounts have roles pre-assigned. Import them into MetaMask:
          </p>
          
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/50">
              <div className="flex items-center gap-2 mb-2">
                <FaShieldAlt className="w-5 h-5 text-purple-400" />
                <p className="text-sm font-semibold text-purple-300">Account #0 - ADMIN (All Roles + Can Grant Roles)</p>
              </div>
              <div className="bg-black/30 rounded p-3 mb-3">
                <p className="text-xs text-gray-400 mb-1">Address:</p>
                <p className="text-xs text-purple-300 font-mono break-all mb-3">
                  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
                </p>
                <p className="text-xs text-gray-400 mb-1">Private Key (Import to MetaMask):</p>
                <p className="text-xs text-green-300 font-mono break-all">
                  0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setTargetAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')}
                  className="text-xs px-3 py-2 bg-purple-500 hover:bg-purple-600 rounded text-white font-semibold"
                >
                  Use This Address
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
                    alert('✅ Private key copied! Import it in MetaMask.');
                  }}
                  className="text-xs px-3 py-2 bg-green-500 hover:bg-green-600 rounded text-white font-semibold"
                >
                  📋 Copy Private Key
                </button>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-sm font-semibold text-green-400 mb-1">Account #1 (Farmer Only)</p>
              <p className="text-xs text-gray-400 font-mono break-all mb-2">
                0x70997970C51812dc3A010C7d01b50e0d17dc79C8
              </p>
              <button
                onClick={() => setTargetAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')}
                className="text-xs px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-white"
              >
                Use This Address
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
