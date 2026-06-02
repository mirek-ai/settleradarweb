const fs = require('fs');
const stringSimilarity = require('string-similarity');

const dbPath = 'C:/Users/miros/Downloads/Projekty/settleradar/src/data/database.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const csvData = fs.readFileSync('C:/Users/miros/Downloads/heritage-index-of-economic-freedom-2026-05-31_2116.csv', 'utf-8');
const lines = csvData.split(/\r?\n/);

const countryNames = db.countries.map(c => c.name);

lines.slice(1).forEach(line => {
  const cols = line.split(',');
  if(cols.length < 15) return;
  
  const name = cols[0];
  if(!name) return;

  const match = stringSimilarity.findBestMatch(name, countryNames);
  if(match.bestMatch.rating > 0.6) {
     const c = db.countries.find(x => x.name === match.bestMatch.target);
     if(c) {
        if(!c.indicators) c.indicators = {};
        
        const mapHeritage = (key, index) => {
          const val = parseFloat(cols[index]);
          if(!isNaN(val)) {
            c.indicators[key] = { value: val, year: 2026, source: "Heritage Foundation" };
          }
        };

        mapHeritage('heritage_overall', 2);
        mapHeritage('heritage_property_rights', 3);
        mapHeritage('heritage_judicial_effectiveness', 4);
        mapHeritage('heritage_government_integrity', 5);
        mapHeritage('heritage_tax_burden', 6);
        mapHeritage('heritage_government_spending', 7);
        mapHeritage('heritage_fiscal_health', 8);
        mapHeritage('heritage_business_freedom', 9);
        mapHeritage('heritage_labor_freedom', 10);
        mapHeritage('heritage_monetary_freedom', 11);
        mapHeritage('heritage_trade_freedom', 12);
        mapHeritage('heritage_investment_freedom', 13);
        mapHeritage('heritage_financial_freedom', 14);
     }
  }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log("Updated database.json with ALL Heritage indicators");
