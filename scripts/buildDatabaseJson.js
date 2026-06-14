const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function buildDatabaseJson() {
  console.log('Rozpoczynam bezpieczną synchronizację danych z bazy Postgres (SSG Merge)...');
  
  if (!process.env.DATABASE_URL) {
    console.error('BŁĄD: Brak zmiennej DATABASE_URL w .env.local');
    process.exit(1);
  }

  const client = new Client(process.env.DATABASE_URL);
  
  try {
    await client.connect();

    // 0. Zastąpienie zewnętrznego API twardą listą terytoriów (API REST Countries zostało wyłączone)
    console.log('Ładowanie lokalnej mapy terytoriów zależnych...');
    const territoryIso3 = [
      "ABW", "AIA", "ALA", "ASM", "ATA", "ATF", "BES", "BLM", "BMU", "BVT", "CCK", "COK", "CUW", "CXR", 
      "CYM", "ESH", "FLK", "FRO", "GGY", "GIB", "GLP", "GUM", "HKG", "HMD", "IOT", "JEY", "MAC", "MAF", 
      "MNP", "MSR", "MTQ", "MYT", "NCL", "NFK", "NIU", "PCN", "PRI", "PYF", "REU", "SGS", "SHN", "SJM", 
      "SPM", "TCA", "TKL", "UMI", "VGB", "VIR", "WLF", "GRL", "UNK", "PSE"
    ];

    // 1. Pobieranie danych z Postgres
    const resCountries = await client.query('SELECT * FROM app.countries WHERE is_active = true ORDER BY name');
    const countries = resCountries.rows;
    console.log(`Pobrano ${countries.length} krajów z bazy.`);

    const resPolitics = await client.query('SELECT * FROM app.country_politics');
    const politics = resPolitics.rows;
    
    const resIndicators = await client.query('SELECT * FROM app.country_indicators');
    const indicators = resIndicators.rows;
    
    const resExpats = await client.query(`
      SELECT e.destination_iso3, e.origin_iso3, e.migrant_count, e.year, c.name as origin_name, c.iso_alpha2 as origin_alpha2, c.slug as origin_slug
      FROM app.country_expats e 
      JOIN app.countries c ON e.origin_iso3 = c.iso_alpha3
      ORDER BY e.migrant_count DESC
    `);
    const expats = resExpats.rows;
    
    const resClimate = await client.query('SELECT * FROM app.climate_normals ORDER BY month ASC');
    const climateData = resClimate.rows;

    const resTech = await client.query('SELECT * FROM app.country_tech_nomad');
    const techData = resTech.rows;

    // 2. Ładowanie istniejącego database.json (by zachować to, czego nie ma w bazie, jeśli coś jeszcze zostało)
    const dataDir = path.join(__dirname, '..', 'src', 'data');
    const outputPath = path.join(dataDir, 'database.json');
    
    let existingData = { countries: [] };
    if (fs.existsSync(outputPath)) {
        existingData = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    }
    const existingMap = new Map();
    existingData.countries.forEach(c => existingMap.set(c.id, c));

    // 3. Budowa połączonego obiektu JSON
    const database = {
      updatedAt: new Date().toISOString(),
      countries: countries.map(country => {
        const pol = politics.find(p => p.country_iso3 === country.iso_alpha3);
        const countryInds = indicators.filter(i => i.country_iso3 === country.iso_alpha3);
        
        const latestIndicators = {};
        const grouped = countryInds.reduce((acc, curr) => {
            if (!acc[curr.indicator_code] || acc[curr.indicator_code].year < curr.year) {
                acc[curr.indicator_code] = curr;
            }
            return acc;
        }, {});
        
        for (const [code, data] of Object.entries(grouped)) {
            latestIndicators[code] = {
                value: parseFloat(data.value),
                year: data.year,
                source: data.source
            };
        }

        const existingCountry = existingMap.get(country.iso_alpha3) || {};

        // Budowa obiektu klimatycznego z Postgresa
        const cClimate = climateData.filter(c => c.country_iso3 === country.iso_alpha3);
        let climateObj = undefined;
        if (cClimate.length === 12) {
            climateObj = cClimate.map(c => ({
              monthName: new Date(2023, c.month - 1, 1).toLocaleString('en-US', { month: 'short' }),
              avgMaxTemp: Math.round(c.avg_temp_max),
              avgMinTemp: Math.round(c.avg_temp_min),
              rainDays: Math.round(c.rain_days),
              sunshineHours: Math.round(c.sunshine_hours),
              snowDays: 0
            }));
        }

        // Budowa obiektu wizowego
        const tech = techData.find(t => t.country_name === country.name);
        let nomadVisaObj = undefined;
        if (tech && tech.has_nomad_visa) {
            nomadVisaObj = {
                available: true,
                url: tech.visa_url || null
            };
        }

        return {
          id: country.iso_alpha3,
          iso_alpha2: (existingCountry.iso_alpha2 && existingCountry.iso_alpha2.toLowerCase()) || 
                      (country.iso_alpha2 && country.iso_alpha2.toLowerCase()) || 
                      null,
          name: country.name,
          slug: country.slug,
          region: country.region,
          capital: country.capital_city,
          flag_emoji: country.flag_emoji,
          is_territory: territoryIso3.includes(country.iso_alpha3),
          currency_code: country.currency_code || existingCountry.currency_code || null,
          currency_name: country.currency_name || existingCountry.currency_name || null,
          currency_symbol: country.currency_symbol || existingCountry.currency_symbol || null,
          politics: pol ? {
            ruling_party: pol.ruling_party,
            government_type: pol.government_type,
            head_of_state: pol.head_of_state,
            head_of_government: pol.head_of_government
          } : null,
          indicators: latestIndicators,
          
          expats: expats
            .filter(e => e.destination_iso3 === country.iso_alpha3)
            .map(e => ({ origin_iso3: e.origin_iso3, origin_alpha2: e.origin_alpha2, origin_slug: e.origin_slug, name: e.origin_name, count: e.migrant_count, year: e.year }))
            .slice(0, 5),
          
          climate: climateObj || existingCountry.climate || undefined,
          climate_summary: country.climate_summary || existingCountry.climate_summary || null,
          health_summary: country.health_summary || existingCountry.health_summary || null,
          economic_summary: country.economic_summary || existingCountry.economic_summary || null,
          demographics_summary: country.demographics_summary || existingCountry.demographics_summary || null,
          politics_summary: country.politics_summary || existingCountry.politics_summary || null,
          nomad_visa: nomadVisaObj || existingCountry.nomad_visa || undefined,
          digital_freedom_text: country.digital_freedom_text || null
        };
      })
    };

    // GENEROWANIE PODSUMOWAŃ SEO (Smart Templating 0% Hallucinations)
    database.countries.forEach(country => {
      let summary = [];
      const taxes = country.indicators?.['wb_taxes']?.value;
      if (taxes != null) {
        if (taxes < 15) summary.push(`Relocating to ${country.name} is highly attractive for expats looking for tax optimization, offering a very competitive tax burden of ${taxes.toFixed(1)}%.`);
        else if (taxes < 30) summary.push(`${country.name} is a solid destination for global professionals, featuring a moderate tax burden of ${taxes.toFixed(1)}%.`);
        else summary.push(`While living in ${country.name} comes with a higher tax burden of ${taxes.toFixed(1)}%, expats often benefit from its robust social infrastructure and high quality of life.`);
      }

      if (country.climate && country.climate["Climate Index"]) {
        const climate = country.climate["Climate Index"];
        if (climate > 80) summary.push(`The country boasts an exceptional climate (Index: ${climate}), making it a paradise for those who enjoy pleasant weather year-round.`);
        else if (climate > 50) summary.push(`Expats can expect a varied and generally agreeable climate, reflected in its climate score of ${climate}.`);
        else summary.push(`The climate is more demanding (Index: ${climate}), requiring some adaptation for newcomers.`);
      }

      const english = country.indicators?.['ef_epi_english']?.value;
      let communityText = "";
      if (english) {
        if (english > 60) communityText = `With a very high English proficiency score of ${english}, daily communication and business integration are seamless. `;
        else if (english > 50) communityText = `English proficiency is moderate (Score: ${english}), so learning the basics of the local language can be highly beneficial. `;
        else communityText = `As the English proficiency score is relatively low (${english}), acquiring the local language is essential for a smooth transition. `;
      }

      if (country.expats && country.expats.length > 0) {
        communityText += `It hosts a vibrant and diverse expat community, notably drawing a significant number of residents from ${country.expats[0].name}.`;
      }
      
      if (communityText) summary.push(communityText);
      country.seo_summary = summary.join(' ');
    });

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(database, null, 2), 'utf-8');
    console.log(`✅ Zakończono sukcesem! Zaktualizowano dane zachowując informacje zewnętrzne: ${outputPath}`);
    
  } catch (error) {
    console.error('Błąd podczas eksportu:', error);
  } finally {
    await client.end();
  }
}

buildDatabaseJson();
