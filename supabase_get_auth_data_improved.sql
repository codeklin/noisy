-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_user_auth_data();

-- Create an improved function with explicit security definer and permissions
CREATE OR REPLACE FUNCTION get_user_auth_data()
RETURNS TABLE (
  id UUID,
  email TEXT,
  last_sign_in_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user has the necessary permissions
  IF (SELECT rolsuper FROM pg_roles WHERE rolname = current_user) THEN
    -- Return all users if the current user is a superuser
    RETURN QUERY
    SELECT 
      au.id,
      au.email,
      au.last_sign_in_at
    FROM auth.users au;
  ELSE
    -- Return only the current user's data if not a superuser
    RETURN QUERY
    SELECT 
      au.id,
      au.email,
      au.last_sign_in_at
    FROM auth.users au
    WHERE au.id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
    );
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_auth_data() TO authenticated;

-- Create a simpler function that doesn't require special permissions
CREATE OR REPLACE FUNCTION get_last_sign_in_times()
RETURNS TABLE (
  user_id UUID,
  last_sign_in TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id as user_id,
    last_sign_in_at as last_sign_in
  FROM auth.users;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_last_sign_in_times() TO authenticated;
