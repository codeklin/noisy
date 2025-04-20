-- Create profiles table extension for admin status
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  event_type VARCHAR(50) NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(50) NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  count INTEGER DEFAULT 1,
  success_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user growth table for tracking user signups over time
CREATE TABLE IF NOT EXISTS user_growth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 0
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_event_type ON activity_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Create function to update user_growth table on new user signup
CREATE OR REPLACE FUNCTION update_user_growth()
RETURNS TRIGGER AS $$
DECLARE
  today DATE := CURRENT_DATE;
BEGIN
  -- Try to update existing record for today
  UPDATE user_growth
  SET count = count + 1
  WHERE date = today;
  
  -- If no record exists for today, insert a new one
  IF NOT FOUND THEN
    INSERT INTO user_growth (date, count)
    VALUES (today, 1);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION update_user_growth();

-- Create function to log analytics events from the analytics service
CREATE OR REPLACE FUNCTION log_analytics_event(
  p_event_type VARCHAR,
  p_event_name VARCHAR,
  p_details JSONB DEFAULT NULL,
  p_success BOOLEAN DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  -- Check if event already exists for today
  SELECT id INTO event_id
  FROM analytics_events
  WHERE event_type = p_event_type
    AND event_name = p_event_name
    AND DATE(created_at) = CURRENT_DATE;
    
  IF FOUND THEN
    -- Update existing event
    UPDATE analytics_events
    SET count = count + 1,
        success_count = CASE WHEN p_success = true THEN success_count + 1 ELSE success_count END,
        total_count = CASE WHEN p_success IS NOT NULL THEN total_count + 1 ELSE total_count END,
        details = COALESCE(details, '{}'::JSONB) || COALESCE(p_details, '{}'::JSONB)
    WHERE id = event_id;
  ELSE
    -- Insert new event
    INSERT INTO analytics_events (
      event_type,
      event_name,
      count,
      success_count,
      total_count,
      details
    )
    VALUES (
      p_event_type,
      p_event_name,
      1,
      CASE WHEN p_success = true THEN 1 ELSE 0 END,
      CASE WHEN p_success IS NOT NULL THEN 1 ELSE 0 END,
      p_details
    )
    RETURNING id INTO event_id;
  END IF;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_event_type VARCHAR,
  p_event_name VARCHAR,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO activity_logs (
    user_id,
    event_type,
    event_name,
    details
  )
  VALUES (
    p_user_id,
    p_event_type,
    p_event_name,
    p_details
  )
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql;
