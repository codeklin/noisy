-- This script updates the email field in the profiles table for all users
-- It copies the email from auth.users to profiles for each user

-- First, create a function to update all profile emails
CREATE OR REPLACE FUNCTION update_all_profile_emails()
RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Loop through all users in auth.users
  FOR user_record IN 
    SELECT id, email FROM auth.users
  LOOP
    -- Update the corresponding profile with the email from auth.users
    UPDATE profiles
    SET email = user_record.email
    WHERE id = user_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to update all emails
SELECT update_all_profile_emails();

-- Drop the function after use
DROP FUNCTION update_all_profile_emails();

-- Verify the update
SELECT id, email FROM profiles LIMIT 10;
