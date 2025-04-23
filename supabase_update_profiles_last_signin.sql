-- Add last_sign_in_at column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMP WITH TIME ZONE;

-- Create a function to update the last_sign_in_at column in profiles
CREATE OR REPLACE FUNCTION update_profiles_last_signin()
RETURNS void AS $$
BEGIN
  -- Update the last_sign_in_at column in profiles with data from auth.users
  UPDATE profiles p
  SET last_sign_in_at = au.last_sign_in_at
  FROM auth.users au
  WHERE p.id = au.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to update all profiles
SELECT update_profiles_last_signin();

-- Create a trigger function to keep the last_sign_in_at column updated
CREATE OR REPLACE FUNCTION sync_last_sign_in_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the corresponding profile with the last_sign_in_at from auth.users
  UPDATE profiles
  SET last_sign_in_at = NEW.last_sign_in_at
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_sign_in ON auth.users;
CREATE TRIGGER on_auth_user_sign_in
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_last_sign_in_at();
