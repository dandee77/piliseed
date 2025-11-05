import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, SproutIcon } from 'lucide-react';
import { CropCard } from '../components/CropCard';
import { API_BASE_URL } from '../config';

interface CropRecommendation {
  crop: string;
  searchable_name?: string;
  image_url?: string;
  scientific_name: string;
  category: string;
  planted?: boolean;
  scores: {
    overall_score: number;
    confidence_pct: number;
    env_score: number;
    econ_score: number;
    time_fit_score: number;
    season_score: number;
    labor_score: number;
    risk_score: number;
    market_score: number;
  };
  growth_requirements: any;
  tolerances: any;
  management: any;
  economics: any;
  market_strategy: any;
  planting_schedule: any;
  risk_assessment: any;
  reasoning: string;
}

interface FarmerInput {
  crop_category: string;
  budget_php: number;
  waiting_tolerance_days: number;
  land_size_ha: number;
  manpower: number;
}

export function FilterDetailPage() {
  const { filterId } = useParams<{ filterId: string }>();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [filterExplanation, setFilterExplanation] = useState('');
  const [farmerInput, setFarmerInput] = useState<FarmerInput | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFilterDetails();
  }, [filterId]);

  const fetchFilterDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/filter/${filterId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch filter details');
      }
      const data = await response.json();
      setRecommendations(data.recommendations);
      setFilterExplanation(data.filter_explanation);
      setFarmerInput(data.farmer_input);
      setSessionId(data.session_id);
      setTimestamp(data.timestamp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCropClick = (index: number) => {
    navigate(`/history/filter/${filterId}/crop/${index}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 pb-32">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="px-5 py-4 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(`/history/${sessionId}/filters`)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Filtered Crops</h1>
            <p className="text-sm text-gray-500">{formatDate(timestamp)}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-xl">
            <SproutIcon className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-5">
        {/* Filter Explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl mt-0.5">💡</div>
            <div>
              <h3 className="text-sm font-bold text-blue-900 mb-1">Why These Crops?</h3>
              <p className="text-xs text-blue-800 leading-relaxed">
                {filterExplanation}
              </p>
            </div>
          </div>
        </div>

        {/* Farmer Preferences Card */}
        {farmerInput && (
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>🎯</span>
              Your Preferences
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-lime-50 rounded-xl p-3 border border-lime-100">
                <div className="text-xs text-lime-700 mb-1">Category</div>
                <div className="text-sm font-bold text-lime-900 flex items-center gap-1.5">
                  <span>🌾</span>
                  {farmerInput.crop_category}
                </div>
              </div>
              <div className="bg-lime-50 rounded-xl p-3 border border-lime-100">
                <div className="text-xs text-lime-700 mb-1">Budget</div>
                <div className="text-sm font-bold text-lime-900">
                  {formatCurrency(farmerInput.budget_php)}
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <div className="text-xs text-blue-700 mb-1">Land Size</div>
                <div className="text-sm font-bold text-blue-900">
                  {farmerInput.land_size_ha} hectares
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <div className="text-xs text-blue-700 mb-1">Wait Time</div>
                <div className="text-sm font-bold text-blue-900">
                  {farmerInput.waiting_tolerance_days} days
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-3 border border-green-100 col-span-2">
                <div className="text-xs text-green-700 mb-1">Available Workers</div>
                <div className="text-sm font-bold text-green-900 flex items-center gap-1.5">
                  <span>👷</span>
                  {farmerInput.manpower} {farmerInput.manpower === 1 ? 'worker' : 'workers'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Crops Info */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <p className="text-sm text-gray-600">
            <span className="font-bold text-green-600">{recommendations.length}</span> {recommendations.length === 1 ? 'crop' : 'crops'} matched your criteria:
          </p>
        </div>

        {/* Crops Grid */}
        <div className="grid grid-cols-2 gap-4 pb-5">
          {recommendations.map((crop, index) => (
            <CropCard
              key={index}
              crop={crop.crop}
              category={crop.category}
              overallScore={crop.scores.overall_score}
              imageUrl={crop.image_url}
              planted={crop.planted}
              onClick={() => handleCropClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
