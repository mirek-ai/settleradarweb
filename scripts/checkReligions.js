const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function verify() {
  const client = new Client(process.env.DATABASE_URL);
  await client.connect();

  try {
    const resCount = await client.query('SELECT COUNT(*) FROM app.country_religions');
    console.log(`Total rows in country_religions: ${resCount.rows[0].count}`);

    const resPol = await client.query(`
      SELECT r.religion_name, r.percentage 
      FROM app.country_religions r
      WHERE r.country_iso3 = 'POL'
      ORDER BY r.percentage DESC
    `);
    
    console.log('\nReligions in Poland (POL):');
    console.table(resPol.rows);

  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
verify();
