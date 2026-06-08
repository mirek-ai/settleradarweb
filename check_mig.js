const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: 'postgresql://settleradar_user:7sjuI0olTrJspQSA8kl2@100.75.197.13:5432/settleradar' });
  await client.connect();

  const res = await client.query("SELECT year, value FROM app.country_indicators WHERE indicator_code = 'wb_net_migration' AND country_iso3 = 'UKR' ORDER BY year DESC LIMIT 5");
  console.log('UKR Net Migration:', res.rows);

  const resPol = await client.query("SELECT year, value FROM app.country_indicators WHERE indicator_code = 'wb_net_migration' AND country_iso3 = 'POL' ORDER BY year DESC LIMIT 5");
  console.log('POL Net Migration:', resPol.rows);

  await client.end();
}

run().catch(console.error);
