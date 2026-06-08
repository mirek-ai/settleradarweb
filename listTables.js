const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://settleradar_user:7sjuI0olTrJspQSA8kl2@100.75.197.13:5432/settleradar' });
client.connect()
  .then(() => client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='app'"))
  .then(res => { console.table(res.rows); client.end(); })
  .catch(err => { console.error(err); client.end(); });
