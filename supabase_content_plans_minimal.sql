-- Step 1: Create indexes for better query performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_content_plans_user_id ON content_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_content_plans_created_at ON content_plans(created_at);
CREATE INDEX IF NOT EXISTS idx_content_plans_updated_at ON content_plans(updated_at);

-- Step 2: Enable Row Level Security
ALTER TABLE content_plans ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies for the content_plans table
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

-- Step 4: Create a trigger function to update the content_plans updated_at timestamp
-- First, check if the function already exists and drop it if it does
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_proc
    WHERE proname = 'update_content_plan_timestamp'
  ) THEN
    DROP FUNCTION update_content_plan_timestamp() CASCADE;
  END IF;
END $$;

-- Now create the function
CREATE FUNCTION update_content_plan_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create the trigger
DROP TRIGGER IF EXISTS update_content_plan_timestamp ON content_plans;
CREATE TRIGGER update_content_plan_timestamp
  BEFORE UPDATE ON content_plans
  FOR EACH ROW EXECUTE FUNCTION update_content_plan_timestamp();
