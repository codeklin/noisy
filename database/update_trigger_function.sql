-- Update the trigger function to handle profile creation better
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to insert the profile
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
    new.id, 
    new.email, 
    new.email = '007postit@gmail.com', -- Super user is automatically admin
    new.email = '007postit@gmail.com', -- Super user is automatically subscribed
    false, 
    false, 
    now(), 
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
    
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the transaction
    RAISE NOTICE 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
