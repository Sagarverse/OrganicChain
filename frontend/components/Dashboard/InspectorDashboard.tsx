import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCertificate, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaFileAlt,
  FaClock,
  FaExclamationTriangle 
} from 'react-icons/fa';
import { 
  getPendingCertificates, 
  approveCertificate, 
  rejectCertificate,
  formatDate,
  getCurrentAccount
} from '../../utils/blockchain';

interface Certificate {
  certId: number;
  issuer: string;
  issueDate: number;
  validUntil: number;
  documentHash: string;
  approved: boolean;
  rejected: boolean;
  approvedBy: string;
  rejectionReason: string;
}

const InspectorDashboard: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [pendingCertificates, setPendingCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingCertId, setProcessingCertId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const acc = await getCurrentAccount();
      setAccount(acc);
      await loadPendingCertificates();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadPendingCertificates = async () => {
    try {
      setLoading(true);
      const certs = await getPendingCertificates();
      setPendingCertificates(certs);
    } catch (error) {
      console.error('Error loading pending certificates:', error);
      alert('Error loading pending certificates. Please check console.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (certId: number) => {
    if (!confirm(`Are you sure you want to APPROVE Certificate #${certId}?`)) {
      return;
    }

    try {
      setProcessingCertId(certId);
      await approveCertificate(certId);
      alert(`✅ Certificate #${certId} has been APPROVED!`);
      await loadPendingCertificates();
    } catch (error: any) {
      console.error('Error approving certificate:', error);
      alert(`Error: ${error.message || 'Failed to approve certificate'}`);
    } finally {
      setProcessingCertId(null);
    }
  };

  const handleReject = async (certId: number) => {
    const reason = prompt(`Provide a reason for REJECTING Certificate #${certId}:`);
    
    if (!reason || reason.trim() === '') {
      alert('Rejection reason is required.');
      return;
    }

    try {
      setProcessingCertId(certId);
      await rejectCertificate(certId, reason.trim());
      alert(`❌ Certificate #${certId} has been REJECTED.\nReason: ${reason}`);
      await loadPendingCertificates();
    } catch (error: any) {
      console.error('Error rejecting certificate:', error);
      alert(`Error: ${error.message || 'Failed to reject certificate'}`);
    } finally {
      setProcessingCertId(null);
    }
  };

  const isExpired = (validUntil: number) => {
    return Date.now() / 1000 > validUntil;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading pending certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Wallet Connection Warning */}
        {!account && (
          <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 flex items-start gap-3 mb-6">
            <div className="text-yellow-500 text-xl">⚠️</div>
            <div>
              <h3 className="text-yellow-400 font-semibold mb-1">Wallet Not Connected</h3>
              <p className="text-yellow-200/80 text-sm">
                Please connect your MetaMask wallet. You need an account with INSPECTOR_ROLE (0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65).
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center gap-3">
            <FaCertificate className="text-primary-400" />
            Inspector Dashboard
          </h1>
          <p className="text-gray-400">Review and approve/reject organic certifications</p>
          {account && (
            <p className="text-sm text-gray-500 mt-2">
              Connected: <span className="text-primary-400 font-mono">{account.slice(0, 10)}...{account.slice(-4)}</span>
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-400 mt-1">
                  {pendingCertificates.length}
                </p>
              </div>
              <FaClock className="text-5xl text-yellow-400 opacity-20" />
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Requires Attention</p>
                <p className="text-3xl font-bold text-red-400 mt-1">
                  {pendingCertificates.filter(c => isExpired(c.validUntil)).length}
                </p>
              </div>
              <FaExclamationTriangle className="text-5xl text-red-400 opacity-20" />
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Pending</p>
                <p className="text-3xl font-bold text-primary-400 mt-1">
                  {pendingCertificates.length}
                </p>
              </div>
              <FaFileAlt className="text-5xl text-primary-400 opacity-20" />
            </div>
          </div>
        </div>

        {/* Pending Certificates List */}
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FaClock className="text-yellow-400" />
            Pending Certificates
          </h2>

          {pendingCertificates.length === 0 ? (
            <div className="text-center py-12">
              <FaCheckCircle className="text-6xl text-green-400 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400 text-lg">No pending certificates to review</p>
              <p className="text-gray-500 text-sm mt-2">All certificates have been processed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingCertificates.map((cert, index) => (
                <motion.div
                  key={cert.certId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-lg border ${
                    isExpired(cert.validUntil)
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-gray-800/50 border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-primary-300">
                          Certificate #{cert.certId}
                        </h3>
                        {isExpired(cert.validUntil) && (
                          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold flex items-center gap-1">
                            <FaExclamationTriangle />
                            EXPIRED
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                        <div>
                          <p className="text-gray-400">Issuer:</p>
                          <p className="font-semibold text-white">{cert.issuer}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Issue Date:</p>
                          <p className="font-semibold text-white">{formatDate(cert.issueDate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Valid Until:</p>
                          <p className={`font-semibold ${isExpired(cert.validUntil) ? 'text-red-400' : 'text-green-400'}`}>
                            {formatDate(cert.validUntil)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Document Hash:</p>
                          <p className="font-mono text-xs text-primary-300 break-all">
                            {cert.documentHash.substring(0, 20)}...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => handleApprove(cert.certId)}
                      disabled={processingCertId === cert.certId}
                      className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingCertId === cert.certId ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <FaCheckCircle />
                          Approve Certificate
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleReject(cert.certId)}
                      disabled={processingCertId === cert.certId}
                      className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingCertId === cert.certId ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <FaTimesCircle />
                          Reject Certificate
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default InspectorDashboard;

