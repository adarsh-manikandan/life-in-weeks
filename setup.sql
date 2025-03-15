-- Create the life expectancy table
CREATE TABLE IF NOT EXISTS life_expectancy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text UNIQUE NOT NULL,
  life_expectancy numeric NOT NULL,
  year integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE life_expectancy ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access"
  ON life_expectancy
  FOR SELECT
  TO public
  USING (true);

-- Create policy for public insert/update access (needed for our setup)
CREATE POLICY "Allow public insert/update access"
  ON life_expectancy
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Insert initial data
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
  ('United Kingdom', 80.9, 2021),
  ('Germany', 80.6, 2021),
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