-- Create a function to check if a user exists in the auth system
CREATE OR REPLACE FUNCTION public.check_user_exists(
  user_email TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if the user exists in the auth.users table
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

-- Create a function to get user by email
CREATE OR REPLACE FUNCTION public.get_user_by_email(
  user_email TEXT
)
RETURNS json AS $$
DECLARE
  user_data json;
BEGIN
  -- Get the user from auth.users
  SELECT 
    json_build_object(
      'id', id,
      'email', email,
      'email_confirmed_at', email_confirmed_at,
      'last_sign_in_at', last_sign_in_at,
      'created_at', created_at
    )
  FROM auth.users 
  WHERE email = user_email
  INTO user_data;
  
  RETURN user_data;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error getting user by email: %', SQLERRM;
    RETURN null;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to the function for authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_by_email(TEXT) TO anon;
