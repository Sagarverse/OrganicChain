import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSeedling, FaPlus, FaBox, FaFilter, FaQrcode, FaDownload, FaMapMarkerAlt, FaCalendar } from 'react-icons/fa';
import GlassCard from '../Layout/GlassCard';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import { getCurrentAccount, registerProduct, getFarmerProducts, getProductHistory, getAllProducts } from '../../utils/blockchain';
import { mockUploadToIPFS } from '../../utils/ipfs';
import { CROP_TYPES, PRODUCT_STATUS } from '../../utils/constants';
import { generateProductQRCode, downloadProductQRCode, formatDate, formatCoordinates } from '../../utils/qrcode';

const FarmerDashboard: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [showAllProducts, setShowAllProducts] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [qrCodes, setQrCodes] = useState<{ [key: number]: string }>({});
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    cropType: 0,
    description: '',
    farmName: '',
    certificationBody: '',
    latitude: '',
    longitude: '',
    plantedDate: '',
    expectedHarvestDate: '',
    estimatedQuantity: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (account) {
      loadProducts(account, showAllProducts);
    }
  }, [showAllProducts, account]);

  const loadData = async () => {
    const acc = await getCurrentAccount();
    setAccount(acc);
    if (acc) {
      await loadProducts(acc, showAllProducts);
    }
  };

  const loadProducts = async (address: string, showAll: boolean) => {
    setLoadingProducts(true);
    try {
      if (showAll) {
        // Load all products
        const allProducts = await getAllProducts();
        // Generate QR codes for all products
        await generateQRCodesForProducts(allProducts);
        setProducts(allProducts);
      } else {
        // Load only this farmer's products
        const productIds = await getFarmerProducts(address);
        const productDetails = await Promise.all(
          productIds.map(async (id: number) => {
            const { product } = await getProductHistory(id);
            return { ...product, id };
          })
        );
        // Generate QR codes for farmer products
        await generateQRCodesForProducts(productDetails);
        setProducts(productDetails);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const generateQRCodesForProducts = async (productList: any[]) => {
    const qrMap: { [key: number]: string } = {};
    for (const product of productList) {
      try {
        const qrDataUrl = await generateProductQRCode(Number(product.id));
        qrMap[Number(product.id)] = qrDataUrl;
      } catch (error) {
        console.error(`Failed to generate QR for product ${product.id}:`, error);
      }
    }
    setQrCodes(qrMap);
  };

  const handleDownloadQR = async (product: any) => {
    try {
      await downloadProductQRCode(Number(product.id), product.name);
    } catch (error) {
      console.error('Failed to download QR code:', error);
      alert('Failed to download QR code. Please try again.');
    }
  };

  const handleViewQR = (product: any) => {
    setSelectedProduct(product);
    setShowQRModal(true);
  };

  const validateForm = () => {
    // Validate required fields
    if (!formData.name.trim()) {
      alert('Please enter a product name');
      return false;
    }
    
    // Validate GPS coordinates
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      alert('Please enter a valid latitude (-90 to 90)');
      return false;
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180) {
      alert('Please enter a valid longitude (-180 to 180)');
      return false;
    }
    
    // Validate planted date is not in the future
    const plantedDate = new Date(formData.plantedDate);
    const today = new Date();
    if (plantedDate > today) {
      alert('Planted date cannot be in the future');
      return false;
    }
    
    // Validate expected harvest date if provided
    if (formData.expectedHarvestDate) {
      const harvestDate = new Date(formData.expectedHarvestDate);
      if (harvestDate < plantedDate) {
        alert('Expected harvest date cannot be before planted date');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      // Create comprehensive certificate data for IPFS
      const certData = {
        productName: formData.name,
        farmName: formData.farmName || 'Unknown Farm',
        certificationBody: formData.certificationBody || 'Organic Certification',
        description: formData.description,
        estimatedQuantity: formData.estimatedQuantity,
        expectedHarvestDate: formData.expectedHarvestDate,
        issueDate: new Date().toISOString()
      };
      
      // Upload certificate to IPFS
      const certHash = await mockUploadToIPFS(JSON.stringify(certData));

      // Convert date to timestamp
      const plantedTimestamp = Math.floor(new Date(formData.plantedDate).getTime() / 1000);

      // Register product on blockchain
      await registerProduct(
        formData.name,
        formData.cropType,
        certHash,
        formData.latitude,
        formData.longitude,
        plantedTimestamp
      );

      alert('Product registered successfully! Your product is now on the blockchain.');
      setIsModalOpen(false);
      setFormData({ 
        name: '', 
        cropType: 0, 
        description: '',
        farmName: '',
        certificationBody: '',
        latitude: '', 
        longitude: '', 
        plantedDate: '',
        expectedHarvestDate: '',
        estimatedQuantity: ''
      });
      
      // Reload products
      if (account) {
        await loadProducts(account, showAllProducts);
      }
    } catch (error: any) {
      console.error('Error registering product:', error);
      
      let errorMessage = 'Failed to register product. ';
      
      if (error.code === 4001) {
        errorMessage += 'You rejected the transaction.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage += 'Network error. Make sure MetaMask is connected to Hardhat Local (Chain ID: 31337).';
      } else if (error.message?.includes('user rejected')) {
        errorMessage += 'Transaction was rejected.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage += 'Insufficient ETH for gas fees.';
      } else if (error.message?.includes('AccessControl')) {
        errorMessage += 'Your account does not have FARMER_ROLE. Please use an authorized farmer account.';
      } else if (error.reason) {
        errorMessage += error.reason;
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Connection Warning */}
      {!account && (
        <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 flex items-start gap-3">
          <div className="text-yellow-500 text-xl">⚠️</div>
          <div>
            <h3 className="text-yellow-400 font-semibold mb-1">Wallet Not Connected</h3>
            <p className="text-yellow-200/80 text-sm mb-2">
              Please connect your MetaMask wallet to use the Farmer Dashboard.
            </p>
            <p className="text-yellow-200/80 text-sm">
              Make sure you're connected to <strong>Hardhat Local</strong> network (Chain ID: 31337) 
              and using an account with FARMER_ROLE.
            </p>
            <a 
              href="/api/setup-help" 
              target="_blank"
              className="text-yellow-400 hover:text-yellow-300 text-sm underline mt-2 inline-block"
            >
              View Setup Instructions →
            </a>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Farmer Dashboard</h1>
          <p className="text-gray-400">Manage your organic produce</p>
          {account && (
            <p className="text-sm text-gray-500 mt-1">
              Connected: <span className="text-primary-400 font-mono">{account.slice(0, 6)}...{account.slice(-4)}</span>
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowAllProducts(!showAllProducts)}
            variant="secondary"
          >
            <FaFilter className="inline mr-2" />
            {showAllProducts ? 'All Products' : 'My Products'}
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)}
            disabled={!account}
          >
            <FaPlus className="inline mr-2" />
            Register New Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="text-4xl text-primary-400">
              <FaBox />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Products</p>
              <p className="text-3xl font-bold">{products.length}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="text-4xl text-green-400">
              <FaSeedling />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Batches</p>
              <p className="text-3xl font-bold">
                {products.reduce((sum, p) => sum + (p.batchIds?.length || 0), 0)}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="text-4xl text-yellow-400">⭐</div>
            <div>
              <p className="text-gray-400 text-sm">Avg. Score</p>
              <p className="text-3xl font-bold">
                {products.length > 0
                  ? Math.round(
                      products.reduce((sum, p) => sum + Number(p.authenticityScore), 0) /
                        products.length
                    )
                  : 0}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Products List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {showAllProducts ? 'All Products' : 'Your Products'}
        </h2>
        {loadingProducts ? (
          <GlassCard>
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading products...</p>
            </div>
          </GlassCard>
        ) : products.length === 0 ? (
          <GlassCard>
            <div className="text-center py-12">
              <FaSeedling className="text-6xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">
                {showAllProducts ? 'No products in the system yet' : 'No products registered yet'}
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Start by registering your organic products on the blockchain. You'll need:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto mb-6 text-sm text-left">
                <div className="flex items-start gap-2 text-gray-300">
                  <span className="text-primary-400">✓</span>
                  <span>Product name and description</span>
                </div>
                <div className="flex items-start gap-2 text-gray-300">
                  <span className="text-primary-400">✓</span>
                  <span>Farm location (GPS coordinates)</span>
                </div>
                <div className="flex items-start gap-2 text-gray-300">
                  <span className="text-primary-400">✓</span>
                  <span>Planting date</span>
                </div>
                <div className="flex items-start gap-2 text-gray-300">
                  <span className="text-primary-400">✓</span>
                  <span>Certification details</span>
                </div>
              </div>
              <Button onClick={() => setIsModalOpen(true)}>
                <FaPlus className="inline mr-2" />
                Register Your First Product
              </Button>
            </div>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <GlassCard key={product.id || index}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold">{product.name}</h3>
                  <span className={`status-badge status-${(PRODUCT_STATUS[Number(product.status)] || 'Unknown').toLowerCase().replace(' ', '-')}`}>
                    {PRODUCT_STATUS[Number(product.status)] || 'Unknown'}
                  </span>
                </div>
                
                {/* QR Code Display */}
                {qrCodes[Number(product.id)] && (
                  <div className="mb-4 flex justify-center">
                    <div className="relative group">
                      <img 
                        src={qrCodes[Number(product.id)]} 
                        alt={`QR Code for ${product.name}`}
                        className="w-32 h-32 border-2 border-primary-400 rounded-lg cursor-pointer hover:border-primary-300 transition-colors"
                        onClick={() => handleViewQR(product)}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                        <FaQrcode className="text-white text-2xl" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400">Type:</span>{' '}
                    <span className="text-primary-300">{CROP_TYPES[Number(product.cropType)]}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Product ID:</span>{' '}
                    <span className="font-mono">#{product.id || Number(product.id)}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Farmer:</span>{' '}
                    <span className="font-mono text-xs">{product.farmer?.slice(0, 6)}...{product.farmer?.slice(-4)}</span>
                  </p>
                  <p className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-gray-400" />
                    <span className="text-gray-400">Location:</span>{' '}
                    <span className="text-xs">{formatCoordinates(product.farmLocation?.latitude || '0', product.farmLocation?.longitude || '0')}</span>
                  </p>
                  <p className="flex items-center gap-1">
                    <FaCalendar className="text-gray-400" />
                    <span className="text-gray-400">Planted:</span>{' '}
                    <span>{formatDate(product.plantedDate)}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Score:</span>{' '}
                    <span className="font-bold text-green-400">
                      {Number(product.authenticityScore)}/100
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-400">Batches:</span>{' '}
                    <span>{product.batchIds?.length || 0}</span>
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
                  <Button 
                    onClick={() => handleDownloadQR(product)}
                    variant="secondary"
                    className="flex-1"
                  >
                    <FaDownload className="inline mr-1" />
                    QR Code
                  </Button>
                  <Button 
                    onClick={() => window.open(`/consumer/${product.id}`, '_blank')}
                    variant="primary"
                    className="flex-1"
                  >
                    View Details
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Register Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Product"
      >
        <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-400 border-b border-gray-700 pb-2">
              📋 Basic Information
            </h3>
            
            <Input
              label="Product Name *"
              placeholder="e.g., Organic Heirloom Tomatoes"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Crop Type *
              </label>
              <select
                className="w-full px-4 py-2 bg-dark-200 border border-dark-300 rounded-lg text-white focus:outline-none focus:border-primary-400"
                value={formData.cropType}
                onChange={(e) => setFormData({ ...formData, cropType: parseInt(e.target.value) })}
                required
              >
                {CROP_TYPES.map((type, index) => (
                  <option key={index} value={index}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Product Description
              </label>
              <textarea
                className="w-full px-4 py-2 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-400"
                placeholder="Describe your product, variety, growing methods, etc."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Estimated Quantity"
                type="text"
                placeholder="e.g., 500 kg"
                value={formData.estimatedQuantity}
                onChange={(e) => setFormData({ ...formData, estimatedQuantity: e.target.value })}
              />
            </div>
          </div>

          {/* Farm Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-400 border-b border-gray-700 pb-2">
              🏡 Farm Information
            </h3>
            
            <Input
              label="Farm Name"
              placeholder="e.g., Green Valley Organic Farm"
              value={formData.farmName}
              onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Farm Location (GPS Coordinates) *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-400"
                    placeholder="Latitude: 34.0522"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">North/South coordinate</p>
                </div>
                <div>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-400"
                    placeholder="Longitude: -118.2437"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">East/West coordinate</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                💡 Tip: Use Google Maps to find your farm's coordinates (right-click → "What's here?")
              </p>
            </div>
          </div>

          {/* Certification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-400 border-b border-gray-700 pb-2">
              🏅 Organic Certification
            </h3>
            
            <Input
              label="Certification Body"
              placeholder="e.g., USDA Organic, EU Organic, etc."
              value={formData.certificationBody}
              onChange={(e) => setFormData({ ...formData, certificationBody: e.target.value })}
            />
            
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
              <p className="text-sm text-blue-300">
                📄 Certificate will be automatically generated and stored on IPFS during registration.
              </p>
            </div>
          </div>

          {/* Planting Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-400 border-b border-gray-700 pb-2">
              📅 Planting Schedule
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Planted Date *"
                  type="date"
                  value={formData.plantedDate}
                  onChange={(e) => setFormData({ ...formData, plantedDate: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">When was it planted?</p>
              </div>
              <div>
                <Input
                  label="Expected Harvest Date"
                  type="date"
                  value={formData.expectedHarvestDate}
                  onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">When do you expect to harvest?</p>
              </div>
            </div>
          </div>

          {/* Required Fields Notice */}
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
            <p className="text-sm text-yellow-300">
              ⚠️ Fields marked with * are required. All information will be stored on the blockchain.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <span className="animate-spin inline-block mr-2">⏳</span>
                  Registering...
                </>
              ) : (
                <>
                  <FaSeedling className="inline mr-2" />
                  Register Product
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setSelectedProduct(null);
        }}
        title={`QR Code - ${selectedProduct?.name || 'Product'}`}
      >
        <div className="space-y-4">
          {selectedProduct && qrCodes[Number(selectedProduct.id)] && (
            <div className="flex flex-col items-center">
              <img 
                src={qrCodes[Number(selectedProduct.id)]} 
                alt={`QR Code for ${selectedProduct.name}`}
                className="w-64 h-64 border-4 border-primary-400 rounded-lg"
              />
              <p className="text-sm text-gray-400 mt-4 text-center">
                Scan this QR code to verify product authenticity
              </p>
              <p className="text-xs text-gray-500 font-mono">
                Product ID: #{selectedProduct.id}
              </p>
              <div className="mt-6 w-full">
                <Button 
                  onClick={() => handleDownloadQR(selectedProduct)}
                  fullWidth
                  variant="primary"
                >
                  <FaDownload className="inline mr-2" />
                  Download QR Code
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default FarmerDashboard;
