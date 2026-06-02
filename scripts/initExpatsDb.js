const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/settleradar' });

async function init() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app.country_expats (
        destination_iso3 VARCHAR(3) NOT NULL,
        origin_iso3 VARCHAR(3) NOT NULL,
        migrant_count INTEGER NOT NULL,
        year INTEGER NOT NULL,
        PRIMARY KEY (destination_iso3, origin_iso3, year),
        FOREIGN KEY (destination_iso3) REFERENCES app.countries(iso_alpha3) ON DELETE CASCADE
      );
    `);
    console.log("Tabela app.country_expats została poprawnie utworzona!");
  } catch (error) {
    console.error("Błąd podczas tworzenia tabeli:", error);
  } finally {
    process.exit(0);
  }
}

init();
