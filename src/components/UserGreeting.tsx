'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserSession } from '@/lib/user-session';

export function UserGreeting() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const currentUser = UserSession.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Don't render anything on server-side to avoid hydration mismatch
  if (!mounted) return null;
  
  // Don't show greeting if user is not logged in
  if (!user) return null;

  const handleLogout = () => {
    UserSession.logout();
    setUser(null);
    // Optionally redirect to home or refresh page
    window.location.reload();
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-8 border border-blue-200/50 dark:border-blue-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* User Avatar */}
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          
          {/* Greeting */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Welcome back, {user.name}! 👋
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ready to continue your OpenAI learning journey?
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Link
            href="/my-scores"
            className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors"
          >
            My Scores
          </Link>

          <Link
            href="/"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
          >
            Home
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
        <span className="flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Logged in as {user.email}
        </span>
        <span className="flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          2 sections available
        </span>
        <span className="flex items-center">
          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
          8 questions total
        </span>
      </div>
    </div>
  );
} 