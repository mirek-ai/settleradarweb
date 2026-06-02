require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function run() {
  const c = new Client(process.env.DATABASE_URL);
  await c.connect();
  const res = await c.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'app'");
  console.table(res.rows);
  await c.end();
}
run();
