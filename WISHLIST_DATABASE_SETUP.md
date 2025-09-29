# Wishlist Database Setup Guide

## Overview
The wishlist functionality has been updated to use Supabase database instead of localStorage. This ensures that wishlisted items persist across sessions and are isolated per user.

## ✅ Changes Made

### 1. Database Schema
- Created `supabase_wishlist_schema.sql` with the `wishlists` table
- Added Row Level Security (RLS) policies for user data isolation
- Included proper indexes and constraints

### 2. UserStorage Updates
- Added Supabase database methods: `getWishlistFromDB()`, `addToWishlistDB()`, `removeFromWishlistDB()`
- Added migration function to move localStorage data to database
- Maintained backward compatibility with existing localStorage methods

### 3. Component Updates
- **Wishlist.tsx**: Now loads data from database and handles migration
- **ServiceSearch.tsx**: Uses database methods for adding/removing bookmarks
- **Layout.tsx**: Counts wishlist items from database

## 🔧 Setup Instructions

### Step 1: Apply Database Schema

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the following SQL:

```sql
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
```

5. Click **Run** to execute the SQL

### Step 2: Test the Setup

1. Build and run your application:
   ```bash
   npm run dev
   ```

2. Test the wishlist functionality:
   - Login with your account
   - Add some services to wishlist
   - Logout and login again
   - Verify that wishlisted items are still there

## 🔍 How It Works

### Data Migration
- When a user first logs in after the update, any existing localStorage wishlist data is automatically migrated to the database
- The migration happens seamlessly in the background

### User Isolation
- Each user's wishlist is stored with their `user_id` from Supabase Auth
- Row Level Security (RLS) policies ensure users can only see their own data
- No more data bleeding between users

### Persistence
- Wishlist data is now stored in PostgreSQL database
- Data persists across sessions, devices, and browsers
- Real-time updates across multiple tabs/windows

## 🎯 Testing Checklist

- [ ] **Schema Applied**: Database table created successfully
- [ ] **User Login**: Can log in with email/password
- [ ] **Add to Wishlist**: Can add services to wishlist
- [ ] **View Wishlist**: Can see added items in wishlist tab
- [ ] **Remove from Wishlist**: Can remove items from wishlist
- [ ] **Session Persistence**: Wishlist items remain after logout/login
- [ ] **User Isolation**: Different users have separate wishlists
- [ ] **Migration**: Old localStorage data migrated to database

## 🐛 Troubleshooting

### Issue: "Could not find the table 'public.wishlists'"
**Solution**: The database schema hasn't been applied. Follow Step 1 above.

### Issue: "Permission denied for table wishlists"
**Solution**: 
1. Check that RLS policies are created correctly
2. Ensure user is properly authenticated
3. Verify `auth.uid()` returns the correct user ID

### Issue: Wishlist not updating
**Solution**:
1. Check browser console for errors
2. Verify Supabase connection in Network tab
3. Check that the user is authenticated

### Issue: Old localStorage data not migrated
**Solution**: The migration runs automatically on first load. If it fails:
1. Check console for migration errors
2. Manually clear localStorage if needed
3. Re-add items to test database functionality

## 📝 Notes

- The old localStorage methods are still available for backward compatibility
- Migration happens automatically when a user logs in
- All wishlist operations now use the database by default
- Event system updated to handle both `bookmarks:changed` and `wishlist:changed` events