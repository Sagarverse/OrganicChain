import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaCheck, FaTimes, FaExternalLinkAlt, FaClock } from 'react-icons/fa';
import GlassCard from '../Layout/GlassCard';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import {
  getCurrentAccount,
  checkRole,
  getPendingCertificates,
  approveCertificate,
  rejectCertificate,
  getProductHistoryLocal
} from '../../utils/blockchain';
import { getIPFSUrl } from '../../utils/ipfs';

export default function InspectorDashboard() {
  const router = useRouter();
  const [account, setAccount] = useState<string | null>(null);
  const [hasInspectorRole, setHasInspectorRole] = useState(true);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Modal states
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedCertId, setSelectedCertId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const acc = await getCurrentAccount();
    setAccount(acc);

    if (acc) {
      const hasRole = await checkRole(acc, 'INSPECTOR_ROLE');
      setHasInspectorRole(hasRole);

      if (hasRole) {
        await loadCertificates();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const pendingCerts: any[] = await getPendingCertificates();

      // Fetch product names for context
      const certsWithProducts = await Promise.all(
        pendingCerts.map(async (cert) => {
          try {
            // Find which product has this certificate
            // This is a naive loop; in production an indexer is needed
            // For now, certs only contain ID, Issuer, etc.
            return {
              ...cert,
              productName: `Product ID #${cert.certId}`, // Placeholder unless we add a specific function to map certs to products
            };
          } catch (e) {
            return cert;
          }
        })
      );

      setCertificates(certsWithProducts);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (certId: number) => {
    if (!confirm('Are you certain you want to approve this organic certificate?')) return;

    setProcessingId(certId);
    try {
      await approveCertificate(certId);
      alert('Certificate approved successfully!');
      await loadCertificates();
    } catch (error: any) {
      console.error('Approval error:', error);
      alert(`Approval failed: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (certId: number) => {
    setSelectedCertId(certId);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCertId || !rejectReason.trim()) return;

    setProcessingId(selectedCertId);
    setRejectModalOpen(false);

    try {
      await rejectCertificate(selectedCertId, rejectReason);
      alert('Certificate rejected successfully!');
      await loadCertificates();
    } catch (error: any) {
      console.error('Rejection error:', error);
      alert(`Rejection failed: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessingId(null);
      setSelectedCertId(null);
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Inspector Dashboard</h2>
        <GlassCard className="text-center p-8">
          <FaShieldAlt className="text-5xl text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Wallet Login Required</h3>
          <p className="text-gray-400 mb-6">Connect your wallet to review pending organic certificates.</p>
          <Button variant="primary">Connect Wallet</Button>
        </GlassCard>
      </div>
    );
  }

  if (!hasInspectorRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <GlassCard className="max-w-md border-red-500/30">
          <div className="text-center">
            <FaTimes className="text-5xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-400 mb-6">Your account does not have the INSPECTOR_ROLE required to view this dashboard.</p>
            <Button onClick={() => router.push('/admin/roles')}>
              Manage Roles
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2 tracking-tight">🔎 Inspector Dashboard</h1>
          <p className="text-gray-400">Review and validate uploaded organic certificates.</p>
        </div>
        <Button onClick={loadCertificates} variant="secondary" disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh List'}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin text-4xl">🔄</div>
        </div>
      ) : certificates.length === 0 ? (
        <GlassCard className="text-center p-12">
          <FaClock className="text-5xl text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Pending Certificates</h3>
          <p className="text-gray-400">There are currently no certificates waiting for inspector review.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <GlassCard key={cert.certId} className="flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    Certificate #{cert.certId}
                  </h3>
                  <span className="inline-block px-2 py-1 bg-yellow-900/40 text-yellow-400 text-xs rounded border border-yellow-500/30">
                    Pending Review
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Submitted</p>
                  <p className="text-sm font-medium">{formatDate(cert.issueDate)}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1 bg-black/20 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">Issuer Name</span>
                    <span className="text-sm font-medium">{cert.issuer}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">Valid Until</span>
                    <span className="text-sm font-medium">{formatDate(cert.validUntil)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <span className="block text-xs text-gray-500 mb-1">Document Link</span>
                  {cert.documentHash ? (
                    <a
                      href={getIPFSUrl(cert.documentHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"
                    >
                      View Original Document <FaExternalLinkAlt className="text-xs" />
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400 italic">No document attached</span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleApprove(cert.certId)}
                  disabled={processingId === cert.certId}
                  className="flex-1 bg-green-600 hover:bg-green-700 border-green-500"
                >
                  <FaCheck className="inline mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => openRejectModal(cert.certId)}
                  disabled={processingId === cert.certId}
                  variant="secondary"
                  className="flex-1 hover:bg-red-900/40 hover:border-red-500/50 hover:text-red-400 transition-colors"
                >
                  <FaTimes className="inline mr-2" />
                  Reject
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Certificate"
      >
        <form onSubmit={handleReject} className="space-y-4">
          <p className="text-sm text-gray-300 mb-2">
            Please provide a reason for rejecting Certificate #{selectedCertId}.
            This will be recorded permanently on the blockchain.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rejection Reason *
            </label>
            <textarea
              className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white focus:outline-none focus:border-red-500/50"
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="E.g., Document illegible, Issuer not accredited..."
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 border-red-500"
            >
              Confirm Rejection
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setRejectModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
