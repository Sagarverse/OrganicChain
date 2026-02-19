import React from 'react';
import { motion } from 'framer-motion';
import { FaLeaf, FaTruck, FaRecycle, FaWater, FaSeedling } from 'react-icons/fa';

interface SustainabilityScoreProps {
  distanceKm: number;
  hasOrganicCert: boolean;
  batches: any[];
  storageDays: number;
}

const SustainabilityScore: React.FC<SustainabilityScoreProps> = ({
  distanceKm,
  hasOrganicCert,
  batches,
  storageDays
}) => {
  const calculateSustainabilityScore = () => {
    let score = 0;
    const breakdown: any = {
      organic: 0,
      localSourcing: 0,
      carbonFootprint: 0,
      packaging: 0,
      waterUsage: 0
    };

    // Organic Certification (30 points)
    if (hasOrganicCert) {
      breakdown.organic = 30;
      score += 30;
    } else {
      breakdown.organic = 0;
    }

    // Local Sourcing based on distance (20 points)
    if (distanceKm < 100) {
      breakdown.localSourcing = 20;
      score += 20;
    } else if (distanceKm < 500) {
      breakdown.localSourcing = 15;
      score += 15;
    } else if (distanceKm < 1000) {
      breakdown.localSourcing = 10;
      score += 10;
    } else {
      breakdown.localSourcing = 5;
      score += 5;
    }

    // Carbon Footprint (25 points)
    const carbonKg = (distanceKm * 0.12) + (storageDays * 0.05);
    if (carbonKg < 5) {
      breakdown.carbonFootprint = 25;
      score += 25;
    } else if (carbonKg < 10) {
      breakdown.carbonFootprint = 20;
      score += 20;
    } else if (carbonKg < 25) {
      breakdown.carbonFootprint = 15;
      score += 15;
    } else {
      breakdown.carbonFootprint = 10;
      score += 10;
    }

    // Packaging Assessment (15 points)
    let packagingScore = 15;
    batches.forEach((batch: any) => {
      if (batch.packagingDetails) {
        const details = batch.packagingDetails.toLowerCase();
        if (details.includes('plastic') && !details.includes('recyclable')) {
          packagingScore -= 5;
        }
        if (details.includes('recyclable') || details.includes('biodegradable')) {
          packagingScore += 5;
        }
      }
    });
    breakdown.packaging = Math.max(0, Math.min(15, packagingScore));
    score += breakdown.packaging;

    // Water Usage / Processing Efficiency (10 points)
    // Assume organic + quick processing = better water management
    if (hasOrganicCert && batches.length <= 2) {
      breakdown.waterUsage = 10;
      score += 10;
    } else if (hasOrganicCert) {
      breakdown.waterUsage = 7;
      score += 7;
    } else {
      breakdown.waterUsage = 5;
      score += 5;
    }

    return { totalScore: Math.min(100, score), breakdown };
  };

  const getSustainabilityLabel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-400', icon: '🌟', description: 'Outstanding environmental practices' };
    if (score >= 75) return { label: 'Very Good', color: 'text-green-400', icon: '✅', description: 'Strong environmental commitment' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-400', icon: '👍', description: 'Solid sustainability practices' };
    if (score >= 40) return { label: 'Fair', color: 'text-yellow-400', icon: '⚠️', description: 'Room for improvement' };
    return { label: 'Poor', color: 'text-red-400', icon: '❌', description: 'Needs significant improvement' };
  };

  const getTreesNeeded = () => {
    const carbonKg = (distanceKm * 0.12) + (storageDays * 0.05);
    return Math.ceil(carbonKg / 21.77); // Average tree absorbs 21.77 kg CO2/year
  };

  const { totalScore, breakdown } = calculateSustainabilityScore();
  const sustainabilityInfo = getSustainabilityLabel(totalScore);
  const treesNeeded = getTreesNeeded();

  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FaSeedling className="text-green-400" />
        Sustainability Score
      </h3>

      {/* Score Display */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
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
              stroke={totalScore >= 75 ? '#10b981' : totalScore >= 40 ? '#fbbf24' : '#ef4444'}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(totalScore / 100) * 352} 352`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold">{totalScore}</span>
            <span className="text-sm text-gray-400">/ 100</span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xl">{sustainabilityInfo.icon}</span>
            <span className={`font-semibold ${sustainabilityInfo.color}`}>{sustainabilityInfo.label}</span>
          </div>
          <p className="text-xs text-gray-400">{sustainabilityInfo.description}</p>
        </div>
      </motion.div>

      {/* Breakdown */}
      <div className="space-y-3 mb-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Score Breakdown:</h4>
        
        <div className="space-y-2">
          {/* Organic Certification */}
          <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
            <div className="flex items-center gap-2">
              <FaLeaf className="text-green-400 text-sm" />
              <span className="text-xs">Organic Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${(breakdown.organic / 30) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold w-8 text-right">{breakdown.organic}/30</span>
            </div>
          </div>

          {/* Local Sourcing */}
          <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
            <div className="flex items-center gap-2">
              <FaTruck className="text-blue-400 text-sm" />
              <span className="text-xs">Local Sourcing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${(breakdown.localSourcing / 20) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold w-8 text-right">{breakdown.localSourcing}/20</span>
            </div>
          </div>

          {/* Carbon Footprint */}
          <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
            <div className="flex items-center gap-2">
              <FaSeedling className="text-emerald-400 text-sm" />
              <span className="text-xs">Low Carbon</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${(breakdown.carbonFootprint / 25) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold w-8 text-right">{breakdown.carbonFootprint}/25</span>
            </div>
          </div>

          {/* Packaging */}
          <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
            <div className="flex items-center gap-2">
              <FaRecycle className="text-cyan-400 text-sm" />
              <span className="text-xs">Eco Packaging</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500"
                  style={{ width: `${(breakdown.packaging / 15) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold w-8 text-right">{breakdown.packaging}/15</span>
            </div>
          </div>

          {/* Water Usage */}
          <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
            <div className="flex items-center gap-2">
              <FaWater className="text-blue-300 text-sm" />
              <span className="text-xs">Water Efficiency</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400"
                  style={{ width: `${(breakdown.waterUsage / 10) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold w-8 text-right">{breakdown.waterUsage}/10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Carbon Offset */}
      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-green-400">🌳 Carbon Offset</span>
          <span className="text-xs text-gray-400">{((distanceKm * 0.12) + (storageDays * 0.05)).toFixed(2)} kg CO₂</span>
        </div>
        <p className="text-xs text-gray-400">
          Plant <span className="font-bold text-green-400">{treesNeeded} tree{treesNeeded > 1 ? 's' : ''}</span> to offset the carbon footprint of this product's journey
        </p>
        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: Math.min(treesNeeded, 5) }).map((_, i) => (
            <span key={i} className="text-lg">🌲</span>
          ))}
          {treesNeeded > 5 && <span className="text-xs text-gray-400">+{treesNeeded - 5} more</span>}
        </div>
      </div>
    </div>
  );
};

export default SustainabilityScore;
