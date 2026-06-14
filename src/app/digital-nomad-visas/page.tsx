import db from '@/data/database.json';
import DigitalNomadClient from './DigitalNomadClient';

import { getSortedPostsData } from '@/lib/posts';

export const metadata = {
  title: 'Digital Nomad Visas 2026: The Complete Country List | SettleRadar',
  description: 'A comprehensive list of countries offering Digital Nomad Visas or remote work permits in 2026. Compare tax rates, cost of living, and visa requirements.',
};

export default function DigitalNomadVisasHub() {
  const nomadCountries = db.countries
    .filter(c => Object.keys(c.indicators || {}).length > 10 && c.is_territory !== true)
    .filter(c => c.nomad_visa?.available)
    .sort((a, b) => a.name.localeCompare(b.name));

  const allPosts = getSortedPostsData();
  const visaGuides = allPosts.filter(p => p.title.toLowerCase().includes('nomad visa') || p.title.toLowerCase().includes('nomad-visa'));
  const guideMap: Record<string, string> = {};
  visaGuides.forEach(p => {
    if (p.country) {
      guideMap[p.country.toLowerCase().replace(/\s+/g, '-')] = p.slug;
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
      <DigitalNomadClient nomadCountries={nomadCountries} guideMap={guideMap} />
    </div>
  );
}
