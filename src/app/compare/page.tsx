import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import CompareClient from './CompareClient';

export const metadata: Metadata = {
  title: 'Compare Countries | SettleRadar',
  description: 'Select and compare any two countries across economic, social, and demographic indicators.',
};

export default async function CompareSelectionPage() {
  const dbPath = path.join(process.cwd(), 'src', 'data', 'database.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  const countries = db.countries
    .filter((c: any) => c.is_active !== false)
    .map((c: any) => ({
      name: c.name,
      slug: c.slug,
      emoji: c.flag_emoji || '🏳️',
    }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name));

  return (
    <main className="container mx-auto px-4 py-8 relative">
      <CompareClient countries={countries} />
    </main>
  );
}
