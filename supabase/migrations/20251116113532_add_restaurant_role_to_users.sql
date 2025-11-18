/*
  # Add restaurant role to users

  1. Changes
    - Update user_mode constraint to include 'restaurant' role
    - Add owner_id column to restaurants table to link with users
  
  2. Security
    - Update RLS policies to support restaurant owners
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'users' AND constraint_name = 'users_user_mode_check'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_user_mode_check;
  END IF;
END $$;

ALTER TABLE users ADD CONSTRAINT users_user_mode_check 
  CHECK (user_mode = ANY (ARRAY['customer'::text, 'biker'::text, 'restaurant'::text]));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN owner_id uuid REFERENCES users(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_restaurants_owner_id ON restaurants(owner_id);

CREATE POLICY "Restaurant owners can view their restaurant"
  ON restaurants FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Restaurant owners can update their restaurant"
  ON restaurants FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());
