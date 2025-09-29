# Database Setup Guide - Supabase Integration

## Overview
This project now uses Supabase as the authentication and database provider, which resolves the previous database connectivity issues. 

## Quick Setup

### 1. Create a Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

### 2. Get Your Supabase Credentials
1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Project API Keys** > **anon** **public** key

### 3. Configure Environment Variables
1. Copy `.env.example` to `.env`
2. Replace the placeholder values:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set up Authentication
1. In Supabase dashboard, go to **Authentication** > **Settings**
2. Enable **Google** and **Facebook** providers (optional):
   - Add your OAuth app credentials
   - Set redirect URLs to `http://localhost:5173` (and your production URL)

### 5. Database Schema (Optional)
Supabase handles user authentication automatically. If you want to extend user profiles:

1. Go to **SQL Editor** in Supabase dashboard
2. Run this SQL to create a user profiles table:

```sql
-- Create user profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  phone text,
  city text,
  profession text,
  company text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Create a trigger to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Benefits of This Setup

✅ **No Backend Required**: Supabase handles authentication and database operations
✅ **User Isolation**: Each user's data is automatically separated
✅ **Social Login**: Built-in Google/Facebook authentication
✅ **Session Management**: Automatic session handling and persistence
✅ **Security**: Built-in Row Level Security (RLS)
✅ **Real-time**: Supabase provides real-time subscriptions if needed

## Features Fixed

1. **Manual Login/Signup**: Now works with Supabase authentication
2. **Google Login**: Properly integrated with Supabase OAuth
3. **User Data Isolation**: Wishlist and preferences are user-specific
4. **Session Persistence**: Proper session management across browser sessions
5. **Profile Management**: User profiles are properly isolated

## Development vs Production

### Development
- Use localhost URLs in Supabase auth settings
- Environment variables in `.env` file

### Production
- Add your production domain to Supabase auth settings
- Set environment variables in your hosting platform
- Ensure HTTPS is enabled

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables" error**
   - Check that `.env` file exists and has correct values
   - Restart development server after changing `.env`

2. **Google login not working**
   - Check OAuth credentials in Supabase dashboard
   - Ensure redirect URLs are correctly configured
   - Check browser console for detailed error messages

3. **Users seeing each other's data**
   - This issue is now fixed with user-specific storage
   - Clear browser localStorage and login again to test

4. **Session not persisting**
   - Supabase automatically handles session persistence
   - Check browser's Application tab > Local Storage for session data

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Migration Notes

If you were using the old backend setup:

1. **Old bookmarks**: Will be automatically migrated to user-specific storage
2. **Backend API calls**: Removed and replaced with Supabase client calls
3. **Token management**: Now handled by Supabase authentication
4. **User profiles**: Can optionally be stored in Supabase database

The application will work immediately after setting up the Supabase credentials - no backend server needed!

3. **Create a user (optional, or use existing postgres user):**
   ```sql
   CREATE USER cityservice_user WITH PASSWORD 'your_password_here';
   GRANT ALL PRIVILEGES ON DATABASE nancysgp TO cityservice_user;
   ```

4. **Update the .env file with your database credentials:**
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/nancysgp
   ```

### Common Database URLs Examples:
- Using postgres user: `postgresql://postgres:your_postgres_password@localhost:5432/nancysgp`
- Using custom user: `postgresql://cityservice_user:your_password@localhost:5432/nancysgp`

### Testing Connection
Run this command to test your database connection:
```bash
node test-db.js
```

### Troubleshooting
1. **Authentication failed**: Check username and password in DATABASE_URL
2. **Database doesn't exist**: Create the database using the SQL commands above
3. **Connection refused**: Make sure PostgreSQL service is running
4. **Port issues**: Default PostgreSQL port is 5432, adjust if different

### Alternative: Use SQLite for Development
If you don't want to set up PostgreSQL, you can use SQLite for development by changing the database configuration in the backend code.