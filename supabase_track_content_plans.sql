-- Create a function to track content plan creation
CREATE OR REPLACE FUNCTION track_content_plan_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Track this as an analytics event
  INSERT INTO analytics_events (
    event_type, 
    event_name, 
    count, 
    details
  )
  VALUES (
    'user_action',
    'create_content_plan',
    1,
    json_build_object(
      'user_id', NEW.user_id,
      'plan_id', NEW.id,
      'plan_name', NEW.name
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to track content plan creation
DROP TRIGGER IF EXISTS on_content_plan_creation ON content_plans;
CREATE TRIGGER on_content_plan_creation
  AFTER INSERT ON content_plans
  FOR EACH ROW
  EXECUTE FUNCTION track_content_plan_creation();

-- Create a function to track content plan deletion
CREATE OR REPLACE FUNCTION track_content_plan_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Track this as an analytics event
  INSERT INTO analytics_events (
    event_type, 
    event_name, 
    count, 
    details
  )
  VALUES (
    'user_action',
    'delete_content_plan',
    1,
    json_build_object(
      'user_id', OLD.user_id,
      'plan_id', OLD.id,
      'plan_name', OLD.name
    )
  );
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to track content plan deletion
DROP TRIGGER IF EXISTS on_content_plan_deletion ON content_plans;
CREATE TRIGGER on_content_plan_deletion
  AFTER DELETE ON content_plans
  FOR EACH ROW
  EXECUTE FUNCTION track_content_plan_deletion();
