const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const c = new Client(process.env.DATABASE_URL);
  await c.connect();

  console.log("1. Czyszczenie uszkodzonych danych z bazy...");
  await c.query("DELETE FROM app.country_indicators WHERE indicator_code IN ('wb_population', 'wb_unemployment')");

  console.log("2. Pobieranie świeżych danych o populacji z Banku Światowego...");
  
  // Pobierz prawidłowe kody iso3
  const validRes = await c.query("SELECT iso_alpha3 FROM app.countries");
  const validIso3s = new Set(validRes.rows.map(r => r.iso_alpha3));

  const popRes = await fetch("http://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&per_page=5000");
  const popData = await popRes.json();
  const popItems = popData[1];
  
  const latestPopulations = {};

  if (popItems) {
    for (const item of popItems) {
      if (item.value !== null && item.countryiso3code && validIso3s.has(item.countryiso3code) && parseInt(item.date) >= 2000) {
        // Zapis do Postgresa (dla porządku)
        await c.query(`
          INSERT INTO app.country_indicators (country_iso3, indicator_code, year, value, source)
          VALUES ($1, 'wb_population', $2, $3, 'World Bank')
          ON CONFLICT (country_iso3, indicator_code, year) DO UPDATE SET value = EXCLUDED.value
        `, [item.countryiso3code, item.date, item.value]);

        // Trzymamy najnowszy rok w pamięci dla database.json
        if (!latestPopulations[item.countryiso3code] || latestPopulations[item.countryiso3code].year < item.date) {
            latestPopulations[item.countryiso3code] = {
                value: item.value,
                year: item.date,
                source: 'World Bank'
            };
        }
      }
    }
  }

  console.log("3. Bezpieczna aktualizacja database.json (z zachowaniem klimatu i wiz)...");
  const dbPath = path.join(__dirname, '..', 'src', 'data', 'database.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  db.countries = db.countries.map(country => {
    // Usunięcie fałszywego wb_unemployment
    if (country.indicators.wb_unemployment) {
        delete country.indicators.wb_unemployment;
    }
    
    // Zastąpienie populacji prawidłowymi danymi z pamięci (dopasowanie po id - iso3)
    if (latestPopulations[country.id]) {
        country.indicators.wb_population = latestPopulations[country.id];
    }
    
    return country;
  });

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log("Zakończono! Populacja w bazie naprawiona.");

  await c.end();
}

run().catch(console.error);
