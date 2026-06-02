const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function createTable() {
  const client = new Client(process.env.DATABASE_URL);
  try {
    await client.connect();
    
    // Tworzenie tabeli
    await client.query(`
      CREATE TABLE IF NOT EXISTS app.country_tech_nomad (
        country_name VARCHAR(255) PRIMARY KEY,
        has_nomad_visa BOOLEAN,
        visa_url TEXT,
        internet_speed_mbps NUMERIC,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Tabela app.country_tech_nomad utworzona!');
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

createTable();
