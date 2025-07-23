'use client';

interface MasterCertificateRequirementsProps {
  currentSections: number;
  currentAccuracy: number;
  isAvailable: boolean;
}

export function MasterCertificateRequirements({ 
  currentSections, 
  currentAccuracy, 
  isAvailable 
}: MasterCertificateRequirementsProps) {
  const sectionsRequired = 1;
  const accuracyRequired = 80;
  
  const sectionsMet = currentSections >= sectionsRequired;
  const accuracyMet = currentAccuracy >= accuracyRequired;
  
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200/50 dark:border-purple-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          🏆 Master Certificate Requirements
        </h3>
        {isAvailable && (
          <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
            ✅ Available
          </span>
        )}
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
        Complete the comprehensive OpenAI training with high accuracy to earn your Master Certificate
      </p>
      
      <div className="space-y-3">
        {/* Section Requirement */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
              sectionsMet 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
            }`}>
              {sectionsMet ? '✓' : '1'}
            </div>
            <span className="text-gray-700 dark:text-gray-300">
              Complete the OpenAI Comprehensive Training
            </span>
          </div>
          <span className={`text-sm font-medium ${
            sectionsMet ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {currentSections}/{sectionsRequired}
          </span>
        </div>
        
        {/* Accuracy Requirement */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
              accuracyMet 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
            }`}>
              {accuracyMet ? '✓' : '%'}
            </div>
            <span className="text-gray-700 dark:text-gray-300">
              Achieve 80%+ overall accuracy
            </span>
          </div>
          <span className={`text-sm font-medium ${
            accuracyMet ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {currentAccuracy}%
          </span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Progress to Master Certificate</span>
          <span>{sectionsMet && accuracyMet ? '100%' : sectionsMet ? '50%' : '0%'}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              sectionsMet && accuracyMet 
                ? 'bg-green-500 w-full' 
                : sectionsMet 
                  ? 'bg-yellow-500 w-1/2' 
                  : 'bg-gray-400 w-0'
            }`}
          />
        </div>
      </div>
      
      {!isAvailable && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-400 text-sm">
            {!sectionsMet && !accuracyMet 
              ? "Complete the section with 80%+ accuracy to unlock your Master Certificate"
              : !sectionsMet 
                ? "Complete the OpenAI Comprehensive Training section"
                : "Achieve 80%+ accuracy to unlock your Master Certificate"
            }
          </p>
        </div>
      )}
    </div>
  );
}