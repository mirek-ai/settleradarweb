const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const file = 'C:/Users/miros/Downloads/02 - World Bank Master Pipeline (GDP, Unemp, Pop, Gender, Internet, Migr, Urban, 65plus).json';
const json = JSON.parse(fs.readFileSync(file, 'utf8'));

const httpUnemp = json.nodes.find(n => n.name === 'HTTP Request1');
if (httpUnemp && httpUnemp.parameters.url.includes('NY.GDP.PCAP.PP.CD')) {
    httpUnemp.parameters.url = 'https://api.worldbank.org/v2/country/all/indicator/SL.UEM.TOTL.ZS?format=json&per_page=10000&date=2000:2099';
}

fs.writeFileSync(file, JSON.stringify(json, null, 2));
console.log('Fixed Unemployment URL in Master Pipeline JSON.');

async function fixDb() {
  const c = new Client(process.env.DATABASE_URL);
  await c.connect();
  console.log('Deleting corrupted Unemployment records...');
  await c.query(`DELETE FROM app.country_indicators WHERE indicator_code = 'wb_unemployment' AND source = 'World Bank'`);
  
  // Re-fetch correct unemployment data
  console.log('Re-fetching Unemployment...');
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const res = await fetch(`https://api.worldbank.org/v2/country/all/indicator/SL.UEM.TOTL.ZS?format=json&per_page=1000&page=${page}&date=2000:2024`);
    const data = await res.json();
    if (!data || data.length < 2) break;
    totalPages = data[0].pages;
    const items = data[1];

    for (const item of items) {
      if (item.value !== null && item.countryiso3code) {
        await c.query(`
          INSERT INTO app.country_indicators (country_iso3, indicator_code, year, value, source)
          SELECT $1, 'wb_unemployment', $2, $3, 'World Bank API'
          WHERE EXISTS (SELECT 1 FROM app.countries WHERE iso_alpha3 = $1)
          ON CONFLICT (country_iso3, indicator_code, year) DO UPDATE SET value = EXCLUDED.value
        `, [item.countryiso3code, parseInt(item.date), item.value]);
      }
    }
    console.log(`Unemployment page ${page}/${totalPages} inserted.`);
    page++;
  }

  await c.end();
  console.log('Database fix complete.');
}

fixDb();
