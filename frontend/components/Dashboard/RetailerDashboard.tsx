import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStore, FaTruck, FaBoxOpen, FaCheckCircle, FaClock } from 'react-icons/fa';
import GlassCard from '../Layout/GlassCard';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import { getCurrentAccount, getAllProducts, receiveProduct } from '../../utils/blockchain';
import { downloadProductQRCode } from '../../utils/qrcode';

const RetailerDashboard: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [incomingProducts, setIncomingProducts] = useState<any[]>([]);
  const [inStockProducts, setInStockProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [updatingProduct, setUpdatingProduct] = useState<number | null>(null);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [receiveData, setReceiveData] = useState({
    productId: 0,
    retailPrice: '',
    expiryDate: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const acc = await getCurrentAccount();
    setAccount(acc);
    await loadProducts(acc);
  };

  const loadProducts = async (retailerAddress: string | null) => {
    setLoadingProducts(true);
    try {
      const allProducts = await getAllProducts();
      
      if (!retailerAddress) {
        setProducts([]);
        setIncomingProducts([]);
        setInStockProducts([]);
        return;
      }

      // Filter products for this retailer
      // Incoming: status = InTransit (5) and custodian is this retailer
      const incoming = allProducts.filter(
        (p: any) => 
          p.currentCustodian?.toLowerCase() === retailerAddress.toLowerCase() &&
          Number(p.status) === 5 // InTransit
      );

      // In Stock: status = Delivered (6) and custodian is this retailer
      const inStock = allProducts.filter(
        (p: any) => 
          p.currentCustodian?.toLowerCase() === retailerAddress.toLowerCase() &&
          Number(p.status) === 6 // Delivered
      );

      setProducts(allProducts);
      setIncomingProducts(incoming);
      setInStockProducts(inStock);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
      setIncomingProducts([]);
      setInStockProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const openReceiveModal = (product: any) => {
    setSelectedProduct(product);
    
    // Calculate default expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    const expiryTimestamp = Math.floor(expiryDate.getTime() / 1000);
    
    setReceiveData({
      productId: Number(product.id),
      retailPrice: '',
      expiryDate: expiryTimestamp.toString(),
      notes: '',
    });
    setIsReceiveModalOpen(true);
  };

  const handleReceiveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    if (!receiveData.retailPrice.trim()) {
      alert('Please enter retail price');
      return;
    }

    setUpdatingProduct(receiveData.productId);
    try {
      const retailPrice = Math.floor(parseFloat(receiveData.retailPrice) * 100); // Convert to cents
      const receivedDate = Math.floor(Date.now() / 1000);
      const expiryDate = parseInt(receiveData.expiryDate);

      if (isNaN(expiryDate) || expiryDate < receivedDate) {
        alert('Please enter a valid future expiry date');
        setUpdatingProduct(null);
        return;
      }

      await receiveProduct(
        receiveData.productId,
        receivedDate,
        expiryDate,
        retailPrice,
        receiveData.notes.trim() || 'Received and verified'
      );

      alert('✅ Product received and marked as Delivered!');
      setIsReceiveModalOpen(false);
      if (account) {
        await loadProducts(account);
      }
    } catch (error: any) {
      console.error('Error receiving product:', error);
      let errorMessage = 'Failed to receive product. ';

      if (error.code === 4001) {
        errorMessage += 'You rejected the transaction.';
      } else if (error.message?.includes('AccessControl')) {
        errorMessage += 'Your account does not have RETAILER_ROLE.';
      } else if (error.message?.includes('InvalidTransfer')) {
        errorMessage += 'This product is not awaiting acceptance by you.';
      } else if (error.message) {
        errorMessage += error.message;
      }

      alert(errorMessage);
    } finally {
      setUpdatingProduct(null);
    }
  };

  const formatDate = (timestamp: number): string => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const isExpiringSoon = (expiryTimestamp: number): boolean => {
    const now = Math.floor(Date.now() / 1000);
    const daysUntilExpiry = (expiryTimestamp - now) / (24 * 60 * 60);
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryTimestamp: number): boolean => {
    const now = Math.floor(Date.now() / 1000);
    return expiryTimestamp < now;
  };

  const getProductCropType = (cropType: number): string => {
    const types: { [key: number]: string } = {
      0: 'Vegetables',
      1: 'Fruits',
      2: 'Grains',
      3: 'Herbs',
      4: 'Other',
    };
    return types[cropType] || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Wallet Connection Warning */}
      {!account && (
        <div className="glass-card border border-orange-500/30 bg-amber-950/20">
          <div className="flex items-start gap-4">
            <div className="text-orange-400 text-2xl mt-1">⚠️</div>
            <div>
              <h3 className="text-orange-300 font-bold text-lg mb-2">Wallet Not Connected</h3>
              <p className="text-gray-300 text-sm">
                Please connect your MetaMask wallet to use the Retailer Dashboard.
                You need an account with <span className="font-mono text-orange-300">RETAILER_ROLE</span>.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold gradient-text mb-2">🛒 Retailer Dashboard</h1>
          <p className="text-gray-400 text-lg">Receive and manage organic products</p>
          {account && (
            <p className="text-sm text-gray-500 mt-2">
              Connected: <span className="text-emerald-400 font-mono">{account.slice(0, 6)}...{account.slice(-4)}</span>
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="text-4xl text-cyan-400">
              <FaClock />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Incoming Transfers</p>
              <p className="text-3xl font-bold">{incomingProducts.length}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="text-4xl text-emerald-400">
              <FaStore />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">In Stock</p>
              <p className="text-3xl font-bold">
                {inStockProducts.length}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="text-4xl text-orange-400">
              <FaCheckCircle />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Expiring Soon</p>
              <p className="text-3xl font-bold">
                {inStockProducts.filter((p: any) => isExpiringSoon(p.expiryDate)).length}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Products to Receive */}
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-6 gradient-text">📦 Incoming Transfers - Action Required</h2>
          {loadingProducts ? (
            <GlassCard>
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading products...</p>
              </div>
            </GlassCard>
          ) : incomingProducts.length === 0 ? (
            <GlassCard>
              <div className="text-center py-12">
                <FaTruck className="text-6xl text-gray-600 mx-auto mb-4" />
                <p className="text-gray-300 font-medium">No incoming transfers at this time</p>
              </div>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {incomingProducts.map((product: any) => (
                <motion.div
                  key={`incoming-${product.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard className="border-blue-500/50 bg-blue-500/5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold">{product.name}</h3>
                      <span className="status-badge status-transit text-xs">In Transit</span>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <p>
                        <span className="text-gray-400">Product ID:</span>{' '}
                        <span className="font-mono">#{product.id}</span>
                      </p>
                      <p>
                        <span className="text-gray-400">Type:</span>{' '}
                        <span>{getProductCropType(Number(product.cropType))}</span>
                      </p>
                      <p>
                        <span className="text-gray-400">From Processor:</span>{' '}
                        <span className="font-mono text-xs">{product.currentCustodian?.slice(0, 6)}...{product.currentCustodian?.slice(-4)}</span>
                      </p>
                      <p>
                        <span className="text-gray-400">Harvest Date:</span>{' '}
                        <span>{formatDate(product.harvestDate)}</span>
                      </p>
                      <p>
                        <span className="text-gray-400">Score:</span>{' '}
                        <span className="text-yellow-400">{Number(product.authenticityScore)}/100</span>
                      </p>
                    </div>

                    <Button
                      onClick={() => openReceiveModal(product)}
                      disabled={!account}
                      variant="primary"
                      className="w-full"
                    >
                      <FaCheckCircle className="inline mr-2" />
                      Accept Delivery
                    </Button>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Products In Stock */}
        <div>
          <h2 className="text-3xl font-bold mb-6 gradient-text">📦 Products In Stock</h2>
          {loadingProducts ? (
            <GlassCard>
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading products...</p>
              </div>
            </GlassCard>
          ) : inStockProducts.length === 0 ? (
            <GlassCard>
              <div className="text-center py-12">
                <FaBoxOpen className="text-6xl text-gray-600 mx-auto mb-4" />
                <p className="text-gray-300 font-medium">No products in stock yet</p>
                <p className="text-gray-500 text-sm mt-2">Accept incoming transfers to add products</p>
              </div>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inStockProducts.map((product: any) => {
                const expiringSoon = isExpiringSoon(product.expiryDate);
                const expired = isExpired(product.expiryDate);
                
                return (
                  <motion.div
                    key={`instock-${product.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <GlassCard
                      className={`${
                        expired
                          ? 'border-red-500/50 bg-red-500/5'
                          : expiringSoon
                          ? 'border-yellow-500/50 bg-yellow-500/5'
                          : 'border-green-500/50 bg-green-500/5'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold">{product.name}</h3>
                        <div className="flex gap-2">
                          <span className="status-badge status-delivered text-xs">In Stock</span>
                          {expired && <span className="status-badge bg-red-600 text-xs">Expired</span>}
                          {expiringSoon && !expired && (
                            <span className="status-badge bg-yellow-600 text-xs">Expiring Soon</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-gray-400">Product ID:</span>{' '}
                          <span className="font-mono">#{product.id}</span>
                        </p>
                        <p>
                          <span className="text-gray-400">Type:</span>{' '}
                          <span>{getProductCropType(Number(product.cropType))}</span>
                        </p>
                        <p>
                          <span className="text-gray-400">Harvest Date:</span>{' '}
                          <span>{formatDate(product.harvestDate)}</span>
                        </p>
                        <p>
                          <span className="text-gray-400">Expiry Date:</span>{' '}
                          <span className={expired ? 'text-red-400' : expiringSoon ? 'text-yellow-400' : 'text-green-400'}>
                            {formatDate(product.expiryDate)}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-400">Retail Price:</span>{' '}
                          <span className="text-primary-400 font-bold">
                            ${(Number(product.retailPrice) / 100).toFixed(2)}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-400">Score:</span>{' '}
                          <span className="text-yellow-400">{Number(product.authenticityScore)}/100</span>
                        </p>
                      </div>

                      <Button
                        onClick={() => downloadProductQRCode(Number(product.id), product.name)}
                        disabled={updatingProduct === product.id}
                        variant="secondary"
                        className="w-full mt-3"
                      >
                        <FaCheckCircle className="inline mr-2" />
                        Download QR Code
                      </Button>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Receive Product Modal */}
      <Modal isOpen={isReceiveModalOpen} onClose={() => setIsReceiveModalOpen(false)} title="Accept Delivery">
        <form onSubmit={handleReceiveProduct} className="space-y-4 max-h-[70vh] overflow-y-auto pr-3">
          <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-gray-400 text-sm mb-1">Product Name</p>
              <p className="text-primary-400 font-bold text-lg">{selectedProduct?.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Product ID</p>
                <p className="text-white font-mono">#{selectedProduct?.id}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Crop Type</p>
                <p className="text-white">
                  {getProductCropType(Number(selectedProduct?.cropType))}
                </p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Authenticity Score</p>
                <p className="text-yellow-400 font-bold">{Number(selectedProduct?.authenticityScore)}/100</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Status</p>
                <span className="inline-block status-badge status-transit text-xs">In Transit</span>
              </div>
            </div>

            {selectedProduct?.harvestDate && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Harvest Date</p>
                <p className="text-white">{formatDate(selectedProduct.harvestDate)}</p>
              </div>
            )}
          </div>

          <Input
            label="Retail Price ($)"
            name="retailPrice"
            type="number"
            step="0.01"
            min="0"
            value={receiveData.retailPrice}
            onChange={(e) => setReceiveData({ ...receiveData, retailPrice: e.target.value })}
            required
            placeholder="e.g., 9.99"
          />

          <div>
            <label className="block text-sm font-medium mb-2">
              Expiry Date (Unix Timestamp)
            </label>
            <p className="text-gray-400 text-xs mb-2">
              Default: 30 days from now ({new Date(parseInt(receiveData.expiryDate) * 1000).toLocaleDateString()})
            </p>
            <Input
              name="expiryDate"
              type="number"
              value={receiveData.expiryDate}
              onChange={(e) => setReceiveData({ ...receiveData, expiryDate: e.target.value })}
              placeholder="Unix timestamp (seconds)"
            />
            <p className="text-gray-400 text-xs mt-1">
              Current: {Math.floor(Date.now() / 1000)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Receiving Notes (optional)</label>
            <textarea
              name="notes"
              value={receiveData.notes}
              onChange={(e) => setReceiveData({ ...receiveData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-black/30 border border-primary-500/30 rounded-lg focus:outline-none focus:border-primary-500"
              rows={3}
              placeholder="Condition notes, quantity verified, etc."
            />
          </div>

          <Button
            type="submit"
            disabled={updatingProduct === receiveData.productId}
            className="w-full"
          >
            {updatingProduct === receiveData.productId ? 'Processing...' : 'Accept Delivery'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default RetailerDashboard;
