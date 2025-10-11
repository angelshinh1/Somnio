import Link from 'next/link';
import Layout from '../components/layout/Layout';
import Header from '../components/layout/Header';
import DreamCard from '../components/dreams/DreamCard';

// Sample dream data for demo
const sampleDreams = [
  {
    id: 'dream_1',
    title: 'Flying Over Mountains',
    description: 'I was soaring high above snow-capped mountains, feeling completely free and weightless. The wind was rushing past my face and I could see eagles flying alongside me.',
    date: '2024-01-15',
    tags: ['flying', 'mountains', 'freedom', 'nature'],
    emotion: 'happy',
    isPublic: true,
    lucidDream: false,
    recurring: false
  },
  {
    id: 'dream_2',
    title: 'Endless Ocean',
    description: 'I was floating in a calm, crystal-clear ocean that seemed to stretch infinitely in all directions. I felt completely at peace.',
    date: '2024-01-16',
    tags: ['water', 'peace', 'infinite', 'floating'],
    emotion: 'peaceful',
    isPublic: true,
    lucidDream: true,
    recurring: false
  },
  {
    id: 'dream_3',
    title: 'Purple Forest Adventure',
    description: 'Walking through a mystical forest where all the trees had purple leaves that glowed softly. Strange but beautiful creatures watched me from the shadows.',
    date: '2024-01-17',
    tags: ['forest', 'mystical', 'purple', 'creatures'],
    emotion: 'mysterious',
    isPublic: true,
    lucidDream: false,
    recurring: true
  }
];

export default function Home() {
  return (
    <Layout>
      
      {/* Hero Section */}
      <main className="min-h-screen">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-neutral-800 mb-6 leading-tight">
              Discover the
              <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent"> connections </span>
              in your dreams
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Join a community of dreamers exploring the mysterious world of sleep. 
              Share your dreams, discover similar experiences, and visualize the incredible 
              network of human consciousness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register"
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start Your Dream Journal
              </Link>
              <Link 
                href="/explore"
                className="bg-white/70 backdrop-blur-sm text-neutral-700 px-8 py-4 rounded-2xl font-semibold hover:bg-white/90 transition-all duration-300 border border-neutral-200/50 hover:border-neutral-300/50"
              >
                Explore Dreams
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="text-center p-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-neutral-200/50">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-3">Dream Journal</h3>
              <p className="text-neutral-600">
                Capture your dreams with rich details, emotions, and tags. Track patterns and remember more.
              </p>
            </div>

            <div className="text-center p-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-neutral-200/50">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-3">Find Connections</h3>
              <p className="text-neutral-600">
                Discover others who&apos;ve had remarkably similar dreams using AI-powered analysis.
              </p>
            </div>

            <div className="text-center p-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-neutral-200/50">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-3">Visualize Networks</h3>
              <p className="text-neutral-600">
                Explore dream connections in beautiful 3D visualizations and see the web of shared experiences.
              </p>
            </div>
          </div>

          {/* Sample Dreams */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-neutral-800 mb-4">Recent Dreams from the Community</h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                See what others are dreaming about. Each dream is a window into the fascinating world of human consciousness.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleDreams.map((dream) => (
                <DreamCard key={dream.id} dream={dream} />
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link 
                href="/explore"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                View all dreams
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-primary-500 to-accent-500 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to explore your dreams?</h2>
            <p className="text-xl mb-8 text-primary-100">
              Join thousands of dreamers mapping the landscape of sleep and consciousness.
            </p>
            <Link 
              href="/register"
              className="bg-white text-primary-600 px-8 py-4 rounded-2xl font-semibold hover:bg-primary-50 transition-colors inline-flex items-center"
            >
              Get Started Free
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}