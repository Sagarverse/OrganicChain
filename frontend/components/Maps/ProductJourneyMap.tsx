import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { FaSeedling, FaIndustry, FaStore, FaTruck, FaMapMarkerAlt } from 'react-icons/fa';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPoint {
  lat: number;
  lng: number;
  name: string;
  type: 'farm' | 'processor' | 'retailer' | 'transit';
  timestamp?: number;
  address?: string;
}

interface ProductJourneyMapProps {
  farmLocation: { latitude: string; longitude: string };
  batches: any[];
  product: any;
}

// Custom marker icons
const createCustomIcon = (color: string, icon: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 18px;
          color: white;
        ">${icon}</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const farmIcon = createCustomIcon('#10b981', '🌱');
const processorIcon = createCustomIcon('#3b82f6', '🏭');
const retailerIcon = createCustomIcon('#f59e0b', '🏪');
const transitIcon = createCustomIcon('#8b5cf6', '🚛');

// Component to fit bounds to markers
const FitBounds: React.FC<{ locations: LocationPoint[] }> = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [locations, map]);

  return null;
};

const ProductJourneyMap: React.FC<ProductJourneyMapProps> = ({
  farmLocation,
  batches,
  product
}) => {
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [routes, setRoutes] = useState<[number, number][][]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    // Only run on client side
    setIsMapReady(true);
    
    const locationPoints: LocationPoint[] = [];

    // 1. Farm location (origin)
    const farmLat = parseFloat(farmLocation.latitude);
    const farmLng = parseFloat(farmLocation.longitude);
    
    if (!isNaN(farmLat) && !isNaN(farmLng)) {
      locationPoints.push({
        lat: farmLat,
        lng: farmLng,
        name: 'Farm (Origin)',
        type: 'farm',
        timestamp: Number(product.plantedDate),
        address: product.farmer
      });
    }

    // 2. Processor locations from batches
    batches.forEach((batch, index) => {
      if (batch.locationHistory && batch.locationHistory.length > 0) {
        // Use location history if available
        batch.locationHistory.forEach((loc: any, locIndex: number) => {
          const lat = parseFloat(loc.latitude);
          const lng = parseFloat(loc.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            locationPoints.push({
              lat,
              lng,
              name: locIndex === 0 ? `Processor #${index + 1}` : `Transit Point ${locIndex}`,
              type: locIndex === 0 ? 'processor' : 'transit',
              timestamp: Number(loc.timestamp),
              address: batch.processor
            });
          }
        });
      } else {
        // Mock processor location (offset from farm for demo)
        // In production, this would come from actual processor registration
        const processorLat = farmLat + (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.5);
        const processorLng = farmLng + (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.5);
        
        locationPoints.push({
          lat: processorLat,
          lng: processorLng,
          name: `Processing Facility #${index + 1}`,
          type: 'processor',
          timestamp: Number(batch.processedDate),
          address: batch.processor
        });
      }
    });

    // 3. Retailer location (mock - offset from last processor)
    if (product.status >= 4 && locationPoints.length > 1) {
      const lastLoc = locationPoints[locationPoints.length - 1];
      const retailerLat = lastLoc.lat + (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.4);
      const retailerLng = lastLoc.lng + (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.4);
      
      locationPoints.push({
        lat: retailerLat,
        lng: retailerLng,
        name: 'Retail Store',
        type: 'retailer',
        timestamp: Date.now() / 1000,
        address: product.currentCustodian || 'N/A'
      });
    }

    setLocations(locationPoints);

    // Generate routes between consecutive points
    const routeSegments: [number, number][][] = [];
    for (let i = 0; i < locationPoints.length - 1; i++) {
      const start = locationPoints[i];
      const end = locationPoints[i + 1];
      
      // Create a curved path between points for visual appeal
      const midLat = (start.lat + end.lat) / 2;
      const midLng = (start.lng + end.lng) / 2;
      
      // Add some curvature to the route
      const curveLat = midLat + (Math.random() - 0.5) * 0.2;
      const curveLng = midLng + (Math.random() - 0.5) * 0.2;
      
      routeSegments.push([
        [start.lat, start.lng],
        [curveLat, curveLng],
        [end.lat, end.lng]
      ]);
    }

    setRoutes(routeSegments);
  }, [farmLocation, batches, product]);

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'farm':
        return farmIcon;
      case 'processor':
        return processorIcon;
      case 'retailer':
        return retailerIcon;
      case 'transit':
        return transitIcon;
      default:
        return farmIcon;
    }
  };

  const getRouteColor = (index: number) => {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];
    return colors[index % colors.length];
  };

  // Calculate total distance (rough estimate)
  const calculateDistance = () => {
    let total = 0;
    for (let i = 0; i < locations.length - 1; i++) {
      const from = locations[i];
      const to = locations[i + 1];
      // Haversine formula
      const R = 6371; // km
      const dLat = ((to.lat - from.lat) * Math.PI) / 180;
      const dLon = ((to.lng - from.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((from.lat * Math.PI) / 180) *
          Math.cos((to.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      total += R * c;
    }
    return total.toFixed(1);
  };

  if (!isMapReady) {
    return (
      <div className="w-full h-[500px] bg-gray-800/50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading map...</p>
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="w-full h-[500px] bg-gray-800/50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <FaMapMarkerAlt className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No location data available</p>
        </div>
      </div>
    );
  }

  const center: [number, number] = [locations[0].lat, locations[0].lng];

  return (
    <div className="space-y-4">
      {/* Map Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-green-600/20 to-green-500/10 rounded-lg border border-green-500/30"
        >
          <div className="flex items-center gap-3">
            <FaMapMarkerAlt className="text-2xl text-green-400" />
            <div>
              <p className="text-xs text-gray-400">Total Checkpoints</p>
              <p className="text-2xl font-bold text-green-400">{locations.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-gradient-to-r from-blue-600/20 to-blue-500/10 rounded-lg border border-blue-500/30"
        >
          <div className="flex items-center gap-3">
            <FaTruck className="text-2xl text-blue-400" />
            <div>
              <p className="text-xs text-gray-400">Total Distance</p>
              <p className="text-2xl font-bold text-blue-400">{calculateDistance()} km</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-gradient-to-r from-purple-600/20 to-purple-500/10 rounded-lg border border-purple-500/30"
        >
          <div className="flex items-center gap-3">
            <FaStore className="text-2xl text-purple-400" />
            <div>
              <p className="text-xs text-gray-400">Journey Time</p>
              <p className="text-2xl font-bold text-purple-400">
                {locations.length > 1 && locations[0].timestamp && locations[locations.length - 1].timestamp
                  ? Math.floor((locations[locations.length - 1].timestamp! - locations[0].timestamp!) / (24 * 60 * 60)) + ' days'
                  : 'N/A'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Interactive Map */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full h-[500px] rounded-lg overflow-hidden border border-gray-700 shadow-2xl"
      >
        <MapContainer
          center={center}
          zoom={8}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds locations={locations} />

          {/* Draw routes */}
          {routes.map((route, index) => (
            <Polyline
              key={`route-${index}`}
              positions={route}
              pathOptions={{
                color: getRouteColor(index),
                weight: 4,
                opacity: 0.7,
                dashArray: '10, 10',
              }}
            />
          ))}

          {/* Place markers */}
          {locations.map((location, index) => (
            <Marker
              key={`marker-${index}`}
              position={[location.lat, location.lng]}
              icon={getIcon(location.type)}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">
                    {location.name}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>
                      <span className="font-semibold">Type:</span>{' '}
                      <span className="capitalize">{location.type}</span>
                    </p>
                    <p>
                      <span className="font-semibold">Date:</span>{' '}
                      {formatDate(location.timestamp || 0)}
                    </p>
                    <p>
                      <span className="font-semibold">Coordinates:</span>{' '}
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </p>
                    {location.address && (
                      <p className="break-all">
                        <span className="font-semibold">Address:</span>{' '}
                        <span className="font-mono text-xs">
                          {location.address.substring(0, 10)}...
                          {location.address.substring(location.address.length - 8)}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <p className="text-xs text-gray-600">
                      Checkpoint {index + 1} of {locations.length}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </motion.div>

      {/* Journey Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
      >
        <h4 className="font-semibold mb-3 text-sm text-gray-300">Journey Legend:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
              🌱
            </div>
            <span className="text-xs text-gray-400">Farm Origin</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
              🏭
            </div>
            <span className="text-xs text-gray-400">Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white">
              🏪
            </div>
            <span className="text-xs text-gray-400">Retail Store</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white">
              🚛
            </div>
            <span className="text-xs text-gray-400">Transit Point</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductJourneyMap;
