import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';

interface VerificationBadgeProps {
  score: number;
  isAuthentic: boolean;
  details?: string;
  hasApprovedCert?: boolean;
  hasHarvested?: boolean;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  score,
  isAuthentic,
  details,
  hasApprovedCert = false,
  hasHarvested = false
}) => {
  // Logic gating overrides
  const effectiveScore = !hasHarvested
    ? Math.min(score, 30)
    : !hasApprovedCert
      ? Math.min(score, 60)
      : score;

  const effectiveIsAuthentic = isAuthentic && hasApprovedCert && hasHarvested;

  const getScoreColor = () => {
    if (effectiveScore >= 90) return 'text-green-400';
    if (effectiveScore >= 70) return 'text-yellow-400';
    if (effectiveScore >= 50) return 'text-orange-400';
    return 'text-red-500';
  };

  const getScoreBg = () => {
    if (effectiveScore >= 90) return 'from-green-500/20 to-green-600/10';
    if (effectiveScore >= 70) return 'from-yellow-500/20 to-yellow-600/10';
    if (effectiveScore >= 50) return 'from-orange-500/20 to-orange-600/10';
    return 'from-red-500/20 to-red-600/10';
  };

  const getIcon = () => {
    if (effectiveScore >= 90) return <FaCheckCircle className="text-3xl" />;
    if (effectiveScore >= 50) return <FaExclamationTriangle className="text-3xl" />;
    return <FaTimesCircle className="text-3xl" />;
  };

  const getScoreClass = () => {
    if (effectiveScore >= 90) return 'score-high';
    if (effectiveScore >= 70) return 'score-medium';
    if (effectiveScore >= 50) return 'score-low';
    return 'score-critical';
  };

  return (
    <motion.div
      className={`glass-card bg-gradient-to-br ${getScoreBg()} p-6`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Authenticity Score</h3>
        <div className={getScoreColor()}>{getIcon()}</div>
      </div>

      {/* Score Gauge */}
      <div className="relative mb-4">
        <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${effectiveScore >= 90
                ? 'from-green-500 to-green-400'
                : effectiveScore >= 70
                  ? 'from-yellow-500 to-yellow-400'
                  : effectiveScore >= 50
                    ? 'from-orange-500 to-orange-400'
                    : 'from-red-500 to-red-400'
              } ${getScoreClass()}`}
            initial={{ width: 0 }}
            animate={{ width: `${effectiveScore}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            data-cy="score-indicator"
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-400">
          <span>0</span>
          <span
            className={`font-bold text-lg ${getScoreColor()} ${getScoreClass()}`}
            data-cy="authenticity-score"
          >
            {effectiveScore}/100
          </span>
          <span>100</span>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {effectiveIsAuthentic ? (
          <span className="text-green-400 font-semibold" data-cy="authentic-badge">
            ✓ Verified Authentic
          </span>
        ) : (
          <span className={`${effectiveScore >= 50 ? 'text-yellow-400' : 'text-red-400'} font-semibold text-center`} data-cy="warning-badge">
            {!hasHarvested
              ? "Verification Pending (Not Harvested)"
              : !hasApprovedCert
                ? "Pending Inspector Certificate"
                : "Verification Failed"}
          </span>
        )}
      </div>

      {/* Details */}
      {details && (
        <p className="text-sm text-gray-300 text-center mt-3 p-3 bg-gray-800/50 rounded-lg">
          {details}
        </p>
      )}

      {/* Score Breakdown */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <h4 className="text-sm font-semibold mb-2 text-gray-400">Score Factors:</h4>
        <div className="space-y-1 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Time Consistency</span>
            <span>{effectiveScore >= 90 ? '✓' : effectiveScore >= 50 ? '~' : '✗'}</span>
          </div>
          <div className="flex justify-between">
            <span>Location Tracking</span>
            <span>{effectiveScore >= 80 ? '✓' : effectiveScore >= 50 ? '~' : '✗'}</span>
          </div>
          <div className="flex justify-between">
            <span>Sensor Data Quality</span>
            <span>{effectiveScore >= 70 ? '✓' : effectiveScore >= 50 ? '~' : '✗'}</span>
          </div>
          <div className="flex justify-between">
            <span>Inspector Certification Valid</span>
            <span className={hasApprovedCert ? 'text-green-400' : 'text-red-400'}>
              {hasApprovedCert ? '✓ Verified' : '✗ Missing'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VerificationBadge;
