'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, Globe, TrendingUp, ArrowUpDown, MapPin, Shield, Wind, Landmark, CheckCircle, Smile } from 'lucide-react';
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

type SortKey = 'name' | 'taxes' | 'inflation' | 'freedom' | 'homicides' | 'air' | 'happiness';
type ScenarioKey = 'all' | 'tax-haven' | 'safe-haven' | 'nomad' | 'nomad-visa' | 'joyful-nomads';

interface HomeClientProps {
  baseCountries: any[];
  totalValidCountries: number;
}

export default function HomeClient({ baseCountries, totalValidCountries }: HomeClientProps) {
  const [sortBy, setSortBy] = useState<SortKey>('freedom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('all');
  
  const [filters, setFilters] = useState({
    tax_max: 15,
    freedom_min: 60,
    homicides_max: 2,
    inflation_max: 5,
    air_max: 15,
    happiness_min: 6
  });

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder(key === 'name' || key === 'homicides' || key === 'inflation' || key === 'air' || key === 'taxes' ? 'asc' : 'desc'); 
    }
  };

  const processedCountries = [...baseCountries]
    .filter(country => 
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (country.id && country.id.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(country => {
      if (activeScenario === 'tax-haven') {
        const taxPercentage = country.indicators?.['wb_taxes']?.value ?? 100;
        const freedom = country.indicators?.['heritage_economic_freedom']?.value ?? 0;
        return taxPercentage <= filters.tax_max && freedom >= filters.freedom_min;
      }
      if (activeScenario === 'safe-haven') {
        const homicides = country.indicators?.['wb_homicides']?.value ?? 100;
        const inflation = country.indicators?.['wb_inflation']?.value ?? 100;
        return homicides <= filters.homicides_max && inflation <= filters.inflation_max;
      }
      if (activeScenario === 'nomad') {
        const air = country.indicators?.['wb_air_quality']?.value ?? 100;
        const freedom = country.indicators?.['heritage_economic_freedom']?.value ?? 0;
        return air <= filters.air_max && freedom >= filters.freedom_min;
      }
      if (activeScenario === 'nomad-visa') {
        return !!country.nomad_visa;
      }
      if (activeScenario === 'joyful-nomads') {
        const happiness = country.indicators?.['whr_happiness_index']?.value ?? 0;
        return happiness >= filters.happiness_min;
      }
      return true;
    })
    .sort((a, b) => {
      const getVal = (c: any, key: string) => c.indicators?.[key]?.value;
      
      if (sortBy === 'taxes') {
        const valA = getVal(a, 'wb_taxes') ?? 999;
        const valB = getVal(b, 'wb_taxes') ?? 999;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      } 
      if (sortBy === 'inflation') {
        const valA = getVal(a, 'wb_inflation') ?? 999;
        const valB = getVal(b, 'wb_inflation') ?? 999;
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
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="text-center py-16 px-4 relative">
        <div className="absolute inset-0 bg-blue-500/10 blur-[120px] rounded-full w-1/2 h-1/2 top-1/4 left-1/4 -z-10 hidden md:block"></div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-glow">
          Build your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">life anew.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto mb-6 leading-relaxed">
          The ultimate terminal for expats, digital nomads, and investors. Compare taxes, safety, and economic freedom across {totalValidCountries} destinations globally.
        </p>
        <p className="text-sm md:text-base font-medium text-slate-500 dark:text-slate-400 max-w-3xl mx-auto mb-10 flex flex-wrap justify-center items-center gap-2">
          <span>Powered by verified open data from:</span>
          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300">World Bank</span>
          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300">WHO</span>
          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300">Heritage Foundation</span>
          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300">UNODC</span>
        </p>
        
        <div className="max-w-2xl mx-auto relative group mb-12">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-14 pr-4 py-5 glass-panel rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xl shadow-2xl" 
            placeholder="Search for a country (e.g., Switzerland, Poland)..."
          />
        </div>

        {/* Quick Scenarios */}
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          <button 
            onClick={() => { setActiveScenario('all'); setSortBy('freedom'); setSortOrder('desc'); }}
            className={`px-6 py-3 rounded-xl border transition-all ${activeScenario === 'all' ? 'bg-black/20 dark:bg-white/20 border-black/20 dark:border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'glass-card hover:bg-black/10 dark:bg-white/10'}`}
          >
            <Globe className="w-5 h-5 inline-block mr-2 text-slate-700 dark:text-slate-300" /> All Destinations
          </button>
          <button 
            onClick={() => { setActiveScenario('tax-haven'); setSortBy('taxes'); setSortOrder('asc'); }}
            className={`px-6 py-3 rounded-xl border transition-all ${activeScenario === 'tax-haven' ? 'bg-emerald-500/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'glass-card hover:bg-emerald-500/10'}`}
          >
            <Landmark className="w-5 h-5 inline-block mr-2 text-emerald-400" /> Tax Havens
          </button>
          <button 
            onClick={() => { setActiveScenario('safe-haven'); setSortBy('homicides'); setSortOrder('asc'); }}
            className={`px-6 py-3 rounded-xl border transition-all ${activeScenario === 'safe-haven' ? 'bg-blue-500/20 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'glass-card hover:bg-blue-600 dark:hover:bg-blue-500/10'}`}
          >
            <Shield className="w-5 h-5 inline-block mr-2 text-blue-400" /> Safe Havens
          </button>
          <button 
            onClick={() => { setActiveScenario('nomad'); setSortBy('air'); setSortOrder('asc'); }}
            className={`px-6 py-3 rounded-xl border transition-all ${activeScenario === 'nomad' ? 'bg-purple-500/20 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'glass-card hover:bg-purple-500/10'}`}
          >
            <Wind className="w-5 h-5 inline-block mr-2 text-purple-400" /> Quality Nomads
          </button>
          <button 
            onClick={() => { setActiveScenario('nomad-visa'); setSortBy('name'); setSortOrder('asc'); }}
            className={`px-6 py-3 rounded-xl border transition-all ${activeScenario === 'nomad-visa' ? 'bg-orange-500/20 border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'glass-card hover:bg-orange-500/10'}`}
          >
            <CheckCircle className="w-5 h-5 inline-block mr-2 text-orange-400" /> Nomad Visa
          </button>
          <button 
            onClick={() => { setActiveScenario('joyful-nomads'); setSortBy('happiness'); setSortOrder('desc'); }}
            className={`px-6 py-3 rounded-xl border transition-all ${activeScenario === 'joyful-nomads' ? 'bg-pink-500/20 border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.2)]' : 'glass-card hover:bg-pink-500/10'}`}
          >
            <Smile className="w-5 h-5 inline-block mr-2 text-pink-400" /> Joyful Nomads
          </button>
        </div>

        {/* Scenario Explanation */}
        {activeScenario !== 'all' && (
          <div className="mt-8 p-5 md:p-6 glass-panel rounded-2xl border border-blue-500/20 bg-blue-500/5 text-sm md:text-base text-slate-700 dark:text-slate-300 max-w-3xl mx-auto animate-in fade-in slide-in-from-top-4 duration-300 shadow-lg">
            
            {activeScenario === 'tax-haven' && (
              <div className="space-y-4">
                <p><strong>🏛️ Tax Havens:</strong> We filter countries where the Total Tax Burden is <strong>below {filters.tax_max}%</strong> (World Bank data) while maintaining a decent Economic Freedom score of <strong>over {filters.freedom_min} points</strong> (Heritage Foundation). This ensures you avoid "havens" with highly unstable economies.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-black/10 dark:border-white/10">
                  <div>
                    <label className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                      <span>Max Tax Burden</span>
                      <span className="text-blue-500">{filters.tax_max}%</span>
                    </label>
                    <input type="range" min="0" max="50" step="1" value={filters.tax_max} onChange={(e) => setFilters({...filters, tax_max: Number(e.target.value)})} className="w-full accent-blue-500 cursor-pointer" />
                  </div>
                  <div>
                    <label className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                      <span>Min Economic Freedom</span>
                      <span className="text-emerald-500">{filters.freedom_min} pts</span>
                    </label>
                    <input type="range" min="0" max="100" step="1" value={filters.freedom_min} onChange={(e) => setFilters({...filters, freedom_min: Number(e.target.value)})} className="w-full accent-emerald-500 cursor-pointer" />
                  </div>
                </div>
              </div>
            )}
            
            {activeScenario === 'safe-haven' && (
              <div className="space-y-4">
                <p><strong>🛡️ Safe Havens:</strong> We look for maximum stability. This filter highlights countries with extremely low crime (<strong>under {filters.homicides_max} homicides per 100k people</strong>) combined with strong economic stability (<strong>inflation under {filters.inflation_max}%</strong>).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-black/10 dark:border-white/10">
                  <div>
                    <label className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                      <span>Max Homicides (per 100k)</span>
                      <span className="text-blue-500">{filters.homicides_max}</span>
                    </label>
                    <input type="range" min="0" max="20" step="0.5" value={filters.homicides_max} onChange={(e) => setFilters({...filters, homicides_max: Number(e.target.value)})} className="w-full accent-blue-500 cursor-pointer" />
                  </div>
                  <div>
                    <label className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                      <span>Max Inflation Rate</span>
                      <span className="text-emerald-500">{filters.inflation_max}%</span>
                    </label>
                    <input type="range" min="-5" max="30" step="0.5" value={filters.inflation_max} onChange={(e) => setFilters({...filters, inflation_max: Number(e.target.value)})} className="w-full accent-emerald-500 cursor-pointer" />
                  </div>
                </div>
              </div>
            )}

            {activeScenario === 'nomad' && (
              <div className="space-y-4">
                <p><strong>💨 Quality Nomads:</strong> Perfect for breathing easy and doing business. We filter for excellent air quality (<strong>PM2.5 under {filters.air_max}</strong>) and high Economic Freedom (<strong>over {filters.freedom_min} points</strong>).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-black/10 dark:border-white/10">
                  <div>
                    <label className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                      <span>Max PM2.5 Air Pollution</span>
                      <span className="text-blue-500">{filters.air_max}</span>
                    </label>
                    <input type="range" min="0" max="50" step="1" value={filters.air_max} onChange={(e) => setFilters({...filters, air_max: Number(e.target.value)})} className="w-full accent-blue-500 cursor-pointer" />
                  </div>
                  <div>
                    <label className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                      <span>Min Economic Freedom</span>
                      <span className="text-emerald-500">{filters.freedom_min} pts</span>
                    </label>
                    <input type="range" min="0" max="100" step="1" value={filters.freedom_min} onChange={(e) => setFilters({...filters, freedom_min: Number(e.target.value)})} className="w-full accent-emerald-500 cursor-pointer" />
                  </div>
                </div>
              </div>
            )}

            {activeScenario === 'nomad-visa' && <p><strong>✅ Nomad Visa:</strong> This filter simply highlights countries that officially offer a Digital Nomad Visa or an equivalent legal permit allowing for remote work.</p>}
            
            {activeScenario === 'joyful-nomads' && (
              <div className="space-y-4">
                <p><strong>🙂 Joyful Nomads:</strong> Based on the World Happiness Report. We only show countries where citizens rate their happiness level at a minimum of <strong>{filters.happiness_min} out of 10</strong>, ensuring a positive environment.</p>
                <div className="pt-4 border-t border-black/10 dark:border-white/10">
                  <label className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                    <span>Min Happiness Score</span>
                    <span className="text-pink-500">{filters.happiness_min} / 10</span>
                  </label>
                  <input type="range" min="0" max="10" step="0.1" value={filters.happiness_min} onChange={(e) => setFilters({...filters, happiness_min: Number(e.target.value)})} className="w-full accent-pink-500 cursor-pointer" />
                </div>
              </div>
            )}
            
          </div>
        )}
      </section>

      {/* Interactive Data Table */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <TrendingUp className="text-blue-400 w-7 h-7" />
            Global Intel Terminal
            <span className="text-sm font-normal text-slate-600 dark:text-slate-400 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full border border-black/10 dark:border-white/10 ml-2">
              {processedCountries.length} results
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
                      Destination <ArrowUpDown className={`w-3 h-3 ${sortBy === 'name' ? 'text-blue-400' : 'opacity-30'}`} />
                    </button>
                  </th>
                  <th className="py-5 px-6 hidden md:table-cell">
                    <button onClick={() => handleSort('freedom')} className="flex items-center gap-2 hover:text-slate-900 dark:text-white">
                      Econ. Freedom <ArrowUpDown className={`w-3 h-3 ${sortBy === 'freedom' ? 'text-blue-400' : 'opacity-30'}`} />
                    </button>
                  </th>
                  <th className="py-5 px-6 hidden md:table-cell">
                    <button onClick={() => handleSort('happiness')} className="flex items-center gap-2 hover:text-slate-900 dark:text-white">
                      Happiness <ArrowUpDown className={`w-3 h-3 ${sortBy === 'happiness' ? 'text-pink-400' : 'opacity-30'}`} />
                    </button>
                  </th>
                  <th className="py-5 px-6">
                    <button onClick={() => handleSort('taxes')} className="flex items-center gap-2 hover:text-slate-900 dark:text-white">
                      Tax Burden <ArrowUpDown className={`w-3 h-3 ${sortBy === 'taxes' ? 'text-blue-400' : 'opacity-30'}`} />
                    </button>
                  </th>
                  <th className="py-5 px-6 hidden sm:table-cell">
                    <button onClick={() => handleSort('name')} className="flex items-center gap-2 hover:text-slate-900 dark:text-white">
                      Nomad Visa <ArrowUpDown className={`w-3 h-3 opacity-30`} />
                    </button>
                  </th>
                  <th className="py-5 px-6 hidden lg:table-cell">
                    <button onClick={() => handleSort('homicides')} className="flex items-center gap-2 hover:text-slate-900 dark:text-white">
                      Homicides <ArrowUpDown className={`w-3 h-3 ${sortBy === 'homicides' ? 'text-blue-400' : 'opacity-30'}`} />
                    </button>
                  </th>
                  <th className="py-5 px-6 hidden xl:table-cell">
                    <button onClick={() => handleSort('air')} className="flex items-center gap-2 hover:text-slate-900 dark:text-white">
                      Air (PM2.5) <ArrowUpDown className={`w-3 h-3 ${sortBy === 'air' ? 'text-blue-400' : 'opacity-30'}`} />
                    </button>
                  </th>
                  <th className="py-5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {processedCountries.map((country) => {
                  const taxes = country.indicators?.['wb_taxes']?.value;
                  const inflation = country.indicators?.['wb_inflation']?.value;
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
                              src={`/flags/${country.iso_alpha2}.png`} 
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
                              <span className="font-mono bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded">{country.id}</span>
                              <span className="text-slate-900 dark:text-white/20">•</span>
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
                      <td className="py-4 px-6 hidden sm:table-cell">
                        {country.nomad_visa ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle className="w-4 h-4" /> Yes
                          </div>
                        ) : (
                          <span className="text-slate-600 text-sm font-mono">--</span>
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
                          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-blue-700 dark:text-white bg-blue-50 hover:bg-blue-100 dark:bg-blue-600 dark:hover:bg-blue-500 border border-blue-200 dark:border-blue-400/50 rounded-xl transition-all shadow-sm dark:shadow-[0_0_15px_rgba(59,130,246,0.3)] dark:hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
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
              const inflation = country.indicators?.['wb_inflation']?.value;
              const freedom = country.indicators?.['heritage_economic_freedom']?.value;
              const happiness = country.indicators?.['whr_happiness_index']?.value;
              const homicides = country.indicators?.['wb_homicides']?.value;
              const air = country.indicators?.['wb_air_quality']?.value;

              return (
                <div key={country.id} className="p-5 flex flex-col gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {country.iso_alpha2 ? (
                        <Image 
                          src={`/flags/${country.iso_alpha2}.png`} 
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
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <span className="font-mono bg-black/5 dark:bg-white/5 px-1 rounded">{country.id}</span>
                          <span>•</span>
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

                  <Link 
                    href={`/country/${country.slug}`}
                    className="w-full mt-2 flex items-center justify-center px-4 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-500/20"
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
                <p className="text-lg">No countries found matching your criteria.</p>
              </div>
            )}
          </div>
      </section>
    </div>
  );
}
