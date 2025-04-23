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
