'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { UserSession } from '@/lib/user-session';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = UserSession.isLoggedIn();
      const user = UserSession.getCurrentUser();
      setIsLoggedIn(loggedIn);
      setUserName(user?.name || null);
    };

    checkLoginStatus();
    
    // Listen for storage changes (when login/logout happens in other tabs)
    const handleStorageChange = () => {
      checkLoginStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLogout = () => {
    UserSession.logout();
    setIsLoggedIn(false);
    setUserName(null);
    // Dispatch storage event to update other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'currentUser',
      newValue: null,
      oldValue: null
    }));
    router.push('/');
  };

  return (
    <nav className="bg-gray-900 shadow-xl border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img 
                src="/images/icons/co-pilot-1.0.png" 
                alt="OpenAI Learning" 
                className="h-8 w-8 mr-3"
              />
              <span className="text-xl font-bold text-white">
                OpenAI Learning Platform
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            
            {/* Show user name when logged in */}
            {isLoggedIn && userName && (
              <span className="text-gray-300 text-sm">
                Welcome, {userName}
              </span>
            )}
            
            <Link
              href="/my-scores"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/my-scores')
                  ? 'bg-blue-600 text-white border border-blue-500'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              My Scores
            </Link>
            
            <Link
              href="/reviews"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/reviews')
                  ? 'bg-blue-600 text-white border border-blue-500'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              ⭐ Reviews
            </Link>
            
            <Link
              href="/admin-reviews"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/admin-reviews')
                  ? 'bg-blue-600 text-white border border-blue-500'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              📊 Dashboard
            </Link>
            
            {/* Conditional Login/Logout */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-gray-300 hover:text-white hover:bg-gray-800"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/login')
                    ? 'bg-blue-600 text-white border border-blue-500'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Login
              </Link>
            )}
            
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/')
                  ? 'bg-blue-600 text-white border border-blue-500'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 