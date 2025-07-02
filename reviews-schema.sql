-- =====================================================
-- SIMPLE REVIEWS TABLE FOR SUPABASE (No Admin Approval)
-- =====================================================

-- Create the reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT NOT NULL CHECK (length(comments) >= 10),
    status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('approved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE OR REPLACE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON public.reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (Simple: anyone can read/write)
CREATE POLICY "Anyone can insert reviews" ON public.reviews
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read reviews" ON public.reviews
    FOR SELECT USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT ON public.reviews TO anon;

-- Comments for documentation
COMMENT ON TABLE public.reviews IS 'Stores user reviews and ratings';
COMMENT ON COLUMN public.reviews.status IS 'Always approved - reviews are published immediately'; 