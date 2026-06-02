const fs = require('fs');
const { Client } = require('pg');
const csv = require('csv-parser');
require('dotenv').config({ path: '.env.local' });
const path = require('path');

async function importHeritage() {
  const c = new Client(process.env.DATABASE_URL);
  await c.connect();

  const mapping = {
    'Overall Score': 'heritage_economic_freedom',
    'Property Rights': 'heritage_property_rights',
    'Judicial Effectiveness': 'heritage_judicial_effectiveness',
    'Government Integrity': 'heritage_government_integrity',
    'Tax Burden': 'heritage_tax_burden',
    'Government Spending': 'heritage_government_spending',
    'Fiscal Health': 'heritage_fiscal_health',
    'Business Freedom': 'heritage_business_freedom',
    'Labor Freedom': 'heritage_labor_freedom',
    'Monetary Freedom': 'heritage_monetary_freedom',
    'Trade Freedom': 'heritage_trade_freedom',
    'Investment Freedom': 'heritage_investment_freedom',
    'Financial Freedom': 'heritage_financial_freedom'
  };

  // We let the PostgreSQL trigger handle the alias mapping automatically
  const csvPath = 'C:/Users/miros/Downloads/heritage-index-of-economic-freedom-2026-05-31_2116.csv';
  const data = fs.readFileSync(csvPath, 'utf8');
  const lines = data.split('\n');
  const headerIdx = lines.findIndex(l => l.includes('Overall Score'));
  const actualData = lines.slice(Math.max(0, headerIdx)).join('\n');
  
  let inserted = 0;
  let skipped = 0;

  const headers = actualData.split('\n')[0].split(',').map(h => h.trim());
  const rows = actualData.split('\n').slice(1);
  const promises = [];

  for (const line of rows) {
    if (!line.trim()) continue;
    
    // We can't just split by ',' because there might be quotes. But Heritage CSV usually doesn't have quotes for numbers.
    // Actually, Country names might have commas. Let's use a regex to split by commas outside quotes.
    const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
    if (cols.length < 5) continue;
    
    const row = {};
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = cols[i];
    }

    promises.push((async () => {
      let countryName = row['Name'] || row['Country'] || cols[0];
      if (countryName) countryName = countryName.trim();
      const year = row['Index Year'] || 2026;
      
      for (const [csvCol, dbKey] of Object.entries(mapping)) {
        let val = row[csvCol];
        if (val && val !== 'N/A') {
          val = parseFloat(val);
          if (!isNaN(val)) {
            try {
              inserted++;
              await c.query(`
                INSERT INTO app.country_indicators (country_iso3, indicator_code, year, value, source)
                VALUES ($1, $2, $3, $4, 'Heritage Foundation')
                ON CONFLICT (country_iso3, indicator_code, year) DO UPDATE SET value = EXCLUDED.value
              `, [countryName, dbKey, year, val]);
            } catch (err) {
              // The trigger will reject unmapped aliases via foreign key constraint
            }
          }
        }
      }
    })());
  }

  await Promise.all(promises);
  console.log(`Zakończono import! Dodano/zaktualizowano ${inserted} wskaźników. Pominięto ${skipped} krajów.`);
  await c.end();
}

importHeritage().catch(console.error);
