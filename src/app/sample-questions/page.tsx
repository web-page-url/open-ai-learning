'use client';

import { sectionData } from '@/data/section-questions';

export default function SampleQuestionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              OpenAI Training - Sample Questions
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
              Complete Question Bank for Validation
            </p>
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-lg">
              <span className="text-sm font-medium">
                📚 2 Sections • 8 Questions • ✅ Answers Included
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          {Object.values(sectionData).map((section) => (
            <div key={section.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              {/* Section Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Section {section.id}: {section.title}
                    </h2>
                    <p className="text-blue-100 mt-1">
                      {section.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      section.difficulty === 'beginner' 
                        ? 'bg-green-200 text-green-800' 
                        : section.difficulty === 'intermediate'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-red-200 text-red-800'
                    }`}>
                      {section.difficulty}
                    </span>
                    <div className="text-sm text-blue-100 mt-1">
                      {section.questions.length} Questions
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className="p-6 space-y-8">
                {section.questions.map((question, qIndex) => (
                  <div key={question.id} className="border-l-4 border-blue-500 pl-6">
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Question {qIndex + 1}: {question.question}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>⏱️ {question.timeLimit}s</span>
                        <span>🎯 {question.points} pt</span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-xs">
                          {question.type}
                        </span>
                      </div>
                    </div>

                    {/* Options */}
                    {question.type === 'multiple-choice' && question.options && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Options:</h4>
                        <div className="grid gap-2">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                optIndex === question.correctAnswer
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                                  optIndex === question.correctAnswer
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                }`}>
                                  {String.fromCharCode(65 + optIndex)}
                                </span>
                                <span className="flex-1">{option}</span>
                                {optIndex === question.correctAnswer && (
                                  <span className="text-green-600 dark:text-green-400 font-medium">
                                    ✅ Correct Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* True/False Questions */}
                    {question.type === 'true-false' && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Answer:</h4>
                        <div className="flex gap-4">
                          <div className={`p-3 rounded-lg border-2 ${
                            question.correctAnswer === 'true'
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                              : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            <span className="font-medium">✅ True</span>
                            {question.correctAnswer === 'true' && (
                              <span className="ml-2 text-green-600 dark:text-green-400">← Correct</span>
                            )}
                          </div>
                          <div className={`p-3 rounded-lg border-2 ${
                            question.correctAnswer === 'false'
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                              : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            <span className="font-medium">❌ False</span>
                            {question.correctAnswer === 'false' && (
                              <span className="ml-2 text-green-600 dark:text-green-400">← Correct</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                        💡 Explanation:
                      </h4>
                      <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">📊 Question Bank Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold">2</div>
              <div className="text-green-100">Sections</div>
            </div>
            <div>
              <div className="text-3xl font-bold">8</div>
              <div className="text-green-100">Questions</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {Object.values(sectionData).filter(s => s.difficulty === 'beginner').length}
              </div>
              <div className="text-green-100">Beginner</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {Object.values(sectionData).filter(s => s.difficulty === 'intermediate').length + Object.values(sectionData).filter(s => s.difficulty === 'advanced').length}
              </div>
              <div className="text-green-100">Advanced</div>
            </div>
          </div>
          <p className="mt-6 text-green-100">
            All questions include detailed explanations and correct answers for easy validation.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© 2025 OpenAI Learning Platform - Sample Questions for Validation</p>
            <p className="mt-2">
              🔗 Share this page: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">/sample-questions</code>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 