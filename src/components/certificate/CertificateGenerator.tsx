'use client';

import { useState } from 'react';
import { Certificate } from '@/types/learning';

interface CertificateGeneratorProps {
  sessionData: {
    title: string;
    score: number;
    duration: number;
    completionDate: Date;
  };
  participantName?: string;
  onDownload?: () => void;
}

export default function CertificateGenerator({ 
  sessionData, 
  participantName = "Participant",
  onDownload 
}: CertificateGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCertificate = async () => {
    setIsGenerating(true);
    
    // Simulate certificate generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, you would generate a PDF here
    // For now, we'll create a visual representation
    const certificate: Certificate = {
      id: `cert-${Date.now()}`,
      participantName,
      sessionId: `session-${Date.now()}`,
      sessionTitle: sessionData.title,
      score: sessionData.score,
      completionTime: sessionData.completionDate,
      duration: sessionData.duration,
      achievements: getAchievements(sessionData.score),
      issuedAt: new Date()
    };

    downloadCertificateHTML(certificate);
    setIsGenerating(false);
    
    if (onDownload) onDownload();
  };

  const getAchievements = (score: number): string[] => {
    const achievements = [];
    if (score >= 90) achievements.push("Excellence in Learning");
    if (score >= 80) achievements.push("Advanced Competency");
    if (score >= 70) achievements.push("Proficient Understanding");
    achievements.push("Course Completion");
    return achievements;
  };

  const downloadCertificateHTML = (cert: Certificate) => {
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Certificate - ${cert.participantName}</title>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .certificate {
            background: white;
            max-width: 800px;
            margin: 0 auto;
            padding: 60px;
            border-radius: 10px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            border: 8px solid #f0f0f0;
            position: relative;
          }
          .certificate::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 3px solid #ddd;
            border-radius: 5px;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .title {
            font-size: 42px;
            color: #2c3e50;
            margin-bottom: 10px;
            font-weight: bold;
            letter-spacing: 2px;
          }
          .subtitle {
            font-size: 18px;
            color: #7f8c8d;
            margin-bottom: 30px;
          }
          .content {
            text-align: center;
            margin: 40px 0;
          }
          .recipient {
            font-size: 32px;
            color: #3498db;
            margin: 20px 0;
            font-weight: bold;
          }
          .course-title {
            font-size: 24px;
            color: #2c3e50;
            margin: 20px 0;
            font-style: italic;
          }
          .details {
            display: flex;
            justify-content: space-around;
            margin: 40px 0;
            flex-wrap: wrap;
          }
          .detail-item {
            text-align: center;
            margin: 10px;
          }
          .detail-label {
            font-size: 14px;
            color: #7f8c8d;
            margin-bottom: 5px;
          }
          .detail-value {
            font-size: 18px;
            color: #2c3e50;
            font-weight: bold;
          }
          .achievements {
            margin: 30px 0;
          }
          .achievement {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 16px;
            margin: 5px;
            border-radius: 20px;
            font-size: 14px;
          }
          .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 60px;
            align-items: end;
          }
          .signature {
            text-align: center;
            width: 200px;
          }
          .signature-line {
            border-top: 2px solid #2c3e50;
            margin-bottom: 5px;
          }
          .date {
            color: #7f8c8d;
            font-size: 14px;
          }
          .certificate-id {
            position: absolute;
            bottom: 20px;
            right: 30px;
            font-size: 10px;
            color: #bdc3c7;
          }
          @media print {
            body { background: white; padding: 0; }
            .certificate { box-shadow: none; border: 1px solid #ddd; }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <div class="title">CERTIFICATE OF COMPLETION</div>
            <div class="subtitle">Interactive Learning Platform</div>
          </div>
          
          <div class="content">
            <p style="font-size: 18px; color: #7f8c8d;">This certifies that</p>
            <div class="recipient">${cert.participantName || 'Participant'}</div>
            <p style="font-size: 18px; color: #7f8c8d;">has successfully completed</p>
            <div class="course-title">${cert.sessionTitle}</div>
            
            <div class="details">
              <div class="detail-item">
                <div class="detail-label">Score Achieved</div>
                <div class="detail-value">${cert.score}%</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Duration</div>
                <div class="detail-value">${Math.round(cert.duration)} minutes</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Completion Date</div>
                <div class="detail-value">${cert.completionTime.toLocaleDateString()}</div>
              </div>
            </div>
            
            <div class="achievements">
              ${cert.achievements.map(achievement => 
                `<span class="achievement">${achievement}</span>`
              ).join('')}
            </div>
          </div>
          
          <div class="signature-section">
            <div class="signature">
              <div class="signature-line"></div>
              <div style="font-weight: bold; margin-bottom: 5px;">Learning Platform</div>
              <div class="date">Automated Certification System</div>
            </div>
            <div style="text-align: center;">
              <div style="width: 100px; height: 100px; border: 3px solid #3498db; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #3498db; font-weight: bold;">
                ✓
              </div>
              <div style="margin-top: 10px; font-size: 12px; color: #7f8c8d;">Verified Certificate</div>
            </div>
            <div class="signature">
              <div class="signature-line"></div>
              <div style="font-weight: bold; margin-bottom: 5px;">Date Issued</div>
              <div class="date">${cert.issuedAt.toLocaleDateString()}</div>
            </div>
          </div>
          
          <div class="certificate-id">Certificate ID: ${cert.id}</div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${cert.participantName?.replace(/\s+/g, '-') || 'participant'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Certificate Ready!
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Congratulations on completing the learning session
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">Course:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{sessionData.title}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">Score:</span>
          <span className="font-semibold text-green-600">{sessionData.score}%</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">Duration:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{Math.round(sessionData.duration)} min</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600 dark:text-gray-400">Date:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {sessionData.completionDate.toLocaleDateString()}
          </span>
        </div>
      </div>

      <button
        onClick={generateCertificate}
        disabled={isGenerating}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
          isGenerating
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transform hover:scale-105 shadow-lg'
        }`}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Generating Certificate...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            📄 Download Certificate
          </span>
        )}
      </button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
        Certificate will be downloaded as an HTML file that you can print or save as PDF
      </p>
    </div>
  );
} 