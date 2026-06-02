const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function init() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app.country_religions (
        id SERIAL PRIMARY KEY,
        country_iso3 VARCHAR(3) NOT NULL,
        religion_name VARCHAR(100) NOT NULL,
        percentage NUMERIC(5,2) NOT NULL,
        year INT NOT NULL,
        UNIQUE(country_iso3, religion_name, year)
      );
    `);
    console.log("Table app.country_religions created successfully!");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

init();
