'use client';

import { useState } from 'react';
import { SectionsService } from '@/lib/sections-service';
import { supabase } from '@/lib/supabase';

export default function TestDbPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setResult('');
    
    try {
      // Check database availability
      const isDatabaseAvailable = SectionsService.isAvailable();
      setResult(`Database available: ${isDatabaseAvailable}\n`);

      if (isDatabaseAvailable) {
        setResult(prev => prev + 'Testing database connection...\n');
        
        // Test user login
        setResult(prev => prev + 'Testing user login...\n');
        const loginResult = await SectionsService.loginUser('Test User', 'test@example.com');
        setResult(prev => prev + `Login result: ${JSON.stringify(loginResult, null, 2)}\n`);
        
        // Test get all users
        setResult(prev => prev + 'Testing get all users...\n');
        const users = await SectionsService.getAllUsers();
        setResult(prev => prev + `Users found: ${users.length}\n`);
        setResult(prev => prev + `Users data: ${JSON.stringify(users, null, 2)}\n`);
        
        // Test save question answer WITH response time
        setResult(prev => prev + 'Testing save question answer with response time...\n');
        const testAnswer = {
          user_id: 'test@example.com',
          section_id: 1,
          question_id: 'test-q1-with-time',
          user_answer: 'Test Answer',
          is_correct: true,
          response_time: 25, // 25 seconds response time
          points_earned: 1,
          created_at: new Date().toISOString()
        };
        const answerSaved = await SectionsService.saveUserAnswer('test@example.com', testAnswer);
        setResult(prev => prev + `Answer saved: ${answerSaved}\n`);
        
        // Test save progress WITH time spent
        setResult(prev => prev + 'Testing save progress with time spent...\n');
        const testProgress = {
          user_id: 'test@example.com',
          section_id: 1,
          questions_answered: 2,
          questions_correct: 1,
          total_score: 1,
          completion_percentage: 50,
          time_spent: 180, // 3 minutes (180 seconds)
          status: 'completed' as const,
          completed_at: new Date().toISOString()
        };
        const progressSaved = await SectionsService.updateUserProgress('test@example.com', testProgress);
        setResult(prev => prev + `Progress saved: ${progressSaved}\n`);

        // VERIFY: Check if response_time was actually saved
        setResult(prev => prev + '\n=== VERIFICATION ===\n');
        setResult(prev => prev + 'Checking if response_time was saved...\n');
        try {
          const { data: savedAnswers, error } = await supabase
            .from('user_question_responses')
            .select('question_id, user_answer, response_time, is_correct')
            .eq('user_email', 'test@example.com')
            .eq('question_id', 'test-q1-with-time');
            
          if (error) {
            setResult(prev => prev + `❌ Error fetching saved answer: ${error.message}\n`);
          } else {
            setResult(prev => prev + `✅ Saved answer with response_time: ${JSON.stringify(savedAnswers, null, 2)}\n`);
          }
        } catch (error) {
          setResult(prev => prev + `❌ Error during verification: ${error}\n`);
        }

        // VERIFY: Check if time_spent was actually saved  
        setResult(prev => prev + 'Checking if time_spent was saved...\n');
        try {
          const { data: savedProgress, error } = await supabase
            .from('user_section_progress')
            .select('section_id, time_spent, completion_percentage, status')
            .eq('user_email', 'test@example.com')
            .eq('section_id', 1);
            
          if (error) {
            setResult(prev => prev + `❌ Error fetching saved progress: ${error.message}\n`);
          } else {
            setResult(prev => prev + `✅ Saved progress with time_spent: ${JSON.stringify(savedProgress, null, 2)}\n`);
          }
        } catch (error) {
          setResult(prev => prev + `❌ Error during progress verification: ${error}\n`);
        }

        // Clean up test data
        setResult(prev => prev + '\nCleaning up test data...\n');
        try {
          await supabase
            .from('user_question_responses')
            .delete()
            .eq('user_email', 'test@example.com')
            .eq('question_id', 'test-q1-with-time');
            
          await supabase
            .from('user_section_progress')
            .delete()
            .eq('user_email', 'test@example.com')
            .eq('section_id', 1);
            
          setResult(prev => prev + '✅ Test data cleaned up\n');
        } catch (error) {
          setResult(prev => prev + `⚠️ Cleanup failed: ${error}\n`);
        }
      }
    } catch (error) {
      setResult(prev => prev + `Error: ${error}\n`);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Database Response Time Test</h1>
        <p className="text-gray-600 mb-6">
          This will test if response_time and time_spent are properly saved to the database.
        </p>
        
        <button
          onClick={runTest}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg mb-6 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run Response Time Test'}
        </button>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Test Results</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 p-4 rounded overflow-auto max-h-96">
            {result || 'Click "Run Response Time Test" to see results...'}
          </pre>
        </div>
      </div>
    </div>
  );
} 