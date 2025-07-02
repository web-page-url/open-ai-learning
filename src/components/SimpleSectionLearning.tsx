'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sectionData, Question, SectionData } from '@/data/section-questions';
import QuizCard from '@/components/quiz/QuizCard';
import Timer from '@/components/ui/Timer';
import { SectionsService } from '@/lib/sections-service';
import { CertificateManager } from '@/lib/certificate-manager';
import { UserSession } from '@/lib/user-session';

interface SimpleSectionLearningProps {
  sectionNumber: number;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  mobile?: string;
}

interface UserProgress {
  currentQuestionIndex: number;
  answeredQuestions: Set<string>;
  userAnswers: Record<string, string>;
  score: number;
  totalQuestions: number;
  startTime: Date;
  questionsCorrect: number;
}

export default function SimpleSectionLearning({ sectionNumber }: SimpleSectionLearningProps) {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [sectionInfo, setSectionInfo] = useState<SectionData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [progress, setProgress] = useState<UserProgress>({
    currentQuestionIndex: 0,
    answeredQuestions: new Set(),
    userAnswers: {},
    score: 0,
    totalQuestions: 0,
    startTime: new Date(),
    questionsCorrect: 0
  });
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentQuestionStartTime, setCurrentQuestionStartTime] = useState<Date | null>(null);
  const [isDatabaseConnected, setIsDatabaseConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);
  const [previousCompletion, setPreviousCompletion] = useState<any>(null);
  const [showCompletionCheck, setShowCompletionCheck] = useState(false);

  // Check authentication and load data
  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (userInfo) {
      loadSectionData();
      initializeDatabaseConnection();
    }
  }, [userInfo, sectionNumber]);

  // Start timer when question appears
  useEffect(() => {
    if (sessionStarted && questions.length > 0) {
      setCurrentQuestionStartTime(new Date());
    }
  }, [sessionStarted, progress.currentQuestionIndex, questions.length]);

  const checkAuthentication = () => {
    setIsCheckingAuth(true);
    
    try {
      const currentUser = UserSession.getCurrentUser();
      
      if (!currentUser) {
        router.push('/login');
        return;
      }
      
      // Convert UserSession format to UserInfo format expected by this component
      const userInfo = {
        id: currentUser.email, // Use email as ID for consistency
        name: currentUser.name,
        email: currentUser.email,
        mobile: undefined
      };
      
      setUserInfo(userInfo);
      
    } catch (error) {
      console.error('Authentication check failed:', error);
      router.push('/login');
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const initializeDatabaseConnection = async () => {
    const isConnected = SectionsService.isAvailable();
    setIsDatabaseConnected(isConnected);
    
    if (isConnected && userInfo) {
      console.log('✅ Database connected - enabling hybrid storage');
      console.log('📱 Using new SectionsService for database operations');
    } else {
      console.log('📱 Database not available - using localStorage only');
    }
  };

  const loadSectionData = () => {
    const section = sectionData[sectionNumber];
    if (section) {
      setSectionInfo(section);
      setQuestions(section.questions);
      setProgress(prev => ({
        ...prev,
        totalQuestions: section.questions.length
      }));

      // Check if section is already completed
      checkForPreviousCompletion();
    }
  };

  const checkForPreviousCompletion = () => {
    try {
      const completedSections = JSON.parse(localStorage.getItem('completed_sections') || '[]');
      const existingCompletion = completedSections.find(section => section.sectionNumber === sectionNumber);
      
      if (existingCompletion) {
        console.log('🔍 Found previous completion:', existingCompletion);
        setIsAlreadyCompleted(true);
        setPreviousCompletion(existingCompletion);
        setShowCompletionCheck(true);
      } else {
        console.log('✅ No previous completion found - section available');
        setIsAlreadyCompleted(false);
        setPreviousCompletion(null);
        setShowCompletionCheck(false);
      }
    } catch (error) {
      console.error('Error checking for previous completion:', error);
      // On error, assume no completion and allow proceeding
      setIsAlreadyCompleted(false);
      setShowCompletionCheck(false);
    }
  };

  const proceedWithRetake = () => {
    console.log('🔄 User chose to retake section - will overwrite previous score');
    setShowCompletionCheck(false);
    setIsAlreadyCompleted(false);
    // Reset progress state for fresh start
    setProgress({
      currentQuestionIndex: 0,
      answeredQuestions: new Set(),
      userAnswers: {},
      score: 0,
      totalQuestions: questions.length,
      startTime: new Date(),
      questionsCorrect: 0
    });
  };

  const viewPreviousResults = () => {
    console.log('👀 User chose to view previous results');
    if (previousCompletion) {
      // Simulate completion state with previous data
      setProgress({
        currentQuestionIndex: questions.length,
        answeredQuestions: new Set(questions.map(q => q.id)),
        userAnswers: {},
        score: previousCompletion.score,
        totalQuestions: previousCompletion.totalQuestions,
        startTime: new Date(previousCompletion.completedAt),
        questionsCorrect: previousCompletion.questionsCorrect
      });
      setShowResults(true);
      setShowCompletionCheck(false);
    }
  };

  const startSection = () => {
    setSessionStarted(true);
    setProgress(prev => ({
      ...prev,
      startTime: new Date()
    }));
    // Timer will start when first question renders
  };

  const handleQuestionAnswer = (questionId: string, answer: string | number, isCorrect: boolean) => {
    const responseTime = currentQuestionStartTime 
      ? Math.floor((new Date().getTime() - currentQuestionStartTime.getTime()) / 1000)
      : 0;

    // Update progress
    setProgress(prev => ({
      ...prev,
      answeredQuestions: new Set([...Array.from(prev.answeredQuestions), questionId]),
      userAnswers: { ...prev.userAnswers, [questionId]: answer.toString() },
      score: isCorrect ? prev.score + 1 : prev.score,
      questionsCorrect: isCorrect ? prev.questionsCorrect + 1 : prev.questionsCorrect
    }));

    // Save to localStorage for persistence
    const sectionProgress = {
      sectionNumber,
      questionId,
      answer: answer.toString(),
      isCorrect,
      responseTime,
      timestamp: new Date().toISOString()
    };
    
    const existingProgress = JSON.parse(localStorage.getItem('section_progress') || '[]');
    existingProgress.push(sectionProgress);
    localStorage.setItem('section_progress', JSON.stringify(existingProgress));

    // Also save to database if connected
    if (isDatabaseConnected && userInfo) {
      console.log('💾 Saving question response to database...', {
        userEmail: userInfo.email,
        responseData: sectionProgress
      });
      
      // Convert to the format expected by SectionsService
      const answerData = {
        user_id: userInfo.email,
        section_id: sectionNumber,
        question_id: questionId,
        user_answer: answer.toString(),
        is_correct: isCorrect,
        response_time: responseTime,
        points_earned: isCorrect ? 1 : 0,
        created_at: new Date().toISOString()
      };
      
      SectionsService.saveUserAnswer(userInfo.email, answerData)
        .then((success) => {
          console.log('💾 Question response save result:', success);
        })
        .catch((error) => {
          console.error('❌ Question response save error:', error);
        });
    }

    // Move to next question or show results
    setTimeout(() => {
      if (progress.currentQuestionIndex < questions.length - 1) {
        setProgress(prev => ({
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1
        }));
        setCurrentQuestionStartTime(new Date());
      } else {
        completeSection();
      }
    }, 2000);
  };

  const completeSection = async () => {
    // Recalculate score from actual question responses to ensure accuracy
    const sectionProgress = JSON.parse(localStorage.getItem('section_progress') || '[]');
    const sectionQuestionResponses = sectionProgress.filter(response => response.sectionNumber === sectionNumber);
    const actualQuestionsCorrect = sectionQuestionResponses.filter(response => response.isCorrect).length;
    
    console.log('🔍 Score Verification:', {
      localStateCorrect: progress.questionsCorrect,
      actualResponsesCorrect: actualQuestionsCorrect,
      totalQuestions: questions.length,
      sectionResponses: sectionQuestionResponses.length
    });

    // Use the actual correct count from responses
    const finalQuestionsCorrect = actualQuestionsCorrect;
    const finalAccuracy = Math.round((finalQuestionsCorrect / questions.length) * 100);

    const completionData = {
      sectionNumber,
      sectionTitle: sectionInfo?.title || `Section ${sectionNumber}`,
      totalQuestions: questions.length,
      questionsCorrect: finalQuestionsCorrect,
      score: finalQuestionsCorrect, // Score should match questions correct
      accuracy: finalAccuracy,
      timeSpent: Math.floor((new Date().getTime() - progress.startTime.getTime()) / 1000),
      completedAt: new Date().toISOString()
    };

    console.log('🎯 Final Section Completion Data:', completionData);

    // Remove any existing completion for this section to avoid duplicates
    const completedSections = JSON.parse(localStorage.getItem('completed_sections') || '[]');
    const filteredSections = completedSections.filter(section => section.sectionNumber !== sectionNumber);
    filteredSections.push(completionData);
    localStorage.setItem('completed_sections', JSON.stringify(filteredSections));
    console.log('✅ Saved to localStorage (removed duplicates)');

    // Award section certificate permanently (using email as ID)
    if (userInfo?.email) {
      CertificateManager.awardSectionCertificate(userInfo.email, sectionNumber, {
        accuracy: finalAccuracy,
        questionsCorrect: finalQuestionsCorrect,
        totalQuestions: completionData.totalQuestions,
        timeSpent: completionData.timeSpent,
        score: finalQuestionsCorrect,
        completedAt: completionData.completedAt
      });
      console.log(`📄 Section ${sectionNumber} certificate permanently awarded with ${finalAccuracy}% accuracy`);
    }

    // Also save to database if connected
    if (isDatabaseConnected && userInfo) {
      console.log('💾 Attempting to save section completion to database...', {
        userEmail: userInfo.email,
        userData: userInfo,
        completionData
      });
      
      setIsSyncing(true);
      
      // Calculate actual questions_correct from database responses instead of local state
      try {
        const userAnswers = await SectionsService.getUserSectionAnswers(userInfo.email, sectionNumber);
        const actualQuestionsCorrect = userAnswers.filter(answer => answer.is_correct).length;
        const actualAccuracy = Math.round((actualQuestionsCorrect / questions.length) * 100);
        
        console.log('🔍 Recalculated from database:', {
          localQuestionsCorrect: completionData.questionsCorrect,
          actualQuestionsCorrect,
          localAccuracy: completionData.accuracy,
          actualAccuracy
        });
        
        // Convert to the format expected by SectionsService
        const progressData = {
          user_id: userInfo.email,
          section_id: sectionNumber,
          questions_answered: completionData.totalQuestions,
          questions_correct: actualQuestionsCorrect, // Use database-calculated value
          total_score: actualQuestionsCorrect, // Score should match questions correct
          completion_percentage: actualAccuracy, // Use database-calculated accuracy
          time_spent: completionData.timeSpent,
          status: 'completed' as const,
          completed_at: completionData.completedAt
        };
        
        SectionsService.updateUserProgress(userInfo.email, progressData)
          .then((success) => {
            console.log('💾 Section completion save result:', success);
            setIsSyncing(false);
          })
          .catch((error) => {
            console.error('❌ Section completion save error:', error);
            setIsSyncing(false);
          });
      } catch (error) {
        console.error('❌ Error calculating from database, using local values:', error);
        // Fallback to original logic if database calculation fails
        const progressData = {
          user_id: userInfo.email,
          section_id: sectionNumber,
          questions_answered: completionData.totalQuestions,
          questions_correct: completionData.questionsCorrect,
          total_score: completionData.score,
          completion_percentage: completionData.accuracy,
          time_spent: completionData.timeSpent,
          status: 'completed' as const,
          completed_at: completionData.completedAt
        };
        
        SectionsService.updateUserProgress(userInfo.email, progressData)
          .then((success) => {
            console.log('💾 Section completion save result:', success);
            setIsSyncing(false);
          })
          .catch((error) => {
            console.error('❌ Section completion save error:', error);
            setIsSyncing(false);
          });
      }
    } else {
      console.log('⚠️ Not saving to database:', {
        isDatabaseConnected,
        hasUserInfo: !!userInfo
      });
    }

    setShowResults(true);
  };

  const generateSectionCertificate = () => {
    // Recalculate accuracy from actual responses for certificate
    const sectionProgress = JSON.parse(localStorage.getItem('section_progress') || '[]');
    const sectionQuestionResponses = sectionProgress.filter(response => response.sectionNumber === sectionNumber);
    const actualQuestionsCorrect = sectionQuestionResponses.filter(response => response.isCorrect).length;
    const accuracy = Math.round((actualQuestionsCorrect / questions.length) * 100);
    
    const timeSpent = Math.floor((new Date().getTime() - progress.startTime.getTime()) / 1000);
    const completionDate = new Date();
    const participantName = userInfo?.name || 'Learning Participant';
    
    // Track section certificate download
    if (userInfo?.email) {
      const userCerts = CertificateManager.getUserCertificates(userInfo.email);
      const sectionCert = userCerts.sectionCertificates.find(cert => cert.sectionNumber === sectionNumber);
      if (sectionCert) {
        if (!sectionCert.downloadCount) sectionCert.downloadCount = 0;
        sectionCert.downloadCount++;
        sectionCert.lastDownloadedAt = new Date().toISOString();
        localStorage.setItem(`user_certificates_${userInfo.email}`, JSON.stringify(userCerts));
      }
    }
    
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Certificate - Section ${sectionNumber} - ${participantName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #2c3e50;
          }
          
          .certificate {
            background: white;
            max-width: 900px;
            margin: 0 auto;
            padding: 60px;
            border-radius: 15px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            border: 12px solid #f8f9fa;
            position: relative;
            overflow: hidden;
          }
          
          .certificate::before {
            content: '';
            position: absolute;
            top: 30px;
            left: 30px;
            right: 30px;
            bottom: 30px;
            border: 3px solid #e9ecef;
            border-radius: 8px;
            z-index: 1;
          }
          
          .content {
            position: relative;
            z-index: 2;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          
          .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
          }
          
          .title {
            font-family: 'Playfair Display', serif;
            font-size: 48px;
            color: #2c3e50;
            margin-bottom: 10px;
            font-weight: 700;
            letter-spacing: 1px;
          }
          
          .subtitle {
            font-size: 20px;
            color: #6c757d;
            margin-bottom: 30px;
            font-weight: 300;
          }
          
          .section-badge {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 30px;
          }
          
          .certification-text {
            font-size: 22px;
            color: #495057;
            margin: 30px 0;
            line-height: 1.6;
          }
          
          .recipient {
            font-family: 'Playfair Display', serif;
            font-size: 42px;
            color: #3498db;
            margin: 30px 0;
            font-weight: 700;
            text-decoration: underline;
            text-decoration-color: #e9ecef;
            text-underline-offset: 8px;
            text-decoration-thickness: 3px;
          }
          
          .course-title {
            font-size: 28px;
            color: #2c3e50;
            margin: 25px 0;
            font-weight: 600;
            font-style: italic;
          }
          
          .achievement-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 30px;
            margin: 40px 0;
            background: #f8f9fa;
            padding: 30px;
            border-radius: 12px;
            border-left: 5px solid #667eea;
          }
          
          .detail-item {
            text-align: center;
          }
          
          .detail-label {
            font-size: 14px;
            color: #6c757d;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 500;
          }
          
          .detail-value {
            font-size: 24px;
            color: #2c3e50;
            font-weight: 700;
          }
          
          .achievements {
            margin: 40px 0;
            text-align: center;
          }
          
          .achievement {
            display: inline-block;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 10px 20px;
            margin: 8px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          
          .completion-statement {
            font-size: 18px;
            color: #495057;
            margin: 30px 0;
            text-align: center;
            line-height: 1.8;
          }
          
          .signature-section {
            display: flex;
            justify-content: space-between;
            align-items: end;
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #e9ecef;
          }
          
          .signature {
            text-align: center;
            width: 220px;
          }
          
          .signature-line {
            border-top: 2px solid #2c3e50;
            margin-bottom: 8px;
          }
          
          .signature-title {
            font-weight: 600;
            margin-bottom: 5px;
            color: #2c3e50;
          }
          
          .signature-subtitle {
            font-size: 12px;
            color: #6c757d;
          }
          
          .verification-seal {
            text-align: center;
            flex-shrink: 0;
          }
          
          .seal {
            width: 120px;
            height: 120px;
            border: 4px solid #3498db;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            color: #3498db;
            font-weight: bold;
            margin: 0 auto 10px;
            background: radial-gradient(circle, rgba(52, 152, 219, 0.1) 0%, rgba(52, 152, 219, 0.05) 100%);
          }
          
          .seal-text {
            font-size: 11px;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .certificate-id {
            position: absolute;
            bottom: 20px;
            right: 30px;
            font-size: 10px;
            color: #adb5bd;
            font-family: 'Courier New', monospace;
          }
          
          .openai-badge {
            background: linear-gradient(135deg, #24292e 0%, #586069 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            margin-top: 10px;
            display: inline-block;
          }
          
          @media print {
            body { 
              background: white; 
              padding: 20px; 
            }
            .certificate { 
              box-shadow: none; 
              border: 1px solid #ddd; 
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="content">
            <div class="header">
              <div class="logo">🎓</div>
              <div class="title">CERTIFICATE OF COMPLETION</div>
              <div class="subtitle">OpenAI Learning Platform</div>
              <div class="section-badge">Section ${sectionNumber} Achievement</div>
            </div>
            
            <div class="certification-text">
              This certifies that
            </div>
            
            <div class="recipient">${participantName}</div>
            
            <div class="certification-text">
              has successfully completed
            </div>
            
            <div class="course-title">${sectionInfo?.title || `OpenAI Section ${sectionNumber}`}</div>
            
            <div class="achievement-details">
              <div class="detail-item">
                <div class="detail-label">Score Achieved</div>
                <div class="detail-value">${accuracy}%</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Questions Correct</div>
                <div class="detail-value">${progress.questionsCorrect}/${questions.length}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Time Invested</div>
                <div class="detail-value">${Math.round(timeSpent / 60)} min</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Points Earned</div>
                <div class="detail-value">${progress.score}</div>
              </div>
            </div>
            
            <div class="achievements">
              ${accuracy >= 90 ? '<span class="achievement">🌟 Excellence Achievement</span>' : ''}
              ${accuracy >= 80 ? '<span class="achievement">🎯 High Performance</span>' : ''}
              ${accuracy >= 70 ? '<span class="achievement">✅ Proficient Completion</span>' : ''}
              <span class="achievement">📚 Section ${sectionNumber} Mastery</span>
              <span class="achievement">🤖 OpenAI Knowledge</span>
            </div>
            
            <div class="completion-statement">
              This certificate validates the successful completion of Section ${sectionNumber} of our comprehensive OpenAI training program. The recipient has demonstrated proficiency in AI concepts and practical application skills.
            </div>
            
            <div class="openai-badge">
              🤖 Powered by OpenAI Learning Platform
            </div>
            
            <div class="signature-section">
              <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-title">Anubhav Chaudhary</div>
                <div class="signature-subtitle">Instructor</div>
              </div>
              
              <div class="verification-seal">
                <div class="seal">✓</div>
                <div class="seal-text">Verified Certificate</div>
              </div>
              
              <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-title">Date Issued</div>
                <div class="signature-subtitle">${completionDate.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</div>
              </div>
            </div>
            
            <div class="certificate-id">
              Certificate ID: GCP-S${sectionNumber}-${Date.now()}-${userInfo?.email?.substring(0, 8) || 'ANON'}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create and download the certificate
    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OpenAI-Section-${sectionNumber}-Certificate-${participantName.replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show success message
    alert(`🎉 Certificate downloaded successfully!\n\nSection ${sectionNumber} completion certificate has been saved to your downloads folder. You can open it in any browser and print it as a PDF.`);
  };

  const getProgressPercentage = () => {
    if (!questions.length) return 0;
    return Math.round(((progress.currentQuestionIndex + 1) / questions.length) * 100);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const currentQuestion = questions[progress.currentQuestionIndex];

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

  // Show completion check screen if section was already completed
  if (showCompletionCheck && previousCompletion) {
    const completionDate = new Date(previousCompletion.completedAt);
    const timeSince = Math.floor((new Date().getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Navigation Bar */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span>←</span>
              <span>Back to Home</span>
            </button>
          </div>

          {/* Completion Check Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Section Already Completed
            </h1>
            <h2 className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              {sectionInfo?.title}
            </h2>
            
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200/50 dark:border-yellow-700/50">
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                You completed this section <strong>{timeSince === 0 ? 'today' : `${timeSince} days ago`}</strong> on{' '}
                <strong>{completionDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</strong>.
              </p>
            </div>
          </div>

          {/* Previous Results Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              📊 Your Previous Results
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {previousCompletion.questionsCorrect}/{previousCompletion.totalQuestions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Questions Correct</div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {previousCompletion.accuracy}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Accuracy</div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {previousCompletion.score}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Points</div>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {Math.round(previousCompletion.timeSpent / 60)}m
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Time Spent</div>
              </div>
            </div>

            {/* Certificate Status */}
            {previousCompletion.accuracy >= 60 ? (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-green-200/50 dark:border-green-700/50 text-center">
                <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                  <span className="text-2xl">🏆</span>
                  <span className="font-semibold">Certificate Available</span>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 border border-orange-200/50 dark:border-orange-700/50 text-center">
                <div className="flex items-center justify-center gap-2 text-orange-700 dark:text-orange-400">
                  <span className="text-2xl">📊</span>
                  <span className="font-semibold">Certificate Not Available (Need 60%+ accuracy)</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Options */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              What would you like to do?
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* View Previous Results */}
              <div className="text-center">
                <div className="text-4xl mb-4">👀</div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  View Previous Results
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  See your detailed results from your previous attempt and download your certificate if available.
                </p>
                <button
                  onClick={viewPreviousResults}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors w-full"
                >
                  View Results & Certificate
                </button>
              </div>

              {/* Retake Section */}
              <div className="text-center">
                <div className="text-4xl mb-4">🔄</div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Retake Section
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  Start fresh and retake the entire section. <strong className="text-red-600 dark:text-red-400">Warning:</strong> This will overwrite your current score.
                </p>
                <button
                  onClick={proceedWithRetake}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors w-full"
                >
                  Retake Section
                </button>
              </div>
            </div>

            {/* Warning Notice */}
            <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-xl">⚠️</span>
                <div className="text-red-700 dark:text-red-400 text-sm">
                  <strong>Important:</strong> If you choose to retake this section, your previous score of{' '}
                  <strong>{previousCompletion.accuracy}%</strong> will be permanently replaced with your new score.
                  This action cannot be undone.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show results page
  if (showResults) {
    const accuracy = Math.round((progress.questionsCorrect / questions.length) * 100);
    const timeSpent = Math.floor((new Date().getTime() - progress.startTime.getTime()) / 1000);

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
              {sectionInfo?.title}
            </h2>
            
            {/* Results Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {progress.questionsCorrect}/{questions.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Questions Correct</div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {accuracy}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Accuracy</div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {progress.score}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Points</div>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {Math.round(timeSpent / 60)}m
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Time Spent</div>
              </div>
            </div>

            {/* Certificate Download Section */}
            {accuracy >= 60 ? (
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-4xl">🏆</span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Certificate Available!
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Congratulations! You've successfully completed Section {sectionNumber} with {accuracy}% accuracy. 
                  Download your personalized certificate as proof of completion.
                </p>
                
                <button
                  onClick={() => generateSectionCertificate()}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    <span>📄</span>
                    <span>Download Section Certificate</span>
                  </span>
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Certificate will be downloaded as a PDF-ready HTML file
                </p>
              </div>
            ) : (
              <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200/50 dark:border-orange-700/50">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-4xl">📊</span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Certificate Not Available
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  You completed Section {sectionNumber} with {accuracy}% accuracy. 
                  To earn a section certificate, you need to achieve 60% or higher accuracy.
                </p>
                
                <div className="mb-6">
                  <div className="text-center mb-3">
                    <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                      Need {60 - accuracy}% more accuracy
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(accuracy, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0%</span>
                    <span className="font-semibold">60% Required</span>
                    <span>100%</span>
                  </div>
                </div>
                
                <button
                  onClick={() => router.push(`/section-${sectionNumber}`)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    <span>🔄</span>
                    <span>Retake Section to Improve Score</span>
                  </span>
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  You can retake this section to improve your accuracy and unlock the certificate
                </p>
              </div>
            )}

            {/* Sync Status */}
            {isDatabaseConnected && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                  {isSyncing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Syncing to database...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">✅</span>
                      <span className="text-sm font-medium">Data saved to database & available across devices</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {!isDatabaseConnected && (
              <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-center gap-2 text-orange-700 dark:text-orange-400">
                  <span className="text-lg">📱</span>
                  <span className="text-sm font-medium">Data saved locally on this device only</span>
                </div>
              </div>
            )}

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

          {/* Detailed Question Review */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              📝 Question Review
            </h2>
            
                         <div className="space-y-6">
               {questions.map((question, index) => {
                 const userAnswer = progress.userAnswers[question.id];
                 const isCorrect = question.type === 'multiple-choice'
                   ? userAnswer === question.correctAnswer.toString()
                   : userAnswer === question.correctAnswer?.toString();
                
                return (
                  <div key={question.id} className={`p-6 rounded-lg border-2 ${
                    isCorrect 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  }`}>
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          isCorrect ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            question.category === 'general'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                          }`}>
                            {question.category}
                          </span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isCorrect 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </div>
                    </div>

                    {/* Question Text */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {question.question}
                      </h3>
                    </div>

                                        {/* Answers Section */}
                    {question.type === 'multiple-choice' ? (
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
                          All Options:
                        </div>
                        <div className="space-y-3">
                          {question.options?.map((option, optionIndex) => {
                            const isUserChoice = userAnswer === optionIndex.toString();
                            const isCorrectOption = optionIndex === (question.correctAnswer as number);
                            
                            return (
                              <div key={optionIndex} className={`p-4 rounded-lg border-2 flex items-center gap-3 ${
                                isCorrectOption 
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                  : isUserChoice 
                                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                  : 'border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600'
                              }`}>
                                {/* Option Label */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                  isCorrectOption 
                                    ? 'bg-green-500' 
                                    : isUserChoice 
                                    ? 'bg-red-500'
                                    : 'bg-gray-400'
                                }`}>
                                  {String.fromCharCode(65 + optionIndex)}
                                </div>
                                
                                {/* Option Text */}
                                <div className="flex-1">
                                  <div className={`font-medium ${
                                    isCorrectOption 
                                      ? 'text-green-700 dark:text-green-400' 
                                      : isUserChoice 
                                      ? 'text-red-700 dark:text-red-400'
                                      : 'text-gray-700 dark:text-gray-300'
                                  }`}>
                                    {option}
                                  </div>
                                </div>
                                
                                {/* Status Icons */}
                                <div className="flex items-center gap-2">
                                  {isCorrectOption && (
                                    <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-xs font-medium">
                                      ✓ Correct
                                    </span>
                                  )}
                                  {isUserChoice && !isCorrectOption && (
                                    <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded text-xs font-medium">
                                      Your Choice
                                    </span>
                                  )}
                                  {isUserChoice && isCorrectOption && (
                                    <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-xs font-medium">
                                      ✓ Your Choice
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      /* True/False Questions */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Your Answer */}
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                            Your Answer:
                          </div>
                          <div className={`font-semibold ${
                            isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                          }`}>
                            {userAnswer === 'true' ? 'True' : userAnswer === 'false' ? 'False' : userAnswer || 'No answer'}
                          </div>
                        </div>

                        {/* Correct Answer */}
                        <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                            Correct Answer:
                          </div>
                          <div className="font-semibold text-green-700 dark:text-green-400">
                            {question.correctAnswer === 'true' ? 'True' : question.correctAnswer === 'false' ? 'False' : question.correctAnswer}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    {question.explanation && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                        <div className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-1">
                          💡 Explanation:
                        </div>
                        <div className="text-blue-700 dark:text-blue-300">
                          {question.explanation}
                        </div>
                      </div>
                    )}

                                         {/* Question Stats */}
                     <div className="mt-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                       <span>⏱️ Time limit: {question.timeLimit}s</span>
                       <span>🎯 Points: {question.points}</span>
                       <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-xs">
                         {question.type}
                       </span>
                     </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Stats */}
            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                📊 Final Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {questions.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Questions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {progress.questionsCorrect}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Correct Answers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {questions.length - progress.questionsCorrect}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Incorrect Answers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {accuracy}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Final Accuracy</div>
                </div>
              </div>
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
        {sectionInfo && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">📚</span>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Section {sectionNumber}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(sectionInfo.difficulty)}`}>
                    {sectionInfo.difficulty}
                  </span>
                </div>
                <h2 className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                  {sectionInfo.title}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {sectionInfo.description}
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {questions.length} questions
                </div>
                {/* Database Status Indicator */}
                <div className="mt-2 flex items-center justify-end gap-2">
                  {isSyncing ? (
                    <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Syncing...
                    </span>
                  ) : isDatabaseConnected ? (
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      🔗 Database Connected
                    </span>
                  ) : (
                    <span className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                      📱 Local Storage Only
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!sessionStarted ? (
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Ready to start this section? You'll answer {questions.length} questions 
                  covering {sectionInfo.title.toLowerCase()}.
                </p>
                <button
                  onClick={startSection}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  <span className="flex items-center gap-2">
                    <span>🚀</span>
                    Start Section {sectionNumber}
                  </span>
                </button>
              </div>
            ) : (
              /* Progress Bar */
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Question {progress.currentQuestionIndex + 1} of {questions.length}
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
                    {currentQuestion.category}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
                  </span>
                </div>
                <Timer 
                  initialTime={60} 
                  onComplete={() => {
                    handleQuestionAnswer(currentQuestion.id, '', false);
                  }}
                  autoStart={true}
                  size="sm"
                />
              </div>
            </div>

            <div className="p-8">
              <QuizCard
                key={currentQuestion.id}
                question={{
                  id: currentQuestion.id,
                  question: currentQuestion.question,
                  type: currentQuestion.type,
                  options: currentQuestion.options || [],
                  correctAnswer: currentQuestion.correctAnswer,
                  explanation: currentQuestion.explanation,
                  timeLimit: currentQuestion.timeLimit,
                  aiGenerated: false
                }}
                onAnswer={(answer, correct) => handleQuestionAnswer(currentQuestion.id, answer, correct)}
                onTimeUp={() => handleQuestionAnswer(currentQuestion.id, '', false)}
                autoStart={true}
                showExplanation={progress.answeredQuestions.has(currentQuestion.id)}
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