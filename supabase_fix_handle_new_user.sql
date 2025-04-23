-- Drop the existing handle_new_user function
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create an improved handle_new_user function that ensures email is properly copied
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the new user's email for debugging
  RAISE NOTICE 'Creating profile for new user with email: %', NEW.email;
  
  -- Insert the new profile with the email from auth.users
  INSERT INTO public.profiles (
    id, 
    email, 
    is_admin,
    is_subscribed,
    has_used_generator_demo,
    has_used_viral_generator_demo,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id, 
    NEW.email, -- Explicitly use the email from auth.users
    false,
    false,
    false,
    false,
    now(), 
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = NEW.email, -- Always update the email to match auth.users
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
