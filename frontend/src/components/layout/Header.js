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

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

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
      setIsMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      apiService.clearToken();
      setIsAuthenticated(false);
      setUser(null);
      setIsMenuOpen(false);
      router.push('/');
    }
  };

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };
  
  return (
    <>
      <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-semibold text-neutral-800">Somnio</span>
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
                    className="text-red-600 hover:text-red-700 transition-colors font-medium"
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
              className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 transition-colors relative z-[60]"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[55] md:hidden">
          {/* Blurred Backdrop */}
          <div 
            className="absolute inset-0 bg-white/95 backdrop-blur-md"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="relative h-full flex flex-col items-center justify-center px-8">
            <nav className="flex flex-col items-center space-y-8 w-full max-w-sm">
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/dashboard" 
                    onClick={handleNavClick}
                    className="text-2xl font-semibold text-neutral-800 hover:text-primary-600 transition-colors w-full text-center py-3 hover:bg-primary-50 rounded-lg"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/dreams" 
                    onClick={handleNavClick}
                    className="text-2xl font-semibold text-neutral-800 hover:text-primary-600 transition-colors w-full text-center py-3 hover:bg-primary-50 rounded-lg"
                  >
                    My Dreams
                  </Link>
                  <Link 
                    href="/network" 
                    onClick={handleNavClick}
                    className="text-2xl font-semibold text-neutral-800 hover:text-primary-600 transition-colors w-full text-center py-3 hover:bg-primary-50 rounded-lg"
                  >
                    Dream Network
                  </Link>
                  <Link 
                    href="/explore" 
                    onClick={handleNavClick}
                    className="text-2xl font-semibold text-neutral-800 hover:text-primary-600 transition-colors w-full text-center py-3 hover:bg-primary-50 rounded-lg"
                  >
                    Explore Dreams
                  </Link>
                  <Link 
                    href="/dreams/new" 
                    onClick={handleNavClick}
                    className="text-2xl font-semibold text-neutral-800 hover:text-primary-600 transition-colors w-full text-center py-3 hover:bg-primary-50 rounded-lg"
                  >
                    New Dream
                  </Link>
                  
                  {/* Divider */}
                  <div className="w-full border-t border-neutral-300 my-4"></div>
                  
                  {/* Sign Out Button */}
                  <button
                    onClick={handleLogout}
                    className="text-2xl font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors w-full text-center py-3 rounded-lg"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/explore" 
                    onClick={handleNavClick}
                    className="text-2xl font-semibold text-neutral-800 hover:text-primary-600 transition-colors w-full text-center py-3 hover:bg-primary-50 rounded-lg"
                  >
                    Explore Dreams
                  </Link>
                  
                  {/* Divider */}
                  <div className="w-full border-t border-neutral-300 my-4"></div>
                  
                  <Link 
                    href="/login" 
                    onClick={handleNavClick}
                    className="text-2xl font-semibold text-neutral-800 hover:text-primary-600 transition-colors w-full text-center py-3 hover:bg-primary-50 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/register" 
                    onClick={handleNavClick}
                    className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl text-xl font-semibold w-full text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>

            {/* Optional: Add decorative element or branding at bottom */}
            <div className="absolute bottom-8 text-center">
              <p className="text-sm text-neutral-500">Somnio Dream Journal</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}