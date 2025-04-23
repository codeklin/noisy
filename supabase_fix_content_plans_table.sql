-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check if content_plans table exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'content_plans'
  ) THEN
    CREATE TABLE content_plans (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id) NOT NULL,
      name TEXT NOT NULL,
      brand_info JSONB NOT NULL,
      posts JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ELSE
    -- Table exists, check if columns exist and add them if they don't
    
    -- Check if name column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'content_plans' AND column_name = 'name'
    ) THEN
      ALTER TABLE content_plans ADD COLUMN name TEXT NOT NULL DEFAULT 'Untitled Plan';
    END IF;
    
    -- Check if brand_info column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'content_plans' AND column_name = 'brand_info'
    ) THEN
      ALTER TABLE content_plans ADD COLUMN brand_info JSONB NOT NULL DEFAULT '{}'::jsonb;
    END IF;
    
    -- Check if posts column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'content_plans' AND column_name = 'posts'
    ) THEN
      ALTER TABLE content_plans ADD COLUMN posts JSONB NOT NULL DEFAULT '[]'::jsonb;
    END IF;
    
    -- Check if user_id column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'content_plans' AND column_name = 'user_id'
    ) THEN
      ALTER TABLE content_plans ADD COLUMN user_id UUID REFERENCES auth.users(id);
      
      -- Update user_id based on existing data if possible
      UPDATE content_plans
      SET user_id = (SELECT id FROM auth.users LIMIT 1)
      WHERE user_id IS NULL;
      
      -- Make user_id NOT NULL after updating
      ALTER TABLE content_plans ALTER COLUMN user_id SET NOT NULL;
    END IF;
    
    -- Check if created_at column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'content_plans' AND column_name = 'created_at'
    ) THEN
      ALTER TABLE content_plans ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Check if updated_at column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'content_plans' AND column_name = 'updated_at'
    ) THEN
      ALTER TABLE content_plans ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_content_plans_user_id ON content_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_content_plans_created_at ON content_plans(created_at);
CREATE INDEX IF NOT EXISTS idx_content_plans_updated_at ON content_plans(updated_at);

-- Create a trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_content_plan_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS update_content_plan_timestamp ON content_plans;
CREATE TRIGGER update_content_plan_timestamp
  BEFORE UPDATE ON content_plans
  FOR EACH ROW EXECUTE FUNCTION update_content_plan_timestamp();

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

-- Allow admins to access all content plans
DROP POLICY IF EXISTS "Admins can access all content plans" ON content_plans;
CREATE POLICY "Admins can access all content plans"
  ON content_plans
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );
