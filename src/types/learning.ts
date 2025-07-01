// Learning Platform Types
export interface LearningSession {
  id: string;
  title: string;
  description: string;
  totalSections: number;
  currentSection: number;
  currentPart: 'A' | 'B';
  currentStep: 'warmup' | 'discussion' | 'quickfire';
  startTime: Date;
  estimatedDuration: number; // in minutes
  status: 'not-started' | 'in-progress' | 'completed';
}

export interface Section {
  id: number;
  title: string;
  description: string;
  partA: SessionPart;
  partB: SessionPart;
}

export interface SessionPart {
  id: string;
  title: string;
  warmupQuestion: QuizQuestion;
  discussionContent: DiscussionContent;
  quickfireQuestions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false';
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  timeLimit: number; // in seconds
  aiGenerated: boolean;
  prompt?: string; // If AI generated
}

export interface DiscussionContent {
  id: string;
  title: string;
  content: string;
  duration: number; // in minutes
  type: 'video' | 'text' | 'interactive';
  mediaUrl?: string;
}

export interface UserProgress {
  sessionId: string;
  currentSection: number;
  currentPart: 'A' | 'B';
  currentStep: 'warmup' | 'discussion' | 'quickfire';
  answers: Record<string, any>;
  score: number;
  timeSpent: number;
  startTime: Date;
  lastActivity: Date;
}

export interface SessionStats {
  totalParticipants: number;
  activeParticipants: number;
  averageScore: number;
  completionRate: number;
  currentActivity: string;
  responseTime: number;
  dropOffRate: number;
}

export interface PromptLog {
  id: string;
  timestamp: Date;
  type: 'quiz-generation' | 'feedback' | 'discussion' | 'certification';
  prompt: string;
  response: string;
  model: string;
  sessionId: string;
  stepId: string;
}

export interface Certificate {
  id: string;
  participantName?: string;
  sessionId: string;
  sessionTitle: string;
  score: number;
  completionTime: Date;
  duration: number;
  achievements: string[];
  issuedAt: Date;
}

export interface TimerState {
  isActive: boolean;
  timeLeft: number;
  totalTime: number;
  onComplete: () => void;
  onTick?: (timeLeft: number) => void;
}

export interface AdminAction {
  type: 'pause' | 'resume' | 'skip' | 'extend-time' | 'inject-prompt';
  payload?: any;
  timestamp: Date;
  adminId: string;
} 