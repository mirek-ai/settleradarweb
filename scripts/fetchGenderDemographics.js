const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function fetchDemographics() {
  if (!process.env.DATABASE_URL) {
    console.error('Missing DATABASE_URL');
    process.exit(1);
  }

  const client = new Client(process.env.DATABASE_URL);
  await client.connect();

  console.log('Fetching Demographics from World Bank...');
  
  try {
    const indicators = [
      { code: 'SP.POP.TOTL.FE.ZS', dbCode: 'wb_female_population_pct' },
      { code: 'SP.POP.TOTL.MA.ZS', dbCode: 'wb_male_population_pct' },
      { code: 'IT.NET.USER.ZS', dbCode: 'wb_internet_users_pct' },
      { code: 'SM.POP.NETM', dbCode: 'wb_net_migration' },
      { code: 'SP.URB.TOTL.IN.ZS', dbCode: 'wb_urban_population_pct' },
      { code: 'SG.GEN.PARL.ZS', dbCode: 'wb_women_in_parliament_pct' },
      { code: 'SP.POP.65UP.TO.ZS', dbCode: 'wb_population_65plus_pct' }
    ];

    for (const ind of indicators) {
      console.log(`Fetching ${ind.code}...`);
      let page = 1;
      let totalPages = 1;

      while (page <= totalPages) {
        const response = await fetch(`https://api.worldbank.org/v2/country/all/indicator/${ind.code}?format=json&per_page=1000&page=${page}&date=2021:2024`);
        const data = await response.json();

        if (!data || data.length < 2) {
            console.error('Invalid response from World Bank for ' + ind.code);
            break;
        }

        totalPages = data[0].pages;
        const items = data[1];

        const values = [];
        for (const item of items) {
          if (item.value !== null && item.countryiso3code) {
            values.push({
              iso3: item.countryiso3code,
              year: item.date,
              value: item.value
            });
          }
        }

        if (values.length > 0) {
          const latestPerCountry = {};
          for (const v of values) {
              if (!latestPerCountry[v.iso3] || latestPerCountry[v.iso3].year < v.year) {
                  latestPerCountry[v.iso3] = v;
              }
          }

          for (const [iso3, record] of Object.entries(latestPerCountry)) {
            await client.query(`
              INSERT INTO app.country_indicators (country_iso3, indicator_code, year, value, source)
              SELECT $1, $2, $3, $4, 'World Bank API'
              WHERE EXISTS (SELECT 1 FROM app.countries WHERE iso_alpha3 = $1)
              ON CONFLICT (country_iso3, indicator_code, year) 
              DO UPDATE SET value = EXCLUDED.value
            `, [iso3, ind.dbCode, parseInt(record.year), record.value]);
          }
          console.log(`Inserted batch page ${page}/${totalPages} for ${ind.dbCode}`);
        }
        page++;
      }
    }
    console.log('Finished updating Postgres with demographics.');
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    await client.end();
  }
}

fetchDemographics();
