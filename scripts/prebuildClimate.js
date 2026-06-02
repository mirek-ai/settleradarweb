const fs = require('fs');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function run() {
  const dbPath = 'C:/Users/miros/Downloads/Projekty/settleradar/src/data/database.json';
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  let count = 0;
  for (const country of db.countries) {
    if (!country.capital || country.climate) {
      continue; // Skip if no capital or already fetched
    }

    try {
      console.log(`[${count+1}] Fetching climate for ${country.name} (${country.capital})...`);
      
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(country.capital)}&count=1&format=json`);
      const geoData = await geoRes.json();
      
      if (geoData.results && geoData.results.length > 0) {
        const { latitude, longitude } = geoData.results[0];
        
        await delay(250); 

        const weatherRes = await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=2023-01-01&end_date=2023-12-31&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum&timezone=auto`);
        const weatherData = await weatherRes.json();

        if (weatherData && weatherData.daily && weatherData.daily.temperature_2m_max) {
          const months = Array.from({length: 12}, () => ({ maxT: 0, minT: 0, rain: 0, snow: 0, count: 0 }));
          const daily = weatherData.daily;
          
          for (let i = 0; i < daily.time.length; i++) {
            const date = new Date(daily.time[i]);
            const m = date.getMonth(); 
            if (daily.temperature_2m_max[i] != null) {
              months[m].maxT += daily.temperature_2m_max[i];
              months[m].minT += daily.temperature_2m_min[i];
              
              if (daily.snowfall_sum && daily.snowfall_sum[i] > 1.0) {
                months[m].snow += 1;
              } else if (daily.precipitation_sum && daily.precipitation_sum[i] > 1.0) {
                months[m].rain += 1;
              }
              months[m].count++;
            }
          }
          
          country.climate = months.map((m, i) => ({
            monthName: new Date(2023, i, 1).toLocaleString('en-US', { month: 'short' }),
            avgMaxTemp: Math.round(m.maxT / m.count),
            avgMinTemp: Math.round(m.minT / m.count),
            rainDays: m.rain,
            snowDays: m.snow
          }));
          
          count++;
        }
      }
    } catch(e) {
      console.log(`Failed for ${country.name}:`, e.message);
    }

    await delay(300);
    
    if (count % 20 === 0) {
       fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    }
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log(`Done! Fetched climate for ${count} countries.`);
}

run();
