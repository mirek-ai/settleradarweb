const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function importData() {
  const filePath = path.join(__dirname, '..', 'public', 'religions.json');
  if (!fs.existsSync(filePath)) {
    console.error("File religions.json not found!");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let inserted = 0;

  try {
    for (const item of data) {
      const country = item.country;
      for (const [religion, percentage] of Object.entries(item.religions)) {
        if (percentage > 0) {
          // Find country by matching name in app.countries
          const res = await pool.query(`
            SELECT iso_alpha3 FROM app.countries
            WHERE LOWER(name) = LOWER($1)
               OR LOWER(name) = LOWER($1 || ' (country)')
               OR (iso_alpha2 = 'KR' AND $1 = 'South Korea')
               OR (iso_alpha2 = 'CZ' AND $1 = 'Czech Republic')
          `, [country]);

          if (res.rows.length > 0) {
            const iso3 = res.rows[0].iso_alpha3;
            await pool.query(`
              INSERT INTO app.country_religions (country_iso3, religion_name, percentage, year)
              VALUES ($1, $2, $3, extract(year from current_date))
              ON CONFLICT (country_iso3, religion_name, year)
              DO UPDATE SET percentage = EXCLUDED.percentage;
            `, [iso3, religion, percentage]);
            inserted++;
          }
        }
      }
    }
    console.log(`Successfully inserted ${inserted} religion records into the database!`);
  } catch (err) {
    console.error("Error inserting data:", err);
  } finally {
    pool.end();
  }
}

importData();
