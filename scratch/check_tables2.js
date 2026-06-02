require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function run() {
  const c = new Client(process.env.DATABASE_URL);
  await c.connect();
  const res1 = await c.query("SELECT COUNT(*) FROM app.climate_normals");
  console.log("climate_normals count:", res1.rows[0].count);
  const res2 = await c.query("SELECT COUNT(*) FROM app.country_politics");
  console.log("country_politics count:", res2.rows[0].count);
  await c.end();
}
run();
