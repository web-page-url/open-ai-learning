'use client';

import Link from "next/link";
import { sections, getDifficultyColor } from '@/types/sections';
import { UserGreeting } from '@/components/UserGreeting';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">G</span>
                </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  GitHub Copilot Learning
                  </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  2 Sections • 8 Questions • Dashboard Analytics
                  </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Login
              </Link>
              <Link 
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Get Started
              </Link>

            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Greeting */}
        <UserGreeting />
        
        {/* Hero Section */}
          <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Master GitHub Copilot
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Complete 10 focused sections with 2 questions each. 
            Track your progress and view analytics on the dashboard.
          </p>
          <div className="mt-6 flex justify-center items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Database-driven questions
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Real-time progress tracking
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Performance analytics
            </span>
              </div>
            </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sections.map((section) => (
            <Link 
              key={section.id}
              href={`/section-${section.id}`}
              className="group block"
                >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
                {/* Section Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${section.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                    {section.icon}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(section.difficulty)}`}>
                    {section.difficulty}
                  </span>
              </div>

                {/* Section Content */}
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Section {section.id}
                </h3>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {section.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {section.description}
                  </p>

                {/* Section Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></span>
                    {section.questionsCount} questions
                  </span>
                  <span className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                    {section.estimatedTime}
                  </span>
              </div>

                {/* Progress Bar Placeholder */}
                <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div className="bg-blue-600 h-1 rounded-full w-0 group-hover:w-2 transition-all duration-300"></div>
                </div>
              </div>
            </Link>
          ))}
              </div>

        {/* Quick Stats */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Learning Platform Overview
            </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">10</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">20</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">~10</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">∞</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Progress Tracking</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 border border-blue-200/50 dark:border-blue-700/50">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Ready to start learning?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Begin with Section 1 or jump to any section that interests you most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/section-1"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Start Section 1
              </Link>

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© 2025 GitHub Copilot Learning Platform. All rights reserved.</p>
            <div className="mt-2 space-x-4">

              <Link href="/login" className="hover:text-gray-900 dark:hover:text-white">Login</Link>
              <Link href="/" className="hover:text-gray-900 dark:hover:text-white">Home</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
