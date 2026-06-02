const cheerio = require('cheerio');
fetch('https://en.wikipedia.org/wiki/Digital_nomad_visa')
  .then(r => r.text())
  .then(html => {
    const $ = cheerio.load(html);
    const rows = $('table.wikitable tbody tr');
    console.log('Found rows:', rows.length);
    rows.slice(0, 5).each((i, el) => {
      console.log('Row ' + i + ' td1:', $(el).find('td').eq(0).text().trim());
      console.log('Row ' + i + ' th1:', $(el).find('th').eq(0).text().trim());
    });
  });
