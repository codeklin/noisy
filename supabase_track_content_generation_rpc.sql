-- Create an RPC function to track content generation
-- This can be called from the client side
CREATE OR REPLACE FUNCTION track_content_generation(
  generation_type TEXT,
  is_success BOOLEAN,
  details JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  existing_record RECORD;
BEGIN
  -- Check if we already have a record for this generation type today
  SELECT * INTO existing_record
  FROM analytics_events
  WHERE event_type = 'content_generation'
    AND event_name = generation_type
    AND DATE(created_at) = today_date;
    
  IF FOUND THEN
    -- Update the existing record
    UPDATE analytics_events
    SET 
      count = existing_record.count + 1,
      total_count = existing_record.total_count + 1,
      success_count = CASE WHEN is_success THEN existing_record.success_count + 1 ELSE existing_record.success_count END,
      details = COALESCE(existing_record.details, '{}'::jsonb) || COALESCE(details, '{}'::jsonb),
      updated_at = NOW()
    WHERE id = existing_record.id;
  ELSE
    -- Insert a new record
    INSERT INTO analytics_events (
      event_type,
      event_name,
      count,
      total_count,
      success_count,
      details,
      created_at
    )
    VALUES (
      'content_generation',
      generation_type,
      1,
      1,
      CASE WHEN is_success THEN 1 ELSE 0 END,
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
