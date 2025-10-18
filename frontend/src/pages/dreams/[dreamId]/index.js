import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/layout/Layout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import apiService from '../../../services/api';

export default function ViewDream() {
  const [dream, setDream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();
  const { dreamId } = router.query;

  const fetchDream = useCallback(async () => {
    if (!dreamId) return;
    
    try {
      setLoading(true);
      const response = await apiService.getDream(dreamId);
      setDream(response.dream);
    } catch (err) {
      console.error('Fetch dream error:', err);
      setError('Failed to load dream');
    } finally {
      setLoading(false);
    }
  }, [dreamId]);

  useEffect(() => {
    fetchDream();
  }, [fetchDream]);

  // Fetch current user on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await apiService.getCurrentUser();
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
      }
    }
    fetchUser();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'text-green-600 bg-green-50 border-green-200',
      anxious: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      peaceful: 'text-blue-600 bg-blue-50 border-blue-200',
      confused: 'text-purple-600 bg-purple-50 border-purple-200',
      excited: 'text-orange-600 bg-orange-50 border-orange-200',
      sad: 'text-gray-600 bg-gray-50 border-gray-200',
      curious: 'text-teal-600 bg-teal-50 border-teal-200',
      fearful: 'text-red-600 bg-red-50 border-red-200',
      neutral: 'text-neutral-600 bg-neutral-50 border-neutral-200'
    };
    return colors[emotion] || colors.neutral;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading dream...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !dream) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-neutral-400">🌙</span>
            </div>
            <h2 className="text-xl font-medium text-neutral-800 mb-2">Dream not found</h2>
            <p className="text-neutral-600 mb-6">{error || 'The dream you\'re looking for doesn\'t exist.'}</p>
            <button
              onClick={() => router.push('/dreams')}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              Back to Dreams
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => router.push('/dreams')} 
                className="flex items-center text-sm text-neutral-500 hover:text-primary-600 transition-colors"
              >
                ← Back to Dreams
            </button>
            {/* Only show Edit button if current user is the creator */}
            {currentUser && dream && (dream.userId === currentUser.id) && (
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/dreams/${dreamId}/edit`)}
                  className="flex items-center space-x-2 px-4 py-2 text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit</span>
                </button>
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">{dream.title}</h1>
          <div className="flex items-center space-x-4 text-neutral-600">
            <span>{formatDate(dream.date)}</span>
            {dream.vividness && (
              <span>Vividness: {dream.vividness}/10</span>
            )}
          </div>
        </div>

        {/* Dream Content */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-neutral-200/50 p-8 space-y-6">
          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">Dream Description</h2>
            <div className="prose prose-neutral max-w-none">
              <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                {dream.description}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t border-neutral-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Emotion */}
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-2">Emotion</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getEmotionColor(dream.emotion)}`}>
                  {dream.emotion ? dream.emotion.charAt(0).toUpperCase() + dream.emotion.slice(1) : 'Neutral'}
                </span>
              </div>

              {/* Tags */}
              {dream.tags && dream.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {dream.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-md border border-primary-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dream characteristics */}
            {(dream.lucidDream || dream.recurring) && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-neutral-700 mb-2">Characteristics</h3>
                <div className="flex flex-wrap gap-2">
                  {dream.lucidDream && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      ✨ Lucid Dream
                    </span>
                  )}
                  {dream.recurring && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-50 text-orange-700 border border-orange-200">
                      🔄 Recurring
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Privacy */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-neutral-700 mb-2">Privacy</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                dream.isPublic 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                {dream.isPublic ? '🌍 Public' : '🔒 Private'}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {currentUser && dream && (dream.userId === currentUser.id) ? (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => router.push(`/dreams/${dreamId}/edit`)}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Edit This Dream
            </button>
          </div>
        ) : null}
      </div>
    </Layout>
    </ProtectedRoute>
  );
}