const { Client } = require('pg');
require('dotenv').config({path: '.env.local'});
const client = new Client(process.env.DATABASE_URL);
client.connect().then(() => client.query("SELECT * FROM app.climate_normals WHERE country_iso3 = 'POL' ORDER BY month"))
  .then(res => console.log(res.rows))
  .catch(console.error).finally(() => client.end());
