import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaTrash, 
  FaExclamationTriangle, 
  FaBox, 
  FaLeaf, 
  FaUsers,
  FaChartLine,
  FaSearch,
  FaUserPlus,
  FaCopy,
  FaCheckCircle,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { ethers } from 'ethers';
import { 
  getAllProducts, 
  getAllBatches, 
  deleteProduct, 
  deleteBatch, 
  recallProduct,
  flagTamper,
  checkRole,
  getCurrentAccount,
  grantRole
} from '../../utils/blockchain';
import { PRODUCT_STATUS } from '../../utils/constants';

interface Product {
  id: number;
  name: string;
  category: string;
  farmer: string;
  status: number;
  harvestDate: number;
  quantity: number;
}

interface Batch {
  id: number;
  productId: number;
  processor: string;
  quantity: number;
  processingDate: number;
  status: number;
  processingLocation?: string;
  processingNotes?: string;
  processingCertHash?: string;
}

interface ConfirmModal {
  isOpen: boolean;
  type: 'product' | 'batch' | 'recall';
  id: number;
  name?: string;
}

interface NewUser {
  address: string;
  privateKey: string;
  role: string;
  timestamp: number;
}

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    isOpen: false,
    type: 'product',
    id: 0
  });
  const [recallReason, setRecallReason] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'batches' | 'users'>('products');
  
  // User creation states
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'FARMER_ROLE' | 'PROCESSOR_ROLE' | 'RETAILER_ROLE' | 'INSPECTOR_ROLE'>('FARMER_ROLE');
  const [createdUser, setCreatedUser] = useState<NewUser | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [copiedField, setCopiedField] = useState<'address' | 'privateKey' | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [createdUsers, setCreatedUsers] = useState<NewUser[]>([]);

  useEffect(() => {
    checkAdminRole();
    loadData();
    loadCreatedUsers();
  }, []);

  const loadCreatedUsers = () => {
    try {
      const stored = localStorage.getItem('createdUsers');
      if (stored) {
        setCreatedUsers(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading created users:', error);
    }
  };

  const checkAdminRole = async () => {
    try {
      const account = await getCurrentAccount();
      if (account) {
        const hasAdminRole = await checkRole(account, 'ADMIN');
        setIsAdmin(hasAdminRole);
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, batchesData] = await Promise.all([
        getAllProducts(),
        getAllBatches()
      ]);
      
      setProducts(productsData || []);
      setBatches(batchesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await deleteProduct(productId);
      setConfirmModal({ isOpen: false, type: 'product', id: 0 });
      loadData(); // Reload data
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. You may not have permission.');
    }
  };

  const handleDeleteBatch = async (batchId: number) => {
    try {
      await deleteBatch(batchId);
      setConfirmModal({ isOpen: false, type: 'batch', id: 0 });
      loadData();
    } catch (error) {
      console.error('Error deleting batch:', error);
      alert('Failed to delete batch. You may not have permission.');
    }
  };

  const handleRecallProduct = async (productId: number) => {
    if (!recallReason.trim()) {
      alert('Please provide a reason for recall');
      return;
    }

    try {
      await recallProduct(productId, recallReason);
      setConfirmModal({ isOpen: false, type: 'recall', id: 0 });
      setRecallReason('');
      loadData();
    } catch (error) {
      console.error('Error recalling product:', error);
      alert('Failed to recall product. You may not have permission.');
    }
  };

  const handleFlagTamper = async (productId: number, name?: string) => {
    const reason = prompt(`Provide a tamper reason for ${name || `Product #${productId}`}:`);
    if (!reason || !reason.trim()) {
      return;
    }

    try {
      await flagTamper(productId, reason.trim());
      alert('✅ Tamper flag recorded. Authenticity score updated.');
      loadData();
    } catch (error) {
      console.error('Error flagging tamper:', error);
      alert('Failed to flag tamper. You may not have permission.');
    }
  };

  const handleCreateUser = async () => {
    setIsCreatingUser(true);
    try {
      // Generate new wallet
      const wallet = ethers.Wallet.createRandom();
      const address = wallet.address;
      const privateKey = wallet.privateKey;

      // Grant role on blockchain
      await grantRole(address, selectedRole);

      // Create user object
      const newUser: NewUser = {
        address,
        privateKey,
        role: selectedRole,
        timestamp: Date.now()
      };

      // Store in localStorage (without private key for security)
      const userToStore = {
        address,
        role: selectedRole,
        timestamp: Date.now(),
        privateKey: '***HIDDEN***' // Don't store actual private key
      };
      
      const updatedUsers = [...createdUsers, userToStore as NewUser];
      setCreatedUsers(updatedUsers);
      localStorage.setItem('createdUsers', JSON.stringify(updatedUsers));

      // Show created user with private key (one time only)
      setCreatedUser(newUser);
      setShowCreateUserModal(false);
      setShowPrivateKey(false);
      
      alert('✅ User created successfully! IMPORTANT: Save the private key now - it will not be shown again!');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Make sure you have admin permissions and the user does not already have a role.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const copyToClipboard = async (text: string, field: 'address' | 'privateKey') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  };

  const closeUserCreatedModal = () => {
    if (confirm('⚠️ Have you saved the private key? It will NOT be shown again!')) {
      setCreatedUser(null);
      setShowPrivateKey(false);
    }
  };

  const openConfirmModal = (type: 'product' | 'batch' | 'recall', id: number, name?: string) => {
    setConfirmModal({ isOpen: true, type, id, name });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: 'product', id: 0 });
    setRecallReason('');
  };

  const filteredProducts = products.filter(product =>
    (product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (product?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (product?.farmer?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const filteredBatches = batches.filter(batch =>
    batch?.id?.toString().includes(searchTerm) ||
    batch?.productId?.toString().includes(searchTerm) ||
    (batch?.processor?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/10 border border-red-500/50 rounded-lg p-8 text-center"
        >
          <FaExclamationTriangle className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-300">You do not have admin privileges to access this dashboard.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage products, batches, users and system operations</p>
          </div>
          <motion.button
            onClick={() => setShowCreateUserModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
          >
            <FaUserPlus className="text-xl" />
            Create New User
          </motion.button>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/30"
          >
            <FaLeaf className="text-green-400 text-3xl mb-3" />
            <h3 className="text-gray-300 text-sm mb-1">Total Products</h3>
            <p className="text-3xl font-bold text-white">{products.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/30"
          >
            <FaBox className="text-blue-400 text-3xl mb-3" />
            <h3 className="text-gray-300 text-sm mb-1">Total Batches</h3>
            <p className="text-3xl font-bold text-white">{batches.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/30"
          >
            <FaChartLine className="text-purple-400 text-3xl mb-3" />
            <h3 className="text-gray-300 text-sm mb-1">Active Products</h3>
            <p className="text-3xl font-bold text-white">
              {products.filter(p => Number(p.status) !== 7).length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl p-6 border border-yellow-500/30"
          >
            <FaExclamationTriangle className="text-yellow-400 text-3xl mb-3" />
            <h3 className="text-gray-300 text-sm mb-1">Recalled</h3>
            <p className="text-3xl font-bold text-white">
              {products.filter(p => Number(p.status) === 7).length}
            </p>
          </motion.div>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products or batches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
            />
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'products'
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('batches')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'batches'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Batches
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'users'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Users ({createdUsers.length})
          </button>
        </div>

        {/* Products Table */}
        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Farmer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Quantity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="border-t border-gray-700 hover:bg-gray-700/30">
                        <td className="px-6 py-4 text-white">#{product.id}</td>
                        <td className="px-6 py-4 text-white font-medium">{product.name}</td>
                        <td className="px-6 py-4 text-gray-300">{product.category}</td>
                        <td className="px-6 py-4 text-gray-300 font-mono text-xs">
                          {product.farmer ? `${product.farmer.slice(0, 6)}...${product.farmer.slice(-4)}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              Number(product.status) === 7
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-green-500/20 text-green-400'
                            }`}
                          >
                            {PRODUCT_STATUS[Number(product.status)] || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white">{product.quantity} kg</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleFlagTamper(product.id, product.name)}
                              className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                              title="Flag Tamper"
                            >
                              <FaChartLine />
                            </button>
                            <button
                              onClick={() => openConfirmModal('recall', product.id, product.name)}
                              className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors"
                              title="Recall Product"
                            >
                              <FaExclamationTriangle />
                            </button>
                            <button
                              onClick={() => openConfirmModal('product', product.id, product.name)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                              title="Delete Product"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Batches Table */}
        {activeTab === 'batches' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Batch ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Product ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Processor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Quantity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredBatches.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        No batches found
                      </td>
                    </tr>
                  ) : (
                    filteredBatches.map((batch) => (
                      <tr key={batch.id} className="border-t border-gray-700 hover:bg-gray-700/30">
                        <td className="px-6 py-4 text-white">#{batch.id}</td>
                        <td className="px-6 py-4 text-white">#{batch.productId}</td>
                        <td className="px-6 py-4 text-gray-300 font-mono text-xs">
                          {batch.processor ? `${batch.processor.slice(0, 6)}...${batch.processor.slice(-4)}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-white">{batch.quantity} kg</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              Number(batch.status) === 3
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {PRODUCT_STATUS[Number(batch.status)] || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openConfirmModal('batch', batch.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                            title="Delete Batch"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Users Table */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">#</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Address</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Private Key</th>
                  </tr>
                </thead>
                <tbody>
                  {createdUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                        No users created yet. Click "Create New User" to add users.
                      </td>
                    </tr>
                  ) : (
                    createdUsers.map((user, index) => (
                      <tr key={index} className="border-t border-gray-700 hover:bg-gray-700/30">
                        <td className="px-6 py-4 text-white">{index + 1}</td>
                        <td className="px-6 py-4 text-gray-300 font-mono text-xs">
                          {user.address ? `${user.address.slice(0, 10)}...${user.address.slice(-8)}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.role === 'FARMER_ROLE'
                                ? 'bg-green-500/20 text-green-400'
                                : user.role === 'PROCESSOR_ROLE'
                                ? 'bg-blue-500/20 text-blue-400'
                                : user.role === 'RETAILER_ROLE'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-purple-500/20 text-purple-400'
                            }`}
                          >
                            {user.role.replace('_ROLE', '')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-300 text-sm">
                          {new Date(user.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-400 text-xs italic">
                            {user.privateKey === '***HIDDEN***' ? 'Hidden (shown only once)' : 'Available'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700"
          >
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FaUserPlus className="text-green-500" />
              Create New User
            </h3>
            
            <p className="text-gray-300 mb-6">
              This will generate a new wallet address with a private key and assign the selected role.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Select Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
              >
                <option value="FARMER_ROLE">🌱 Farmer</option>
                <option value="PROCESSOR_ROLE">🏭 Processor</option>
                <option value="RETAILER_ROLE">🏪 Retailer</option>
                <option value="INSPECTOR_ROLE">🔍 Inspector</option>
              </select>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <p className="text-yellow-400 text-sm flex items-center gap-2">
                <FaExclamationTriangle />
                <span className="font-semibold">Important:</span>
              </p>
              <p className="text-yellow-300 text-xs mt-2">
                The private key will be shown only ONCE. Make sure to save it securely before closing.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCreateUser}
                disabled={isCreatingUser}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {isCreatingUser ? 'Creating...' : '✨ Generate User'}
              </button>
              <button
                onClick={() => setShowCreateUserModal(false)}
                disabled={isCreatingUser}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* User Created Success Modal */}
      {createdUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 max-w-2xl w-full border-2 border-green-500/50 shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <FaCheckCircle className="text-green-500 text-4xl" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">User Created Successfully!</h3>
              <p className="text-gray-400">Save these credentials immediately</p>
            </div>

            <div className="bg-red-500/10 border-2 border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-400 font-bold flex items-center gap-2 mb-2">
                <FaExclamationTriangle className="text-2xl" />
                CRITICAL WARNING
              </p>
              <p className="text-red-300 text-sm">
                This is the ONLY time you will see the private key. It CANNOT be recovered later.
                Save it in a secure password manager or write it down safely.
              </p>
            </div>

            {/* Address */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Wallet Address
              </label>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 flex items-center justify-between">
                <code className="text-green-400 text-sm font-mono break-all">
                  {createdUser.address}
                </code>
                <button
                  onClick={() => copyToClipboard(createdUser.address, 'address')}
                  className="ml-3 p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition-colors"
                  title="Copy Address"
                >
                  {copiedField === 'address' ? <FaCheckCircle /> : <FaCopy />}
                </button>
              </div>
            </div>

            {/* Private Key */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Private Key (SAVE THIS NOW!)
              </label>
              <div className="bg-gray-900/50 border-2 border-yellow-500/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="text-yellow-400 hover:text-yellow-300 flex items-center gap-2 text-sm"
                  >
                    {showPrivateKey ? <FaEyeSlash /> : <FaEye />}
                    {showPrivateKey ? 'Hide' : 'Show'} Private Key
                  </button>
                  <button
                    onClick={() => copyToClipboard(createdUser.privateKey, 'privateKey')}
                    className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded transition-colors"
                    title="Copy Private Key"
                  >
                    {copiedField === 'privateKey' ? <FaCheckCircle /> : <FaCopy />}
                  </button>
                </div>
                <code className="text-yellow-400 text-xs font-mono break-all block">
                  {showPrivateKey ? createdUser.privateKey : '•'.repeat(66)}
                </code>
              </div>
            </div>

            {/* Role */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Assigned Role
              </label>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                    createdUser.role === 'FARMER_ROLE'
                      ? 'bg-green-500/20 text-green-400'
                      : createdUser.role === 'PROCESSOR_ROLE'
                      ? 'bg-blue-500/20 text-blue-400'
                      : createdUser.role === 'RETAILER_ROLE'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}
                >
                  {createdUser.role.replace('_ROLE', '')}
                </span>
              </div>
            </div>

            <button
              onClick={closeUserCreatedModal}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-lg transition-colors shadow-lg"
            >
              I Have Saved the Private Key ✓
            </button>

            <p className="text-center text-gray-500 text-xs mt-4">
              Click only after you have securely saved the private key
            </p>
          </motion.div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700"
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              {confirmModal.type === 'recall' ? 'Recall Product' : 'Confirm Deletion'}
            </h3>
            
            {confirmModal.type === 'recall' ? (
              <>
                <p className="text-gray-300 mb-4">
                  You are about to recall <span className="font-semibold text-white">{confirmModal.name}</span>.
                  Please provide a reason:
                </p>
                <textarea
                  value={recallReason}
                  onChange={(e) => setRecallReason(e.target.value)}
                  placeholder="Enter reason for recall..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 mb-4"
                  rows={4}
                />
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleRecallProduct(confirmModal.id)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Recall Product
                  </button>
                  <button
                    onClick={closeConfirmModal}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete this {confirmModal.type}? This action cannot be undone.
                  {confirmModal.name && (
                    <span className="block mt-2 font-semibold text-white">{confirmModal.name}</span>
                  )}
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() =>
                      confirmModal.type === 'product'
                        ? handleDeleteProduct(confirmModal.id)
                        : handleDeleteBatch(confirmModal.id)
                    }
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={closeConfirmModal}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
