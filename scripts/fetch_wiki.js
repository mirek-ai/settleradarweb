async function checkWiki() {
  const res = await fetch('https://en.wikipedia.org/wiki/EF_English_Proficiency_Index');
  const html = await res.text();
  
  const tables = html.match(/<table[^>]*wikitable[^>]*>([\s\S]*?)<\/table>/g);
  if (tables) {
    console.log("Found", tables.length, "wikitables.");
    console.log("First table snippet:", tables[0].slice(0, 1000));
  }
}
checkWiki();
