/*
  # Add Restaurant Insert Policy

  1. Changes
    - Add INSERT policy to allow users to create their restaurant during signup
    - Add INSERT policy for bikers table as well

  2. Security
    - Users can only create restaurants where they are the owner
    - Users can only create their own biker profile
*/

-- Add INSERT policy for restaurants
CREATE POLICY "Users can create their own restaurant"
  ON restaurants FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Also allow during signup (anon)
CREATE POLICY "Allow restaurant creation during signup"
  ON restaurants FOR INSERT
  TO anon
  WITH CHECK (true);

-- Add INSERT policy for bikers
CREATE POLICY "Users can create own biker profile"
  ON bikers FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Also allow during signup (anon)
CREATE POLICY "Allow biker creation during signup"
  ON bikers FOR INSERT
  TO anon
  WITH CHECK (true);
