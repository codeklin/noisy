-- Create the payments table for subscription tracking
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop the existing payments table if it exists
DROP TABLE IF EXISTS payments;

-- Create the payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Create a trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS update_payment_timestamp ON payments;
CREATE TRIGGER update_payment_timestamp
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_payment_timestamp();

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the payments table
-- Allow users to read their own payments
DROP POLICY IF EXISTS "Allow users to read their own payments" ON payments;
CREATE POLICY "Allow users to read their own payments"
  ON payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow admins to read all payments
DROP POLICY IF EXISTS "Allow admins to read all payments" ON payments;
CREATE POLICY "Allow admins to read all payments"
  ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Allow admins to insert payments
DROP POLICY IF EXISTS "Allow admins to insert payments" ON payments;
CREATE POLICY "Allow admins to insert payments"
  ON payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Allow admins to update payments
DROP POLICY IF EXISTS "Allow admins to update payments" ON payments;
CREATE POLICY "Allow admins to update payments"
  ON payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Insert sample payment data
-- First, get some user IDs from the profiles table
DO $$
DECLARE
  user_record RECORD;
  user_ids UUID[] := ARRAY[]::UUID[];
  selected_user_id UUID;
  payment_amount DECIMAL;
  payment_date TIMESTAMP;
  i INTEGER;
BEGIN
  -- Get up to 10 user IDs from the profiles table
  FOR user_record IN (SELECT id FROM profiles LIMIT 10)
  LOOP
    user_ids := array_append(user_ids, user_record.id);
  END LOOP;
  
  -- If we have no users, exit
  IF array_length(user_ids, 1) IS NULL THEN
    RAISE NOTICE 'No users found in profiles table. Cannot create sample payment data.';
    RETURN;
  END IF;
  
  -- Create 20 sample payments
  FOR i IN 1..20 LOOP
    -- Select a random user ID from our array
    selected_user_id := user_ids[1 + floor(random() * array_length(user_ids, 1))::INTEGER];
    
    -- Generate a random payment amount between 1000 and 5000
    payment_amount := 1000 + floor(random() * 4000)::DECIMAL;
    
    -- Generate a random date in the past 90 days
    payment_date := NOW() - (floor(random() * 90)::INTEGER || ' days')::INTERVAL;
    
    -- Insert the payment record
    INSERT INTO payments (
      user_id,
      amount,
      payment_method,
      status,
      created_at
    )
    VALUES (
      selected_user_id,
      payment_amount,
      CASE floor(random() * 3)::INTEGER
        WHEN 0 THEN 'credit_card'
        WHEN 1 THEN 'bank_transfer'
        ELSE 'paypal'
      END,
      CASE WHEN random() > 0.1 THEN 'completed' ELSE 'failed' END,
      payment_date
    );
  END LOOP;
  
  -- Update the is_subscribed flag for users who have made payments
  UPDATE profiles
  SET is_subscribed = true
  WHERE id IN (SELECT DISTINCT user_id FROM payments WHERE status = 'completed');
  
  RAISE NOTICE 'Created % sample payment records', i - 1;
END $$;
