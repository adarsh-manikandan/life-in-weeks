/*
  # Fix life expectancy table

  1. Changes
    - Drop existing table if exists to avoid conflicts
    - Recreate life expectancy table with proper schema
    - Add sample data for common countries

  2. Security
    - Enable RLS
    - Add public read access policy
*/

-- Drop and recreate the table
DROP TABLE IF EXISTS life_expectancy;

CREATE TABLE life_expectancy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text UNIQUE NOT NULL,
  life_expectancy numeric NOT NULL,
  year integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE life_expectancy ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access"
  ON life_expectancy
  FOR SELECT
  TO public
  USING (true);

-- Insert sample data
INSERT INTO life_expectancy (country, life_expectancy, year)
VALUES
  ('Japan', 84.7, 2021),
  ('Switzerland', 84.3, 2021),
  ('Australia', 84.3, 2021),
  ('Israel', 84.2, 2021),
  ('South Korea', 83.7, 2021),
  ('Sweden', 83.3, 2021),
  ('France', 83.2, 2021),
  ('Canada', 82.7, 2021),
  ('Netherlands', 82.5, 2021),
  ('United States', 77.2, 2021),
  ('China', 77.1, 2021),
  ('Brazil', 75.9, 2021),
  ('Russia', 73.2, 2021),
  ('India', 70.1, 2021)
ON CONFLICT (country) DO UPDATE
SET life_expectancy = EXCLUDED.life_expectancy,
    year = EXCLUDED.year;