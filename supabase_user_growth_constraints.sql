-- Add a unique constraint to the record_date column in the user_growth table
-- This ensures we don't have duplicate dates and makes the ON CONFLICT clause work
ALTER TABLE user_growth ADD CONSTRAINT user_growth_record_date_key UNIQUE (record_date);
