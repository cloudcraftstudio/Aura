const https = require('https');
https.get('https://unsplash.com/napi/search/photos?query=jesus&per_page=5', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    json.results.forEach(r => console.log(r.id, r.description || r.alt_description));
  });
});
https.get('https://unsplash.com/napi/search/photos?query=cross+sunset&per_page=5', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    json.results.forEach(r => console.log(r.id, r.description || r.alt_description));
  });
});
https.get('https://unsplash.com/napi/search/photos?query=baptist+church&per_page=5', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    json.results.forEach(r => console.log(r.id, r.description || r.alt_description));
  });
});
