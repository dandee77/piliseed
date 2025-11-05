import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, SproutIcon, MapPinIcon, FilterIcon, XIcon } from 'lucide-react';
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

export function HistoryDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterData, setFilterData] = useState({
    crop_category: 'Vegetables',
    budget_php: 50000,
    waiting_tolerance_days: 90,
    land_size_ha: 1.0,
    manpower: 3
  });

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    if (!sessionId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/recommendations/session/${sessionId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch session details');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/history');
  };

  const handleCropClick = (index: number) => {
    navigate(`/history/${sessionId}/crops/${index}`);
  };

  const handleApplyFilter = async () => {
    if (!sessionId) return;

    try {
      setIsFiltering(true);
      const response = await fetch(`${API_BASE_URL}/recommendations/session/${sessionId}/filter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          farmer: filterData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to apply filter');
      }

      const data = await response.json();
      // Navigate to the filtered results page
      navigate(`/history/filter/${data.id}`);
      setShowFilterModal(false);
    } catch (err) {
      console.error('Error applying filter:', err);
      alert('Failed to apply filter. Please try again.');
    } finally {
      setIsFiltering(false);
    }
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

  return (
    <div className="min-h-screen bg-green-50 pb-32">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="px-5 py-4 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Session Crops</h1>
            <p className="text-sm text-gray-500">
              {recommendations.length} recommendations
            </p>
          </div>
          <div className="p-3 bg-lime-100 rounded-xl">
            <SproutIcon className="w-6 h-6 text-lime-600" />
          </div>
        </div>
      </div>

      <div className="px-5 py-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
          >
            <p className="text-red-800 text-sm">{error}</p>
          </motion.div>
        )}

        {recommendations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <SproutIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Crops Found</h3>
            <p className="text-sm text-gray-600">
              This session has no crop recommendations.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/history/${sessionId}/context`)}
                className="bg-white rounded-xl shadow-lg p-3 flex flex-col items-center gap-2 border-2 border-lime-200 hover:border-lime-400 transition-colors"
              >
                <div className="p-2 bg-lime-100 rounded-lg">
                  <MapPinIcon className="w-4 h-4 text-lime-600" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-gray-900">Context</div>
                  <div className="text-[10px] text-gray-500">Analysis</div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilterModal(true)}
                className="bg-white rounded-xl shadow-lg p-3 flex flex-col items-center gap-2 border-2 border-blue-200 hover:border-blue-400 transition-colors"
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FilterIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-gray-900">Filter</div>
                  <div className="text-[10px] text-gray-500">Personalize</div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/history/${sessionId}/filters`)}
                className="bg-white rounded-xl shadow-lg p-3 flex flex-col items-center gap-2 border-2 border-purple-200 hover:border-purple-400 transition-colors"
              >
                <div className="p-2 bg-purple-100 rounded-lg">
                  <SproutIcon className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-gray-900">History</div>
                  <div className="text-[10px] text-gray-500">Results</div>
                </div>
              </motion.button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4">
              <p className="text-sm text-gray-600">
                Historical crop recommendations from this session:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
        )}
      </div>

      <AnimatePresence>
        {showFilterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center"
            onClick={() => setShowFilterModal(false)}
            style={{ maxWidth: '430px', margin: '0 auto', left: 0, right: 0 }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl w-full max-h-[90vh] flex flex-col"
            >
              <div className="bg-green-600 text-white px-5 py-4 rounded-t-3xl flex-shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-bold">Personalize Crops</h2>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-white/90">Customize your farming preferences</p>
              </div>

              <div className="overflow-y-auto flex-1 px-5 py-5 space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <SproutIcon className="w-4 h-4 text-green-600" />
                    Crop Category
                  </label>
                  <select
                    value={filterData.crop_category}
                    onChange={(e) => setFilterData({ ...filterData, crop_category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-green-500 transition-colors bg-white text-gray-900 text-sm"
                  >
                    <option value="Vegetables">🥬 Vegetables</option>
                    <option value="Fruits">🍎 Fruits</option>
                    <option value="Cereals">🌾 Cereals</option>
                    <option value="Legumes">🫘 Legumes</option>
                    <option value="Cash Crops">💰 Cash Crops</option>
                    <option value="Fodder">🌿 Fodder</option>
                    <option value="Herbs">🌱 Herbs</option>
                    <option value="Ornamentals">🌸 Ornamentals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    💵 Budget
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">₱</span>
                    <input
                      type="number"
                      value={filterData.budget_php}
                      onChange={(e) => setFilterData({ ...filterData, budget_php: Number(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-green-500 transition-colors text-sm"
                      min="1000"
                      step="1000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">Total investment in Philippine Pesos</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ⏱️ Waiting Tolerance
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={filterData.waiting_tolerance_days}
                      onChange={(e) => setFilterData({ ...filterData, waiting_tolerance_days: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-green-500 transition-colors text-sm"
                      min="30"
                      max="365"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">days</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">How long until harvest?</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📏 Land Size
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={filterData.land_size_ha}
                      onChange={(e) => setFilterData({ ...filterData, land_size_ha: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-green-500 transition-colors text-sm"
                      min="0.1"
                      step="0.1"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">hectares</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">Total farmland available</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    👥 Available Manpower
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={filterData.manpower}
                      onChange={(e) => setFilterData({ ...filterData, manpower: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-green-500 transition-colors text-sm"
                      min="1"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">workers</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">Number of farm workers</p>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleApplyFilter}
                  disabled={isFiltering}
                  className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFiltering ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Filtering...
                    </>
                  ) : (
                    <>
                      <FilterIcon className="w-4 h-4" />
                      Apply Filters
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
