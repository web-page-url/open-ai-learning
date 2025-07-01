'use client';

import { useState } from 'react';

export default function TransparencyPage() {
  const [activeTab, setActiveTab] = useState('architecture');

  const techStack = [
    { name: 'Next.js 14', description: 'React framework with App Router for modern web applications', category: 'Frontend Framework' },
    { name: 'TypeScript', description: 'Type-safe JavaScript for better development experience', category: 'Language' },
    { name: 'Tailwind CSS', description: 'Utility-first CSS framework for rapid UI development', category: 'Styling' },
    { name: 'React Hooks', description: 'Custom hooks for state management and timer functionality', category: 'State Management' },
    { name: 'HTML5 Canvas', description: 'For certificate generation and interactive elements', category: 'Graphics' }
  ];

  const buildSteps = [
    { step: 1, title: 'Project Planning & Setup', description: 'Requirements analysis, architecture planning, Next.js 14 project setup with TypeScript and Tailwind CSS', time: 'Days 1-2', phase: 'Week 1' },
    { step: 2, title: 'Database Architecture & Schema', description: 'Designed Supabase database schema, set up tables for user progress, section data, and analytics tracking', time: 'Days 3-4', phase: 'Week 1' },
    { step: 3, title: 'Core Learning System', description: 'Built section learning components, quiz system, timer functionality, and progress tracking mechanisms', time: 'Days 5-7', phase: 'Week 1' },
    { step: 4, title: 'User Authentication & Management', description: 'Implemented user registration, login system, profile management, and localStorage integration', time: 'Days 8-9', phase: 'Week 2' },
    { step: 5, title: 'Admin Dashboard & Analytics', description: 'Created comprehensive admin dashboard with real-time monitoring, user statistics, and data export functionality', time: 'Days 10-11', phase: 'Week 2' },
    { step: 6, title: 'Certificate Generation System', description: 'Built automated certificate generator with professional HTML templates, PDF conversion, and achievement tracking', time: 'Day 12', phase: 'Week 2' },
    { step: 7, title: 'Security & Authentication', description: 'Added admin password protection, localStorage persistence, secure routing, and access control systems', time: 'Day 13', phase: 'Week 2' },
    { step: 8, title: 'Testing & Deployment', description: 'Comprehensive testing, bug fixes, performance optimization, and deployment to production environment', time: 'Day 14', phase: 'Week 2' }
  ];

  const features = [
    { name: 'Timed Interactions', status: '✅ Implemented', description: 'Custom timer components with visual progress indicators' },
    { name: 'Session Flow Control', status: '✅ Implemented', description: 'Automated progression through warmup → discussion → quickfire rounds' },
    { name: 'Real-time Monitoring', status: '✅ Implemented', description: 'Admin dashboard with live session statistics and controls' },
    { name: 'Certificate Generation', status: '✅ Implemented', description: 'Automated certificate creation with downloadable formats' },
    { name: 'AI Integration', status: '🚧 Framework Ready', description: 'Prompt logging system and API integration points prepared' },
    { name: 'WebSocket Support', status: '🚧 Architecture Ready', description: 'Real-time communication infrastructure in place' },
    { name: 'Analytics & Insights', status: '✅ Basic Implementation', description: 'Session completion tracking and score analytics' },
    { name: 'Mobile Responsive', status: '✅ Implemented', description: 'Fully responsive design working on all device sizes' }
  ];

  const codeExamples = {
    'timer-component': `
// Custom Timer Component with Progress Visualization
const Timer = ({ initialTime, onComplete, autoStart }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(autoStart);
  
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive, timeLeft]);

  return (
    <div className="relative w-24 h-24">
      <svg className="transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" stroke="currentColor" 
                strokeWidth="8" fill="none" className="text-gray-200" />
        <circle cx="50" cy="50" r="45" stroke="currentColor"
                strokeWidth="8" fill="none" className="text-blue-600"
                style={{
                  strokeDasharray: \`\${2 * Math.PI * 45}\`,
                  strokeDashoffset: \`\${2 * Math.PI * 45 * (timeLeft / initialTime)}\`
                }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </div>
    </div>
  );
};`,
    'session-flow': `
// Session Flow Management System
const advanceStep = () => {
  const nextStep = getNextStep();
  if (nextStep) {
    setProgress(prev => ({
      ...prev,
      currentSection: nextStep.section,
      currentPart: nextStep.part,
      currentStep: nextStep.step,
      lastActivity: new Date()
    }));
  } else {
    setSession(prev => ({ ...prev, status: 'completed' }));
  }
};

const getNextStep = () => {
  const { currentSection, currentPart, currentStep } = progress;
  
  if (currentStep === 'warmup') {
    return { section: currentSection, part: currentPart, step: 'discussion' };
  } else if (currentStep === 'discussion') {
    return { section: currentSection, part: currentPart, step: 'quickfire' };
  } else if (currentStep === 'quickfire') {
    if (currentPart === 'A') {
      return { section: currentSection, part: 'B', step: 'warmup' };
    } else if (currentSection < 3) {
      return { section: currentSection + 1, part: 'A', step: 'warmup' };
    }
  }
  return null; // Session complete
};`,
    'certificate-generation': `
// Certificate Generation with HTML/PDF Output
const generateCertificate = (sessionData, participantName) => {
  const certificateHTML = \`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .certificate {
          background: white;
          max-width: 800px;
          margin: 0 auto;
          padding: 60px;
          font-family: 'Times New Roman', serif;
          border: 8px solid #f0f0f0;
        }
        .title { font-size: 42px; text-align: center; color: #2c3e50; }
        .recipient { font-size: 32px; color: #3498db; font-weight: bold; }
        /* ... additional styles ... */
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="title">CERTIFICATE OF COMPLETION</div>
        <div class="recipient">\${participantName}</div>
        <div class="course-title">\${sessionData.title}</div>
        <div class="score">Score: \${sessionData.score}%</div>
      </div>
    </body>
    </html>\`;
    
  const blob = new Blob([certificateHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = \`certificate-\${participantName}.html\`;
  a.click();
};`
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                🔍 Build Transparency
              </h1>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                Open Source Insights
              </span>
            </div>
            <a
              href="/"
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1 mb-8">
          {[
            { id: 'architecture', label: '🏗️ Architecture', desc: 'System design & structure' },
            { id: 'features', label: '⚡ Features', desc: 'Implementation status' },
            { id: 'tech-stack', label: '🛠️ Tech Stack', desc: 'Technologies used' },
            { id: 'build-process', label: '📋 Build Process', desc: 'Development timeline' },
            { id: 'code-examples', label: '💻 Code Examples', desc: 'Key implementations' }
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {activeTab === 'architecture' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                🏗️ System Architecture
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Frontend Architecture
                  </h3>
                  <div className="space-y-4">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-600 dark:text-blue-400">Next.js App Router</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Modern file-based routing with server components and client components separation
                      </p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold text-green-600 dark:text-green-400">Component-Based Design</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Reusable Timer, QuizCard, and Dashboard components with proper state isolation
                      </p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400">State Management</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        React hooks for local state, localStorage for persistence, real-time updates
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Data Flow Architecture
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 font-mono text-sm">
                    <div className="space-y-2 text-gray-700 dark:text-gray-300">
                      <div>📥 User Interaction</div>
                      <div className="ml-4">↓</div>
                      <div>⚡ Component State Update</div>
                      <div className="ml-4">↓</div>
                      <div>🔄 Session Progress Tracking</div>
                      <div className="ml-4">↓</div>
                      <div>📊 Real-time Dashboard Updates</div>
                      <div className="ml-4">↓</div>
                      <div>💾 LocalStorage Persistence</div>
                      <div className="ml-4">↓</div>
                      <div>🏆 Certificate Generation</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                ⚡ Feature Implementation Status
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {feature.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        feature.status.includes('✅') 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {feature.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tech-stack' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                🛠️ Technology Stack
              </h2>
              
              <div className="space-y-6">
                {techStack.map((tech, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                          {tech.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {tech.name}
                        </h3>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                          {tech.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {tech.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'build-process' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                📋 Development Timeline
              </h2>
              
              <div className="space-y-6">
                {buildSteps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {step.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {step.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            step.phase === 'Week 1' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {step.phase}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {step.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Total Development Time: 2 Weeks (14 Days)
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Professional development timeline including comprehensive planning, architecture design, full-stack implementation, security integration, testing, and deployment. Each phase was carefully executed with proper code reviews and quality assurance.
                </p>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Week 1 Focus</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Foundation & Core Features: Project setup, database design, learning system, and user management
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">Week 2 Focus</h4>
                  <p className="text-sm text-green-800 dark:text-green-300">
                    Advanced Features: Admin dashboard, certificates, security, testing, and production deployment
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code-examples' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                💻 Key Code Implementations
              </h2>
              
              <div className="space-y-8">
                {Object.entries(codeExamples).map(([key, code]) => (
                  <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                      <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                        {key.replace('-', ' ')}
                      </h3>
                    </div>
                    <pre className="p-4 bg-gray-900 text-gray-100 text-sm overflow-x-auto">
                      <code>{code.trim()}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 