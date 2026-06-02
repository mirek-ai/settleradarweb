const fs = require('fs');
const xlsx = require('xlsx');

async function test() {
  console.log("Downloading Excel...");
  const res = await fetch('https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2020_ims_stock_by_sex_destination_and_origin.xlsx');
  const buffer = await res.arrayBuffer();
  
  console.log("Parsing Excel...");
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[1]; // usually Table 1 is the total stock
  console.log("Sheet names:", workbook.SheetNames);
  
  const sheet = workbook.Sheets[sheetName];
  const json = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  console.log("First 20 rows of Table 1:");
  for(let i=0; i<20; i++) {
    console.log(`Row ${i}:`, json[i] ? json[i].slice(0, 15) : 'null');
  }
}

test();
