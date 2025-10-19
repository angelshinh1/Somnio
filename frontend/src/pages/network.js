import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import apiService from '../services/api';

// Dynamically import the 3D component to avoid SSR issues
const DreamNetwork3D = dynamic(() => import('../components/network/DreamNetwork3D'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-400 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-primary-200 text-lg">Initializing Dream Network...</p>
      </div>
    </div>
  )
});

export default function Network() {
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDream, setSelectedDream] = useState(null);
  const [pinnedDream, setPinnedDream] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchNetworkData() {
      try {
        setLoading(true);

        // Check if user is authenticated
        if (!apiService.isAuthenticated()) {
          router.push('/login?returnTo=/network');
          return;
        }

        // Get current user
        const user = await apiService.getCurrentUser();
        setCurrentUser(user);

        // Fetch user's dreams
        const userDreamsResponse = await apiService.getUserDreams(user.id);
        const userDreams = userDreamsResponse.dreams || [];

        // Fetch all public dreams to find similar ones
        const publicDreamsResponse = await apiService.getPublicDreams();
        const publicDreams = publicDreamsResponse.dreams || [];

        // For demo purposes, simulate similarity relationships
        // In production, this would come from the NLP service
        const nodes = [];
        const links = [];

        // Add user's dreams as nodes
        userDreams.forEach((dream, index) => {
          nodes.push({
            id: dream.id,
            title: dream.title,
            description: dream.description,
            emotion: dream.emotion || 'neutral',
            tags: dream.tags || [],
            date: dream.date,
            isUserDream: true,
            vividness: dream.vividness !== undefined && dream.vividness !== null ? dream.vividness : 5,
            lucidDream: dream.lucidDream || false,
            recurring: dream.recurring || false
          });

          // Find similar dreams from public dreams
          publicDreams
            .filter(pd => pd.id !== dream.id && !userDreams.find(ud => ud.id === pd.id))
            .slice(0, 3 + Math.floor(Math.random() * 3)) // Random 3-5 connections
            .forEach(similarDream => {
              // Add similar dream as node if not already added
              if (!nodes.find(n => n.id === similarDream.id)) {
                nodes.push({
                  id: similarDream.id,
                  title: similarDream.title,
                  description: similarDream.description,
                  emotion: similarDream.emotion || 'neutral',
                  tags: similarDream.tags || [],
                  date: similarDream.date,
                  isUserDream: false,
                  vividness: similarDream.vividness !== undefined && similarDream.vividness !== null ? similarDream.vividness : 5,
                  lucidDream: similarDream.lucidDream || false,
                  recurring: similarDream.recurring || false
                });
              }

              // Add link
              links.push({
                source: dream.id,
                target: similarDream.id,
                similarity: 0.7 + Math.random() * 0.3, // Simulate similarity score
                sharedThemes: findSharedThemes(dream.tags || [], similarDream.tags || [])
              });
            });
        });

        setNetworkData({ nodes, links });
      } catch (err) {
        console.error('Error fetching network data:', err);
        setError('Failed to load dream network. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchNetworkData();
  }, [router]);

  const findSharedThemes = (tags1, tags2) => {
    return tags1.filter(tag => tags2.includes(tag));
  };

  const handleDreamSelect = (dream) => {
    setSelectedDream(dream);
  };

  const handleDreamClick = (dreamId) => {
    const dream = networkData?.nodes.find(n => n.id === dreamId);
    if (dream) {
      setPinnedDream(dream);
    }
  };

  const handleViewDetails = (dreamId) => {
    router.push(`/dreams/${dreamId}`);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-400 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary-200 text-lg">Loading Dream Network...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-red-400">⚠️</span>
            </div>
            <h2 className="text-xl font-medium text-neutral-800 mb-2">Network Error</h2>
            <p className="text-neutral-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const displayDream = pinnedDream || selectedDream;

  return (
    <ProtectedRoute>
      <div className="relative w-full h-screen overflow-hidden bg-slate-900">
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-slate-900/90 to-transparent p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Dream Network</h1>
              <p className="text-sm md:text-base text-primary-300 hidden md:block">Explore connections between your dreams and others</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all text-sm md:text-base"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden md:inline">Dashboard</span>
            </button>
          </div>
        </div>
        
        {/* 3D Network Visualization */}
        <Suspense fallback={
          <div className="h-screen flex items-center justify-center bg-slate-900">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-400 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-primary-200 text-lg">Rendering Dream Network...</p>
            </div>
          </div>
        }>
          <DreamNetwork3D
            networkData={networkData}
            onDreamHover={handleDreamSelect}
            onDreamClick={handleDreamClick}
            currentUser={currentUser}
          />
        </Suspense>

        {/* Dream Info Panel - Persistent on mobile when clicked, hover on desktop */}
        {displayDream && (
          <div className="absolute bottom-0 left-0 right-0 md:bottom-6 md:left-auto md:right-6 md:w-[420px] z-20 bg-white/98 backdrop-blur-lg md:rounded-xl border-t md:border border-primary-200/50 shadow-2xl animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 px-4 md:px-6 py-4 border-b border-primary-200/50 md:rounded-t-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
                    {displayDream.isUserDream && (
                      <span className="px-2.5 py-1 bg-primary-500 text-white text-xs font-semibold rounded-full shadow-sm">
                        Your Dream
                      </span>
                    )}
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${
                      getEmotionBadge(displayDream.emotion)
                    }`}>
                      {displayDream.emotion}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-neutral-800 leading-tight">{displayDream.title}</h3>
                </div>
                <button
                  onClick={() => {
                    setPinnedDream(null);
                    setSelectedDream(null);
                  }}
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
                <div className="bg-gradient-to-br from-primary-50 to-white p-3 rounded-lg border border-primary-100">
                  <div className="text-xs text-neutral-500 mb-1">Vividness</div>
                  <div className="flex items-center space-x-1">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-2 rounded-full ${
                          i < Math.min(Math.max(displayDream.vividness || 0, 0), 10)
                            ? 'bg-primary-500'
                            : 'bg-neutral-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
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

            {/* Footer with action button */}
            <div className="px-4 md:px-6 py-4 bg-gradient-to-r from-primary-50/50 to-accent-50/50 border-t border-primary-200/50 md:rounded-b-xl">
              <button
                onClick={() => handleViewDetails(displayDream.id)}
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

        {/* Legend - Hidden on mobile when dream is selected */}
        <div className={`absolute top-20 md:top-24 left-4 md:left-6 z-10 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-3 md:p-4 text-white transition-opacity ${displayDream ? 'opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto' : 'opacity-100'}`}>
          <h3 className="text-xs md:text-sm font-semibold mb-2 md:mb-3">Information</h3>
          <div className="space-y-1.5 md:space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-primary-400 shadow-lg shadow-primary-400/50"></div>
              <span>Your Dreams</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-0.5 bg-gradient-to-r from-primary-400 to-yellow-400"></div>
              <span>Connection</span>
            </div>
          </div>
        </div>

        {/* Stats Overlay - Hidden on mobile when dream is selected */}
        {networkData && (
          <div className={`absolute top-20 md:top-24 right-4 md:right-6 z-10 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-3 md:p-4 text-white transition-opacity ${displayDream ? 'opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto' : 'opacity-100'}`}>
            <h3 className="text-xs md:text-sm font-semibold mb-2 md:mb-3">Network Stats</h3>
            <div className="space-y-1.5 md:space-y-2 text-xs">
              <div className="flex justify-between space-x-4">
                <span className="text-white/70">Your Dreams:</span>
                <span className="font-bold">{networkData.nodes.filter(n => n.isUserDream).length}</span>
              </div>
              <div className="flex justify-between space-x-4">
                <span className="text-white/70">Connections:</span>
                <span className="font-bold">{networkData.links.length}</span>
              </div>
              <div className="flex justify-between space-x-4">
                <span className="text-white/70">Similar Dreams:</span>
                <span className="font-bold">{networkData.nodes.filter(n => !n.isUserDream).length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

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