-- Master script to set up all admin analytics tables and functions

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ANALYTICS_EVENTS TABLE
-- =============================================

-- First, check if the table exists and drop it if it does
DROP TABLE IF EXISTS analytics_events;

-- Create the analytics_events table with the correct column names
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  success_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_analytics_events_type_name ON analytics_events(event_type, event_name);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- Create a trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_analytics_event_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS update_analytics_event_timestamp ON analytics_events;
CREATE TRIGGER update_analytics_event_timestamp
  BEFORE UPDATE ON analytics_events
  FOR EACH ROW EXECUTE FUNCTION update_analytics_event_timestamp();

-- Enable Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the analytics_events table
-- Allow all authenticated users to read analytics events
DROP POLICY IF EXISTS "Allow all authenticated users to read analytics events" ON analytics_events;
CREATE POLICY "Allow all authenticated users to read analytics events"
  ON analytics_events
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow all authenticated users to insert analytics events
DROP POLICY IF EXISTS "Allow all authenticated users to insert analytics events" ON analytics_events;
CREATE POLICY "Allow all authenticated users to insert analytics events"
  ON analytics_events
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow all authenticated users to update analytics events
DROP POLICY IF EXISTS "Allow all authenticated users to update analytics events" ON analytics_events;
CREATE POLICY "Allow all authenticated users to update analytics events"
  ON analytics_events
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- =============================================
-- USER_GROWTH TABLE
-- =============================================

-- Drop the existing user_growth table if it exists
DROP TABLE IF EXISTS user_growth;

-- Create the user_growth table with the correct column names
CREATE TABLE user_growth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_date DATE NOT NULL UNIQUE, -- Using record_date instead of date to avoid reserved keyword issues
  user_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_user_growth_record_date ON user_growth(record_date);

-- Create a trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_growth_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS update_user_growth_timestamp ON user_growth;
CREATE TRIGGER update_user_growth_timestamp
  BEFORE UPDATE ON user_growth
  FOR EACH ROW EXECUTE FUNCTION update_user_growth_timestamp();

-- Enable Row Level Security
ALTER TABLE user_growth ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the user_growth table
-- Allow all authenticated users to read user_growth
DROP POLICY IF EXISTS "Allow all authenticated users to read user_growth" ON user_growth;
CREATE POLICY "Allow all authenticated users to read user_growth"
  ON user_growth
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow admins to insert/update user_growth
DROP POLICY IF EXISTS "Allow admins to insert user_growth" ON user_growth;
CREATE POLICY "Allow admins to insert user_growth"
  ON user_growth
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Allow admins to update user_growth" ON user_growth;
CREATE POLICY "Allow admins to update user_growth"
  ON user_growth
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- =============================================
-- USER GROWTH UPDATER FUNCTIONS
-- =============================================

-- Create a function to update the user_growth table with daily user counts
CREATE OR REPLACE FUNCTION update_user_growth_daily()
RETURNS void AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  user_count INTEGER;
BEGIN
  -- Get the count of users
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- Insert or update the record for today
  INSERT INTO user_growth (record_date, user_count)
  VALUES (today_date, user_count)
  ON CONFLICT (record_date) 
  DO UPDATE SET 
    user_count = EXCLUDED.user_count,
    updated_at = NOW();
    
  RAISE NOTICE 'Updated user growth for % with % users', today_date, user_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to backfill user growth data for the past 30 days
CREATE OR REPLACE FUNCTION backfill_user_growth_data()
RETURNS void AS $$
DECLARE
  current_date DATE := CURRENT_DATE;
  day_offset INTEGER;
  estimated_users INTEGER;
  total_users INTEGER;
BEGIN
  -- Get the current total number of users
  SELECT COUNT(*) INTO total_users FROM profiles;
  
  -- Loop through the past 30 days
  FOR day_offset IN 0..30 LOOP
    -- Calculate an estimated user count for past days
    -- This is just a simple estimation - in a real app, you might want to use actual historical data
    estimated_users := GREATEST(5, total_users - (day_offset * (total_users / 40)::INTEGER));
    
    -- Insert or update the record for this day
    INSERT INTO user_growth (record_date, user_count)
    VALUES (current_date - day_offset * INTERVAL '1 day', estimated_users)
    ON CONFLICT (record_date) 
    DO NOTHING; -- Don't update existing records
  END LOOP;
  
  RAISE NOTICE 'Backfilled user growth data for the past 30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRACKING FUNCTIONS
-- =============================================

-- Create a function to track new user registrations
CREATE OR REPLACE FUNCTION track_new_user_registration()
RETURNS TRIGGER AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  current_count INTEGER;
BEGIN
  -- Get the current count for today
  SELECT user_count INTO current_count 
  FROM user_growth 
  WHERE record_date = today_date;
  
  IF FOUND THEN
    -- Update the existing record
    UPDATE user_growth
    SET user_count = current_count + 1,
        updated_at = NOW()
    WHERE record_date = today_date;
  ELSE
    -- Insert a new record
    INSERT INTO user_growth (record_date, user_count)
    VALUES (today_date, 1);
  END IF;
  
  -- Also track this as an analytics event
  INSERT INTO analytics_events (
    event_type, 
    event_name, 
    count, 
    details
  )
  VALUES (
    'user_action',
    'new_registration',
    1,
    json_build_object('user_id', NEW.id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to track new user registrations
DROP TRIGGER IF EXISTS on_user_registration ON profiles;
CREATE TRIGGER on_user_registration
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION track_new_user_registration();

-- Create a function to track content plan creation
CREATE OR REPLACE FUNCTION track_content_plan_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Track this as an analytics event
  INSERT INTO analytics_events (
    event_type, 
    event_name, 
    count, 
    details
  )
  VALUES (
    'user_action',
    'create_content_plan',
    1,
    json_build_object(
      'user_id', NEW.user_id,
      'plan_id', NEW.id,
      'plan_name', NEW.name
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to track content plan creation
DROP TRIGGER IF EXISTS on_content_plan_creation ON content_plans;
CREATE TRIGGER on_content_plan_creation
  AFTER INSERT ON content_plans
  FOR EACH ROW
  EXECUTE FUNCTION track_content_plan_creation();

-- Create a function to track content plan deletion
CREATE OR REPLACE FUNCTION track_content_plan_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Track this as an analytics event
  INSERT INTO analytics_events (
    event_type, 
    event_name, 
    count, 
    details
  )
  VALUES (
    'user_action',
    'delete_content_plan',
    1,
    json_build_object(
      'user_id', OLD.user_id,
      'plan_id', OLD.id,
      'plan_name', OLD.name
    )
  );
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to track content plan deletion
DROP TRIGGER IF EXISTS on_content_plan_deletion ON content_plans;
CREATE TRIGGER on_content_plan_deletion
  AFTER DELETE ON content_plans
  FOR EACH ROW
  EXECUTE FUNCTION track_content_plan_deletion();

-- =============================================
-- RPC FUNCTIONS FOR CLIENT-SIDE TRACKING
-- =============================================

-- Create an RPC function to track page views
CREATE OR REPLACE FUNCTION track_page_view(page_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  existing_record RECORD;
BEGIN
  -- Check if we already have a record for this page today
  SELECT * INTO existing_record
  FROM analytics_events
  WHERE event_type = 'page_view'
    AND event_name = page_name
    AND DATE(created_at) = today_date;
    
  IF FOUND THEN
    -- Update the existing record
    UPDATE analytics_events
    SET count = existing_record.count + 1,
        updated_at = NOW()
    WHERE id = existing_record.id;
  ELSE
    -- Insert a new record
    INSERT INTO analytics_events (
      event_type,
      event_name,
      count,
      created_at
    )
    VALUES (
      'page_view',
      page_name,
      1,
      NOW()
    );
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create an RPC function to track content generation
CREATE OR REPLACE FUNCTION track_content_generation(
  generation_type TEXT,
  is_success BOOLEAN,
  details JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  existing_record RECORD;
BEGIN
  -- Check if we already have a record for this generation type today
  SELECT * INTO existing_record
  FROM analytics_events
  WHERE event_type = 'content_generation'
    AND event_name = generation_type
    AND DATE(created_at) = today_date;
    
  IF FOUND THEN
    -- Update the existing record
    UPDATE analytics_events
    SET 
      count = existing_record.count + 1,
      total_count = existing_record.total_count + 1,
      success_count = CASE WHEN is_success THEN existing_record.success_count + 1 ELSE existing_record.success_count END,
      details = COALESCE(existing_record.details, '{}'::jsonb) || COALESCE(details, '{}'::jsonb),
      updated_at = NOW()
    WHERE id = existing_record.id;
  ELSE
    -- Insert a new record
    INSERT INTO analytics_events (
      event_type,
      event_name,
      count,
      total_count,
      success_count,
      details,
      created_at
    )
    VALUES (
      'content_generation',
      generation_type,
      1,
      1,
      CASE WHEN is_success THEN 1 ELSE 0 END,
      details,
      NOW()
    );
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create an RPC function to track errors
CREATE OR REPLACE FUNCTION track_error(
  error_type TEXT,
  details JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  existing_record RECORD;
BEGIN
  -- Check if we already have a record for this error type today
  SELECT * INTO existing_record
  FROM analytics_events
  WHERE event_type = 'error'
    AND event_name = error_type
    AND DATE(created_at) = today_date;
    
  IF FOUND THEN
    -- Update the existing record
    UPDATE analytics_events
    SET 
      count = existing_record.count + 1,
      details = COALESCE(existing_record.details, '{}'::jsonb) || COALESCE(details, '{}'::jsonb),
      updated_at = NOW()
    WHERE id = existing_record.id;
  ELSE
    -- Insert a new record
    INSERT INTO analytics_events (
      event_type,
      event_name,
      count,
      details,
      created_at
    )
    VALUES (
      'error',
      error_type,
      1,
      details,
      NOW()
    );
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create an RPC function to track user actions
CREATE OR REPLACE FUNCTION track_user_action(
  action_name TEXT,
  details JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  existing_record RECORD;
BEGIN
  -- Check if we already have a record for this action today
  SELECT * INTO existing_record
  FROM analytics_events
  WHERE event_type = 'user_action'
    AND event_name = action_name
    AND DATE(created_at) = today_date;
    
  IF FOUND THEN
    -- Update the existing record
    UPDATE analytics_events
    SET 
      count = existing_record.count + 1,
      details = COALESCE(existing_record.details, '{}'::jsonb) || COALESCE(details, '{}'::jsonb),
      updated_at = NOW()
    WHERE id = existing_record.id;
  ELSE
    -- Insert a new record
    INSERT INTO analytics_events (
      event_type,
      event_name,
      count,
      details,
      created_at
    )
    VALUES (
      'user_action',
      action_name,
      1,
      details,
      NOW()
    );
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert sample data for page views
INSERT INTO analytics_events (event_type, event_name, count, created_at)
VALUES 
  ('page_view', 'home', 120, NOW() - INTERVAL '1 day'),
  ('page_view', 'generator', 85, NOW() - INTERVAL '1 day'),
  ('page_view', 'saved-plans', 65, NOW() - INTERVAL '1 day'),
  ('page_view', 'viral-content', 50, NOW() - INTERVAL '1 day'),
  ('page_view', 'about', 30, NOW() - INTERVAL '1 day'),
  ('page_view', 'contact', 25, NOW() - INTERVAL '1 day'),
  ('page_view', 'auth', 40, NOW() - INTERVAL '1 day'),
  ('page_view', 'preferences', 20, NOW() - INTERVAL '1 day'),
  ('page_view', 'admin', 15, NOW() - INTERVAL '1 day');

-- Insert sample data for content generation
INSERT INTO analytics_events (event_type, event_name, count, success_count, total_count, details, created_at)
VALUES 
  ('content_generation', 'facebook - post', 50, 45, 50, '{"platform": "facebook", "success_rate": 0.9}', NOW() - INTERVAL '1 day'),
  ('content_generation', 'twitter - post', 40, 35, 40, '{"platform": "twitter", "success_rate": 0.875}', NOW() - INTERVAL '1 day'),
  ('content_generation', 'linkedin - post', 30, 28, 30, '{"platform": "linkedin", "success_rate": 0.93}', NOW() - INTERVAL '1 day'),
  ('content_generation', 'instagram - post', 25, 22, 25, '{"platform": "instagram", "success_rate": 0.88}', NOW() - INTERVAL '1 day'),
  ('content_generation', 'viral - post', 20, 18, 20, '{"platform": "viral", "success_rate": 0.9}', NOW() - INTERVAL '1 day');

-- Insert sample data for user actions
INSERT INTO analytics_events (event_type, event_name, count, created_at)
VALUES 
  ('user_action', 'save_content_plan', 35, NOW() - INTERVAL '1 day'),
  ('user_action', 'delete_content_plan', 10, NOW() - INTERVAL '1 day'),
  ('user_action', 'regenerate_content', 25, NOW() - INTERVAL '1 day'),
  ('user_action', 'copy_to_clipboard', 40, NOW() - INTERVAL '1 day'),
  ('user_action', 'share_content', 15, NOW() - INTERVAL '1 day'),
  ('user_action', 'login', 30, NOW() - INTERVAL '1 day'),
  ('user_action', 'logout', 20, NOW() - INTERVAL '1 day'),
  ('user_action', 'register', 10, NOW() - INTERVAL '1 day');

-- Insert sample data for errors
INSERT INTO analytics_events (event_type, event_name, count, details, created_at)
VALUES 
  ('error', 'content_generation_failed', 5, '{"reason": "API timeout"}', NOW() - INTERVAL '1 day'),
  ('error', 'authentication_failed', 3, '{"reason": "Invalid credentials"}', NOW() - INTERVAL '1 day'),
  ('error', 'database_connection_error', 2, '{"reason": "Connection timeout"}', NOW() - INTERVAL '1 day'),
  ('error', 'api_rate_limit_exceeded', 4, '{"reason": "Too many requests"}', NOW() - INTERVAL '1 day'),
  ('error', 'unhandled_error', 1, '{"reason": "Unknown error"}', NOW() - INTERVAL '1 day');

-- Run the backfill function to populate historical data
SELECT backfill_user_growth_data();

-- Run the update function to ensure today's data is current
SELECT update_user_growth_daily();
