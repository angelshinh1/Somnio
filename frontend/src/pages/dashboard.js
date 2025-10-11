import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';
import DreamCard from '../components/dreams/DreamCard';
import apiService from '../services/api';

export default function Dashboard() {
  const [userDreams, setUserDreams] = useState([]);
  const [publicDreams, setPublicDreams] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!apiService.isAuthenticated()) {
        router.push('/login?returnTo=/dashboard');
        return;
      }

      // Get current user first
      const user = await apiService.getCurrentUser();
      setCurrentUser(user);
      
      // Fetch user's dreams, public dreams, and stats in parallel
      const [userDreamsResponse, publicDreamsResponse, statsResponse] = await Promise.all([
        apiService.getUserDreams(user.id),
        apiService.getPublicDreams(),
        apiService.getUserStats(user.id)
      ]);
      
      // Set user's dreams
      setUserDreams(userDreamsResponse.dreams || []);
      
      // Filter public dreams to exclude user's own dreams
      const otherDreams = (publicDreamsResponse.dreams || []).filter(
        dream => dream.userId !== user.id
      );
      setPublicDreams(otherDreams);
      
      setStats(statsResponse.stats || {});
      setError('');
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
      
      // If unauthorized, redirect to login
      if (err.message.includes('Not authenticated') || 
          err.message.includes('401') || 
          err.message.includes('unauthorized')) {
        router.push('/login?returnTo=/dashboard');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDeleteDream = async (dreamId) => {
    if (!confirm('Are you sure you want to delete this dream?')) return;
    
    try {
      await apiService.deleteDream(dreamId);
      setUserDreams(userDreams.filter(dream => dream.id !== dreamId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalDreams: Math.max(0, (prev.totalDreams || 0) - 1)
      }));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete dream');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading your dreams...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">
            Welcome back{currentUser?.username ? `, ${currentUser.username}` : ''}!
          </h1>
          <p className="text-neutral-600">Track, analyze, and explore your dream patterns</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-neutral-200/50">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <span className="text-2xl">🌙</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Total Dreams</p>
                <p className="text-2xl font-bold text-neutral-800">{stats.totalDreams || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-neutral-200/50">
            <div className="flex items-center">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <span className="text-2xl">✨</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Lucid Dreams</p>
                <p className="text-2xl font-bold text-neutral-800">{stats.lucidDreams || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-neutral-200/50">
            <div className="flex items-center">
              <div className="p-2 bg-accent-100 rounded-lg">
                <span className="text-2xl">🔄</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Recurring</p>
                <p className="text-2xl font-bold text-neutral-800">{stats.recurringDreams || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-neutral-200/50">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🌍</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Public Dreams</p>
                <p className="text-2xl font-bold text-neutral-800">{stats.publicDreams || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push('/dreams/new')}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <span>+</span>
              <span>Add Dream</span>
            </button>
            <button
              onClick={() => router.push('/dreams')}
              className="bg-white/70 backdrop-blur-sm border border-neutral-200 hover:border-neutral-300 text-neutral-700 px-6 py-2 rounded-lg font-medium transition-all duration-200"
            >
              View All Dreams
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => router.push('/dreams/search')}
              className="p-2 text-neutral-500 hover:text-neutral-700 transition-colors"
              title="Search dreams"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button 
              onClick={() => router.push('/insights')}
              className="p-2 text-neutral-500 hover:text-neutral-700 transition-colors"
              title="View insights"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* My Recent Dreams */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-800">My Recent Dreams</h2>
            {userDreams.length > 0 && (
              <button
                onClick={() => router.push('/dreams')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all →
              </button>
            )}
          </div>
          
          {userDreams.length === 0 ? (
            <div className="text-center py-12 bg-white/70 backdrop-blur-sm rounded-xl border border-neutral-200/50">
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-neutral-400">🌙</span>
              </div>
              <h3 className="text-lg font-medium text-neutral-800 mb-2">No dreams yet</h3>
              <p className="text-neutral-600 mb-6">Start your dream journey by recording your first dream</p>
              <button
                onClick={() => router.push('/dreams/new')}
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
              >
                Record Your First Dream
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userDreams.slice(0, 6).map((dream) => (
                <div key={dream.id} className="relative group">
                  <DreamCard dream={dream} showActions={false} />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => router.push(`/dreams/${dream.id}`)}
                        className="p-1.5 bg-white/90 rounded-lg text-neutral-600 hover:text-primary-600 transition-colors shadow-sm"
                        title="View dream"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => router.push(`/dreams/${dream.id}/edit`)}
                        className="p-1.5 bg-white/90 rounded-lg text-neutral-600 hover:text-primary-600 transition-colors shadow-sm"
                        title="Edit dream"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteDream(dream.id)}
                        className="p-1.5 bg-white/90 rounded-lg text-neutral-600 hover:text-red-600 transition-colors shadow-sm"
                        title="Delete dream"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Dreams from Community */}
        {publicDreams.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-800">Recent Dreams from Community</h2>
              <button
                onClick={() => router.push('/explore')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Explore all →
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicDreams.slice(0, 6).map((dream) => (
                <div key={dream.id} className="relative group">
                  <DreamCard dream={dream} showActions={false} />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => router.push(`/dreams/${dream.id}`)}
                      className="p-1.5 bg-white/90 rounded-lg text-neutral-600 hover:text-primary-600 transition-colors shadow-sm"
                      title="View dream"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border border-primary-100">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/dreams/search')}
              className="flex items-center space-x-3 p-4 bg-white/60 rounded-lg hover:bg-white/80 transition-colors text-left"
            >
              <span className="text-2xl">🔍</span>
              <div>
                <p className="font-medium text-neutral-800">Search Dreams</p>
                <p className="text-sm text-neutral-600">Find specific dreams or patterns</p>
              </div>
            </button>
            
            <button
              onClick={() => router.push('/insights')}
              className="flex items-center space-x-3 p-4 bg-white/60 rounded-lg hover:bg-white/80 transition-colors text-left"
            >
              <span className="text-2xl">📈</span>
              <div>
                <p className="font-medium text-neutral-800">View Insights</p>
                <p className="text-sm text-neutral-600">Analyze your dream patterns</p>
              </div>
            </button>
            
            <button
              onClick={() => router.push('/dreams')}
              className="flex items-center space-x-3 p-4 bg-white/60 rounded-lg hover:bg-white/80 transition-colors text-left"
            >
              <span className="text-2xl">📖</span>
              <div>
                <p className="font-medium text-neutral-800">Dream Journal</p>
                <p className="text-sm text-neutral-600">Browse your complete journal</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}