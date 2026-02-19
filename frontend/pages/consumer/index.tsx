import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { QrReader } from 'react-qr-reader';
import GlassCard from '../../components/Layout/GlassCard';
import Button from '../../components/UI/Button';
import { FaQrcode, FaSearch, FaCamera } from 'react-icons/fa';

export default function ConsumerVerificationPage() {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(false);
  const [manualProductId, setManualProductId] = useState('');
  const [scanError, setScanError] = useState('');

  const handleScan = (result: any, error: any) => {
    if (result) {
      // Extract product ID from QR code data
      const data = result?.text || result;
      
      // QR code format: https://yourapp.com/consumer/1 or just "1"
      let productId = data;
      
      // If it's a URL, extract the product ID
      if (data.includes('/consumer/')) {
        const parts = data.split('/consumer/');
        productId = parts[1];
      }
      
      // Clean up product ID (remove any query params, slashes, etc.)
      productId = productId.replace(/[^0-9]/g, '');
      
      if (productId && !isNaN(parseInt(productId))) {
        router.push(`/consumer/${productId}`);
      } else {
        setScanError('Invalid QR code format');
      }
    }
    
    if (error) {
      // Only log errors that aren't the "NotFoundError" which happens when no QR code is detected
      if (error?.name !== 'NotFoundError') {
        console.error('QR Scanner Error:', error);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productId = parseInt(manualProductId);
    
    if (!manualProductId || isNaN(productId) || productId <= 0) {
      setScanError('Please enter a valid product ID');
      return;
    }
    
    router.push(`/consumer/${productId}`);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="text-6xl text-primary-400">
              <FaQrcode />
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Product Verification</h1>
          <p className="text-gray-400">Scan a QR code or enter a product ID to verify authenticity</p>
        </motion.div>

        {/* QR Scanner Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6 flex items-center justify-center gap-3">
                <FaCamera className="text-primary-400" />
                Scan QR Code
              </h2>

              {!showScanner ? (
                <div className="space-y-6">
                  <div className="bg-dark-200 rounded-lg p-12 border-2 border-dashed border-gray-600">
                    <FaQrcode className="text-8xl text-gray-600 mx-auto mb-6" />
                    <p className="text-gray-400 mb-6">
                      Click the button below to activate your camera and scan a product QR code
                    </p>
                    <Button
                      onClick={() => {
                        setShowScanner(true);
                        setScanError('');
                      }}
                      variant="primary"
                      className="mx-auto"
                    >
                      <FaCamera className="inline mr-2" />
                      Start Camera
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-lg border-2 border-primary-400">
                    <QrReader
                      constraints={{ facingMode: 'environment' }}
                      onResult={handleScan}
                      className="w-full"
                      videoStyle={{ width: '100%' }}
                    />
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button
                      onClick={() => setShowScanner(false)}
                      variant="secondary"
                    >
                      Stop Camera
                    </Button>
                  </div>
                  <p className="text-sm text-gray-400">
                    Position the QR code within the camera frame
                  </p>
                </div>
              )}

              {scanError && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-600/50 rounded-lg text-red-400">
                  {scanError}
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="text-gray-500 font-semibold">OR</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        {/* Manual Entry Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6 flex items-center justify-center gap-3">
                <FaSearch className="text-primary-400" />
                Enter Product ID
              </h2>
              
              <form onSubmit={handleManualSubmit} className="max-w-md mx-auto space-y-4">
                <div>
                  <input
                    type="text"
                    value={manualProductId}
                    onChange={(e) => {
                      setManualProductId(e.target.value);
                      setScanError('');
                    }}
                    placeholder="Enter Product ID (e.g., 1, 2, 3...)"
                    className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white text-center text-lg placeholder-gray-500 focus:outline-none focus:border-primary-400"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={!manualProductId}
                >
                  <FaSearch className="inline mr-2" />
                  Verify Product
                </Button>
              </form>
            </div>
          </GlassCard>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <GlassCard>
            <div className="space-y-3 text-sm text-gray-400">
              <p className="text-lg text-white font-semibold mb-3">How to Verify</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl mb-2">📱</div>
                  <p className="font-semibold text-white">1. Scan QR Code</p>
                  <p className="text-xs mt-1">Use your device camera to scan the product QR code</p>
                </div>
                <div>
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="font-semibold text-white">2. View Details</p>
                  <p className="text-xs mt-1">See complete supply chain history and certifications</p>
                </div>
                <div>
                  <div className="text-3xl mb-2">✅</div>
                  <p className="font-semibold text-white">3. Verify Authenticity</p>
                  <p className="text-xs mt-1">Check authenticity score and blockchain verification</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
