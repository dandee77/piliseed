import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, FilterIcon, CalendarIcon, SproutIcon } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface FilteredSession {
  id: string;
  timestamp: string;
  filter_explanation: string;
  farmer_input: {
    crop_category: string;
    budget_php: number;
    waiting_tolerance_days: number;
    land_size_ha: number;
    manpower: number;
  };
  crop_count: number;
  crops: string[];
}

export function FilteredSessionsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [filteredSessions, setFilteredSessions] = useState<FilteredSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFilteredSessions();
  }, [sessionId]);

  const fetchFilteredSessions = async () => {
    try {
      const userUid = localStorage.getItem('piliseed_user_uid');
      const url = new URL(`${API_BASE_URL}/recommendations/session/${sessionId}/filters`);
      if (userUid) {
        url.searchParams.append('user_uid', userUid);
      }
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch filtered sessions');
      }
      const data = await response.json();
      setFilteredSessions(data.filtered_sessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionClick = (filterId: string) => {
    navigate(`/history/filter/${filterId}`);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(value);
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
            onClick={() => navigate(`/history/${sessionId}`)}
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
            onClick={() => navigate(`/history/${sessionId}`)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Filtered Results</h1>
            <p className="text-sm text-gray-500">
              {filteredSessions.length} personalized {filteredSessions.length === 1 ? 'filter' : 'filters'}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-xl">
            <FilterIcon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredSessions.length === 0 && (
        <div className="px-5 pt-5">
          <div className="bg-white rounded-3xl shadow-md p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FilterIcon className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Filters Yet</h3>
            <p className="text-sm text-gray-600 mb-6">
              You haven't created any personalized filters for this session.
            </p>
            <button
              onClick={() => navigate(`/history/${sessionId}`)}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
            >
              Create First Filter
            </button>
          </div>
        </div>
      )}

      {/* Filtered Sessions List */}
      <div className="px-5 pt-5 space-y-4">
          {filteredSessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSessionClick(session.id)}
              className="bg-white rounded-2xl shadow-lg p-5 cursor-pointer"
            >
              {/* Date & Crop Count */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDate(session.timestamp)}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 rounded-full">
                  <SproutIcon className="w-3.5 h-3.5 text-blue-700" />
                  <span className="text-xs font-semibold text-blue-700">
                    {session.crop_count} {session.crop_count === 1 ? 'crop' : 'crops'}
                  </span>
                </div>
              </div>

              {/* Farmer Preferences */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-lime-100 rounded-lg">
                    <span className="text-base">🌾</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {session.farmer_input.crop_category}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-lime-50 p-2 rounded-lg border border-lime-100">
                    <div className="text-xs text-lime-700 mb-0.5">Budget</div>
                    <div className="text-xs font-bold text-lime-900">
                      {formatCurrency(session.farmer_input.budget_php)}
                    </div>
                  </div>
                  <div className="bg-lime-50 p-2 rounded-lg border border-lime-100">
                    <div className="text-xs text-lime-700 mb-0.5">Land Size</div>
                    <div className="text-xs font-bold text-lime-900">
                      {session.farmer_input.land_size_ha} ha
                    </div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                    <div className="text-xs text-blue-700 mb-0.5">Wait Time</div>
                    <div className="text-xs font-bold text-blue-900">
                      {session.farmer_input.waiting_tolerance_days}d
                    </div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                    <div className="text-xs text-blue-700 mb-0.5">Workers</div>
                    <div className="text-xs font-bold text-blue-900">
                      {session.farmer_input.manpower}
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Crops Preview */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 mb-1.5">Selected Crops:</p>
                <div className="flex flex-wrap gap-1.5">
                  {session.crops.map((crop, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200 font-medium"
                    >
                      {crop}
                    </span>
                  ))}
                  {session.crop_count > 3 && (
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                      +{session.crop_count - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Filter Explanation */}
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600 italic line-clamp-2">
                  {session.filter_explanation}
                </p>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
}
