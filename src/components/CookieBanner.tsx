'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if the user has already made a choice
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'granted');
    setShowBanner(false);

    // Tell Google Consent Mode to upgrade to full tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'denied');
    setShowBanner(false);
    // It remains denied by default based on the head script
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom-8 duration-500">
      <div className="max-w-4xl mx-auto glass-panel bg-slate-900/95 dark:bg-slate-900/95 border border-white/10 shadow-2xl rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex-1 text-slate-300 text-sm">
          <h3 className="text-white font-bold text-lg mb-2">We value your privacy</h3>
          <p>
            We use cookieless tracking by default to protect your privacy. If you accept, we will use cookies (via Google Analytics) to help us analyze traffic and improve the site. 
            Read our <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link> and <Link href="/cookies" className="text-blue-400 hover:underline">Cookie Policy</Link> for details.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleDecline}
            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10 transition-colors"
          >
            Decline
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all"
          >
            Accept
          </button>
        </div>

      </div>
    </div>
  );
}
