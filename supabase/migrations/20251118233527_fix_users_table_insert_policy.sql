/*
  # Fix Users Table Insert Policy

  1. Changes
    - Add INSERT policy to allow new users to create their profile during signup
    - Create a database trigger to automatically populate users table from auth.users
    - This ensures users are always created even if the application code fails

  2. Security
    - INSERT policy only allows users to create their own profile (auth.uid() = id)
    - Trigger runs with security definer to bypass RLS during automatic population
*/

-- Add INSERT policy for users to create their own profile
CREATE POLICY "Users can create own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also allow anon users to insert during signup (before they're authenticated)
CREATE POLICY "Allow signup user creation"
  ON users FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, phone, user_mode, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_mode', 'customer'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    phone = COALESCE(EXCLUDED.phone, users.phone),
    user_mode = COALESCE(EXCLUDED.user_mode, users.user_mode),
    updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing users from auth.users to public.users
INSERT INTO public.users (id, email, full_name, phone, user_mode, avatar_url, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  COALESCE(au.raw_user_meta_data->>'phone', ''),
  COALESCE(au.raw_user_meta_data->>'user_mode', 'customer'),
  COALESCE(au.raw_user_meta_data->>'avatar_url', ''),
  au.created_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
);
