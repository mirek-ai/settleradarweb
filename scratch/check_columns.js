require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function run() {
  const c = new Client(process.env.DATABASE_URL);
  await c.connect();
  const res = await c.query("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'app' AND table_name IN ('climate_normals', 'country_politics')");
  console.table(res.rows);
  await c.end();
}
run();
