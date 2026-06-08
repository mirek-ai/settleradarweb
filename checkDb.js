const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://settleradar_user:7sjuI0olTrJspQSA8kl2@100.75.197.13:5432/settleradar' });
client.connect()
  .then(() => client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='app' AND table_name='country_tech_nomad'"))
  .then(res => { console.table(res.rows); client.end(); })
  .catch(err => { console.error(err); client.end(); });
