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
  const [hoveredDream, setHoveredDream] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  const handleDreamClick = (dream) => {
    if (!isAuthenticated) {
      // Show a message that they need to log in to see details
      setSelectedDream({
        ...dream,
        requiresAuth: true
      });
    } else {
      // Authenticated users can see the dream details
      setSelectedDream(dream);
    }
  };

  const handleDreamHover = (dream) => {
    setHoveredDream(dream);
  };

  const handleCloseDreamDetail = () => {
    setSelectedDream(null);
  };

  const handleViewDream = () => {
    if (selectedDream && isAuthenticated) {
      router.push(`/dreams/${selectedDream.id}`);
    } else {
      router.push(`/login?returnTo=/dreams/${selectedDream?.id}`);
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🌙</div>
            <h2 className="text-2xl font-bold text-primary-100 mb-2">Network Empty</h2>
            <p className="text-primary-300 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Return Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900">
      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-slate-900/80 backdrop-blur-sm border-b border-primary-800/30">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary-100">Public Dream Network</h1>
            <p className="text-sm text-primary-300">
              Explore {networkData?.nodes?.length || 0} connected dreams from the community
            </p>
          </div>
          <div className="flex gap-3">
            {!isAuthenticated && (
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Login to View Dreams
              </button>
            )}
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-primary-100 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

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

      {/* Hover Tooltip */}
      {hoveredDream && !selectedDream && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <div className="bg-slate-800/95 backdrop-blur-md rounded-lg shadow-2xl border border-primary-700/50 p-4 max-w-sm">
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-8 h-8 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: getEmotionColor(hoveredDream.emotion),
                  boxShadow: `0 0 15px ${getEmotionColor(hoveredDream.emotion)}60`
                }}
              />
              <h4 className="text-lg font-semibold text-primary-100 truncate">
                {hoveredDream.title}
              </h4>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="text-xs px-2 py-0.5 bg-primary-900/40 text-primary-300 rounded">
                {hoveredDream.emotion}
              </span>
              {hoveredDream.tags && hoveredDream.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-0.5 bg-slate-700/60 text-primary-200 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <p className="text-primary-300 text-sm italic">
              Click to view details
            </p>
          </div>
        </div>
      )}

      {/* Dream Detail Panel */}
      {selectedDream && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-slate-800/95 backdrop-blur-md border-t border-primary-800/30 p-6 max-h-[50vh] overflow-y-auto">
          <button
            onClick={handleCloseDreamDetail}
            className="absolute top-4 right-4 text-primary-400 hover:text-primary-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4 mb-4">
              <div 
                className="w-12 h-12 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: getEmotionColor(selectedDream.emotion),
                  boxShadow: `0 0 20px ${getEmotionColor(selectedDream.emotion)}40`
                }}
              />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-primary-100 mb-2">
                  {selectedDream.title}
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs px-2 py-1 bg-primary-900/30 text-primary-300 rounded">
                    {selectedDream.emotion}
                  </span>
                  {selectedDream.tags && selectedDream.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-slate-700 text-primary-200 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {selectedDream.requiresAuth ? (
              <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <h4 className="text-amber-100 font-semibold mb-1">Login Required</h4>
                    <p className="text-amber-200 text-sm">
                      You need to be logged in to view the full details of this dream. 
                      Create an account or sign in to explore the dream network!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-primary-200 mb-4 line-clamp-3">
                {selectedDream.description}
              </p>
            )}

            <button
              onClick={handleViewDream}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
            >
              {isAuthenticated ? 'View Full Dream' : 'Login to View Dream'}
            </button>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="absolute top-24 left-6 z-10 bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 max-w-xs">
        <h3 className="text-primary-100 font-semibold mb-2">About Public Network</h3>
        <p className="text-primary-300 text-sm mb-3">
          This is a public view of all connected dreams in the Somnio community. 
          Dreams are connected based on shared themes, emotions, and content.
        </p>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-500"></div>
            <span className="text-primary-200">Public Dreams</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <span className="text-primary-200">Connection Strength</span>
          </div>
        </div>
        {!isAuthenticated && (
          <div className="mt-4 pt-4 border-t border-primary-700/30">
            <p className="text-primary-300 text-xs">
              💡 <span className="font-semibold">Tip:</span> Login to view dream details and connect with the community!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function for emotion colors
function getEmotionColor(emotion) {
  const colors = {
    happy: '#fbbf24',
    anxious: '#f59e0b',
    peaceful: '#60a5fa',
    confused: '#c084fc',
    excited: '#fb923c',
    sad: '#94a3b8',
    curious: '#2dd4bf',
    fearful: '#f87171',
    neutral: '#a8a29e'
  };
  return colors[emotion] || colors.neutral;
}