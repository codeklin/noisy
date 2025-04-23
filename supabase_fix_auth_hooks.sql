-- Create a function to safely update user profiles on sign-in
CREATE OR REPLACE FUNCTION public.handle_auth_user_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If this is a new user or the user doesn't have a profile yet
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    -- Create a new profile
    INSERT INTO public.profiles (
      id,
      email,
      is_admin,
      is_subscribed,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.email,
      CASE WHEN NEW.email = '007postit@gmail.com' THEN true ELSE false END,
      CASE WHEN NEW.email = '007postit@gmail.com' THEN true ELSE false END,
      NEW.last_sign_in_at,
      NOW(),
      NOW()
    );
  ELSE
    -- Update the existing profile
    UPDATE public.profiles
    SET
      email = NEW.email,
      last_sign_in_at = NEW.last_sign_in_at,
      is_admin = CASE WHEN NEW.email = '007postit@gmail.com' THEN true ELSE profiles.is_admin END,
      is_subscribed = CASE WHEN NEW.email = '007postit@gmail.com' THEN true ELSE profiles.is_subscribed END,
      updated_at = NOW()
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the transaction
    RAISE WARNING 'Error in handle_auth_user_update: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_sign_in ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Create a single trigger that handles both creation and updates
CREATE TRIGGER on_auth_user_updated
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_update();

-- Fix any existing profiles for the admin user
UPDATE profiles
SET 
  is_admin = true,
  is_subscribed = true,
  updated_at = NOW()
WHERE email = '007postit@gmail.com';

-- Create a profile for the admin user if it doesn't exist
INSERT INTO profiles (
  id,
  email,
  is_admin,
  is_subscribed,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  true,
  true,
  NOW(),
  NOW()
FROM auth.users
WHERE 
  email = '007postit@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM profiles WHERE email = '007postit@gmail.com');
