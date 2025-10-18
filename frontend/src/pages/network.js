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
            vividness: dream.vividness || 5,
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
                  vividness: similarDream.vividness || 5,
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

  return (
    <ProtectedRoute>
      <div className="relative w-full h-screen overflow-hidden bg-slate-900">
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-slate-900/90 to-transparent p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Dream Network</h1>
              <p className="text-primary-300">Explore connections between your dreams and others</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Dashboard</span>
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

      {/* Dream Info Panel (appears on hover) */}
      {selectedDream && (
        <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-20 bg-white/95 backdrop-blur-lg rounded-xl border border-primary-200/50 shadow-2xl p-6 animate-fade-in">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {selectedDream.isUserDream && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                    Your Dream
                  </span>
                )}
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  getEmotionBadge(selectedDream.emotion)
                }`}>
                  {selectedDream.emotion}
                </span>
              </div>
              <h3 className="text-lg font-bold text-neutral-800 mb-1">{selectedDream.title}</h3>
              <p className="text-sm text-neutral-600 line-clamp-2">{selectedDream.description}</p>
            </div>
            <button
              onClick={() => setSelectedDream(null)}
              className="ml-2 text-neutral-400 hover:text-neutral-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {selectedDream.tags && selectedDream.tags.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {selectedDream.tags.slice(0, 5).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-md border border-primary-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
            <div className="flex items-center space-x-3 text-xs text-neutral-500">
              {selectedDream.lucidDream && <span>✨ Lucid</span>}
              {selectedDream.recurring && <span>🔄 Recurring</span>}
              <span>Vividness: {selectedDream.vividness}/10</span>
            </div>
            <button
              onClick={() => handleDreamClick(selectedDream.id)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View Details →
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-24 left-6 z-10 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 text-white">
        <h3 className="text-sm font-semibold mb-3">Legend</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary-400 shadow-lg shadow-primary-400/50"></div>
            <span>Your Dreams</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-accent-400 shadow-lg shadow-accent-400/50"></div>
            <span>Similar Dreams</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-0.5 bg-gradient-to-r from-primary-400 to-accent-400"></div>
            <span>Connection</span>
          </div>
        </div>
      </div>

      {/* Stats Overlay */}
      {networkData && (
        <div className="absolute top-24 right-6 z-10 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 text-white">
          <h3 className="text-sm font-semibold mb-3">Network Stats</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-white/70">Your Dreams:</span>
              <span className="font-medium">{networkData.nodes.filter(n => n.isUserDream).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Connections:</span>
              <span className="font-medium">{networkData.links.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Similar Dreams:</span>
              <span className="font-medium">{networkData.nodes.filter(n => !n.isUserDream).length}</span>
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
    happy: 'bg-yellow-100 text-yellow-700',      // Changed from green to yellow
    anxious: 'bg-amber-100 text-amber-700',       // Amber
    peaceful: 'bg-blue-100 text-blue-700',
    confused: 'bg-purple-100 text-purple-700',
    excited: 'bg-orange-100 text-orange-700',
    sad: 'bg-gray-100 text-gray-700',
    curious: 'bg-teal-100 text-teal-700',
    fearful: 'bg-red-100 text-red-700',
    neutral: 'bg-neutral-100 text-neutral-700'
  };
  return badges[emotion] || badges.neutral;
}
