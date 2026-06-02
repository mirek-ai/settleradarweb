const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
const c = new Client(process.env.DATABASE_URL);
c.connect().then(() => c.query("SELECT indicator_code, value FROM app.country_indicators WHERE country_iso3 = 'SWE'"))
.then(res => { console.log(res.rows); c.end(); });
