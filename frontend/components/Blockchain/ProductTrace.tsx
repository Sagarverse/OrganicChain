import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaSeedling, 
  FaClipboardCheck, 
  FaIndustry, 
  FaBoxOpen, 
  FaTruck, 
  FaStore,
  FaHandshake,
  FaArrowRight
} from 'react-icons/fa';
import { PRODUCT_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/blockchain';

interface TimelineEvent {
  status: number;
  timestamp: number;
  actor?: string;
  location?: string;
}

interface ProductTraceProps {
  product: any;
  batches: any[];
}

const ProductTrace: React.FC<ProductTraceProps> = ({ product, batches }) => {
  const normalizeStatus = (status: any) => {
    if (typeof status === 'number') return status;
    if (typeof status === 'string') {
      const index = PRODUCT_STATUS.findIndex(
        (label: string) => label.toLowerCase() === status.toLowerCase()
      );
      return index >= 0 ? index : 0;
    }
    return 0;
  };

  const getStatusIcon = (status: number) => {
    const icons = [
      <FaSeedling />,      // Planted
      <FaClipboardCheck />, // Harvested
      <FaIndustry />,      // Processing
      <FaIndustry />,      // Processed
      <FaBoxOpen />,       // Packaged
      <FaTruck />,         // In Transit
      <FaStore />,         // Delivered
    ];
    return icons[status] || <FaSeedling />;
  };

  // Build timeline from product and batch data
  const buildTimeline = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // Add planting
    if (product.plantedDate && Number(product.plantedDate) > 0) {
      events.push({
        status: 0,
        timestamp: Number(product.plantedDate),
        location: `${product.farmLocation?.latitude || '0'}, ${product.farmLocation?.longitude || '0'}`,
      });
    }

    // Add harvest
    if (product.harvestDate && Number(product.harvestDate) > 0) {
      events.push({
        status: 1,
        timestamp: Number(product.harvestDate),
        actor: product.farmer,
      });
    }

    // Add batch events
    batches.forEach((batch) => {
      const processedTimestamp = Number(batch.processedDate || batch.processingDate || 0);
      if (processedTimestamp > 0) {
        events.push({
          status: 2,
          timestamp: processedTimestamp,
          actor: batch.processor,
        });
        events.push({
          status: 3,
          timestamp: processedTimestamp,
          actor: batch.processor,
        });
      } else if (product.harvestDate) {
        events.push({
          status: 2,
          timestamp: Number(product.harvestDate),
          actor: batch.processor,
        });
        events.push({
          status: 3,
          timestamp: Number(product.harvestDate),
          actor: batch.processor,
        });
      }
    });

    // Add transfer (In Transit)
    if (product.transferDate && Number(product.transferDate) > 0) {
      events.push({
        status: 5,
        timestamp: Number(product.transferDate),
        actor: product.currentCustodian,
      });
    }

    // Add delivery
    if (product.receivedDate && Number(product.receivedDate) > 0) {
      events.push({
        status: 6,
        timestamp: Number(product.receivedDate),
        actor: product.currentCustodian,
      });
    } else if (normalizeStatus(product.status) >= 6) {
      events.push({
        status: 6,
        timestamp: Number(product.harvestDate || Date.now() / 1000),
        actor: product.currentCustodian,
      });
    }

    // Sort by timestamp
    return events.sort((a, b) => a.timestamp - b.timestamp);
  };

  const timeline = buildTimeline();

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold gradient-text mb-6">Product Journey</h3>

      {/* Timeline */}
      <div className="relative" data-cy="timeline">
        {timeline.map((event, index) => (
          <motion.div
            key={index}
            className="timeline-item"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            data-cy="timeline-event"
          >
            <div className="timeline-dot flex items-center justify-center text-white">
              {getStatusIcon(event.status)}
            </div>

            <div className="glass-card ml-4 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-lg text-primary-400">
                  {PRODUCT_STATUS[event.status]}
                </h4>
                <span className="text-sm text-gray-400" data-cy="timestamp">
                  {formatDate(event.timestamp)}
                </span>
              </div>

              {event.actor && (
                <p className="text-sm text-gray-300">
                  Actor: <span className="text-primary-300">{event.actor.substring(0, 10)}...</span>
                </p>
              )}

              {event.location && (
                <p className="text-sm text-gray-300">
                  Location: <span className="text-primary-300">{event.location}</span>
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Custody Chain */}
      {product.currentCustodian && (
        <div className="mt-8">
          <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaHandshake className="text-blue-400" />
            Custody Chain
          </h4>
          <div className="space-y-3">
            {/* Farmer - Initial Custody */}
            <motion.div
              className="glass-card p-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <FaSeedling className="text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Farmer (Origin)</p>
                  <p className="font-mono text-sm text-primary-300">
                    {product.farmer?.substring(0, 20)}...
                  </p>
                </div>
                {product.plantedDate && (
                  <span className="text-xs text-gray-500">
                    {formatDate(Number(product.plantedDate))}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Arrow */}
            {batches.length > 0 && (
              <div className="flex justify-center">
                <FaArrowRight className="text-gray-600" />
              </div>
            )}

            {/* Processors - Multiple possible */}
            {batches.map((batch, index) => (
              <motion.div
                key={`processor-${index}`}
                className="glass-card p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (index * 0.1) }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <FaIndustry className="text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Processor #{index + 1}</p>
                    <p className="font-mono text-sm text-primary-300">
                      {batch.processor?.substring(0, 20)}...
                    </p>
                  </div>
                  {batch.processedDate && (
                    <span className="text-xs text-gray-500">
                      {formatDate(Number(batch.processedDate))}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Arrow to current custodian if different */}
            {product.currentCustodian && 
             product.currentCustodian.toLowerCase() !== product.farmer?.toLowerCase() &&
             !batches.some((b: any) => b.processor?.toLowerCase() === product.currentCustodian.toLowerCase()) && (
              <>
                <div className="flex justify-center">
                  <FaArrowRight className="text-gray-600" />
                </div>

                <motion.div
                  className="glass-card p-4 border-2 border-primary-500/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                      <FaStore className="text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Current Custodian</p>
                      <p className="font-mono text-sm text-primary-300">
                        {product.currentCustodian?.substring(0, 20)}...
                      </p>
                      <span className="inline-block mt-1 px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs">
                        ✓ In Possession
                      </span>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Current Status */}
      <motion.div
        className="glass-card p-6 bg-gradient-to-r from-primary-600/20 to-primary-500/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: timeline.length * 0.2 }}
      >
        <div className="flex items-center gap-4">
          <div className="text-4xl text-primary-400">
            {getStatusIcon(normalizeStatus(product.status))}
          </div>
          <div>
            <h4 className="text-sm text-gray-400">Current Status</h4>
            <p className="text-2xl font-bold text-primary-300">
              {PRODUCT_STATUS[normalizeStatus(product.status)]}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Batch Details */}
      {batches.length > 0 && (
        <div className="mt-8">
          <h4 className="text-xl font-bold mb-4">Processing Batches</h4>
          <div className="space-y-4">
            {batches.map((batch, index) => (
              <motion.div
                key={index}
                className="glass-card p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-semibold text-lg">Batch #{Number(batch.batchId)}</h5>
                    <p className="text-sm text-gray-400">
                      Quantity: {Number(batch.quantity)} kg
                    </p>
                  </div>
                  <span className="status-badge status-processing">
                    {PRODUCT_STATUS[Number(batch.status)]}
                  </span>
                </div>

                {batch.packagingDetails && (
                  <p className="text-sm text-gray-300 mb-2">
                    📦 {batch.packagingDetails}
                  </p>
                )}

                {/* Sensor Data Summary */}
                {batch.sensorLogs && batch.sensorLogs.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Sensor Readings:</p>
                    <div className="flex gap-4 text-sm">
                      <span>
                        🌡️ Avg Temp: {
                          (batch.sensorLogs.reduce((sum: number, log: any) => 
                            sum + Number(log.temperature), 0) / 
                            batch.sensorLogs.length / 100).toFixed(1)
                        }°C
                      </span>
                      <span>
                        💧 Avg Humidity: {
                          (batch.sensorLogs.reduce((sum: number, log: any) => 
                            sum + Number(log.humidity), 0) / 
                            batch.sensorLogs.length / 100).toFixed(1)
                        }%
                      </span>
                    </div>
                  </div>
                )}

                {/* Location Tracking */}
                {batch.locationHistory && batch.locationHistory.length > 0 && (
                  <div className="mt-2 text-sm text-gray-400">
                    📍 Tracked through {batch.locationHistory.length} locations
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTrace;
