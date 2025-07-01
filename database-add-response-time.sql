-- Add missing response_time column to user_question_responses table
ALTER TABLE user_question_responses 
ADD COLUMN response_time INTEGER DEFAULT 0;

-- Add missing time_spent column to user_section_progress table (if it doesn't exist)
ALTER TABLE user_section_progress 
ADD COLUMN IF NOT EXISTS time_spent INTEGER DEFAULT 0;

-- Update any existing records to have default time values
UPDATE user_question_responses 
SET response_time = 0 
WHERE response_time IS NULL;

UPDATE user_section_progress 
SET time_spent = 0 
WHERE time_spent IS NULL; 