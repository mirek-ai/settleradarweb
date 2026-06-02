const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

async function scrape() {
  try {
    console.log("Fetching Wikipedia data...");
    const res = await fetch('https://en.wikipedia.org/wiki/Religions_by_country');
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const results = [];
    
    $('table.sortable tbody tr').each((i, row) => {
      if (i === 0) return; // header
      const cols = $(row).find('td, th');
      if (cols.length >= 10) {
        let country = $(cols[0]).text().replace(/\\n/g, '').replace(/\\[.*?\\]/g, '').trim();
        // Czasami w pierwszej kolumnie jest link, czasem tekst
        if ($(cols[0]).find('a').length > 0) {
          country = $(cols[0]).find('a').first().text().trim();
        }
        
        if (!country || country === 'Country') return;
        
        const parsePct = (colIdx) => {
          const text = $(cols[colIdx]).text();
          if (!text || text.trim() === '' || text.trim() === '< 0.1') return 0;
          const val = parseFloat(text.replace('%', '').trim());
          return isNaN(val) ? 0 : val;
        };

        // Kolumny: 0=Country, 1=Region, 2=Pop, 3=Christian, 4=Muslim, 5=Unaffiliated, 6=Hindu, 7=Buddhist, 8=Folk, 9=Other, 10=Jewish
        const christians = parsePct(3);
        const muslims = parsePct(4);
        const unaffiliated = parsePct(5);
        const hindus = parsePct(6);
        const buddhists = parsePct(7);
        const folk = parsePct(8);
        const jewish = parsePct(10);
        
        results.push({
          country,
          religions: {
            'Christianity': christians,
            'Islam': muslims,
            'Unaffiliated': unaffiliated,
            'Hinduism': hindus,
            'Buddhism': buddhists,
            'Folk Religions': folk,
            'Judaism': jewish
          }
        });
      }
    });

    const outPath = path.join(__dirname, '..', 'public', 'religions.json');
    fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
    console.log(`Saved ${results.length} countries to public/religions.json`);
    
  } catch (err) {
    console.error(err);
  }
}

scrape();
