/*
  # Create Life Expectancy Table

  1. New Tables
    - `life_expectancy`
      - `id` (uuid, primary key)
      - `country` (text, unique)
      - `life_expectancy` (numeric)
      - `year` (integer)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `life_expectancy` table
    - Add policy for public read access
*/

-- Create the life expectancy table
CREATE TABLE IF NOT EXISTS life_expectancy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text UNIQUE NOT NULL,
  life_expectancy numeric NOT NULL,
  year integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
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
  ('United States', 76.1, 2021),
  ('Japan', 84.7, 2021),
  ('United Kingdom', 80.9, 2021),
  ('Canada', 82.3, 2021),
  ('Australia', 83.2, 2021),
  ('Germany', 80.6, 2021),
  ('France', 82.5, 2021),
  ('Italy', 82.9, 2021),
  ('Spain', 83.3, 2021),
  ('Sweden', 82.8, 2021)
ON CONFLICT (country) DO NOTHING;