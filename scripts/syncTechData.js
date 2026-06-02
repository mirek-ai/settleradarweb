const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Reliable list of countries with Digital Nomad Visas (or equivalent remote work permits)
const nomadCountries = [
  "Anguilla", "Antigua and Barbuda", "Argentina", "Bahamas", "Barbados", "Belize", "Bermuda", 
  "Brazil", "Cape Verde", "Cayman Islands", "Colombia", "Costa Rica", "Croatia", "Curaçao", 
  "Cyprus", "Czech Republic", "Dominica", "Ecuador", "Estonia", "Georgia", "Greece", "Grenada", 
  "Hungary", "Iceland", "Indonesia", "Italy", "Latvia", "Malaysia", "Malta", "Mauritius", 
  "Mexico", "Montenegro", "Montserrat", "Namibia", "North Macedonia", "Norway", "Panama", 
  "Portugal", "Romania", "Saint Lucia", "Seychelles", "South Africa", "Spain", "Sri Lanka", 
  "Taiwan", "Thailand", "United Arab Emirates", "Uruguay"
];

async function syncData() {
  const client = new Client(process.env.DATABASE_URL);
  
  try {
    await client.connect();
    console.log('1. Aktualizacja tabeli Postgres...');
    
    for (const country of nomadCountries) {
      await client.query(`
        INSERT INTO app.country_tech_nomad (country_name, has_nomad_visa, visa_url, internet_speed_mbps)
        VALUES ($1, true, $2, 0)
        ON CONFLICT (country_name) DO UPDATE 
        SET has_nomad_visa = EXCLUDED.has_nomad_visa, visa_url = EXCLUDED.visa_url
      `, [country, `https://en.wikipedia.org/wiki/Digital_nomad_visa#${country.replace(/ /g, '_')}`]);
    }
    
    console.log(`Wstawiono/zaktualizowano ${nomadCountries.length} krajów w Postgresie.`);

    console.log('2. Aktualizacja pliku database.json...');
    const dbPath = path.join(__dirname, '..', 'src', 'data', 'database.json');
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    let updatedCount = 0;
    
    // Wstrzykujemy dane z Postgresa do JSON-a
    const res = await client.query('SELECT * FROM app.country_tech_nomad WHERE has_nomad_visa = true');
    const visaMap = new Map();
    res.rows.forEach(r => visaMap.set(r.country_name.toLowerCase(), r));

    db.countries = db.countries.map(c => {
      // Szukamy dopasowania (np. "Czech Republic" == "Czechia")
      const nameLower = c.name.toLowerCase();
      let match = visaMap.get(nameLower);
      
      // Proste aliasy
      if (!match && nameLower === 'czechia') match = visaMap.get('czech republic');
      if (!match && nameLower === 'united arab emirates') match = visaMap.get('united arab emirates');
      
      if (match) {
        updatedCount++;
        return {
          ...c,
          nomad_visa: {
            available: true,
            url: match.visa_url,
            description: `This country offers a dedicated Digital Nomad Visa or equivalent remote work permit.`
          }
        };
      }
      return c;
    });

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log(`Zaktualizowano database.json (${updatedCount} państw otrzymało status wizy).`);
    
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

syncData();
