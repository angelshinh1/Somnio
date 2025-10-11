import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import DreamCard from '../../components/dreams/DreamCard';
import apiService from '../../services/api';

export default function Dreams() {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmotion, setFilterEmotion] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const router = useRouter();

  const fetchDreams = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!apiService.isAuthenticated()) {
        router.push('/login?returnTo=/dreams');
        return;
      }

      // Get current user
      const user = await apiService.getCurrentUser();
      
      // Fetch user's dreams
      const response = await apiService.getUserDreams(user.id);
      
      // Apply client-side filtering and sorting
      let filteredDreams = response.dreams || [];
      
      // Filter by search term
      if (searchTerm) {
        filteredDreams = filteredDreams.filter(dream => 
          dream.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dream.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dream.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      // Filter by emotion
      if (filterEmotion) {
        filteredDreams = filteredDreams.filter(dream => 
          dream.emotion === filterEmotion
        );
      }
      
      // Sort dreams
      filteredDreams.sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
          case 'date_asc':
            return new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date);
          case 'title':
            return (a.title || '').localeCompare(b.title || '');
          case 'vividness':
            return (b.vividness || 0) - (a.vividness || 0);
          default:
            return 0;
        }
      });
      
      setDreams(filteredDreams);
      setError('');
    } catch (err) {
      console.error('Fetch dreams error:', err);
      setError('Failed to load dreams');
      
      // If unauthorized, redirect to login
      if (err.message.includes('401') || err.message.includes('unauthorized')) {
        router.push('/login?returnTo=/dreams');
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterEmotion, sortBy, router]);

  useEffect(() => {
    fetchDreams();
  }, [fetchDreams]);

  const handleDeleteDream = async (dreamId) => {
    if (!confirm('Are you sure you want to delete this dream?')) return;
    
    try {
      await apiService.deleteDream(dreamId);
      setDreams(dreams.filter(dream => dream.id !== dreamId));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete dream');
    }
  };

  const emotions = ['happy', 'anxious', 'peaceful', 'confused', 'excited', 'sad', 'curious', 'fearful'];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800 mb-2">My Dreams</h1>
            <p className="text-neutral-600">Explore and manage your dream collection</p>
          </div>
          
          <button
            onClick={() => router.push('/dreams/new')}
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
          >
            <span>+</span>
            <span>New Dream</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-neutral-200/50 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Search Dreams
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search titles, descriptions, or tags..."
                  className="w-full px-4 py-2 pl-10 bg-white/50 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-200 transition-colors"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Emotion Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Filter by Emotion
              </label>
              <select
                value={filterEmotion}
                onChange={(e) => setFilterEmotion(e.target.value)}
                className="w-full px-4 py-2 bg-white/50 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-200 transition-colors"
              >
                <option value="">All Emotions</option>
                {emotions.map(emotion => (
                  <option key={emotion} value={emotion}>
                    {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 bg-white/50 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-200 transition-colors"
              >
                <option value="date">Date (Newest First)</option>
                <option value="date_asc">Date (Oldest First)</option>
                <option value="vividness">Vividness</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dreams Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading dreams...</p>
            </div>
          </div>
        ) : dreams.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-neutral-400">🌙</span>
            </div>
            <h3 className="text-lg font-medium text-neutral-800 mb-2">
              {searchTerm || filterEmotion ? 'No dreams match your filters' : 'No dreams yet'}
            </h3>
            <p className="text-neutral-600 mb-6">
              {searchTerm || filterEmotion 
                ? 'Try adjusting your search or filters' 
                : 'Start your dream journey by recording your first dream'
              }
            </p>
            {!searchTerm && !filterEmotion && (
              <button
                onClick={() => router.push('/dreams/new')}
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
              >
                Record Your First Dream
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-neutral-600">
                {dreams.length} dream{dreams.length !== 1 ? 's' : ''} found
              </p>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-neutral-500 hover:text-neutral-700 transition-colors" title="Grid view">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button className="p-2 text-neutral-400 hover:text-neutral-700 transition-colors" title="List view">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Dreams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dreams.map((dream) => (
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
          </>
        )}
      </div>
    </Layout>
  );
}