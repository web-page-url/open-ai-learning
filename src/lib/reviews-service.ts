import { supabase } from './supabase';

interface Review {
  id?: string;
  name: string;
  email: string;
  rating: number;
  comments: string;
  created_at: string;
  updated_at?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  recentReviews: Review[];
}

class ReviewsService {
  private isAvailable(): boolean {
    // Check if supabase is properly configured
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }

  async saveReview(reviewData: Omit<Review, 'id' | 'created_at' | 'status'>): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          name: reviewData.name,
          email: reviewData.email,
          rating: reviewData.rating,
          comments: reviewData.comments,
          status: 'approved' // All reviews are published immediately
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error saving review:', error);
        return false;
      }

      console.log('✅ Review saved successfully to database:', data);
      return true;
    } catch (error) {
      console.error('❌ Error saving review:', error);
      return false;
    }
  }

  async getReviews(): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase error fetching reviews:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching reviews:', error);
      return [];
    }
  }

  async getAllReviews(): Promise<Review[]> {
    // Same as getReviews since all reviews are displayed
    return this.getReviews();
  }

  async getReviewStats(): Promise<ReviewStats> {
    try {
      // Get all reviews for stats
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase error fetching review stats:', error);
        return {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: {},
          recentReviews: []
        };
      }

      const reviewsData = reviews || [];
      const totalReviews = reviewsData.length;
      
      if (totalReviews === 0) {
        return {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: {},
          recentReviews: []
        };
      }

      const averageRating = reviewsData.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
      
      const ratingDistribution = reviewsData.reduce((dist, review) => {
        dist[review.rating] = (dist[review.rating] || 0) + 1;
        return dist;
      }, {} as { [key: number]: number });

      const recentReviews = reviewsData.slice(0, 5); // Get 5 most recent

      return {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        ratingDistribution,
        recentReviews
      };
    } catch (error) {
      console.error('❌ Error calculating review stats:', error);
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {},
        recentReviews: []
      };
    }
  }

  // Admin functions removed - no moderation needed

  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('count', { count: 'exact' })
        .limit(1);

      if (error) {
        console.error('❌ Database connection test failed:', error);
        return false;
      }

      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection test error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const reviewsService = new ReviewsService();
export type { Review, ReviewStats }; 