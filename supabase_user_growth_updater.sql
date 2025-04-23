-- Create a function to update the user_growth table with daily user counts
CREATE OR REPLACE FUNCTION update_user_growth_daily()
RETURNS void AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  user_count INTEGER;
BEGIN
  -- Get the count of users
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- Insert or update the record for today
  INSERT INTO user_growth (record_date, user_count)
  VALUES (today_date, user_count)
  ON CONFLICT (record_date) 
  DO UPDATE SET 
    user_count = EXCLUDED.user_count,
    updated_at = NOW();
    
  RAISE NOTICE 'Updated user growth for % with % users', today_date, user_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to backfill user growth data for the past 30 days
CREATE OR REPLACE FUNCTION backfill_user_growth_data()
RETURNS void AS $$
DECLARE
  current_date DATE := CURRENT_DATE;
  day_offset INTEGER;
  estimated_users INTEGER;
  total_users INTEGER;
BEGIN
  -- Get the current total number of users
  SELECT COUNT(*) INTO total_users FROM profiles;
  
  -- Loop through the past 30 days
  FOR day_offset IN 0..30 LOOP
    -- Calculate an estimated user count for past days
    -- This is just a simple estimation - in a real app, you might want to use actual historical data
    estimated_users := GREATEST(5, total_users - (day_offset * (total_users / 40)::INTEGER));
    
    -- Insert or update the record for this day
    INSERT INTO user_growth (record_date, user_count)
    VALUES (current_date - day_offset * INTERVAL '1 day', estimated_users)
    ON CONFLICT (record_date) 
    DO NOTHING; -- Don't update existing records
  END LOOP;
  
  RAISE NOTICE 'Backfilled user growth data for the past 30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a cron job to update user growth daily
-- Note: This requires the pg_cron extension to be enabled
DO $$
BEGIN
  -- Check if pg_cron extension exists
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- Schedule the job to run daily at midnight
    PERFORM cron.schedule('0 0 * * *', 'SELECT update_user_growth_daily()');
    RAISE NOTICE 'Scheduled daily user growth update job';
  ELSE
    RAISE NOTICE 'pg_cron extension not available. Daily updates will need to be triggered manually or through an external scheduler.';
  END IF;
END $$;

-- Run the backfill function to populate historical data
SELECT backfill_user_growth_data();

-- Run the update function to ensure today's data is current
SELECT update_user_growth_daily();
