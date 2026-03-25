const https = require('https');
https.get('https://www.nhrl.io/', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const matches = data.match(/font-family[^;}"']+/g);
    if (matches) {
      console.log([...new Set(matches)]);
    }
    const links = data.match(/href="[^"]*fonts[^"]*"/g);
    if (links) {
      console.log([...new Set(links)]);
    }
  });
});
