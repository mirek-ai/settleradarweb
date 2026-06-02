const { Client } = require('pg');
const fs = require('fs');
const csv = require('csv-parser');
const stringSimilarity = require('string-similarity');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const c = new Client(process.env.DATABASE_URL);
  await c.connect();
  console.log("Connected to DB. Starting Data Patch...");

  // Get all countries
  const res = await c.query("SELECT iso_alpha3, name FROM app.countries");
  const countries = res.rows;
  const countryNames = countries.map(c => c.name);

  // 1. World Bank API: GDP PPP
  console.log("Fetching World Bank GDP...");
  const gdpRes = await fetch("http://api.worldbank.org/v2/country/all/indicator/NY.GDP.PCAP.PP.CD?format=json&per_page=1000");
  const gdpData = await gdpRes.json();
  const gdpItems = gdpData[1]; 
  
  if (gdpItems) {
    for (const item of gdpItems) {
      if (item.value !== null && item.countryiso3code) {
        await c.query(`
          INSERT INTO app.country_indicators (country_iso3, indicator_code, year, value, source)
          VALUES ($1, 'wb_gdp_pc_ppp', $2, $3, 'World Bank')
          ON CONFLICT (country_iso3, indicator_code, year) DO NOTHING
        `, [item.countryiso3code, item.date, item.value]);
      }
    }
  }

  // 2. World Bank API: Population
  console.log("Fetching World Bank Population...");
  const popRes = await fetch("http://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&per_page=1000");
  const popData = await popRes.json();
  const popItems = popData[1];
  
  if (popItems) {
    for (const item of popItems) {
      if (item.value !== null && item.countryiso3code) {
        await c.query(`
          INSERT INTO app.country_indicators (country_iso3, indicator_code, year, value, source)
          VALUES ($1, 'wb_population', $2, $3, 'World Bank')
          ON CONFLICT (country_iso3, indicator_code, year) DO NOTHING
        `, [item.countryiso3code, item.date, item.value]);
      }
    }
  }

  // 3. Heritage CSV
  console.log("Parsing Heritage CSV...");
  const csvPath = 'C:/Users/miros/Downloads/heritage-index-of-economic-freedom-2026-05-31_2116.csv';
  const csvData = fs.readFileSync(csvPath, 'utf-8');
  // Skip first 4 lines
  const lines = csvData.split(/\r?\n/).slice(4).join('\n');

  const stream = require('stream');
  const bufferStream = new stream.PassThrough();
  bufferStream.end(lines);
  
  let matchCount = 0;
  let failCount = 0;

  bufferStream.pipe(csv())
    .on('data', async (row) => {
      const countryName = row['Country'];
      const score = row['Overall Score'];
      const year = row['Index Year'] || 2026;
      
      if (score && score !== 'N/A' && countryName) {
         const match = stringSimilarity.findBestMatch(countryName, countryNames);
         if (match.bestMatch.rating > 0.6) {
            const matchedCountryName = match.bestMatch.target;
            const iso3 = countries.find(c => c.name === matchedCountryName).iso_alpha3;
            
            // Wait for query to finish to avoid maxing out pool
            await c.query(`
              INSERT INTO app.country_indicators (country_iso3, indicator_code, year, value, source)
              VALUES ($1, 'heritage_economic_freedom', $2, $3, 'Heritage Foundation')
              ON CONFLICT (country_iso3, indicator_code, year) DO NOTHING
            `, [iso3, year, score]);
            matchCount++;
         } else {
            failCount++;
         }
      }
    })
    .on('end', async () => {
      // Allow async queries to finish
      setTimeout(async () => {
        console.log(`Heritage parsed. Matched: ${matchCount}, Failed: ${failCount}`);
        await c.end();
        console.log("✅ Database patched successfully!");
      }, 5000);
    });
}

run().catch(console.error);
