-- Create an RPC function to track errors
-- This can be called from the client side
CREATE OR REPLACE FUNCTION track_error(
  error_type TEXT,
  details JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  existing_record RECORD;
BEGIN
  -- Check if we already have a record for this error type today
  SELECT * INTO existing_record
  FROM analytics_events
  WHERE event_type = 'error'
    AND event_name = error_type
    AND DATE(created_at) = today_date;
    
  IF FOUND THEN
    -- Update the existing record
    UPDATE analytics_events
    SET 
      count = existing_record.count + 1,
      details = COALESCE(existing_record.details, '{}'::jsonb) || COALESCE(details, '{}'::jsonb),
      updated_at = NOW()
    WHERE id = existing_record.id;
  ELSE
    -- Insert a new record
    INSERT INTO analytics_events (
      event_type,
      event_name,
      count,
      details,
      created_at
    )
    VALUES (
      'error',
      error_type,
      1,
      details,
      NOW()
    );
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
