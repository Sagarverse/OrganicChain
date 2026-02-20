import React from 'react';
import { motion } from 'framer-motion';
import { FaLeaf, FaClock, FaThermometerHalf, FaCheckCircle } from 'react-icons/fa';

interface FreshnessScoreProps {
  plantedDate: number;
  harvestDate: number;
  batches: any[];
  hasHarvested?: boolean;
}

const FreshnessScore: React.FC<FreshnessScoreProps> = ({ plantedDate, harvestDate, batches, hasHarvested = false }) => {
  const calculateFreshnessScore = () => {
    let score = 100;

    // Days since harvest (major factor)
    const now = Math.floor(Date.now() / 1000);
    const daysSinceHarvest = harvestDate > 0 ? Math.floor((now - harvestDate) / 86400) : 0;

    // Deduct points based on days since harvest
    if (daysSinceHarvest > 30) score -= 40;
    else if (daysSinceHarvest > 14) score -= 25;
    else if (daysSinceHarvest > 7) score -= 15;
    else if (daysSinceHarvest > 3) score -= 5;

    // Check for temperature anomalies in batches
    let totalAnomalies = 0;
    let totalSensorReadings = 0;

    batches.forEach((batch: any) => {
      if (batch.sensorLogs && batch.sensorLogs.length > 0) {
        totalSensorReadings += batch.sensorLogs.length;
        batch.sensorLogs.forEach((log: any) => {
          if (log.anomalyDetected) {
            totalAnomalies++;
          }
        });
      }
    });

    // Deduct points for temperature anomalies
    if (totalSensorReadings > 0) {
      const anomalyRate = (totalAnomalies / totalSensorReadings) * 100;
      if (anomalyRate > 50) score -= 30;
      else if (anomalyRate > 25) score -= 20;
      else if (anomalyRate > 10) score -= 10;
    }

    // Bonus points for quick processing (harvest to processing < 2 days)
    if (batches.length > 0 && harvestDate > 0) {
      const firstBatch = batches[0];
      const daysToProcess = Math.floor((Number(firstBatch.processedDate) - harvestDate) / 86400);
      if (daysToProcess <= 2) score += 5;
    }

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  };

  const getFreshnessLabel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/20', icon: '🌟' };
    if (score >= 75) return { label: 'Very Fresh', color: 'text-green-400', bg: 'bg-green-500/20', icon: '✅' };
    if (score >= 60) return { label: 'Fresh', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: '👍' };
    if (score >= 40) return { label: 'Acceptable', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: '⚠️' };
    return { label: 'Low Freshness', color: 'text-red-400', bg: 'bg-red-500/20', icon: '⚠️' };
  };

  const getBestConsumptionDate = () => {
    if (harvestDate === 0) return 'Not yet harvested';

    const daysToAdd = 14; // Assume 14 days optimal consumption window
    const bestByDate = new Date((harvestDate + (daysToAdd * 86400)) * 1000);
    return bestByDate.toLocaleDateString();
  };

  const getDaysSinceHarvest = () => {
    if (harvestDate === 0) return 0;
    const now = Math.floor(Date.now() / 1000);
    return Math.floor((now - harvestDate) / 86400);
  };

  const score = calculateFreshnessScore();
  const freshnessInfo = getFreshnessLabel(score);
  const daysSinceHarvest = getDaysSinceHarvest();

  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FaLeaf className="text-green-400" />
        Freshness Score
      </h3>

      {/* Score Display */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-center mb-6"
      >
        <div className="relative inline-block">
          {/* Circular Progress */}
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke={!hasHarvested ? '#6b7280' : score >= 75 ? '#10b981' : score >= 40 ? '#fbbf24' : '#ef4444'}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${!hasHarvested ? 0 : (score / 100) * 352} 352`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {hasHarvested ? (
              <>
                <span className="text-4xl font-bold">{score}</span>
                <span className="text-sm text-gray-400">/ 100</span>
              </>
            ) : (
              <span className="text-sm font-bold text-gray-500 text-center px-2">Under Cultivation</span>
            )}
          </div>
        </div>

        <div className={`mt-4 px-4 py-2 ${hasHarvested ? freshnessInfo.bg : 'bg-gray-800/50'} rounded-full inline-flex items-center gap-2`}>
          <span className="text-xl">{hasHarvested ? freshnessInfo.icon : '🌱'}</span>
          <span className={`font-semibold ${hasHarvested ? freshnessInfo.color : 'text-gray-400'}`}>
            {hasHarvested ? freshnessInfo.label : 'Growing Phase'}
          </span>
        </div>
      </motion.div>

      {/* Details */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-2">
            <FaClock className="text-gray-400" />
            <span className="text-gray-400">Days Since Harvest</span>
          </div>
          <span className="font-bold">{daysSinceHarvest} days</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-gray-400" />
            <span className="text-gray-400">Best Consumed By</span>
          </div>
          <span className="font-bold">{getBestConsumptionDate()}</span>
        </div>

        {batches.some((b: any) => b.sensorLogs?.some((l: any) => l.anomalyDetected)) && (
          <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <FaThermometerHalf className="text-yellow-400" />
              <span className="text-yellow-400 text-xs">Temperature Spikes Detected</span>
            </div>
            <span className="text-yellow-400 font-bold text-xs">Check Details</span>
          </div>
        )}
      </div>

      {/* Freshness Tips */}
      <div className="mt-4 p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg">
        <p className="text-xs text-gray-400">
          💡 <span className="font-semibold">Storage Tip:</span>{' '}
          {score >= 75
            ? 'This product is very fresh! Store in a cool, dry place.'
            : score >= 40
              ? 'Consume soon for best quality. Refrigerate if possible.'
              : 'Freshness declining. Consume immediately or discard if spoiled.'}
        </p>
      </div>
    </div>
  );
};

export default FreshnessScore;
