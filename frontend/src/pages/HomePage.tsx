import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GreenhouseCard } from '../components/GreenhouseCard';
import { SearchIcon, BellIcon } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Sensor {
  sensor_id: string;
  name: string;
  location: string;
  description: string;
  image_url: string;
  current_sensors?: {
    soil_moisture_pct: number;
    temperature_c: number;
    humidity_pct: number;
    light_lux: number;
  } | null;
}

export function HomePage() {
  const navigate = useNavigate();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/sensors/locations`);
        if (!response.ok) {
          throw new Error('Failed to fetch sensors');
        }
        const data = await response.json();
        setSensors(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSensors();
  }, []);
  return <motion.div initial={{
    opacity: 0,
    x: -20
  }} animate={{
    opacity: 1,
    x: 0
  }} exit={{
    opacity: 0,
    x: 20
  }} transition={{
    duration: 0.3
  }} className="w-full min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/settings')}
            className="rounded-full"
          >
            <img 
              src="https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png" 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover border-2 border-green-200 hover:border-green-400 transition-colors" 
            />
          </motion.button>
          <div className="flex items-center gap-4">
            <button className="p-2">
              <SearchIcon className="w-5 h-5 text-gray-800" />
            </button>
            <button className="p-2">
              <BellIcon className="w-5 h-5 text-gray-800" />
            </button>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Your Sensors
        </h1>
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 whitespace-nowrap flex items-center gap-1">
            All Sensors
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 whitespace-nowrap">
            Active
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 whitespace-nowrap">
            Offline
          </button>
        </div>
      </div>
      <div className="flex-1 px-5 py-4 space-y-4 pb-32">
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400"></div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <p className="font-medium">Error loading sensors</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}
        {!loading && !error && sensors.length === 0 && (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-600">No sensors found. Add a sensor to get started.</p>
          </div>
        )}
        {!loading && !error && sensors.map(sensor => <GreenhouseCard key={sensor.sensor_id} id={sensor.sensor_id} name={sensor.name} location={sensor.location} description={sensor.description || 'No description available'} image={sensor.image_url || 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80'} temperature={sensor.current_sensors?.temperature_c || 0} humidity={sensor.current_sensors?.humidity_pct || 0} soilMoisture={sensor.current_sensors?.soil_moisture_pct || 0} />)}
      </div>
    </motion.div>;
}