'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { reviewsService } from '@/lib/reviews-service';

export default function ReviewsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    comments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [hoveredRating, setHoveredRating] = useState(0);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!formData.comments.trim()) {
      newErrors.comments = 'Comments are required';
    } else if (formData.comments.trim().length < 10) {
      newErrors.comments = 'Comments must be at least 10 characters';
    } else if (formData.comments.trim().length > 500) {
      newErrors.comments = 'Comments must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await reviewsService.saveReview({
        name: formData.name.trim(),
        email: formData.email.trim(),
        rating: formData.rating,
        comments: formData.comments.trim()
      });

      if (success) {
        setShowSuccess(true);
        setFormData({ name: '', email: '', rating: 0, comments: '' });
        setErrors({});
        
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setErrors({ submit: 'Failed to submit review. Please try again.' });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }));
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= (hoveredRating || formData.rating);
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleRatingClick(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
          className={`text-3xl transition-all duration-200 transform hover:scale-110 ${
            isFilled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
          } hover:text-yellow-400`}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Thank You!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Your review has been submitted successfully. We appreciate your feedback!
            </p>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Return to Home
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting automatically in 3 seconds...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">O</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  OpenAI Learning Platform
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Share Your Learning Experience
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">⭐</div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Share Your Experience
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Help us improve by sharing your thoughts about the OpenAI Learning Platform. 
            Your feedback is valuable to us and other learners.
          </p>
        </div>

        {/* Review Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Your Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                  errors.name 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200'
                } focus:ring-2 focus:ring-opacity-20 focus:outline-none`}
                placeholder="Enter your full name"
                maxLength={50}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                  errors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200'
                } focus:ring-2 focus:ring-opacity-20 focus:outline-none`}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Rating Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Overall Rating *
              </label>
              <div className="flex items-center space-x-2 mb-2">
                {renderStars()}
                {formData.rating > 0 && (
                  <span className="ml-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {formData.rating} out of 5
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Click the stars to rate your experience
              </p>
              {errors.rating && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.rating}</p>
              )}
            </div>

            {/* Comments Field */}
            <div>
              <label htmlFor="comments" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Your Comments *
              </label>
              <textarea
                id="comments"
                rows={6}
                value={formData.comments}
                onChange={(e) => handleInputChange('comments', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none ${
                  errors.comments 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200'
                } focus:ring-2 focus:ring-opacity-20 focus:outline-none`}
                placeholder="Share your thoughts about the platform, course content, learning experience, etc. (10-500 characters)"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                {errors.comments ? (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.comments}</p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formData.comments.length}/500 characters
                  </p>
                )}
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg'
                } text-white`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>🚀</span>
                    Submit Review
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        {/* <div className="mt-12 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
            <div className="text-2xl mb-3">💙</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Your Privacy Matters
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Your review will be used to improve our platform. We respect your privacy and will not share your email address publicly.
            </p>
          </div>
        </div> */}
      </main>
    </div>
  );
} 