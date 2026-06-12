import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, ArrowRight, MapPin, Building, Shield, Wind, TrendingUp, Landmark, Sparkles, 
  Activity, Users, HeartPulse, GraduationCap, Briefcase, Scale, Sun, Droplets, ThermometerSun, CloudSnow, CheckCircle, Smile, MessageCircle, Gavel, Calendar, Globe, BookOpen, Swords, Info
} from 'lucide-react';
import { getSortedPostsData } from '@/lib/posts';
import { formatDate } from '@/lib/utils';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const formatNumber = (num: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(num);

export async function generateStaticParams() {
  const dbPath = path.join(process.cwd(), 'src', 'data', 'database.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  
  return db.countries
    .filter((c: any) => Object.keys(c.indicators || {}).length > 5)
    .map((country: any) => ({
      slug: country.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const dbPath = path.join(process.cwd(), 'src', 'data', 'database.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const country = db.countries
    .filter((c: any) => Object.keys(c.indicators || {}).length > 5)
    .find((c: any) => c.slug === resolvedParams.slug);

  if (!country) {
    return { title: 'Country Not Found | SettleRadar' };
  }

  const title = `Relocate to ${country.name} | Visas, Taxes & Climate | SettleRadar`;
  const description = `Thinking of moving to ${country.name}? Explore detailed data on the cost of living, taxes, climate, politics and expat demographics.`;
  const canonicalUrl = `https://settleradar.com/country/${country.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: country.slug ? [`https://settleradar.com/flags/moving-to-${country.slug}.png`] : [],
    }
  };
}

export default async function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const dbPath = path.join(process.cwd(), 'src', 'data', 'database.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  const resolvedParams = await params;
  const country = db.countries
    .filter((c: any) => Object.keys(c.indicators || {}).length > 5)
    .find((c: any) => c.slug === resolvedParams.slug);
  
  const allPosts = getSortedPostsData();
  const relatedPosts = allPosts.filter(p => p.country && p.country.toLowerCase().replace(/\s+/g, '-') === resolvedParams.slug.toLowerCase());

  if (!country) {
    notFound();
  }

  const ind = country.indicators || {};
  
  const bestLife = db.countries.reduce((best: any, c: any) => {
    const v = c.indicators?.['who_life_expectancy']?.value;
    if (v != null && (!best || v > best.v)) return { v, name: c.name, slug: c.slug };
    return best;
  }, null);

  const bestDoctors = db.countries.reduce((best: any, c: any) => {
    const v = c.indicators?.['who_medical_doctors']?.value;
    if (v != null && (!best || v > best.v)) return { v, name: c.name, slug: c.slug };
    return best;
  }, null);

  const bestObesity = db.countries.reduce((best: any, c: any) => {
    const v = c.indicators?.['who_obesity']?.value;
    if (v != null && (!best || v < best.v)) return { v, name: c.name, slug: c.slug };
    return best;
  }, null);

  const bestOOP = db.countries.reduce((best: any, c: any) => {
    const v = c.indicators?.['who_out_of_pocket_expenditure']?.value;
    if (v != null && (!best || v < best.v)) return { v, name: c.name, slug: c.slug };
    return best;
  }, null);

  const bestGDP = db.countries.reduce((best: any, c: any) => {
    const v = c.indicators?.['wb_gdp_pc_ppp']?.value;
    if (v != null && (!best || v > best.v)) return { v, name: c.name, slug: c.slug };
    return best;
  }, null);

  const bestUnemployment = db.countries.reduce((best: any, c: any) => {
    const v = c.indicators?.['ilo_unemployment']?.value || c.indicators?.['wb_unemployment']?.value;
    if (v != null && (!best || v < best.v)) return { v, name: c.name, slug: c.slug };
    return best;
  }, null);

  const bestHomicides = db.countries.reduce((best: any, c: any) => {
    const v = c.indicators?.['wb_homicides']?.value;
    if (v != null && (!best || v < best.v)) return { v, name: c.name, slug: c.slug };
    return best;
  }, null);

  const bestHappiness = db.countries.reduce((best: any, c: any) => {
    const v = c.indicators?.['whr_happiness_index']?.value;
    if (v != null && (!best || v > best.v)) return { v, name: c.name, slug: c.slug };
    return best;
  }, null);

  const bestInflation = db.countries.reduce((best: any, c: any) => {
    const v = c.indicators?.['wb_inflation']?.value;
    if (v != null) {
      const distance = Math.abs(v - 2.0);
      if (!best || distance < best.distance) {
        return { v, name: c.name, slug: c.slug, distance };
      }
    }
    return best;
  }, null);

  const bestAir = db.countries.reduce((best: any, c: any) => {
    const v = c.indicators?.['wb_air_quality']?.value;
    if (v != null && (!best || v < best.v)) return { v, name: c.name, slug: c.slug };
    return best;
  }, null);

  const bestEducation = db.countries.reduce((best: any, c: any) => {
    const v = c.indicators?.['unesco_education_spending']?.value;
    if (v != null && (!best || v > best.v)) return { v, name: c.name, slug: c.slug };
    return best;
  }, null);

  const bestInternet = db.countries.reduce((best: any, c: any) => {
    const v = c.indicators?.['wb_internet_users_pct']?.value;
    if (v != null && (!best || v > best.v)) return { v, name: c.name, slug: c.slug };
    return best;
  }, null);

  const bestEnglish = db.countries.reduce((best: any, c: any) => {
    const v = c.indicators?.['ef_epi_english']?.value;
    if (v != null && (!best || v > best.v)) return { v, name: c.name, slug: c.slug };
    return best;
  }, null);

  const bestGini = db.countries.reduce((best: any, c: any) => {
    const v = c.indicators?.['wb_gini']?.value;
    if (v != null && (!best || v < best.v)) return { v, name: c.name, slug: c.slug };
    return best;
  }, null);

  const bestWomenInPar = db.countries.reduce((best: any, c: any) => {
    const v = c.indicators?.['wb_women_in_parliament_pct']?.value;
    if (v != null && (!best || v > best.v)) return { v, name: c.name, slug: c.slug };
    return best;
  }, null);

  const bestUrban = db.countries.reduce((best: any, c: any) => {
    const v = c.indicators?.['wb_urban_population_pct']?.value;
    if (v != null && (!best || v > best.v)) return { v, name: c.name, slug: c.slug };
    return best;
  }, null);

  const bestMigration = db.countries.reduce((best: any, c: any) => {
    const v = c.indicators?.['wb_net_migration']?.value;
    if (v != null && (!best || v > best.v)) return { v, name: c.name, slug: c.slug };
    return best;
  }, null);

  const freedom = ind['heritage_economic_freedom']?.value; 
  const education = ind['unesco_education_spending']?.value;
  const life_expectancy = ind['who_life_expectancy']?.value;
  const doctors = ind['who_medical_doctors']?.value;
  const obesity = ind['who_obesity']?.value;
  const out_of_pocket = ind['who_out_of_pocket_expenditure']?.value;
  const health_summary = country.health_summary;
  const economic_summary = country.economic_summary;
  const demographics_summary = country.demographics_summary;
  const uhc = ind['who_uhc_index']?.value;
  const gini = ind['wb_gini']?.value;
  const inflation = ind['wb_inflation']?.value;
  const homicides = ind['wb_homicides']?.value;
  const air = ind['wb_air_quality']?.value;
  const gdp = ind['wb_gdp_pc_ppp']?.value;
  const happiness = ind['whr_happiness_index']?.value;
  const english = ind['ef_epi_english']?.value;
  const unemployment = ind['ilo_unemployment']?.value || ind['wb_unemployment']?.value;
  const population = ind['wb_population']?.value;
  const internet = ind['wb_internet_users_pct']?.value;
  const urban = ind['wb_urban_population_pct']?.value;
  const aging = ind['wb_population_65plus_pct']?.value;
  const migration = ind['wb_net_migration']?.value;
  const femalePct = ind['wb_female_population_pct']?.value;
  const malePct = ind['wb_male_population_pct']?.value;
  const womenInPar = ind['wb_women_in_parliament_pct']?.value;
  const taxes = ind['wb_taxes']?.value;
  
  const pol = country.politics || {};
  const climate = country.climate;

  const faqQuestions = [
    taxes ? {
      '@type': 'Question',
      name: `What is the tax burden in ${country.name}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `The tax burden in ${country.name} is approximately ${taxes.toFixed(1)}%, according to World Bank data.`
      }
    } : null,
    homicides ? {
      '@type': 'Question',
      name: `Is ${country.name} safe?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `The homicide rate in ${country.name} is ${homicides.toFixed(1)} per 100,000 people (World Bank).`
      }
    } : null,
    happiness ? {
      '@type': 'Question',
      name: `Are people happy in ${country.name}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `The World Happiness Report scores ${country.name} at ${happiness.toFixed(1)} out of 10.`
      }
    } : null
  ].filter(Boolean);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: country.name,
      identifier: country.id,
      description: `Relocation, tax, and demographic data for ${country.name}. Data sources: World Bank, Heritage Foundation, WHO.`,
      url: `https://settleradar.com/country/${country.slug}`,
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'Region', value: country.region },
        { '@type': 'PropertyValue', name: 'Capital', value: country.capital },
        ...(taxes ? [{ '@type': 'PropertyValue', name: 'Tax Burden', value: `${taxes}%` }] : []),
        ...(homicides ? [{ '@type': 'PropertyValue', name: 'Homicides per 100k', value: homicides }] : []),
        ...(happiness ? [{ '@type': 'PropertyValue', name: 'Happiness Index', value: happiness }] : []),
        ...(freedom ? [{ '@type': 'PropertyValue', name: 'Economic Freedom', value: freedom }] : [])
      ]
    },
    ...(faqQuestions.length > 0 ? [{
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqQuestions
    }] : []),
    {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: `Demographic and Economic Data for ${country.name}`,
      description: `Comprehensive indicators for ${country.name} including taxes, safety, climate, and freedom metrics from trusted international sources.`,
      url: `https://settleradar.com/country/${country.slug}`,
      license: "https://creativecommons.org/licenses/by/4.0/",
      creator: {
        '@type': 'Organization',
        name: 'SettleRadar Data Intelligence'
      }
    }
  ];



  const heritageMetrics = [
    { label: 'Overall Economic Freedom', key: 'heritage_economic_freedom', color: 'from-emerald-400 to-emerald-500', icon: <Scale className="w-4 h-4 text-slate-400" /> },
    { label: 'Property Rights', key: 'heritage_property_rights', color: 'from-blue-400 to-blue-500', icon: <Building className="w-4 h-4 text-slate-400" /> },
    { label: 'Judicial Effectiveness', key: 'heritage_judicial_effectiveness', color: 'from-indigo-400 to-indigo-500', icon: <Scale className="w-4 h-4 text-slate-400" /> },
    { label: 'Government Integrity', key: 'heritage_government_integrity', color: 'from-violet-400 to-violet-500', icon: <Shield className="w-4 h-4 text-slate-400" /> },
    { label: 'Tax Burden Score', key: 'heritage_tax_burden', color: 'from-purple-400 to-purple-500', icon: <Landmark className="w-4 h-4 text-slate-400" />, tooltip: "Higher score indicates lighter tax burden. Note: Near-perfect scores can sometimes reflect failed states that cannot collect taxes, rather than efficient economies." },
    { label: 'Government Spending', key: 'heritage_government_spending', color: 'from-rose-400 to-rose-500', icon: <Activity className="w-4 h-4 text-slate-400" />, tooltip: "Higher score indicates lower government spending. Note: Near-perfect scores often reflect failed states lacking basic public services rather than efficient governance." },
    { label: 'Fiscal Health', key: 'heritage_fiscal_health', color: 'from-emerald-400 to-emerald-500', icon: <TrendingUp className="w-4 h-4 text-slate-400" /> },
    { label: 'Business Freedom', key: 'heritage_business_freedom', color: 'from-amber-400 to-amber-500', icon: <Briefcase className="w-4 h-4 text-slate-400" /> },
    { label: 'Labor Freedom', key: 'heritage_labor_freedom', color: 'from-orange-400 to-orange-500', icon: <Users className="w-4 h-4 text-slate-400" /> },
    { label: 'Monetary Freedom', key: 'heritage_monetary_freedom', color: 'from-yellow-400 to-yellow-500', icon: <Landmark className="w-4 h-4 text-slate-400" /> },
    { label: 'Trade Freedom', key: 'heritage_trade_freedom', color: 'from-sky-400 to-sky-500', icon: <Wind className="w-4 h-4 text-slate-400" /> },
    { label: 'Investment Freedom', key: 'heritage_investment_freedom', color: 'from-cyan-400 to-cyan-500', icon: <Activity className="w-4 h-4 text-slate-400" /> },
    { label: 'Financial Freedom', key: 'heritage_financial_freedom', color: 'from-teal-400 to-teal-500', icon: <Landmark className="w-4 h-4 text-slate-400" /> },
  ];

  const hasHeritage = heritageMetrics.some(m => ind[m.key]?.value != null);

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-24 relative max-w-[1400px] mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      
      {/* ═══════ STICKY SIDEBAR ═══════ */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 glass-panel rounded-2xl p-4 shadow-xl border border-white/10 dark:border-white/5 space-y-1">
          <Link href="/" className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors mb-4 border-b border-black/5 dark:border-white/5">
            <ArrowLeft className="w-4 h-4" /> Global Terminal
          </Link>
          <div className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Sections</div>
          <a href="#overview" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <Sparkles className="w-4 h-4 text-blue-500" /> Quick Facts
          </a>
          <a href="#politics" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <Gavel className="w-4 h-4 text-purple-500" /> Politics & Power
          </a>
          <a href="#freedom" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <Shield className="w-4 h-4 text-emerald-500" /> Digital Freedom
          </a>
          <a href="#demographics" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <Users className="w-4 h-4 text-fuchsia-500" /> Demographics
          </a>
          <a href="#health" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <HeartPulse className="w-4 h-4 text-rose-500" /> Health & Lifestyle
          </a>
          <a href="#economy" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <Activity className="w-4 h-4 text-emerald-500" /> Economic Freedom
          </a>
          <a href="#climate" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <Sun className="w-4 h-4 text-amber-500" /> Climate Profile
          </a>
          {relatedPosts.length > 0 && (
            <a href="#articles" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <BookOpen className="w-4 h-4 text-blue-500" /> Guides & Articles
            </a>
          )}
        </div>
      </aside>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main className="flex-1 min-w-0 space-y-16">
        
        {/* HERO SECTION */}
        <section id="hero" className="relative glass-panel rounded-3xl p-8 md:p-12 overflow-hidden border border-white/20 dark:border-white/10 shadow-2xl">
            <div className="absolute top-0 right-0 -z-10 w-full h-full bg-gradient-to-br from-blue-500/10 via-emerald-500/10 to-transparent dark:from-blue-500/20 dark:via-emerald-500/10"></div>
            
            <div className="lg:hidden mb-8">
              <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors backdrop-blur-md">
                <ArrowLeft className="w-4 h-4" /> Back to Terminal
              </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              {country.iso_alpha2 ? (
                <div className="relative w-32 h-24 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                  <Image 
                  src={`/flags/moving-to-${country.slug}.png`} 
                  fill
                  sizes="128px"
                  style={{ objectFit: 'cover' }}
                  alt={`Flag of ${country.name}`}
                  priority
                />
              </div>
            ) : (
              <div className="text-6xl drop-shadow-lg shrink-0">{country.flag_emoji}</div>
            )}
            
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <MapPin className="w-3.5 h-3.5" /> {country.region}
                </span>
                {population != null && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Users className="w-3.5 h-3.5" /> {formatNumber(population / 1000000)}M people
                  </span>
                )}

                {country.capital && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    <Building className="w-3.5 h-3.5" /> Capital: {country.capital}
                  </span>
                )}
                {country.currency_name && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                    <Landmark className="w-3.5 h-3.5" /> Currency: {country.currency_name} ({country.currency_symbol || country.currency_code})
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <span>
                  Moving to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">{country.name}</span>
                </span>
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Exploring ${country.name} as my next relocation destination! 🌍✈️\n\n`)}&url=${encodeURIComponent(`https://settleradar.com/country/${country.slug}`)}&via=settleradar`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors bg-slate-100 dark:bg-slate-800/80 hover:bg-[#1DA1F2] dark:hover:bg-[#1DA1F2] px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-[#1DA1F2] shadow-sm mt-1 sm:mt-0"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                  Share
                </a>
              </h1>
              {country.nomad_visa && (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 shadow-sm">
                  <CheckCircle className="w-4 h-4" /> Digital Nomad Visa Available
                </span>
              )}
              {country.seo_summary ? (
                <p className="text-slate-700 dark:text-slate-200 max-w-3xl leading-relaxed text-lg font-medium">
                  {country.seo_summary}
                </p>
              ) : (
                <p className="text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Advanced, data-driven relocation profile based on verified indicators from the World Bank, WHO, Heritage Foundation, and Open-Meteo.
                </p>
              )}
              {relatedPosts.length > 0 && (
                <div className="mt-6">
                  <a 
                    href="#articles" 
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/20 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow-md"
                  >
                    <BookOpen className="w-4 h-4" /> Relocation Guides & Articles ({relatedPosts.length})
                  </a>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* QUICK FACTS GRID */}
        <section id="overview">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-blue-500" />
            <h2 className="text-3xl font-bold tracking-tight">Quick Facts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Fact 1 */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col h-full hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <Landmark className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">GDP per Capita (PPP)</p>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {gdp != null ? `$${formatNumber(gdp)}` : '--'}<span className="text-base font-medium text-slate-500 ml-1">USD</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">Adjusts for purchasing power parity.</p>
              {bestGDP && bestGDP.v != null && (
                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-auto pt-3 border-t border-slate-200/50 dark:border-slate-800/50" title="Global maximum">
                  🏆 Top: ${formatNumber(bestGDP.v)} (<Link href={`/country/${bestGDP.slug}`} className="hover:text-blue-400 underline decoration-white/30 hover:decoration-blue-400 underline-offset-2 transition-colors">{bestGDP.name}</Link>)
                </div>
              )}
            </div>

            {/* Fact 2 */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col h-full hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <HeartPulse className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Life Expectancy</p>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {life_expectancy != null ? life_expectancy.toFixed(1) : '--'}<span className="text-base font-medium text-slate-500 ml-1">years</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">WHO Data. UHC Index: {uhc != null ? uhc : '--'}/100.</p>
              {bestLife && bestLife.v != null && (
                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-auto pt-3 border-t border-slate-200/50 dark:border-slate-800/50" title="Global maximum">
                  🏆 Top: {bestLife.v.toFixed(1)} yrs (<Link href={`/country/${bestLife.slug}`} className="hover:text-blue-400 underline decoration-white/30 hover:decoration-blue-400 underline-offset-2 transition-colors">{bestLife.name}</Link>)
                </div>
              )}
            </div>

            {/* Fact 3 */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col h-full hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <Briefcase className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Unemployment</p>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {unemployment != null ? unemployment.toFixed(1) : '--'}<span className="text-base font-medium text-slate-500 ml-1">%</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">ILO Estimate. Indicates job market health.</p>
              {bestUnemployment && bestUnemployment.v != null && (
                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-auto pt-3 border-t border-slate-200/50 dark:border-slate-800/50" title="Global minimum (best)">
                  🏆 Top: {bestUnemployment.v.toFixed(1)}% (<Link href={`/country/${bestUnemployment.slug}`} className="hover:text-blue-400 underline decoration-white/30 hover:decoration-blue-400 underline-offset-2 transition-colors">{bestUnemployment.name}</Link>)
                </div>
              )}
            </div>

            {/* Fact 4 */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col h-full hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <Shield className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Safety — Homicides</p>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {homicides != null ? homicides.toFixed(1) : '--'}<span className="text-base font-medium text-slate-500 ml-1">per 100k</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">World Bank Crime Data. Lower is safer.</p>
              {bestHomicides && bestHomicides.v != null && (
                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-auto pt-3 border-t border-slate-200/50 dark:border-slate-800/50" title="Global minimum (best)">
                  🏆 Top: {bestHomicides.v.toFixed(1)} (<Link href={`/country/${bestHomicides.slug}`} className="hover:text-blue-400 underline decoration-white/30 hover:decoration-blue-400 underline-offset-2 transition-colors">{bestHomicides.name}</Link>)
                </div>
              )}
            </div>

            {/* Fact 5 */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col h-full hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Inflation Rate</p>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {inflation != null ? inflation.toFixed(1) : '--'}<span className="text-base font-medium text-slate-500 ml-1">%</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">Annual CPI. Indicates recent price stability.</p>
              {bestInflation && bestInflation.v != null && (
                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-auto pt-3 border-t border-slate-200/50 dark:border-slate-800/50" title="Closest to optimal 2.0% target">
                  🏆 Optimal (2%): {bestInflation.v.toFixed(1)}% (<Link href={`/country/${bestInflation.slug}`} className="hover:text-blue-400 underline decoration-white/30 hover:decoration-blue-400 underline-offset-2 transition-colors">{bestInflation.name}</Link>)
                </div>
              )}
            </div>

            {/* Fact 6 */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col h-full hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <Smile className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Happiness Index</p>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {happiness != null ? happiness.toFixed(2) : '--'}<span className="text-base font-medium text-slate-500 ml-1">/ 10</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">World Happiness Report (Cantril Ladder).</p>
              {bestHappiness && bestHappiness.v != null && (
                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-auto pt-3 border-t border-slate-200/50 dark:border-slate-800/50" title="Global maximum">
                  🏆 Top: {bestHappiness.v.toFixed(2)} (<Link href={`/country/${bestHappiness.slug}`} className="hover:text-blue-400 underline decoration-white/30 hover:decoration-blue-400 underline-offset-2 transition-colors">{bestHappiness.name}</Link>)
                </div>
              )}
            </div>

            {/* Fact 7 */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col h-full hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <Wind className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Air Quality (PM2.5)</p>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {air != null ? air.toFixed(1) : '--'}<span className="text-base font-medium text-slate-500 ml-1">µg/m³</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">World Bank Data. Lower is better.</p>
              {bestAir && bestAir.v != null && (
                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-auto pt-3 border-t border-slate-200/50 dark:border-slate-800/50" title="Global minimum (best)">
                  🏆 Top: {bestAir.v.toFixed(1)} µg/m³ (<Link href={`/country/${bestAir.slug}`} className="hover:text-emerald-400 underline decoration-white/30 hover:decoration-emerald-400 underline-offset-2 transition-colors">{bestAir.name}</Link>)
                </div>
              )}
            </div>

            {/* Fact 8 */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col h-full hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-fuchsia-500/10 group-hover:text-fuchsia-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <GraduationCap className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Education Spending</p>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {education != null ? education.toFixed(1) : '--'}<span className="text-base font-medium text-slate-500 ml-1">% of GDP</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">UNESCO Data. Indicates focus on public schooling.</p>
              {bestEducation && bestEducation.v != null && (
                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-auto pt-3 border-t border-slate-200/50 dark:border-slate-800/50" title="Global maximum">
                  🏆 Top: {bestEducation.v.toFixed(1)}% (<Link href={`/country/${bestEducation.slug}`} className="hover:text-fuchsia-400 underline decoration-white/30 hover:decoration-fuchsia-400 underline-offset-2 transition-colors">{bestEducation.name}</Link>)
                </div>
              )}
            </div>
          </div>
        </section>

        {/* NEW: POLITICS & POWER */}
        <section id="politics">
          <div className="flex items-center gap-2 mb-6">
            <Gavel className="w-6 h-6 text-purple-500" />
            <h2 className="text-3xl font-bold tracking-tight">Politics & Power</h2>
          </div>
          
          {pol && Object.keys(pol).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-110 transition-transform">
                  <Building className="w-32 h-32 text-purple-500" />
                </div>
                <p className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-2">Government System</p>
                <h3 className={`font-extrabold text-slate-900 dark:text-white leading-tight ${pol.government_type && pol.government_type.length > 40 ? 'text-lg' : pol.government_type && pol.government_type.length > 20 ? 'text-xl' : 'text-3xl'}`}>
                  {pol.government_type || 'Unknown'}
                </h3>
                <div className="mt-4 space-y-1">
                  {pol.head_of_state && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      Head of State: <strong className="text-slate-700 dark:text-slate-200">{pol.head_of_state}</strong>
                    </p>
                  )}
                  {pol.head_of_government && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      Head of Gov: <strong className="text-slate-700 dark:text-slate-200">{pol.head_of_government}</strong>
                    </p>
                  )}
                </div>
              </div>
              
              <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-110 transition-transform">
                  <Gavel className="w-32 h-32 text-blue-500" />
                </div>
                <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">Ruling Party</p>
                <h3 className={`font-extrabold text-slate-900 dark:text-white leading-tight ${pol.ruling_party && pol.ruling_party.length > 40 ? 'text-lg' : pol.ruling_party && pol.ruling_party.length > 20 ? 'text-xl' : 'text-3xl'}`}>
                  {pol.ruling_party ? pol.ruling_party.replace(/\.\.\.$/, '').trim() : 'Unknown'}
                </h3>
                {pol.political_spectrum && (
                  <div className="mt-4">
                    <span className="inline-block px-3 py-1 bg-black/5 dark:bg-white/10 rounded-full text-xs font-bold uppercase text-slate-500">
                      {pol.political_spectrum}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-3xl flex items-center gap-4">
              <Gavel className="w-8 h-8 text-slate-400" />
              <p className="text-slate-500 font-medium">Political structure data is currently being collected for {country.name}.</p>
            </div>
          )}
        </section>

        {/* DIGITAL FREEDOM */}
        <section id="freedom">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-6 h-6 text-emerald-500" />
            <h2 className="text-3xl font-bold tracking-tight">Digital Freedom & Remote Work</h2>
          </div>
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group border border-white/20 hover:border-emerald-500/30 transition-colors">
            <div className="absolute -right-6 -top-6 opacity-5 group-hover:scale-110 transition-transform">
              <Shield className="w-48 h-48 text-emerald-500" />
            </div>
            {country.digital_freedom_text ? (
              <>
                <p className="text-lg text-slate-700 dark:text-slate-200 leading-relaxed relative z-10 font-medium">
                  {country.digital_freedom_text}
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <Activity className="w-4 h-4 text-emerald-500" /> Powered by OONI Network Measurements
                </div>
              </>
            ) : (
              <p className="text-slate-500 font-medium relative z-10">Censorship and network interference data is currently being collected for {country.name}.</p>
            )}
          </div>
        </section>

        {/* DEMOGRAPHICS (BENTO GRID) */}
        <section id="demographics" className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-6 h-6 text-blue-500" />
            <h2 className="text-3xl font-bold tracking-tight">Society & Demographics</h2>
          </div>

          <div className="glass-panel p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-lg border border-white/20 dark:border-white/10 hover:border-blue-500/30 transition-colors group">
            <div className="absolute -right-6 -top-6 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
              <Users className="w-48 h-48 text-blue-500" />
            </div>

            {demographics_summary && (
              <div className="prose prose-slate max-w-none dark:prose-invert prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-200 font-medium relative z-10 mb-10" dangerouslySetInnerHTML={{ __html: demographics_summary }} />
            )}
          
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Bento Block: Gender Ratio */}
            {(femalePct != null && malePct != null) && (
              <div className="glass-panel p-6 rounded-3xl md:col-span-2 row-span-1 flex flex-col justify-center border border-white/20 hover:border-fuchsia-500/30 transition-colors">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Gender Distribution</p>
                <div className="flex h-8 rounded-2xl overflow-hidden shadow-inner">
                  <div 
                    className="bg-blue-400 flex items-center justify-start pl-4 text-sm font-bold text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                    style={{ width: `${malePct}%` }}
                    title={`Male: ${malePct.toFixed(1)}%`}
                  >
                    Male {malePct.toFixed(1)}%
                  </div>
                  <div 
                    className="bg-fuchsia-400 flex items-center justify-end pr-4 text-sm font-bold text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                    style={{ width: `${femalePct}%` }}
                    title={`Female: ${femalePct.toFixed(1)}%`}
                  >
                    Female {femalePct.toFixed(1)}%
                  </div>
                </div>
              </div>
            )}
            
            {/* Bento Block: Internet */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col h-full row-span-1 border border-white/20 hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <Activity className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Connectivity</p>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-end gap-1">
                {internet != null ? internet.toFixed(1) : '--'} <span className="text-base font-semibold text-slate-500 mb-1">%</span>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-2">Internet Users</p>
              {bestInternet && bestInternet.v != null && (
                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-auto pt-3 border-t border-slate-200/50 dark:border-slate-800/50" title="Global maximum">
                  🏆 Top: {bestInternet.v.toFixed(1)}% (<Link href={`/country/${bestInternet.slug}`} className="hover:text-blue-400 underline decoration-white/30 hover:decoration-blue-400 underline-offset-2 transition-colors">{bestInternet.name}</Link>)
                </div>
              )}
            </div>
            
            {/* Bento Block: English */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col h-full row-span-1 border border-white/20 hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <MessageCircle className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Language</p>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-end gap-1">
                {english != null ? english.toFixed(0) : '--'} <span className="text-base font-semibold text-slate-500 mb-1">/ 800</span>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-2">EF English Proficiency</p>
              {bestEnglish && bestEnglish.v != null && (
                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-auto pt-3 border-t border-slate-200/50 dark:border-slate-800/50" title="Global maximum">
                  🏆 Top: {bestEnglish.v.toFixed(0)} (<Link href={`/country/${bestEnglish.slug}`} className="hover:text-blue-400 underline decoration-white/30 hover:decoration-blue-400 underline-offset-2 transition-colors">{bestEnglish.name}</Link>)
                </div>
              )}
            </div>

            {/* Bento Block: Inequality */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col h-full row-span-1 border border-white/20 hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <Scale className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Inequality</p>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-end gap-1">
                {gini != null ? gini.toFixed(1) : '--'} <span className="text-base font-semibold text-slate-500 mb-1">/ 100</span>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-2">GINI Index (Lower = more equal)</p>
              {bestGini && bestGini.v != null && (
                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-auto pt-3 border-t border-slate-200/50 dark:border-slate-800/50" title="Global minimum (best)">
                  🏆 Top: {bestGini.v.toFixed(1)} (<Link href={`/country/${bestGini.slug}`} className="hover:text-blue-400 underline decoration-white/30 hover:decoration-blue-400 underline-offset-2 transition-colors">{bestGini.name}</Link>)
                </div>
              )}
            </div>

            {/* Bento Block: Women in Parliament */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col h-full row-span-1 border border-white/20 hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Equality</p>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-end gap-1">
                {womenInPar != null ? womenInPar.toFixed(1) : '--'} <span className="text-base font-semibold text-slate-500 mb-1">%</span>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-2">Women in Parliament</p>
              {bestWomenInPar && bestWomenInPar.v != null && (
                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-auto pt-3 border-t border-slate-200/50 dark:border-slate-800/50" title="Global maximum">
                  🏆 Top: {bestWomenInPar.v.toFixed(1)}% (<Link href={`/country/${bestWomenInPar.slug}`} className="hover:text-blue-400 underline decoration-white/30 hover:decoration-blue-400 underline-offset-2 transition-colors">{bestWomenInPar.name}</Link>)
                </div>
              )}
            </div>
            
            {/* Bento Block: Aging */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col h-full row-span-1 border border-white/20 hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Aging Society</p>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-end gap-1">
                {aging != null ? aging.toFixed(1) : '--'} <span className="text-base font-semibold text-slate-500 mb-1">%</span>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-2">Population over 65 years old</p>
            </div>
            
            {/* Bento Block: Urbanization */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col h-full row-span-1 border border-white/20 hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <Building className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Urbanization</p>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-end gap-1">
                {urban != null ? urban.toFixed(1) : '--'} <span className="text-base font-semibold text-slate-500 mb-1">%</span>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-2">People living in cities</p>
              {bestUrban && bestUrban.v != null && (
                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-auto pt-3 border-t border-slate-200/50 dark:border-slate-800/50" title="Global maximum">
                  🏆 Top: {bestUrban.v.toFixed(1)}% (<Link href={`/country/${bestUrban.slug}`} className="hover:text-blue-400 underline decoration-white/30 hover:decoration-blue-400 underline-offset-2 transition-colors">{bestUrban.name}</Link>)
                </div>
              )}
            </div>
            
            {/* Bento Block: Migration */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col h-full md:col-span-1 row-span-1 border border-white/20 hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <Globe className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Migration</p>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-end gap-1">
                {migration != null ? (migration > 0 ? `+${formatNumber(migration)}` : formatNumber(migration)) : '--'}
              </div>
              <p className="text-sm font-medium text-slate-500 mt-2">Net Migration (5-yr total)</p>
              {bestMigration && bestMigration.v != null && (
                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-auto pt-3 border-t border-slate-200/50 dark:border-slate-800/50" title="Global maximum">
                  🏆 Top: {bestMigration.v > 0 ? `+${formatNumber(bestMigration.v)}` : formatNumber(bestMigration.v)} (<Link href={`/country/${bestMigration.slug}`} className="hover:text-blue-400 underline decoration-white/30 hover:decoration-blue-400 underline-offset-2 transition-colors">{bestMigration.name}</Link>)
                </div>
              )}
            </div>
            </div>

            <div className="mt-10 border-t border-slate-200/50 dark:border-slate-800/50 pt-6 relative z-10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                <Sparkles className="w-4 h-4 text-blue-500" /> Insights based on World Bank Data
              </div>
            </div>
          </div>
        </section>

        {/* HEALTH & LIFESTYLE */}
        {(health_summary || life_expectancy || doctors || obesity || out_of_pocket) && (
          <section id="health" className="space-y-6">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-6 h-6 text-rose-500" />
              <h2 className="text-3xl font-bold tracking-tight">Health & Lifestyle</h2>
            </div>
            
            <div className="glass-panel p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-lg border border-white/20 dark:border-white/10 hover:border-rose-500/30 transition-colors group">
              <div className="absolute -right-6 -top-6 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
                <HeartPulse className="w-48 h-48 text-rose-500" />
              </div>

              {health_summary && (
                <div className="prose prose-slate max-w-none dark:prose-invert prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-200 font-medium relative z-10 mb-10" dangerouslySetInnerHTML={{ __html: health_summary }} />
              )}
              
              <div className="flex flex-wrap gap-4 relative z-10">
                {life_expectancy != null && (
                  <div className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.67rem)] glass-panel p-6 rounded-3xl flex flex-col h-full flex flex-col h-full hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-white/20 group">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-rose-500/10 group-hover:text-rose-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Longevity</div>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-end gap-1">
                      {life_expectancy.toFixed(1)} <span className="text-base font-semibold text-slate-500 mb-1">yrs</span>
                    </div>
                    {bestLife && bestLife.v != null && (
                      <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-auto pt-3 border-t border-slate-200/50 dark:border-slate-800/50" title="Global maximum">
                        🏆 Top: {bestLife.v.toFixed(1)} yrs (<Link href={`/country/${bestLife.slug}`} className="hover:text-rose-400 underline decoration-white/30 hover:decoration-rose-400 underline-offset-2 transition-colors">{bestLife.name}</Link>)
                      </div>
                    )}
                  </div>
                )}
                
                {doctors != null && (
                  <div className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.67rem)] glass-panel p-6 rounded-3xl flex flex-col h-full flex flex-col h-full hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-white/20 group">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                      <HeartPulse className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Care Access</div>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-end gap-1">
                      {doctors.toFixed(1)} <span className="text-base font-semibold text-slate-500 mb-1">/ 10k</span>
                    </div>
                    {bestDoctors && bestDoctors.v != null && (
                      <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-auto pt-3 border-t border-slate-200/50 dark:border-slate-800/50" title="Global maximum">
                        🏆 Top: {bestDoctors.v.toFixed(1)} (<Link href={`/country/${bestDoctors.slug}`} className="hover:text-blue-400 underline decoration-white/30 hover:decoration-blue-400 underline-offset-2 transition-colors">{bestDoctors.name}</Link>)
                      </div>
                    )}
                  </div>
                )}

                {out_of_pocket != null && (
                  <div className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.67rem)] glass-panel p-6 rounded-3xl flex flex-col h-full flex flex-col h-full hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-white/20 group">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-amber-500/10 group-hover:text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Health Cost</div>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-end gap-1">
                      {out_of_pocket.toFixed(1)} <span className="text-base font-semibold text-slate-500 mb-1">% OOP</span>
                    </div>
                    {bestOOP && bestOOP.v != null && (
                      <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-auto pt-3 border-t border-slate-200/50 dark:border-slate-800/50" title="Global minimum (best)">
                        🏆 Top: {bestOOP.v.toFixed(1)}% (<Link href={`/country/${bestOOP.slug}`} className="hover:text-amber-400 underline decoration-white/30 hover:decoration-amber-400 underline-offset-2 transition-colors">{bestOOP.name}</Link>)
                      </div>
                    )}
                  </div>
                )}

                {obesity != null && (
                  <div className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.67rem)] glass-panel p-6 rounded-3xl flex flex-col h-full flex flex-col h-full hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-white/20 group">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-orange-500/10 group-hover:text-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Lifestyle</div>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-end gap-1">
                      {obesity.toFixed(1)} <span className="text-base font-semibold text-slate-500 mb-1">%</span>
                    </div>
                    {bestObesity && bestObesity.v != null && (
                      <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-auto pt-3 border-t border-slate-200/50 dark:border-slate-800/50" title="Global minimum (best)">
                        🏆 Top: {bestObesity.v.toFixed(1)}% (<Link href={`/country/${bestObesity.slug}`} className="hover:text-orange-400 underline decoration-white/30 hover:decoration-orange-400 underline-offset-2 transition-colors">{bestObesity.name}</Link>)
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-10 border-t border-slate-200/50 dark:border-slate-800/50 pt-6 relative z-10">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <Sparkles className="w-4 h-4 text-rose-500" /> Based on WHO Data
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ECONOMIC FREEDOM */}
        <section id="economy" className="space-y-6">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-500" />
            <h2 className="text-3xl font-bold tracking-tight">Economic Freedom & Business Climate</h2>
          </div>

          <div className="glass-panel p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-lg border border-white/20 dark:border-white/10 hover:border-indigo-500/30 transition-colors group">
            <div className="absolute -right-6 -top-6 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
              <Briefcase className="w-48 h-48 text-indigo-500" />
            </div>

            {economic_summary && (
              <div className={`prose prose-slate max-w-none dark:prose-invert prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-200 font-medium relative z-10 ${hasHeritage ? 'mb-10' : ''}`} dangerouslySetInnerHTML={{ __html: economic_summary }} />
            )}

            {hasHeritage && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 relative z-10">
                {heritageMetrics.map((metric, idx) => {
                  const score = ind[metric.key]?.value;
                  if (score == null) return null;
                  
                  const bestCountry = db.countries.reduce((best: any, c: any) => {
                    const v = c.indicators?.[metric.key]?.value;
                    if (v != null && (!best || v > best.v)) return { v, name: c.name, slug: c.slug };
                    return best;
                  }, null);
                  
                  return (
                    <div key={idx} className="group flex flex-col h-full">
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-2">
                          {metric.icon}
                          <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{metric.label}</span>
                          {/* @ts-ignore */}
                          {metric.tooltip && (
                            <div title={metric.tooltip} className="cursor-help">
                              <Info className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-400 transition-colors" />
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {score.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner mb-2">
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r ${metric.color} transition-all duration-1000 ease-out`} 
                          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                        ></div>
                      </div>
                      {bestCountry && bestCountry.v != null && (
                        <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-auto pt-2" title="Global maximum">
                          🏆 Top: {bestCountry.v.toFixed(1)} (<Link href={`/country/${bestCountry.slug}`} className="hover:text-indigo-400 underline decoration-white/30 hover:decoration-indigo-400 underline-offset-2 transition-colors">{bestCountry.name}</Link>)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 border-t border-slate-200/50 dark:border-slate-800/50 pt-6 relative z-10">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                  Evaluated across 12 quantitative factors. Scores span 0–100, where higher scores indicate greater economic liberty, lighter tax burdens, and stronger property rights.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <Sparkles className="w-4 h-4 text-indigo-500" /> Insights based on Heritage Data
                </div>
              </div>
              </>
            )}
          </div>
        </section>

        {/* CLIMATE */}
        <section id="climate">
          <div className="flex items-center gap-2 mb-6">
            <Sun className="w-6 h-6 text-amber-500" />
            <h2 className="text-3xl font-bold tracking-tight">Climate Profile ({country.capital})</h2>
          </div>
          
          {climate ? (
            <div className="space-y-6">
            <div className="glass-panel p-6 md:p-8 rounded-3xl relative overflow-hidden group border border-white/20 hover:border-amber-500/30 transition-colors shadow-lg">
              <div className="absolute -right-6 -top-6 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
                <Sun className="w-48 h-48 text-amber-500" />
              </div>
              
              {country.climate_summary && (
                  <p className="text-lg text-slate-700 dark:text-slate-200 leading-relaxed relative z-10 font-medium mb-10">
                    {country.climate_summary}
                  </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 relative z-10">
                {climate.map((m: any, idx: number) => {
                  let colorClass = 'text-blue-500';
                  if (m.avgMaxTemp >= 25) colorClass = 'text-rose-500';
                  else if (m.avgMaxTemp >= 15) colorClass = 'text-amber-500';
                  else if (m.avgMaxTemp >= 5) colorClass = 'text-emerald-500';
                  
                  return (
                    <div key={idx} className="glass-panel p-4 rounded-3xl text-center hover:scale-105 transition-transform duration-300 border border-white/20">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{m.monthName}</div>
                      <div className={`text-3xl font-black ${colorClass} mb-1 flex items-start justify-center gap-1`}>
                        {m.avgMaxTemp} <span className="text-base font-semibold mt-1">°C</span>
                      </div>
                      <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                        <span className="text-xs font-medium text-slate-500 flex items-center justify-center gap-1">
                          <ThermometerSun className="w-3.5 h-3.5" /> min {m.avgMinTemp}°
                        </span>
                        <span className="text-xs font-medium text-slate-500 flex items-center justify-center gap-1">
                          {m.snowDays > 0 ? <CloudSnow className="w-3.5 h-3.5 text-sky-400" /> : <Droplets className="w-3.5 h-3.5 text-blue-400" />}
                          {m.snowDays > 0 && m.rainDays > 0 
                            ? `${m.snowDays} snow, ${m.rainDays} rain` 
                            : m.snowDays > 0 
                              ? `${m.snowDays} snow days` 
                              : `${m.rainDays} rain days`}
                        </span>
                        {m.sunshineHours != null && (
                          <span className="text-xs font-medium text-slate-500 flex items-center justify-center gap-1 mt-0.5">
                            <Sun className={`w-3.5 h-3.5 ${m.sunshineHours > 0 ? 'text-amber-500' : 'text-slate-300'}`} /> 
                            {m.sunshineHours > 0 ? `${m.sunshineHours}h sun` : 'No data'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 border-t border-slate-200/50 dark:border-slate-800/50 pt-6 relative z-10">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <ThermometerSun className="w-4 h-4 text-amber-500" /> Powered by Open-Meteo Data
                </div>
              </div>
            </div>
            </div>
          ) : (
            <div className="glass-panel p-12 text-center rounded-3xl">
              <Wind className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
              <p className="text-slate-500 font-medium">Climate data currently unavailable for {country.capital || 'this location'}.</p>
            </div>
          )}
        </section>

        {/* RELATED ARTICLES */}
        {relatedPosts.length > 0 && (
          <section id="articles">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-6 h-6 text-blue-500" />
              <h2 className="text-3xl font-bold tracking-tight">Relocation Guides & Articles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((post) => (
                <Link href={`/blog/${post.slug}`} key={post.slug} className="glass-panel rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group flex flex-col border border-white/20 hover:border-blue-500/30">
                  {post.coverImage && (
                    <div className="relative w-full h-48 shrink-0">
                      <Image 
                        src={post.coverImage} 
                        alt={post.title} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6 flex-1">
                    <p className="text-sm text-blue-500 font-semibold mb-2">{formatDate(post.date)}</p>
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white line-clamp-3 group-hover:text-blue-500 transition-colors">{post.title}</h3>
                    <p className="text-slate-500 text-sm line-clamp-3">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* COMPARE CTA */}
        {(() => {
          const defaultCompareSlug = country.slug === 'poland' ? 'spain' : 'poland';
          const defaultCompareName = country.slug === 'poland' ? 'Spain' : 'Poland';
          const compareUrl = [country.slug, defaultCompareSlug].sort().join('/');

          return (
            <section className="mt-8 glass-panel rounded-3xl p-8 md:p-12 border border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/10 dark:to-blue-900/10 text-center shadow-xl relative overflow-hidden group">
              <div className="absolute -top-12 -left-12 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
                 <Swords className="w-64 h-64 text-indigo-500" />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                  Is {country.name} the right choice for you?
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                  Don't guess. Compare {country.name} head-to-head against other popular expat destinations. See exact differences in taxes, cost of living, climate, and safety.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link 
                    href={`/compare/${compareUrl}`}
                    className="inline-flex w-full sm:w-auto justify-center items-center px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-lg"
                  >
                    Compare {country.name} vs {defaultCompareName}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              </div>
            </section>
          );
        })()}

      </main>
    </div>
  );
}
