import { supabase } from './supabase';

export interface SectionData {
  section_id: string;
  title: string;
  description: string;
  slug: string;
  duration_minutes: number;
  difficulty: string;
  total_questions: number;
}

export interface QuestionData {
  question_id: string;
  question_text: string;
  question_type: 'multiple-choice' | 'true-false';
  question_category: 'warmup' | 'general' | 'quickfire';
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  time_limit: number;
  points: number;
  order_index: number;
}

export interface UserSectionProgress {
  user_id: string;
  section_id: string;
  questions_answered: number;
  questions_correct: number;
  total_score: number;
  max_possible_score: number;
  time_spent: number;
  completion_percentage: number;
  status: 'not-started' | 'in-progress' | 'completed';
  started_at?: string;
  completed_at?: string;
}

export interface UserQuestionResponse {
  user_id: string;
  section_id: string;
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  response_time: number;
  points_earned: number;
}

export class QuestionsService {
  // Get section details by section number
  static async getSectionDetails(sectionNumber: number): Promise<SectionData | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_section_details', { section_num: sectionNumber });

      if (error) {
        console.error('Error fetching section details:', error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Error in getSectionDetails:', error);
      return null;
    }
  }

  // Get all questions for a specific section
  static async getSectionQuestions(
    sectionNumber: number, 
    category?: 'warmup' | 'general' | 'quickfire'
  ): Promise<QuestionData[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_section_questions', { 
          section_num: sectionNumber,
          question_cat: category || null
        });

      if (error) {
        console.error('Error fetching section questions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSectionQuestions:', error);
      return [];
    }
  }

  // Get all sections overview
  static async getAllSections(): Promise<SectionData[]> {
    try {
      const { data, error } = await supabase
        .from('sections')
        .select(`
          id,
          section_number,
          title,
          description,
          slug,
          duration_minutes,
          difficulty,
          questions!inner(id)
        `)
        .eq('is_active', true)
        .order('section_number');

      if (error) {
        console.error('Error fetching all sections:', error);
        return [];
      }

      return data?.map(section => ({
        section_id: section.id,
        title: section.title,
        description: section.description,
        slug: section.slug,
        duration_minutes: section.duration_minutes,
        difficulty: section.difficulty,
        total_questions: section.questions?.length || 0
      })) || [];
    } catch (error) {
      console.error('Error in getAllSections:', error);
      return [];
    }
  }

  // Start or get user section progress
  static async startSectionProgress(userId: string, sectionNumber: number): Promise<UserSectionProgress | null> {
    try {
      // First get section ID
      const sectionDetails = await this.getSectionDetails(sectionNumber);
      if (!sectionDetails) return null;

      // Check if progress exists
      const { data: existingProgress, error: fetchError } = await supabase
        .from('user_section_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('section_id', sectionDetails.section_id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching progress:', fetchError);
        return null;
      }

      if (existingProgress) {
        return existingProgress;
      }

      // Create new progress record
      const { data: newProgress, error: insertError } = await supabase
        .from('user_section_progress')
        .insert({
          user_id: userId,
          section_id: sectionDetails.section_id,
          status: 'in-progress',
          started_at: new Date().toISOString(),
          max_possible_score: sectionDetails.total_questions
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating progress:', insertError);
        return null;
      }

      return newProgress;
    } catch (error) {
      console.error('Error in startSectionProgress:', error);
      return null;
    }
  }

  // Record question response
  static async recordQuestionResponse(response: UserQuestionResponse): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_question_responses')
        .insert(response);

      if (error) {
        console.error('Error recording question response:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in recordQuestionResponse:', error);
      return false;
    }
  }

  // Update section progress
  static async updateSectionProgress(
    userId: string,
    sectionId: string,
    updates: Partial<UserSectionProgress>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_section_progress')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('section_id', sectionId);

      if (error) {
        console.error('Error updating section progress:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateSectionProgress:', error);
      return false;
    }
  }

  // Get user progress for a section
  static async getUserSectionProgress(userId: string, sectionNumber: number): Promise<UserSectionProgress | null> {
    try {
      const sectionDetails = await this.getSectionDetails(sectionNumber);
      if (!sectionDetails) return null;

      const { data, error } = await supabase
        .from('user_section_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('section_id', sectionDetails.section_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user progress:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error in getUserSectionProgress:', error);
      return null;
    }
  }

  // Get user's answered questions for a section
  static async getUserAnsweredQuestions(userId: string, sectionNumber: number): Promise<string[]> {
    try {
      const sectionDetails = await this.getSectionDetails(sectionNumber);
      if (!sectionDetails) return [];

      const { data, error } = await supabase
        .from('user_question_responses')
        .select('question_id')
        .eq('user_id', userId)
        .eq('section_id', sectionDetails.section_id);

      if (error) {
        console.error('Error fetching answered questions:', error);
        return [];
      }

      return data?.map(item => item.question_id) || [];
    } catch (error) {
      console.error('Error in getUserAnsweredQuestions:', error);
      return [];
    }
  }

  // Complete section
  static async completeSection(userId: string, sectionNumber: number): Promise<boolean> {
    try {
      const sectionDetails = await this.getSectionDetails(sectionNumber);
      if (!sectionDetails) return false;

      // Calculate final stats
      const { data: responses, error: responsesError } = await supabase
        .from('user_question_responses')
        .select('is_correct, points_earned, response_time')
        .eq('user_id', userId)
        .eq('section_id', sectionDetails.section_id);

      if (responsesError) {
        console.error('Error fetching responses for completion:', responsesError);
        return false;
      }

      const totalAnswered = responses?.length || 0;
      const totalCorrect = responses?.filter(r => r.is_correct).length || 0;
      const totalScore = responses?.reduce((sum, r) => sum + r.points_earned, 0) || 0;
      const totalTime = responses?.reduce((sum, r) => sum + r.response_time, 0) || 0;
      const completionPercentage = Math.round((totalAnswered / sectionDetails.total_questions) * 100);

      const success = await this.updateSectionProgress(userId, sectionDetails.section_id, {
        questions_answered: totalAnswered,
        questions_correct: totalCorrect,
        total_score: totalScore,
        time_spent: totalTime,
        completion_percentage: completionPercentage,
        status: 'completed',
        completed_at: new Date().toISOString()
      });

      return success;
    } catch (error) {
      console.error('Error in completeSection:', error);
      return false;
    }
  }
} 