import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Layout from '../components/layout/Layout';
import apiService from '../services/api';

// Dynamically import the 3D component to avoid SSR issues
const DreamNetwork3D = dynamic(() => import('../components/network/DreamNetwork3D'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-400 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-primary-200 text-lg">Loading Public Dream Network...</p>
      </div>
    </div>
  )
});

export default function Explore() {
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDream, setSelectedDream] = useState(null);
  const [pinnedDream, setPinnedDream] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    setIsAuthenticated(apiService.isAuthenticated());
  }, []);

  useEffect(() => {
    async function fetchPublicNetwork() {
      try {
        setLoading(true);
        setError('');

        // Fetch the public network data
        const response = await apiService.getPublicNetwork();
        
        if (response.nodes && response.nodes.length > 0) {
          setNetworkData({
            nodes: response.nodes.map(node => ({
              ...node,
              isUserDream: false // All dreams in explore are from others
            })),
            links: response.links
          });
        } else {
          setError('No public dream connections found yet. Check back later!');
        }
      } catch (err) {
        console.error('Error fetching public network:', err);
        setError('Failed to load public dream network. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchPublicNetwork();
  }, []);

  const handleDreamHover = (dream) => {
    // Only update hover if nothing is pinned
    if (!pinnedDream) {
      setSelectedDream(dream);
    }
  };

  const handleDreamClick = (dreamId) => {
    const dream = networkData?.nodes.find(n => n.id === dreamId);
    if (dream) {
      setPinnedDream(dream);
      setSelectedDream(dream);
    }
  };

  const handleCloseDreamDetail = () => {
    setPinnedDream(null);
    setSelectedDream(null);
  };

  const handleViewDream = (dreamId) => {
    if (isAuthenticated) {
      router.push(`/dreams/${dreamId}`);
    } else {
      router.push(`/login?returnTo=/dreams/${dreamId}`);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-400 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary-200 text-lg">Loading Public Dream Network...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🌙</div>
            <h2 className="text-2xl font-bold text-primary-100 mb-2">Network Empty</h2>
            <p className="text-primary-300 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              Return Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const displayDream = pinnedDream || selectedDream;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900">
      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-white/10">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl md:text-2xl font-bold text-white">Public Dream Network</h1>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all group"
              title="About this network"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 text-primary-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {!isAuthenticated && (
              <button
                onClick={() => router.push('/login')}
                className="hidden md:flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Login
              </button>
            )}
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden md:inline text-sm">Home</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Modal/Dropdown */}
      {showInfo && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setShowInfo(false)}
          />
          
          {/* Info Panel */}
          <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[600px] z-50 bg-slate-800/98 backdrop-blur-lg rounded-xl border border-primary-700/50 shadow-2xl animate-slide-down">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">About Public Network</h2>
                  <p className="text-sm text-primary-300">
                    {networkData?.nodes?.length || 0} connected dreams • {networkData?.links?.length || 0} connections
                  </p>
                </div>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-1.5 text-primary-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-primary-300 mb-2">What is this?</h3>
                  <p className="text-sm text-primary-200 leading-relaxed">
                    Explore connected dreams from the Somnio community. Dreams are connected based on shared themes, emotions, and content through advanced NLP analysis.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-700/40 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-accent-400 shadow-lg shadow-accent-400/50"></div>
                      <h4 className="text-sm font-semibold text-white">Community Dreams</h4>
                    </div>
                    <p className="text-xs text-primary-300">
                      Public dreams shared by community members
                    </p>
                  </div>

                  <div className="bg-slate-700/40 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-0.5 bg-gradient-to-r from-accent-400 to-primary-400"></div>
                      <h4 className="text-sm font-semibold text-white">Connections</h4>
                    </div>
                    <p className="text-xs text-primary-300">
                      Links between dreams with similar themes
                    </p>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="bg-primary-900/30 border border-primary-700/50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <h4 className="text-sm font-semibold text-primary-200 mb-1">Login to Unlock More</h4>
                        <p className="text-xs text-primary-300 mb-3">
                          Sign in to view full dream details, connect with dreamers, and add your own dreams to the network.
                        </p>
                        <button
                          onClick={() => router.push('/login')}
                          className="text-xs bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                        >
                          Login Now
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-700">
                  <p className="text-xs text-primary-400 text-center">
                    Click or tap on any dream node to view its details
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile hint */}
      {!displayDream && !showInfo && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10 md:hidden">
          <div className="bg-white/10 backdrop-blur-md rounded-full border border-white/20 px-4 py-2 text-white text-xs animate-pulse">
            Tap a dream to view details
          </div>
        </div>
      )}

      {/* Network Visualization */}
      <div className="h-full w-full">
        {networkData && (
          <DreamNetwork3D
            networkData={networkData}
            onDreamClick={handleDreamClick}
            onDreamHover={handleDreamHover}
            selectedDream={selectedDream}
          />
        )}
      </div>

      {/* Dream Detail Panel */}
      {displayDream && (
        <div className="absolute bottom-0 left-0 right-0 md:bottom-6 md:left-auto md:right-6 md:w-[420px] z-30 animate-fade-in">
          {!isAuthenticated ? (
            // Not logged in - dark themed card
            <div className="bg-slate-800/98 backdrop-blur-lg md:rounded-xl border-t md:border border-primary-700/50 shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-700/80 to-slate-800/80 px-4 md:px-6 py-4 border-b border-primary-700/30 md:rounded-t-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${
                        getEmotionBadgeDark(displayDream.emotion)
                      }`}>
                        {displayDream.emotion}
                      </span>
                      <span className="px-2.5 py-1 bg-primary-900/40 text-primary-300 text-xs font-semibold rounded-full">
                        Public Dream
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white leading-tight">{displayDream.title}</h3>
                  </div>
                  <button
                    onClick={handleCloseDreamDetail}
                    className="ml-3 p-1.5 text-primary-400 hover:text-primary-300 hover:bg-slate-700/50 rounded-lg transition-all flex-shrink-0"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 md:px-6 py-4 max-h-[60vh] md:max-h-[400px] overflow-y-auto">
                {/* Description */}
                <div className="mb-4">
                  <p className="text-sm md:text-base text-primary-200 leading-relaxed">{displayDream.description}</p>
                </div>

                {/* Tags */}
                {displayDream.tags && displayDream.tags.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">Themes</h4>
                    <div className="flex flex-wrap gap-2">
                      {displayDream.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-slate-700/60 text-primary-200 text-xs font-medium rounded-lg border border-slate-600 shadow-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attributes Grid */}
                <div className="mb-4 grid grid-cols-2 gap-3">
                  {displayDream.vividness && (
                    <div className="bg-slate-700/40 p-3 rounded-lg border border-slate-600">
                      <div className="text-xs text-primary-400 mb-1">Vividness</div>
                      <div className="flex items-center space-x-1">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-2 rounded-full ${
                              i < displayDream.vividness
                                ? 'bg-primary-400'
                                : 'bg-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="bg-slate-700/40 p-3 rounded-lg border border-slate-600">
                    <div className="text-xs text-primary-400 mb-1">Type</div>
                    <div className="flex items-center space-x-2 text-xs font-medium text-primary-200">
                      {displayDream.lucidDream && <span className="flex items-center">✨ Lucid</span>}
                      {displayDream.recurring && <span className="flex items-center">🔄 Recurring</span>}
                      {!displayDream.lucidDream && !displayDream.recurring && <span>Regular</span>}
                    </div>
                  </div>
                </div>

                {/* Date */}
                {displayDream.date && (
                  <div className="text-xs text-primary-400 mb-4">
                    <span className="inline-flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(displayDream.date).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                )}

                {/* Login prompt */}
                <div className="bg-primary-900/30 border border-primary-700/50 rounded-lg p-3 mb-4">
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">🔒</span>
                    <div>
                      <p className="text-xs text-primary-200 font-medium mb-1">Login Required</p>
                      <p className="text-xs text-primary-300">Sign in to view full dream details and connect with dreamers</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 md:px-6 py-4 bg-slate-700/40 border-t border-slate-600 md:rounded-b-xl">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>Login to View Full Dream</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            // Logged in - light themed card (matching network.js)
            <div className="bg-white/98 backdrop-blur-lg md:rounded-xl border-t md:border border-primary-200/50 shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-50 to-accent-50 px-4 md:px-6 py-4 border-b border-primary-200/50 md:rounded-t-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${
                        getEmotionBadge(displayDream.emotion)
                      }`}>
                        {displayDream.emotion}
                      </span>
                      <span className="px-2.5 py-1 bg-accent-500 text-white text-xs font-semibold rounded-full shadow-sm">
                        Community Dream
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-neutral-800 leading-tight">{displayDream.title}</h3>
                  </div>
                  <button
                    onClick={handleCloseDreamDetail}
                    className="ml-3 p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-white/50 rounded-lg transition-all flex-shrink-0"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 md:px-6 py-4 max-h-[60vh] md:max-h-[400px] overflow-y-auto">
                {/* Description */}
                <div className="mb-4">
                  <p className="text-sm md:text-base text-neutral-700 leading-relaxed">{displayDream.description}</p>
                </div>

                {/* Tags */}
                {displayDream.tags && displayDream.tags.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Themes</h4>
                    <div className="flex flex-wrap gap-2">
                      {displayDream.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-gradient-to-br from-primary-50 to-accent-50 text-primary-700 text-xs font-medium rounded-lg border border-primary-200 shadow-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attributes Grid */}
                <div className="mb-4 grid grid-cols-2 gap-3">
                  {displayDream.vividness && (
                    <div className="bg-gradient-to-br from-primary-50 to-white p-3 rounded-lg border border-primary-100">
                      <div className="text-xs text-neutral-500 mb-1">Vividness</div>
                      <div className="flex items-center space-x-1">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-2 rounded-full ${
                              i < displayDream.vividness
                                ? 'bg-primary-500'
                                : 'bg-neutral-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="bg-gradient-to-br from-accent-50 to-white p-3 rounded-lg border border-accent-100">
                    <div className="text-xs text-neutral-500 mb-1">Type</div>
                    <div className="flex items-center space-x-2 text-xs font-medium text-neutral-700">
                      {displayDream.lucidDream && <span className="flex items-center">✨ Lucid</span>}
                      {displayDream.recurring && <span className="flex items-center">🔄 Recurring</span>}
                      {!displayDream.lucidDream && !displayDream.recurring && <span>Regular</span>}
                    </div>
                  </div>
                </div>

                {/* Date */}
                {displayDream.date && (
                  <div className="text-xs text-neutral-500 mb-4">
                    <span className="inline-flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(displayDream.date).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 md:px-6 py-4 bg-gradient-to-r from-primary-50/50 to-accent-50/50 border-t border-primary-200/50 md:rounded-b-xl">
                <button
                  onClick={() => handleViewDream(displayDream.id)}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>View Full Dream</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Panel - Hidden on mobile when dream is selected and when info is open */}
      {networkData && (
        <div className={`absolute top-20 md:top-24 right-4 md:right-6 z-10 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-3 md:p-4 text-white transition-opacity ${displayDream || showInfo ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <h3 className="text-sm font-semibold mb-2 md:mb-3">Network Stats</h3>
          <div className="space-y-1.5 md:space-y-2 text-xs">
            <div className="flex justify-between space-x-4">
              <span className="text-white/70">Total Dreams:</span>
              <span className="font-bold">{networkData.nodes.length}</span>
            </div>
            <div className="flex justify-between space-x-4">
              <span className="text-white/70">Connections:</span>
              <span className="font-bold">{networkData.links.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function for emotion badges (light theme - logged in)
function getEmotionBadge(emotion) {
  const badges = {
    happy: 'bg-yellow-400 text-yellow-900',
    anxious: 'bg-amber-400 text-amber-900',
    peaceful: 'bg-blue-400 text-blue-900',
    confused: 'bg-purple-400 text-purple-900',
    excited: 'bg-orange-400 text-orange-900',
    sad: 'bg-gray-400 text-gray-900',
    curious: 'bg-teal-400 text-teal-900',
    fearful: 'bg-red-400 text-red-900',
    neutral: 'bg-neutral-400 text-neutral-900'
  };
  return badges[emotion] || badges.neutral;
}

// Helper function for emotion badges (dark theme - not logged in)
function getEmotionBadgeDark(emotion) {
  const badges = {
    happy: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    anxious: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    peaceful: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    confused: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    excited: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    sad: 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
    curious: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
    fearful: 'bg-red-500/20 text-red-300 border border-red-500/30',
    neutral: 'bg-neutral-500/20 text-neutral-300 border border-neutral-500/30'
  };
  return badges[emotion] || badges.neutral;
}