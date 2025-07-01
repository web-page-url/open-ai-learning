'use client';

import { DatabaseService } from './supabase';
import type { 
  LearningSession, 
  UserProgress, 
  QuizQuestion 
} from '@/types/learning';

export class SessionManager {
  private userId: string | null = null;
  private sessionId: string | null = null;
  private progressCallbacks: ((progress: UserProgress) => void)[] = [];

  constructor() {
    // Generate or retrieve user ID
    this.initializeUser();
  }

    private async initializeUser() {
    // Check if user exists in localStorage
    let userId = localStorage.getItem('learning_user_id');
    
    if (!userId) {
      // Check if user has registered but not created in database yet
      const userInfo = localStorage.getItem('user_info');
      if (userInfo) {
        const parsedUserInfo = JSON.parse(userInfo);
        userId = parsedUserInfo.id;
        if (userId) localStorage.setItem('learning_user_id', userId);
      } else {
        // Create anonymous user in database
        try {
          const userData = await DatabaseService.createUser({
            id: crypto.randomUUID(),
            name: `Anonymous_${Date.now()}`,
            created_at: new Date().toISOString(),
            last_active: new Date().toISOString()
          });
          userId = userData.id;
          if (userId) localStorage.setItem('learning_user_id', userId);
        } catch (error) {
          console.error('Error creating user:', error);
          // Fallback to local UUID
          userId = crypto.randomUUID();
          localStorage.setItem('learning_user_id', userId);
        }
      }
    }
    
    this.userId = userId;
  }

  async startSession(sessionTitle: string, sessionType: string = 'web-development-masterclass') {
    if (!this.userId) {
      await this.initializeUser();
    }

    try {
      const sessionData = await DatabaseService.createSession({
        id: crypto.randomUUID(),
        user_id: this.userId!,
        session_title: sessionTitle,
        session_type: sessionType,
        start_time: new Date().toISOString(),
        current_section: 1,
        current_part: 'A',
        current_step: 'warmup',
        total_score: 0,
        max_score: 0,
        completion_percentage: 0,
        status: 'in-progress',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      this.sessionId = sessionData.id;
      if (this.sessionId) localStorage.setItem('current_session_id', this.sessionId);
      
      return sessionData;
    } catch (error) {
      console.error('Error starting session:', error);
      // Fallback to local session
      this.sessionId = crypto.randomUUID();
      localStorage.setItem('current_session_id', this.sessionId);
      return null;
    }
  }

  async updateSessionProgress(updates: {
    currentSection?: number;
    currentPart?: 'A' | 'B';
    currentStep?: 'warmup' | 'discussion' | 'quickfire';
    totalScore?: number;
    maxScore?: number;
    completionPercentage?: number;
    status?: 'not-started' | 'in-progress' | 'completed' | 'abandoned';
  }) {
    if (!this.sessionId) return null;

    try {
      const updatedSession = await DatabaseService.updateSession(this.sessionId, {
        ...updates,
        current_section: updates.currentSection,
        current_part: updates.currentPart,
        current_step: updates.currentStep,
        total_score: updates.totalScore,
        max_score: updates.maxScore,
        completion_percentage: updates.completionPercentage,
        status: updates.status,
        updated_at: new Date().toISOString()
      });

      return updatedSession;
    } catch (error) {
      console.error('Error updating session:', error);
      return null;
    }
  }

  async recordModuleCompletion(
    sectionNumber: number,
    part: 'A' | 'B',
    step: 'warmup' | 'discussion' | 'quickfire',
    questionsAnswered: number,
    questionsCorrect: number,
    timeSpent: number
  ) {
    if (!this.sessionId || !this.userId) return null;

    try {
      const progressData = await DatabaseService.recordModuleProgress({
        id: crypto.randomUUID(),
        session_id: this.sessionId,
        user_id: this.userId,
        section_number: sectionNumber,
        part,
        step,
        questions_answered: questionsAnswered,
        questions_correct: questionsCorrect,
        time_spent: timeSpent,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

      return progressData;
    } catch (error) {
      console.error('Error recording module completion:', error);
      return null;
    }
  }

  async recordQuestionResponse(
    questionId: string,
    questionType: 'warmup' | 'quickfire',
    sectionNumber: number,
    part: 'A' | 'B',
    userAnswer: string,
    correctAnswer: string,
    isCorrect: boolean,
    responseTime: number
  ) {
    if (!this.sessionId || !this.userId) return null;

    try {
      const responseData = await DatabaseService.recordQuestionResponse({
        id: crypto.randomUUID(),
        session_id: this.sessionId,
        user_id: this.userId,
        question_id: questionId,
        question_type: questionType,
        section_number: sectionNumber,
        part,
        user_answer: userAnswer,
        correct_answer: correctAnswer,
        is_correct: isCorrect,
        response_time: responseTime,
        created_at: new Date().toISOString()
      });

      return responseData;
    } catch (error) {
      console.error('Error recording question response:', error);
      return null;
    }
  }

  async completeSession(finalScore: number, duration: number) {
    if (!this.sessionId || !this.userId) return null;

    try {
      // Update session as completed
      await this.updateSessionProgress({
        status: 'completed',
        completionPercentage: 100
      });

      // Generate certificate data (you can implement actual certificate generation here)
      const certificate = {
        id: crypto.randomUUID(),
        user_id: this.userId,
        session_id: this.sessionId,
        participant_name: `User_${this.userId.substring(0, 8)}`,
        session_title: 'Interactive Web Development Masterclass',
        final_score: finalScore,
        completion_time: new Date().toISOString(),
        duration_minutes: Math.round(duration / 60),
        achievements: this.getAchievements(finalScore),
        issued_at: new Date().toISOString()
      };

      return certificate;
    } catch (error) {
      console.error('Error completing session:', error);
      return null;
    }
  }

  private getAchievements(score: number): string[] {
    const achievements = [];
    if (score >= 90) achievements.push("Excellence in Learning");
    if (score >= 80) achievements.push("Advanced Competency");
    if (score >= 70) achievements.push("Proficient Understanding");
    achievements.push("Course Completion");
    return achievements;
  }

  onProgressUpdate(callback: (progress: UserProgress) => void) {
    this.progressCallbacks.push(callback);
  }

  private notifyProgressUpdate(progress: UserProgress) {
    this.progressCallbacks.forEach(callback => callback(progress));
  }

  // Real-time subscription for session updates
  subscribeToSessionUpdates(callback: (session: any) => void) {
    return DatabaseService.subscribeToSessions((payload) => {
      if (payload.new?.id === this.sessionId) {
        callback(payload.new);
      }
    });
  }

  // Get current session ID
  getCurrentSessionId(): string | null {
    return this.sessionId || localStorage.getItem('current_session_id');
  }

  // Get current user ID
  getCurrentUserId(): string | null {
    return this.userId || localStorage.getItem('learning_user_id');
  }

  // Static method to get all module results
  static async getModuleResults(sectionNumber: number, part?: 'A' | 'B') {
    try {
      return await DatabaseService.getModuleResults(sectionNumber, part);
    } catch (error) {
      console.error('Error fetching module results:', error);
      return [];
    }
  }

  // Static method to get dashboard stats
  static async getDashboardStats() {
    try {
      return await DatabaseService.getDashboardStats();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalUsers: 0,
        activeSessions: 0,
        completedSessions: 0,
        averageScore: 0,
        completionRate: 0,
        totalQuestions: 0,
        correctAnswers: 0
      };
    }
  }
} 