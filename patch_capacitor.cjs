const fs = require('fs');
let config = JSON.parse(fs.readFileSync('capacitor.config.json', 'utf8'));
config.server = {
  url: "http://54.80.229.108:3000",
  cleartext: true
};
fs.writeFileSync('capacitor.config.json', JSON.stringify(config, null, 2));
console.log('patched');
