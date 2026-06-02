const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function generateId() {
  return crypto.randomBytes(8).toString('hex');
}

const file = 'C:/Users/miros/Downloads/02 - World Bank Ingestion.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

// The last node in the chain is "Insert or update rows in a table2"
let lastNodeName = 'Insert or update rows in a table2';
let lastY = -448;
let xBaseHttp = 416;
let xBaseCode = 624;
let xBasePg = 832;

const newIndicators = [
  { apiCode: 'SP.POP.TOTL.FE.ZS', dbCode: 'wb_female_population_pct', name: 'Female %' },
  { apiCode: 'SP.POP.TOTL.MA.ZS', dbCode: 'wb_male_population_pct', name: 'Male %' },
  { apiCode: 'IT.NET.USER.ZS', dbCode: 'wb_internet_users_pct', name: 'Internet %' },
  { apiCode: 'SM.POP.NETM', dbCode: 'wb_net_migration', name: 'Net Migration' },
  { apiCode: 'SP.URB.TOTL.IN.ZS', dbCode: 'wb_urban_population_pct', name: 'Urban %' },
  { apiCode: 'SP.POP.65UP.TO.ZS', dbCode: 'wb_population_65plus_pct', name: 'Pop 65+ %' }
];

let yPos = lastY + 176;

newIndicators.forEach(ind => {
  const httpNodeName = `Fetch ${ind.name}`;
  const codeNodeName = `Transform ${ind.name}`;
  const pgNodeName = `Upsert ${ind.name}`;

  // 1. HTTP Request
  data.nodes.push({
    "parameters": {
      "url": `https://api.worldbank.org/v2/country/all/indicator/${ind.apiCode}?format=json&per_page=10000&date=2000:2099`,
      "options": {}
    },
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4.4,
    "position": [ xBaseHttp, yPos ],
    "id": generateId(),
    "name": httpNodeName,
    "executeOnce": true
  });

  // 2. Code Node
  data.nodes.push({
    "parameters": {
      "jsCode": `const validCountries = $('Fetch Valid Countries').all().map(i => i.json.iso_alpha3);\nconst items = $input.all();\nlet rawData = [];\nif (items.length >= 2) rawData = Object.values(items[1].json);\nconst results = [];\nfor (const entry of rawData) {\n  if (!entry || entry.value === null || !entry.countryiso3code) continue;\n  if (!validCountries.includes(entry.countryiso3code)) continue;\n  const year = parseInt(entry.date);\n  if (year < 2000) continue;\n  results.push({\n    json: {\n      country_iso3: entry.countryiso3code,\n      indicator_code: '${ind.dbCode}',\n      year: year,\n      value: parseFloat(entry.value).toFixed(2),\n      source: 'World Bank'\n    }\n  });\n}\nreturn results;`
    },
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [ xBaseCode, yPos ],
    "id": generateId(),
    "name": codeNodeName
  });

  // 3. Postgres Node (using n8n native Upsert operation)
  data.nodes.push({
    "parameters": {
      "operation": "upsert",
      "schema": {
        "__rl": true,
        "value": "app",
        "mode": "list",
        "cachedResultName": "app"
      },
      "table": {
        "__rl": true,
        "value": "country_indicators",
        "mode": "list",
        "cachedResultName": "country_indicators"
      },
      "columns": {
        "mappingMode": "autoMapInputData",
        "value": {},
        "matchingColumns": [
          "country_iso3",
          "indicator_code",
          "year"
        ],
        "schema": [
          { "id": "country_iso3", "displayName": "country_iso3", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true, "removed": false },
          { "id": "indicator_code", "displayName": "indicator_code", "required": true, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true, "removed": false },
          { "id": "year", "displayName": "year", "required": true, "defaultMatch": false, "display": true, "type": "number", "canBeUsedToMatch": true, "removed": false },
          { "id": "value", "displayName": "value", "required": true, "defaultMatch": false, "display": true, "type": "number", "canBeUsedToMatch": false },
          { "id": "source", "displayName": "source", "required": true, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": false }
        ],
        "attemptToConvertTypes": false,
        "convertFieldsToString": false
      },
      "options": {}
    },
    "type": "n8n-nodes-base.postgres",
    "typeVersion": 2.6,
    "position": [ xBasePg, yPos ],
    "id": generateId(),
    "name": pgNodeName,
    "credentials": {
      "postgres": {
        "id": "H2lVdnOfmAF0B0aU",
        "name": "Postgres account"
      }
    }
  });

  // 4. Wiring
  data.connections[lastNodeName] = {
    "main": [
      [ { "node": httpNodeName, "type": "main", "index": 0 } ]
    ]
  };
  
  data.connections[httpNodeName] = {
    "main": [
      [ { "node": codeNodeName, "type": "main", "index": 0 } ]
    ]
  };
  
  data.connections[codeNodeName] = {
    "main": [
      [ { "node": pgNodeName, "type": "main", "index": 0 } ]
    ]
  };

  lastNodeName = pgNodeName;
  yPos += 176;
});

data.name = "02 - World Bank Master Ingestion";
const outPath = 'C:/Users/miros/Downloads/02 - World Bank Master Pipeline (GDP, Unemp, Pop, Gender, Internet, Migr, Urban, 65plus).json';
fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
console.log('Successfully generated pipeline using native Upsert nodes.');
