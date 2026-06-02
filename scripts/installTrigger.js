require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    // 1. Check for dirty data in app.countries
    console.log('Checking for duplicates/bad data in app.countries...');
    const badCountries = await client.query(`
      SELECT iso_alpha3, name FROM app.countries 
      WHERE name ILIKE '%Czech%' OR name ILIKE '%Poland%' OR name ILIKE '%Polonia%'
    `);
    console.log('Found countries:', badCountries.rows);

    // 2. Alter the column to allow n8n to send long names
    console.log('Altering app.country_indicators column to VARCHAR(255)...');
    await client.query(`
      ALTER TABLE app.country_indicators 
      ALTER COLUMN country_iso3 TYPE VARCHAR(255);
    `);

    // 3. Create the Trigger Function
    console.log('Installing PL/pgSQL translation function...');
    await client.query(`
      CREATE OR REPLACE FUNCTION app.resolve_country_alias()
      RETURNS TRIGGER AS $$
      DECLARE
          resolved_iso VARCHAR(3);
      BEGIN
          -- If the incoming value is already a 3-letter code, just pass it through
          IF length(NEW.country_iso3) = 3 THEN
              RETURN NEW;
          END IF;

          -- Try to look up the alias in the dictionary
          SELECT iso_alpha3 INTO resolved_iso
          FROM app.country_aliases
          WHERE alias_name ILIKE NEW.country_iso3
          LIMIT 1;

          -- If found, rewrite the NEW record's iso3 column before insertion
          IF resolved_iso IS NOT NULL THEN
              NEW.country_iso3 := resolved_iso;
          END IF;

          -- Return the modified record. If not found, it keeps the long name
          -- which will then intentionally fail the Foreign Key constraint.
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 4. Attach the Trigger
    console.log('Attaching trigger to app.country_indicators...');
    await client.query(`
      DROP TRIGGER IF EXISTS trg_resolve_alias ON app.country_indicators;
      CREATE TRIGGER trg_resolve_alias
      BEFORE INSERT OR UPDATE ON app.country_indicators
      FOR EACH ROW
      EXECUTE FUNCTION app.resolve_country_alias();
    `);

    // 5. Test it!
    console.log('Testing trigger: Inserting dummy metric using "Czech Republic"...');
    try {
      await client.query(`
        INSERT INTO app.country_indicators (country_iso3, indicator_code, year, value, source)
        VALUES ('Czech Republic', 'TEST_METRIC', 2026, 99.9, 'System Test')
        ON CONFLICT (country_iso3, indicator_code, year) DO UPDATE SET value = EXCLUDED.value;
      `);
      console.log('SUCCESS! The insert passed.');
      
      const check = await client.query(`SELECT * FROM app.country_indicators WHERE indicator_code = 'TEST_METRIC'`);
      console.log('Resulting record in DB:', check.rows[0]);

      // Cleanup
      await client.query(`DELETE FROM app.country_indicators WHERE indicator_code = 'TEST_METRIC'`);
    } catch (e) {
      console.error('Test Failed:', e.message);
    }

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
    console.log('Disconnected.');
  }
}

run();
