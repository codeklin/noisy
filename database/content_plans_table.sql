-- Create content_plans table if it doesn't exist
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
CREATE POLICY "Users can read their own content plans"
  ON content_plans
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own content plans
CREATE POLICY "Users can insert their own content plans"
  ON content_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own content plans
CREATE POLICY "Users can update their own content plans"
  ON content_plans
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own content plans
CREATE POLICY "Users can delete their own content plans"
  ON content_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- Allow admins to read all content plans
CREATE POLICY "Admins can read all content plans"
  ON content_plans
  FOR SELECT
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

-- Create a trigger to update the updated_at timestamp
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
