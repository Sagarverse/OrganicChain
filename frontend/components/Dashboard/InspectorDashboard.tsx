import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCertificate, FaCheckCircle, FaTimesCircle, FaClipboardList, FaExternalLinkAlt } from 'react-icons/fa';
import GlassCard from '../Layout/GlassCard';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import { getCurrentAccount, getAllProducts, approveCertificate, rejectCertificate } from '../../utils/blockchain';
import { PRODUCT_STATUS } from '../../utils/constants';

const InspectorDashboard: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

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

  const openApproveModal = (product: any) => {
    setSelectedProduct(product);
    setShowApproveModal(true);
  };

  const openRejectModal = (product: any) => {
    setSelectedProduct(product);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleApproveCertificate = async () => {
    if (!selectedProduct) return;

    setProcessing(true);
    try {
      await approveCertificate(selectedProduct.id);
      alert('Certificate approved successfully!');
      setShowApproveModal(false);
      setSelectedProduct(null);
      await loadProducts();
    } catch (error: any) {
      console.error('Error approving certificate:', error);
      let errorMessage = 'Failed to approve certificate. ';
      
      if (error.code === 4001) {
        errorMessage += 'You rejected the transaction.';
      } else if (error.message?.includes('AccessControl')) {
        errorMessage += 'Your account does not have INSPECTOR_ROLE.';
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectCertificate = async () => {
    if (!selectedProduct || !rejectReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    setProcessing(true);
    try {
      await rejectCertificate(selectedProduct.id, rejectReason);
      alert('Certificate rejected successfully!');
      setShowRejectModal(false);
      setSelectedProduct(null);
      setRejectReason('');
      await loadProducts();
    } catch (error: any) {
      console.error('Error rejecting certificate:', error);
      let errorMessage = 'Failed to reject certificate. ';
      
      if (error.code === 4001) {
        errorMessage += 'You rejected the transaction.';
      } else if (error.message?.includes('AccessControl')) {
        errorMessage += 'Your account does not have INSPECTOR_ROLE.';
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const getCertificateStatus = (product: any) => {
    const hasCertificate = product.certificates && product.certificates.length > 0;
    if (!hasCertificate) return 'No Certificate';
    
    const latestCert = product.certificates[product.certificates.length - 1];
    return latestCert.isValid ? 'Approved' : 'Pending';
  };

  const getCertificateActions = (product: any) => {
    const hasCertificate = product.certificates && product.certificates.length > 0;
    if (!hasCertificate) {
      return (
        <p className="text-gray-500 text-sm italic">No certificate submitted yet</p>
      );
    }

    const latestCert = product.certificates[product.certificates.length - 1];
    if (latestCert.isValid) {
      return (
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <FaCheckCircle />
          <span>Certificate Approved</span>
        </div>
      );
    }

    // Pending - show approve/reject buttons
    return (
      <div className="flex gap-2">
        <Button
          onClick={() => openApproveModal(product)}
          disabled={!account || processing}
          variant="primary"
          className="flex-1"
        >
          <FaCheckCircle className="inline mr-1" />
          Approve
        </Button>
        <Button
          onClick={() => openRejectModal(product)}
          disabled={!account || processing}
          variant="danger"
          className="flex-1"
        >
          <FaTimesCircle className="inline mr-1" />
          Reject
        </Button>
      </div>
    );
  };

  const pendingCount = products.filter((p: any) => {
    const hasCert = p.certificates && p.certificates.length > 0;
    if (!hasCert) return false;
    const latestCert = p.certificates[p.certificates.length - 1];
    return !latestCert.isValid;
  }).length;

  const approvedCount = products.filter((p: any) => {
    const hasCert = p.certificates && p.certificates.length > 0;
    if (!hasCert) return false;
    const latestCert = p.certificates[p.certificates.length - 1];
    return latestCert.isValid;
  }).length;

  const noCertCount = products.filter((p: any) => {
    return !p.certificates || p.certificates.length === 0;
  }).length;

  return (
    <div className="space-y-6">
      {/* Wallet Connection Warning */}
      {!account && (
        <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 flex items-start gap-3">
          <div className="text-yellow-500 text-xl">⚠️</div>
          <div>
            <h3 className="text-yellow-400 font-semibold mb-1">Wallet Not Connected</h3>
            <p className="text-yellow-200/80 text-sm">
              Please connect your MetaMask wallet to use the Inspector Dashboard.
              You need an account with INSPECTOR_ROLE.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Inspector Dashboard</h1>
          <p className="text-gray-400">Review and approve product certificates</p>
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
              <FaClipboardList />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Products</p>
              <p className="text-3xl font-bold">{products.length}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="text-4xl text-orange-400">
              <FaCertificate />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending Review</p>
              <p className="text-3xl font-bold">{pendingCount}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="text-4xl text-green-400">
              <FaCheckCircle />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Approved</p>
              <p className="text-3xl font-bold">{approvedCount}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="text-4xl text-gray-500">
              <FaTimesCircle />
            </div>
            <div>
              <p className="text-gray-400 text-sm">No Certificate</p>
              <p className="text-3xl font-bold">{noCertCount}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Products List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Certificate Review</h2>
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
              <FaClipboardList className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No products found</p>
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
                    <span className="text-gray-400">Certificate:</span>{' '}
                    <span className={
                      getCertificateStatus(product) === 'Approved' ? 'text-green-400' :
                      getCertificateStatus(product) === 'Pending' ? 'text-orange-400' :
                      'text-gray-500'
                    }>
                      {getCertificateStatus(product)}
                    </span>
                  </p>
                  {product.certificates && product.certificates.length > 0 && (
                    <div>
                      <span className="text-gray-400">Documents:</span>{' '}
                      <a
                        href={product.certificates[product.certificates.length - 1].ipfsHash}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-400 hover:text-primary-300 text-xs flex items-center gap-1 mt-1"
                      >
                        View on IPFS <FaExternalLinkAlt className="text-xs" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  {getCertificateActions(product)}
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

      {/* Approve Certificate Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedProduct(null);
        }}
        title="Approve Certificate"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to approve the certificate for{' '}
            <span className="font-bold text-white">{selectedProduct?.name}</span>?
          </p>
          <p className="text-sm text-gray-400">
            This will mark the certificate as valid and may increase the product's authenticity score.
          </p>
          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleApproveCertificate}
              disabled={processing}
              variant="primary"
              className="flex-1"
            >
              {processing ? 'Processing...' : 'Confirm Approval'}
            </Button>
            <Button
              onClick={() => {
                setShowApproveModal(false);
                setSelectedProduct(null);
              }}
              disabled={processing}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Certificate Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedProduct(null);
          setRejectReason('');
        }}
        title="Reject Certificate"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Rejecting certificate for{' '}
            <span className="font-bold text-white">{selectedProduct?.name}</span>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rejection Reason *
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={4}
              className="w-full px-4 py-2 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-400"
              disabled={processing}
            />
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleRejectCertificate}
              disabled={processing || !rejectReason.trim()}
              variant="danger"
              className="flex-1"
            >
              {processing ? 'Processing...' : 'Confirm Rejection'}
            </Button>
            <Button
              onClick={() => {
                setShowRejectModal(false);
                setSelectedProduct(null);
                setRejectReason('');
              }}
              disabled={processing}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InspectorDashboard;
