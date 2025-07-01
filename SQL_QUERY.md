-- Learning Platform Database Schema for Supabase
-- Run these commands in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    mobile TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW()
);

-- Learning sessions table
CREATE TABLE IF NOT EXISTS learning_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_title TEXT NOT NULL,
    session_type TEXT DEFAULT 'web-development-masterclass',
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    current_section INTEGER DEFAULT 1,
    current_part TEXT DEFAULT 'A' CHECK (current_part IN ('A', 'B')),
    current_step TEXT DEFAULT 'warmup' CHECK (current_step IN ('warmup', 'discussion', 'quickfire')),
    total_score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 0,
    completion_percentage INTEGER DEFAULT 0,
    status TEXT DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'abandoned')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Module progress table (tracks progress through each section/part)
CREATE TABLE IF NOT EXISTS module_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES learning_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    section_number INTEGER NOT NULL,
    part TEXT NOT NULL CHECK (part IN ('A', 'B')),
    step TEXT NOT NULL CHECK (step IN ('warmup', 'discussion', 'quickfire')),
    questions_answered INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- in seconds
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question responses table (detailed tracking of each question)
CREATE TABLE IF NOT EXISTS question_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES learning_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('warmup', 'quickfire')),
    section_number INTEGER NOT NULL,
    part TEXT NOT NULL CHECK (part IN ('A', 'B')),
    user_answer TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time INTEGER NOT NULL, -- in seconds
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES learning_sessions(id) ON DELETE CASCADE,
    participant_name TEXT,
    session_title TEXT NOT NULL,
    final_score INTEGER NOT NULL,
    completion_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL,
    achievements TEXT[] DEFAULT ARRAY[]::TEXT[],
    certificate_url TEXT,
    issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time session stats table (for dashboard)
CREATE TABLE IF NOT EXISTS session_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES learning_sessions(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    participants_count INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    response_time_avg INTEGER DEFAULT 0
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_status ON learning_sessions(status);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_created_at ON learning_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_module_progress_session_id ON module_progress(session_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_user_id ON module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_section_part ON module_progress(section_number, part);

CREATE INDEX IF NOT EXISTS idx_question_responses_session_id ON question_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_question_responses_user_id ON question_responses(user_id);

CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_session_id ON certificates(session_id);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Policies for public access (since we don't have authentication)
-- You can modify these based on your security requirements

CREATE POLICY "Allow public read access on users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on users" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on users" ON users
    FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on learning_sessions" ON learning_sessions
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on learning_sessions" ON learning_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on learning_sessions" ON learning_sessions
    FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on module_progress" ON module_progress
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on module_progress" ON module_progress
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on question_responses" ON question_responses
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on question_responses" ON question_responses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on certificates" ON certificates
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on certificates" ON certificates
    FOR INSERT WITH CHECK (true);

-- Functions for real-time updates
CREATE OR REPLACE FUNCTION update_session_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update session statistics when learning_sessions change
    INSERT INTO session_stats (session_id, participants_count, average_score, completion_rate)
    SELECT 
        NEW.id,
        1, -- This would be calculated based on actual participants
        CASE WHEN NEW.max_score > 0 THEN (NEW.total_score::DECIMAL / NEW.max_score) * 100 ELSE 0 END,
        CASE WHEN NEW.status = 'completed' THEN 100 ELSE NEW.completion_percentage END
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for session stats updates
CREATE TRIGGER update_session_stats_trigger
    AFTER INSERT OR UPDATE ON learning_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_session_stats();

-- Function to get module completion stats
CREATE OR REPLACE FUNCTION get_module_completion_stats(section_num INTEGER, part_letter TEXT DEFAULT NULL)
RETURNS TABLE (
    total_participants BIGINT,
    completed_participants BIGINT,
    average_score DECIMAL,
    average_time_spent DECIMAL,
    completion_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT mp.user_id) as total_participants,
        COUNT(DISTINCT CASE WHEN mp.completed_at IS NOT NULL THEN mp.user_id END) as completed_participants,
        COALESCE(AVG(CASE WHEN mp.questions_answered > 0 THEN (mp.questions_correct::DECIMAL / mp.questions_answered) * 100 END), 0) as average_score,
        COALESCE(AVG(mp.time_spent::DECIMAL / 60), 0) as average_time_spent, -- convert to minutes
        CASE 
            WHEN COUNT(DISTINCT mp.user_id) > 0 
            THEN (COUNT(DISTINCT CASE WHEN mp.completed_at IS NOT NULL THEN mp.user_id END)::DECIMAL / COUNT(DISTINCT mp.user_id)) * 100
            ELSE 0 
        END as completion_rate
    FROM module_progress mp
    WHERE mp.section_number = section_num
    AND (part_letter IS NULL OR mp.part = part_letter);
END;
$$ LANGUAGE plpgsql;

-- Function to get real-time dashboard data
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
    total_users BIGINT,
    active_sessions BIGINT,
    completed_sessions BIGINT,
    average_score DECIMAL,
    completion_rate DECIMAL,
    total_questions_answered BIGINT,
    total_correct_answers BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM learning_sessions WHERE status = 'in-progress') as active_sessions,
        (SELECT COUNT(*) FROM learning_sessions WHERE status = 'completed') as completed_sessions,
        COALESCE((
            SELECT AVG(CASE WHEN ls.max_score > 0 THEN (ls.total_score::DECIMAL / ls.max_score) * 100 ELSE 0 END)
            FROM learning_sessions ls 
            WHERE ls.status = 'completed'
        ), 0) as average_score,
        CASE 
            WHEN (SELECT COUNT(*) FROM users) > 0 
            THEN ((SELECT COUNT(*) FROM learning_sessions WHERE status = 'completed')::DECIMAL / (SELECT COUNT(*) FROM users)) * 100
            ELSE 0 
        END as completion_rate,
        (SELECT COUNT(*) FROM question_responses) as total_questions_answered,
        (SELECT COUNT(*) FROM question_responses WHERE is_correct = true) as total_correct_answers;
END;
$$ LANGUAGE plpgsql;

-- Sample data insertion (for testing)
-- You can remove this in production

INSERT INTO users (id, name, email) VALUES 
(uuid_generate_v4(), 'Test User 1', 'user1@example.com'),
(uuid_generate_v4(), 'Test User 2', 'user2@example.com'),
(uuid_generate_v4(), 'Test User 3', 'user3@example.com')
ON CONFLICT (email) DO NOTHING;