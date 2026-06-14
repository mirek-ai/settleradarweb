import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import NomadVisaClient from './NomadVisaClient';

export const metadata: Metadata = {
  title: 'Digital Nomad Visa Countries 2026 | SettleRadar',
  description: 'A complete list of countries offering Digital Nomad Visas and remote work permits. Compare taxes, safety, and economic freedom for your next relocation destination.',
};

export default async function NomadVisasPage() {
  const dbPath = path.join(process.cwd(), 'src', 'data', 'database.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  const { getSortedPostsData } = require('@/lib/posts');
  const allPosts = getSortedPostsData();
  const visaGuides = allPosts.filter((p: any) => p.tags?.includes('nomad-visa-guide') || (p.title.toLowerCase().includes('nomad visa') && !p.slug.includes('expat-field-guide')));
  const guideMap: Record<string, string> = {};
  visaGuides.forEach((p: any) => {
    if (p.country) {
      guideMap[p.country.toLowerCase().replace(/\s+/g, '-')] = p.slug;
    }
  });
  // Pre-filter valid countries that have a nomad visa defined
  const nomadCountries = db.countries
    .filter((country: any) => !!country.nomad_visa)
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

  return (
    <NomadVisaClient 
      countries={nomadCountries} 
      guideMap={guideMap}
    />
  );
}
