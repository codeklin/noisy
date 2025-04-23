-- Create a function to track new user registrations
CREATE OR REPLACE FUNCTION track_new_user_registration()
RETURNS TRIGGER AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  current_count INTEGER;
BEGIN
  -- Get the current count for today
  SELECT user_count INTO current_count 
  FROM user_growth 
  WHERE record_date = today_date;
  
  IF FOUND THEN
    -- Update the existing record
    UPDATE user_growth
    SET user_count = current_count + 1,
        updated_at = NOW()
    WHERE record_date = today_date;
  ELSE
    -- Insert a new record
    INSERT INTO user_growth (record_date, user_count)
    VALUES (today_date, 1);
  END IF;
  
  -- Also track this as an analytics event
  INSERT INTO analytics_events (
    event_type, 
    event_name, 
    count, 
    details
  )
  VALUES (
    'user_action',
    'new_registration',
    1,
    json_build_object('user_id', NEW.id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to track new user registrations
DROP TRIGGER IF EXISTS on_user_registration ON profiles;
CREATE TRIGGER on_user_registration
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION track_new_user_registration();
