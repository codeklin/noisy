-- Function to create the content_plans table if it doesn't exist
CREATE OR REPLACE FUNCTION create_content_plans_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'content_plans'
  ) THEN
    RETURN true;
  END IF;

  -- Create the content_plans table
  CREATE TABLE public.content_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    brand_info JSONB NOT NULL,
    posts JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create indexes for better query performance
  CREATE INDEX idx_content_plans_user_id ON public.content_plans(user_id);
  CREATE INDEX idx_content_plans_created_at ON public.content_plans(created_at);
  CREATE INDEX idx_content_plans_updated_at ON public.content_plans(updated_at);

  -- Enable Row Level Security
  ALTER TABLE public.content_plans ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies for the content_plans table
  -- Allow users to read their own content plans
  CREATE POLICY "Users can read their own content plans"
    ON public.content_plans
    FOR SELECT
    USING (auth.uid() = user_id);

  -- Allow users to insert their own content plans
  CREATE POLICY "Users can insert their own content plans"
    ON public.content_plans
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  -- Allow users to update their own content plans
  CREATE POLICY "Users can update their own content plans"
    ON public.content_plans
    FOR UPDATE
    USING (auth.uid() = user_id);

  -- Allow users to delete their own content plans
  CREATE POLICY "Users can delete their own content plans"
    ON public.content_plans
    FOR DELETE
    USING (auth.uid() = user_id);

  -- Create the trigger on content_plans
  EXECUTE 'CREATE OR REPLACE FUNCTION update_content_plan_timestamp()
  RETURNS TRIGGER AS $trigger$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $trigger$ LANGUAGE plpgsql';

  EXECUTE 'CREATE TRIGGER update_content_plan_timestamp
    BEFORE UPDATE ON public.content_plans
    FOR EACH ROW EXECUTE FUNCTION update_content_plan_timestamp()';


  RETURN true;
END;
$$;

-- Function to create the profiles table if it doesn't exist
CREATE OR REPLACE FUNCTION create_profiles_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
  ) THEN
    RETURN true;
  END IF;

  -- Create the profiles table
  CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT,
    is_admin BOOLEAN DEFAULT false,
    is_subscribed BOOLEAN DEFAULT false,
    has_used_generator_demo BOOLEAN DEFAULT false,
    has_used_viral_generator_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create indexes for better query performance
  CREATE INDEX idx_profiles_email ON public.profiles(email);
  CREATE INDEX idx_profiles_is_admin ON public.profiles(is_admin);
  CREATE INDEX idx_profiles_is_subscribed ON public.profiles(is_subscribed);

  -- Enable Row Level Security
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

  -- Allow users to read their own profile
  CREATE POLICY "Users can read their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

  -- Allow users to update their own profile
  CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

  -- Allow users to insert their own profile
  CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

  -- Create the trigger on profiles
  EXECUTE 'CREATE OR REPLACE FUNCTION update_profile_timestamp()
  RETURNS TRIGGER AS $trigger$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $trigger$ LANGUAGE plpgsql';

  EXECUTE 'CREATE TRIGGER update_profile_timestamp
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_profile_timestamp()';


  RETURN true;
END;
$$;
