-- Step 1: First, let's check if the updated_at column actually exists
DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'content_plans' AND column_name = 'updated_at'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    RAISE NOTICE 'The updated_at column does not exist in the content_plans table!';
  ELSE
    RAISE NOTICE 'The updated_at column exists in the content_plans table.';
  END IF;
END $$;

-- Step 2: Enable Row Level Security (this should work regardless of the trigger issue)
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
