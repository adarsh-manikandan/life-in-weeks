import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Info, Search, Palette, Download, RefreshCw } from 'lucide-react';
import { supabase } from './lib/supabase';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import LifeInWeeks from './components/LifeInWeeks';

interface CountryData {
  country: string;
  life_expectancy: number;
  year: number;
}

const colorThemes = {
  rose: {
    primary: '#FF4E64',
    accent: '#FF8B9C',
    filled: 'bg-[#FF4E64]',
    filledHover: 'hover:bg-[#FF3951]',
    ring: 'focus:ring-[#FF4E64]',
    statBg: 'bg-[#FFF1F3]',
    statText: 'text-[#FF4E64]',
    statValue: 'text-[#FF3951]',
    sleep: 'bg-[#FFD9DE]',
  },
  blue: {
    primary: '#3B82F6',
    accent: '#60A5FA',
    filled: 'bg-[#3B82F6]',
    filledHover: 'hover:bg-[#2563EB]',
    ring: 'focus:ring-[#3B82F6]',
    statBg: 'bg-[#EFF6FF]',
    statText: 'text-[#3B82F6]',
    statValue: 'text-[#2563EB]',
    sleep: 'bg-[#BFDBFE]',
  },
  amber: {
    primary: '#F59E0B',
    accent: '#FBBF24',
    filled: 'bg-[#F59E0B]',
    filledHover: 'hover:bg-[#D97706]',
    ring: 'focus:ring-[#F59E0B]',
    statBg: 'bg-[#FEF3C7]',
    statText: 'text-[#F59E0B]',
    statValue: 'text-[#D97706]',
    sleep: 'bg-[#FDE68A]',
  }
};

function App() {
  const [age, setAge] = useState<number>(30);
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(80);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [colorTheme, setColorTheme] = useState<keyof typeof colorThemes>('rose');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const theme = colorThemes[colorTheme];
  const WEEKS_IN_YEAR = 52;
  const SLEEP_PERCENTAGE = 0.33;

  useEffect(() => {
    fetchLifeExpectancy();
  }, []);

  const fetchLifeExpectancy = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('life_expectancy')
        .select('country, life_expectancy, year')
        .order('country');

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('No data available');
      
      setCountryData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const totalWeeks = lifeExpectancy * WEEKS_IN_YEAR;
  const spentWeeks = Math.min(age * WEEKS_IN_YEAR, totalWeeks);
  const remainingWeeks = totalWeeks - spentWeeks;
  const sleepWeeks = Math.round(remainingWeeks * SLEEP_PERCENTAGE);
  const awakeWeeks = remainingWeeks - sleepWeeks;
  const percentageLived = totalWeeks > 0 ? (spentWeeks / totalWeeks) * 100 : 0;

  const filteredCountries = useMemo(() => {
    return countryData.filter(country =>
      country.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [countryData, searchQuery]);

  const handleCountrySelect = (country: CountryData) => {
    setSelectedCountry(country.country);
    setLifeExpectancy(country.life_expectancy);
    setSearchQuery('');
  };

  const downloadPDF = async () => {
    if (isGeneratingPDF) return;
    
    setIsGeneratingPDF(true);
    try {
      const element = document.querySelector('.visualization-container') as HTMLDivElement;
      if (!element) throw new Error('Visualization element not found');

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save('life-in-weeks.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchLifeExpectancy}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LifeInWeeks 
        initialAge={age}
        initialCountry={selectedCountry}
        initialLifeExpectancy={lifeExpectancy}
      />
    </div>
  );
}

export default App;