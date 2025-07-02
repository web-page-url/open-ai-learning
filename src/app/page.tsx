'use client';

import Link from "next/link";
import { sections, getDifficultyColor } from '@/types/sections';
import { UserGreeting } from '@/components/UserGreeting';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Greeting */}
        <UserGreeting />
        
      

        {/* Quick Stats */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Learning Platform Overview
            </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">2</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">8</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">~15</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">∞</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Progress Tracking</div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              What Learners Are Saying
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              See what others think about the OpenAI Learning Platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-center mb-3">
                <div className="text-yellow-400 text-lg">★★★★★</div>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">5/5</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">
                "Excellent platform! The OpenAI content is comprehensive and well-structured."
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                - Sarah J.
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border border-green-200/50 dark:border-green-700/50">
              <div className="flex items-center mb-3">
                <div className="text-yellow-400 text-lg">★★★★☆</div>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">4/5</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">
                "Great learning experience. The quiz format is engaging and certificates are a nice touch."
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                - Mike C.
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border border-purple-200/50 dark:border-purple-700/50">
              <div className="flex items-center mb-3">
                <div className="text-yellow-400 text-lg">★★★★★</div>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">5/5</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">
                "Loved the interactive approach! Questions really help reinforce the concepts."
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                - Emily R.
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Link 
              href="/admin-reviews"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              View All Reviews →
            </Link>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 border border-blue-200/50 dark:border-blue-700/50">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Ready to start learning about OpenAI?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Begin with Section 1 to learn about OpenAI fundamentals or explore practical applications in Section 2.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/section-1"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Start Section 1
              </Link>
              <Link 
                href="/my-scores"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                View My Scores
              </Link>
              <Link 
                href="/reviews"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                ⭐ Share Review
              </Link>

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© 2025 OpenAI Learning Platform. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <Link href="/login" className="hover:text-gray-900 dark:hover:text-white">Login</Link>
              <Link href="/reviews" className="hover:text-gray-900 dark:hover:text-white">Reviews</Link>
              <Link href="/admin-reviews" className="hover:text-gray-900 dark:hover:text-white">Dashboard</Link>
              <Link href="/" className="hover:text-gray-900 dark:hover:text-white">Home</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
