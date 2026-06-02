require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const ALIASES = [
  // Czechia
  { alias: 'Czech Republic', iso3: 'CZE' },
  { alias: 'Czech Rep.', iso3: 'CZE' },
  // USA
  { alias: 'USA', iso3: 'USA' },
  { alias: 'United States', iso3: 'USA' },
  { alias: 'US', iso3: 'USA' },
  { alias: 'United States of America', iso3: 'USA' },
  // UK
  { alias: 'UK', iso3: 'GBR' },
  { alias: 'United Kingdom', iso3: 'GBR' },
  { alias: 'Great Britain', iso3: 'GBR' },
  // South Korea
  { alias: 'South Korea', iso3: 'KOR' },
  { alias: 'Korea, Rep.', iso3: 'KOR' },
  { alias: 'Republic of Korea', iso3: 'KOR' },
  // UAE
  { alias: 'UAE', iso3: 'ARE' },
  { alias: 'United Arab Emirates', iso3: 'ARE' },
  // Turkey
  { alias: 'Turkey', iso3: 'TUR' },
  { alias: 'Turkiye', iso3: 'TUR' },
  { alias: 'Türkiye', iso3: 'TUR' },
  // Russia
  { alias: 'Russia', iso3: 'RUS' },
  { alias: 'Russian Federation', iso3: 'RUS' },
  // Slovakia
  { alias: 'Slovak Republic', iso3: 'SVK' },
  { alias: 'Slovakia', iso3: 'SVK' },
  // Netherlands
  { alias: 'Holland', iso3: 'NLD' },
  // China
  { alias: "People's Republic of China", iso3: 'CHN' },
  // Taiwan
  { alias: 'Taiwan, Province of China', iso3: 'TWN' },
  { alias: 'Taiwan', iso3: 'TWN' }
];

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    // 1. Create table
    await client.query(`
      CREATE TABLE IF NOT EXISTS app.country_aliases (
        alias_name VARCHAR(255) PRIMARY KEY,
        iso_alpha3 VARCHAR(3) NOT NULL REFERENCES app.countries(iso_alpha3) ON DELETE CASCADE
      );
    `);
    console.log('Table app.country_aliases is ready.');

    // 2. Populate self-names (so "Poland" -> "POL" works out of the box)
    console.log('Inserting native names from app.countries...');
    const countries = await client.query('SELECT iso_alpha3, name FROM app.countries');
    let nativeCount = 0;
    for (const c of countries.rows) {
      try {
        await client.query(`
          INSERT INTO app.country_aliases (alias_name, iso_alpha3)
          VALUES ($1, $2)
          ON CONFLICT (alias_name) DO NOTHING
        `, [c.name, c.iso_alpha3]);
        nativeCount++;
      } catch (e) {
        console.warn(`Failed to insert native name ${c.name}: ${e.message}`);
      }
    }
    console.log(`Inserted ${nativeCount} native names.`);

    // 3. Populate hardcoded custom aliases
    console.log('Inserting hardcoded aliases...');
    let customCount = 0;
    for (const item of ALIASES) {
      try {
        await client.query(`
          INSERT INTO app.country_aliases (alias_name, iso_alpha3)
          VALUES ($1, $2)
          ON CONFLICT (alias_name) DO UPDATE SET iso_alpha3 = EXCLUDED.iso_alpha3
        `, [item.alias, item.iso3]);
        customCount++;
      } catch (e) {
        console.warn(`Failed to insert alias ${item.alias} for ${item.iso3}: ${e.message}`);
      }
    }
    console.log(`Inserted/Updated ${customCount} custom aliases.`);

    // 4. Verify Czechia
    const verify = await client.query(`SELECT iso_alpha3 FROM app.country_aliases WHERE alias_name ILIKE 'Czech Republic'`);
    console.log(`Verification - "Czech Republic" resolves to: ${verify.rows[0]?.iso_alpha3}`);

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
    console.log('Disconnected.');
  }
}

run();
