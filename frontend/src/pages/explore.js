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
    // Set both hover and selected for click (keeps tooltip visible)
    setHoveredDream(dream);
    setSelectedDream(dream);
  };

  const handleDreamHover = (dream) => {
    // Only update hover if nothing is clicked/selected
    if (!selectedDream) {
      setHoveredDream(dream);
    }
  };

  const handleCloseDreamDetail = () => {
    setSelectedDream(null);
    setHoveredDream(null);
  };

  const handleViewDream = (dreamId) => {
    // Always go to the dream detail page with the dream ID
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

      {/* Hover/Click Tooltip - stays visible for both hover and click */}
      {hoveredDream && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-30 animate-fade-in">
          <div className="bg-slate-800/95 backdrop-blur-md rounded-lg shadow-2xl border border-primary-700/50 p-5 relative">
            <button
              onClick={handleCloseDreamDetail}
              className="absolute top-3 right-3 text-primary-400 hover:text-primary-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-10 h-10 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: getEmotionColor(hoveredDream.emotion),
                  boxShadow: `0 0 15px ${getEmotionColor(hoveredDream.emotion)}60`
                }}
              />
              <div className="flex-1 min-w-0 pr-6">
                <h4 className="text-lg font-semibold text-primary-100 truncate">
                  {hoveredDream.title}
                </h4>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="text-xs px-2 py-1 bg-primary-900/40 text-primary-300 rounded">
                {hoveredDream.emotion}
              </span>
              {hoveredDream.tags && hoveredDream.tags.slice(0, 4).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 bg-slate-700/60 text-primary-200 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <p className="text-primary-200 text-sm mb-4 line-clamp-2">
              {hoveredDream.description}
            </p>

            <button
              onClick={() => handleViewDream(hoveredDream.id)}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
            >
              {isAuthenticated ? 'View Full Dream' : 'Login to View'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
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