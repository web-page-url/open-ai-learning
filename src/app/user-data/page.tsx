'use client';

import { useState, useEffect } from 'react';
import { DatabaseService } from '@/lib/supabase';

interface ModuleStats {
  totalParticipants: number;
  completedParticipants: number;
  averageScore: number;
  averageTimeSpent: number;
  completionRate: number;
}

interface UserProgress {
  id: string;
  name: string;
  email: string;
  sessionTitle: string;
  currentSection: number;
  currentPart: string;
  status: string;
  totalScore: number;
  maxScore: number;
  completionPercentage: number;
  timeSpent: number;
  lastActive: string;
}

export default function UserDataPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedModule, setSelectedModule] = useState({ section: 1, part: 'A' });
  const [moduleStats, setModuleStats] = useState<Record<string, ModuleStats>>({});
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    completedSessions: 0,
    averageScore: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);

  // Module configuration
  const modules = [
    { section: 1, part: 'A', title: 'Web Development Overview' },
    { section: 1, part: 'B', title: 'Modern Development Tools' },
    { section: 2, part: 'A', title: 'React Fundamentals' },
    { section: 2, part: 'B', title: 'State Management & Hooks' },
    { section: 3, part: 'A', title: 'Performance Optimization' },
    { section: 3, part: 'B', title: 'Testing & Deployment' }
  ];

  useEffect(() => {
    loadData();
    
    // Set up real-time subscriptions
    const sessionsSubscription = DatabaseService.subscribeToSessions(() => {
      loadData();
    });

    const progressSubscription = DatabaseService.subscribeToProgress(() => {
      loadData();
    });

    return () => {
      sessionsSubscription.unsubscribe();
      progressSubscription.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load overall dashboard stats
      const dashboardStats = await DatabaseService.getDashboardStats();
      setOverallStats({
        totalUsers: dashboardStats.totalUsers,
        activeSessions: dashboardStats.activeSessions,
        completedSessions: dashboardStats.completedSessions,
        averageScore: Math.round(dashboardStats.averageScore),
        completionRate: Math.round(dashboardStats.completionRate)
      });

      // Load module-specific stats
      const moduleStatsData: Record<string, ModuleStats> = {};
      for (const module of modules) {
        try {
          const stats = await DatabaseService.getModuleResults(module.section, module.part as 'A' | 'B');
          // Transform the raw data into ModuleStats format
          const totalParticipants = stats.length;
          const completedParticipants = stats.filter(s => s.completed_at).length;
          const averageScore = stats.length > 0 
            ? stats.reduce((acc, s) => acc + (s.questions_answered > 0 ? (s.questions_correct / s.questions_answered) * 100 : 0), 0) / stats.length
            : 0;
          const averageTimeSpent = stats.length > 0 
            ? stats.reduce((acc, s) => acc + s.time_spent, 0) / stats.length / 60 // convert to minutes
            : 0;
          
          moduleStatsData[`${module.section}-${module.part}`] = {
            totalParticipants,
            completedParticipants,
            averageScore: Math.round(averageScore),
            averageTimeSpent: Math.round(averageTimeSpent),
            completionRate: totalParticipants > 0 ? Math.round((completedParticipants / totalParticipants) * 100) : 0
          };
        } catch (error) {
          console.error(`Error loading stats for module ${module.section}-${module.part}:`, error);
          moduleStatsData[`${module.section}-${module.part}`] = {
            totalParticipants: 0,
            completedParticipants: 0,
            averageScore: 0,
            averageTimeSpent: 0,
            completionRate: 0
          };
        }
      }
      setModuleStats(moduleStatsData);

      // Load active user progress (mock data for now - you'd get this from actual sessions)
      const activeSessions = await DatabaseService.getActiveSessions();
      const progressData: UserProgress[] = activeSessions.map((session: any) => ({
        id: session.id,
        name: session.users?.name || 'Anonymous User',
        email: session.users?.email || 'N/A',
        sessionTitle: session.session_title,
        currentSection: session.current_section,
        currentPart: session.current_part,
        status: session.status,
        totalScore: session.total_score,
        maxScore: session.max_score,
        completionPercentage: session.completion_percentage,
        timeSpent: Math.round((new Date().getTime() - new Date(session.start_time).getTime()) / 60000), // minutes
        lastActive: new Date(session.updated_at).toLocaleString()
      }));
      setUserProgress(progressData);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentModuleStats = () => {
    const key = `${selectedModule.section}-${selectedModule.part}`;
    return moduleStats[key] || {
      totalParticipants: 0,
      completedParticipants: 0,
      averageScore: 0,
      averageTimeSpent: 0,
      completionRate: 0
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Loading User Data...</h2>
          <p className="text-gray-600 dark:text-gray-300">Fetching real-time analytics from Supabase</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                📊 User Analytics & Results
              </h1>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                🔴 LIVE DATA
              </span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={loadData}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                🔄 Refresh Data
              </button>
              <a
                href="/"
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1 mb-8">
          {[
            { id: 'overview', label: '📈 Overview', desc: 'Platform-wide statistics' },
            { id: 'modules', label: '📚 Module Results', desc: 'Section & part analytics' },
            { id: 'live-sessions', label: '🔴 Live Sessions', desc: 'Active participants' },
            { id: 'completion', label: '🏆 Completion Stats', desc: 'Final results' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div>{tab.label}</div>
              <div className="text-xs opacity-70">{tab.desc}</div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                📈 Platform Overview
              </h2>
              
              {/* Overall Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {overallStats.totalUsers}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {overallStats.activeSessions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {overallStats.averageScore}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {overallStats.completionRate}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
                </div>
              </div>

              {/* Module Progress Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Module Completion Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modules.map((module) => {
                    const stats = moduleStats[`${module.section}-${module.part}`] || {};
                    return (
                      <div
                        key={`${module.section}-${module.part}`}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Section {module.section} - Part {module.part}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          {module.title}
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Participants:</span>
                            <span className="font-semibold">{stats.totalParticipants || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Completed:</span>
                            <span className="font-semibold text-green-600">{stats.completedParticipants || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Avg Score:</span>
                            <span className="font-semibold">{stats.averageScore || 0}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'modules' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  📚 Module-Specific Results
                </h2>
                <select
                  value={`${selectedModule.section}-${selectedModule.part}`}
                  onChange={(e) => {
                    const [section, part] = e.target.value.split('-');
                    setSelectedModule({ section: parseInt(section), part: part as 'A' | 'B' });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {modules.map((module) => (
                    <option key={`${module.section}-${module.part}`} value={`${module.section}-${module.part}`}>
                      Section {module.section} - Part {module.part}: {module.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Module Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Module Statistics
                  </h3>
                  {(() => {
                    const stats = getCurrentModuleStats();
                    return (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span>Total Participants</span>
                          <span className="text-xl font-bold text-blue-600">{stats.totalParticipants}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span>Completed</span>
                          <span className="text-xl font-bold text-green-600">{stats.completedParticipants}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span>Average Score</span>
                          <span className="text-xl font-bold text-purple-600">{stats.averageScore}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span>Avg Time Spent</span>
                          <span className="text-xl font-bold text-orange-600">{stats.averageTimeSpent} min</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span>Completion Rate</span>
                          <span className="text-xl font-bold text-indigo-600">{stats.completionRate}%</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Progress Visualization */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Progress Visualization
                  </h3>
                  {(() => {
                    const stats = getCurrentModuleStats();
                    return (
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Completion Rate</span>
                            <span>{stats.completionRate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${stats.completionRate}%` }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Average Score</span>
                            <span>{stats.averageScore}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${stats.averageScore}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Insight:</strong> This module has a {stats.completionRate}% completion rate 
                            with an average score of {stats.averageScore}%. 
                            {stats.averageTimeSpent > 0 && ` Users spend an average of ${stats.averageTimeSpent} minutes on this module.`}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'live-sessions' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                🔴 Live Active Sessions
              </h2>
              
              {userProgress.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                  <div className="text-gray-400 text-6xl mb-4">👥</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Active Sessions
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    There are currently no users actively participating in learning sessions.
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Current Progress
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Time Spent
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {userProgress.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {user.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                Section {user.currentSection} - Part {user.currentPart}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.completionPercentage}% complete
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.totalScore}/{user.maxScore}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.maxScore > 0 ? Math.round((user.totalScore / user.maxScore) * 100) : 0}%
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {user.timeSpent} min
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.status === 'in-progress' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : user.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'completion' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                🏆 Completion Statistics
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Overall Completion Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Overall Platform Performance
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Users</span>
                      <span className="text-2xl font-bold text-blue-600">{overallStats.totalUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active Sessions</span>
                      <span className="text-2xl font-bold text-green-600">{overallStats.activeSessions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Score</span>
                      <span className="text-2xl font-bold text-purple-600">{overallStats.averageScore}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Platform Completion Rate</span>
                      <span className="text-2xl font-bold text-orange-600">{overallStats.completionRate}%</span>
                    </div>
                  </div>
                </div>

                {/* Certificate Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Certificate Statistics
                  </h3>
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🏆</div>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {overallStats.completedSessions}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Certificates Issued
                    </p>
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        {overallStats.completedSessions} learners have successfully completed 
                        the full learning program and earned their certificates!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 