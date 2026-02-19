import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import GlassCard from '../../components/Layout/GlassCard';
import VerificationBadge from '../../components/Blockchain/VerificationBadge';
import ProductTrace from '../../components/Blockchain/ProductTrace';
import CarbonFootprint from '../../components/Advanced/CarbonFootprint';
import FreshnessScore from '../../components/Advanced/FreshnessScore';
import SustainabilityScore from '../../components/Advanced/SustainabilityScore';
import ComparisonAnalytics from '../../components/Advanced/ComparisonAnalytics';
import SensorSimulator from '../../components/Advanced/SensorSimulator';
import Modal from '../../components/UI/Modal';
import Button from '../../components/UI/Button';
import { getProductHistory, verifyProduct, calculateDistance, getCertificate } from '../../utils/blockchain';
import { getIPFSUrl } from '../../utils/ipfs';
import { FaQrcode, FaCertificate, FaMapMarkedAlt, FaIndustry, FaThermometerHalf, FaBox } from 'react-icons/fa';
import { PRODUCT_STATUS } from '../../utils/constants';

// Dynamically import ProductJourneyMap (requires leaflet, client-side only)
const ProductJourneyMap = dynamic(
  () => import('../../components/Maps/ProductJourneyMap'),
  { ssr: false, loading: () => <div className="h-96 bg-gray-700 rounded-lg animate-pulse" /> }
);

export default function ConsumerProductPage() {
  const router = useRouter();
  const { productId } = router.query;
  const [product, setProduct] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [verification, setVerification] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [certificateDetails, setCertificateDetails] = useState<Record<number, any>>({});
  const [isArOpen, setIsArOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [selectedBatchIndex, setSelectedBatchIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [reportGenerating, setReportGenerating] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProductData();
    }
  }, [productId]);

  const loadProductData = async () => {
    const loadingStart = Date.now();
    try {
      setIsLoading(true);
      const id = parseInt(productId as string);
      
      // Get product history
      const { product: productData, batches: batchData } = await getProductHistory(id);
      const normalizedProduct = {
        ...productData,
        farmLocation: productData?.farmLocation || { latitude: '0', longitude: '0' },
        farmer: productData?.farmer || 'Unknown',
        currentCustodian: productData?.currentCustodian || 'Unknown',
        organicCertification: productData?.organicCertification || '',
        status: productData?.status ?? 0,
      };
      setProduct(normalizedProduct);
      setBatches(batchData || []);

      const certIds = Array.from(
        new Set(
          batchData
            .flatMap((batch: any) => batch.certificateIds || [])
            .map((certId: any) => Number(certId))
        )
      ) as number[];
      const filteredCertIds = certIds.filter((certId) => certId > 0);

      if (filteredCertIds.length > 0) {
        const certEntries = await Promise.all(
          filteredCertIds.map(async (certId) => [certId, await getCertificate(certId)])
        );
        const certMap: Record<number, any> = {};
        certEntries.forEach(([certId, cert]) => {
          certMap[Number(certId)] = cert;
        });
        setCertificateDetails(certMap);
      } else {
        setCertificateDetails({});
      }

      // Get verification data
      const verificationData = await verifyProduct(id);
      if (normalizedProduct.recalled) {
        setVerification({ isAuthentic: false, score: 0, details: 'Recalled product' });
      } else {
        setVerification(verificationData);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      const elapsed = Date.now() - loadingStart;
      const delay = elapsed < 600 ? 600 - elapsed : 0;
      if (delay > 0) {
        setTimeout(() => setIsLoading(false), delay);
      } else {
        setIsLoading(false);
      }
    }
  };

  const normalizeTimestamp = (value: any) => {
    const numeric = Number(value || 0);
    if (!numeric) return 0;
    return numeric > 1000000000000 ? Math.floor(numeric / 1000) : numeric;
  };

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

  const calculateTravelDistance = () => {
    if (!product || !batches.length) return 0;
    
    const farmLat = parseFloat(product.farmLocation?.latitude || '0');
    const farmLng = parseFloat(product.farmLocation?.longitude || '0');
    
    let totalDistance = 0;
    batches.forEach((batch: any) => {
      if (batch.locationHistory && batch.locationHistory.length > 0) {
        const lastLocation = batch.locationHistory[batch.locationHistory.length - 1];
        const lat = parseFloat(lastLocation.latitude);
        const lng = parseFloat(lastLocation.longitude);
        totalDistance += calculateDistance(farmLat, farmLng, lat, lng);
      }
    });
    
    return totalDistance;
  };

  const calculateStorageDays = () => {
    if (!product) return 0;
    const plantedDate = normalizeTimestamp(product.plantedDate);
    const now = Math.floor(Date.now() / 1000);
    return Math.floor((now - plantedDate) / 86400);
  };

  // Helper function to generate PDF report
  const generateReport = async () => {
    setReportGenerating(true);
    try {
      // Create a simple verification report
      const reportContent = `
PRODUCT VERIFICATION REPORT
===========================
Generated: ${new Date().toLocaleString()}

PRODUCT INFORMATION:
Name: ${product.name}
ID: ${product.id}
Status: ${statusLabel}
Farmer: ${product.farmer}
Farm Location: ${product.farmLocation?.latitude}, ${product.farmLocation?.longitude}

VERIFICATION DETAILS:
Authenticity Score: ${verificationDisplay.score}/100
Authentic: ${verificationDisplay.isAuthentic ? 'YES' : 'NO'}
Details: ${verificationDisplay.details}

SUPPLY CHAIN METRICS:
Total Batches: ${batches.length}
Distance Traveled: ${calculateTravelDistance().toFixed(2)} km
Storage Days: ${calculateStorageDays()} days

This report certifies that the above product has been verified through
our blockchain-based supply chain system.
      `;

      // Create and download as text file
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(reportContent));
      element.setAttribute('download', `product-${product.id}-verification-report.txt`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setReportGenerating(false);
    }
  };

  // Copy product verification link to clipboard
  const copyProductLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/consumer/${product.id}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }).catch(() => {
        alert('Failed to copy link');
      });
    }
  };

  // Share to social media
  const shareToSocial = (platform: 'twitter' | 'facebook') => {
    if (typeof window === 'undefined') return;
    
    const url = `${window.location.origin}/consumer/${product.id}`;
    const text = `Check out this verified organic product: ${product.name}`;
    
    let shareUrl = '';
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const statusLabel = product ? PRODUCT_STATUS[normalizeStatus(product.status)] || String(product.status) : '';
  const productIdLabel = product ? `Product #${Number(product.id)}` : '';
  const hasAnomaly = batches.some((batch: any) =>
    (batch.sensorLogs || []).some((log: any) => log.anomalyDetected || log.anomaly)
  );
  const verificationDisplay = verification || {
    isAuthentic: false,
    score: 0,
    details: 'Verification unavailable'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" data-cy="loading-spinner"></div>
        <div className="ml-4 w-48 h-4 bg-gray-700/60 rounded animate-pulse" data-cy="loading-skeleton"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard>
          <div className="text-center py-12">
            <FaQrcode className="text-6xl text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
            <p className="text-gray-400">Please check the QR code and try again</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <FaQrcode className="text-4xl text-primary-400" />
          <div>
            <h1 className="text-4xl font-bold gradient-text">{product.name}</h1>
            <p className="text-gray-400">Product Verification & Traceability</p>
            <p className="text-sm text-gray-500" data-cy="product-id">{productIdLabel}</p>
          </div>
        </div>
      </motion.div>

      {product.recalled && (
        <div className="bg-red-100 border border-red-200 rounded-lg p-4 text-red-800" data-cy="recall-notice">
          <strong>PRODUCT RECALLED</strong>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Verification & Product Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Verification Badge */}
          <VerificationBadge
            score={verificationDisplay.score}
            isAuthentic={verificationDisplay.isAuthentic}
            details={verificationDisplay.details}
          />

          {/* Product Details */}
          <GlassCard>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaCertificate className="text-primary-400" />
              Product Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Product ID</span>
                <span className="font-mono font-bold">{Number(product.id)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Status</span>
                <span>{statusLabel}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Farmer</span>
                <span className="font-mono text-xs">{product.farmer.substring(0, 10)}...</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Farm Location</span>
                <span className="text-xs" data-cy="farm-coordinates">
                  {product.farmLocation?.latitude || '0'}, {product.farmLocation?.longitude || '0'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Certification</span>
                {product.organicCertification ? (
                  <a
                    href={getIPFSUrl(product.organicCertification)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-300 hover:text-primary-200 text-xs underline"
                  >
                    View IPFS
                  </a>
                ) : (
                  <span className="text-xs text-gray-500">Not provided</span>
                )}
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Batches</span>
                <span className="font-bold">{batches.length}</span>
              </div>
            </div>
          </GlassCard>

          {/* Batch Processing Information */}
          {batches.length > 0 && (
            <GlassCard>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaIndustry className="text-primary-400" />
                Processing Batches ({batches.length})
              </h3>
              <div className="mb-4">
                <Button variant="secondary" onClick={() => setIsBatchOpen(true)} data-cy="view-batch-btn">
                  View Batch Details
                </Button>
              </div>
              <div className="space-y-4">
                {batches.map((batch: any, index: number) => (
                  <div 
                    key={index}
                    className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-primary-300">Batch #{Number(batch.batchId)}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Processor: {batch.processor?.substring(0, 10)}...
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                        ✓ Processed
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm" data-cy="sensor-data">
                      <div>
                        <p className="text-gray-400 text-xs">Quantity</p>
                        <p className="font-semibold">{Number(batch.quantity)} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Date</p>
                        <p className="font-semibold">
                          {new Date(Number(batch.processedDate) * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      {batch.sensorLogs && batch.sensorLogs.length > 0 && (
                        <>
                          <div>
                            <p className="text-gray-400 text-xs flex items-center gap-1">
                              <FaThermometerHalf className="text-xs" />
                              Temperature
                            </p>
                            <p className="font-semibold">
                              {(Number(batch.sensorLogs[batch.sensorLogs.length - 1].temperature) / 100).toFixed(1)}°C
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Humidity</p>
                            <p className="font-semibold">
                              {(Number(batch.sensorLogs[batch.sensorLogs.length - 1].humidity) / 100).toFixed(0)}%
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {batch.packagingDetails && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                          <FaBox className="text-xs" />
                          Packaging
                        </p>
                        <p className="text-sm">{batch.packagingDetails}</p>
                      </div>
                    )}

                    {(batch.sensorLogs || []).some((log: any) => log.anomalyDetected || log.anomaly) && (
                      <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400" data-cy="anomaly-alert">
                        ⚠️ Temperature anomaly detected during storage
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Carbon Footprint */}
          <CarbonFootprint
            distanceKm={calculateTravelDistance()}
            storageDays={calculateStorageDays()}
          />

          {/* Freshness Score */}
          <FreshnessScore
            plantedDate={Number(product.plantedDate)}
            harvestDate={Number(product.harvestDate) || 0}
            batches={batches}
          />

          <SustainabilityScore
            distanceKm={calculateTravelDistance()}
            hasOrganicCert={batches.some((b: any) => b.certificateIds && b.certificateIds.length > 0)}
            batches={batches}
            storageDays={product.harvestDate > 0 
              ? Math.floor((Date.now() / 1000 - Number(product.harvestDate)) / (24 * 60 * 60))
              : 0
            }
          />
        </div>

        {/* Right Column - Journey & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Trace Timeline */}
          <GlassCard>
            <ProductTrace product={product} batches={batches} />
          </GlassCard>

          {/* AR Demo */}
          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">AR Product View</h3>
                <p className="text-sm text-gray-400">Preview farm and product overlay</p>
              </div>
              <Button variant="primary" onClick={() => setIsArOpen(true)}>
                Open AR View
              </Button>
            </div>
          </GlassCard>

          {/* IoT Sensor Simulation */}
          <SensorSimulator />

          {/* Interactive Journey Map */}
          <GlassCard>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaMapMarkedAlt className="text-primary-400" />
              Journey Map
            </h3>
            <div data-cy="location-map">
              <ProductJourneyMap
                farmLocation={product.farmLocation || { latitude: '0', longitude: '0' }}
                batches={batches}
                product={product}
              />
            </div>
          </GlassCard>

          {/* Comparative Analytics */}
          <ComparisonAnalytics
            productId={Number(product.id)}
            currentMetrics={{
              daysInSupplyChain: Math.floor((Date.now() / 1000 - Number(product.plantedDate)) / (24 * 60 * 60)),
              carbonFootprint: (calculateTravelDistance() * 0.12) + (calculateStorageDays() * 0.05),
              custodyTransfers: 2, // Farmer -> Processor -> Retailer
              authenticityScore: Number(product.authenticityScore) || 0
            }}
          />

          {/* Certificates */}
          <GlassCard>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaCertificate className="text-primary-400" />
              Certifications & Documents
            </h3>
            <div className="space-y-3">
              {batches.some((b: any) => b.certificateIds && b.certificateIds.length > 0) ? (
                batches.map((batch: any, index: number) =>
                  batch.certificateIds?.map((certId: any, certIndex: number) => (
                    <div
                      key={`${index}-${certIndex}`}
                      className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                    >
                      {(() => {
                        const cert = certificateDetails[Number(certId)];
                        const certHash = cert?.documentHash;
                        const certIssuer = cert?.issuer || 'Unknown Issuer';
                        return (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-green-400">
                                ✓ Organic Certification #{Number(certId)}
                              </p>
                              <p className="text-sm text-gray-400">Issuer: {certIssuer}</p>
                              {cert?.validUntil && (
                                <p className="text-xs text-gray-500">
                                  Valid until {new Date(Number(cert.validUntil) * 1000).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            {certHash ? (
                              <a
                                href={getIPFSUrl(certHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="glass-button text-sm"
                                data-cy="ipfs-link"
                              >
                                View Document
                              </a>
                            ) : (
                              <span className="text-xs text-gray-500">No document</span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ))
                )
              ) : (
                <div className="text-sm text-gray-500">No certificates available.</div>
              )}
            </div>
            <div className="mt-4">
              <Button variant="secondary" onClick={() => setIsCertificateOpen(true)} data-cy="view-certificate-btn">
                View Certificate
              </Button>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Share Verification</h3>
                <p className="text-sm text-gray-400">Export or share this verification</p>
              </div>
              <Button variant="secondary" onClick={() => setIsShareOpen(true)} data-cy="share-btn">
                Share
              </Button>
            </div>
            <div className="mt-4 flex gap-3">
              <Button 
                variant="primary" 
                data-cy="download-report-btn"
                onClick={generateReport}
                disabled={reportGenerating}
              >
                {reportGenerating ? 'Generating...' : 'Download Report'}
              </Button>
              <Button
                variant="secondary"
                data-cy="copy-link-btn"
                onClick={copyProductLink}
              >
                {copied ? '✓ Copied!' : 'Copy Link'}
              </Button>
            </div>
            {copied && <div className="mt-2 text-sm text-green-400">Link copied to clipboard!</div>}
          </GlassCard>
        </div>
      </div>

      {/* AR Modal */}
      <Modal isOpen={isArOpen} onClose={() => setIsArOpen(false)} title="AR Product View">
        <div className="space-y-4">
          <div className="bg-black/30 border border-primary-500/30 rounded-lg p-4 text-center">
            <p className="text-gray-300">Mock AR overlay (demo)</p>
            <div className="mt-4 bg-gray-900/60 rounded-lg p-6">
              <p className="text-sm text-gray-400">Farm:</p>
              <p className="text-lg font-semibold text-primary-300">{product.farmer?.substring(0, 10)}...</p>
              <p className="text-sm text-gray-400 mt-2">Crop:</p>
              <p className="text-lg font-semibold text-primary-300">{product.name}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">This is a mock AR view for demo purposes.</p>
        </div>
      </Modal>

      {/* Batch Details Modal */}
      <Modal isOpen={isBatchOpen} onClose={() => setIsBatchOpen(false)} title="Batch Details">
        <div className="space-y-4">
          {batches.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-lg font-bold">Batch #{batches.length > 0 ? Number(batches[selectedBatchIndex]?.batchId) : 'N/A'}</h4>
                  <p className="text-xs text-gray-400 mt-1">Processor: {batches[selectedBatchIndex]?.processor?.substring(0, 20)}...</p>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">✓ Processed</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-400 text-xs">Quantity</p>
                  <p className="font-semibold text-lg">{Number(batches[selectedBatchIndex]?.quantity)} kg</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Date</p>
                  <p className="font-semibold text-lg">
                    {new Date(Number(batches[selectedBatchIndex]?.processedDate) * 1000).toLocaleDateString()}
                  </p>
                </div>
                {batches[selectedBatchIndex]?.sensorLogs && batches[selectedBatchIndex]?.sensorLogs.length > 0 && (
                  <>
                    <div>
                      <p className="text-gray-400 text-xs flex items-center gap-1">
                        <FaThermometerHalf />
                        Temperature
                      </p>
                      <p className="font-semibold text-lg">
                        {(Number(batches[selectedBatchIndex]?.sensorLogs[0]?.temperature) / 100).toFixed(1)}°C
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Humidity</p>
                      <p className="font-semibold text-lg">
                        {(Number(batches[selectedBatchIndex]?.sensorLogs[0]?.humidity) / 100).toFixed(0)}%
                      </p>
                    </div>
                  </>
                )}
              </div>

              {batches[selectedBatchIndex]?.packagingDetails && (
                <div className="p-3 bg-primary-500/10 border border-primary-500/30 rounded">
                  <p className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                    <FaBox />
                    Packaging Details
                  </p>
                  <p className="text-sm">{batches[selectedBatchIndex]?.packagingDetails}</p>
                </div>
              )}

              {(batches[selectedBatchIndex]?.sensorLogs || []).some((log: any) => log.anomalyDetected || log.anomaly) && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400">
                  ⚠️ Temperature anomalies detected during storage
                </div>
              )}

              {batches.length > 1 && (
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-400 mb-2">Select Batch:</p>
                  <div className="flex gap-2 flex-wrap">
                    {batches.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedBatchIndex(idx)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                          selectedBatchIndex === idx
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Batch {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-400">No batch details available.</div>
          )}
        </div>
      </Modal>

      {/* Certificate Modal */}
      <Modal isOpen={isCertificateOpen} onClose={() => setIsCertificateOpen(false)} title="Certificate Details">
        <div className="space-y-4">
          {batches.some((b: any) => b.certificateIds && b.certificateIds.length > 0) ? (
            <>
              {batches.map((batch: any, batchidx: number) =>
                batch.certificateIds?.map((certId: any, certIdx: number) => {
                  const cert = certificateDetails[Number(certId)];
                  return (
                    <div
                      key={`${batchidx}-${certIdx}`}
                      className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-green-400">
                            ✓ Organic Certification #{Number(certId)}
                          </p>
                          <p className="text-sm text-gray-400">Issuer: {cert?.issuer || 'Unknown Issuer'}</p>
                          {cert?.validUntil && (
                            <p className="text-xs text-gray-500 mt-1">
                              Valid until {new Date(Number(cert.validUntil) * 1000).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <span className="inline-flex items-center px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">
                          Approved
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mb-3">
                        Status: Primary Organic Certification
                      </div>
                      {cert?.documentHash ? (
                        <a
                          href={getIPFSUrl(cert.documentHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-primary-300 hover:text-primary-200 underline text-sm"
                        >
                          View Document on IPFS
                        </a>
                      ) : (
                        <span className="text-xs text-gray-500">No document available</span>
                      )}
                    </div>
                  );
                })
              )}
            </>
          ) : (
            <div className="text-sm text-gray-500">No certificates available for this product.</div>
          )}
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} title="Share Verification">
        <div className="space-y-4" data-cy="share-modal">
          <div>
            <p className="text-sm text-gray-400 mb-3">Share this product verification on social media:</p>
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                onClick={() => shareToSocial('twitter')}
              >
                Share on Twitter
              </Button>
              <Button 
                variant="secondary"
                onClick={() => shareToSocial('facebook')}
              >
                Share on Facebook
              </Button>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-4">
            <p className="text-sm text-gray-400 mb-3">Or export as report:</p>
            <div className="flex gap-3">
              <Button 
                variant="primary" 
                onClick={generateReport}
                disabled={reportGenerating}
              >
                {reportGenerating ? 'Generating...' : 'Download Report'}
              </Button>
              <Button
                variant="secondary"
                onClick={copyProductLink}
              >
                {copied ? '✓ Copied!' : 'Copy Link'}
              </Button>
            </div>
            {copied && <div className="mt-2 text-sm text-green-400">Link copied!</div>}
          </div>
        </div>
      </Modal>

      {/* Call to Action */}
      <motion.div
        className="glass-card p-8 text-center bg-gradient-to-r from-green-600/20 to-green-500/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-2xl font-bold mb-2">Verified Organic Product</h3>
        <p className="text-gray-300">
          This product has been verified through our blockchain-based supply chain system
        </p>
      </motion.div>
    </div>
  );
}
