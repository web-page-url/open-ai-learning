# Fix Admin Dashboard - Database Setup Guide

## Problem
The admin dashboard shows no data because the database tables don't exist yet.

## Solution
You need to create the database tables in your Supabase dashboard.

## Steps to Fix:

### 1. Open Supabase Dashboard
- Go to [supabase.com](https://supabase.com)
- Sign in to your account
- Open your project: `cmspzqoqevlhsnziwtkh`

### 2. Run the SQL Schema
- In your Supabase dashboard, go to **SQL Editor**
- Copy the entire content from `new-sql-12-06.sql` file in your project
- Paste it into the SQL editor
- Click **Run** to create the tables

### 3. Test the Connection
- Go to `http://localhost:3001/test-db` in your browser
- Click "Test Database Connection"
- You should see successful results

### 4. Check Admin Dashboard
- Go to `http://localhost:3001/admin-scores`
- Enter password: `CopilotAdmin2025!`
- You should now see user data

## What the SQL Creates:
- `users` table - stores user names and emails
- `user_section_progress` table - tracks section completion
- `user_question_responses` table - stores quiz answers

## After Setup:
- New users will be saved to database
- Quiz responses will be saved to database  
- Admin dashboard will show real data
- Everything will work as expected

## Quick Test:
1. Login as a new user at `/login`
2. Complete a section quiz
3. Check admin dashboard - you should see the data! 