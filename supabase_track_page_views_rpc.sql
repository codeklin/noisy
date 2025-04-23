-- Create an RPC function to track page views
-- This can be called from the client side
CREATE OR REPLACE FUNCTION track_page_view(page_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  existing_record RECORD;
BEGIN
  -- Check if we already have a record for this page today
  SELECT * INTO existing_record
  FROM analytics_events
  WHERE event_type = 'page_view'
    AND event_name = page_name
    AND DATE(created_at) = today_date;
    
  IF FOUND THEN
    -- Update the existing record
    UPDATE analytics_events
    SET count = existing_record.count + 1,
        updated_at = NOW()
    WHERE id = existing_record.id;
  ELSE
    -- Insert a new record
    INSERT INTO analytics_events (
      event_type,
      event_name,
      count,
      created_at
    )
    VALUES (
      'page_view',
      page_name,
      1,
      NOW()
    );
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
