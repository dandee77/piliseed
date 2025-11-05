import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  MapPinIcon,
  CloudIcon,
  CalendarIcon,
  TrendingUpIcon,
  AlertCircleIcon,
} from 'lucide-react';
import { API_BASE_URL } from '../config';

interface ContextAnalysis {
  location_analysis: {
    province: string;
    region: string;
    climate_type: string;
    current_season: string;
    season_end_month: number;
  };
  weather_forecast: {
    current_month_rainfall_mm: number;
    next_3months_rainfall_mm: number;
    temperature_range_c: string;
    typhoon_risk: string;
    el_nino_la_nina: string;
  };
  market_conditions: {
    high_demand_crops: string[];
    price_trends: string;
    export_opportunities: string[];
    local_market_saturation: string[];
  };
  agricultural_calendar: {
    optimal_planting_window: string;
    harvest_season_conflict: string;
    recommended_crop_cycles: string[];
  };
  risk_factors: {
    pest_disease_season: string[];
    water_availability: string;
    soil_degradation_risk: string;
  };
}

export function HistoryContextPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [contextAnalysis, setContextAnalysis] = useState<ContextAnalysis | null>(null);
  const [sensorName, setSensorName] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContextAnalysis();
  }, [sessionId]);

  const fetchContextAnalysis = async () => {
    if (!sessionId) return;

    try {
      setIsLoading(true);
      
      const url = `${API_BASE_URL}/recommendations/session/${sessionId}/context`;
      console.log('Fetching context from:', url);
      
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Response error:', response.status, errorData);
        throw new Error(errorData.detail || `Failed to fetch context analysis (${response.status})`);
      }

      const data = await response.json();
      console.log('Context data received:', data);
      
      if (data.context_analysis) {
        setContextAnalysis(data.context_analysis);
      }
      if (data.sensor_name) {
        setSensorName(data.sensor_name);
      }
      if (data.timestamp) {
        setTimestamp(data.timestamp);
      }
    } catch (err) {
      console.error('Error fetching context:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/history/${sessionId}`);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error || !contextAnalysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <AlertCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-sm text-gray-600 mb-4">{error || 'Context analysis not found'}</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-white px-5 pt-12 pb-4 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-800" />
          </motion.button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">Context Analysis</h2>
            <p className="text-sm text-gray-600">{sensorName}</p>
          </div>
          <div className="p-2 bg-amber-100 rounded-full">
            <MapPinIcon className="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </div>

      <div className="px-5 py-6 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-3xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircleIcon className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-amber-900">Historical Data</h3>
          </div>
          <p className="text-sm text-amber-800">
            This context analysis is from a past session ({formatDate(timestamp)}). 
            Current environmental conditions may have changed.
          </p>
        </motion.div>

        <div className="bg-green-600 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <CalendarIcon className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Climate: {contextAnalysis.location_analysis.climate_type}</span>
          </div>
          <h3 className="text-lg font-bold mb-2">Location Overview</h3>
          <p className="text-white/95 leading-relaxed">
            {contextAnalysis.location_analysis.current_season} season in {contextAnalysis.location_analysis.province}, {contextAnalysis.location_analysis.region}. 
            Season ends around month {contextAnalysis.location_analysis.season_end_month}.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <CloudIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Weather Forecast</h3>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 rounded-xl p-3">
                <p className="text-xs text-orange-700 mb-1">Temperature Range</p>
                <p className="text-lg font-bold text-orange-900">{contextAnalysis.weather_forecast.temperature_range_c}°C</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-blue-700 mb-1">Next 3 Months</p>
                <p className="text-lg font-bold text-blue-900">{contextAnalysis.weather_forecast.next_3months_rainfall_mm} mm</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3">
                <p className="text-xs text-purple-700 mb-1">Typhoon Risk</p>
                <p className="text-sm font-bold text-purple-900">{contextAnalysis.weather_forecast.typhoon_risk}</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-3">
                <p className="text-xs text-yellow-700 mb-1">El Niño/La Niña</p>
                <p className="text-sm font-bold text-yellow-900">{contextAnalysis.weather_forecast.el_nino_la_nina}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-lime-600 rounded"></div>
            <h3 className="text-lg font-bold text-gray-900">Risk Factors</h3>
          </div>
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm font-medium text-blue-700 mb-1">Water Availability</p>
              <p className="text-lg font-bold text-blue-900">{contextAnalysis.risk_factors.water_availability}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-600 mb-1">Soil Risk</p>
                <p className="text-sm font-semibold text-gray-900">{contextAnalysis.risk_factors.soil_degradation_risk}</p>
              </div>
              <div className={`rounded-xl p-3 ${contextAnalysis.weather_forecast.typhoon_risk === 'High' ? 'bg-red-50' : contextAnalysis.weather_forecast.typhoon_risk === 'Moderate' ? 'bg-yellow-50' : 'bg-green-50'}`}>
                <p className="text-xs text-gray-600 mb-1">Typhoon Risk</p>
                <p className={`text-sm font-semibold ${contextAnalysis.weather_forecast.typhoon_risk === 'High' ? 'text-red-700' : contextAnalysis.weather_forecast.typhoon_risk === 'Moderate' ? 'text-yellow-700' : 'text-green-700'}`}>
                  {contextAnalysis.weather_forecast.typhoon_risk}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">Agricultural Calendar</h3>
          </div>
          <div className="space-y-3">
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-sm font-medium text-green-700 mb-1">Optimal Planting Window</p>
              <p className="text-lg font-bold text-green-900">{contextAnalysis.agricultural_calendar.optimal_planting_window}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Harvest Season Conflict</p>
              <p className="text-gray-900 bg-gray-50 rounded-xl p-3">{contextAnalysis.agricultural_calendar.harvest_season_conflict}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Recommended Crop Cycles</p>
              <div className="flex flex-wrap gap-2">
                {contextAnalysis.agricultural_calendar.recommended_crop_cycles.map((cycle, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-lime-100 text-lime-800 rounded-full text-sm font-medium"
                  >
                    {cycle}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUpIcon className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Market Conditions</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">High Demand Crops</p>
              <div className="flex flex-wrap gap-2">
                {contextAnalysis.market_conditions.high_demand_crops.map((crop, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  >
                    {crop}
                  </span>
                ))}
              </div>
            </div>
            {contextAnalysis.market_conditions.export_opportunities.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Export Opportunities</p>
                <div className="flex flex-wrap gap-2">
                  {contextAnalysis.market_conditions.export_opportunities.map((opportunity, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {opportunity}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Price Trends</p>
              <p className="text-gray-900 bg-gray-50 rounded-xl p-3">{contextAnalysis.market_conditions.price_trends}</p>
            </div>
            {contextAnalysis.market_conditions.local_market_saturation.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Market Saturation (Avoid)</p>
                <div className="flex flex-wrap gap-2">
                  {contextAnalysis.market_conditions.local_market_saturation.map((crop, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                    >
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircleIcon className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-bold text-gray-900">Pest & Disease Risks</h3>
          </div>
          <div className="space-y-2">
            {contextAnalysis.risk_factors.pest_disease_season.length > 0 ? (
              contextAnalysis.risk_factors.pest_disease_season.map((pest, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-red-50 rounded-xl">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-800">{pest}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No major pest/disease risks identified</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
