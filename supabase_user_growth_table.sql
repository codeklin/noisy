-- Create the user_growth table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_growth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_growth_date ON user_growth(date);

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

-- Insert some sample data for testing
INSERT INTO user_growth (date, count)
VALUES 
  (CURRENT_DATE - INTERVAL '30 days', 5),
  (CURRENT_DATE - INTERVAL '29 days', 7),
  (CURRENT_DATE - INTERVAL '28 days', 10),
  (CURRENT_DATE - INTERVAL '27 days', 12),
  (CURRENT_DATE - INTERVAL '26 days', 15),
  (CURRENT_DATE - INTERVAL '25 days', 18),
  (CURRENT_DATE - INTERVAL '24 days', 20),
  (CURRENT_DATE - INTERVAL '23 days', 22),
  (CURRENT_DATE - INTERVAL '22 days', 25),
  (CURRENT_DATE - INTERVAL '21 days', 28),
  (CURRENT_DATE - INTERVAL '20 days', 30),
  (CURRENT_DATE - INTERVAL '19 days', 32),
  (CURRENT_DATE - INTERVAL '18 days', 35),
  (CURRENT_DATE - INTERVAL '17 days', 38),
  (CURRENT_DATE - INTERVAL '16 days', 40),
  (CURRENT_DATE - INTERVAL '15 days', 42),
  (CURRENT_DATE - INTERVAL '14 days', 45),
  (CURRENT_DATE - INTERVAL '13 days', 48),
  (CURRENT_DATE - INTERVAL '12 days', 50),
  (CURRENT_DATE - INTERVAL '11 days', 52),
  (CURRENT_DATE - INTERVAL '10 days', 55),
  (CURRENT_DATE - INTERVAL '9 days', 58),
  (CURRENT_DATE - INTERVAL '8 days', 60),
  (CURRENT_DATE - INTERVAL '7 days', 62),
  (CURRENT_DATE - INTERVAL '6 days', 65),
  (CURRENT_DATE - INTERVAL '5 days', 68),
  (CURRENT_DATE - INTERVAL '4 days', 70),
  (CURRENT_DATE - INTERVAL '3 days', 72),
  (CURRENT_DATE - INTERVAL '2 days', 75),
  (CURRENT_DATE - INTERVAL '1 day', 78),
  (CURRENT_DATE, 80)
ON CONFLICT (date) DO UPDATE
SET count = EXCLUDED.count, updated_at = NOW();
