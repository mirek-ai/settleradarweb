import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { ArrowLeft, Swords, Activity, HeartPulse, GraduationCap, Scale, Sun, Users, Landmark, Wind, Droplets, CloudSnow, ThermometerSun } from 'lucide-react';
import CompareChart from './CompareChart';
import ClimateChart from './ClimateChart';
import { Metadata } from 'next';
import Image from 'next/image';

const formatNumber = (num: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(num);

export async function generateStaticParams() {
  const topCountries = ['poland', 'czechia', 'spain', 'portugal', 'united-states', 'united-kingdom', 'germany'];
  const params = [];
  for (let i = 0; i < topCountries.length; i++) {
    for (let j = i + 1; j < topCountries.length; j++) {
      const c1 = topCountries[i];
      const c2 = topCountries[j];
      const [slug1, slug2] = [c1, c2].sort();
      params.push({ slug1, slug2 });
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ slug1: string, slug2: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  // Canonical URL logically alphabetized to prevent Duplicate Content (SEO)
  const canonicalPath = [resolvedParams.slug1, resolvedParams.slug2].sort().join('/');
  return {
    title: `Compare ${resolvedParams.slug1} vs ${resolvedParams.slug2} | SettleRadar`,
    description: `Detailed thematic comparison between ${resolvedParams.slug1} and ${resolvedParams.slug2}.`,
    alternates: {
      canonical: `https://settleradar.com/compare/${canonicalPath}`
    }
  };
}

export default async function CompareResultPage({ params }: { params: Promise<{ slug1: string, slug2: string }> }) {
  const resolvedParams = await params;
  const dbPath = path.join(process.cwd(), 'src', 'data', 'database.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  const countryA = db.countries.find((c: any) => c.slug === resolvedParams.slug1);
  const countryB = db.countries.find((c: any) => c.slug === resolvedParams.slug2);

  if (!countryA || !countryB) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-4xl font-bold mb-4">Countries Not Found</h1>
        <Link href="/compare" className="text-blue-500 hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Compare Menu
        </Link>
      </div>
    );
  }

  const getVal = (country: any, key: string) => country.indicators?.[key]?.value ?? null;

  // Radar Chart normalization
  const gdpA = getVal(countryA, 'wb_gdp_pc_ppp');
  const gdpB = getVal(countryB, 'wb_gdp_pc_ppp');
  const normGdp = (val: number | null) => val ? Math.min(100, Math.max(0, (val / 80000) * 100)) : 0;
  
  const homicidesA = getVal(countryA, 'wb_homicides');
  const homicidesB = getVal(countryB, 'wb_homicides');
  const normHomicides = (val: number | null) => val ? Math.max(0, 100 - (val * 4)) : 0;

  const happinessA = getVal(countryA, 'whr_happiness_index');
  const happinessB = getVal(countryB, 'whr_happiness_index');
  const normHappiness = (val: number | null) => val ? (val / 10) * 100 : 0;

  const chartData = [
    { subject: 'Economy (GDP PPP)', A: normGdp(gdpA), B: normGdp(gdpB), fullMark: 100 },
    { subject: 'Healthcare (UHC)', A: getVal(countryA, 'who_uhc_index') || 0, B: getVal(countryB, 'who_uhc_index') || 0, fullMark: 100 },
    { subject: 'Safety (Low Crime)', A: normHomicides(homicidesA), B: normHomicides(homicidesB), fullMark: 100 },
    { subject: 'Happiness Index', A: normHappiness(happinessA), B: normHappiness(happinessB), fullMark: 100 },
    { subject: 'Digital (Internet)', A: getVal(countryA, 'wb_internet_users_pct') || 0, B: getVal(countryB, 'wb_internet_users_pct') || 0, fullMark: 100 },
    { subject: 'Business Freedom', A: getVal(countryA, 'heritage_business_freedom') || 0, B: getVal(countryB, 'heritage_business_freedom') || 0, fullMark: 100 },
  ];

  // Helper for rendering a table row
  const renderRow = (label: string, valA: number | null, valB: number | null, format = '', invertGood = false) => {
    const a = valA ?? 0;
    const b = valB ?? 0;
    let winner = 'draw';
    if (valA != null && valB != null && a !== b) {
      winner = invertGood ? (a < b ? 'A' : 'B') : (a > b ? 'A' : 'B');
    }

    const fmt = (v: number | null) => {
      if (v == null) return 'N/A';
      return format === '$' ? `$${formatNumber(v)}` : format === '%' ? `${formatNumber(v)}%` : formatNumber(v);
    };

    return (
      <tr key={label} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
        <td className={`p-4 text-center font-bold text-lg ${winner === 'A' ? 'text-blue-500' : 'text-slate-600 dark:text-slate-400'}`}>
          {fmt(valA)}
        </td>
        <td className="p-4 text-center font-bold text-sm text-slate-500 bg-slate-50/50 dark:bg-slate-900/20">
          {label}
        </td>
        <td className={`p-4 text-center font-bold text-lg ${winner === 'B' ? 'text-emerald-500' : 'text-slate-600 dark:text-slate-400'}`}>
          {fmt(valB)}
        </td>
      </tr>
    );
  };

  const renderTableHeader = () => (
    <thead className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
      <tr>
        <th className="p-3 text-center w-1/3">
          <div className="flex flex-col items-center gap-1 justify-center">
            {countryA.iso_alpha2 ? (
              <Image src={`https://flagcdn.com/w40/${countryA.iso_alpha2.toLowerCase()}.png`} width={24} height={18} className="shadow-sm rounded-sm" alt={countryA.name} />
            ) : <span className="text-sm">{countryA.flag_emoji}</span>}
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{countryA.name}</span>
          </div>
        </th>
        <th className="p-3 text-center w-1/3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Metric
        </th>
        <th className="p-3 text-center w-1/3">
          <div className="flex flex-col items-center gap-1 justify-center">
            {countryB.iso_alpha2 ? (
              <Image src={`https://flagcdn.com/w40/${countryB.iso_alpha2.toLowerCase()}.png`} width={24} height={18} className="shadow-sm rounded-sm" alt={countryB.name} />
            ) : <span className="text-sm">{countryB.flag_emoji}</span>}
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{countryB.name}</span>
          </div>
        </th>
      </tr>
    </thead>
  );

  const getAnnualClimate = (climateData: any) => {
    if (!climateData || !climateData.length) return null;
    let sumMax = 0, sumMin = 0, sumRain = 0, sumSnow = 0;
    climateData.forEach((m: any) => {
      sumMax += m.avgMaxTemp;
      sumMin += m.avgMinTemp;
      sumRain += m.rainDays;
      sumSnow += m.snowDays;
    });
    return {
      avgMax: (sumMax / 12).toFixed(1),
      avgMin: (sumMin / 12).toFixed(1),
      totalRain: sumRain,
      totalSnow: sumSnow
    };
  };

  const climA = getAnnualClimate(countryA.climate);
  const climB = getAnnualClimate(countryB.climate);

  const heritageList = [
    { k: 'heritage_economic_freedom', l: 'Overall Economic Freedom' },
    { k: 'heritage_property_rights', l: 'Property Rights' },
    { k: 'heritage_judicial_effectiveness', l: 'Judicial Effectiveness' },
    { k: 'heritage_government_integrity', l: 'Government Integrity' },
    { k: 'heritage_tax_burden', l: 'Tax Burden Score' },
    { k: 'heritage_government_spending', l: 'Government Spending' },
    { k: 'heritage_fiscal_health', l: 'Fiscal Health' },
    { k: 'heritage_business_freedom', l: 'Business Freedom' },
    { k: 'heritage_labor_freedom', l: 'Labor Freedom' },
    { k: 'heritage_monetary_freedom', l: 'Monetary Freedom' },
    { k: 'heritage_trade_freedom', l: 'Trade Freedom' },
    { k: 'heritage_investment_freedom', l: 'Investment Freedom' },
    { k: 'heritage_financial_freedom', l: 'Financial Freedom' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-12 pb-24">
      <Link href="/compare" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Change Countries
      </Link>

      {/* ═══════ HERO FLAGS ═══════ */}
      <div className="flex justify-between items-center relative">
        <div className="w-1/3 flex flex-col items-center text-center">
          {countryA.iso_alpha2 ? (
            <div className="relative w-24 h-16 md:w-40 md:h-28 mb-4 shadow-lg rounded-xl overflow-hidden border border-white/10">
              <Image src={`https://flagcdn.com/w320/${countryA.iso_alpha2}.png`} fill className="object-cover" alt={countryA.name} />
            </div>
          ) : <div className="text-6xl mb-4">{countryA.flag_emoji}</div>}
          <h2 className="text-2xl md:text-4xl font-black text-blue-600 dark:text-blue-400">{countryA.name}</h2>
        </div>
        
        <div className="w-1/3 flex justify-center">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xl z-10">
            <Swords className="w-6 h-6 md:w-8 md:h-8" />
          </div>
        </div>

        <div className="w-1/3 flex flex-col items-center text-center">
          {countryB.iso_alpha2 ? (
            <div className="relative w-24 h-16 md:w-40 md:h-28 mb-4 shadow-lg rounded-xl overflow-hidden border border-white/10">
              <Image src={`https://flagcdn.com/w320/${countryB.iso_alpha2}.png`} fill className="object-cover" alt={countryB.name} />
            </div>
          ) : <div className="text-6xl mb-4">{countryB.flag_emoji}</div>}
          <h2 className="text-2xl md:text-4xl font-black text-emerald-600 dark:text-emerald-400">{countryB.name}</h2>
        </div>
      </div>

      {/* ═══════ RADAR CHART ═══════ */}
      <div className="glass-panel p-6 rounded-3xl border border-white/20 dark:border-white/10 shadow-xl mx-auto max-w-3xl">
        <h3 className="text-xl font-bold text-center mb-2">Multidimensional Comparison</h3>
        <p className="text-center text-xs text-slate-500 mb-6 uppercase tracking-widest">Normalized 0-100 Scale</p>
        <CompareChart countryA={countryA.name} countryB={countryB.name} data={chartData} />
        
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs text-slate-500 dark:text-slate-400">
          <p className="font-bold mb-1 text-slate-700 dark:text-slate-300">How is this calculated?</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Economy (GDP):</strong> World Bank Data. Based on GDP per capita (PPP) which adjusts for the local cost of living. Normalized against a baseline of $80,000 (100 pts).</li>
            <li><strong>Safety (Low Crime):</strong> World Bank Data. Inverted homicide rates. 0 homicides = 100 pts. 25+ homicides = 0 pts.</li>
            <li><strong>Happiness Index:</strong> WHR Score (0-10) multiplied by 10.</li>
            <li><strong>Healthcare, Digital & Business:</strong> These use their native 0-100 indexes directly (UHC Index, Internet %, Heritage Freedom).</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 mt-12">
        {/* ═══════ ECONOMY & LABOR ═══════ */}
        <div className="glass-panel rounded-3xl border border-white/20 dark:border-white/10 overflow-hidden shadow-lg h-fit">
          <div className="p-4 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold uppercase tracking-wider">Economy & Labor</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
            {renderTableHeader()}
            <tbody>
              {renderRow('GDP per Capita (PPP)', gdpA, gdpB, '$')}
              {renderRow('Unemployment Rate', getVal(countryA, 'ilo_unemployment') || getVal(countryA, 'wb_unemployment'), getVal(countryB, 'ilo_unemployment') || getVal(countryB, 'wb_unemployment'), '%', true)}
              {renderRow('Inflation Rate', getVal(countryA, 'wb_inflation'), getVal(countryB, 'wb_inflation'), '%', true)}
              {renderRow('GINI Inequality', getVal(countryA, 'wb_gini'), getVal(countryB, 'wb_gini'), '', true)}
              {renderRow('Education Spending (GDP)', getVal(countryA, 'unesco_education_spending'), getVal(countryB, 'unesco_education_spending'), '%')}
            </tbody>
          </table>
          </div>
        </div>

        {/* ═══════ QUALITY OF LIFE & HEALTH ═══════ */}
        <div className="glass-panel rounded-3xl border border-white/20 dark:border-white/10 overflow-hidden shadow-lg h-fit">
          <div className="p-4 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold uppercase tracking-wider">Quality of Life & Health</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
            {renderTableHeader()}
            <tbody>
              {renderRow('Happiness Index', happinessA, happinessB, '')}
              {renderRow('Life Expectancy', getVal(countryA, 'who_life_expectancy'), getVal(countryB, 'who_life_expectancy'), '')}
              {renderRow('UHC Health Index', getVal(countryA, 'who_uhc_index'), getVal(countryB, 'who_uhc_index'), '')}
              {renderRow('Air Quality (PM2.5)', getVal(countryA, 'wb_air_quality'), getVal(countryB, 'wb_air_quality'), '', true)}
              {renderRow('Homicides (per 100k)', homicidesA, homicidesB, '', true)}
            </tbody>
          </table>
          </div>
        </div>

        {/* ═══════ DEMOGRAPHICS & SOCIETY ═══════ */}
        <div className="glass-panel rounded-3xl border border-white/20 dark:border-white/10 overflow-hidden shadow-lg h-fit">
          <div className="p-4 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2">
            <Users className="w-5 h-5 text-fuchsia-500" />
            <h3 className="font-bold uppercase tracking-wider">Demographics</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
            {renderTableHeader()}
            <tbody>
              {renderRow('Total Population', getVal(countryA, 'wb_population'), getVal(countryB, 'wb_population'), '')}
              {renderRow('Urban Population', getVal(countryA, 'wb_urban_population_pct'), getVal(countryB, 'wb_urban_population_pct'), '%')}
              {renderRow('Population 65+', getVal(countryA, 'wb_population_65plus_pct'), getVal(countryB, 'wb_population_65plus_pct'), '%', true)}
              {renderRow('Net Migration (5y)', getVal(countryA, 'wb_net_migration'), getVal(countryB, 'wb_net_migration'), '')}
              {renderRow('Internet Users', getVal(countryA, 'wb_internet_users_pct'), getVal(countryB, 'wb_internet_users_pct'), '%')}
              {renderRow('English (EF EPI)', getVal(countryA, 'ef_epi_english'), getVal(countryB, 'ef_epi_english'), '')}
            </tbody>
          </table>
          </div>
        </div>

        {/* ═══════ ECONOMIC FREEDOM (HERITAGE) ═══════ */}
        <div className="glass-panel rounded-3xl border border-white/20 dark:border-white/10 overflow-hidden shadow-lg h-fit">
          <div className="p-4 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2">
            <Scale className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold uppercase tracking-wider">Economic Freedom</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
            {renderTableHeader()}
            <tbody>
              {heritageList.map(h => renderRow(h.l, getVal(countryA, h.k), getVal(countryB, h.k), ''))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* ═══════ SIDE BY SIDE SECTIONS (CLIMATE & EXPATS) ═══════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {/* CLIMATE */}
        <div className="glass-panel p-8 rounded-3xl border border-white/20 dark:border-white/10 md:col-span-2">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Sun className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-bold tracking-tight">Month-by-Month Climate Profile</h2>
          </div>
          <ClimateChart 
            countryA={countryA.name} 
            countryB={countryB.name} 
            dataA={countryA.climate} 
            dataB={countryB.climate} 
          />
        </div>

        {/* EXPATS */}
        <div className="glass-panel p-8 rounded-3xl border border-white/20 dark:border-white/10 md:col-span-2">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <GraduationCap className="w-6 h-6 text-fuchsia-500" />
            <h2 className="text-2xl font-bold tracking-tight">Top Expat Origins</h2>
          </div>
          <div className="flex gap-4">
            {[ { c: countryA, color: 'text-blue-500' }, { c: countryB, color: 'text-emerald-500' } ].map((c, i) => (
              <div key={i} className="flex-1 text-center bg-black/5 dark:bg-white/5 rounded-2xl p-4">
                <h4 className={`font-black text-xl mb-4 ${c.color}`}>{c.c.name}</h4>
                {c.c.expats && c.c.expats.length > 0 ? (
                  <div className="space-y-3 text-left">
                    {c.c.expats.slice(0, 5).map((e: any, j: number) => (
                      <div key={j} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          {e.origin_alpha2 ? (
                            <Image src={`https://flagcdn.com/w20/${e.origin_alpha2.toLowerCase()}.png`} width={16} height={12} className="rounded-sm object-cover" alt={e.name} />
                          ) : <span className="text-xs">🏳️</span>}
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate w-24" title={e.name}>{e.name}</span>
                        </div>
                        <span className="text-xs font-mono text-slate-500">{formatNumber(e.count)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No expat data</p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
