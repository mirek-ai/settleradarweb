'use client';

import { useEffect, useState } from 'react';
import { useHomeCountry } from '@/context/HomeCountryContext';
import { MapPin, X, ArrowRight } from 'lucide-react';
import db from '@/data/database.json';

export default function LocationBanner() {
  const { homeCountrySlug, setHomeCountrySlug, isReady } = useHomeCountry();
  const [detectedCountry, setDetectedCountry] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (homeCountrySlug) return; // Already set
    if (sessionStorage.getItem('location_banner_dismissed')) {
      setDismissed(true);
      return;
    }

    // Detect location using free IP API but silently fail if blocked by adblockers
    const detectLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.country_code_iso3) {
          const matched = db.countries.find((c: any) => c.iso_alpha3 === data.country_code_iso3);
          if (matched) {
            setDetectedCountry(matched);
          }
        }
      } catch (err) {
        // Silently swallow network errors (e.g. from Adblockers or Brave Browser) to avoid Next.js overlay
      }
    };
    
    detectLocation();
  }, [isReady, homeCountrySlug]);

  if (!isReady || homeCountrySlug || dismissed || !detectedCountry) return null;

  const handleSetHome = () => {
    setHomeCountrySlug(detectedCountry.slug);
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('location_banner_dismissed', 'true');
  };

  return (
    <div className="bg-gradient-to-r from-blue-600/90 to-emerald-600/90 backdrop-blur-md text-white px-4 py-3 shadow-lg border-b border-white/20 relative z-50 animate-fade-in">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full hidden sm:block">
            <MapPin className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium">
            It looks like you are in <span className="font-bold text-lg">{detectedCountry.name} {detectedCountry.flag_emoji}</span>. 
            Set it as your home base to unlock side-by-side comparisons!
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <button 
            onClick={handleSetHome}
            className="flex-1 sm:flex-none bg-white text-slate-900 hover:bg-slate-100 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            Set as Home <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={handleDismiss}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
