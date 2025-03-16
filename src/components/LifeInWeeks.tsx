import React, { useState, useRef, useEffect } from 'react';
import { trackPageView, trackEvent } from '../lib/mixpanel';

interface LifeInWeeksProps {
  initialAge?: number;
  initialCountry?: string;
  initialLifeExpectancy?: number;
}

const COUNTRY_LIFE_EXPECTANCY: Record<string, number> = {
  "United States": 77,
  "United Kingdom": 81,
  "Canada": 82,
  "Australia": 83,
  "Germany": 81,
  "France": 82,
  "Japan": 85,
  "India": 70,
  "China": 77,
  "Brazil": 76,
  "Other": 80,
};

const DEFAULT_COUNTRY = 'India';
const DEFAULT_AGE = 30;

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
      <div className="relative">
        <div className="absolute inset-0 bg-black rounded-xl translate-x-2 translate-y-2"></div>
        <div className="relative bg-white border-2 border-black rounded-xl px-6 py-3 flex items-center gap-3">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-bold">{message}</span>
        </div>
      </div>
    </div>
  );
}

export default function LifeInWeeks({ 
  initialAge = DEFAULT_AGE,
  initialCountry = DEFAULT_COUNTRY,
  initialLifeExpectancy = COUNTRY_LIFE_EXPECTANCY[DEFAULT_COUNTRY]
}: LifeInWeeksProps) {
  const [age, setAge] = useState<number>(initialAge);
  const [country, setCountry] = useState<string>(initialCountry);
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(COUNTRY_LIFE_EXPECTANCY[DEFAULT_COUNTRY]);
  const [showToast, setShowToast] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // Track page view on component mount
  useEffect(() => {
    console.log('Component mounted, tracking page view');
    trackPageView('Life in Weeks');
    
    // Track initial state
    console.log('Tracking initial state');
    trackEvent('Initial State', {
      age,
      country,
      lifeExpectancy,
      timestamp: new Date().toISOString()
    });
  }, []);

  // Get URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ageParam = params.get('age');
    const countryParam = params.get('country');
    
    if (ageParam) {
      const parsedAge = parseInt(ageParam);
      if (!isNaN(parsedAge) && parsedAge >= 0) {
        setAge(parsedAge);
      }
    }
    
    if (countryParam && COUNTRY_LIFE_EXPECTANCY[countryParam]) {
      setCountry(countryParam);
      setLifeExpectancy(COUNTRY_LIFE_EXPECTANCY[countryParam]);
    }
  }, []);

  // Calculate weeks
  const calculateWeeks = (currentAge: number, expectancy: number) => {
    const weeksLived = Math.floor(currentAge * 52);
    const totalWeeks = Math.floor(expectancy * 52);
    const remainingWeeks = Math.max(0, totalWeeks - weeksLived);
    return {
      weeksLived,
      totalWeeks,
      remainingWeeks,
      sleepWeeks: Math.floor(remainingWeeks * 0.33),
      awakeWeeks: Math.floor(remainingWeeks * 0.67),
      percentageLived: Math.min(100, (weeksLived / totalWeeks) * 100)
    };
  };

  const {
    weeksLived,
    sleepWeeks,
    awakeWeeks,
    percentageLived
  } = calculateWeeks(age, lifeExpectancy);

  // Track country changes
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setCountry(newCountry);
    setLifeExpectancy(COUNTRY_LIFE_EXPECTANCY[newCountry]);
    
    // Track country change event
    trackEvent('Country Changed', {
      from: country,
      to: newCountry,
      newLifeExpectancy: COUNTRY_LIFE_EXPECTANCY[newCountry],
      timestamp: new Date().toISOString()
    });
  };

  // Track age changes
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const cleanValue = rawValue.replace(/^0+/, '');
    const value = Number(cleanValue);
    
    if (value >= 0) {
      setAge(value);
      e.target.value = cleanValue;
      
      // Track age change event
      trackEvent('Age Changed', {
        from: age,
        to: value,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleLifeExpectancyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= 0) {
      setLifeExpectancy(value);
    }
  };

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('age', age.toString());
    url.searchParams.set('country', country);
    
    // Track share button click
    trackEvent('Share Button Clicked', {
      age,
      country,
      lifeExpectancy,
      timestamp: new Date().toISOString()
    });

    navigator.clipboard.writeText(url.toString())
      .then(() => {
        setShowToast(true);
        trackEvent('Share Link Copied', {
          age,
          country,
          lifeExpectancy,
          url: url.toString(),
          status: 'success',
          timestamp: new Date().toISOString()
        });
      })
      .catch(error => {
        console.error('Failed to copy link:', error);
        alert('Failed to copy share link. Please try again.');
        trackEvent('Share Link Failed', {
          age,
          country,
          lifeExpectancy,
          url: url.toString(),
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 font-sans">
      {showToast && (
        <Toast 
          message="Link copied to clipboard!" 
          onClose={() => setShowToast(false)} 
        />
      )}
      <div ref={contentRef}>
        {/* First Page Content */}
        <div className="pdf-page print:mb-8">
          {/* Header */}
          <div className="relative mb-8 print:mb-12">
            <div className="absolute inset-0 bg-black rounded-xl translate-x-2 translate-y-2 print:translate-x-1 print:translate-y-1"></div>
            <div className="relative bg-[#FFDE59] rounded-xl border-2 border-black p-6 pdf-preserve-transform">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                <div className="flex-1">
                  <h1 className="text-4xl font-black print:text-5xl">Life in Weeks</h1>
                  <p className="text-sm mt-2 font-medium print:text-base">Visualize your life journey, one week at a time.</p>
                </div>
                <div className="no-print print:hidden flex flex-row sm:flex-row gap-2 justify-start sm:justify-end">
                  <button
                    onClick={handleShare}
                    className="relative transform transition-all hover:-translate-x-1 hover:-translate-y-1 group flex-1 sm:flex-initial w-full sm:w-auto"
                  >
                    <div className="absolute inset-0 bg-black rounded-xl translate-x-1.5 translate-y-1.5 sm:translate-x-2 sm:translate-y-2"></div>
                    <div className="relative bg-white border-2 border-black rounded-xl px-4 py-2 flex items-center justify-center gap-2 w-full">
                      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      <span className="font-bold whitespace-nowrap">Share</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Inputs */}
          <div className="relative mb-6 print:mb-8">
            <div className="absolute inset-0 bg-black rounded-xl translate-x-2 translate-y-2 print:translate-x-1 print:translate-y-1"></div>
            <div className="relative bg-white rounded-xl border-2 border-black p-4 pdf-preserve-transform">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-black font-bold mb-2" htmlFor="age">
                    Current Age
                  </label>
                  <input 
                    id="age"
                    type="number"
                    min="0"
                    value={age}
                    onChange={handleAgeChange}
                    className="w-full p-3 rounded-xl border-2 border-black bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-black print:shadow-none print:bg-white" 
                    placeholder="Enter age" 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-black font-bold mb-2" htmlFor="country">
                    Country
                  </label>
                  <select
                    id="country"
                    value={country}
                    onChange={handleCountryChange}
                    className="w-full p-3 rounded-xl border-2 border-black bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-black appearance-none cursor-pointer print:shadow-none print:bg-white"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Japan">Japan</option>
                    <option value="China">China</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-black font-bold mb-2" htmlFor="lifeExpectancy">
                    Life Expectancy
                  </label>
                  <input 
                    id="lifeExpectancy"
                    type="number"
                    min="0"
                    value={lifeExpectancy}
                    onChange={handleLifeExpectancyChange}
                    className="w-full p-3 rounded-xl border-2 border-black bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-black print:shadow-none print:bg-white" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 print:gap-6 print:mb-8">
            <div className="relative transform transition-all hover:-translate-x-1 hover:-translate-y-1 group pdf-preserve-transform print:transform-none print:hover:transform-none print:transition-none">
              <div className="absolute inset-0 bg-black rounded-xl translate-x-2 translate-y-2 print:translate-x-1 print:translate-y-1 print:block"></div>
              <div className="relative bg-orange-400 border-2 border-black rounded-xl p-4">
                <div className="text-xl font-bold">Weeks Lived</div>
                <div className="text-3xl font-black">{weeksLived.toLocaleString()}</div>
              </div>
            </div>
            <div className="relative transform transition-all hover:-translate-x-1 hover:-translate-y-1 group pdf-preserve-transform print:transform-none print:hover:transform-none print:transition-none">
              <div className="absolute inset-0 bg-black rounded-xl translate-x-2 translate-y-2 print:translate-x-1 print:translate-y-1 print:block"></div>
              <div className="relative bg-white border-2 border-black rounded-xl p-4">
                <div className="text-xl font-bold">Weeks Spent Dreaming</div>
                <div className="text-3xl font-black">{sleepWeeks.toLocaleString()}</div>
              </div>
            </div>
            <div className="relative transform transition-all hover:-translate-x-1 hover:-translate-y-1 group pdf-preserve-transform print:transform-none print:hover:transform-none print:transition-none">
              <div className="absolute inset-0 bg-black rounded-xl translate-x-2 translate-y-2 print:translate-x-1 print:translate-y-1 print:block"></div>
              <div className="relative bg-[#CCFFCB] border-2 border-black rounded-xl p-4">
                <div className="text-xl font-bold">Future Awake Weeks</div>
                <div className="text-3xl font-black">{awakeWeeks.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Information Box */}
          <div className="relative mb-6 print:mb-8">
            <div className="relative bg-white rounded-xl px-6 py-4 border-2 border-black print:text-base">
              <p className="text-sm leading-relaxed">
                Each square represents one week of your life.
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-200 rounded-full overflow-hidden border-2 border-black mb-4 print:mb-6 h-4">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 pdf-preserve-transform" 
              style={{ width: `${percentageLived}%` }} 
            />
          </div>
          <div className="text-sm text-center mb-8 print:text-base print:mb-12">
            You've lived {percentageLived.toFixed(1)}% of your expected life span.
            Of your remaining time, you'll spend about {(sleepWeeks / 52).toFixed(1)} years sleeping
            and {(awakeWeeks / 52).toFixed(1)} years awake.
          </div>
        </div>

        {/* Second Page Content - Grid */}
        <div className="pdf-page break-before-page print:mt-0">
          <div className="bg-white rounded-xl border-2 border-black p-3 sm:p-6 shadow-lg print:shadow-none">
            <div className="w-full overflow-x-auto sm:overflow-visible">
              <div className="min-w-[calc(20*16px+19*2px)] w-fit sm:min-w-0 sm:w-full mx-auto relative px-2 sm:px-0">
                <div className="flex flex-wrap gap-[2px] sm:justify-start">
                  {Array.from({ length: weeksLived + sleepWeeks + awakeWeeks }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 border border-black rounded-sm relative transform transition-transform hover:scale-150 hover:z-20 group ${
                        i < weeksLived
                          ? 'bg-gradient-to-br from-orange-300 to-orange-400'
                          : 'bg-white'
                      } print:transform-none print:transition-none print:hover:transform-none`}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2
                        bg-black text-white text-[10px] sm:text-xs py-1 px-2 rounded-md whitespace-nowrap z-50 pointer-events-none print:hidden
                        shadow-lg">
                        Week {i + 1} ({Math.floor(i / 52) + 1} years)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attribution */}
        <div className="text-center text-sm text-gray-600 mt-8 print:mt-12">
          Inspired by Wait But Why, <a href="https://waitbutwhy.com/2014/05/life-weeks.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Life in Weeks</a>
        </div>
      </div>
    </div>
  );
} 