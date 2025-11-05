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
      const response = await fetch(`${API_BASE_URL}/recommendations/session/${sessionId}/filters`);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading filtered sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
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
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="flex flex-col h-full space-y-5 px-5">
        {/* Header */}
        <div className="pt-12 pb-4 space-y-3">
          <button
            onClick={() => navigate(`/history/${sessionId}`)}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-medium">Back to Session</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <FilterIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Filtered Results</h1>
              <p className="text-sm text-gray-600">
                {filteredSessions.length} personalized {filteredSessions.length === 1 ? 'filter' : 'filters'}
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredSessions.length === 0 && (
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
        )}

        {/* Filtered Sessions List */}
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <motion.div
              key={session.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleSessionClick(session.id)}
              className="bg-white rounded-3xl shadow-md p-5 cursor-pointer hover:shadow-lg transition-shadow"
            >
              {/* Date & Crop Count */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDate(session.timestamp)}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 rounded-full">
                  <SproutIcon className="w-3.5 h-3.5 text-green-700" />
                  <span className="text-xs font-semibold text-green-700">
                    {session.crop_count} {session.crop_count === 1 ? 'crop' : 'crops'}
                  </span>
                </div>
              </div>

              {/* Farmer Preferences */}
              <div className="mb-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌾</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {session.farmer_input.crop_category}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span>💰</span>
                    <span className="text-gray-700 font-medium">
                      {formatCurrency(session.farmer_input.budget_php)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>📏</span>
                    <span className="text-gray-700 font-medium">
                      {session.farmer_input.land_size_ha} ha
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>⏰</span>
                    <span className="text-gray-700 font-medium">
                      {session.farmer_input.waiting_tolerance_days} days
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>👷</span>
                    <span className="text-gray-700 font-medium">
                      {session.farmer_input.manpower} {session.farmer_input.manpower === 1 ? 'worker' : 'workers'}
                    </span>
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
                      className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200"
                    >
                      {crop}
                    </span>
                  ))}
                  {session.crop_count > 3 && (
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
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
    </div>
  );
}
