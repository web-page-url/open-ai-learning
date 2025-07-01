-- 📚 QUESTIONS DATABASE SCHEMA
-- Add this to your existing Supabase database after running supabase-schema.sql

-- Sections table (stores the 5 main sections)
CREATE TABLE IF NOT EXISTS sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    section_number INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL, -- e.g., 'html-basics', 'css-fundamentals'
    duration_minutes INTEGER DEFAULT 30,
    difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table (stores all types of questions)
CREATE TABLE IF NOT EXISTS questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('multiple-choice', 'true-false', 'warmup', 'quickfire')),
    question_category TEXT DEFAULT 'general' CHECK (question_category IN ('warmup', 'discussion', 'quickfire', 'general')),
    options TEXT[], -- For multiple choice questions (JSON array)
    correct_answer TEXT NOT NULL, -- Can be index for multiple choice or "true"/"false"
    explanation TEXT,
    time_limit INTEGER DEFAULT 60, -- in seconds
    points INTEGER DEFAULT 1,
    difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    order_index INTEGER DEFAULT 1, -- For ordering questions within a section
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User section progress (tracks progress per section)
CREATE TABLE IF NOT EXISTS user_section_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    questions_answered INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    max_possible_score INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- in seconds
    completion_percentage INTEGER DEFAULT 0,
    status TEXT DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, section_id)
);

-- User question responses (detailed tracking per question)
CREATE TABLE IF NOT EXISTS user_question_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time INTEGER NOT NULL, -- in seconds
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sections_section_number ON sections(section_number);
CREATE INDEX IF NOT EXISTS idx_sections_slug ON sections(slug);
CREATE INDEX IF NOT EXISTS idx_questions_section_id ON questions(section_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(question_category);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(section_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_section_progress_user_id ON user_section_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_section_progress_section_id ON user_section_progress(section_id);
CREATE INDEX IF NOT EXISTS idx_user_question_responses_user_id ON user_question_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_question_responses_question_id ON user_question_responses(question_id);

-- Row Level Security (RLS) Policies
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_section_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_question_responses ENABLE ROW LEVEL SECURITY;

-- Public access policies (adjust based on your needs)
CREATE POLICY "Allow public read access on sections" ON sections
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on questions" ON questions
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on user_section_progress" ON user_section_progress
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update on user_section_progress" ON user_section_progress
    FOR ALL USING (true);

CREATE POLICY "Allow public read access on user_question_responses" ON user_question_responses
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on user_question_responses" ON user_question_responses
    FOR INSERT WITH CHECK (true);

-- Sample data: 5 Sections
INSERT INTO sections (section_number, title, description, slug, duration_minutes, difficulty) VALUES
(1, 'HTML Fundamentals', 'Master the structure and semantics of HTML5', 'html-fundamentals', 25, 'beginner'),
(2, 'CSS Styling & Layout', 'Learn modern CSS techniques and responsive design', 'css-styling-layout', 30, 'beginner'),
(3, 'JavaScript Essentials', 'Core JavaScript concepts and ES6+ features', 'javascript-essentials', 35, 'intermediate'),
(4, 'React & Frontend Frameworks', 'Component-based development with React', 'react-frontend-frameworks', 40, 'intermediate'),
(5, 'Full-Stack Development', 'Connecting frontend with backend APIs', 'fullstack-development', 45, 'advanced');

-- Sample questions for Section 1: HTML Fundamentals
INSERT INTO questions (section_id, question_text, question_type, question_category, options, correct_answer, explanation, time_limit, points, order_index) VALUES

-- Warmup Questions
((SELECT id FROM sections WHERE section_number = 1), 
'What does HTML stand for?', 
'multiple-choice', 'warmup', 
'["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "HyperText Machine Language"]',
'0', 'HTML stands for HyperText Markup Language, the standard language for creating web pages.', 30, 1, 1),

((SELECT id FROM sections WHERE section_number = 1), 
'HTML is a programming language', 
'true-false', 'warmup', 
NULL,
'false', 'HTML is a markup language, not a programming language. It defines structure and content.', 30, 1, 2),

-- General Questions
((SELECT id FROM sections WHERE section_number = 1), 
'Which HTML tag is used for the largest heading?', 
'multiple-choice', 'general', 
'["<h1>", "<h6>", "<header>", "<heading>"]',
'0', 'The <h1> tag represents the largest heading in HTML.', 45, 1, 3),

((SELECT id FROM sections WHERE section_number = 1), 
'What is the correct HTML tag for creating a hyperlink?', 
'multiple-choice', 'general', 
'["<link>", "<a>", "<href>", "<url>"]',
'1', 'The <a> (anchor) tag is used to create hyperlinks in HTML.', 45, 1, 4),

((SELECT id FROM sections WHERE section_number = 1), 
'The <br> tag requires a closing tag', 
'true-false', 'general', 
NULL,
'false', 'The <br> tag is a self-closing tag and does not require a closing tag.', 30, 1, 5),

-- Quickfire Questions
((SELECT id FROM sections WHERE section_number = 1), 
'Which attribute specifies the destination of a link?', 
'multiple-choice', 'quickfire', 
'["src", "href", "link", "url"]',
'1', 'The href attribute specifies the URL or destination of a hyperlink.', 60, 1, 6),

((SELECT id FROM sections WHERE section_number = 1), 
'HTML5 introduced semantic elements', 
'true-false', 'quickfire', 
NULL,
'true', 'HTML5 introduced many semantic elements like <article>, <section>, <nav>, etc.', 30, 1, 7),

((SELECT id FROM sections WHERE section_number = 1), 
'Which HTML element is used for the main content?', 
'multiple-choice', 'quickfire', 
'["<content>", "<main>", "<primary>", "<body>"]',
'1', 'The <main> element represents the main content area of a document.', 45, 1, 8);

-- Sample questions for Section 2: CSS Styling & Layout
INSERT INTO questions (section_id, question_text, question_type, question_category, options, correct_answer, explanation, time_limit, points, order_index) VALUES

-- Warmup Questions
((SELECT id FROM sections WHERE section_number = 2), 
'What does CSS stand for?', 
'multiple-choice', 'warmup', 
'["Cascading Style Sheets", "Creative Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"]',
'0', 'CSS stands for Cascading Style Sheets, used for styling HTML documents.', 30, 1, 1),

((SELECT id FROM sections WHERE section_number = 2), 
'CSS can only change colors of elements', 
'true-false', 'warmup', 
NULL,
'false', 'CSS can control layout, spacing, fonts, animations, and much more beyond just colors.', 30, 1, 2),

-- General Questions
((SELECT id FROM sections WHERE section_number = 2), 
'Which CSS property is used to change the text color?', 
'multiple-choice', 'general', 
'["text-color", "color", "font-color", "text-style"]',
'1', 'The color property sets the color of text in CSS.', 45, 1, 3),

((SELECT id FROM sections WHERE section_number = 2), 
'What is the correct syntax for a CSS comment?', 
'multiple-choice', 'general', 
'["// comment", "<!-- comment -->", "/* comment */", "# comment"]',
'2', 'CSS comments use /* comment */ syntax.', 45, 1, 4),

-- Quickfire Questions
((SELECT id FROM sections WHERE section_number = 2), 
'Flexbox is a CSS layout method', 
'true-false', 'quickfire', 
NULL,
'true', 'Flexbox is a powerful CSS layout method for creating flexible and responsive layouts.', 30, 1, 5),

((SELECT id FROM sections WHERE section_number = 2), 
'Which property controls the space between elements?', 
'multiple-choice', 'quickfire', 
'["spacing", "margin", "gap", "padding"]',
'1', 'The margin property controls the space outside elements.', 45, 1, 6);

-- Function to get questions by section
CREATE OR REPLACE FUNCTION get_section_questions(section_num INTEGER, question_cat TEXT DEFAULT NULL)
RETURNS TABLE (
    question_id UUID,
    question_text TEXT,
    question_type TEXT,
    question_category TEXT,
    options TEXT[],
    correct_answer TEXT,
    explanation TEXT,
    time_limit INTEGER,
    points INTEGER,
    order_index INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id,
        q.question_text,
        q.question_type,
        q.question_category,
        q.options,
        q.correct_answer,
        q.explanation,
        q.time_limit,
        q.points,
        q.order_index
    FROM questions q
    JOIN sections s ON q.section_id = s.id
    WHERE s.section_number = section_num
    AND (question_cat IS NULL OR q.question_category = question_cat)
    AND q.is_active = true
    ORDER BY q.order_index;
END;
$$ LANGUAGE plpgsql;

-- Function to get section details
CREATE OR REPLACE FUNCTION get_section_details(section_num INTEGER)
RETURNS TABLE (
    section_id UUID,
    title TEXT,
    description TEXT,
    slug TEXT,
    duration_minutes INTEGER,
    difficulty TEXT,
    total_questions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.title,
        s.description,
        s.slug,
        s.duration_minutes,
        s.difficulty,
        COUNT(q.id) as total_questions
    FROM sections s
    LEFT JOIN questions q ON s.id = q.section_id AND q.is_active = true
    WHERE s.section_number = section_num
    AND s.is_active = true
    GROUP BY s.id, s.title, s.description, s.slug, s.duration_minutes, s.difficulty;
END;
$$ LANGUAGE plpgsql; 