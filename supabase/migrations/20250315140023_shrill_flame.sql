/*
  # Enhance life expectancy table performance and maintenance

  1. Changes
    - Add indexes for frequently queried columns
    - Add updated_at column with trigger
    - Add additional countries data

  2. Security
    - No changes to existing RLS policies
*/

-- Add index for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_life_expectancy_country ON life_expectancy (country);
CREATE INDEX IF NOT EXISTS idx_life_expectancy_year ON life_expectancy (year);

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'life_expectancy' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE life_expectancy ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create or replace update trigger
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

-- Insert additional countries data
INSERT INTO life_expectancy (country, life_expectancy, year)
VALUES
  ('Norway', 83.2, 2021),
  ('Italy', 83.1, 2021),
  ('Iceland', 83.0, 2021),
  ('Ireland', 82.6, 2021),
  ('New Zealand', 82.5, 2021),
  ('Singapore', 82.4, 2021),
  ('Luxembourg', 82.3, 2021),
  ('Belgium', 81.9, 2021),
  ('Finland', 81.8, 2021),
  ('Portugal', 81.7, 2021)
ON CONFLICT (country) DO UPDATE
SET life_expectancy = EXCLUDED.life_expectancy,
    year = EXCLUDED.year;