import db from '@/data/database.json';
import DigitalNomadClient from './DigitalNomadClient';

export const metadata = {
  title: 'Digital Nomad Visas 2026: The Complete Country List | SettleRadar',
  description: 'A comprehensive list of countries offering Digital Nomad Visas or remote work permits in 2026. Compare tax rates, cost of living, and visa requirements.',
};

export default function DigitalNomadVisasHub() {
  const nomadCountries = db.countries
    .filter(c => Object.keys(c.indicators || {}).length > 10 && !c.is_territory)
    .filter(c => c.nomad_visa?.available)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
      <DigitalNomadClient nomadCountries={nomadCountries} />
    </div>
  );
}
