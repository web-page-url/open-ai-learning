import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface DatabaseUser {
  id: string;
  name?: string;
  email?: string;
  mobile?: string;
  created_at: string;
  last_active: string;
}

export interface LearningSessionDB {
  id: string;
  user_id: string;
  session_title: string;
  session_type: string;
  start_time: string;
  end_time?: string;
  current_section: number;
  current_part: 'A' | 'B';
  current_step: 'warmup' | 'discussion' | 'quickfire';
  total_score: number;
  max_score: number;
  completion_percentage: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
}

export interface ModuleProgressDB {
  id: string;
  session_id: string;
  user_id: string;
  section_number: number;
  part: 'A' | 'B';
  step: 'warmup' | 'discussion' | 'quickfire';
  questions_answered: number;
  questions_correct: number;
  time_spent: number;
  completed_at?: string;
  created_at: string;
}

export interface QuestionResponseDB {
  id: string;
  session_id: string;
  user_id: string;
  question_id: string;
  question_type: 'warmup' | 'quickfire';
  section_number: number;
  part: 'A' | 'B';
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  response_time: number;
  created_at: string;
}

export interface CertificateDB {
  id: string;
  user_id: string;
  session_id: string;
  participant_name?: string;
  session_title: string;
  final_score: number;
  completion_time: string;
  duration_minutes: number;
  achievements: string[];
  certificate_url?: string;
  issued_at: string;
}

// Database service functions
export const DatabaseService = {
  // User Management
  async createUser(userData: Partial<DatabaseUser>) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Session Management
  async createSession(sessionData: Partial<LearningSessionDB>) {
    const { data, error } = await supabase
      .from('learning_sessions')
      .insert(sessionData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateSession(sessionId: string, updates: Partial<LearningSessionDB>) {
    const { data, error } = await supabase
      .from('learning_sessions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getActiveSessions() {
    const { data, error } = await supabase
      .from('learning_sessions')
      .select(`
        *,
        users (name, email)
      `)
      .in('status', ['in-progress'])
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Module Progress Tracking
  async recordModuleProgress(progressData: Partial<ModuleProgressDB>) {
    const { data, error } = await supabase
      .from('module_progress')
      .insert(progressData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getModuleResults(sectionNumber: number, part?: 'A' | 'B') {
    let query = supabase
      .from('module_progress')
      .select(`
        *,
        users (name, email),
        learning_sessions (session_title)
      `)
      .eq('section_number', sectionNumber);

    if (part) {
      query = query.eq('part', part);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Question Responses
  async recordQuestionResponse(responseData: Partial<QuestionResponseDB>) {
    const { data, error } = await supabase
      .from('question_responses')
      .insert(responseData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Analytics
  async getDashboardStats() {
    const [
      { data: totalUsers },
      { data: activeSessions },
      { data: completedSessions },
      { data: avgScores }
    ] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact' }),
      supabase.from('learning_sessions').select('id', { count: 'exact' }).eq('status', 'in-progress'),
      supabase.from('learning_sessions').select('total_score').eq('status', 'completed'),
      supabase.from('learning_sessions').select('total_score, max_score').eq('status', 'completed')
    ]);

    const averageScore = avgScores?.length 
      ? avgScores.reduce((acc, session) => acc + (session.total_score / session.max_score * 100), 0) / avgScores.length
      : 0;

    return {
      totalUsers: totalUsers?.length || 0,
      activeSessions: activeSessions?.length || 0,
      completedSessions: completedSessions?.length || 0,
      averageScore: Math.round(averageScore),
      completionRate: totalUsers?.length ? (completedSessions?.length || 0) / totalUsers.length * 100 : 0
    };
  },

  // Real-time subscriptions
  subscribeToSessions(callback: (payload: any) => void) {
    return supabase
      .channel('learning_sessions')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'learning_sessions' }, 
        callback
      )
      .subscribe();
  },

  subscribeToProgress(callback: (payload: any) => void) {
    return supabase
      .channel('module_progress')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'module_progress' },
        callback
      )
      .subscribe();
  }
}; 