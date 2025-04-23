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
