import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaIndustry, FaPlus, FaThermometerHalf, FaBoxOpen, FaCheckCircle, FaTruck } from 'react-icons/fa';
import GlassCard from '../Layout/GlassCard';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import { getCurrentAccount, getAllProducts, createBatch, addSensorData, updateProductStatus, acceptDelivery, completeBatchProcessing } from '../../utils/blockchain';
import { PRODUCT_STATUS } from '../../utils/constants';

const ProcessorDashboard: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSensorModalOpen, setIsSensorModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [processingProductId, setProcessingProductId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    productId: 0,
    quantity: '',
    packagingDetails: '',
  });
  const [sensorData, setSensorData] = useState({
    batchId: 0,
    temperature: '',
    humidity: '',
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
      // Filter products that are harvested (ready for processing)
      const harvestedProducts = allProducts.filter((p: any) => Number(p.status) === 1); // Harvested status
      setProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSensorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSensorData({ ...sensorData, [e.target.name]: e.target.value });
  };

  const openBatchModal = (product: any) => {
    setSelectedProduct(product);
    setFormData({ ...formData, productId: product.id });
    setIsModalOpen(true);
  };

  const openSensorModal = (batchId: number) => {
    setSensorData({ ...sensorData, batchId });
    setIsSensorModalOpen(true);
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createBatch(
        formData.productId,
        parseInt(formData.quantity),
        formData.packagingDetails
      );

      alert('Batch created successfully!');
      setIsModalOpen(false);
      setFormData({ productId: 0, quantity: '', packagingDetails: '' });
      await loadProducts();
    } catch (error: any) {
      console.error('Error creating batch:', error);
      let errorMessage = 'Failed to create batch. ';
      
      if (error.code === 4001) {
        errorMessage += 'You rejected the transaction.';
      } else if (error.message?.includes('AccessControl')) {
        errorMessage += 'Your account does not have PROCESSOR_ROLE.';
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSensorData = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await addSensorData(
        sensorData.batchId,
        parseInt(sensorData.temperature),
        parseInt(sensorData.humidity)
      );

      alert('Sensor data recorded successfully!');
      setIsSensorModalOpen(false);
      setSensorData({ batchId: 0, temperature: '', humidity: '' });
      await loadProducts();
    } catch (error: any) {
      console.error('Error adding sensor data:', error);
      alert('Failed to add sensor data: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptDelivery = async (product: any) => {
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    if (!confirm(`Accept delivery of ${product.name}?\n\nThis will transfer custody to you as the processor.`)) {
      return;
    }

    try {
      setProcessingProductId(Number(product.id));
      await acceptDelivery(Number(product.id));
      alert(`✅ Delivery accepted!\n\nYou are now the custodian of ${product.name}.\nYou can now create a processing batch.`);
      await loadProducts();
    } catch (error: any) {
      console.error('Error accepting delivery:', error);
      alert(`Failed to accept delivery: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessingProductId(null);
    }
  };

  const handleCompleteBatch = async (product: any) => {
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    // Find the batch ID for this product
    const batchIds = product.batchIds || [];
    if (batchIds.length === 0) {
      alert('No batch found for this product');
      return;
    }

    const batchId = Number(batchIds[batchIds.length - 1]); // Get the most recent batch

    if (!confirm(`Mark processing complete for ${product.name}?\n\nBatch ID: ${batchId}\n\nThis will mark the product as Processed and ready for retailer.`)) {
      return;
    }

    try {
      setProcessingProductId(Number(product.id));
      await completeBatchProcessing(batchId);
      alert(`✅ Processing complete!\n\nProduct: ${product.name}\nBatch: ${batchId}\n\nThe product is now ready for retailer.`);
      await loadProducts();
    } catch (error: any) {
      console.error('Error completing batch:', error);
      alert(`Failed to complete processing: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessingProductId(null);
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
            <p className="text-yellow-200/80 text-sm">
              Please connect your MetaMask wallet to use the Processor Dashboard.
              You need an account with PROCESSOR_ROLE.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Processor Dashboard</h1>
          <p className="text-gray-400">Process and package organic products</p>
          {account && (
            <p className="text-sm text-gray-500 mt-1">
              Connected: <span className="text-primary-400 font-mono">{account.slice(0, 6)}...{account.slice(-4)}</span>
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="text-4xl text-primary-400">
              <FaBoxOpen />
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
              <FaIndustry />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Ready to Process</p>
              <p className="text-3xl font-bold">
                {products.filter((p: any) => Number(p.status) === 1).length}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="text-4xl text-green-400">
              <FaThermometerHalf />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Processing</p>
              <p className="text-3xl font-bold">
                {products.filter((p: any) => Number(p.status) === 2).length}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Products List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Products Available for Processing</h2>
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
              <FaIndustry className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No products available for processing</p>
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
                  <p>
                    <span className="text-gray-400">Custodian:</span>{' '}
                    <span className="font-mono text-xs">{product.currentCustodian?.slice(0, 6)}...{product.currentCustodian?.slice(-4)}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  {/* Accept Delivery - For Harvested products not yet in processor's custody */}
                  {Number(product.status) === 1 && product.currentCustodian?.toLowerCase() !== account?.toLowerCase() && (
                    <Button 
                      onClick={() => handleAcceptDelivery(product)}
                      disabled={!account || processingProductId === Number(product.id)}
                      variant="primary"
                      className="w-full bg-blue-600 hover:bg-blue-700 border-blue-500"
                    >
                      <FaTruck className="inline mr-2" />
                      {processingProductId === Number(product.id) ? 'Accepting...' : '📦 Accept Delivery'}
                    </Button>
                  )}

                  {/* Create Batch - For Harvested products in processor's custody */}
                  {Number(product.status) === 1 && product.currentCustodian?.toLowerCase() === account?.toLowerCase() && (
                    <Button 
                      onClick={() => openBatchModal(product)}
                      disabled={!account}
                      variant="primary"
                      className="w-full"
                    >
                      <FaPlus className="inline mr-2" />
                      Create Batch
                    </Button>
                  )}

                  {/* Complete Processing - For products currently being processed */}
                  {Number(product.status) === 2 && (
                    <Button 
                      onClick={() => handleCompleteBatch(product)}
                      disabled={!account || processingProductId === Number(product.id)}
                      variant="primary"
                      className="w-full bg-green-600 hover:bg-green-700 border-green-500"
                    >
                      <FaCheckCircle className="inline mr-2" />
                      {processingProductId === Number(product.id) ? 'Completing...' : '✅ Complete Processing'}
                    </Button>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Create Batch Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Processing Batch">
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Product</label>
            <p className="text-primary-400 font-bold text-lg">{selectedProduct?.name}</p>
            <p className="text-gray-400 text-sm">ID: #{selectedProduct?.id}</p>
          </div>

          <Input
            label="Quantity (kg)"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleInputChange}
            required
            min="1"
            placeholder="Enter quantity in kg"
          />

          <div>
            <label className="block text-sm font-medium mb-2">Packaging Details</label>
            <textarea
              name="packagingDetails"
              value={formData.packagingDetails}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-black/30 border border-primary-500/30 rounded-lg focus:outline-none focus:border-primary-500"
              rows={3}
              required
              placeholder="e.g., Vacuum sealed in 500g packs"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating...' : 'Create Batch'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default ProcessorDashboard;
