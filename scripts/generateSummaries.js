const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'src', 'data');
const dbPath = path.join(dataDir, 'database.json');

const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

data.countries.forEach(country => {
  let summary = [];
  
  // Zdanie 1: Wstęp i podatki
  if (country.tax_rate_income < 15) {
    summary.push(`Relocating to ${country.name} is highly attractive for expats looking for tax optimization, offering a very competitive income tax rate of ${country.tax_rate_income}%.`);
  } else if (country.tax_rate_income < 30) {
    summary.push(`${country.name} is a solid destination for global professionals, featuring a moderate income tax rate of ${country.tax_rate_income}%.`);
  } else {
    summary.push(`While living in ${country.name} comes with a higher income tax rate of ${country.tax_rate_income}%, expats often benefit from its robust social infrastructure and high quality of life.`);
  }

  // Zdanie 2: Klimat
  if (country.climate && country.climate["Climate Index"]) {
    const climate = country.climate["Climate Index"];
    if (climate > 80) {
      summary.push(`The country boasts an exceptional climate (Index: ${climate}), making it a paradise for those who enjoy pleasant weather year-round.`);
    } else if (climate > 50) {
      summary.push(`Expats can expect a varied and generally agreeable climate, reflected in its climate score of ${climate}.`);
    } else {
      summary.push(`The climate is more demanding (Index: ${climate}), requiring some adaptation for newcomers.`);
    }
  }

  // Zdanie 3: Angielski i Społeczność
  const ind = country.indicators || {};
  const english = ind['ef_epi_english']?.value;
  
  let communityText = "";
  if (english) {
    if (english > 60) {
      communityText = `With a very high English proficiency score of ${english}, daily communication and business integration are seamless. `;
    } else if (english > 50) {
      communityText = `English proficiency is moderate (Score: ${english}), so learning the basics of the local language can be highly beneficial. `;
    } else {
      communityText = `As the English proficiency score is relatively low (${english}), acquiring the local language is essential for a smooth transition. `;
    }
  }

  if (country.expats && country.expats.length > 0) {
    communityText += `It hosts a vibrant and diverse expat community, notably drawing a significant number of residents from ${country.expats[0].name}.`;
  }
  
  if (communityText) {
    summary.push(communityText);
  }

  country.seo_summary = summary.join(' ');
});

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('Successfully generated hallucination-free SEO summaries for all countries!');
