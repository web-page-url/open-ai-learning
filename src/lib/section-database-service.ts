import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabase: any = null;

// Initialize Supabase only if credentials are available
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Types for database operations
export interface SectionProgress {
  sectionNumber: number;
  sectionTitle: string;
  totalQuestions: number;
  questionsCorrect: number;
  score: number;
  accuracy: number;
  timeSpent: number;
  completedAt: string;
}

export interface QuestionResponse {
  sectionNumber: number;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  responseTime: number;
  timestamp: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  mobile?: string;
}

export class SectionDatabaseService {
  private static isAvailable(): boolean {
    const isAvailable = supabase !== null && !!supabaseUrl && !!supabaseKey;
    
    if (!isAvailable) {
      console.error('🚫 Database not available - Missing environment variables:');
      console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
      console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
      console.error('   Supabase client:', supabase ? '✅ Initialized' : '❌ Not initialized');
      console.error('');
      console.error('🔧 To fix this:');
      console.error('   1. Create a Supabase project at https://supabase.com');
      console.error('   2. Create .env.local file with your credentials');
      console.error('   3. See DATABASE_SETUP.md for complete instructions');
    }
    
    return isAvailable;
  }

  // Save section completion to database
  static async saveSectionCompletion(
    userId: string, 
    completionData: SectionProgress
  ): Promise<boolean> {
    console.log('🔧 SectionDatabaseService.saveSectionCompletion called:', { userId, completionData });
    
    if (!this.isAvailable()) {
      console.log('Database not available, using localStorage only');
      return false;
    }

    try {
      console.log('🔍 Looking for section with section_number:', completionData.sectionNumber);
      
      // First, get the section UUID from section number
      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .select('id')
        .eq('section_number', completionData.sectionNumber)
        .single();

      console.log('📚 Section lookup result:', { sectionData, sectionError });

      if (sectionError || !sectionData) {
        console.error('Error finding section:', sectionError);
        return false;
      }

      const sectionId = sectionData.id;
      console.log('✅ Found section ID:', sectionId);

      // Upsert user section progress
      const progressPayload = {
        user_id: userId,
        section_id: sectionId,
        questions_answered: completionData.totalQuestions,
        questions_correct: completionData.questionsCorrect,
        total_score: completionData.score,
        max_possible_score: completionData.totalQuestions,
        time_spent: completionData.timeSpent,
        completion_percentage: completionData.accuracy,
        status: 'completed',
        completed_at: completionData.completedAt
      };

      console.log('💾 Upserting progress with payload:', progressPayload);

      const { error: progressError } = await supabase
        .from('user_section_progress')
        .upsert(progressPayload, {
          onConflict: 'user_id,section_id'
        });

      if (progressError) {
        console.error('Error saving section progress:', progressError);
        return false;
      }

      console.log('✅ Section completion saved to database');
      return true;
    } catch (error) {
      console.error('Database save error:', error);
      return false;
    }
  }

  // Save individual question response to database
  static async saveQuestionResponse(
    userId: string,
    response: QuestionResponse
  ): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      // Get section UUID
      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .select('id')
        .eq('section_number', response.sectionNumber)
        .single();

      if (sectionError || !sectionData) {
        console.error('Error finding section:', sectionError);
        return false;
      }

      const sectionId = sectionData.id;

      // Insert question response
      const { error: responseError } = await supabase
        .from('user_question_responses')
        .upsert({
          user_id: userId,
          section_id: sectionId,
          question_id: response.questionId,
          user_answer: response.answer,
          is_correct: response.isCorrect,
          response_time: response.responseTime,
          points_earned: response.isCorrect ? 1 : 0,
          created_at: response.timestamp
        }, {
          onConflict: 'user_id,question_id',
          ignoreDuplicates: true
        });

      return !responseError;
    } catch (error) {
      console.error('Database save error:', error);
      return false;
    }
  }

  // Load user's section progress from database
  static async loadUserSectionProgress(userId: string): Promise<SectionProgress[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('user_section_progress')
        .select(`
          *,
          sections (
            section_number,
            title
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (error) {
        console.error('Error loading section progress:', error);
        return [];
      }

      return data?.map((progress: any) => ({
        sectionNumber: progress.sections.section_number,
        sectionTitle: progress.sections.title,
        totalQuestions: progress.questions_answered,
        questionsCorrect: progress.questions_correct,
        score: progress.total_score,
        accuracy: progress.completion_percentage,
        timeSpent: progress.time_spent,
        completedAt: progress.completed_at
      })) || [];
    } catch (error) {
      console.error('Database load error:', error);
      return [];
    }
  }

  // Load user's question responses from database
  static async loadUserQuestionResponses(userId: string): Promise<QuestionResponse[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('user_question_responses')
        .select(`
          *,
          sections (section_number)
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error loading question responses:', error);
        return [];
      }

      return data?.map((response: any) => ({
        sectionNumber: response.sections.section_number,
        questionId: response.question_id,
        answer: response.user_answer,
        isCorrect: response.is_correct,
        responseTime: response.response_time,
        timestamp: response.created_at
      })) || [];
    } catch (error) {
      console.error('Database load error:', error);
      return [];
    }
  }

  // Sync localStorage data to database
  static async syncLocalStorageToDatabase(userId: string): Promise<void> {
    if (!this.isAvailable()) {
      console.log('Database not available, skipping sync');
      return;
    }

    try {
      // Sync completed sections
      const completedSections = JSON.parse(localStorage.getItem('completed_sections') || '[]') as SectionProgress[];
      for (const completion of completedSections) {
        await this.saveSectionCompletion(userId, completion);
      }

      // Sync question responses
      const questionResponses = JSON.parse(localStorage.getItem('section_progress') || '[]') as QuestionResponse[];
      for (const response of questionResponses) {
        await this.saveQuestionResponse(userId, response);
      }

      console.log('✅ LocalStorage data synced to database');
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  // Load database data and merge with localStorage
  static async loadAndMergeData(userId: string): Promise<{
    completedSections: SectionProgress[];
    questionResponses: QuestionResponse[];
  }> {
    try {
      // Load from localStorage
      const localCompletions = JSON.parse(localStorage.getItem('completed_sections') || '[]') as SectionProgress[];
      const localResponses = JSON.parse(localStorage.getItem('section_progress') || '[]') as QuestionResponse[];

      if (!this.isAvailable()) {
        return {
          completedSections: localCompletions,
          questionResponses: localResponses
        };
      }

      // Load from database
      const dbCompletions = await this.loadUserSectionProgress(userId);
      const dbResponses = await this.loadUserQuestionResponses(userId);

      // Merge data (prioritize more recent entries)
      const mergedCompletions = this.mergeCompletionData(localCompletions, dbCompletions);
      const mergedResponses = this.mergeResponseData(localResponses, dbResponses);

      // Update localStorage with merged data
      localStorage.setItem('completed_sections', JSON.stringify(mergedCompletions));
      localStorage.setItem('section_progress', JSON.stringify(mergedResponses));

      return {
        completedSections: mergedCompletions,
        questionResponses: mergedResponses
      };
    } catch (error) {
      console.error('Load and merge error:', error);
      return {
        completedSections: JSON.parse(localStorage.getItem('completed_sections') || '[]'),
        questionResponses: JSON.parse(localStorage.getItem('section_progress') || '[]')
      };
    }
  }

  // Helper method to merge completion data
  private static mergeCompletionData(local: SectionProgress[], db: SectionProgress[]): SectionProgress[] {
    const merged = new Map<number, SectionProgress>();

    // Add local data
    local.forEach(completion => {
      merged.set(completion.sectionNumber, completion);
    });

    // Add/overwrite with database data if it's more recent
    db.forEach(completion => {
      const existing = merged.get(completion.sectionNumber);
      if (!existing || new Date(completion.completedAt) > new Date(existing.completedAt)) {
        merged.set(completion.sectionNumber, completion);
      }
    });

    return Array.from(merged.values());
  }

  // Helper method to merge response data
  private static mergeResponseData(local: QuestionResponse[], db: QuestionResponse[]): QuestionResponse[] {
    const merged = new Map<string, QuestionResponse>();

    // Add local data
    local.forEach(response => {
      const key = `${response.sectionNumber}-${response.questionId}`;
      merged.set(key, response);
    });

    // Add/overwrite with database data if it's more recent
    db.forEach(response => {
      const key = `${response.sectionNumber}-${response.questionId}`;
      const existing = merged.get(key);
      if (!existing || new Date(response.timestamp) > new Date(existing.timestamp)) {
        merged.set(key, response);
      }
    });

    return Array.from(merged.values());
  }

  // Check if database is available
  static async testDatabaseConnection(): Promise<boolean> {
    console.log('🔍 Testing database connection...');
    
    if (!this.isAvailable()) {
      console.log('❌ Database client not available');
      return false;
    }

    try {
      console.log('📡 Attempting to connect to Supabase...');
      const { data, error } = await supabase
        .from('sections')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ Database connection test failed:', error);
        return false;
      }
      
      console.log('✅ Database connection successful!');
      return true;
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return false;
    }
  }

  // Public method to check if database is available
  static isDatabaseAvailable(): boolean {
    return this.isAvailable();
  }

  // Delete user's progress data from database
  static async deleteUserProgress(userId: string): Promise<boolean> {
    if (!this.isAvailable()) {
      console.log('Database not available, cannot delete from database');
      return false;
    }

    try {
      console.log('🗑️ Deleting user progress from database for user:', userId);

      // Delete user section progress
      const { error: progressError } = await supabase
        .from('user_section_progress')
        .delete()
        .eq('user_id', userId);

      if (progressError) {
        console.error('Error deleting user section progress:', progressError);
        return false;
      }

      // Delete user question responses
      const { error: responsesError } = await supabase
        .from('user_question_responses')
        .delete()
        .eq('user_id', userId);

      if (responsesError) {
        console.error('Error deleting user question responses:', responsesError);
        return false;
      }

      console.log('✅ Successfully deleted user progress from database');
      return true;
    } catch (error) {
      console.error('Error deleting user progress:', error);
      return false;
    }
  }

  // Delete user account entirely (optional - more nuclear option)
  static async deleteUserAccount(userId: string): Promise<boolean> {
    if (!this.isAvailable()) {
      console.log('Database not available, cannot delete from database');
      return false;
    }

    try {
      console.log('🗑️ Deleting user account from database for user:', userId);

      // This will cascade delete all related progress and responses due to foreign key constraints
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (userError) {
        console.error('Error deleting user account:', userError);
        return false;
      }

      console.log('✅ Successfully deleted user account from database');
      return true;
    } catch (error) {
      console.error('Error deleting user account:', error);
      return false;
    }
  }

  // Ensure sections table has the basic sections
  static async initializeSections(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      console.log('🔧 Checking if sections table needs initialization...');
      
      // Check if sections exist
      const { data: existingSections, error: fetchError } = await supabase
        .from('sections')
        .select('section_number')
        .order('section_number');

      if (fetchError) {
        console.error('Error checking sections:', fetchError);
        return false;
      }

      console.log('📚 Existing sections:', existingSections?.map((s: any) => s.section_number) || []);

      // Define the sections we need - Updated for GitHub Copilot topics
      const requiredSections = [
        { section_number: 1, title: 'What is GitHub Copilot?', slug: 'what-is-github-copilot', description: 'Understanding GitHub Copilot as an AI pair programmer' },
        { section_number: 2, title: 'Key Features and Plans', slug: 'key-features-and-plans', description: 'Exploring GitHub Copilot\'s features and subscription options' },
        { section_number: 3, title: 'Working with VS Code', slug: 'working-with-vs-code', description: 'Using GitHub Copilot effectively in Visual Studio Code' },
        { section_number: 4, title: 'Framework-Specific Support', slug: 'framework-specific-support', description: 'How GitHub Copilot works with different frameworks' },
        { section_number: 5, title: 'Responsible Use and Limitations', slug: 'responsible-use-and-limitations', description: 'Understanding responsible AI practices with GitHub Copilot' },
        { section_number: 6, title: 'Hands-On Examples Overview', slug: 'hands-on-examples-overview', description: 'Practical examples of using GitHub Copilot' }
      ];

      const existingNumbers = new Set(existingSections?.map((s: any) => s.section_number) || []);
      const sectionsToAdd = requiredSections.filter(section => !existingNumbers.has(section.section_number));

      if (sectionsToAdd.length > 0) {
        console.log('➕ Adding missing sections:', sectionsToAdd.map(s => s.section_number));
        
        const { error: insertError } = await supabase
          .from('sections')
          .insert(sectionsToAdd);

        if (insertError) {
          console.error('Error inserting sections:', insertError);
          return false;
        }

        console.log('✅ Sections inserted successfully');
      } else {
        console.log('✅ All sections already exist');
      }

      // Update existing sections with new titles (in case they have old HTML/CSS titles)
      console.log('🔄 Updating existing section titles...');
      
      for (const section of requiredSections) {
        if (existingNumbers.has(section.section_number)) {
          console.log(`📝 Updating section ${section.section_number}: "${section.title}"`);
          
          const { error: updateError } = await supabase
            .from('sections')
            .update({
              title: section.title,
              description: section.description,
              slug: section.slug,
              updated_at: new Date().toISOString()
            })
            .eq('section_number', section.section_number);

          if (updateError) {
            console.error(`Error updating section ${section.section_number}:`, updateError);
          } else {
            console.log(`✅ Updated section ${section.section_number}`);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error initializing sections:', error);
      return false;
    }
  }

  // Ensure user exists in the users table
  static async ensureUserExists(userId: string, userName: string, userEmail: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      console.log('👤 Ensuring user exists:', { userId, userName, userEmail });
      
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          name: userName,
          email: userEmail,
          last_active: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (upsertError) {
        console.error('Error ensuring user exists:', upsertError);
        return false;
      }

      console.log('✅ User ensured in database');
      return true;
    } catch (error) {
      console.error('Error ensuring user exists:', error);
      return false;
    }
  }

  // Update sections with new GitHub Copilot titles (call this to fix admin dashboard)
  static async updateSectionTitles(): Promise<boolean> {
    if (!this.isAvailable()) {
      console.log('Database not available');
      return false;
    }

    try {
      console.log('🔄 Updating section titles to GitHub Copilot topics...');
      
      // Updated section titles for GitHub Copilot
      const updatedSections = [
        { section_number: 1, title: 'What is GitHub Copilot?', description: 'Understanding GitHub Copilot as an AI pair programmer' },
        { section_number: 2, title: 'Key Features and Plans', description: 'Exploring GitHub Copilot\'s features and subscription options' },
        { section_number: 3, title: 'Working with VS Code', description: 'Using GitHub Copilot effectively in Visual Studio Code' },
        { section_number: 4, title: 'Framework-Specific Support', description: 'How GitHub Copilot works with different frameworks' },
        { section_number: 5, title: 'Responsible Use and Limitations', description: 'Understanding responsible AI practices with GitHub Copilot' },
        { section_number: 6, title: 'Hands-On Examples Overview', description: 'Practical examples of using GitHub Copilot' }
      ];

      for (const section of updatedSections) {
        console.log(`📝 Updating section ${section.section_number}: "${section.title}"`);
        
        const { error: updateError } = await supabase
          .from('sections')
          .upsert({
            section_number: section.section_number,
            title: section.title,
            description: section.description,
            slug: section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            duration_minutes: 30 + (section.section_number * 5), // Variable duration
            difficulty: section.section_number <= 2 ? 'beginner' : section.section_number <= 4 ? 'intermediate' : 'advanced',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'section_number'
          });

        if (updateError) {
          console.error(`Error updating section ${section.section_number}:`, updateError);
          return false;
        } else {
          console.log(`✅ Updated section ${section.section_number}`);
        }
      }

      console.log('✅ All section titles updated successfully!');
      return true;
    } catch (error) {
      console.error('Error updating section titles:', error);
      return false;
    }
  }
} 