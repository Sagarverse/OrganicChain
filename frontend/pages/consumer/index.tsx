import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { QrReader } from 'react-qr-reader';
import jsQR from 'jsqr';
import GlassCard from '../../components/Layout/GlassCard';
import Button from '../../components/UI/Button';
import { FaQrcode, FaSearch, FaCamera, FaUpload } from 'react-icons/fa';

export default function ConsumerVerificationPage() {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scanError, setScanError] = useState('');
  const [searchError, setSearchError] = useState('');

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

      // Strip query parameters and hash fragments (e.g. "1?ref=test#top" -> "1")
      productId = productId.split('?')[0].split('#')[0];

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clean query
    const cleaned = searchQuery.trim();
    if (!cleaned) return;

    // For now we assume they are searching by product ID or we just send it to the [productId] page
    const productId = parseInt(cleaned.replace(/[^0-9]/g, ''));

    if (isNaN(productId) || productId <= 0) {
      setSearchError('Please enter a valid numeric product ID');
      return;
    }

    router.push(`/consumer/${productId}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError('');
    setShowScanner(false); // Close camera if open

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to read image data
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          setScanError('Failed to initialize canvas for image processing');
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Use jsQR to decode the QR code from the image data
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          // Process the found QR code data directly through our existing handler
          handleScan({ text: code.data }, null);
        } else {
          setScanError('No QR code found in the uploaded image. Please try another image.');
        }
      };
      img.onerror = () => {
        setScanError('Failed to load the uploaded image as a valid image file');
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);

    // Reset file input so same file can be selected again if needed
    e.target.value = '';
  };

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs text-gray-500 font-medium">ORGANIC SUPPLY CHAIN</span>
          </div>
          <div className="flex justify-center mb-6">
            <div className="text-6xl text-emerald-400">
              <FaQrcode />
            </div>
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-3">🔍 Verify Product</h1>
          <p className="text-gray-300 text-lg">Scan a QR code or enter a product ID to verify authenticity and supply chain</p>
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
                <FaCamera className="text-cyan-400" />
                Scan QR Code
              </h2>

              {!showScanner ? (
                <div className="space-y-6">
                  <div className="bg-dark-200 rounded-lg p-12 border-2 border-dashed border-gray-600">
                    <FaQrcode className="text-8xl text-gray-600 mx-auto mb-6" />
                    <p className="text-gray-400 mb-6">
                      Click the button below to activate your camera and scan a product QR code, or upload an image file.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Button
                        onClick={() => {
                          setShowScanner(true);
                          setScanError('');
                        }}
                        variant="primary"
                        data-cy="scan-qr-btn"
                        className="w-full sm:w-auto"
                      >
                        <FaCamera className="inline mr-2" />
                        Scan QR Code
                      </Button>
                      <div className="w-full sm:w-auto">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="qr-upload-input"
                        />
                        <label htmlFor="qr-upload-input" className="w-full">
                          <div
                            className="w-full sm:w-auto cursor-pointer bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center transition-all bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 border border-gray-600"
                          >
                            <FaUpload className="inline mr-2" />
                            Upload QR Image
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4" data-cy="qr-scanner-modal">
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
                <div className="mt-4 glass-card border border-red-500/30 bg-red-950/20 text-red-300">
                  {scanError}
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Search & Featured */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard>
            <div className="space-y-6">
              <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search products by ID"
                    className="flex-1 px-4 py-2 bg-dark-200 border border-dark-300 rounded-lg text-white focus:outline-none focus:border-primary-400"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchError('');
                    }}
                    data-cy="search-input"
                  />
                  <Button type="submit" variant="secondary" data-cy="search-btn">
                    Search
                  </Button>
                </div>
                {searchError && (
                  <div className="text-sm text-red-400 mt-1 pl-1">
                    {searchError}
                  </div>
                )}
              </form>

              <div data-cy="recent-verifications">
                <h3 className="text-lg font-semibold mb-2">Recent Verifications</h3>
                <div className="text-sm text-gray-400">No recent verifications yet.</div>
              </div>

              <div data-cy="featured-products">
                <h3 className="text-lg font-semibold mb-3">Featured Products</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[1, 2].map((id) => (
                    <div
                      key={id}
                      data-cy="product-card"
                      className="p-3 bg-dark-200 border border-dark-300 rounded-lg"
                    >
                      Featured Product #{id}
                    </div>
                  ))}
                </div>
              </div>
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
    </main>
  );
}
