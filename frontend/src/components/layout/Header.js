import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import apiService from '../../services/api';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const authenticated = apiService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      // In a real app, we'd fetch current user data
      // For demo, we'll use a placeholder
      setUser({ name: 'Dream Explorer' });
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      setIsAuthenticated(false);
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      apiService.clearToken();
      setIsAuthenticated(false);
      setUser(null);
      router.push('/');
    }
  };
  
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-semibold text-neutral-800">DreamSync</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-neutral-600 hover:text-primary-600 transition-colors">
                  Dashboard
                </Link>
                <Link href="/dreams" className="text-neutral-600 hover:text-primary-600 transition-colors">
                  My Dreams
                </Link>
                <Link href="/network" className="text-neutral-600 hover:text-primary-600 transition-colors">
                  Network
                </Link>
                <Link href="/explore" className="text-neutral-600 hover:text-primary-600 transition-colors">
                  Explore
                </Link>
                <Link href="/dreams/new" className="text-neutral-600 hover:text-primary-600 transition-colors">
                  New Dream
                </Link>
              </>
            ) : (
              <>
                <Link href="/explore" className="text-neutral-600 hover:text-primary-600 transition-colors">
                  Explore
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleLogout}
                  className="text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-neutral-600 hover:text-primary-600 transition-colors">
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200 bg-white">
            <div className="flex flex-col space-y-4">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="text-neutral-600 hover:text-primary-600 transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/dreams" className="text-neutral-600 hover:text-primary-600 transition-colors">
                    My Dreams
                  </Link>
                  <Link href="/network" className="text-neutral-600 hover:text-primary-600 transition-colors">
                    Dream Network
                  </Link>
                  <Link href="/explore" className="text-neutral-600 hover:text-primary-600 transition-colors">
                    Explore Dreams
                  </Link>
                  <Link href="/dreams/new" className="text-neutral-600 hover:text-primary-600 transition-colors">
                    New Dream
                  </Link>
                  <hr className="border-neutral-200" />
                  <button
                    onClick={handleLogout}
                    className="text-left text-neutral-600 hover:text-primary-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/explore" className="text-neutral-600 hover:text-primary-600 transition-colors">
                    Explore Dreams
                  </Link>
                  <hr className="border-neutral-200" />
                  <Link href="/login" className="text-neutral-600 hover:text-primary-600 transition-colors">
                    Sign In
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-sm text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}