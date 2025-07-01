'use client';

import { useState, useEffect } from 'react';
import { QuizQuestion } from '@/types/learning';
import Timer from '@/components/ui/Timer';

interface QuizCardProps {
  question: QuizQuestion;
  onAnswer: (answerId: string | number, correct: boolean) => void;
  onTimeUp: () => void;
  autoStart?: boolean;
  showExplanation?: boolean;
}

export default function QuizCard({ 
  question, 
  onAnswer, 
  onTimeUp, 
  autoStart = false,
  showExplanation = false 
}: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleAnswerSelect = (answer: string | number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    setShowResult(true);
    
    const isCorrect = answer == question.correctAnswer;
    onAnswer(answer, isCorrect);
  };

  const handleTimeUp = () => {
    if (!isAnswered) {
      setIsAnswered(true);
      setShowResult(true);
      onTimeUp();
    }
  };

  const isCorrectAnswer = (answer: string | number): boolean => {
    return answer == question.correctAnswer;
  };

  const getAnswerButtonClass = (answer: string | number, index: number): string => {
    const baseClass = "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 font-medium";
    
    if (!showResult) {
      return `${baseClass} border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer`;
    }

    if (selectedAnswer === answer) {
      if (isCorrectAnswer(answer)) {
        return `${baseClass} border-green-500 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200`;
      } else {
        return `${baseClass} border-red-500 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200`;
      }
    }

    if (isCorrectAnswer(answer)) {
      return `${baseClass} border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300`;
    }

    return `${baseClass} border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
              {question.type === 'multiple-choice' ? 'Multiple Choice' : 'True/False'}
            </span>
            {question.aiGenerated && (
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">
                AI Generated
              </span>
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {question.question}
          </h3>
        </div>
        
        {/* Timer */}
        <div className="ml-4">
          <Timer
            initialTime={question.timeLimit}
            onComplete={handleTimeUp}
            autoStart={autoStart}
            size="sm"
            color="primary"
          />
        </div>
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {question.type === 'multiple-choice' && question.options ? (
          question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={isAnswered}
              className={getAnswerButtonClass(index, index)}
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-semibold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
              </div>
            </button>
          ))
        ) : (
          // True/False options
          <>
            <button
              onClick={() => handleAnswerSelect('true')}
              disabled={isAnswered}
              className={getAnswerButtonClass('true', 0)}
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-semibold">
                  ✓
                </span>
                <span>True</span>
              </div>
            </button>
            <button
              onClick={() => handleAnswerSelect('false')}
              disabled={isAnswered}
              className={getAnswerButtonClass('false', 1)}
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-semibold">
                  ✗
                </span>
                <span>False</span>
              </div>
            </button>
          </>
        )}
      </div>

      {/* Result & Explanation */}
      {showResult && (
        <div className="mt-6 p-4 rounded-lg border-l-4">
          {selectedAnswer == question.correctAnswer ? (
            <div className="border-l-green-500 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span className="font-semibold text-green-800 dark:text-green-200">Correct!</span>
              </div>
            </div>
          ) : (
            <div className="border-l-red-500 bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-600 dark:text-red-400">✗</span>
                <span className="font-semibold text-red-800 dark:text-red-200">
                  {selectedAnswer ? 'Incorrect' : 'Time\'s up!'}
                </span>
              </div>
            </div>
          )}
          
          {question.explanation && showExplanation && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              <strong>Explanation:</strong> {question.explanation}
            </p>
          )}
        </div>
      )}

      {/* Answer Summary */}
      {isAnswered && !showResult && (
        <div className="mt-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">Answer submitted! Waiting for results...</p>
        </div>
      )}
    </div>
  );
} 