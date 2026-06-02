const fs = require('fs');
const stringSimilarity = require('string-similarity');

const dbPath = 'C:/Users/miros/Downloads/Projekty/settleradar/src/data/database.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const csvData = fs.readFileSync('C:/Users/miros/Downloads/heritage-index-of-economic-freedom-2026-05-31_2116.csv', 'utf-8');
const lines = csvData.split(/\r?\n/);

const countryNames = db.countries.map(c => c.name);

lines.slice(1).forEach(line => {
  // Simple CSV split (not handling quotes perfectly, but sufficient for Heritage numbers)
  const cols = line.split(',');
  if(cols.length < 7) return;
  const name = cols[0];
  const taxBurden = parseFloat(cols[6]);
  
  if (!isNaN(taxBurden) && name) {
    const match = stringSimilarity.findBestMatch(name, countryNames);
    if(match.bestMatch.rating > 0.6) {
       const c = db.countries.find(x => x.name === match.bestMatch.target);
       if(c) {
          if(!c.indicators) c.indicators = {};
          c.indicators['heritage_tax_burden'] = {
             value: taxBurden,
             year: 2026,
             source: "Heritage Foundation"
          };
       }
    }
  }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log("Updated database.json with heritage_tax_burden");
