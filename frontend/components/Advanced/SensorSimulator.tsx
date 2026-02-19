import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { FaThermometerHalf, FaTint, FaMapMarkerAlt } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SensorReading {
  timestamp: string;
  temperature: number;
  humidity: number;
  lat: number;
  lng: number;
}

const SensorSimulator: React.FC = () => {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentReading, setCurrentReading] = useState<SensorReading | null>(null);

  const generateReading = (): SensorReading => {
    const baseTemp = 22;
    const baseHumidity = 65;
    const baseLat = 34.0522;
    const baseLng = -118.2437;

    return {
      timestamp: new Date().toLocaleTimeString(),
      temperature: baseTemp + (Math.random() - 0.5) * 4,
      humidity: baseHumidity + (Math.random() - 0.5) * 10,
      lat: baseLat + (Math.random() - 0.5) * 0.01,
      lng: baseLng + (Math.random() - 0.5) * 0.01,
    };
  };

  useEffect(() => {
    if (isSimulating) {
      const interval = setInterval(() => {
        const newReading = generateReading();
        setCurrentReading(newReading);
        setReadings((prev) => {
          const updated = [...prev, newReading];
          return updated.slice(-20); // Keep last 20 readings
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isSimulating]);

  const chartData = {
    labels: readings.map((r) => r.timestamp),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: readings.map((r) => r.temperature),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Humidity (%)',
        data: readings.map((r) => r.humidity),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e6f2ed',
        },
      },
    },
    scales: {
      y: {
        ticks: { color: '#e6f2ed' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      x: {
        ticks: { color: '#e6f2ed' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  };

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">IoT Sensor Monitor</h3>
          <p className="text-sm text-gray-400">Real-time environmental tracking</p>
        </div>
        <button
          onClick={() => setIsSimulating(!isSimulating)}
          className={`glass-button ${
            isSimulating ? 'bg-red-500/30' : 'bg-green-500/30'
          }`}
        >
          {isSimulating ? '⏸ Pause' : '▶ Start'} Simulation
        </button>
      </div>

      {/* Current Readings */}
      {currentReading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            className="p-4 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-lg"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <div className="flex items-center gap-3">
              <FaThermometerHalf className="text-3xl text-red-400" />
              <div>
                <p className="text-sm text-gray-400">Temperature</p>
                <p className="text-2xl font-bold">
                  {currentReading.temperature.toFixed(1)}°C
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <FaTint className="text-3xl text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Humidity</p>
                <p className="text-2xl font-bold">
                  {currentReading.humidity.toFixed(1)}%
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-3xl text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="text-sm font-mono">
                  {currentReading.lat.toFixed(4)}, {currentReading.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Chart */}
      {readings.length > 0 && (
        <div className="h-64 mb-4">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      {/* Status */}
      <div className="text-center text-sm text-gray-400">
        {isSimulating ? (
          <motion.div
            className="flex items-center justify-center gap-2"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
            <span>Live monitoring active • {readings.length} readings captured</span>
          </motion.div>
        ) : (
          <span>Simulation paused • Click Start to begin monitoring</span>
        )}
      </div>
    </motion.div>
  );
};

export default SensorSimulator;
