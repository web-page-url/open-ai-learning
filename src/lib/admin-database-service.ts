import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabase: any = null;

// Initialize Supabase only if credentials are available
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Types for admin data - focused on Sections only
export interface AdminUserProgress {
  userId: string;
  userName: string;
  userEmail: string;
  sectionNumber: number;
  sectionTitle: string;
  totalQuestions: number;
  questionsCorrect: number;
  accuracy: number;
  timeSpent: number;
  completedAt: string | null;
  status: 'completed' | 'in-progress' | 'not-started';
}

export interface AdminQuestionResponse {
  userId: string;
  userName: string;
  userEmail: string;
  sectionNumber: number;
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  responseTime: number;
  timestamp: string;
}

export interface AdminSectionStats {
  sectionNumber: number;
  sectionTitle: string;
  totalUsers: number;
  completedUsers: number;
  completionRate: number;
  averageAccuracy: number;
  averageTimeSpent: number;
  totalQuestions: number;
  totalResponses: number;
}

export interface AdminOverallStats {
  totalUsers: number;
  totalSections: number;
  totalQuestions: number;
  totalResponses: number;
  overallCompletionRate: number;
  overallAccuracy: number;
  averageTimePerSection: number;
}

export class AdminDatabaseService {
  private static isAvailable(): boolean {
    return supabase !== null && !!supabaseUrl && !!supabaseKey;
  }

  // Get all users who have progress data in sections
  static async getAllUsers(): Promise<{ id: string; name: string; email: string; }[]> {
    if (!this.isAvailable()) {
      console.log('❌ Admin: Database not available');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .order('name');

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      console.log('👥 Admin: Found users:', data?.length || 0);
      console.log('👥 Admin: Users data:', data);

      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // Get sections progress data
  static async getSectionsProgress(): Promise<AdminUserProgress[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      console.log('🔍 Admin: Fetching user section progress...');
      
      // First get raw progress data
      const { data: progressData, error: progressError } = await supabase
        .from('user_section_progress')
        .select('*');

      if (progressError) {
        console.error('Error fetching sections progress:', progressError);
        return [];
      }

      console.log('📊 Admin: Raw progress records:', progressData?.length || 0);
      console.log('📊 Admin: Sample progress data:', progressData?.[0]);

      // DEBUG: Log all questions_answered values
      console.log('🐛 DEBUG: All questions_answered values:', progressData?.map((p: any) => ({
        user_email: p.user_email,
        section_id: p.section_id,
        questions_answered: p.questions_answered,
        questions_correct: p.questions_correct
      })));

      if (!progressData || progressData.length === 0) {
        console.log('❌ Admin: No progress data found');
        return [];
      }

      // Get unique user emails and section IDs
      const userEmails = Array.from(new Set(progressData.map((p: any) => p.user_email)));
      const sectionIds = Array.from(new Set(progressData.map((p: any) => p.section_id)));

      console.log('👥 Admin: Unique user emails:', userEmails);
      console.log('📚 Admin: Unique section IDs:', sectionIds);

      // Fetch users by email
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('email', userEmails);

      if (usersError) {
        console.error('Error fetching users:', usersError);
      }

      console.log('👥 Admin: Users found:', users?.length || 0);

      // Import static sections data
      const { sections: staticSections } = await import('@/types/sections');

      console.log('📚 Admin: Using static sections data:', staticSections.length);

      // Create lookup maps
      const usersMap = new Map();
      users?.forEach((user: any) => {
        usersMap.set(user.email, user); // Use email as the key instead of id
      });

      const sectionsMap = new Map();
      staticSections.forEach((section: any) => {
        sectionsMap.set(section.id, section);
      });

      // Map the data
      const result = progressData.map((progress: any) => {
        const user = usersMap.get(progress.user_email); // Use user_email instead of user_id
        const section = sectionsMap.get(progress.section_id);

        return {
          userId: progress.user_email, // Use user_email as the userId
          userName: user?.name || 'Unknown User',
          userEmail: user?.email || progress.user_email || 'unknown@email.com',
          sectionNumber: section?.id || progress.section_id || 0,
          sectionTitle: section?.title || `Section ${progress.section_id}`,
          totalQuestions: 2, // All sections have 2 questions each
          questionsCorrect: progress.questions_correct || 0,
          accuracy: progress.completion_percentage || 0,
          timeSpent: progress.time_spent || 0,
          completedAt: progress.completed_at,
          status: progress.status === 'completed' ? 'completed' as const : 
                  progress.status === 'in-progress' ? 'in-progress' as const : 
                  'not-started' as const
        };
      });

      console.log('✅ Admin: Mapped progress data:', result.length);
      if (result.length > 0) {
        console.log('✅ Admin: Sample mapped data:', {
          sectionNumber: result[0].sectionNumber,
          sectionTitle: result[0].sectionTitle,
          timeSpent: result[0].timeSpent,
          totalQuestions: result[0].totalQuestions,
          questionsCorrect: result[0].questionsCorrect,
          accuracy: result[0].accuracy
        });
      }

      return result;
    } catch (error) {
      console.error('Error fetching sections progress:', error);
      return [];
    }
  }

  // Get sections question responses
  static async getSectionsResponses(): Promise<AdminQuestionResponse[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      // Get question responses data
      const { data: responsesData, error: responsesError } = await supabase
        .from('user_question_responses')
        .select('*');

      if (responsesError) {
        console.error('Error fetching question responses:', responsesError);
        return [];
      }

      console.log('📊 Admin: Raw question responses data:', responsesData?.length || 0);
      if (responsesData && responsesData.length > 0) {
        console.log('📊 Admin: Sample response:', {
          section_id: responsesData[0].section_id,
          response_time: responsesData[0].response_time,
          user_answer: responsesData[0].user_answer,
          is_correct: responsesData[0].is_correct,
          user_email: responsesData[0].user_email
        });
      }

      if (!responsesData || responsesData.length === 0) {
        console.log('❌ Admin: No response data found');
        return [];
      }

      // Get unique user emails
      const userEmails = Array.from(new Set(responsesData.map((r: any) => r.user_email)));
      console.log('👥 Admin: Unique user emails in responses:', userEmails);

      // Fetch users by email
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('email', userEmails);

      if (usersError) {
        console.error('Error fetching users for responses:', usersError);
      }

      console.log('👥 Admin: Users found for responses:', users?.length || 0);

      // Create lookup map
      const usersMap = new Map();
      users?.forEach((user: any) => {
        usersMap.set(user.email, user);
      });

      // Map the data
      const result = responsesData.map((response: any) => {
        const user = usersMap.get(response.user_email);

        return {
          userId: response.user_email,
          userName: user?.name || 'Unknown User',
          userEmail: user?.email || response.user_email || 'unknown@email.com',
          sectionNumber: response.section_id || 0,
          questionId: response.question_id,
          userAnswer: response.user_answer,
          isCorrect: response.is_correct,
          responseTime: response.response_time || 0,
          timestamp: response.created_at
        };
      });

      console.log('✅ Admin: Mapped responses data:', result.length);
      return result;
    } catch (error) {
      console.error('Error fetching sections responses:', error);
      return [];
    }
  }

  // Get all user progress (now only from sections)
  static async getAllUserProgress(): Promise<AdminUserProgress[]> {
    try {
      return await this.getSectionsProgress();
    } catch (error) {
      console.error('Error fetching progress:', error);
      return [];
    }
  }

  // Get all question responses (now only from sections)
  static async getAllQuestionResponses(): Promise<AdminQuestionResponse[]> {
    try {
      return await this.getSectionsResponses();
    } catch (error) {
      console.error('Error fetching responses:', error);
      return [];
    }
  }

  // Get section-wise statistics
  static async getSectionStatistics(): Promise<AdminSectionStats[]> {
    try {
      const allProgress = await this.getAllUserProgress();
      const allResponses = await this.getAllQuestionResponses();

      // Group by section number
      const sectionGroups = new Map<number, AdminUserProgress[]>();
      
      allProgress.forEach(progress => {
        const sectionNumber = progress.sectionNumber;
        if (!sectionGroups.has(sectionNumber)) {
          sectionGroups.set(sectionNumber, []);
        }
        sectionGroups.get(sectionNumber)!.push(progress);
      });

      const stats: AdminSectionStats[] = [];

      sectionGroups.forEach((progressList, sectionNumber) => {
        const completedUsers = progressList.filter(p => p.status === 'completed');
        const sectionResponses = allResponses.filter(r => r.sectionNumber === sectionNumber);

        console.log(`📊 Admin: Section ${sectionNumber} stats:`, {
          totalUsers: progressList.length,
          completedUsers: completedUsers.length,
          sectionResponses: sectionResponses.length,
          timeSpents: completedUsers.map(p => p.timeSpent),
          accuracies: completedUsers.map(p => p.accuracy)
        });

        stats.push({
          sectionNumber,
          sectionTitle: progressList[0]?.sectionTitle || `Section ${sectionNumber}`,
          totalUsers: progressList.length,
          completedUsers: completedUsers.length,
          completionRate: progressList.length > 0 ? Math.round((completedUsers.length / progressList.length) * 100) : 0,
          averageAccuracy: completedUsers.length > 0 ? 
            Math.round(completedUsers.reduce((sum, p) => sum + p.accuracy, 0) / completedUsers.length) : 0,
          averageTimeSpent: completedUsers.length > 0 ?
            Math.round(completedUsers.reduce((sum, p) => sum + p.timeSpent, 0) / completedUsers.length) : 0,
          totalQuestions: Math.max(...progressList.map(p => p.totalQuestions), 0),
          totalResponses: sectionResponses.length
        });
      });

      return stats.sort((a, b) => a.sectionNumber - b.sectionNumber);
    } catch (error) {
      console.error('Error calculating section statistics:', error);
      return [];
    }
  }

  // Get overall platform statistics (now only from sections)
  static async getOverallStatistics(): Promise<AdminOverallStats> {
    try {
      const [allProgress, allResponses, allUsers] = await Promise.all([
        this.getAllUserProgress(),
        this.getAllQuestionResponses(),
        this.getAllUsers()
      ]);

      const completedProgress = allProgress.filter(p => p.status === 'completed');
      const uniqueSections = new Set(allProgress.map(p => p.sectionNumber)).size;
      const totalResponseTime = completedProgress.reduce((sum, p) => sum + p.timeSpent, 0);

      return {
        totalUsers: allUsers.length,
        totalSections: uniqueSections,
        totalQuestions: new Set(allResponses.map(r => r.questionId)).size,
        totalResponses: allResponses.length,
        overallCompletionRate: allProgress.length > 0 ? 
          Math.round((completedProgress.length / allProgress.length) * 100) : 0,
        overallAccuracy: completedProgress.length > 0 ?
          Math.round(completedProgress.reduce((sum, p) => sum + p.accuracy, 0) / completedProgress.length) : 0,
        averageTimePerSection: completedProgress.length > 0 ?
          Math.round(totalResponseTime / completedProgress.length) : 0
      };
    } catch (error) {
      console.error('Error calculating overall statistics:', error);
      return {
        totalUsers: 0,
        totalSections: 0,
        totalQuestions: 0,
        totalResponses: 0,
        overallCompletionRate: 0,
        overallAccuracy: 0,
        averageTimePerSection: 0
      };
    }
  }

  // Check database availability
  static async testConnection(): Promise<boolean> {
    if (!this.isAvailable()) {
      console.log('❌ Admin: Supabase client not initialized');
      return false;
    }

    try {
      console.log('🔍 Admin: Testing database connection...');
      
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ Admin: Database connection test failed:', error);
        return false;
      }

      console.log('✅ Admin: Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Admin: Database connection test error:', error);
      return false;
    }
  }
} 