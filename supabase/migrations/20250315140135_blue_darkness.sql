/*
  # Fix life expectancy table structure and data

  1. Changes
    - Ensure table exists with correct structure
    - Verify indexes are present
    - Update data consistency

  2. Security
    - Verify RLS policies
*/

-- Ensure the table exists with correct structure
CREATE TABLE IF NOT EXISTS life_expectancy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text UNIQUE NOT NULL,
  life_expectancy numeric NOT NULL,
  year integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure RLS is enabled
ALTER TABLE life_expectancy ENABLE ROW LEVEL SECURITY;

-- Ensure public read access policy exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'life_expectancy' 
    AND policyname = 'Allow public read access'
  ) THEN
    CREATE POLICY "Allow public read access"
      ON life_expectancy
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_life_expectancy_country ON life_expectancy (country);
CREATE INDEX IF NOT EXISTS idx_life_expectancy_year ON life_expectancy (year);

-- Ensure trigger for updated_at exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_life_expectancy_updated_at ON life_expectancy;
CREATE TRIGGER update_life_expectancy_updated_at
    BEFORE UPDATE ON life_expectancy
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Refresh the data
INSERT INTO life_expectancy (country, life_expectancy, year)
VALUES
  ('Japan', 84.7, 2021),
  ('Switzerland', 84.3, 2021),
  ('Australia', 84.3, 2021),
  ('Israel', 84.2, 2021),
  ('South Korea', 83.7, 2021),
  ('Sweden', 83.3, 2021),
  ('France', 83.2, 2021),
  ('Norway', 83.2, 2021),
  ('Italy', 83.1, 2021),
  ('Iceland', 83.0, 2021),
  ('Canada', 82.7, 2021),
  ('Ireland', 82.6, 2021),
  ('Netherlands', 82.5, 2021),
  ('New Zealand', 82.5, 2021),
  ('Singapore', 82.4, 2021),
  ('Luxembourg', 82.3, 2021),
  ('Belgium', 81.9, 2021),
  ('Finland', 81.8, 2021),
  ('Portugal', 81.7, 2021),
  ('United States', 77.2, 2021),
  ('China', 77.1, 2021),
  ('Brazil', 75.9, 2021),
  ('Russia', 73.2, 2021),
  ('India', 70.1, 2021)
ON CONFLICT (country) 
DO UPDATE SET 
  life_expectancy = EXCLUDED.life_expectancy,
  year = EXCLUDED.year,
  updated_at = now();