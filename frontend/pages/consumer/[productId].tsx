import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import GlassCard from '../../components/Layout/GlassCard';
import VerificationBadge from '../../components/Blockchain/VerificationBadge';
import ProductTrace from '../../components/Blockchain/ProductTrace';
import CarbonFootprint from '../../components/Advanced/CarbonFootprint';
import FreshnessScore from '../../components/Advanced/FreshnessScore';
import SustainabilityScore from '../../components/Advanced/SustainabilityScore';
import ComparisonAnalytics from '../../components/Advanced/ComparisonAnalytics';
import ProductJourneyMap from '../../components/Maps/ProductJourneyMap';
import { getProductHistory, verifyProduct, calculateDistance } from '../../utils/blockchain';
import { FaQrcode, FaCertificate, FaMapMarkedAlt, FaIndustry, FaThermometerHalf, FaBox } from 'react-icons/fa';

export default function ConsumerProductPage() {
  const router = useRouter();
  const { productId } = router.query;
  const [product, setProduct] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [verification, setVerification] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      loadProductData();
    }
  }, [productId]);

  const loadProductData = async () => {
    try {
      setIsLoading(true);
      const id = parseInt(productId as string);
      
      // Get product history
      const { product: productData, batches: batchData } = await getProductHistory(id);
      setProduct(productData);
      setBatches(batchData);

      // Get verification data
      const verificationData = await verifyProduct(id);
      setVerification(verificationData);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTravelDistance = () => {
    if (!product || !batches.length) return 0;
    
    const farmLat = parseFloat(product.farmLocation.latitude);
    const farmLng = parseFloat(product.farmLocation.longitude);
    
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
    const plantedDate = Number(product.plantedDate);
    const now = Math.floor(Date.now() / 1000);
    return Math.floor((now - plantedDate) / 86400);
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
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Verification & Product Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Verification Badge */}
          {verification && (
            <VerificationBadge
              score={verification.score}
              isAuthentic={verification.isAuthentic}
              details={verification.details}
            />
          )}

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
                <span className="text-gray-400">Farmer</span>
                <span className="font-mono text-xs">{product.farmer.substring(0, 10)}...</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Farm Location</span>
                <span className="text-xs">
                  {product.farmLocation.latitude}, {product.farmLocation.longitude}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Certification</span>
                <span className="certificate-badge">✓ USDA Organic</span>
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
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
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
                    
                    {batch.sensorLogs && batch.sensorLogs.some((log: any) => log.anomalyDetected) && (
                      <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400">
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

          {/* Interactive Journey Map */}
          <GlassCard>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaMapMarkedAlt className="text-primary-400" />
              Journey Map
            </h3>
            <ProductJourneyMap
              farmLocation={product.farmLocation}
              batches={batches}
              product={product}
            />
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
          {batches.some((b: any) => b.certificateIds && b.certificateIds.length > 0) && (
            <GlassCard>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaCertificate className="text-primary-400" />
                Certifications & Documents
              </h3>
              <div className="space-y-3">
                {batches.map((batch: any, index: number) =>
                  batch.certificateIds?.map((certId: any, certIndex: number) => (
                    <div
                      key={`${index}-${certIndex}`}
                      className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-green-400">
                            ✓ Organic Certification #{Number(certId)}
                          </p>
                          <p className="text-sm text-gray-400">Verified by Inspector</p>
                        </div>
                        <button className="glass-button text-sm">View Document</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          )}
        </div>
      </div>

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
