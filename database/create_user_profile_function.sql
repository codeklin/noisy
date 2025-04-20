-- Create a function to create user profiles that bypasses RLS
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  is_admin_val BOOLEAN DEFAULT false,
  is_subscribed_val BOOLEAN DEFAULT false
)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
BEGIN
  -- Insert the profile
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
    user_id,
    user_email,
    is_admin_val,
    is_subscribed_val,
    false,
    false,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    is_admin = EXCLUDED.is_admin,
    is_subscribed = EXCLUDED.is_subscribed,
    updated_at = now();

  -- Check if the insert was successful
  GET DIAGNOSTICS success = ROW_COUNT;
  RETURN success > 0;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating profile: %', SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to the function for authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, BOOLEAN, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, BOOLEAN, BOOLEAN) TO anon;

-- Create a function to check if a user exists
CREATE OR REPLACE FUNCTION public.check_user_exists(
  user_email TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if the user exists in the profiles table
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = user_email
  ) INTO user_exists;

  RETURN user_exists;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error checking if user exists: %', SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to the function for authenticated users
GRANT EXECUTE ON FUNCTION public.check_user_exists(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_exists(TEXT) TO anon;
