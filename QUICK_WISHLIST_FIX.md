# Quick Fix: Create Wishlists Table

## The Problem
Error: "Could not find the table 'public.wishlists' in the schema cache"

## The Solution
The wishlists table needs to be created in your Supabase database.

## Steps to Fix

### 1. Go to Supabase Dashboard
- Open https://supabase.com/dashboard
- Select your project

### 2. Create the Table
**Method A: SQL Editor (Recommended)**
1. Go to SQL Editor
2. Paste this SQL and run it:

```sql
CREATE TABLE public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id VARCHAR(255) NOT NULL,
    service_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, service_id)
);

CREATE INDEX idx_wishlists_user_id ON public.wishlists(user_id);
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlists" ON public.wishlists
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own wishlists" ON public.wishlists
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own wishlists" ON public.wishlists
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wishlists" ON public.wishlists
    FOR DELETE USING (auth.uid() = user_id);

GRANT ALL ON public.wishlists TO authenticated;
```

### 3. Test
- Refresh your app
- Try adding items to wishlist
- Should work without errors!

**Method B: Table Editor**
1. Go to Table Editor → New table
2. Name: `wishlists`
3. Add columns as specified in WISHLIST_DATABASE_SETUP.md

## Verification
After creating the table, the wishlist should work perfectly across login sessions!