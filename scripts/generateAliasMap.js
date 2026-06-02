const fs = require('fs');
const csv = require('csv-parser');
const stringSimilarity = require('string-similarity');
const db = require('../src/data/database.json');

const csvPath = 'C:/Users/miros/Downloads/heritage-index-of-economic-freedom-2026-06-01_1049.csv';

const countryNames = db.countries.map(c => c.name);

const lines = fs.readFileSync(csvPath, 'utf-8').split(/\r?\n/).slice(4).join('\n');
const stream = require('stream');
const bufferStream = new stream.PassThrough();
bufferStream.end(lines);

const heritageCountries = new Set();

bufferStream.pipe(csv())
  .on('data', (row) => {
    if (row['Country']) {
      heritageCountries.add(row['Country']);
    }
  })
  .on('end', () => {
    const aliasMap = {};
    for (const hCountry of heritageCountries) {
      const match = stringSimilarity.findBestMatch(hCountry, countryNames);
      if (match.bestMatch.rating > 0.6) {
         const dbName = match.bestMatch.target;
         const iso = db.countries.find(c => c.name === dbName).id;
         aliasMap[hCountry] = iso;
      }
    }
    
    aliasMap["Bahamas, The"] = "BHS";
    aliasMap["Congo, Democratic Republic of the Congo"] = "COD";
    aliasMap["Congo, Republic of"] = "COG";
    aliasMap["Gambia, The"] = "GMB";
    aliasMap["Korea, South"] = "KOR";
    aliasMap["Korea, North"] = "PRK";
    aliasMap["Micronesia"] = "FSM";
    aliasMap["Taiwan"] = "TWN";
    aliasMap["Macau"] = "MAC";
    aliasMap["Hong Kong"] = "HKG";
    aliasMap["Turkiye"] = "TUR";
    
    console.log(JSON.stringify(aliasMap, null, 2));
  });
