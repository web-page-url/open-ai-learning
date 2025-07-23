'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sections } from '@/types/sections';
import { SectionsService } from '@/lib/sections-service';
import { CertificateManager } from '@/lib/certificate-manager';
import { UserGreeting } from '@/components/UserGreeting';
import { UserSession } from '@/lib/user-session';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  mobile?: string;
}

interface SectionCompletion {
  sectionNumber: number;
  sectionTitle: string;
  totalQuestions: number;
  questionsCorrect: number;
  score: number;
  accuracy: number;
  timeSpent: number;
  completedAt: string;
}

interface QuestionResponse {
  sectionNumber: number;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  responseTime: number;
  timestamp: string;
}

interface OverallStats {
  totalSectionsCompleted: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  totalTimeSpent: number;
  averageSectionTime: number;
  bestAccuracy: number;
  currentStreak: number;
}

export default function MyScoresPage() {
  const router = useRouter();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [sectionCompletions, setSectionCompletions] = useState<SectionCompletion[]>([]);
  const [questionResponses, setQuestionResponses] = useState<QuestionResponse[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats>({
    totalSectionsCompleted: 0,
    totalQuestionsAnswered: 0,
    totalCorrectAnswers: 0,
    overallAccuracy: 0,
    totalTimeSpent: 0,
    averageSectionTime: 0,
    bestAccuracy: 0,
    currentStreak: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [masterCertificateAvailable, setMasterCertificateAvailable] = useState(false);  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (activeTab === 'overview' && userInfo) {
      loadSectionData();
    }
  }, [activeTab, userInfo]);

  const loadUserData = () => {
    try {
      setLoading(true);
      const currentUser = UserSession.getCurrentUser();

      if (!currentUser) {
        router.push('/login');
        return;
      }

      const userInfo = {
        id: currentUser.email,
        name: currentUser.name,
        email: currentUser.email,
        mobile: undefined
      };

      setUserInfo(userInfo);
      loadSectionData();
    } catch (error) {
      console.error('Error loading user data:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadSectionData = () => {
    try {
      let completedSections = JSON.parse(localStorage.getItem('completed_sections') || '[]') as SectionCompletion[];
      console.log('📊 Loaded completed sections:', completedSections);

      const uniqueSections = [];
      const sectionMap = new Map();

      completedSections.forEach(section => {
        if (!sectionMap.has(section.sectionNumber) ||
          new Date(section.completedAt) > new Date(sectionMap.get(section.sectionNumber).completedAt)) {
          sectionMap.set(section.sectionNumber, section);
        }
      });

      completedSections = Array.from(sectionMap.values()).sort((a, b) => a.sectionNumber - b.sectionNumber);
      localStorage.setItem('completed_sections', JSON.stringify(completedSections));
      setSectionCompletions(completedSections);

      const questionProgress = JSON.parse(localStorage.getItem('section_progress') || '[]') as QuestionResponse[];
      setQuestionResponses(questionProgress);

      const correctedSections = completedSections.map(section => {
        const sectionResponses = questionProgress.filter(response => response.sectionNumber === section.sectionNumber);
        const actualCorrect = sectionResponses.filter(response => response.isCorrect).length;
        const actualAccuracy = section.totalQuestions > 0 ? Math.round((actualCorrect / section.totalQuestions) * 100) : 0;

        if (actualCorrect !== section.questionsCorrect || actualAccuracy !== section.accuracy) {
          return {
            ...section,
            questionsCorrect: actualCorrect,
            score: actualCorrect,
            accuracy: actualAccuracy
          };
        }
        return section;
      });

      if (JSON.stringify(correctedSections) !== JSON.stringify(completedSections)) {
        localStorage.setItem('completed_sections', JSON.stringify(correctedSections));
        setSectionCompletions(correctedSections);
      }

      calculateOverallStats(correctedSections, questionProgress);
    } catch (error) {
      console.error('Error loading section data:', error);
    }
  };  
const calculateOverallStats = (completions: SectionCompletion[], responses: QuestionResponse[]) => {
    const totalSections = completions.length;
    const totalQuestions = completions.reduce((sum, comp) => sum + comp.totalQuestions, 0);
    const totalCorrect = completions.reduce((sum, comp) => sum + comp.questionsCorrect, 0);
    const totalTime = completions.reduce((sum, comp) => sum + comp.timeSpent, 0);
    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const averageTime = totalSections > 0 ? Math.round(totalTime / totalSections) : 0;
    const bestAccuracy = completions.length > 0 ? Math.max(...completions.map(c => c.accuracy)) : 0;

    const newStats = {
      totalSectionsCompleted: totalSections,
      totalQuestionsAnswered: totalQuestions,
      totalCorrectAnswers: totalCorrect,
      overallAccuracy,
      totalTimeSpent: totalTime,
      averageSectionTime: averageTime,
      bestAccuracy,
      currentStreak: totalSections
    };

    if (userInfo?.email) {
      const meetsCurrentRequirements = CertificateManager.meetsMasterCertificateRequirements(totalSections, overallAccuracy);

      if (meetsCurrentRequirements) {
        const masterCertAvailable = CertificateManager.checkAndAwardMasterCertificate(userInfo.email, totalSections, overallAccuracy);
        setMasterCertificateAvailable(masterCertAvailable);
        console.log('🏆 Master certificate requirements met for user:', userInfo.email);
      } else {
        setMasterCertificateAvailable(false);
        console.log('❌ Master certificate requirements NOT met:', {
          sections: totalSections,
          accuracy: overallAccuracy,
          needsSections: totalSections < 1,
          needsAccuracy: overallAccuracy < 80
        });
      }
    }

    setOverallStats(newStats);
    return newStats;
  };

  const generateCompleteCertificate = () => {
    const participantName = userInfo?.name || 'Learning Participant';
    const completionDate = new Date();
    const courseTitle = 'OpenAI Master Course';

    if (userInfo?.email) {
      CertificateManager.incrementMasterCertificateDownload(userInfo.email);
    }    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>OpenAI Master Certificate - ${participantName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8fafc;
            color: #1e293b;
          }
          
          .certificate {
            background: white;
            max-width: 700px;
            margin: 0 auto;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            border: 2px solid #e2e8f0;
          }
          
          .header {
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 15px;
          }
          
          .logo {
            font-size: 40px;
            margin-bottom: 8px;
          }
          
          .title {
            font-size: 28px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 6px;
          }
          
          .subtitle {
            font-size: 16px;
            color: #64748b;
            margin-bottom: 12px;
          }
          
          .badge {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            padding: 6px 16px;
            border-radius: 18px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
          }
          
          .content {
            text-align: center;
            margin: 25px 0;
          }
          
          .certification-text {
            font-size: 16px;
            color: #475569;
            margin: 12px 0;
          }
          
          .recipient {
            font-size: 30px;
            font-weight: 700;
            color: #3b82f6;
            margin: 16px 0;
            text-decoration: underline;
            text-decoration-color: #e2e8f0;
            text-underline-offset: 6px;
          }
          
          .course-title {
            font-size: 20px;
            font-weight: 600;
            color: #1e293b;
            margin: 16px 0;
            font-style: italic;
          }    
      .stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin: 25px 0;
            padding: 16px;
            background: #f1f5f9;
            border-radius: 6px;
          }
          
          .stat {
            text-align: center;
          }
          
          .stat-value {
            font-size: 20px;
            font-weight: 700;
            color: #3b82f6;
          }
          
          .stat-label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #e2e8f0;
          }
          
          .signature {
            text-align: center;
          }
          
          .signature-line {
            width: 150px;
            border-top: 2px solid #1e293b;
            margin-bottom: 5px;
          }
          
          .signature-name {
            font-weight: 600;
            color: #1e293b;
          }
          
          .signature-title {
            font-size: 12px;
            color: #64748b;
          }
          
          .seal {
            width: 80px;
            height: 80px;
            border: 3px solid #fbbf24;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: #fbbf24;
            font-weight: bold;
            background: rgba(251, 191, 36, 0.1);
          }
          
          .certificate-id {
            text-align: center;
            margin-top: 20px;
            font-size: 10px;
            color: #94a3b8;
            font-family: monospace;
          }
          
          @media print {
            body { 
              background: white; 
              padding: 0; 
            }
            .certificate { 
              box-shadow: none; 
              border: 1px solid #ccc; 
            }
          }
        </style>
      </head>   
   <body>
        <div class="certificate">
          <div class="header">
            <div class="logo">🏆</div>
            <div class="title">MASTER CERTIFICATE</div>
            <div class="subtitle">OpenAI Learning Platform</div>
            <div class="badge">AI Technology Mastery</div>
          </div>
          
          <div class="content">
            <div class="certification-text">This certifies that</div>
            <div class="recipient">${participantName}</div>
            <div class="certification-text">has successfully completed</div>
            <div class="course-title">${courseTitle}</div>
            
            <div class="stats">
              <div class="stat">
                <div class="stat-value">${overallStats.overallAccuracy}%</div>
                <div class="stat-label">Accuracy</div>
              </div>
              <div class="stat">
                <div class="stat-value">${overallStats.totalQuestionsAnswered}</div>
                <div class="stat-label">Questions</div>
              </div>
              <div class="stat">
                <div class="stat-value">1/1</div>
                <div class="stat-label">Section</div>
              </div>
            </div>
            
            <div class="certification-text" style="font-size: 16px; margin-top: 20px;">
              Demonstrating comprehensive understanding of OpenAI technologies and practical AI applications
            </div>
          </div>
          
          <div class="footer">
            <div class="signature">
              <div class="signature-line"></div>
              <div class="signature-name">Anubhav Chaudhary</div>
              <div class="signature-title">Instructor</div>
            </div>
            
            <div class="seal">★</div>
            
            <div class="signature">
              <div class="signature-line"></div>
              <div class="signature-name">${completionDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })}</div>
              <div class="signature-title">Date Issued</div>
            </div>
          </div>
          
          <div class="certificate-id">
            ID: MASTER-${Date.now()}-learning
          </div>
        </div>
      </body>
      </html>
    `;   
 const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OpenAI-MASTER-Certificate-${participantName.replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`🎉 MASTER CERTIFICATE DOWNLOADED!\n\nCongratulations ${participantName}!\n\nYour OpenAI Master Certificate has been downloaded.\n\n✅ Ready for LinkedIn Profile\n✅ Portfolio Showcase\n✅ Professional Documentation\n\nYou can open the HTML file in any browser and print it as a PDF.`);
  };

  const handleLogout = () => {
    UserSession.logout();
    router.push('/login');
  };

  const clearAllData = async () => {
    const choice = confirm(
      'Choose how to clear your data:\n\n' +
      'OK = Clear progress only (keep account)\n' +
      'Cancel = Keep everything\n\n' +
      'This action cannot be undone!'
    );

    if (!choice) return;

    try {
      console.log('🗑️ Starting data clearing process...');
      localStorage.removeItem('completed_sections');
      localStorage.removeItem('section_progress');
      console.log('✅ Cleared localStorage data');

      setSectionCompletions([]);
      setQuestionResponses([]);
      setOverallStats({
        totalSectionsCompleted: 0,
        totalQuestionsAnswered: 0,
        totalCorrectAnswers: 0,
        overallAccuracy: 0,
        totalTimeSpent: 0,
        averageSectionTime: 0,
        bestAccuracy: 0,
        currentStreak: 0
      });

      alert('✅ Progress data cleared successfully!\n\nYour account is still active.');
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('❌ Error clearing data. Please try again.');
    }
  };

  const fixScoresNow = () => {
    const confirmFix = confirm('🔧 This will recalculate your scores based on your actual question responses. Continue?');
    if (!confirmFix) return;

    try {
      loadSectionData();
      alert('✅ Scores have been recalculated! Your scores should now be accurate.');
      console.log('🔧 Scores recalculated manually');
    } catch (error) {
      console.error('Error fixing scores:', error);
      alert('❌ Error fixing scores. Please try again.');
    }
  }; 
 const clearAccount = async () => {
    const confirmed = confirm(
      '⚠️ DELETE ENTIRE ACCOUNT?\n\n' +
      'This will permanently delete:\n' +
      '• Your account\n' +
      '• All progress data\n' +
      '• All quiz responses\n\n' +
      'You will need to re-register.\n\n' +
      'Are you absolutely sure?'
    );

    if (!confirmed) return;

    const doubleConfirm = confirm(
      '🚨 FINAL WARNING!\n\n' +
      'This action is PERMANENT and IRREVERSIBLE.\n\n' +
      'Type "DELETE" in the next prompt to confirm.'
    );

    if (!doubleConfirm) return;

    const finalConfirm = prompt('Type "DELETE" to permanently delete your account:');
    if (finalConfirm !== 'DELETE') {
      alert('Account deletion cancelled.');
      return;
    }

    try {
      console.log('🗑️ Starting account deletion process...');
      localStorage.removeItem('completed_sections');
      localStorage.removeItem('section_progress');
      UserSession.logout();
      console.log('✅ Cleared all localStorage data');

      alert('✅ Account deleted successfully!\n\nRedirecting to login page...');
      router.push('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('❌ Error deleting account. Please try again.');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };  const generateSectionCertificateFromScores = (sectionNumber: number, completion: SectionCompletion) => {
    const participantName = userInfo?.name || 'Learning Participant';
    const sectionInfo = sections.find(s => s.id === sectionNumber);
    const completionDate = new Date(completion.completedAt);

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
        <title>OpenAI Section Certificate - ${participantName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8fafc;
            color: #1e293b;
          }
          
          .certificate {
            background: white;
            max-width: 700px;
            margin: 0 auto;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            border: 2px solid #e2e8f0;
          }
          
          .header {
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 15px;
          }
          
          .logo {
            font-size: 40px;
            margin-bottom: 8px;
          }
          
          .title {
            font-size: 28px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 6px;
          }
          
          .subtitle {
            font-size: 16px;
            color: #64748b;
            margin-bottom: 12px;
          }
          
          .badge {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            padding: 6px 16px;
            border-radius: 18px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
          }     
     .content {
            text-align: center;
            margin: 25px 0;
          }
          
          .certification-text {
            font-size: 16px;
            color: #475569;
            margin: 12px 0;
          }
          
          .recipient {
            font-size: 30px;
            font-weight: 700;
            color: #3b82f6;
            margin: 16px 0;
            text-decoration: underline;
            text-decoration-color: #e2e8f0;
            text-underline-offset: 6px;
          }
          
          .course-title {
            font-size: 20px;
            font-weight: 600;
            color: #1e293b;
            margin: 16px 0;
            font-style: italic;
          }
          
          .stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin: 25px 0;
            padding: 16px;
            background: #f1f5f9;
            border-radius: 6px;
          }
          
          .stat {
            text-align: center;
          }
          
          .stat-value {
            font-size: 20px;
            font-weight: 700;
            color: #3b82f6;
          }
          
          .stat-label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #e2e8f0;
          }
          
          .signature {
            text-align: center;
          }
          
          .signature-line {
            width: 150px;
            border-top: 2px solid #1e293b;
            margin-bottom: 5px;
          }
          
          .signature-name {
            font-weight: 600;
            color: #1e293b;
          }
          
          .signature-title {
            font-size: 12px;
            color: #64748b;
          }          .
seal {
            width: 80px;
            height: 80px;
            border: 3px solid #fbbf24;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: #fbbf24;
            font-weight: bold;
            background: rgba(251, 191, 36, 0.1);
          }
          
          .certificate-id {
            text-align: center;
            margin-top: 20px;
            font-size: 10px;
            color: #94a3b8;
            font-family: monospace;
          }
          
          @media print {
            body { 
              background: white; 
              padding: 0; 
            }
            .certificate { 
              box-shadow: none; 
              border: 1px solid #ccc; 
            }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <div class="logo">🎓</div>
            <div class="title">SECTION CERTIFICATE</div>
            <div class="subtitle">OpenAI Learning Platform</div>
            <div class="badge">Section ${sectionNumber} Completion</div>
          </div>
          
          <div class="content">
            <div class="certification-text">This certifies that</div>
            <div class="recipient">${participantName}</div>
            <div class="certification-text">has successfully completed</div>
            <div class="course-title">${sectionInfo?.title || `OpenAI Section ${sectionNumber}`}</div>
            
            <div class="stats">
              <div class="stat">
                <div class="stat-value">${completion.accuracy}%</div>
                <div class="stat-label">Accuracy</div>
              </div>
              <div class="stat">
                <div class="stat-value">${completion.questionsCorrect}/${completion.totalQuestions}</div>
                <div class="stat-label">Questions</div>
              </div>
              <div class="stat">
                <div class="stat-value">${Math.round(completion.timeSpent / 60)}m</div>
                <div class="stat-label">Time</div>
              </div>
            </div>
            
            <div class="certification-text" style="font-size: 16px; margin-top: 20px;">
              Demonstrating proficiency in OpenAI technologies and practical applications
            </div>
          </div>     
     <div class="footer">
            <div class="signature">
              <div class="signature-line"></div>
              <div class="signature-name">Anubhav Chaudhary</div>
              <div class="signature-title">Instructor</div>
            </div>
            
            <div class="seal">✓</div>
            
            <div class="signature">
              <div class="signature-line"></div>
              <div class="signature-name">${completionDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })}</div>
              <div class="signature-title">Date Issued</div>
            </div>
          </div>
          
          <div class="certificate-id">
            ID: SECTION-${sectionNumber}-${Date.now()}-learning
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OpenAI-Section-${sectionNumber}-Certificate-${participantName.replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`🎉 Section ${sectionNumber} Certificate downloaded successfully!\n\nYour certificate has been saved to your downloads folder. You can open it in any browser and print it as a PDF.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              📊 Loading Your Scores
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Gathering your learning progress...
            </p>
          </div>
        </div>
      </div>
    );
  }  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
      <div className="max-w-7xl mx-auto">
        <UserGreeting />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                📊 My Learning Scores
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Welcome back, <span className="font-semibold">{userInfo?.name}</span>!
                Track your progress across the OpenAI learning section.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                🏠 Home
              </button>
              <button
                onClick={() => {
                  console.log('🔄 Manual refresh triggered');
                  loadSectionData();
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                🔄 Refresh Data
              </button>
              <button
                onClick={fixScoresNow}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                🔧 Fix Scores
              </button>
              <button
                onClick={clearAllData}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                🗑️ Clear Progress
              </button>
              <button
                onClick={clearAccount}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                🚨 Delete Account
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            {['overview', 'sections', 'detailed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${activeTab === tab
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                  }`}
              >
                {tab === 'overview' && '📈 Overview'}
                {tab === 'sections' && '📚 Sections'}
                {tab === 'detailed' && '🔍 Detailed'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Overall Statistics</h2>
                <button
                  onClick={() => {
                    console.log('🔍 DEBUG - Current localStorage data:');
                    console.log('completed_sections:', localStorage.getItem('completed_sections'));
                    console.log('section_progress:', localStorage.getItem('section_progress'));
                    console.log('Current overallStats state:', overallStats);
                    alert('Check browser console for localStorage debug info');
                  }}
                  className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                >
                  🔍 Debug Data
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {overallStats.totalSectionsCompleted}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Sections Completed</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {overallStats.overallAccuracy}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Overall Accuracy</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {overallStats.totalQuestionsAnswered}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Questions Answered</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {Math.floor(overallStats.totalTimeSpent / 60)}m
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Time</div>
                </div>
              </div>      
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    🏆 Master Certificate Requirements
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Complete the comprehensive OpenAI training with 80%+ accuracy to earn your Master Certificate
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Section Completed</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                        <div
                          className={`h-3 rounded-full transition-all duration-300 ${overallStats.totalSectionsCompleted >= 1
                            ? 'bg-gradient-to-r from-green-500 to-green-600'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600'
                            }`}
                          style={{ width: `${Math.min((overallStats.totalSectionsCompleted / 1) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className={`text-lg font-bold ${overallStats.totalSectionsCompleted >= 1 ? 'text-green-600' : 'text-blue-600'
                        }`}>
                        {overallStats.totalSectionsCompleted}/1 Section
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {overallStats.totalSectionsCompleted >= 1 ? '✅ Complete' : 'Complete the section'}
                      </div>
                    </div>

                    <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Overall Accuracy</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                        <div
                          className={`h-3 rounded-full transition-all duration-300 ${overallStats.overallAccuracy >= 80
                            ? 'bg-gradient-to-r from-green-500 to-green-600'
                            : 'bg-gradient-to-r from-orange-500 to-red-500'
                            }`}
                          style={{ width: `${Math.min(overallStats.overallAccuracy, 100)}%` }}
                        ></div>
                      </div>
                      <div className={`text-lg font-bold ${overallStats.overallAccuracy >= 80 ? 'text-green-600' : 'text-orange-600'
                        }`}>
                        {overallStats.overallAccuracy}% Accuracy
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {overallStats.overallAccuracy >= 80 ? '✅ Requirement Met' : `Need ${80 - overallStats.overallAccuracy}% more`}
                      </div>
                    </div>
                  </div>

                  {masterCertificateAvailable ? (
                    <div>
                      <div className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4">
                        🎉 Master Certificate Available!
                      </div>
                      <button
                        onClick={() => generateCompleteCertificate()}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                      >
                        🎓 Download Master Certificate
                      </button>
                    </div>
                  ) : (
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      Complete requirements above to unlock Master Certificate
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}     
   {activeTab === 'sections' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📚 Section Progress</h2>

              {sections.map((section) => {
                const completion = sectionCompletions.find(c => c.sectionNumber === section.id);
                const isCompleted = !!completion;

                return (
                  <div key={section.id} className="mb-6 last:mb-0">
                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold">{section.id}</span>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {section.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {section.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(section.difficulty)}`}>
                              {section.difficulty}
                            </span>
                            <span className="text-xs text-gray-500">
                              {section.questionsCount} questions
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {isCompleted ? (
                          <div>
                            <div className={`text-2xl font-bold ${completion.accuracy >= 60 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                              }`}>
                              {completion.accuracy}%
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {completion.questionsCorrect}/{completion.totalQuestions} correct
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatTime(completion.timeSpent)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(completion.completedAt).toLocaleDateString()}
                            </div>
                            {completion.accuracy >= 60 ? (
                              <div className="mt-2 space-y-2">
                                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  <span>🏆</span>
                                  <span>Certificate Available</span>
                                </div>
                                <button
                                  onClick={() => generateSectionCertificateFromScores(section.id, completion)}
                                  className="block w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                                >
                                  📄 Download Certificate
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                <span>📊</span>
                                <span>Need 60% for Certificate</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="text-gray-400 dark:text-gray-500">
                              Not completed
                            </div>
                            <button
                              onClick={() => router.push(`/section-${section.id}`)}
                              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded transition-colors"
                            >
                              Start
                            </button>
                            <div className="text-xs text-gray-500 mt-1">
                              Need 60%+ for certificate
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {sectionCompletions.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No sections completed yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Start learning by completing the OpenAI comprehensive training!
                  </p>
                  <button
                    onClick={() => router.push('/section-1')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    🚀 Start OpenAI Training
                  </button>
                </div>
              )}
            </div>
          </div>
        )}     
   {activeTab === 'detailed' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🔍 Detailed Question Responses</h2>

              {questionResponses.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {questionResponses.slice(-20).reverse().map((response, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          Section {response.sectionNumber} - Question {response.questionId}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Answer: {response.answer} • Response time: {response.responseTime}s
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(response.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${response.isCorrect
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {response.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📝</div>
                  <p className="text-gray-600 dark:text-gray-300">
                    No question responses recorded yet. Start answering questions to see detailed analytics here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}