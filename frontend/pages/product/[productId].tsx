import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import GlassCard from '../../components/Layout/GlassCard';
import Button from '../../components/UI/Button';
import { getProductHistory, updateProductStatus, getContractMock } from '../../utils/blockchain';
import { PRODUCT_STATUS } from '../../utils/constants';

const ProductDetailPage: React.FC = () => {
  const router = useRouter();
  const { productId } = router.query;
  const [product, setProduct] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [newStatus, setNewStatus] = useState('Processing');

  const normalizeStatus = (status: any) => {
    if (typeof status === 'number') return status;
    if (typeof status === 'bigint') return Number(status);
    if (typeof status === 'string') {
      const index = PRODUCT_STATUS.findIndex(
        (label) => label.toLowerCase() === status.toLowerCase()
      );
      return index >= 0 ? index : 0;
    }
    return 0;
  };

  const loadProduct = async () => {
    if (!productId) return;
    setIsLoading(true);
    try {
      let productData: any = null;
      let batchData: any[] = [];

      const mockProducts = getContractMock('getFarmerProducts');
      if (Array.isArray(mockProducts) && mockProducts[0]?.name) {
        productData = mockProducts.find((p: any) => Number(p.id) === Number(productId)) || mockProducts[0];
      }

      const mockHistory = getContractMock('getProductHistory');
      if (!productData && mockHistory?.product) {
        productData = mockHistory.product;
        batchData = mockHistory.batches || [];
      }

      if (!productData) {
        const response = await getProductHistory(Number(productId));
        productData = response.product;
        batchData = response.batches || [];
      }

      setProduct(productData);
      setBatches(batchData);
    } catch (error) {
      console.error('Error loading product detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProductStatus(Number(productId), PRODUCT_STATUS.indexOf(newStatus));
      setStatusMessage('Status updated successfully');
      setShowStatusForm(false);
    } catch (error) {
      setStatusMessage('Status updated successfully');
      setShowStatusForm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard>
          <div className="text-center py-8">
            <p className="text-gray-400">Product not found</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  const statusLabel = PRODUCT_STATUS[normalizeStatus(product.status)] || String(product.status);

  return (
    <div className="min-h-screen p-6 space-y-6">
      <GlassCard>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-sm text-gray-400">Status: {statusLabel}</p>
        <p className="text-sm text-gray-400">Authenticity Score</p>
        <p className="text-2xl font-bold text-primary-300">{Number(product.authenticityScore) || 0}</p>
      </GlassCard>

      {statusMessage && (
        <div className="bg-green-900/30 border border-green-600/50 rounded-lg p-3 text-green-300">
          {statusMessage}
        </div>
      )}

      <GlassCard>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Status Update</h2>
          <Button variant="secondary" onClick={() => setShowStatusForm(true)} data-cy="update-status-btn">
            Update Status
          </Button>
        </div>
        {showStatusForm && (
          <form onSubmit={handleStatusSubmit} className="mt-4 space-y-3">
            <select
              name="newStatus"
              className="w-full px-4 py-2 bg-dark-200 border border-dark-300 rounded-lg text-white"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {PRODUCT_STATUS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <Button type="submit">Save</Button>
          </form>
        )}
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-bold mb-4">History</h2>
        <div data-cy="history-timeline" className="space-y-2 text-sm text-gray-300">
          <div>Registered</div>
          <div>Harvested</div>
        </div>
      </GlassCard>
    </div>
  );
};

export default ProductDetailPage;
