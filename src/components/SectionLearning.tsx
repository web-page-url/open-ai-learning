'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionsService, SectionData, QuestionData, UserSectionProgress } from '@/lib/questions-service';
import QuizCard from '@/components/quiz/QuizCard';
import Timer from '@/components/ui/Timer';

interface SectionLearningProps {
  sectionNumber: number;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  mobile?: string;
}

export default function SectionLearning({ sectionNumber }: SectionLearningProps) {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [sectionData, setSectionData] = useState<SectionData | null>(null);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progress, setProgress] = useState<UserSectionProgress | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentQuestionStartTime, setCurrentQuestionStartTime] = useState<Date | null>(null);

  // Check authentication and load data
  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (userInfo) {
      loadSectionData();
    }
  }, [userInfo, sectionNumber]);

  const checkAuthentication = () => {
    setIsCheckingAuth(true);
    
    try {
      const storedUserInfo = localStorage.getItem('user_info');
      const userId = localStorage.getItem('learning_user_id');
      
      if (!storedUserInfo || !userId) {
        router.push('/login');
        return;
      }
      
      const userInfo = JSON.parse(storedUserInfo);
      setUserInfo(userInfo);
      
    } catch (error) {
      console.error('Authentication check failed:', error);
      router.push('/login');
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const loadSectionData = async () => {
    if (!userInfo) return;

    setIsLoading(true);
    try {
      // Load section details
      const sectionDetails = await QuestionsService.getSectionDetails(sectionNumber);
      if (!sectionDetails) {
        console.error('Section not found');
        return;
      }
      setSectionData(sectionDetails);

      // Load questions
      const sectionQuestions = await QuestionsService.getSectionQuestions(sectionNumber);
      setQuestions(sectionQuestions);

      // Load user progress
      const userProgress = await QuestionsService.getUserSectionProgress(userInfo.id, sectionNumber);
      setProgress(userProgress);

      // Load answered questions
      const answered = await QuestionsService.getUserAnsweredQuestions(userInfo.id, sectionNumber);
      setAnsweredQuestions(new Set(answered));

      // If user has completed this section, show results
      if (userProgress?.status === 'completed') {
        setShowResults(true);
      }

    } catch (error) {
      console.error('Error loading section data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startSection = async () => {
    if (!userInfo || !sectionData) return;

    setIsLoading(true);
    try {
      const newProgress = await QuestionsService.startSectionProgress(userInfo.id, sectionNumber);
      if (newProgress) {
        setProgress(newProgress);
        setSessionStarted(true);
        setCurrentQuestionStartTime(new Date());
      }
    } catch (error) {
      console.error('Error starting section:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionAnswer = async (questionId: string, answer: string | number, isCorrect: boolean) => {
    if (!userInfo || !sectionData || !currentQuestionStartTime) return;

    const responseTime = Math.floor((new Date().getTime() - currentQuestionStartTime.getTime()) / 1000);
    const currentQuestion = questions[currentQuestionIndex];

    // Record the response
    await QuestionsService.recordQuestionResponse({
      user_id: userInfo.id,
      section_id: sectionData.section_id,
      question_id: questionId,
      user_answer: answer.toString(),
      is_correct: isCorrect,
      response_time: responseTime,
      points_earned: isCorrect ? currentQuestion.points : 0
    });

    // Update local state
    setAnsweredQuestions(prev => new Set([...prev, questionId]));
    setUserAnswers(prev => ({ ...prev, [questionId]: answer.toString() }));

    // Move to next question or show results
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentQuestionStartTime(new Date());
      } else {
        completeSection();
      }
    }, 2000);
  };

  const completeSection = async () => {
    if (!userInfo) return;

    const success = await QuestionsService.completeSection(userInfo.id, sectionNumber);
    if (success) {
      // Reload progress to get final stats
      const finalProgress = await QuestionsService.getUserSectionProgress(userInfo.id, sectionNumber);
      setProgress(finalProgress);
      setShowResults(true);
    }
  };

  const getProgressPercentage = () => {
    if (!questions.length) return 0;
    return Math.round(((currentQuestionIndex + 1) / questions.length) * 100);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

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

  // Show loading screen while loading section data
  if (isLoading && !sectionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              📚 Loading Section {sectionNumber}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Preparing your learning materials...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show results page
  if (showResults && progress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Section Completed!
            </h1>
            <h2 className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              {sectionData?.title}
            </h2>
            
            {/* Results Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {progress.questions_correct}/{progress.questions_answered}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Questions Correct</div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.round((progress.questions_correct / progress.questions_answered) * 100)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Accuracy</div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {progress.total_score}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Points</div>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {Math.round(progress.time_spent / 60)}m
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Time Spent</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                🏠 Back to Home
              </button>
              
              <button
                                    onClick={() => router.push('/')}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                📊 View All My Scores
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main section page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        {sectionData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">📚</span>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Section {sectionNumber}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(sectionData.difficulty)}`}>
                    {sectionData.difficulty}
                  </span>
                </div>
                <h2 className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                  {sectionData.title}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {sectionData.description}
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Duration</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  ~{sectionData.duration_minutes} minutes
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {sectionData.total_questions} questions
                </div>
              </div>
            </div>

            {!sessionStarted ? (
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Ready to start this section? You'll answer {sectionData.total_questions} questions 
                  covering {sectionData.title.toLowerCase()}.
                </p>
                <button
                  onClick={startSection}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Starting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>🚀</span>
                      Start Section {sectionNumber}
                    </span>
                  )}
                </button>
              </div>
            ) : (
              /* Progress Bar */
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {getProgressPercentage()}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Question Display */}
        {sessionStarted && currentQuestion && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm font-medium">
                    {currentQuestion.question_category}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
                  </span>
                </div>
                                                <Timer
                  initialTime={currentQuestion.time_limit}
                  onComplete={() => {
                    // Auto-submit with empty answer if time runs out
                    handleQuestionAnswer(currentQuestion.question_id, '', false);
                  }}
                />
              </div>
            </div>

            <div className="p-8">
              <QuizCard
                key={currentQuestion.question_id}
                question={{
                  id: currentQuestion.question_id,
                  question: currentQuestion.question_text,
                  type: currentQuestion.question_type,
                  options: currentQuestion.options || [],
                  correctAnswer: currentQuestion.question_type === 'multiple-choice' 
                    ? parseInt(currentQuestion.correct_answer) 
                    : currentQuestion.correct_answer,
                  explanation: currentQuestion.explanation,
                  timeLimit: currentQuestion.time_limit,
                  aiGenerated: false
                }}
                onAnswer={(answer, isCorrect) => handleQuestionAnswer(currentQuestion.question_id, answer, isCorrect)}
                onTimeUp={() => handleQuestionAnswer(currentQuestion.question_id, '', false)}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
} 