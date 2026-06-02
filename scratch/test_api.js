const urls = ['IC.REG.COST.PC.ZS', 'EN.ATM.PM25.MC.M3', 'VC.IHR.PSRC.P5'];
Promise.all(urls.map(u => 
  fetch(`https://api.worldbank.org/v2/country/all/indicator/${u}?format=json`)
    .then(r=>r.json())
    .then(d=>{
      if (d[0] && d[0].message) {
        console.log(u, 'ERROR:', d[0].message[0].value);
      } else {
        console.log(u, 'OK');
      }
    })
));
