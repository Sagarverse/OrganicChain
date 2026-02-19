import React from 'react';
import { motion } from 'framer-motion';
import { FaLeaf, FaTruck, FaWarehouse } from 'react-icons/fa';

interface CarbonFootprintProps {
  distanceKm: number;
  storageDays: number;
}

const CarbonFootprint: React.FC<CarbonFootprintProps> = ({ distanceKm, storageDays }) => {
  // Calculate emissions
  const transportEmissions = distanceKm * 0.2; // kg CO2 per km
  const storageEmissions = storageDays * 0.1; // kg CO2 per day
  const totalEmissions = transportEmissions + storageEmissions;

  // Calculate offset (trees needed to offset)
  const treesNeeded = Math.ceil(totalEmissions / 21); // One tree absorbs ~21kg CO2/year

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <FaLeaf className="text-3xl text-green-400" />
        <div>
          <h3 className="text-xl font-bold">Carbon Footprint</h3>
          <p className="text-sm text-gray-400">Environmental Impact Analysis</p>
        </div>
      </div>

      {/* Total Emissions */}
      <div className="carbon-indicator mb-6">
        <div className="text-4xl">🌍</div>
        <div className="flex-1">
          <h4 className="text-sm text-gray-400">Total CO₂ Emissions</h4>
          <p className="text-3xl font-bold text-primary-400">
            {totalEmissions.toFixed(2)} <span className="text-lg">kg CO₂</span>
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-3">
            <FaTruck className="text-2xl text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Transportation</p>
              <p className="font-semibold">{distanceKm.toFixed(0)} km</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-400">
              {transportEmissions.toFixed(2)} kg
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-3">
            <FaWarehouse className="text-2xl text-yellow-400" />
            <div>
              <p className="text-sm text-gray-400">Storage</p>
              <p className="font-semibold">{storageDays} days</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-yellow-400">
              {storageEmissions.toFixed(2)} kg
            </p>
          </div>
        </div>
      </div>

      {/* Carbon Offset */}
      <div className="p-4 bg-gradient-to-r from-green-600/20 to-green-500/10 rounded-lg border border-green-500/30">
        <div className="flex items-start gap-3">
          <span className="text-3xl">🌳</span>
          <div>
            <h4 className="font-semibold text-green-400 mb-1">Carbon Offset Needed</h4>
            <p className="text-sm text-gray-300">
              Plant <span className="font-bold text-lg text-green-400">{treesNeeded}</span>{' '}
              {treesNeeded === 1 ? 'tree' : 'trees'} to offset this shipment's carbon footprint
            </p>
          </div>
        </div>
      </div>

      {/* Sustainability Score */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Sustainability Rating</span>
          <div className="flex items-center gap-2">
            {totalEmissions < 50 && (
              <>
                <span className="text-green-400 font-semibold">Excellent</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaLeaf key={i} className="text-green-400" />
                  ))}
                </div>
              </>
            )}
            {totalEmissions >= 50 && totalEmissions < 100 && (
              <>
                <span className="text-yellow-400 font-semibold">Good</span>
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <FaLeaf key={i} className="text-yellow-400" />
                  ))}
                </div>
              </>
            )}
            {totalEmissions >= 100 && (
              <>
                <span className="text-orange-400 font-semibold">Fair</span>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <FaLeaf key={i} className="text-orange-400" />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CarbonFootprint;
