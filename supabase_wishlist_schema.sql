-- Wishlist table for storing user's wishlisted services
CREATE TABLE public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id VARCHAR(255) NOT NULL,
    service_data JSONB DEFAULT '{}', -- Store service details for offline access
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate entries
    UNIQUE(user_id, service_id)
);

-- Create indexes for better performance
CREATE INDEX idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX idx_wishlists_service_id ON public.wishlists(service_id);
CREATE INDEX idx_wishlists_created_at ON public.wishlists(created_at);

-- Enable Row Level Security
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for wishlist access
CREATE POLICY "Users can view their own wishlists" ON public.wishlists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlists" ON public.wishlists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlists" ON public.wishlists
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlists" ON public.wishlists
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.wishlists TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;