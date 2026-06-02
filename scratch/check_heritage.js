const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
const c = new Client(process.env.DATABASE_URL);
c.connect().then(() => c.query("SELECT COUNT(*) FROM app.country_indicators WHERE indicator_code LIKE 'heritage_%'")).then(res => { console.log("Heritage count in DB:", res.rows[0].count); return c.query("SELECT * FROM app.country_indicators WHERE country_iso3 = 'SWE' AND indicator_code LIKE 'heritage_%'"); }).then(res => { console.log("Heritage for SWE:", res.rows); c.end(); });
