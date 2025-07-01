'use client';

import { useState, useEffect } from 'react';
import { AdminDatabaseService, AdminUserProgress, AdminSectionStats, AdminOverallStats } from '@/lib/admin-database-service';

// Password Authentication Component
const AdminAuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Static admin password - you can change this
  const ADMIN_PASSWORD = 'CopilotAdmin2025!';
  const AUTH_STORAGE_KEY = 'admin-auth-token';

  useEffect(() => {
    // Check if user is already authenticated from localStorage
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleAuthentication = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === ADMIN_PASSWORD) {
      // Save authentication in localStorage
      localStorage.setItem(AUTH_STORAGE_KEY, password);
      setIsAuthenticated(true);
    } else {
      setError('Invalid password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
    setPassword('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Access Required
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Enter the admin password to access the dashboard
            </p>
          </div>

          <form onSubmit={handleAuthentication} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400"
                placeholder="Enter admin password"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                <div className="flex items-center">
                  <span className="text-lg mr-2">❌</span>
                  {error}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              🚀 Access Admin Dashboard
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              🔒 Secure authentication required for data protection
            </p>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, show the admin dashboard with logout option
  return (
    <div>
      {/* Logout Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
        >
          🔓 Logout
        </button>
      </div>
      {children}
    </div>
  );
};

export default function AdminScoresPage() {
  const [allProgress, setAllProgress] = useState<AdminUserProgress[]>([]);
  const [sectionStats, setSectionStats] = useState<AdminSectionStats[]>([]);
  const [overallStats, setOverallStats] = useState<AdminOverallStats>({
    totalUsers: 0,
    totalSections: 0,
    totalQuestions: 0,
    totalResponses: 0,
    overallCompletionRate: 0,
    overallAccuracy: 0,
    averageTimePerSection: 0
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'sections' | 'users'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'accuracy' | 'time' | 'date'>('accuracy');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [isDatabaseConnected, setIsDatabaseConnected] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  // Add debug logging
  useEffect(() => {
    if (allProgress.length > 0) {
      console.log('🐛 DEBUG: Admin Progress Data:', allProgress.map(p => ({
        userEmail: p.userEmail,
        sectionNumber: p.sectionNumber,
        totalQuestions: p.totalQuestions,
        questionsCorrect: p.questionsCorrect,
        accuracy: p.accuracy
      })));
    }
  }, [allProgress]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Test database connection
      const isConnected = await AdminDatabaseService.testConnection();
      setIsDatabaseConnected(isConnected);

      if (!isConnected) {
        console.log('Database not available - showing empty state');
        setLoading(false);
        return;
      }

      // Load all data in parallel
      const [progressData, statsData, overallData] = await Promise.all([
        AdminDatabaseService.getAllUserProgress(),
        AdminDatabaseService.getSectionStatistics(),
        AdminDatabaseService.getOverallStatistics()
      ]);

      setAllProgress(progressData);
      setSectionStats(statsData);
      setOverallStats(overallData);

      console.log('✅ Admin data loaded:', {
        progress: progressData.length,
        sections: statsData.length,
        users: overallData.totalUsers
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProgress = () => {
    let filtered = allProgress;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sectionTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by section
    if (selectedSection !== 'all') {
      filtered = filtered.filter(p => p.sectionNumber === parseInt(selectedSection));
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.userName.toLowerCase();
          bValue = b.userName.toLowerCase();
          break;
        case 'accuracy':
          aValue = a.accuracy;
          bValue = b.accuracy;
          break;
        case 'time':
          aValue = a.timeSpent;
          bValue = b.timeSpent;
          break;
        case 'date':
          aValue = new Date(a.completedAt || '1970-01-01');
          bValue = new Date(b.completedAt || '1970-01-01');
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const exportToCSV = () => {
    const filteredData = getFilteredProgress();
    const headers = [
      'User Name',
      'Email',
      'Section',
      'Total Questions',
      'Correct Answers',
      'Accuracy (%)',
      'Time Spent (s)',
      'Status',
      'Completed At'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredData.map(p => [
        `"${p.userName}"`,
        `"${p.userEmail}"`,
        `"${p.sectionTitle}"`,
        p.totalQuestions,
        p.questionsCorrect,
        p.accuracy,
        p.timeSpent,
        `"${p.status}"`,
        `"${p.completedAt || 'Not completed'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sections_admin_scores_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'not-started':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Create the admin dashboard content
  const adminDashboard = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center p-4">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                📊 Loading Admin Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Fetching sections data from database...
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (!isDatabaseConnected) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-6xl mb-4">🔌</div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Database Connection Required
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                The admin dashboard requires a database connection to display sections data.
              </p>
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-orange-800 dark:text-orange-400 mb-2">
                  Setup Instructions:
                </h3>
                <ol className="text-left text-orange-700 dark:text-orange-300 text-sm space-y-1">
                  <li>1. Add your Supabase credentials to <code>.env.local</code></li>
                  <li>2. Run the database schema from <code>database-questions-schema.sql</code></li>
                  <li>3. Restart the development server</li>
                </ol>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                🔄 Retry Connection
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                📊 Sections Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Real-time analytics from learning sections platform
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">
                  🔗 Database Connected
                </span>
                <span className="text-xs text-gray-500">
                  Last updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={loadAdminData}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                🔄 Refresh
              </button>
              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                📥 Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            {['overview', 'sections', 'users'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                {tab === 'overview' && '📈 Overview'}
                {tab === 'sections' && '📚 Sections'}
                {tab === 'users' && '👥 Users'}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Overall Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📊 Overall Statistics</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {overallStats.totalUsers}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Users</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {overallStats.totalSections}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Active Sections</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {overallStats.overallAccuracy}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Average Accuracy</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {overallStats.totalResponses}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Responses</div>
                </div>
              </div>
            </div>

            {/* Sections Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📚 Sections Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sectionStats.map((section) => (
                  <div key={section.sectionNumber} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">{section.sectionNumber}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {section.completionRate}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">Completion</div>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">
                      {section.sectionTitle}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Users:</span>
                        <span className="font-semibold ml-1">{section.totalUsers}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
                        <span className="font-semibold ml-1">{section.averageAccuracy}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                        <span className="font-semibold ml-1">{section.completedUsers}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Avg Time:</span>
                        <span className="font-semibold ml-1">{formatTime(section.averageTimeSpent)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {sectionStats.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No section data available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Users need to complete sections to see statistics here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sections Tab */}
        {activeTab === 'sections' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📚 Detailed Section Statistics</h2>
            
            <div className="space-y-6">
              {sectionStats.map((section) => (
                <div key={section.sectionNumber} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{section.sectionNumber}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {section.sectionTitle}
                        </h3>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Section {section.sectionNumber}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {section.completionRate}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Completion Rate
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {section.totalUsers}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">Total Users</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {section.completedUsers}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">Completed</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                        {section.averageAccuracy}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">Avg Accuracy</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                        {formatTime(section.averageTimeSpent)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">Avg Time</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                        {section.totalResponses}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">Responses</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {sectionStats.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No section data available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Users need to complete sections to see statistics here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Users
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Name, email, or section..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Section
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Sections</option>
                    {Array.from(new Set(allProgress.map(p => p.sectionNumber))).sort().map(sectionNum => (
                      <option key={sectionNum} value={sectionNum.toString()}>
                        Section {sectionNum}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [by, order] = e.target.value.split('-');
                      setSortBy(by as any);
                      setSortOrder(order as any);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="accuracy-desc">Accuracy (High to Low)</option>
                    <option value="accuracy-asc">Accuracy (Low to High)</option>
                    <option value="time-desc">Time (Most to Least)</option>
                    <option value="time-asc">Time (Least to Most)</option>
                    <option value="name-asc">Name (A to Z)</option>
                    <option value="name-desc">Name (Z to A)</option>
                    <option value="date-desc">Date (Newest First)</option>
                    <option value="date-asc">Date (Oldest First)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* User Progress Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  👥 User Progress ({getFilteredProgress().length})
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Section
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Accuracy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Completed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {getFilteredProgress().map((progress, index) => (
                      <tr key={`${progress.userId}-${progress.sectionNumber}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {progress.userName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {progress.userEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {progress.sectionTitle}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Section {progress.sectionNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {progress.questionsCorrect}/{progress.totalQuestions}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            questions
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {progress.accuracy}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatTime(progress.timeSpent)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(progress.status)}`}>
                            {progress.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {progress.completedAt ? new Date(progress.completedAt).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {getFilteredProgress().length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">👥</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No user data found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Try adjusting your search filters or encourage users to start learning!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    );
  };

  // Wrap the entire admin dashboard with authentication guard
  return (
    <AdminAuthGuard>
      {adminDashboard()}
    </AdminAuthGuard>
  );
} 