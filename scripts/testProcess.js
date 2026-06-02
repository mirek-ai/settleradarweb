const fs = require('fs');
const xlsx = require('xlsx');

async function test() {
  console.log("Downloading Excel...");
  const res = await fetch('https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2020_ims_stock_by_sex_destination_and_origin.xlsx');
  const buffer = await res.arrayBuffer();
  
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = 'Table 1';
  const sheet = workbook.Sheets[sheetName];
  // n8n Spreadsheet node with Header Row = 1 (or Autodetect without header row specified) returns JSON based on row 1
  const json = xlsx.utils.sheet_to_json(sheet); // default reads first row as header

  const items = json.map(j => ({ json: j }));
  
  // --- N8N CODE ---
  let destKey = null;
  let originKey = null;
  let countKey = null;
  let originCodeKey = null;
  let destCodeKey = null;
  const destinations = {};

  for (const item of items) {
    const row = item.json;
    
    if (!destKey || !originKey || !countKey) {
      for (const key of Object.keys(row)) {
        if (row[key] === 'Region, development group, country or area of destination') destKey = key;
        if (row[key] === 'Region, development group, country or area of origin') originKey = key;
        if (row[key] === 'Location code of origin') originCodeKey = key;
        if (row[key] === 'Location code of destination') destCodeKey = key;
        if (row[key] === 2020 || String(row[key]) === '2020') countKey = key;
      }
      continue; 
    }
    
    const destName = String(row[destKey] || '').trim();
    const originName = String(row[originKey] || '').trim();
    const originCode = Number(row[originCodeKey]);
    const destCode = Number(row[destCodeKey]);
    const countStr = row[countKey];
    
    if (!destName || !originName || countStr === undefined || countStr === null) continue;
    if (destName === originName) continue;
    
    // Filter out regions using M49 codes (countries are < 900)
    if (originCode >= 900 || destCode >= 900) continue;
    
    let count = 0;
    if (typeof countStr === 'number') count = countStr;
    else if (typeof countStr === 'string') count = parseInt(countStr.replace(/\\s/g, ''), 10) || 0;
    
    if (!destinations[destName]) destinations[destName] = [];
    destinations[destName].push({ origin: originName, count: count });
  }

  const output = [];
  for (const dest in destinations) {
    const origins = destinations[dest];
    origins.sort((a, b) => b.count - a.count);
    const top5 = origins.slice(0, 5);
    for (const expat of top5) {
      if (expat.count > 0) output.push({ Destination: dest, Origin: expat.origin, Count: expat.count });
    }
  }
  
  console.log(`Generated ${output.length} items`);
  console.log('Expats in Poland:');
  console.log(output.filter(o => o.Destination === 'Poland' || o.Destination === '  Poland'));
}
test();
