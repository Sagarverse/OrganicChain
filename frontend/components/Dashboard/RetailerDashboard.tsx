import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStore, FaTruck, FaBoxes, FaCheckCircle, FaHandHolding } from 'react-icons/fa';
import GlassCard from '../Layout/GlassCard';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import { getCurrentAccount, getAllProducts, receiveProduct } from '../../utils/blockchain';
import { downloadProductQRCode } from '../../utils/qrcode';
import { PRODUCT_STATUS } from '../../utils/constants';

const RetailerDashboard: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [updatingProduct, setUpdatingProduct] = useState<number | null>(null);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [receiveData, setReceiveData] = useState({
    productId: 0,
    receivedDate: '',
    expiryDate: '',
    retailPrice: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const acc = await getCurrentAccount();
    setAccount(acc);
    await loadProducts();
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const allProducts = await getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const openReceiveModal = (product: any) => {
    setReceiveData({
      productId: Number(product.id),
      receivedDate: new Date().toISOString().slice(0, 10),
      expiryDate: '',
      retailPrice: '',
      notes: ''
    });
    setIsReceiveModalOpen(true);
  };

  const handleReceiveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    setUpdatingProduct(receiveData.productId);
    try {
      const receivedDate = Math.floor(new Date(receiveData.receivedDate).getTime() / 1000);
      const expiryDate = receiveData.expiryDate
        ? Math.floor(new Date(receiveData.expiryDate).getTime() / 1000)
        : 0;
      const retailPrice = parseInt(receiveData.retailPrice || '0');

      await receiveProduct(
        receiveData.productId,
        receivedDate,
        expiryDate,
        retailPrice,
        receiveData.notes.trim() || 'Received at retailer'
      );

      alert('✅ Product received and marked as Delivered!');
      setIsReceiveModalOpen(false);
      await loadProducts();
    } catch (error: any) {
      console.error('Error receiving product:', error);
      alert(`Failed to receive product: ${error.message || 'Unknown error'}`);
    } finally {
      setUpdatingProduct(null);
    }
  };

  const getStatusActions = (product: any) => {
    const status = Number(product.status);
    
    // Status: 0=Planted, 1=Harvested, 2=Processing, 3=Processed, 4=Packaged, 5=InTransit, 6=Delivered
    if (status === 5 && product.currentCustodian?.toLowerCase() === account?.toLowerCase()) {
      return (
        <Button
          onClick={() => openReceiveModal(product)}
          disabled={!account || updatingProduct === product.id}
          variant="primary"
          className="w-full bg-blue-600 hover:bg-blue-700 border-blue-500"
        >
          <FaHandHolding className="inline mr-2" />
          {updatingProduct === product.id ? 'Receiving...' : '📦 Receive Product'}
        </Button>
      );
    }

    if (status === 6 && product.currentCustodian?.toLowerCase() === account?.toLowerCase()) {
      return (
        <Button
          onClick={() => downloadProductQRCode(Number(product.id), product.name)}
          disabled={updatingProduct === product.id}
          variant="secondary"
          className="w-full"
        >
          <FaCheckCircle className="inline mr-2" />
          Download QR Code
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Wallet Connection Warning */}
      {!account && (
        <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 flex items-start gap-3">
          <div className="text-yellow-500 text-xl">⚠️</div>
          <div>
            <h3 className="text-yellow-400 font-semibold mb-1">Wallet Not Connected</h3>
            <p className="text-yellow-200/80 text-sm">
              Please connect your MetaMask wallet to use the Retailer Dashboard.
              You need an account with RETAILER_ROLE.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Retailer Dashboard</h1>
          <p className="text-gray-400">Manage inventory and deliveries</p>
          {account && (
            <p className="text-sm text-gray-500 mt-1">
              Connected: <span className="text-primary-400 font-mono">{account.slice(0, 6)}...{account.slice(-4)}</span>
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="text-4xl text-primary-400">
              <FaBoxes />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Products</p>
              <p className="text-3xl font-bold">{products.length}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="text-4xl text-blue-400">
              <FaStore />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Ready to Ship</p>
              <p className="text-3xl font-bold">
                {products.filter((p: any) => Number(p.status) === 3).length}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="text-4xl text-orange-400">
              <FaTruck />
            </div>
            <div>
              <p className="text-gray-400 text-sm">In Transit</p>
              <p className="text-3xl font-bold">
                {products.filter((p: any) => Number(p.status) === 5).length}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="text-4xl text-green-400">
              <FaCheckCircle />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Delivered</p>
              <p className="text-3xl font-bold">
                {products.filter((p: any) => Number(p.status) === 6).length}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Products List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Inventory & Shipping</h2>
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
              <FaStore className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No products in inventory</p>
            </div>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: any) => (
              <GlassCard key={product.id}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold">{product.name}</h3>
                  <span className={`status-badge status-${(PRODUCT_STATUS[Number(product.status)] || 'Unknown').toLowerCase().replace(' ', '-')}`}>
                    {PRODUCT_STATUS[Number(product.status)] || 'Unknown'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm mb-4">
                  <p>
                    <span className="text-gray-400">Product ID:</span>{' '}
                    <span className="font-mono">#{product.id}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Farmer:</span>{' '}
                    <span className="font-mono text-xs">{product.farmer?.slice(0, 6)}...{product.farmer?.slice(-4)}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Score:</span>{' '}
                    <span className="text-yellow-400">{Number(product.authenticityScore)}/100</span>
                  </p>
                </div>

                <div className="mt-4">
                  {getStatusActions(product)}
                </div>

                <div className="mt-3">
                  <a
                    href={`/consumer/${product.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-2"
                  >
                    <span>View Full History →</span>
                  </a>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Receive Product Modal */}
      <Modal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        title="Receive Product"
      >
        <form onSubmit={handleReceiveProduct} className="space-y-4">
          <Input
            label="Received Date"
            type="date"
            value={receiveData.receivedDate}
            onChange={(e) => setReceiveData({ ...receiveData, receivedDate: e.target.value })}
            required
          />
          <Input
            label="Expiry Date"
            type="date"
            value={receiveData.expiryDate}
            onChange={(e) => setReceiveData({ ...receiveData, expiryDate: e.target.value })}
          />
          <Input
            label="Retail Price (smallest units)"
            type="number"
            value={receiveData.retailPrice}
            onChange={(e) => setReceiveData({ ...receiveData, retailPrice: e.target.value })}
            placeholder="e.g., 4999"
          />
          <div>
            <label className="block text-sm font-medium mb-2">Retail Notes</label>
            <textarea
              value={receiveData.notes}
              onChange={(e) => setReceiveData({ ...receiveData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-black/30 border border-primary-500/30 rounded-lg focus:outline-none focus:border-primary-500"
              rows={3}
              placeholder="Condition, shelf life, pricing notes"
            />
          </div>

          <Button type="submit" disabled={updatingProduct === receiveData.productId} className="w-full">
            {updatingProduct === receiveData.productId ? 'Receiving...' : 'Confirm Receipt'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default RetailerDashboard;
