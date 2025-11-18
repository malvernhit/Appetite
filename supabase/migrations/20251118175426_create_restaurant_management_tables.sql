/*
  # Restaurant Management Enhancement

  1. New Tables
    - `food_categories`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key to restaurants)
      - `name` (text) - Category name (e.g., "Appetizers", "Main Course")
      - `description` (text, optional) - Category description
      - `display_order` (integer) - Order to display categories
      - `is_active` (boolean) - Whether category is active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes to Existing Tables
    - Add `category_id` to `dishes` table to link to food_categories
    - Add `preparation_time` to `dishes` table (estimated time in minutes)
    - Add indexes for better query performance

  3. Security
    - Enable RLS on `food_categories` table
    - Add policies for restaurant owners to manage their categories
    - Add policies for restaurant owners to manage their dishes
*/

-- Create food_categories table
CREATE TABLE IF NOT EXISTS food_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to dishes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dishes' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE dishes ADD COLUMN category_id uuid REFERENCES food_categories(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dishes' AND column_name = 'preparation_time'
  ) THEN
    ALTER TABLE dishes ADD COLUMN preparation_time integer DEFAULT 15;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_food_categories_restaurant_id ON food_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_dishes_category_id ON dishes(category_id);
CREATE INDEX IF NOT EXISTS idx_dishes_restaurant_id ON dishes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Enable RLS
ALTER TABLE food_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for food_categories

-- Restaurant owners can view their own categories
CREATE POLICY "Restaurant owners can view own categories"
  ON food_categories FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = food_categories.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Restaurant owners can insert their own categories
CREATE POLICY "Restaurant owners can create categories"
  ON food_categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = food_categories.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Restaurant owners can update their own categories
CREATE POLICY "Restaurant owners can update own categories"
  ON food_categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = food_categories.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = food_categories.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Restaurant owners can delete their own categories
CREATE POLICY "Restaurant owners can delete own categories"
  ON food_categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = food_categories.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Customers can view active categories for any restaurant
CREATE POLICY "Customers can view active categories"
  ON food_categories FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Update RLS policies for dishes to include restaurant owner access

-- Restaurant owners can view their own dishes
CREATE POLICY "Restaurant owners can view own dishes"
  ON dishes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = dishes.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Restaurant owners can create dishes
CREATE POLICY "Restaurant owners can create dishes"
  ON dishes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = dishes.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Restaurant owners can update their own dishes
CREATE POLICY "Restaurant owners can update own dishes"
  ON dishes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = dishes.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = dishes.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Restaurant owners can delete their own dishes
CREATE POLICY "Restaurant owners can delete own dishes"
  ON dishes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = dishes.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Restaurant owners can view orders for their restaurant
CREATE POLICY "Restaurant owners can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = orders.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Restaurant owners can update order status
CREATE POLICY "Restaurant owners can update order status"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = orders.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = orders.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );
