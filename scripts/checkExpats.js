const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function verify() {
  const client = new Client(process.env.DATABASE_URL);
  await client.connect();

  try {
    const resCount = await client.query('SELECT COUNT(*) FROM app.country_expats');
    console.log(`Total rows in country_expats: ${resCount.rows[0].count}`);

    const resPol = await client.query(`
      SELECT e.destination_iso3, e.origin_iso3, e.migrant_count, c.name as origin_name 
      FROM app.country_expats e
      JOIN app.countries c ON e.origin_iso3 = c.iso_alpha3
      WHERE e.destination_iso3 = 'POL'
      ORDER BY e.migrant_count DESC
    `);
    
    console.log('\nTop expats in Poland (POL):');
    console.table(resPol.rows);

  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
verify();
