import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY, GLASS_STYLES } from '../styles/theme';
import {
  getProductHistory,
  verifyProduct,
  formatAddress,
  formatDate,
  formatDateTime,
  getScoreColor,
  getScoreLabel,
  calculateCarbonFootprint,
  calculateDistance,
} from '../utils/blockchain';
import { PRODUCT_STATUS, CROP_TYPES, WEB_URL } from '../utils/constants';

export default function ProductScreen({ route, navigation }) {
  const { productId } = route.params;
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [batches, setBatches] = useState([]);
  const [verification, setVerification] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProductData();
  }, [productId]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch product history and verification in parallel
      const [historyData, verificationData] = await Promise.all([
        getProductHistory(productId),
        verifyProduct(productId),
      ]);

      setProduct(historyData.product);
      setBatches(historyData.batches);
      setVerification(verificationData);
    } catch (err) {
      console.error('Error loading product:', err);
      setError('Failed to load product data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openInBrowser = () => {
    Linking.openURL(`${WEB_URL}/consumer/${productId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryLight} />
        <Text style={styles.loadingText}>Loading product data...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Unable to Load Product</Text>
        <Text style={styles.errorText}>
          {error || 'Product not found. Please check the QR code and try again.'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadProductData}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const scoreColor = getScoreColor(product.authenticityScore);
  const scoreLabel = getScoreLabel(product.authenticityScore);

  return (
    <LinearGradient
      colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Authenticity Badge */}
          <View style={[styles.badgeCard, GLASS_STYLES.card]}>
            <View style={styles.badgeHeader}>
              <Text style={styles.badgeTitle}>Authenticity Verification</Text>
              <View
                style={[styles.scoreBadge, { backgroundColor: scoreColor }]}
              >
                <Text style={styles.scoreBadgeText}>{scoreLabel}</Text>
              </View>
            </View>
            
            <View style={styles.scoreContainer}>
              <Text style={[styles.scoreNumber, { color: scoreColor }]}>
                {product.authenticityScore}
              </Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${product.authenticityScore}%`,
                    backgroundColor: scoreColor,
                  },
                ]}
              />
            </View>

            {verification && (
              <Text style={styles.verificationDetails}>
                {verification.details}
              </Text>
            )}
          </View>

          {/* Product Details */}
          <View style={[styles.detailsCard, GLASS_STYLES.card]}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productId}>Product ID: #{product.id}</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>
                {CROP_TYPES[product.cropType]}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {PRODUCT_STATUS[product.status]}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Farmer:</Text>
              <Text style={styles.detailValue}>
                {formatAddress(product.farmer)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Planted:</Text>
              <Text style={styles.detailValue}>
                {formatDate(product.plantedDate)}
              </Text>
            </View>

            {product.harvestDate > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Harvested:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(product.harvestDate)}
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>
                {product.farmLocation.latitude}, {product.farmLocation.longitude}
              </Text>
            </View>
          </View>

          {/* Carbon Footprint */}
          {batches.length > 0 && (
            <View style={[styles.carbonCard, GLASS_STYLES.card]}>
              <Text style={styles.cardTitle}>🌱 Carbon Footprint</Text>
              
              {(() => {
                const lastBatch = batches[batches.length - 1];
                const locationHistory = lastBatch.locationHistory || [];
                
                let totalDistance = 0;
                if (locationHistory.length > 1) {
                  for (let i = 1; i < locationHistory.length; i++) {
                    const prev = locationHistory[i - 1];
                    const curr = locationHistory[i];
                    totalDistance += calculateDistance(
                      parseFloat(prev.latitude),
                      parseFloat(prev.longitude),
                      parseFloat(curr.latitude),
                      parseFloat(curr.longitude)
                    );
                  }
                }

                const storageDays = product.harvestDate > 0
                  ? Math.floor((Date.now() / 1000 - product.harvestDate) / 86400)
                  : 0;

                const carbonFootprint = calculateCarbonFootprint(
                  totalDistance,
                  storageDays
                );

                const treesNeeded = (carbonFootprint / 20).toFixed(1);

                return (
                  <>
                    <View style={styles.carbonMetric}>
                      <Text style={styles.carbonValue}>{carbonFootprint}</Text>
                      <Text style={styles.carbonUnit}>kg CO₂</Text>
                    </View>

                    <View style={styles.carbonBreakdown}>
                      <Text style={styles.carbonDetail}>
                        🚚 Transport: {(totalDistance * 0.2).toFixed(2)} kg
                      </Text>
                      <Text style={styles.carbonDetail}>
                        📦 Storage: {(storageDays * 0.1).toFixed(2)} kg
                      </Text>
                      <Text style={styles.carbonDetail}>
                        🌳 Offset: {treesNeeded} trees needed
                      </Text>
                    </View>
                  </>
                );
              })()}
            </View>
          )}

          {/* Journey Timeline */}
          <View style={[styles.timelineCard, GLASS_STYLES.card]}>
            <Text style={styles.cardTitle}>📍 Product Journey</Text>

            {/* Planted */}
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: COLORS.success }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>🌱 Planted</Text>
                <Text style={styles.timelineDate}>
                  {formatDateTime(product.plantedDate)}
                </Text>
                <Text style={styles.timelineLocation}>
                  📍 {product.farmLocation.latitude}, {product.farmLocation.longitude}
                </Text>
              </View>
            </View>

            {/* Harvested */}
            {product.harvestDate > 0 && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: COLORS.success }]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>🌾 Harvested</Text>
                  <Text style={styles.timelineDate}>
                    {formatDateTime(product.harvestDate)}
                  </Text>
                </View>
              </View>
            )}

            {/* Batches */}
            {batches.map((batch, index) => (
              <View key={batch.batchId} style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: COLORS.info }]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>
                    📦 Batch #{batch.batchId} - {PRODUCT_STATUS[batch.status]}
                  </Text>
                  <Text style={styles.timelineDate}>
                    {formatDateTime(batch.processedDate)}
                  </Text>
                  <Text style={styles.timelineDetail}>
                    Quantity: {batch.quantity} units
                  </Text>
                  {batch.packagingDetails && (
                    <Text style={styles.timelineDetail}>
                      Package: {batch.packagingDetails}
                    </Text>
                  )}
                  
                  {/* Sensor Logs */}
                  {batch.sensorLogs && batch.sensorLogs.length > 0 && (
                    <Text style={styles.timelineDetail}>
                      🌡️ {batch.sensorLogs.length} sensor readings •{' '}
                      {batch.sensorLogs.filter(log => log.anomalyDetected).length} anomalies
                    </Text>
                  )}

                  {/* Location History */}
                  {batch.locationHistory && batch.locationHistory.length > 0 && (
                    <Text style={styles.timelineDetail}>
                      📍 {batch.locationHistory.length} location checkpoints
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* View in Browser Button */}
          <TouchableOpacity
            style={[styles.browserButton, GLASS_STYLES.button]}
            onPress={openInBrowser}
          >
            <Text style={styles.browserButtonText}>🌐 View Full Details in Browser</Text>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footerText}>
            Powered by Ethereum Blockchain • Data is immutable and verifiable
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  errorTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  errorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primaryMid,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  retryButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  backButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },

  // Badge Card
  badgeCard: {
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  badgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  badgeTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  scoreBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  scoreBadgeText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  scoreNumber: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  scoreMax: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  verificationDetails: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Details Card
  detailsCard: {
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  productName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  productId: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  detailValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  statusBadge: {
    backgroundColor: COLORS.info,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  statusText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },

  // Carbon Card
  carbonCard: {
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  carbonMetric: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  carbonValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  carbonUnit: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  carbonBreakdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: SPACING.md,
    borderRadius: 8,
  },
  carbonDetail: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },

  // Timeline Card
  timelineCard: {
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: SPACING.md,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  timelineDate: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  timelineLocation: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  timelineDetail: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // Browser Button
  browserButton: {
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  browserButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },

  // Footer
  footerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
});
