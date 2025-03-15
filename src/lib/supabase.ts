import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to set up the database
export const setupDatabase = async () => {
  try {
    // Insert the life expectancy data
    const { error: insertError } = await supabase
      .from('life_expectancy')
      .upsert([
        { country: 'Japan', life_expectancy: 84.7, year: 2021 },
        { country: 'Switzerland', life_expectancy: 84.3, year: 2021 },
        { country: 'Australia', life_expectancy: 84.3, year: 2021 },
        { country: 'Israel', life_expectancy: 84.2, year: 2021 },
        { country: 'South Korea', life_expectancy: 83.7, year: 2021 },
        { country: 'Sweden', life_expectancy: 83.3, year: 2021 },
        { country: 'France', life_expectancy: 83.2, year: 2021 },
        { country: 'Norway', life_expectancy: 83.2, year: 2021 },
        { country: 'Italy', life_expectancy: 83.1, year: 2021 },
        { country: 'Iceland', life_expectancy: 83.0, year: 2021 },
        { country: 'Canada', life_expectancy: 82.7, year: 2021 },
        { country: 'Ireland', life_expectancy: 82.6, year: 2021 },
        { country: 'Netherlands', life_expectancy: 82.5, year: 2021 },
        { country: 'New Zealand', life_expectancy: 82.5, year: 2021 },
        { country: 'Singapore', life_expectancy: 82.4, year: 2021 },
        { country: 'Luxembourg', life_expectancy: 82.3, year: 2021 },
        { country: 'Belgium', life_expectancy: 81.9, year: 2021 },
        { country: 'Finland', life_expectancy: 81.8, year: 2021 },
        { country: 'Portugal', life_expectancy: 81.7, year: 2021 },
        { country: 'United Kingdom', life_expectancy: 80.9, year: 2021 },
        { country: 'Germany', life_expectancy: 80.6, year: 2021 },
        { country: 'United States', life_expectancy: 77.2, year: 2021 },
        { country: 'China', life_expectancy: 77.1, year: 2021 },
        { country: 'Brazil', life_expectancy: 75.9, year: 2021 },
        { country: 'Russia', life_expectancy: 73.2, year: 2021 },
        { country: 'India', life_expectancy: 70.1, year: 2021 }
      ], {
        onConflict: 'country'
      });

    if (insertError) {
      console.error('Error inserting data:', insertError);
      return false;
    }

    console.log('Database setup completed successfully');
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  }
};

// Add better error handling for the connection test
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('life_expectancy')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Supabase connection error:', error.message);
      console.error('Error details:', error);
      return false;
    }

    if (!data) {
      console.error('No data available in the life_expectancy table');
      return false;
    }

    console.log('Supabase connection successful');
    console.log('Sample data:', data);
    return true;
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    return false;
  }
};

// Test the connection and set up the database if needed
(async () => {
  const isConnected = await testConnection();
  if (!isConnected) {
    console.log('Attempting to set up the database...');
    await setupDatabase();
  }
})();

export default supabase;