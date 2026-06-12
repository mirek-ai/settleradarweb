const { Client } = require('pg');
const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const LLM_HOST = '100.75.197.13';
const LLM_PORT = 11434;
const LLM_PATH = '/v1/chat/completions';
const MODEL_NAME = 'qwen2.5:7b';
const DB_CONNECTION = process.env.DATABASE_URL;

async function askLLM(prompt) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            model: MODEL_NAME,
            messages: [{ role: 'user', content: prompt }],
            stream: false,
            temperature: 0.7
        });
        const options = {
            hostname: LLM_HOST,
            port: LLM_PORT,
            path: LLM_PATH,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
        };
        const req = http.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                try { resolve(JSON.parse(data).choices[0].message.content); } 
                catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function run() {
    const client = new Client({ connectionString: DB_CONNECTION });
    await client.connect();
    console.log('✅ Connected to Postgres.');

    const res = await client.query('SELECT iso_alpha3, name FROM app.countries WHERE demographics_summary IS NULL');
    
    // For initial validation, let's test on 5 countries
    const testMode = process.argv.includes('--test');
    const countries = testMode ? res.rows.slice(0, 5) : res.rows;
    console.log(`🌍 Found ${res.rows.length} countries missing demographics_summary. Processing ${countries.length}.`);

    let successCount = 0;

    for (let i = 0; i < countries.length; i++) {
        const row = countries[i];
        console.log(`\n[${i + 1}/${countries.length}] 🤖 Generating demographics summary for: ${row.name}...`);

        const indRes = await client.query(`
            SELECT indicator_code, value 
            FROM app.country_indicators 
            WHERE country_iso3 = $1 
            AND indicator_code IN ('wb_population', 'wb_population_65plus_pct', 'wb_homicides', 'whr_happiness_index', 'ef_epi_english')
        `, [row.iso_alpha3]);
        
        if (indRes.rows.length === 0) {
            console.log(`⏭️  No demographic data for ${row.name}, skipping.`);
            continue;
        }

        let dataStr = '';
        indRes.rows.forEach(r => {
            dataStr += `- ${r.indicator_code}: ${r.value}\n`;
        });

        const prompt = `You are an expert sociologist and demographic analyst. I will provide you with several demographic and societal indicators for the country of ${row.name}.\n\nAnalyze the data and write a highly engaging, 3-sentence SEO-optimized summary about the country's society and demographics for expats and digital nomads.\n\nYour response MUST cover:\n1. The population size and aging context (if wb_population and 65plus_pct are available).\n2. Safety (homicides per 100k) or happiness context (out of 10).\n3. The overall societal vibe for an expat moving there.\n\nDo not use markdown. Do not include introductory text. Use rich, descriptive language.\n\nData:\n${dataStr}`;

        try {
            const aiText = await askLLM(prompt);
            if (!aiText || aiText.trim() === '') throw new Error("Empty response");

            await client.query(`UPDATE app.countries SET demographics_summary = $1 WHERE iso_alpha3 = $2`, [aiText.trim(), row.iso_alpha3]);
            console.log(`✅ Saved!`);
            successCount++;
        } catch (err) {
            console.error(`❌ Error:`, err.message);
        }
    }

    console.log(`\n🎉 Generated ${successCount} descriptions. Syncing to database.json...`);
    
    // Sync to database.json
    const dbPath = path.join(__dirname, '..', 'src', 'data', 'database.json');
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    const allSummaries = await client.query('SELECT iso_alpha3, demographics_summary FROM app.countries WHERE demographics_summary IS NOT NULL');
    const map = new Map(allSummaries.rows.map(r => [r.iso_alpha3, r.demographics_summary]));
    
    let updated = 0;
    db.countries.forEach(c => {
        if (map.has(c.id)) {
            c.demographics_summary = map.get(c.id);
            updated++;
        }
    });

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log(`Synced ${updated} demographic summaries to database.json.`);

    await client.end();
}
run().catch(console.error);
