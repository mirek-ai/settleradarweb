const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '..', 'src', 'data', 'database.json');
const flagsDir = path.join(__dirname, '..', 'public', 'flags');

function run() {
  console.log('Optymalizacja flag pod kątem SEO...');
  const db = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  let copied = 0;
  let missing = 0;

  db.countries.forEach(country => {
    if (!country.iso_alpha2 || !country.slug) return;
    
    const iso2 = country.iso_alpha2.toLowerCase();
    const oldPath = path.join(flagsDir, `${iso2}.png`);
    const newPath = path.join(flagsDir, `moving-to-${country.slug}.png`);
    
    if (fs.existsSync(oldPath)) {
      // Kopiujemy, żeby nie popsuć starego formatu na wypadek zahardkodowanych linków
      fs.copyFileSync(oldPath, newPath);
      copied++;
    } else {
      missing++;
    }
  });

  console.log(`Zakończono kopiowanie flag:
- Skopiowano: ${copied}
- Brakujące pliki źródłowe: ${missing}
Wszystkie pliki mają teraz strukturę: moving-to-[slug].png`);
}

run();
