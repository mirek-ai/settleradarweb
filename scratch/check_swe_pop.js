const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
const c = new Client(process.env.DATABASE_URL);
c.connect().then(() => c.query("SELECT * FROM app.country_indicators WHERE country_iso3 = 'SWE' AND indicator_code = 'wb_population' ORDER BY year DESC LIMIT 5"))
.then(res => { console.log(res.rows); c.end(); });
