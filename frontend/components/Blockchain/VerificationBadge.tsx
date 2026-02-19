import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';

interface VerificationBadgeProps {
  score: number;
  isAuthentic: boolean;
  details?: string;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ 
  score, 
  isAuthentic, 
  details 
}) => {
  const getScoreColor = () => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-500';
  };

  const getScoreBg = () => {
    if (score >= 90) return 'from-green-500/20 to-green-600/10';
    if (score >= 70) return 'from-yellow-500/20 to-yellow-600/10';
    if (score >= 50) return 'from-orange-500/20 to-orange-600/10';
    return 'from-red-500/20 to-red-600/10';
  };

  const getIcon = () => {
    if (score >= 90) return <FaCheckCircle className="text-3xl" />;
    if (score >= 50) return <FaExclamationTriangle className="text-3xl" />;
    return <FaTimesCircle className="text-3xl" />;
  };

  const getScoreClass = () => {
    if (score >= 90) return 'score-high';
    if (score >= 70) return 'score-medium';
    if (score >= 50) return 'score-low';
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
            className={`h-full bg-gradient-to-r ${
              score >= 90
                ? 'from-green-500 to-green-400'
                : score >= 70
                ? 'from-yellow-500 to-yellow-400'
                : score >= 50
                ? 'from-orange-500 to-orange-400'
                : 'from-red-500 to-red-400'
            } ${getScoreClass()}`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
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
            {score}/100
          </span>
          <span>100</span>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {isAuthentic ? (
          <span className="text-green-400 font-semibold" data-cy="authentic-badge">
            ✓ Verified Authentic
          </span>
        ) : (
          <span className="text-red-400 font-semibold" data-cy="warning-badge">
            Verification Failed
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
            <span>{score >= 90 ? '✓' : score >= 50 ? '~' : '✗'}</span>
          </div>
          <div className="flex justify-between">
            <span>Location Tracking</span>
            <span>{score >= 80 ? '✓' : score >= 50 ? '~' : '✗'}</span>
          </div>
          <div className="flex justify-between">
            <span>Sensor Data Quality</span>
            <span>{score >= 70 ? '✓' : score >= 50 ? '~' : '✗'}</span>
          </div>
          <div className="flex justify-between">
            <span>Certificate Validity</span>
            <span>{score >= 85 ? '✓' : score >= 50 ? '~' : '✗'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VerificationBadge;
