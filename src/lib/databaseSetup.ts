import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Checks if the content_plans table exists
 * This is a helper function to ensure the database is properly set up
 */
export const ensureContentPlansTableExists = async (): Promise<boolean> => {
  try {
    console.log('Checking if content_plans table exists...');

    // Try to query the content_plans table
    const { error } = await supabase
      .from('content_plans')
      .select('id')
      .limit(1);

    // If there's no error, the table exists
    if (!error) {
      console.log('content_plans table exists');
      return true;
    }

    // If the error is not a "relation does not exist" error, log it and return false
    if (!error.message.includes('relation') && !error.message.includes('does not exist')) {
      console.error('Error checking content_plans table:', error);
      return false;
    }

    console.log('content_plans table does not exist');
    toast.error('Database tables not set up. Please contact support.');
    return false;
  } catch (error) {
    console.error('Error ensuring content_plans table exists:', error);
    return false;
  }
};

/**
 * Checks if the profiles table exists
 */
export const ensureProfilesTableExists = async (): Promise<boolean> => {
  try {
    console.log('Checking if profiles table exists...');

    // Try to query the profiles table
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    // If there's no error, the table exists
    if (!error) {
      console.log('profiles table exists');
      return true;
    }

    // If the error is not a "relation does not exist" error, log it and return false
    if (!error.message.includes('relation') && !error.message.includes('does not exist')) {
      console.error('Error checking profiles table:', error);
      return false;
    }

    console.log('profiles table does not exist');
    toast.error('Database tables not set up. Please contact support.');
    return false;
  } catch (error) {
    console.error('Error ensuring profiles table exists:', error);
    return false;
  }
};

/**
 * Initializes the database by ensuring all required tables exist
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    await Promise.all([
      ensureProfilesTableExists(),
      ensureContentPlansTableExists()
    ]);
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};
