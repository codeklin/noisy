-- Create a function to get user auth data including last sign in time
CREATE OR REPLACE FUNCTION get_user_auth_data()
RETURNS TABLE (
  id UUID,
  email TEXT,
  last_sign_in_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    au.last_sign_in_at
  FROM auth.users au;
END;
$$;
