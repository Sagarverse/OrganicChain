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

export default function RolesAdmin() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [targetAddress, setTargetAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userRoles, setUserRoles] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadAccount();
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
    const roles: Record<string, boolean> = {};
    for (const role of ROLES) {
      try {
        const hasRole = await checkRole(address, role.name);
        roles[role.name] = hasRole;
      } catch (error) {
        roles[role.name] = false;
      }
    }
    setUserRoles(roles);
  };

  const handleGrantRole = async (roleName: string) => {
    if (!targetAddress) {
      setMessage('❌ Please enter an address');
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
      setMessage(`❌ Failed: ${error.message || 'Unknown error'}`);
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
            <div className="flex items-center gap-2 mb-4">
              <FaUsers className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Your Roles</h2>
            </div>
            <p className="text-sm text-gray-300 mb-3">
              Connected: <span className="font-mono">{account}</span>
            </p>
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
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-sm font-semibold text-purple-400 mb-1">Account #0 (All Roles)</p>
              <p className="text-xs text-gray-400 font-mono break-all mb-2">
                0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
              </p>
              <button
                onClick={() => setTargetAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')}
                className="text-xs px-3 py-1 bg-purple-500 hover:bg-purple-600 rounded text-white"
              >
                Use This Address
              </button>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-sm font-semibold text-green-400 mb-1">Account #1 (Farmer)</p>
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
