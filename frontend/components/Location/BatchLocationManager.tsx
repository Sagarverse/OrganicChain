import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaBox, FaHistory, FaPlus } from 'react-icons/fa';
import LocationTracker from '../Location/LocationTracker';
import { getAllBatches } from '../../utils/blockchain';

interface BatchWithLocation {
  id: number;
  productId: number;
  processor: string;
  quantity: number;
  locationHistory: Array<{
    latitude: string;
    longitude: string;
    timestamp: number;
  }>;
}

const BatchLocationManager: React.FC = () => {
  const [batches, setBatches] = useState<BatchWithLocation[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTracker, setShowTracker] = useState(false);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    setLoading(true);
    try {
      const allBatches = await getAllBatches() as any;
      setBatches(allBatches || []);
    } catch (error) {
      console.error('Error loading batches:', error);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationUpdate = () => {
    setShowTracker(false);
    loadBatches(); // Reload to show updated location
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const selectedBatchData = batches.find(b => b.id === selectedBatch);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <FaMapMarkerAlt className="text-green-500" />
            Batch Location Manager
          </h1>
          <p className="text-gray-400">Track and update batch locations in real-time</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Batch List */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 sticky top-6"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaBox className="text-blue-500" />
                Your Batches
              </h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                  <p className="text-gray-400 text-sm">Loading batches...</p>
                </div>
              ) : batches.length === 0 ? (
                <div className="text-center py-8">
                  <FaBox className="text-gray-600 text-4xl mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No batches found</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {batches.map((batch) => (
                    <button
                      key={batch.id}
                      onClick={() => {
                        setSelectedBatch(batch.id);
                        setShowTracker(false);
                      }}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        selectedBatch === batch.id
                          ? 'bg-green-500/20 border-2 border-green-500'
                          : 'bg-gray-900/50 border border-gray-700 hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">Batch #{batch.id}</span>
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                          Product #{batch.productId}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mb-1">
                        {batch.quantity} kg
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <FaMapMarkerAlt className={batch.locationHistory?.length > 0 ? "text-green-500" : "text-gray-600"} />
                        <span className={batch.locationHistory?.length > 0 ? "text-green-400" : "text-gray-500"}>
                          {batch.locationHistory?.length || 0} locations
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Details and Tracker */}
          <div className="lg:col-span-2 space-y-6">
            {selectedBatch && selectedBatchData ? (
              <>
                {/* Batch Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
                >
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Batch #{selectedBatchData.id} Details
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Product ID</p>
                      <p className="text-white font-bold text-lg">#{selectedBatchData.productId}</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Quantity</p>
                      <p className="text-white font-bold text-lg">{selectedBatchData.quantity} kg</p>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                    <p className="text-gray-400 text-sm mb-1">Processor</p>
                    <p className="text-white font-mono text-sm">
                      {selectedBatchData.processor.slice(0, 10)}...{selectedBatchData.processor.slice(-8)}
                    </p>
                  </div>

                  {!showTracker && (
                    <button
                      onClick={() => setShowTracker(true)}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <FaPlus />
                      Add New Location
                    </button>
                  )}
                </motion.div>

                {/* Location Tracker */}
                {showTracker && (
                  <LocationTracker
                    batchId={selectedBatch}
                    onLocationUpdate={handleLocationUpdate}
                  />
                )}

                {/* Location History */}
                {selectedBatchData.locationHistory && selectedBatchData.locationHistory.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
                  >
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <FaHistory className="text-purple-500" />
                      Location History ({selectedBatchData.locationHistory.length})
                    </h3>

                    <div className="space-y-3">
                      {selectedBatchData.locationHistory.map((location, index) => (
                        <div
                          key={index}
                          className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                <span className="text-green-400 font-bold text-sm">
                                  {selectedBatchData.locationHistory.length - index}
                                </span>
                              </div>
                              <span className="text-gray-400 text-sm">
                                {formatDate(location.timestamp)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Latitude</p>
                              <p className="text-white font-mono text-sm">{location.latitude}°</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Longitude</p>
                              <p className="text-white font-mono text-sm">{location.longitude}°</p>
                            </div>
                          </div>

                          <a
                            href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
                          >
                            <FaMapMarkerAlt />
                            View on Google Maps →
                          </a>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-800/50 rounded-xl p-12 border border-gray-700 text-center"
              >
                <FaBox className="text-gray-600 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Batch Selected</h3>
                <p className="text-gray-400">
                  Select a batch from the list to view details and manage locations
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchLocationManager;
