# 🗄️ Database Setup Instructions

## Step 1: Create Supabase Account & Project

1. **Go to [Supabase](https://supabase.com)** and create a free account
2. **Create a new project**:
   - Organization: Your personal organization
   - Project name: `anubhav-ai-trainings` (or any name you prefer)
   - Database password: Create a strong password (save it!)
   - Region: Choose closest to your location

3. **Wait for project to be ready** (usually 2-3 minutes)

## Step 2: Get Your Database Credentials

1. **Go to Settings > API** in your Supabase dashboard
2. **Copy these values**:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 3: Set Up Environment Variables

1. **Create `.env.local` file** in your project root (same level as package.json)
2. **Add these lines** (replace with your actual values):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-anon-key-here
```

## Step 4: Create Database Tables

1. **Go to SQL Editor** in your Supabase dashboard
2. **Run this SQL** to create all required tables:

```sql
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

-- Sections table
CREATE TABLE IF NOT EXISTS sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    section_number INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User section progress table
CREATE TABLE IF NOT EXISTS user_section_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    questions_answered INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    max_possible_score INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    completion_percentage INTEGER DEFAULT 0,
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
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time INTEGER NOT NULL,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sections_section_number ON sections(section_number);
CREATE INDEX IF NOT EXISTS idx_user_section_progress_user_id ON user_section_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_question_responses_user_id ON user_question_responses(user_id);
```

## Step 5: Test the Connection

1. **Restart your development server**: `npm run dev`
2. **Complete a section** to test if database saving works
3. **Check admin dashboard** to see if real data appears

## 🔍 Troubleshooting

If you still see "Database not available":

1. **Check your `.env.local` file** exists and has correct values
2. **Restart the development server** after adding environment variables
3. **Verify Supabase project is active** in your dashboard
4. **Check browser console** for detailed error messages

## ✅ Success Indicators

When properly set up, you should see:
- ✅ **"Database Connected"** in admin dashboard
- 💾 **"Successfully saved to database!"** when completing sections
- 👥 **Real user data** in admin dashboard Users tab

## 🆘 Need Help?

If you encounter issues:
1. Check the browser console (F12) for detailed error messages
2. Verify your Supabase project is running in the dashboard
3. Double-check your environment variables match exactly 