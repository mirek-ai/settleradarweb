const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function fix() {
  const c = new Client(process.env.DATABASE_URL);
  await c.connect();
  
  const validRes = await c.query("SELECT iso_alpha3 FROM app.countries");
  const validIso3s = new Set(validRes.rows.map(r => r.iso_alpha3));

  console.log("Pobieranie dokładnych danych o populacji (lata 2020-2024)...");
  const res = await fetch("http://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&per_page=5000&date=2020:2024");
  const data = await res.json();
  const items = data[1];

  let inserted = 0;
  if (items) {
    for (const item of items) {
      if (item.value !== null && item.countryiso3code && validIso3s.has(item.countryiso3code)) {
        await c.query(`
          INSERT INTO app.country_indicators (country_iso3, indicator_code, year, value, source)
          VALUES ($1, 'wb_population', $2, $3, 'World Bank')
          ON CONFLICT (country_iso3, indicator_code, year) DO UPDATE SET value = EXCLUDED.value
        `, [item.countryiso3code, item.date, item.value]);
        inserted++;
      }
    }
  }
  
  await c.end();
  console.log(`Pomyślnie zaktualizowano populację! Wstawiono/zaktualizowano ${inserted} rekordów.`);
}

fix().catch(console.error);
