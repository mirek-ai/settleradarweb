'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Swords, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type CountryOption = {
  name: string;
  slug: string;
  emoji: string;
};

export default function CompareClient({ countries }: { countries: CountryOption[] }) {
  const router = useRouter();
  const [countryA, setCountryA] = useState<string>('poland');
  const [countryB, setCountryB] = useState<string>('czechia');

  const handleCompare = () => {
    if (countryA && countryB && countryA !== countryB) {
      router.push(`/compare/${countryA}/${countryB}`);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors backdrop-blur-md">
          <ArrowLeft className="w-4 h-4" /> Back to Global Terminal
        </Link>
      </div>

      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 mb-6">
          <Swords className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
          Head-to-Head <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Matchup</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto text-lg">
          Select two countries to view a deep-dive radar comparison of their economy, demographics, safety, and lifestyle.
        </p>
      </div>

      <div className="glass-panel p-8 md:p-12 rounded-3xl w-full max-w-4xl border border-white/20 dark:border-white/10 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 relative z-10">
          
          {/* Country A */}
          <div className="w-full flex-1">
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Corner A</label>
            <div className="relative">
              <select 
                value={countryA}
                onChange={(e) => setCountryA(e.target.value)}
                className="w-full appearance-none bg-transparent backdrop-blur-md border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-5 text-xl font-bold focus:outline-none focus:border-blue-500 transition-colors cursor-pointer text-slate-900 dark:text-white"
              >
                <option value="" disabled className="text-slate-500">Select first country...</option>
                {countries.map(c => (
                  <option key={c.slug} value={c.slug} className="bg-white dark:bg-slate-900">{c.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-6 flex items-center text-slate-400">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 text-slate-300 dark:text-slate-600 font-black text-2xl italic">
            VS
          </div>

          {/* Country B */}
          <div className="w-full flex-1">
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Corner B</label>
            <div className="relative">
              <select 
                value={countryB}
                onChange={(e) => setCountryB(e.target.value)}
                className="w-full appearance-none bg-transparent backdrop-blur-md border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-5 text-xl font-bold focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer text-slate-900 dark:text-white"
              >
                <option value="" disabled className="text-slate-500">Select second country...</option>
                {countries.map(c => (
                  <option key={c.slug} value={c.slug} className="bg-white dark:bg-slate-900">{c.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-6 flex items-center text-slate-400">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-12 flex justify-center relative z-10">
          <button
            onClick={handleCompare}
            disabled={!countryA || !countryB || countryA === countryB}
            className="group inline-flex items-center justify-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-full font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300"
          >
            Launch Comparison
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        {countryA && countryB && countryA === countryB && (
          <p className="text-center text-rose-500 font-bold mt-4 animate-fade-in">
            Please select two different countries!
          </p>
        )}
      </div>
    </div>
  );
}
