'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LearningSession, UserProgress, Section, QuizQuestion, DiscussionContent } from '@/types/learning';
import { defaultSections, createDefaultSession } from '@/lib/session-data';
import QuizCard from '@/components/quiz/QuizCard';
import Timer from '@/components/ui/Timer';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  mobile?: string;
}

export default function LearningPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [session, setSession] = useState<LearningSession>(createDefaultSession());
  const [progress, setProgress] = useState<UserProgress>({
    sessionId: session.id,
    currentSection: 1,
    currentPart: 'A',
    currentStep: 'warmup',
    answers: {},
    score: 0,
    timeSpent: 0,
    startTime: new Date(),
    lastActivity: new Date()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showTransparency, setShowTransparency] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    setIsCheckingAuth(true);
    
    try {
      const storedUserInfo = localStorage.getItem('user_info');
      const userId = localStorage.getItem('learning_user_id');
      
      if (!storedUserInfo || !userId) {
        // User is not logged in, redirect to login
        router.push('/login');
        return;
      }
      
      const userInfo = JSON.parse(storedUserInfo);
      setUserInfo(userInfo);
      
      // Initialize session with user info
      setSession(prev => ({
        ...prev,
        participantName: userInfo.name,
        participantEmail: userInfo.email
      }));
      
      setProgress(prev => ({
        ...prev,
        userId: userId
      }));
      
    } catch (error) {
      console.error('Authentication check failed:', error);
      router.push('/login');
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const currentSection = defaultSections.find(s => s.id === progress.currentSection);
  const currentPart = currentSection ? (progress.currentPart === 'A' ? currentSection.partA : currentSection.partB) : null;

  const startSession = () => {
    setSession(prev => ({ ...prev, status: 'in-progress', startTime: new Date() }));
    setProgress(prev => ({ ...prev, startTime: new Date() }));
  };

  const getCurrentStepContent = () => {
    if (!currentPart) return null;

    switch (progress.currentStep) {
      case 'warmup':
        return {
          type: 'quiz',
          title: 'Warm-up Question',
          description: 'Activate your prior knowledge with this quick question',
          content: currentPart.warmupQuestion,
          duration: 30 // 30 seconds for warmup questions
        };
      case 'discussion':
        return {
          type: 'discussion',
          title: currentPart.discussionContent.title,
          description: 'Interactive learning discussion',
          content: currentPart.discussionContent,
          duration: 180 // 3 minutes for discussion
        };
      case 'quickfire':
        return {
          type: 'quickfire',
          title: 'Quick Fire Round',
          description: 'Rapid-fire questions to reinforce your learning',
          content: currentPart.quickfireQuestions,
          duration: 120 // 2 minutes total
        };
      default:
        return null;
    }
  };

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
      // Session complete
      setSession(prev => ({ ...prev, status: 'completed' }));
    }
  };

  const getNextStep = () => {
    const { currentSection, currentPart, currentStep } = progress;
    
    if (currentStep === 'warmup') {
      return { section: currentSection, part: currentPart, step: 'discussion' as const };
    } else if (currentStep === 'discussion') {
      return { section: currentSection, part: currentPart, step: 'quickfire' as const };
    } else if (currentStep === 'quickfire') {
      if (currentPart === 'A') {
        return { section: currentSection, part: 'B' as const, step: 'warmup' as const };
      } else {
        // Move to next section
        if (currentSection < 3) {
          return { section: currentSection + 1, part: 'A' as const, step: 'warmup' as const };
        }
      }
    }
    return null;
  };

  const handleQuizAnswer = (questionId: string, answer: string | number, correct: boolean) => {
    setProgress(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer },
      score: correct ? prev.score + 1 : prev.score,
      lastActivity: new Date()
    }));

    // Auto-advance after a short delay to show result
    setTimeout(() => {
      advanceStep();
    }, 2000);
  };

  const handleDiscussionComplete = () => {
    advanceStep();
  };

  const getProgressPercentage = () => {
    const totalSteps = 18; // 3 sections × 2 parts × 3 steps
    const currentStepNumber = 
      (progress.currentSection - 1) * 6 + 
      (progress.currentPart === 'A' ? 0 : 3) +
      (progress.currentStep === 'warmup' ? 1 : progress.currentStep === 'discussion' ? 2 : 3);
    
    return Math.round((currentStepNumber / totalSteps) * 100);
  };

  const stepContent = getCurrentStepContent();

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              🔐 Verifying Access
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Checking your login status...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show login required screen if user is not authenticated
  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="text-6xl">🔒</div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Login Required
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              You must be logged in to access the learning platform and track your progress.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Why login is required:
            </h3>
            <div className="space-y-3 text-left mb-6">
              <div className="flex items-center gap-3">
                <span className="text-blue-500 text-xl">📊</span>
                <span className="text-gray-600 dark:text-gray-300">Track your personal progress</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-500 text-xl">💾</span>
                <span className="text-gray-600 dark:text-gray-300">Save your scores and achievements</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-purple-500 text-xl">🏆</span>
                <span className="text-gray-600 dark:text-gray-300">Earn certificates with your name</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-orange-500 text-xl">📈</span>
                <span className="text-gray-600 dark:text-gray-300">View detailed analytics</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                🔓 Login to Continue
              </button>
              
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                👤 Create New Account
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (session.status === 'not-started') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center p-4">
        {/* Header with user info and logout */}
        <div className="absolute top-4 right-4 flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900 dark:text-white">{userInfo.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{userInfo.email}</div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            {userInfo.name.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('learning_user_id');
              localStorage.removeItem('user_info');
              router.push('/');
            }}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
          >
            🔓 Logout
          </button>
        </div>

        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              🎓 Interactive Learning Platform
            </h1>
            <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-4 py-2 rounded-lg inline-block">
              ✅ Welcome back, <strong>{userInfo.name}</strong>! Your progress will be tracked.
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white">
              {session.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {session.description}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Session Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">3</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sections</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">~90</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Minutes</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">📜</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Certificate</div>
              </div>
            </div>
            
            <div className="space-y-3 text-left mb-6">
              <h4 className="font-semibold text-gray-800 dark:text-white">What to expect:</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">⏱️</span>
                  Timed warm-up questions (30 seconds each)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">💬</span>
                  Interactive discussions (10 minutes each)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-500">⚡</span>
                  Quick-fire rounds (2 minutes each)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">🏆</span>
                  Final assessment and certification
                </li>
              </ul>
            </div>

            <button
              onClick={startSession}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              🚀 Start Learning Session
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setShowTransparency(!showTransparency)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <span>🔍</span>
              <span>See how this was built</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (session.status === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-green-600 dark:text-green-400">
              🎉 Congratulations!
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white">
              Session Completed Successfully
            </h2>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {progress.score}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Points Earned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  100%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 mb-4">
              📜 Download Certificate
            </button>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
            >
              🔄 Start New Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header with Progress */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                {session.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Section {progress.currentSection} - Part {progress.currentPart} - {progress.currentStep}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Progress: {getProgressPercentage()}%
              </div>
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {stepContent && (
          <div className="space-y-6">
            {/* Step Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {stepContent.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {stepContent.description}
              </p>
            </div>

            {/* Step Content */}
            {progress.currentStep === 'warmup' && stepContent.type === 'quiz' && (
              <QuizCard
                question={stepContent.content as QuizQuestion}
                onAnswer={(answer, correct) => handleQuizAnswer((stepContent.content as QuizQuestion).id, answer, correct)}
                onTimeUp={() => advanceStep()}
                autoStart={true}
                showExplanation={true}
              />
            )}

            {progress.currentStep === 'discussion' && stepContent.type === 'discussion' && (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                      Discussion: {(stepContent.content as DiscussionContent).title}
                    </h3>
                    <Timer
                      initialTime={stepContent.duration}
                      onComplete={handleDiscussionComplete}
                      autoStart={true}
                      size="md"
                      color="primary"
                    />
                  </div>
                  
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                      {(stepContent.content as DiscussionContent).content}
                    </p>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={handleDiscussionComplete}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      Continue to Quick Fire Round →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {progress.currentStep === 'quickfire' && stepContent.type === 'quickfire' && (
              <div className="space-y-6">
                <div className="text-center">
                  <Timer
                    initialTime={stepContent.duration}
                    onComplete={advanceStep}
                    autoStart={true}
                    size="lg"
                    color="warning"
                  />
                </div>
                
                {/* This would cycle through quickfire questions */}
                <div className="text-center text-gray-600 dark:text-gray-300">
                  <p>Quick Fire Round - Answer as fast as you can!</p>
                  <p className="text-sm">Implementation for rapid question cycling would go here</p>
                  <button
                    onClick={advanceStep}
                    className="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Complete Quick Fire Round →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transparency Panel */}
      {showTransparency && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-800 dark:text-white">Build Transparency</h4>
            <button
              onClick={() => setShowTransparency(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <p><strong>Current Tech Stack:</strong></p>
            <ul className="text-xs space-y-1">
              <li>• Next.js 14 + App Router</li>
              <li>• TypeScript for type safety</li>
              <li>• Tailwind CSS for styling</li>
              <li>• Custom React hooks for state</li>
              <li>• Timer components with SVG</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 