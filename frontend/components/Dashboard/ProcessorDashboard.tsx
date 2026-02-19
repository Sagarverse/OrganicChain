import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaIndustry, FaPlus, FaThermometerHalf, FaBoxOpen, FaTruck } from 'react-icons/fa';
import GlassCard from '../Layout/GlassCard';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import { getCurrentAccount, getAllProducts, getAvailableBatches, processBatch, transferCustody } from '../../utils/blockchain';
import { uploadFileToIPFS, mockUploadToIPFS, isPinataConfigured } from '../../utils/ipfs';

const ProcessorDashboard: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [availableProductIds, setAvailableProductIds] = useState<number[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [processingProductId, setProcessingProductId] = useState<number | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: 0,
    quantity: '',
    processingLocation: '',
    processingNotes: '',
    temperature: '',
    humidity: '',
  });
  const [transferData, setTransferData] = useState({
    productId: 0,
    retailerAddress: '',
    notes: '',
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
      const [allProducts, availableIds] = await Promise.all([
        getAllProducts(),
        getAvailableBatches()
      ]);
      setProducts(allProducts);
      setAvailableProductIds(availableIds);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
      setAvailableProductIds([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openBatchModal = (product: any) => {
    setSelectedProduct(product);
    // Pre-fill with product harvest quantity as suggested amount
    const suggestedQuantity = product.harvestQuantity || product.quantity || '';
    setFormData({
      productId: product.id,
      quantity: suggestedQuantity.toString(),
      processingLocation: '',
      processingNotes: '',
      temperature: '',
      humidity: ''
    });
    setIsModalOpen(true);
  };
  const openTransferModal = (product: any) => {
    setTransferData({ productId: Number(product.id), retailerAddress: '', notes: '' });
    setIsTransferModalOpen(true);
  };

  const handleProcessBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let processingCertHash = '';
      if (certificateFile) {
        if (isPinataConfigured()) {
          processingCertHash = await uploadFileToIPFS(certificateFile);
        } else {
          processingCertHash = await mockUploadToIPFS(certificateFile.name);
        }
      }

      const temperature = parseInt(formData.temperature);
      const humidity = parseInt(formData.humidity);
      const temperatures = Number.isFinite(temperature) ? [temperature] : [];
      const humidities = Number.isFinite(humidity) ? [humidity] : [];

      await processBatch(
        formData.productId,
        parseInt(formData.quantity),
        formData.processingLocation,
        temperatures,
        humidities,
        formData.processingNotes,
        processingCertHash
      );

      alert('Batch processed successfully!');
      setIsModalOpen(false);
      setFormData({
        productId: 0,
        quantity: '',
        processingLocation: '',
        processingNotes: '',
        temperature: '',
        humidity: ''
      });
      setCertificateFile(null);
      await loadProducts();
    } catch (error: any) {
      console.error('Error processing batch:', error);
      let errorMessage = 'Failed to process batch. ';

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

  const handleTransferCustody = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    if (!transferData.retailerAddress.trim()) {
      alert('Please enter a retailer address');
      return;
    }

    try {
      setProcessingProductId(transferData.productId);
      await transferCustody(
        transferData.productId,
        transferData.retailerAddress.trim(),
        transferData.notes.trim() || 'Transferred to retailer'
      );
      alert('Custody transferred to retailer!');
      setIsTransferModalOpen(false);
      setTransferData({ productId: 0, retailerAddress: '', notes: '' });
      await loadProducts();
    } catch (error: any) {
      console.error('Error transferring custody:', error);
      alert(`Failed to transfer custody: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessingProductId(null);
    }
  };

  const availableProducts = products.filter((p: any) =>
    availableProductIds.includes(Number(p.id))
  );

  const processedProducts = products.filter(
    (p: any) => Number(p.status) === 3 && p.currentCustodian?.toLowerCase() === account?.toLowerCase()
  );

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
                Please connect your MetaMask wallet to use the Processor Dashboard.
                You need an account with <span className="font-mono text-orange-300">PROCESSOR_ROLE</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold gradient-text mb-2">🏭 Processor Dashboard</h1>
          <p className="text-gray-400 text-lg">Process and package organic products</p>
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
            <div className="text-4xl text-emerald-400">
              <FaBoxOpen />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Products</p>
              <p className="text-3xl font-bold">{products.length}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="text-4xl text-cyan-400">
              <FaIndustry />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Ready to Process</p>
              <p className="text-3xl font-bold">
                {availableProducts.length}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="text-4xl text-orange-400">
              <FaThermometerHalf />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Processing</p>
              <p className="text-3xl font-bold">
                {products.filter((p: any) => Number(p.status) === 2).length}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Products List */}
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-6 gradient-text">📦 Products Available for Processing</h2>
          {loadingProducts ? (
            <GlassCard>
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading products...</p>
              </div>
            </GlassCard>
          ) : availableProducts.length === 0 ? (
            <GlassCard>
              <div className="text-center py-12">
                <FaIndustry className="text-6xl text-gray-600 mx-auto mb-4" />
                <p className="text-gray-300 font-medium mb-2">No harvested products available</p>
                <p className="text-gray-500 text-sm">Check back once farmers have harvested their products</p>
              </div>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableProducts.map((product: any) => (
                <GlassCard key={product.id}>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold">{product.name}</h3>
                    <span className="status-badge status-harvested">Harvested</span>
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

                  <Button 
                    onClick={() => openBatchModal(product)}
                    disabled={!account}
                    variant="primary"
                    className="w-full"
                  >
                    <FaPlus className="inline mr-2" />
                    Process Batch
                  </Button>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-6 gradient-text">✨ Processed Batches Ready to Transfer</h2>
          {loadingProducts ? (
            <GlassCard>
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading products...</p>
              </div>
            </GlassCard>
          ) : processedProducts.length === 0 ? (
            <GlassCard>
              <div className="text-center py-12">
                <FaTruck className="text-6xl text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No processed products ready to ship</p>
              </div>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedProducts.map((product: any) => (
                <GlassCard key={`transfer-${product.id}`}>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold">{product.name}</h3>
                    <span className="status-badge status-processed">Processed</span>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <p>
                      <span className="text-gray-400">Product ID:</span>{' '}
                      <span className="font-mono">#{product.id}</span>
                    </p>
                    <p>
                      <span className="text-gray-400">Custodian:</span>{' '}
                      <span className="font-mono text-xs">{product.currentCustodian?.slice(0, 6)}...{product.currentCustodian?.slice(-4)}</span>
                    </p>
                  </div>

                  <Button
                    onClick={() => openTransferModal(product)}
                    disabled={!account || processingProductId === Number(product.id)}
                    variant="primary"
                    className="w-full bg-blue-600 hover:bg-blue-700 border-blue-500"
                  >
                    <FaTruck className="inline mr-2" />
                    Transfer to Retailer
                  </Button>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Process Batch Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Process Batch">
        <form onSubmit={handleProcessBatch} className="space-y-4">
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
                <p className="text-gray-400 mb-1">Authenticity Score</p>
                <p className="text-yellow-400 font-bold">{Number(selectedProduct?.authenticityScore)}/100</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Farmer</p>
                <p className="text-white font-mono text-xs">{selectedProduct?.farmer?.slice(0, 8)}...</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Status</p>
                <span className="inline-block status-badge status-harvested text-xs">Harvested</span>
              </div>
            </div>

            {selectedProduct?.harvestQuantity && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Harvest Quantity Available</p>
                <p className="text-white font-bold">{selectedProduct.harvestQuantity} kg</p>
              </div>
            )}
          </div>

          <Input
            label="Quantity to Process (kg)"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleInputChange}
            required
            min="1"
            max={selectedProduct?.harvestQuantity || undefined}
            placeholder="Enter quantity in kg"
          />

          <Input
            label="Processing Location"
            name="processingLocation"
            type="text"
            value={formData.processingLocation}
            onChange={handleInputChange}
            required
            placeholder="e.g., Central Processing Facility"
          />

          <div>
            <label className="block text-sm font-medium mb-2">Processing Notes</label>
            <textarea
              name="processingNotes"
              value={formData.processingNotes}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-black/30 border border-primary-500/30 rounded-lg focus:outline-none focus:border-primary-500"
              rows={3}
              placeholder="e.g., Washed, sorted, packed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Temperature (C x 100)"
              name="temperature"
              type="number"
              value={formData.temperature}
              onChange={handleInputChange}
              placeholder="e.g., 2500 for 25.00C"
            />
            <Input
              label="Humidity (% x 100)"
              name="humidity"
              type="number"
              value={formData.humidity}
              onChange={handleInputChange}
              placeholder="e.g., 6500 for 65.00%"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Processing Certificate (optional)</label>
            <input
              type="file"
              accept=".pdf,image/*"
              className="w-full px-4 py-2 bg-dark-200 border border-dark-300 rounded-lg text-white focus:outline-none focus:border-primary-400"
              onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Processing...' : 'Process Batch'}
          </Button>
        </form>
      </Modal>

      {/* Transfer Custody Modal */}
      <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title="Transfer to Retailer">
        <form onSubmit={handleTransferCustody} className="space-y-4">
          <Input
            label="Retailer Address"
            name="retailerAddress"
            type="text"
            value={transferData.retailerAddress}
            onChange={(e) => setTransferData({ ...transferData, retailerAddress: e.target.value })}
            required
            placeholder="0x..."
          />

          <div>
            <label className="block text-sm font-medium mb-2">Transfer Notes</label>
            <textarea
              name="notes"
              value={transferData.notes}
              onChange={(e) => setTransferData({ ...transferData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-black/30 border border-primary-500/30 rounded-lg focus:outline-none focus:border-primary-500"
              rows={3}
              placeholder="Shipment details, carrier, etc."
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Transferring...' : 'Transfer Custody'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default ProcessorDashboard;
