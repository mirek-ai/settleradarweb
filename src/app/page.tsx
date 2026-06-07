import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'SettleRadar | The Ultimate Hub for Expats & Nomads',
  description: 'Compare taxes, safety, and economic freedom across the world. Find your perfect destination to live, work, and invest.',
};

export default async function Home() {
  const dbPath = path.join(process.cwd(), 'src', 'data', 'database.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  // Pre-filter valid countries and map to a lightweight object to avoid sending the massive 1.5MB JSON to the client!
  const baseCountries = db.countries
    .filter((country: any) => Object.keys(country.indicators || {}).length > 10 && !country.is_territory)
    .map((country: any) => ({
      id: country.id,
      iso_alpha2: country.iso_alpha2,
      name: country.name,
      slug: country.slug,
      region: country.region,
      flag_emoji: country.flag_emoji,
      nomad_visa: country.nomad_visa,
      indicators: {
        wb_taxes: country.indicators?.wb_taxes,
        wb_inflation: country.indicators?.wb_inflation,
        heritage_economic_freedom: country.indicators?.heritage_economic_freedom,
        whr_happiness_index: country.indicators?.whr_happiness_index,
        wb_homicides: country.indicators?.wb_homicides,
        wb_air_quality: country.indicators?.wb_air_quality,
      }
    }));

  const totalValidCountries = baseCountries.length;

  return (
    <HomeClient 
      baseCountries={baseCountries} 
      totalValidCountries={totalValidCountries} 
    />
  );
}
