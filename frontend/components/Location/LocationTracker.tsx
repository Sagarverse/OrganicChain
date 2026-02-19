import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaCrosshairs } from 'react-icons/fa';
import { updateBatchLocation } from '../../utils/blockchain';

interface LocationTrackerProps {
  batchId?: number;
  onLocationUpdate?: (latitude: string, longitude: string) => void;
  showHistory?: boolean;
  className?: string;
}

interface LocationCoords {
  latitude: string;
  longitude: string;
  timestamp?: number;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({
  batchId,
  onLocationUpdate,
  showHistory = false,
  className = ''
}) => {
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
  const [manualLocation, setManualLocation] = useState({ latitude: '', longitude: '' });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'auto' | 'manual'>('auto');

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setInputMode('manual');
    }
  }, []);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: LocationCoords = {
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
          timestamp: Date.now()
        };
        setCurrentLocation(coords);
        setIsGettingLocation(false);
        setSuccess('Location detected successfully!');
        setTimeout(() => setSuccess(null), 3000);
      },
      (err) => {
        setIsGettingLocation(false);
        let errorMessage = 'Failed to get location';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please try manual entry.';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
        
        setError(errorMessage);
        setInputMode('manual');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleUpdateLocation = async () => {
    const coords = inputMode === 'auto' ? currentLocation : {
      latitude: manualLocation.latitude,
      longitude: manualLocation.longitude
    };

    if (!coords || !coords.latitude || !coords.longitude) {
      setError('Please provide valid coordinates');
      return;
    }

    // Validate coordinates
    const lat = parseFloat(coords.latitude);
    const lng = parseFloat(coords.longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError('Invalid coordinates. Latitude must be between -90 and 90, Longitude between -180 and 180');
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      if (batchId) {
        // Update on blockchain
        await updateBatchLocation(batchId, coords.latitude, coords.longitude);
        setSuccess('Location updated on blockchain successfully!');
      }

      // Call parent callback if provided
      if (onLocationUpdate) {
        onLocationUpdate(coords.latitude, coords.longitude);
      }

      // Reset manual inputs
      if (inputMode === 'manual') {
        setManualLocation({ latitude: '', longitude: '' });
      }

      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error('Error updating location:', err);
      setError(err.message || 'Failed to update location. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-800/50 rounded-xl p-6 border border-gray-700 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <FaMapMarkerAlt className="text-green-500" />
          Location Tracking
        </h3>
        
        <div className="flex gap-2">
          <button
            onClick={() => setInputMode('auto')}
            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
              inputMode === 'auto'
                ? 'bg-green-500 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            Auto Detect
          </button>
          <button
            onClick={() => setInputMode('manual')}
            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
              inputMode === 'manual'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            Manual Entry
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2"
        >
          <FaCheckCircle className="text-green-500" />
          <span className="text-green-400 text-sm">{success}</span>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2"
        >
          <FaExclamationTriangle className="text-red-500" />
          <span className="text-red-400 text-sm">{error}</span>
        </motion.div>
      )}

      {/* Auto Detection Mode */}
      {inputMode === 'auto' && (
        <div className="space-y-4">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            {currentLocation ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Latitude:</span>
                  <span className="text-white font-mono">{currentLocation.latitude}°</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Longitude:</span>
                  <span className="text-white font-mono">{currentLocation.longitude}°</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Status:</span>
                  <span className="text-green-400 flex items-center gap-1">
                    <FaCheckCircle className="text-xs" />
                    Location Detected
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <FaMapMarkerAlt className="text-gray-600 text-4xl mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No location detected yet</p>
              </div>
            )}
          </div>

          <button
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isGettingLocation ? (
              <>
                <FaSpinner className="animate-spin" />
                Detecting Location...
              </>
            ) : (
              <>
                <FaCrosshairs />
                Get Current Location
              </>
            )}
          </button>
        </div>
      )}

      {/* Manual Entry Mode */}
      {inputMode === 'manual' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Latitude (e.g., 40.7128)
            </label>
            <input
              type="text"
              value={manualLocation.latitude}
              onChange={(e) => setManualLocation({ ...manualLocation, latitude: e.target.value })}
              placeholder="Enter latitude (-90 to 90)"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Longitude (e.g., -74.0060)
            </label>
            <input
              type="text"
              value={manualLocation.longitude}
              onChange={(e) => setManualLocation({ ...manualLocation, longitude: e.target.value })}
              placeholder="Enter longitude (-180 to 180)"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-blue-400 text-xs">
              💡 Tip: You can find coordinates using Google Maps. Right-click on a location and select "What's here?"
            </p>
          </div>
        </div>
      )}

      {/* Update Button */}
      {((inputMode === 'auto' && currentLocation) || (inputMode === 'manual' && manualLocation.latitude && manualLocation.longitude)) && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleUpdateLocation}
          disabled={isUpdating}
          className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isUpdating ? (
            <>
              <FaSpinner className="animate-spin" />
              Updating Location...
            </>
          ) : (
            <>
              <FaMapMarkerAlt />
              Update Location on Blockchain
            </>
          )}
        </motion.button>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-gray-900/50 border border-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">How it works:</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• <strong>Auto Detect:</strong> Uses your device's GPS to get precise coordinates</li>
          <li>• <strong>Manual Entry:</strong> Enter coordinates manually if GPS is unavailable</li>
          <li>• Location updates are recorded on the blockchain with timestamp</li>
          <li>• All location history is permanently stored and traceable</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default LocationTracker;
