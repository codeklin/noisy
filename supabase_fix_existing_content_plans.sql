-- This script will attempt to fix any existing content plans that might be missing required columns

-- First, let's check if there are any content plans in the database
DO $$
DECLARE
  content_plan_count INTEGER;
BEGIN
  -- Get the count of content plans
  SELECT COUNT(*) INTO content_plan_count FROM content_plans;
  
  -- Log the count
  RAISE NOTICE 'Found % content plans in the database', content_plan_count;
  
  -- If there are content plans, try to fix them
  IF content_plan_count > 0 THEN
    -- Check if the name column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'content_plans' AND column_name = 'name'
    ) THEN
      -- Add the name column
      ALTER TABLE content_plans ADD COLUMN name TEXT;
      
      -- Set a default name for existing content plans
      UPDATE content_plans SET name = 'Content Plan ' || id::text WHERE name IS NULL;
      
      -- Make the column NOT NULL
      ALTER TABLE content_plans ALTER COLUMN name SET NOT NULL;
      
      RAISE NOTICE 'Added name column to content_plans table and set default values';
    END IF;
    
    -- Check if the brand_info column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'content_plans' AND column_name = 'brand_info'
    ) THEN
      -- Add the brand_info column
      ALTER TABLE content_plans ADD COLUMN brand_info JSONB DEFAULT '{}'::jsonb;
      
      -- Make the column NOT NULL
      ALTER TABLE content_plans ALTER COLUMN brand_info SET NOT NULL;
      
      RAISE NOTICE 'Added brand_info column to content_plans table';
    END IF;
    
    -- Check if the posts column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'content_plans' AND column_name = 'posts'
    ) THEN
      -- Add the posts column
      ALTER TABLE content_plans ADD COLUMN posts JSONB DEFAULT '[]'::jsonb;
      
      -- Make the column NOT NULL
      ALTER TABLE content_plans ALTER COLUMN posts SET NOT NULL;
      
      RAISE NOTICE 'Added posts column to content_plans table';
    END IF;
    
    -- Check if the user_id column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'content_plans' AND column_name = 'user_id'
    ) THEN
      -- Add the user_id column
      ALTER TABLE content_plans ADD COLUMN user_id UUID;
      
      -- Try to set a default user_id if possible
      UPDATE content_plans
      SET user_id = (SELECT id FROM auth.users LIMIT 1)
      WHERE user_id IS NULL;
      
      -- Add the foreign key constraint
      ALTER TABLE content_plans 
      ADD CONSTRAINT content_plans_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id);
      
      -- Make the column NOT NULL
      ALTER TABLE content_plans ALTER COLUMN user_id SET NOT NULL;
      
      RAISE NOTICE 'Added user_id column to content_plans table';
    END IF;
  END IF;
END $$;
