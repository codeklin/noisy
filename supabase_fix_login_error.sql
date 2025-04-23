-- Drop problematic triggers that might be causing login issues
DROP TRIGGER IF EXISTS on_auth_user_sign_in ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the functions associated with these triggers
DROP FUNCTION IF EXISTS sync_last_sign_in_at();
DROP FUNCTION IF EXISTS handle_new_user();

-- Create a safer version of the handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the profile already exists to avoid conflicts
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
    -- Insert the new profile with the email from auth.users
    INSERT INTO public.profiles (
      id, 
      email, 
      is_admin,
      is_subscribed,
      has_used_generator_demo,
      has_used_viral_generator_demo,
      created_at, 
      updated_at,
      last_sign_in_at
    )
    VALUES (
      NEW.id, 
      NEW.email,
      CASE WHEN NEW.email = '007postit@gmail.com' THEN true ELSE false END,
      CASE WHEN NEW.email = '007postit@gmail.com' THEN true ELSE false END,
      false,
      false,
      now(), 
      now(),
      NEW.last_sign_in_at
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a safer version of the sync_last_sign_in_at function
CREATE OR REPLACE FUNCTION sync_last_sign_in_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if the profile exists and last_sign_in_at has changed
  IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at THEN
    UPDATE profiles
    SET 
      last_sign_in_at = NEW.last_sign_in_at,
      updated_at = now()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE NOTICE 'Error updating last_sign_in_at: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the triggers with proper error handling
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER on_auth_user_sign_in
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at)
  EXECUTE FUNCTION sync_last_sign_in_at();

-- Fix any existing profiles for 007postit@gmail.com
UPDATE profiles
SET 
  is_admin = true,
  is_subscribed = true,
  updated_at = now()
WHERE email = '007postit@gmail.com';

-- Insert a profile for 007postit@gmail.com if it doesn't exist
INSERT INTO profiles (
  id, 
  email, 
  is_admin,
  is_subscribed,
  has_used_generator_demo,
  has_used_viral_generator_demo,
  created_at, 
  updated_at
)
SELECT 
  id,
  email,
  true,
  true,
  false,
  false,
  now(),
  now()
FROM auth.users
WHERE email = '007postit@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = '007postit@gmail.com'
);
