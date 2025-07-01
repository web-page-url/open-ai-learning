-- Essential Database Schema for GitHub Copilot Learning Platform
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (simple email-based users)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW()
);

-- User section progress table
CREATE TABLE IF NOT EXISTS user_section_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    section_id INTEGER NOT NULL, -- 1 to 10 for your sections
    questions_answered INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    status TEXT DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, section_id)
);

-- User question responses table
CREATE TABLE IF NOT EXISTS user_question_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    section_id INTEGER NOT NULL,
    question_id TEXT NOT NULL,
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- Certificates table (for your certificate system)
CREATE TABLE IF NOT EXISTS certificates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    participant_name TEXT NOT NULL,
    certificate_type TEXT NOT NULL, -- 'section' or 'master'
    section_id INTEGER, -- null for master certificate
    final_score INTEGER NOT NULL,
    completion_time TIMESTAMPTZ NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_section_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_responses_user_id ON user_question_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);

-- Enable RLS (but allow public access since no real auth)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_section_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Public access policies (since you're using email login)
CREATE POLICY "Allow public access on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow public access on progress" ON user_section_progress FOR ALL USING (true);
CREATE POLICY "Allow public access on responses" ON user_question_responses FOR ALL USING (true);
CREATE POLICY "Allow public access on certificates" ON certificates FOR ALL USING (true);

-----------------------------------------------------------------------------------

-- Simple Database Schema for Email + Name Login
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (just email + name, no signup)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ DEFAULT NOW()
);

-- User section progress table
CREATE TABLE IF NOT EXISTS user_section_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_email TEXT NOT NULL, -- Direct reference to email (simpler than UUID joins)
    section_id INTEGER NOT NULL, -- 1 to 10
    questions_answered INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    status TEXT DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_email, section_id)
);

-- User question responses table
CREATE TABLE IF NOT EXISTS user_question_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_email TEXT NOT NULL,
    section_id INTEGER NOT NULL,
    question_id TEXT NOT NULL,
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_email, question_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_progress_email ON user_section_progress(user_email);
CREATE INDEX IF NOT EXISTS idx_responses_email ON user_question_responses(user_email);

-- Enable public access (no RLS needed for your use case)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_section_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_question_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access" ON users FOR ALL USING (true);
CREATE POLICY "Allow public access" ON user_section_progress FOR ALL USING (true);
CREATE POLICY "Allow public access" ON user_question_responses FOR ALL USING (true);