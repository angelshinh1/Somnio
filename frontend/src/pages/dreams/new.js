import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import apiService from '../../services/api';

export default function NewDream() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    tags: '',
    emotion: 'neutral',
    vividness: 5,
    isPublic: true,
    isLucid: false,
    isRecurring: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  // Fetch authenticated user on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await apiService.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        setCurrentUser(null);
      }
    }
    fetchUser();
  }, []);

  const emotions = [
    { value: 'happy', label: 'Happy', color: 'text-green-600' },
    { value: 'anxious', label: 'Anxious', color: 'text-yellow-600' },
    { value: 'peaceful', label: 'Peaceful', color: 'text-blue-600' },
    { value: 'confused', label: 'Confused', color: 'text-purple-600' },
    { value: 'excited', label: 'Excited', color: 'text-orange-600' },
    { value: 'sad', label: 'Sad', color: 'text-gray-600' },
    { value: 'curious', label: 'Curious', color: 'text-teal-600' },
    { value: 'fearful', label: 'Fearful', color: 'text-red-600' },
    { value: 'neutral', label: 'Neutral', color: 'text-neutral-600' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }
    if (!currentUser || !currentUser.id) {
      setError('You must be logged in to create a dream.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const dreamData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        emotion: formData.emotion,
        vividness: parseInt(formData.vividness),
        isPublic: formData.isPublic,
        lucidDream: formData.isLucid,
        recurring: formData.isRecurring,
        userId: currentUser.id
      };
      const response = await apiService.createDream(dreamData);
      console.log('Dream created:', response);
      router.push('/dreams');
    } catch (err) {
      setError(err.message || 'Failed to create dream. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-neutral-500 mb-4">
            <button onClick={() => router.back()} className="hover:text-primary-600 transition-colors">
              ← Back
            </button>
          </div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Record a New Dream</h1>
          <p className="text-neutral-600">Capture the details of your dream experience</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-neutral-200/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title and Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
                  Dream Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/50 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                  placeholder="Give your dream a memorable title..."
                />
              </div>
              
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-neutral-700 mb-2">
                  Dream Date
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/50 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
                Dream Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={8}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/50 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors resize-none"
                placeholder="Describe your dream in as much detail as you can remember. What did you see, feel, or experience? Who was there? What happened?"
              />
              <p className="text-xs text-neutral-500 mt-1">
                The more detail you provide, the better we can find connections with similar dreams.
              </p>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-neutral-700 mb-2">
                Tags
              </label>
              <input
                id="tags"
                name="tags"
                type="text"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/50 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                placeholder="flying, water, family, school, animals... (separate with commas)"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Add keywords that describe your dream to help categorize it.
              </p>
            </div>

            {/* Emotion and Vividness Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="emotion" className="block text-sm font-medium text-neutral-700 mb-2">
                  Overall Emotion
                </label>
                <select
                  id="emotion"
                  name="emotion"
                  value={formData.emotion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/50 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                >
                  {emotions.map(emotion => (
                    <option key={emotion.value} value={emotion.value}>
                      {emotion.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="vividness" className="block text-sm font-medium text-neutral-700 mb-2">
                  Vividness (1-10)
                </label>
                <div className="space-y-2">
                  <input
                    id="vividness"
                    name="vividness"
                    type="range"
                    min="1"
                    max="10"
                    value={formData.vividness}
                    onChange={handleChange}
                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none slider-thumb"
                  />
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Vague</span>
                    <span className="font-medium text-neutral-700">{formData.vividness}</span>
                    <span>Crystal Clear</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dream Characteristics */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-4">
                Dream Characteristics
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isLucid"
                    checked={formData.isLucid}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                  />
                  <span className="ml-2 text-sm text-neutral-700">
                    Lucid Dream (I was aware I was dreaming)
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                  />
                  <span className="ml-2 text-sm text-neutral-700">
                    Recurring Dream (I&apos;ve had this dream before)
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                  />
                  <span className="ml-2 text-sm text-neutral-700">
                    Make this dream public (allow others to discover connections)
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  loading
                    ? 'bg-neutral-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-sm hover:shadow-md'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Recording Dream...
                  </div>
                ) : (
                  'Record Dream'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
    </ProtectedRoute>
  );
}