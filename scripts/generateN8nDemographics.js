const fs = require('fs');
const path = require('path');

const indicators = [
  { apiCode: 'SP.POP.TOTL.FE.ZS', dbCode: 'wb_female_population_pct', name: 'Female %' },
  { apiCode: 'SP.POP.TOTL.MA.ZS', dbCode: 'wb_male_population_pct', name: 'Male %' },
  { apiCode: 'IT.NET.USER.ZS', dbCode: 'wb_internet_users_pct', name: 'Internet %' },
  { apiCode: 'SM.POP.NETM', dbCode: 'wb_net_migration', name: 'Net Migration' },
  { apiCode: 'SP.URB.TOTL.IN.ZS', dbCode: 'wb_urban_population_pct', name: 'Urban %' },
  { apiCode: 'SG.GEN.PARL.ZS', dbCode: 'wb_women_in_parliament_pct', name: 'Women in Parl %' },
  { apiCode: 'SP.POP.65UP.TO.ZS', dbCode: 'wb_population_65plus_pct', name: 'Pop 65+ %' }
];

const nodes = [
  {
    "parameters": {
      "rule": {
        "interval": [ { "field": "months", "interval": 6 } ]
      }
    },
    "id": "trigger",
    "name": "Schedule Trigger",
    "type": "n8n-nodes-base.scheduleTrigger",
    "typeVersion": 1.1,
    "position": [ 0, 300 ]
  }
];

const connections = {
  "Schedule Trigger": { 
    "main": [ [] ] 
  }
};

let yPos = 0;

indicators.forEach((ind, index) => {
  const httpNodeId = `http-${ind.dbCode}`;
  const codeNodeId = `code-${ind.dbCode}`;
  const pgNodeId = `postgres-${ind.dbCode}`;

  nodes.push({
    "parameters": {
      "url": `https://api.worldbank.org/v2/country/all/indicator/${ind.apiCode}?format=json&per_page=1000&date=2022:2025`,
      "options": {}
    },
    "id": httpNodeId,
    "name": `Fetch ${ind.name}`,
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4.1,
    "position": [ 200, yPos ]
  });

  nodes.push({
    "parameters": {
      "jsCode": `const rawData = $input.first().json[1];\nif (!rawData) return [];\n\nconst output = [];\nfor (const item of rawData) {\n  if (item.value !== null && item.countryiso3code) {\n    output.push({\n      json: {\n        country_iso3: item.countryiso3code,\n        indicator_code: '${ind.dbCode}',\n        year: parseInt(item.date),\n        value: parseFloat(item.value)\n      }\n    });\n  }\n}\nreturn output;`
    },
    "id": codeNodeId,
    "name": `Transform ${ind.name}`,
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [ 400, yPos ]
  });

  nodes.push({
    "parameters": {
      "operation": "executeQuery",
      "query": "INSERT INTO app.country_indicators (country_iso3, indicator_code, year, value, source)\nSELECT $1, $2, $3, $4, 'World Bank API'\nWHERE EXISTS (SELECT 1 FROM app.countries WHERE iso_alpha3 = $1)\nON CONFLICT (country_iso3, indicator_code, year) \nDO UPDATE SET value = EXCLUDED.value;",
      "options": {
        "queryParameters": "={{ [$json.country_iso3, $json.indicator_code, $json.year, $json.value] }}"
      }
    },
    "id": pgNodeId,
    "name": `Upsert ${ind.name}`,
    "type": "n8n-nodes-base.postgres",
    "typeVersion": 2.4,
    "position": [ 600, yPos ],
    "credentials": { "postgres": { "id": "H2lVdnOfmAF0B0aU", "name": "Postgres account" } }
  });

  connections["Schedule Trigger"].main[0].push({ "node": `Fetch ${ind.name}`, "type": "main", "index": 0 });
  connections[`Fetch ${ind.name}`] = { "main": [ [ { "node": `Transform ${ind.name}`, "type": "main", "index": 0 } ] ] };
  connections[`Transform ${ind.name}`] = { "main": [ [ { "node": `Upsert ${ind.name}`, "type": "main", "index": 0 } ] ] };

  yPos += 200;
});

const pipeline = {
  "name": "18 - Demographics & Social Ingestion (World Bank)",
  "nodes": nodes,
  "connections": connections,
  "settings": {}
};

const outPath = path.join(__dirname, '..', '18_world_bank_demographics_pipeline.json');
fs.writeFileSync(outPath, JSON.stringify(pipeline, null, 2));
console.log("Enhanced Demographics n8n pipeline generated at: 18_world_bank_demographics_pipeline.json");
