-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Create the profiles table with minimal columns first
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add additional columns if they don't exist
DO $$
BEGIN
  -- Add is_admin column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;

  -- Add is_subscribed column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_subscribed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_subscribed BOOLEAN DEFAULT false;
  END IF;

  -- Add has_used_generator_demo column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'has_used_generator_demo'
  ) THEN
    ALTER TABLE profiles ADD COLUMN has_used_generator_demo BOOLEAN DEFAULT false;
  END IF;

  -- Add has_used_viral_generator_demo column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'has_used_viral_generator_demo'
  ) THEN
    ALTER TABLE profiles ADD COLUMN has_used_viral_generator_demo BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Step 3: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Step 4: Create indexes for the new columns
DO $$
BEGIN
  -- Create index for is_admin if the column exists
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
  END IF;

  -- Create index for is_subscribed if the column exists
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_subscribed'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_profiles_is_subscribed ON profiles(is_subscribed);
  END IF;
END $$;

-- Step 5: Create a trigger function to update the profiles updated_at timestamp
CREATE OR REPLACE FUNCTION update_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create the trigger
DROP TRIGGER IF EXISTS update_profile_timestamp ON profiles;
CREATE TRIGGER update_profile_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_profile_timestamp();

-- Step 7: Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies for the profiles table
-- Allow users to read their own profile
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow users to insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Step 9: Create a function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (new.id, new.email, now(), now())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 11: Create a function to check if a user exists
CREATE OR REPLACE FUNCTION check_user_exists(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = user_email
  ) INTO user_exists;
  
  RETURN user_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 12: Create a function to create a user profile
-- This function checks if columns exist before using them
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_email TEXT,
  is_admin_val BOOLEAN DEFAULT false,
  is_subscribed_val BOOLEAN DEFAULT false
)
RETURNS BOOLEAN AS $$
DECLARE
  has_is_admin BOOLEAN;
  has_is_subscribed BOOLEAN;
  has_generator_demo BOOLEAN;
  has_viral_generator_demo BOOLEAN;
  query_text TEXT;
BEGIN
  -- Check which columns exist
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) INTO has_is_admin;
  
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_subscribed'
  ) INTO has_is_subscribed;
  
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'has_used_generator_demo'
  ) INTO has_generator_demo;
  
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'has_used_viral_generator_demo'
  ) INTO has_viral_generator_demo;
  
  -- Basic insert with required columns
  query_text := 'INSERT INTO public.profiles (id, email, created_at, updated_at';
  
  -- Add optional columns to the column list if they exist
  IF has_is_admin THEN
    query_text := query_text || ', is_admin';
  END IF;
  
  IF has_is_subscribed THEN
    query_text := query_text || ', is_subscribed';
  END IF;
  
  IF has_generator_demo THEN
    query_text := query_text || ', has_used_generator_demo';
  END IF;
  
  IF has_viral_generator_demo THEN
    query_text := query_text || ', has_used_viral_generator_demo';
  END IF;
  
  -- Start values list
  query_text := query_text || ') VALUES ($1, $2, now(), now()';
  
  -- Add values for optional columns
  IF has_is_admin THEN
    query_text := query_text || ', $3';
  END IF;
  
  IF has_is_subscribed THEN
    query_text := query_text || ', $4';
  END IF;
  
  IF has_generator_demo THEN
    query_text := query_text || ', false';
  END IF;
  
  IF has_viral_generator_demo THEN
    query_text := query_text || ', false';
  END IF;
  
  -- Add ON CONFLICT clause
  query_text := query_text || ') ON CONFLICT (id) DO UPDATE SET email = $2, updated_at = now()';
  
  -- Add optional columns to the update clause if they exist
  IF has_is_admin THEN
    query_text := query_text || ', is_admin = $3';
  END IF;
  
  IF has_is_subscribed THEN
    query_text := query_text || ', is_subscribed = $4';
  END IF;
  
  -- Execute the dynamic query
  IF has_is_admin AND has_is_subscribed THEN
    EXECUTE query_text USING user_id, user_email, is_admin_val, is_subscribed_val;
  ELSIF has_is_admin THEN
    EXECUTE query_text USING user_id, user_email, is_admin_val;
  ELSIF has_is_subscribed THEN
    EXECUTE query_text USING user_id, user_email, is_subscribed_val;
  ELSE
    EXECUTE query_text USING user_id, user_email;
  END IF;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in create_user_profile: %', SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
