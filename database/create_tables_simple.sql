-- Create the content_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS content_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  brand_info JSONB NOT NULL,
  posts JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_content_plans_user_id ON content_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_content_plans_created_at ON content_plans(created_at);
CREATE INDEX IF NOT EXISTS idx_content_plans_updated_at ON content_plans(updated_at);

-- Enable Row Level Security
ALTER TABLE content_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the content_plans table
-- Allow users to read their own content plans
DROP POLICY IF EXISTS "Users can read their own content plans" ON content_plans;
CREATE POLICY "Users can read their own content plans"
  ON content_plans
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own content plans
DROP POLICY IF EXISTS "Users can insert their own content plans" ON content_plans;
CREATE POLICY "Users can insert their own content plans"
  ON content_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own content plans
DROP POLICY IF EXISTS "Users can update their own content plans" ON content_plans;
CREATE POLICY "Users can update their own content plans"
  ON content_plans
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own content plans
DROP POLICY IF EXISTS "Users can delete their own content plans" ON content_plans;
CREATE POLICY "Users can delete their own content plans"
  ON content_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create a trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_content_plan_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on content_plans
DROP TRIGGER IF EXISTS update_content_plan_timestamp ON content_plans;
CREATE TRIGGER update_content_plan_timestamp
  BEFORE UPDATE ON content_plans
  FOR EACH ROW EXECUTE FUNCTION update_content_plan_timestamp();

-- Create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_subscribed BOOLEAN DEFAULT false,
  has_used_generator_demo BOOLEAN DEFAULT false,
  has_used_viral_generator_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_is_subscribed ON profiles(is_subscribed);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the profiles table
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

-- Create a trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on profiles
DROP TRIGGER IF EXISTS update_profile_timestamp ON profiles;
CREATE TRIGGER update_profile_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_profile_timestamp();
