/*
  # Restore Restaurant Database Schema

  1. Changes
    - Restore restaurant tables (restaurants, food_categories, dishes)
    - Update users table to allow restaurant user_mode
    - Add back restaurant_id to orders table
    - Recreate all necessary indexes and foreign keys
    - Add RLS policies for restaurant tables

  2. Purpose
    - Enable shared database between customer/biker app and future restaurant app
    - Maintain data consistency across different client applications
*/

-- Update users table to allow restaurant mode
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_mode_check;
ALTER TABLE users ADD CONSTRAINT users_user_mode_check 
  CHECK (user_mode = ANY (ARRAY['customer'::text, 'biker'::text, 'restaurant'::text]));

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  cuisine text NOT NULL,
  rating numeric DEFAULT 5.0,
  delivery_time text DEFAULT '20-30 min',
  delivery_fee numeric DEFAULT 2.00,
  min_order numeric DEFAULT 10.00,
  is_open boolean DEFAULT true,
  image_url text,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create food_categories table
CREATE TABLE IF NOT EXISTS food_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create dishes table
CREATE TABLE IF NOT EXISTS dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id uuid REFERENCES food_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  image_url text,
  is_available boolean DEFAULT true,
  prep_time text DEFAULT '15-20 min',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add restaurant_id back to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS restaurant_id uuid REFERENCES restaurants(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_restaurants_owner_id ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_food_categories_restaurant_id ON food_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_dishes_restaurant_id ON dishes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_dishes_category_id ON dishes(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);

-- Enable RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurants
CREATE POLICY "Anyone can view open restaurants"
  ON restaurants FOR SELECT
  TO authenticated
  USING (is_open = true);

CREATE POLICY "Restaurant owners can view their restaurant"
  ON restaurants FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Restaurant owners can update their restaurant"
  ON restaurants FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can create their own restaurant"
  ON restaurants FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Allow restaurant creation during signup"
  ON restaurants FOR INSERT
  TO anon
  WITH CHECK (true);

-- RLS Policies for food_categories
CREATE POLICY "Anyone can view categories"
  ON food_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Restaurant owners can manage their categories"
  ON food_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = food_categories.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- RLS Policies for dishes
CREATE POLICY "Anyone can view available dishes"
  ON dishes FOR SELECT
  TO authenticated
  USING (is_available = true);

CREATE POLICY "Restaurant owners can view their dishes"
  ON dishes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = dishes.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant owners can manage their dishes"
  ON dishes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = dishes.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );
