import db from '@/data/database.json';
import Link from 'next/link';
import Image from 'next/image';
import { Plane, MapPin, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';

const getTaxBadge = (tax: number) => {
  if (tax < 15) return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30';
  if (tax < 30) return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-500/30';
  return 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border-red-300 dark:border-red-500/30';
};

export const metadata = {
  title: 'Digital Nomad Visas 2026: The Complete Country List | SettleRadar',
  description: 'A comprehensive list of countries offering Digital Nomad Visas or remote work permits in 2026. Compare tax rates, cost of living, and visa requirements.',
};

export default function DigitalNomadVisasHub() {
  const nomadCountries = db.countries
    .filter(c => c.nomad_visa?.available)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      <div className="bg-gradient-to-b from-blue-600 to-blue-800 dark:from-blue-900 dark:to-slate-900 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-blue-100 font-semibold mb-6 backdrop-blur-md border border-white/20">
            <Plane className="w-5 h-5" /> 2026 Updated Guide
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
            Countries with Digital Nomad Visas
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto drop-shadow">
            Explore {nomadCountries.length} countries offering remote work visas and permits. Compare their tax burdens, safety, and liveability.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nomadCountries.map((country) => {
            const taxes = country.indicators?.['wb_taxes']?.value;
            const happiness = country.indicators?.['whr_happiness_index']?.value;
            
            return (
              <div key={country.id} className="glass-panel p-6 rounded-3xl hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group flex flex-col border border-black/5 dark:border-white/10 bg-white dark:bg-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                  <MapPin className="w-32 h-32 text-blue-600 dark:text-blue-400 -mr-10 -mt-10" />
                </div>
                
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  {country.iso_alpha2 ? (
                    <img 
                      src={`https://flagcdn.com/w80/${country.iso_alpha2}.png`} 
                      alt={`${country.name} flag`} 
                      width={48}
                      className="w-12 h-auto rounded shadow-sm border border-black/10 dark:border-white/10" 
                    />
                  ) : (
                    <span className="text-4xl">{country.flag_emoji}</span>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {country.name}
                    </h2>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{country.region}</span>
                  </div>
                </div>

                <div className="flex-grow relative z-10">
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4">
                    {country.nomad_visa?.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {taxes != null && (
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${getTaxBadge(taxes)}`}>
                        Tax: {taxes.toFixed(1)}%
                      </span>
                    )}
                    {happiness && (
                      <span className="px-2 py-1 rounded text-xs font-bold border bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600">
                        Happiness: {happiness.toFixed(1)}/10
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between relative z-10">
                  <Link 
                    href={`/country/${country.slug}`}
                    className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                  >
                    Analyze Country <ArrowRight className="w-4 h-4" />
                  </Link>
                  
                  {country.nomad_visa?.url && (
                    <a 
                      href={country.nomad_visa.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                      title="Official Visa Info"
                    >
                      <ExternalLink className="w-3 h-3" /> Info
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
