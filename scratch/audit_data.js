const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const c = new Client(process.env.DATABASE_URL);
  await c.connect();

  console.log("--- 1. OVERALL COVERAGE BY INDICATOR ---");
  const res1 = await c.query(`
    SELECT source, indicator_code, COUNT(DISTINCT country_iso3) as countries_count, COUNT(*) as total_rows, MIN(year) as min_year, MAX(year) as max_year
    FROM app.country_indicators
    GROUP BY source, indicator_code
    ORDER BY source, indicator_code
  `);
  console.table(res1.rows);

  console.log("\\n--- 2. MISSING DATA FOR POLAND AND IRELAND ---");
  const res2 = await c.query(`
    SELECT source, indicator_code, 
      SUM(CASE WHEN country_iso3 = 'POL' THEN 1 ELSE 0 END) as pol_count,
      SUM(CASE WHEN country_iso3 = 'IRL' THEN 1 ELSE 0 END) as irl_count
    FROM app.country_indicators
    GROUP BY source, indicator_code
    ORDER BY source, indicator_code
  `);
  console.table(res2.rows);

  console.log("\\n--- 3. COUNTRIES WITH ZERO DATA FOR SPECIFIC SOURCES ---");
  // Which countries are missing entirely from World Bank?
  const res3 = await c.query(`
    SELECT c.iso_alpha3, c.name
    FROM app.countries c
    LEFT JOIN app.country_indicators ci ON c.iso_alpha3 = ci.country_iso3 AND ci.source = 'World Bank'
    WHERE ci.id IS NULL
    LIMIT 10
  `);
  console.log("Missing World Bank Data (sample):", res3.rows);

  await c.end();
}
run();
