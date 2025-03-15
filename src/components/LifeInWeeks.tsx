import React, { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';

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

export default function LifeInWeeks({ 
  initialAge = DEFAULT_AGE,
  initialCountry = DEFAULT_COUNTRY,
  initialLifeExpectancy = COUNTRY_LIFE_EXPECTANCY[DEFAULT_COUNTRY]
}: LifeInWeeksProps) {
  const [age, setAge] = useState<number>(initialAge);
  const [country, setCountry] = useState<string>(initialCountry);
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(COUNTRY_LIFE_EXPECTANCY[DEFAULT_COUNTRY]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

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

  // Handle country change
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setCountry(newCountry);
    setLifeExpectancy(COUNTRY_LIFE_EXPECTANCY[newCountry]);
  };

  // Input handlers with validation
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Remove leading zeros and convert to number
    const cleanValue = rawValue.replace(/^0+/, '');
    const value = Number(cleanValue);
    
    if (value >= 0) {
      setAge(value);
      // Update input value to remove leading zeros
      e.target.value = cleanValue;
    }
  };

  const handleLifeExpectancyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= 0) {
      setLifeExpectancy(value);
    }
  };

  const handleDownloadPDF = async () => {
    const element = contentRef.current;
    if (!element) return;

    try {
      setIsGeneratingPDF(true);
      const opt = {
        margin: [20, 20],
        filename: 'life-in-weeks.pdf',
        image: { 
          type: 'jpeg', 
          quality: 1
        },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: true,
          letterRendering: true,
          removeContainer: true,
          backgroundColor: '#ffffff',
          windowWidth: 1920,
          onclone: (clonedDoc: Document) => {
            const elements = clonedDoc.getElementsByTagName('*');
            for (let i = 0; i < elements.length; i++) {
              const el = elements[i] as HTMLElement;
              
              // Remove all transitions and animations
              el.style.transition = 'none';
              el.style.animation = 'none';
              
              // Remove transforms except for specific cases
              if (!el.classList.contains('pdf-preserve-transform')) {
                el.style.transform = 'none';
              }
              
              // Remove hover effects
              el.style.pointerEvents = 'none';
              
              // Force background colors and gradients to be preserved
              const computed = window.getComputedStyle(el);
              const bg = computed.backgroundImage;
              const color = computed.backgroundColor;
              
              if (bg !== 'none' && bg.includes('gradient')) {
                el.style.backgroundImage = bg;
              }
              if (color !== 'rgba(0, 0, 0, 0)') {
                el.style.backgroundColor = color;
              }
              
              // Remove tooltips and other floating elements
              if (el.classList.contains('opacity-0') || el.classList.contains('group-hover:opacity-100')) {
                el.remove();
              }
            }
          }
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true,
          precision: 16,
          hotfixes: ['px_scaling']
        },
        pagebreak: { mode: 'avoid-all' }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 font-sans">
      <div ref={contentRef}>
        {/* First Page Content */}
        <div className="pdf-page print:mb-8">
          {/* Header */}
          <div className="relative mb-8 print:mb-12">
            <div className="absolute inset-0 bg-black rounded-xl translate-x-2 translate-y-2 print:translate-x-1 print:translate-y-1"></div>
            <div className="relative bg-[#FFDE59] rounded-xl border-2 border-black p-6 pdf-preserve-transform">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-4xl font-black print:text-5xl">Life in Weeks</h1>
                  <p className="text-sm mt-2 font-medium print:text-base">Visualize your life journey, one week at a time.</p>
                </div>
                <div className="no-print print:hidden">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="relative transform transition-all hover:-translate-x-1 hover:-translate-y-1 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-black rounded-xl translate-x-2 translate-y-2"></div>
                    <div className="relative bg-white border-2 border-black rounded-xl px-4 py-2 flex items-center gap-2">
                      {isGeneratingPDF ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="font-bold">Generating...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span className="font-bold">Download PDF</span>
                        </>
                      )}
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
                Each square represents one week of your life. Orange squares show weeks you've lived,
                and white squares represent your future weeks. Of these future weeks, you'll spend 33%
                dreaming and 67% awake.
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
          <div className="bg-white rounded-xl border-2 border-black p-6 shadow-lg print:shadow-none">
            <div className="grid grid-cols-52 gap-[2px] justify-center print:gap-[1px]">
              {Array.from({ length: weeksLived + sleepWeeks + awakeWeeks }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 border border-black rounded-sm relative transform transition-transform hover:scale-150 hover:z-10 group ${
                    i < weeksLived
                      ? 'bg-gradient-to-br from-orange-300 to-orange-400'
                      : 'bg-white'
                  } print:w-2.5 print:h-2.5 print:transform-none print:transition-none print:hover:transform-none`}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1
                    bg-black text-white text-xs py-1 px-2 rounded-md whitespace-nowrap z-20 pointer-events-none print:hidden">
                    Week {i + 1} ({Math.floor(i / 52) + 1} years)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 