require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function test() {
  const client = new Client(process.env.DATABASE_URL);
  await client.connect();
  
  const res = await client.query("SELECT * FROM app.country_indicators WHERE source = 'World Happiness Report' LIMIT 5");
  console.log('Happiness records:');
  console.table(res.rows);
  await client.end();
}
test();
