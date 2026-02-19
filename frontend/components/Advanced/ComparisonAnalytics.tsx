import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChartBar, FaTrophy, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import { getAllProducts } from '../../utils/blockchain';

interface ComparisonMetrics {
  daysInSupplyChain: number;
  carbonFootprint: number;
  custodyTransfers: number;
  authenticityScore: number;
}

interface ComparisonAnalyticsProps {
  productId: number;
  currentMetrics: ComparisonMetrics;
}

const ComparisonAnalytics: React.FC<ComparisonAnalyticsProps> = ({
  productId,
  currentMetrics
}) => {
  const [averageMetrics, setAverageMetrics] = useState<ComparisonMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [percentile, setPercentile] = useState<number>(0);

  useEffect(() => {
    calculateAverages();
  }, [productId]);

  const calculateAverages = async () => {
    try {
      setLoading(true);
      const allProducts = await getAllProducts();
      
      if (allProducts.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate average metrics
      let totalDays = 0;
      let totalCarbon = 0;
      let totalTransfers = 0;
      let totalScore = 0;
      let validCount = 0;

      allProducts.forEach((product: any) => {
        if (product.id === productId || !product.harvestDate || Number(product.harvestDate) === 0) {
          return; // Skip current product and invalid products
        }

        const plantedDate = Number(product.plantedDate);
        const harvestDate = Number(product.harvestDate);
        
        if (harvestDate > 0 && plantedDate > 0) {
          const days = Math.floor((Date.now() / 1000 - plantedDate) / (24 * 60 * 60));
          totalDays += days;
          
          // Rough carbon estimate (mock calculation)
          totalCarbon += days * 0.15; // 0.15 kg CO2 per day
          
          // Count custody transfers (assume processor and retailer)
          totalTransfers += 2;
          
          totalScore += Number(product.authenticityScore) || 0;
          validCount++;
        }
      });

      if (validCount > 0) {
        setAverageMetrics({
          daysInSupplyChain: Math.round(totalDays / validCount),
          carbonFootprint: Math.round((totalCarbon / validCount) * 10) / 10,
          custodyTransfers: Math.round((totalTransfers / validCount) * 10) / 10,
          authenticityScore: Math.round(totalScore / validCount)
        });

        // Calculate percentile (simple version: how many products are worse than this one)
        const betterThan = allProducts.filter((p: any) => {
          if (p.id === productId) return false;
          const score = Number(p.authenticityScore) || 0;
          return currentMetrics.authenticityScore > score;
        }).length;
        
        const pct = Math.round((betterThan / Math.max(allProducts.length - 1, 1)) * 100);
        setPercentile(pct);
      }
    } catch (error) {
      console.error('Error calculating averages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComparisonIcon = (current: number, average: number, lowerIsBetter: boolean = false) => {
    if (current === average) return <FaMinus className="text-gray-400" />;
    
    const isBetter = lowerIsBetter ? current < average : current > average;
    
    if (isBetter) {
      return <FaArrowUp className="text-green-400" />;
    } else {
      return <FaArrowDown className="text-red-400" />;
    }
  };

  const getComparisonClass = (current: number, average: number, lowerIsBetter: boolean = false) => {
    if (current === average) return 'text-gray-400';
    
    const isBetter = lowerIsBetter ? current < average : current > average;
    return isBetter ? 'text-green-400' : 'text-red-400';
  };

  const getDifferencePercentage = (current: number, average: number) => {
    if (average === 0) return 0;
    return Math.round(((current - average) / average) * 100);
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaChartBar className="text-primary-400" />
          Comparative Analytics
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (!averageMetrics) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaChartBar className="text-primary-400" />
          Comparative Analytics
        </h3>
        <p className="text-gray-400 text-center py-8">
          Not enough data for comparison
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FaChartBar className="text-primary-400" />
        Comparative Analytics
      </h3>

      {/* Percentile Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="mb-6 p-4 bg-gradient-to-r from-primary-600/20 to-primary-500/10 rounded-lg border border-primary-500/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaTrophy className="text-3xl text-yellow-400" />
            <div>
              <p className="text-sm text-gray-400">Performance Ranking</p>
              <p className="text-2xl font-bold text-primary-300">
                Top {100 - percentile}%
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Better than</p>
            <p className="text-3xl font-bold text-green-400">{percentile}%</p>
          </div>
        </div>
      </motion.div>

      <p className="text-sm text-gray-400 mb-4">
        How this product compares to the network average:
      </p>

      {/* Comparison Metrics */}
      <div className="space-y-4">
        {/* Days in Supply Chain */}
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Days in Supply Chain</span>
            {getComparisonIcon(currentMetrics.daysInSupplyChain, averageMetrics.daysInSupplyChain, true)}
          </div>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-xs text-gray-500">This Product</p>
              <p className={`text-2xl font-bold ${getComparisonClass(currentMetrics.daysInSupplyChain, averageMetrics.daysInSupplyChain, true)}`}>
                {currentMetrics.daysInSupplyChain} days
              </p>
            </div>
            <div className="mb-2">
              <p className="text-xs text-gray-500">Network Avg</p>
              <p className="text-lg text-gray-400">{averageMetrics.daysInSupplyChain} days</p>
            </div>
            <div className="ml-auto mb-2">
              <span className={`text-xs font-semibold ${getComparisonClass(currentMetrics.daysInSupplyChain, averageMetrics.daysInSupplyChain, true)}`}>
                {getDifferencePercentage(currentMetrics.daysInSupplyChain, averageMetrics.daysInSupplyChain) > 0 ? '+' : ''}
                {getDifferencePercentage(currentMetrics.daysInSupplyChain, averageMetrics.daysInSupplyChain)}%
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                currentMetrics.daysInSupplyChain < averageMetrics.daysInSupplyChain
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
              style={{ 
                width: `${Math.min((currentMetrics.daysInSupplyChain / averageMetrics.daysInSupplyChain) * 100, 100)}%` 
              }}
            />
          </div>
        </div>

        {/* Carbon Footprint */}
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Carbon Footprint</span>
            {getComparisonIcon(currentMetrics.carbonFootprint, averageMetrics.carbonFootprint, true)}
          </div>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-xs text-gray-500">This Product</p>
              <p className={`text-2xl font-bold ${getComparisonClass(currentMetrics.carbonFootprint, averageMetrics.carbonFootprint, true)}`}>
                {currentMetrics.carbonFootprint} kg CO₂
              </p>
            </div>
            <div className="mb-2">
              <p className="text-xs text-gray-500">Network Avg</p>
              <p className="text-lg text-gray-400">{averageMetrics.carbonFootprint} kg CO₂</p>
            </div>
            <div className="ml-auto mb-2">
              <span className={`text-xs font-semibold ${getComparisonClass(currentMetrics.carbonFootprint, averageMetrics.carbonFootprint, true)}`}>
                {getDifferencePercentage(currentMetrics.carbonFootprint, averageMetrics.carbonFootprint) > 0 ? '+' : ''}
                {getDifferencePercentage(currentMetrics.carbonFootprint, averageMetrics.carbonFootprint)}%
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                currentMetrics.carbonFootprint < averageMetrics.carbonFootprint
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
              style={{ 
                width: `${Math.min((currentMetrics.carbonFootprint / averageMetrics.carbonFootprint) * 100, 100)}%` 
              }}
            />
          </div>
        </div>

        {/* Authenticity Score */}
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Authenticity Score</span>
            {getComparisonIcon(currentMetrics.authenticityScore, averageMetrics.authenticityScore, false)}
          </div>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-xs text-gray-500">This Product</p>
              <p className={`text-2xl font-bold ${getComparisonClass(currentMetrics.authenticityScore, averageMetrics.authenticityScore, false)}`}>
                {currentMetrics.authenticityScore}/100
              </p>
            </div>
            <div className="mb-2">
              <p className="text-xs text-gray-500">Network Avg</p>
              <p className="text-lg text-gray-400">{averageMetrics.authenticityScore}/100</p>
            </div>
            <div className="ml-auto mb-2">
              <span className={`text-xs font-semibold ${getComparisonClass(currentMetrics.authenticityScore, averageMetrics.authenticityScore, false)}`}>
                {getDifferencePercentage(currentMetrics.authenticityScore, averageMetrics.authenticityScore) > 0 ? '+' : ''}
                {getDifferencePercentage(currentMetrics.authenticityScore, averageMetrics.authenticityScore)}%
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                currentMetrics.authenticityScore > averageMetrics.authenticityScore
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
              style={{ 
                width: `${(currentMetrics.authenticityScore / 100) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg">
        <p className="text-sm text-primary-300 font-semibold mb-1">📊 Analysis Summary</p>
        <p className="text-xs text-gray-400">
          {percentile > 75
            ? "This product significantly outperforms the majority of products in the network."
            : percentile > 50
            ? "This product performs better than average across most metrics."
            : "This product has room for improvement compared to network standards."}
        </p>
      </div>
    </div>
  );
};

export default ComparisonAnalytics;
