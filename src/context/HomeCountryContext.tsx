'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type HomeCountryContextType = {
  homeCountrySlug: string | null;
  setHomeCountrySlug: (slug: string | null) => void;
  isReady: boolean;
};

const HomeCountryContext = createContext<HomeCountryContextType>({
  homeCountrySlug: null,
  setHomeCountrySlug: () => {},
  isReady: false,
});

export const HomeCountryProvider = ({ children }: { children: React.ReactNode }) => {
  const [homeCountrySlug, setHomeCountrySlugState] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('home_country');
    if (saved) {
      setHomeCountrySlugState(saved);
    }
    setIsReady(true);
  }, []);

  const setHomeCountrySlug = (slug: string | null) => {
    setHomeCountrySlugState(slug);
    if (slug) {
      localStorage.setItem('home_country', slug);
    } else {
      localStorage.removeItem('home_country');
    }
  };

  return (
    <HomeCountryContext.Provider value={{ homeCountrySlug, setHomeCountrySlug, isReady }}>
      {children}
    </HomeCountryContext.Provider>
  );
};

export const useHomeCountry = () => useContext(HomeCountryContext);
