'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
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
              href="/login"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/login')
                  ? 'bg-blue-600 text-white border border-blue-500'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Login
            </Link>
            
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