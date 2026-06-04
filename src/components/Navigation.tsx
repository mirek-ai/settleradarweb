'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6 text-sm font-medium">
        <Link href="/" className="hover:opacity-70 transition-opacity">Discover</Link>
        <Link href="/compare" className="hover:opacity-70 transition-opacity">Compare</Link>
        <Link href="/blog" className="hover:opacity-70 transition-opacity">Blog</Link>
        <ThemeToggle />
      </div>

      {/* Mobile Menu Toggle & Theme */}
      <div className="flex items-center gap-3 md:hidden">
        <ThemeToggle />
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -mr-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          ) : (
            <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 glass-panel border-b border-glass-border p-4 flex flex-col gap-4 shadow-xl md:hidden animate-in slide-in-from-top-2 fade-in duration-200 z-50">
          <Link href="/" className="p-3 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Discover</Link>
          <Link href="/compare" className="p-3 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Compare</Link>
          <Link href="/blog" className="p-3 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Blog</Link>
        </div>
      )}
    </>
  );
}
