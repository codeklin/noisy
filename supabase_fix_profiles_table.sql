-- Make sure the profiles table has all the necessary columns with the right types
DO $$
BEGIN
  -- Add last_sign_in_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_sign_in_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_sign_in_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Make sure email column exists
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email TEXT;
  END IF;

  -- Make sure is_admin column exists with default false
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;

  -- Make sure is_subscribed column exists with default false
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_subscribed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_subscribed BOOLEAN DEFAULT false;
  END IF;

  -- Make sure has_used_generator_demo column exists with default false
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'has_used_generator_demo'
  ) THEN
    ALTER TABLE profiles ADD COLUMN has_used_generator_demo BOOLEAN DEFAULT false;
  END IF;

  -- Make sure has_used_viral_generator_demo column exists with default false
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'has_used_viral_generator_demo'
  ) THEN
    ALTER TABLE profiles ADD COLUMN has_used_viral_generator_demo BOOLEAN DEFAULT false;
  END IF;

  -- Make sure created_at column exists
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
  END IF;

  -- Make sure updated_at column exists
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
  END IF;
END $$;

-- Update email column for any profiles that have NULL emails
UPDATE profiles p
SET email = au.email
FROM auth.users au
WHERE p.id = au.id AND p.email IS NULL;

-- Make sure the admin user has proper privileges
UPDATE profiles
SET 
  is_admin = true,
  is_subscribed = true
WHERE email = '007postit@gmail.com';

-- Create RLS policies if they don't exist
DO $$
BEGIN
  -- Allow users to read their own profile
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can read their own profile'
  ) THEN
    CREATE POLICY "Users can read their own profile"
      ON profiles
      FOR SELECT
      USING (auth.uid() = id);
  END IF;

  -- Allow users to update their own profile
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON profiles
      FOR UPDATE
      USING (auth.uid() = id);
  END IF;

  -- Allow users to insert their own profile
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;

  -- Make sure RLS is enabled
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
END $$;
