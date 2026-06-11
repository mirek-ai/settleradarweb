import Link from 'next/link';
import Image from 'next/image';
import { Home, Compass, Shield, Smile, Landmark, Wind } from 'lucide-react';
import fs from 'fs';
import path from 'path';

// Helper for Freedom color
const getFreedomColor = (score: number) => {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 50) return 'text-orange-400';
  return 'text-red-400';
};

// Helper for Badges
const getTaxBadge = (tax: number) => {
  if (tax < 15) return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30';
  if (tax < 30) return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-500/30';
  return 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border-red-300 dark:border-red-500/30';
};

export default function NotFound() {
  const dbPath = path.join(process.cwd(), 'src', 'data', 'database.json');
  let recommendedCountries = [];
  
  try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    // Niestandardowa selekcja ratunkowa: Monako, ZEA, Kajmany... i Polska!
    const targetNames = ['Monaco', 'United Arab Emirates', 'Cayman Islands', 'Poland'];
    
    recommendedCountries = db.countries
      .filter((c: any) => targetNames.includes(c.name))
      // Sort in the exact order requested
      .sort((a: any, b: any) => targetNames.indexOf(a.name) - targetNames.indexOf(b.name));
      
  } catch (error) {
    console.error('Error loading database for 404 page:', error);
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center pt-24 pb-16 px-4 relative overflow-hidden">
      
      {/* Radar Animation / Cinematic Background Effect */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none -z-10">
        <div className="w-[800px] h-[800px] border border-blue-500 rounded-full animate-[spin_10s_linear_infinite] flex items-center justify-center">
          <div className="w-[600px] h-[600px] border border-blue-500/50 rounded-full flex items-center justify-center">
            <div className="w-[400px] h-[400px] border border-blue-500/30 rounded-full flex items-center justify-center">
               <div className="w-[200px] h-[200px] border border-blue-500/10 rounded-full"></div>
            </div>
          </div>
          {/* Radar sweeping line */}
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[2px] bg-gradient-to-r from-transparent to-blue-500 origin-left -translate-y-1/2"></div>
        </div>
      </div>

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full -z-10"></div>

      {/* Main 404 Content */}
      <div className="text-center max-w-2xl mx-auto mb-16 animate-in slide-in-from-bottom-8 duration-700">
        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-800 to-slate-400 dark:from-white dark:to-slate-600 drop-shadow-sm mb-4 tracking-tighter relative">
          404
          <Compass className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-blue-500/30 animate-pulse" />
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-6">You've gone off the radar.</h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
          The destination you are looking for does not exist or has been relocated. Don't worry, the world is vast and full of incredible opportunities.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1"
        >
          <Home className="w-5 h-5" /> Back to Global Terminal
        </Link>
      </div>

      {/* Recommendation Section (GEO/SEO Value) */}
      {recommendedCountries.length > 0 && (
        <div className="w-full max-w-6xl mx-auto animate-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-black/10 dark:bg-white/10 flex-1"></div>
            <h3 className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-widest text-center px-4">
              Explore Top Havens Instead
            </h3>
            <div className="h-px bg-black/10 dark:bg-white/10 flex-1"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedCountries.map((country: any) => {
              const taxes = country.indicators?.['wb_taxes']?.value;
              const freedom = country.indicators?.['heritage_economic_freedom']?.value;
              const happiness = country.indicators?.['whr_happiness_index']?.value;

              return (
                <Link 
                  key={country.id}
                  href={`/country/${country.slug}`}
                  className="glass-panel p-6 rounded-2xl flex flex-col group hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-blue-500/30 dark:hover:border-blue-400/30 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md"
                >
                  <div className="flex items-center gap-4 mb-5">
                    {country.iso_alpha2 ? (
                      <Image 
                        src={`/flags/moving-to-${country.slug}.png`} 
                        width={48}
                        height={34}
                        alt={`${country.name} flag`} 
                        className="w-12 h-auto rounded-md shadow-md border border-black/10 dark:border-white/10 group-hover:scale-105 transition-transform" 
                      />
                    ) : (
                      <span className="text-4xl drop-shadow-md group-hover:scale-110 transition-transform">{country.flag_emoji}</span>
                    )}
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-lg leading-tight group-hover:text-blue-500 transition-colors">
                        {country.name}
                      </h4>
                      <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                        <span className="bg-black/5 dark:bg-white/10 px-1.5 rounded">{country.id}</span>
                        {country.region && <span className="truncate max-w-[100px]">{country.region}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    {/* Tax Indicator */}
                    <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col items-center text-center justify-center shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                        <Landmark className="w-3 h-3" /> Tax Burden
                      </span>
                      {taxes != null ? (
                        <span className={`font-black text-sm px-2 py-0.5 rounded-md ${getTaxBadge(taxes)}`}>
                          {taxes.toFixed(1)}%
                        </span>
                      ) : <span className="text-slate-400 font-mono text-sm">--</span>}
                    </div>

                    {/* Freedom Indicator */}
                    <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col items-center text-center justify-center shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Freedom
                      </span>
                      {freedom ? (
                        <span className={`font-black text-sm ${getFreedomColor(freedom)}`}>
                          {freedom} pts
                        </span>
                      ) : <span className="text-slate-400 font-mono text-sm">--</span>}
                    </div>
                  </div>
                  
                  {/* Subtle Call to action */}
                  <div className="mt-5 text-center text-xs font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore Profile &rarr;
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
