import { createClient } from '@supabase/supabase-js';
import { Section, Question, UserProgress, UserAnswer } from '@/types/sections';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabase: any = null;

// Initialize Supabase only if credentials are available
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// User interface for database
export interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
  last_login: string;
}

export class SectionsService {
  // Check if database is available
  static isAvailable(): boolean {
    const available = supabase !== null && !!supabaseUrl && !!supabaseKey;
    console.log('🔍 SectionsService.isAvailable():', { 
      supabase: !!supabase, 
      url: !!supabaseUrl, 
      key: !!supabaseKey,
      available 
    });
    return available;
  }

  // Login user (insert or update)
  static async loginUser(name: string, email: string): Promise<DatabaseUser | null> {
    console.log('🔐 SectionsService.loginUser called with:', { name, email });
    
    if (!this.isAvailable()) {
      console.log('❌ Database not available, user logged in locally:', { name, email });
      return {
        id: 'local-' + Date.now(),
        name,
        email,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };
    }

    try {
      console.log('💾 Attempting to save user to database...');
      const { data, error } = await supabase
        .from('users')
        .upsert(
          { name, email, last_login: new Date().toISOString() },
          { onConflict: 'email', ignoreDuplicates: false }
        )
        .select()
        .single();

      if (error) {
        console.error('❌ Error logging in user:', error);
        return null;
      }

      console.log('✅ User successfully saved to database:', data);
      return data;
    } catch (error) {
      console.error('❌ Database connection error:', error);
      return null;
    }
  }

  // Get all users for dashboard
  static async getAllUsers(): Promise<DatabaseUser[]> {
    if (!this.isAvailable()) {
      return []; // Return empty array if database not available
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Database connection error:', error);
      return [];
    }
  }

  // Get all sections from database
  static async getAllSections(): Promise<Section[]> {
    console.log('📚 SectionsService.getAllSections() - using static data (no sections table needed)');
    // Always use static data since we don't need a sections table
    const { sections } = await import('@/types/sections');
    return sections;
  }

  // Get section by ID
  static async getSectionById(sectionId: number): Promise<Section | null> {
    console.log('📖 SectionsService.getSectionById() - using static data for section:', sectionId);
    // Always use static data since we don't need a sections table
    const { sections } = await import('@/types/sections');
    return sections.find(s => s.id === sectionId) || null;
  }

  // Get questions for a specific section (exactly 2 questions)
  static async getSectionQuestions(sectionId: number): Promise<Question[]> {
    console.log('❓ SectionsService.getSectionQuestions() - using static data for section:', sectionId);
    // Always use static data since we don't need a questions table
    const { sampleQuestions } = await import('@/types/sections');
    return sampleQuestions[sectionId] || [];
  }

  // Save user's answer to a question
  static async saveUserAnswer(userEmail: string, answer: UserAnswer): Promise<boolean> {
    console.log('💾 SectionsService.saveUserAnswer called with:', { userEmail, answer });
    
    if (!this.isAvailable()) {
      console.log('❌ Database not available, answer saved locally:', answer);
      return true; // Simulate success for development
    }

    try {
      console.log('💾 Attempting to save answer to database...');
      const answerData = {
        user_email: userEmail,
        section_id: answer.section_id,
        question_id: answer.question_id,
        user_answer: answer.user_answer,
        is_correct: answer.is_correct,
        response_time: answer.response_time || 0,
        points_earned: answer.points_earned,
        created_at: new Date().toISOString()
      };
      console.log('📝 Answer data to save:', answerData);

      const { data, error } = await supabase
        .from('user_question_responses')
        .upsert(answerData, {
          onConflict: 'user_email,question_id',
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        console.error('❌ Error saving user answer:', error);
        return false;
      }

      console.log('✅ Answer successfully saved to database:', data);
      return true;
    } catch (error) {
      console.error('❌ Database connection error while saving answer:', error);
      return false;
    }
  }

  // Update user's section progress
  static async updateUserProgress(userEmail: string, progress: UserProgress): Promise<boolean> {
    console.log('📊 SectionsService.updateUserProgress called with:', { userEmail, progress });
    
    if (!this.isAvailable()) {
      console.log('❌ Database not available, progress saved locally:', progress);
      return true; // Simulate success for development
    }

    try {
      console.log('💾 Attempting to save progress to database...');
      // Start with minimal required fields
      const progressData: any = {
        user_email: userEmail,
        section_id: progress.section_id,
        status: progress.status || 'completed'
      };

      // Add optional fields that might exist
      if (progress.questions_answered !== undefined) progressData.questions_answered = progress.questions_answered;
      if (progress.questions_correct !== undefined) progressData.questions_correct = progress.questions_correct;
      if (progress.total_score !== undefined) progressData.total_score = progress.total_score;
      if (progress.completion_percentage !== undefined) progressData.completion_percentage = progress.completion_percentage;
      if (progress.completed_at) progressData.completed_at = progress.completed_at;
      
      // Try to add time_spent, but don't fail if column doesn't exist
      if (progress.time_spent !== undefined) {
        progressData.time_spent = progress.time_spent;
      }
      console.log('📈 Progress data to save:', progressData);

      const { data, error } = await supabase
        .from('user_section_progress')
        .upsert(progressData, {
          onConflict: 'user_email,section_id',
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        console.error('❌ Error updating user progress:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error details:', error.details);
        console.error('❌ Error hint:', error.hint);
        console.error('❌ Data that failed to save:', progressData);
        return false;
      }

      console.log('✅ Progress successfully saved to database:', data);
      return true;
    } catch (error) {
      console.error('❌ Database connection error while saving progress:', error);
      return false;
    }
  }

  // Get user's progress for all sections
  static async getUserProgress(userEmail: string): Promise<UserProgress[]> {
    if (!this.isAvailable()) {
      return []; // Return empty array if database not available
    }

    try {
      const { data, error } = await supabase
        .from('user_section_progress')
        .select('*')
        .eq('user_email', userEmail)
        .order('section_id');

      if (error) {
        console.error('Error fetching user progress:', error);
        return [];
      }

      return data?.map((item: any) => ({
        user_id: userEmail,
        section_id: item.section_id,
        questions_answered: item.questions_answered,
        questions_correct: item.questions_correct,
        total_score: item.total_score,
        completion_percentage: item.completion_percentage,
        time_spent: item.time_spent || 0,
        status: item.status,
        completed_at: item.completed_at
      })) || [];
    } catch (error) {
      console.error('Database connection error:', error);
      return [];
    }
  }

  // Get user's answers for a specific section
  static async getUserSectionAnswers(userEmail: string, sectionId: number): Promise<UserAnswer[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('user_question_responses')
        .select('*')
        .eq('user_email', userEmail)
        .eq('section_id', sectionId)
        .order('created_at');

      if (error) {
        console.error('Error fetching user answers:', error);  
        return [];
      }

      return data?.map((item: any) => ({
        user_id: userEmail,
        section_id: item.section_id,
        question_id: item.question_id,
        user_answer: item.user_answer,
        is_correct: item.is_correct,
        response_time: item.response_time || 0,
        points_earned: item.points_earned,
        created_at: item.created_at
      })) || [];
    } catch (error) {
      console.error('Database connection error:', error);
      return [];
    }
  }

  // Helper methods for static data fallback
  private static getIconForSection(sectionId: number): string {
    const icons: Record<number, string> = {
      1: "🤖", 2: "💡", 3: "⚙️", 4: "💭", 5: "✨",
      6: "🔗", 7: "🔍", 8: "🔒", 9: "🛠️", 10: "🚀"
    };
    return icons[sectionId] || "📚";
  }

  private static getColorForSection(sectionId: number): string {
    const colors: Record<number, string> = {
      1: "from-blue-500 to-cyan-500",
      2: "from-green-500 to-emerald-500",
      3: "from-purple-500 to-violet-500",
      4: "from-orange-500 to-red-500",
      5: "from-pink-500 to-rose-500",
      6: "from-indigo-500 to-blue-500",
      7: "from-teal-500 to-green-500",
      8: "from-yellow-500 to-orange-500",
      9: "from-gray-500 to-slate-500",
      10: "from-red-500 to-pink-500"
    };
    return colors[sectionId] || "from-gray-500 to-gray-600";
  }

  // Initialize database tables if needed (for development)
  static async initializeTables(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      // Create sections table if it doesn't exist
      await supabase.rpc('create_sections_table');
      
      // Create questions table if it doesn't exist  
      await supabase.rpc('create_questions_table');
      
      // Create user progress tables if they don't exist
      await supabase.rpc('create_user_progress_tables');
      
      return true;
    } catch (error) {
      console.error('Error initializing tables:', error);
      return false;
    }
  }

  // Seed database with initial data (for development)
  static async seedDatabase(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const { sections, sampleQuestions } = await import('@/types/sections');
      
      // Insert sections
      for (const section of sections) {
        await supabase
          .from('sections')
          .upsert({
            id: section.id,
            title: section.title,
            description: section.description,
            difficulty: section.difficulty,
            slug: section.slug,
            duration_minutes: parseInt(section.estimatedTime.replace(' min', '')),
            is_active: true
          }, {
            onConflict: 'id',
            ignoreDuplicates: true
          });
      }

      // Insert questions
      for (const [sectionId, questions] of Object.entries(sampleQuestions)) {
        for (const question of questions) {
          await supabase
            .from('questions')
            .upsert(question, {
              onConflict: 'id',
              ignoreDuplicates: true
            });
        }
      }

      return true;
    } catch (error) {
      console.error('Error seeding database:', error);
      return false;
    }
  }
} 