const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
async function check() {
  const c = new Client(process.env.DATABASE_URL);
  await c.connect();
  
  console.log('--- DATA INTEGRITY CHECK ---');
  
  // 1. Check for NULL values
  const nullCheck = await c.query(`SELECT count(*) FROM app.country_indicators WHERE value IS NULL`);
  console.log('Records with NULL value:', nullCheck.rows[0].count);

  // 2. Check indicators summary (count, min year, max year, average value)
  const stats = await c.query(`
    SELECT indicator_code, count(*) as total_records, min(year) as min_year, max(year) as max_year, round(avg(value)::numeric, 2) as avg_value
    FROM app.country_indicators 
    GROUP BY indicator_code
    ORDER BY indicator_code
  `);
  console.table(stats.rows);

  // 3. Check if any countries have NO indicators
  const noData = await c.query(`
    SELECT count(*) FROM app.countries c 
    LEFT JOIN app.country_indicators ci ON c.iso_alpha3 = ci.country_iso3 
    WHERE ci.id IS NULL AND c.is_active = true
  `);
  console.log('Active countries with 0 indicators:', noData.rows[0].count);

  await c.end();
}
check();
