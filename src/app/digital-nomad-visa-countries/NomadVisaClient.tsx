'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, Globe, ArrowUpDown, Shield, Wind, Landmark, CheckCircle, Smile } from 'lucide-react';
import { useState } from 'react';

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

type SortKey = 'name' | 'taxes' | 'freedom' | 'homicides' | 'air' | 'happiness';

interface NomadVisaClientProps {
  countries: any[];
  guideMap?: Record<string, string>;
}

export default function NomadVisaClient({ countries, guideMap = {} }: NomadVisaClientProps) {
  const [sortBy, setSortBy] = useState<SortKey>('freedom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder(key === 'name' || key === 'homicides' || key === 'air' || key === 'taxes' ? 'asc' : 'desc'); 
    }
  };

  const processedCountries = [...countries]
    .filter(country => 
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (country.region && country.region.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      const getVal = (c: any, key: string) => c.indicators?.[key]?.value;
      
      if (sortBy === 'taxes') {
        const valA = getVal(a, 'wb_taxes') ?? 999;
        const valB = getVal(b, 'wb_taxes') ?? 999;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      } 
      if (sortBy === 'homicides') {
        const valA = getVal(a, 'wb_homicides') ?? 999;
        const valB = getVal(b, 'wb_homicides') ?? 999;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      if (sortBy === 'air') {
        const valA = getVal(a, 'wb_air_quality') ?? 999;
        const valB = getVal(b, 'wb_air_quality') ?? 999;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      if (sortBy === 'freedom') {
        const valA = getVal(a, 'heritage_economic_freedom') ?? -1;
        const valB = getVal(b, 'heritage_economic_freedom') ?? -1;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      if (sortBy === 'happiness') {
        const valA = getVal(a, 'whr_happiness_index') ?? -1;
        const valB = getVal(b, 'whr_happiness_index') ?? -1;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });

  return (
    <div className="pb-20 space-y-12">
      {/* Hero Section */}
      <section className="text-center px-4 relative py-16">
        <div className="absolute inset-0 bg-emerald-500/10 blur-[120px] rounded-full w-1/2 h-1/2 top-1/4 left-1/4 -z-10 hidden md:block"></div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-glow">
          Digital Nomad <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Visas</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto mb-6 leading-relaxed">
          The ultimate database of {countries.length} countries offering legal remote work permits. Compare taxes, safety, and quality of life for your next destination.
        </p>
        
        <div className="max-w-2xl mx-auto relative group mb-12 mt-10">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-14 pr-4 py-5 glass-panel rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-xl shadow-2xl" 
            placeholder="Search for a country or region..."
          />
        </div>
      </section>

      {/* Interactive Data Table */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Globe className="text-emerald-400 w-7 h-7" />
            Nomad Visa Destinations
            <span className="text-sm font-normal text-slate-600 dark:text-slate-400 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full border border-black/10 dark:border-white/10 ml-2">
              {processedCountries.length} available
            </span>
          </h2>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-2xl">
          
          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-widest">
                  <th className="py-5 px-6">
                    <button onClick={() => handleSort('name')} className="flex items-center gap-2 hover:text-slate-900 dark:text-white">
                      Destination <ArrowUpDown className={`w-3 h-3 ${sortBy === 'name' ? 'text-emerald-400' : 'opacity-30'}`} />
                    </button>
                  </th>
                  <th className="py-5 px-6 hidden md:table-cell">
                    <button onClick={() => handleSort('freedom')} className="flex items-center gap-2 hover:text-slate-900 dark:text-white">
                      Econ. Freedom <ArrowUpDown className={`w-3 h-3 ${sortBy === 'freedom' ? 'text-emerald-400' : 'opacity-30'}`} />
                    </button>
                  </th>
                  <th className="py-5 px-6 hidden md:table-cell">
                    <button onClick={() => handleSort('happiness')} className="flex items-center gap-2 hover:text-slate-900 dark:text-white">
                      Happiness <ArrowUpDown className={`w-3 h-3 ${sortBy === 'happiness' ? 'text-pink-400' : 'opacity-30'}`} />
                    </button>
                  </th>
                  <th className="py-5 px-6">
                    <button onClick={() => handleSort('taxes')} className="flex items-center gap-2 hover:text-slate-900 dark:text-white">
                      Tax Burden <ArrowUpDown className={`w-3 h-3 ${sortBy === 'taxes' ? 'text-emerald-400' : 'opacity-30'}`} />
                    </button>
                  </th>
                  <th className="py-5 px-6 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      Nomad Visa
                    </div>
                  </th>
                  <th className="py-5 px-6 hidden lg:table-cell">
                    <button onClick={() => handleSort('homicides')} className="flex items-center gap-2 hover:text-slate-900 dark:text-white">
                      Homicides <ArrowUpDown className={`w-3 h-3 ${sortBy === 'homicides' ? 'text-emerald-400' : 'opacity-30'}`} />
                    </button>
                  </th>
                  <th className="py-5 px-6 hidden xl:table-cell">
                    <button onClick={() => handleSort('air')} className="flex items-center gap-2 hover:text-slate-900 dark:text-white">
                      Air (PM2.5) <ArrowUpDown className={`w-3 h-3 ${sortBy === 'air' ? 'text-emerald-400' : 'opacity-30'}`} />
                    </button>
                  </th>
                  <th className="py-5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {processedCountries.map((country) => {
                  const taxes = country.indicators?.['wb_taxes']?.value;
                  const freedom = country.indicators?.['heritage_economic_freedom']?.value;
                  const happiness = country.indicators?.['whr_happiness_index']?.value;
                  const homicides = country.indicators?.['wb_homicides']?.value;
                  const air = country.indicators?.['wb_air_quality']?.value;
                  
                  return (
                    <tr key={country.id} className="hover:bg-black/5 dark:bg-white/5 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          {country.iso_alpha2 ? (
                            <Image 
                              src={`/flags/moving-to-${country.slug}.png`} 
                              width={40}
                              height={28}
                              alt={`${country.name} flag`} 
                              className="w-10 h-auto rounded-sm border border-black/10 dark:border-white/10 shadow-sm" 
                            />
                          ) : (
                            <span className="text-3xl drop-shadow-md">{country.flag_emoji}</span>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                              {country.name}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                              <span className="truncate">{country.region}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 hidden md:table-cell">
                        {freedom ? (
                           <div className="flex flex-col gap-1.5">
                              <span className={`text-sm font-extrabold ${getFreedomColor(freedom)}`}>{freedom} pts</span>
                              <div className="w-20 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${freedom >= 70 ? 'bg-emerald-400' : freedom >= 60 ? 'bg-yellow-400' : freedom >= 50 ? 'bg-orange-400' : 'bg-red-400'}`}
                                  style={{ width: `${Math.min(freedom, 100)}%` }}
                                ></div>
                              </div>
                           </div>
                        ) : (
                          <span className="text-slate-600 text-sm font-mono">--</span>
                        )}
                      </td>
                      <td className="py-4 px-6 hidden md:table-cell">
                        {happiness ? (
                          <div className="flex items-center gap-2">
                            <Smile className={`w-4 h-4 ${happiness >= 7 ? 'text-emerald-400' : happiness >= 6 ? 'text-yellow-400' : 'text-red-400'}`} />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{happiness.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/10</span></span>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-sm font-mono">--</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {taxes != null ? (
                          <span className={`px-3 py-1 rounded-md text-sm font-bold border ${getTaxBadge(taxes)}`}>
                            {taxes.toFixed(1)} <span className="text-xs font-normal">%</span>
                          </span>
                        ) : (
                          <span className="text-slate-600 text-sm font-mono">--</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold whitespace-nowrap">
                        {country.nomad_visa ? (
                          guideMap[country.slug] ? (
                            <Link href={`/blog/${guideMap[country.slug]}`} className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                              <CheckCircle className="w-4 h-4" /> Yes (Read Guide)
                            </Link>
                          ) : (
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle className="w-4 h-4" /> Yes
                            </div>
                          )
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-600">
                            <span>--</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 hidden lg:table-cell">
                        {homicides ? (
                          <div className="flex items-center gap-2">
                            <Shield className={`w-4 h-4 ${homicides < 2 ? 'text-emerald-400' : homicides > 10 ? 'text-red-400' : 'text-yellow-400'}`} />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{homicides.toFixed(1)} <span className="text-xs text-slate-500 dark:text-slate-500">/100k</span></span>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-sm font-mono">--</span>
                        )}
                      </td>
                      <td className="py-4 px-6 hidden xl:table-cell">
                        {air ? (
                          <div className="flex items-center gap-2">
                            <Wind className={`w-4 h-4 ${air < 15 ? 'text-emerald-400' : air > 35 ? 'text-red-400' : 'text-yellow-400'}`} />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{air.toFixed(1)} <span className="text-xs text-slate-500 dark:text-slate-500">PM2.5</span></span>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-sm font-mono">--</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link 
                          href={`/country/${country.slug}`}
                          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-emerald-700 dark:text-white bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-600 dark:hover:bg-emerald-500 border border-emerald-200 dark:border-emerald-400/50 rounded-xl transition-all shadow-sm dark:shadow-[0_0_15px_rgba(16,185,129,0.3)] dark:hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                        >
                          Analyze
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden divide-y divide-black/10 dark:divide-white/10">
            {processedCountries.map((country) => {
              const taxes = country.indicators?.['wb_taxes']?.value;
              const freedom = country.indicators?.['heritage_economic_freedom']?.value;
              const happiness = country.indicators?.['whr_happiness_index']?.value;
              const homicides = country.indicators?.['wb_homicides']?.value;

              return (
                <div key={country.id} className="p-5 flex flex-col gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {country.iso_alpha2 ? (
                        <Image 
                          src={`/flags/moving-to-${country.slug}.png`} 
                          width={32}
                          height={22}
                          alt={`${country.name} flag`} 
                          className="w-8 h-auto rounded-sm border border-black/10 dark:border-white/10 shadow-sm" 
                        />
                      ) : (
                        <span className="text-2xl drop-shadow-md">{country.flag_emoji}</span>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                          {country.name}
                        </div>
                        <div className="text-xs text-slate-50 flex items-center gap-1 mt-0.5">
                          <span className="truncate">{country.region}</span>
                        </div>
                      </div>
                    </div>
                    {country.nomad_visa && (
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-500/10 px-2 py-1 rounded-md">
                        <CheckCircle className="w-3 h-3" /> Visa
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {/* Tax */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">Tax Burden</span>
                      {taxes != null ? (
                        <span className={`font-bold text-sm ${taxes < 15 ? 'text-emerald-600 dark:text-emerald-400' : taxes < 30 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                          {taxes.toFixed(1)}%
                        </span>
                      ) : <span className="text-slate-400 text-sm">--</span>}
                    </div>

                    {/* Freedom */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">Freedom</span>
                      {freedom ? (
                        <span className={`font-bold text-sm ${getFreedomColor(freedom)}`}>
                          {freedom} pts
                        </span>
                      ) : <span className="text-slate-400 text-sm">--</span>}
                    </div>

                    {/* Happiness */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">Happiness</span>
                      {happiness ? (
                        <div className="flex items-center gap-1">
                          <Smile className={`w-3.5 h-3.5 ${happiness >= 7 ? 'text-emerald-400' : happiness >= 6 ? 'text-yellow-400' : 'text-red-400'}`} />
                          <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{happiness.toFixed(1)}</span>
                        </div>
                      ) : <span className="text-slate-400 text-sm">--</span>}
                    </div>

                    {/* Homicides */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">Homicides</span>
                      {homicides ? (
                        <div className="flex items-center gap-1">
                          <Shield className={`w-3.5 h-3.5 ${homicides < 2 ? 'text-emerald-400' : homicides > 10 ? 'text-red-400' : 'text-yellow-400'}`} />
                          <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{homicides.toFixed(1)}</span>
                        </div>
                      ) : <span className="text-slate-400 text-sm">--</span>}
                    </div>
                  </div>

                  {country.nomad_visa?.url && !guideMap[country.slug] && (
                    <div className="pt-2">
                      <a 
                        href={country.nomad_visa.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                      >
                        Official Visa Info
                      </a>
                    </div>
                  )}
                  {guideMap[country.slug] && (
                    <div className="pt-2">
                      <Link 
                        href={`/blog/${guideMap[country.slug]}`}
                        className="w-full flex items-center justify-center px-4 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-800/40 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-all"
                      >
                        Read Visa Guide
                      </Link>
                    </div>
                  )}

                  <Link 
                    href={`/country/${country.slug}`}
                    className="w-full mt-2 flex items-center justify-center px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-500/20"
                  >
                    Analyze Destination
                  </Link>
                </div>
              );
            })}
          </div>
            
            {processedCountries.length === 0 && (
              <div className="text-center py-16 text-slate-600 dark:text-slate-400">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg">No nomad visa countries found matching your search.</p>
              </div>
            )}
          </div>
      </section>
    </div>
  );
}
