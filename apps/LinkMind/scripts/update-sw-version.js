const fs = require('fs');
const path = require('path');

// Script para atualizar a versão do Service Worker antes do build
const swPath = path.join(__dirname, '../public/sw.js');
const timestamp = Date.now();

console.log('🔄 Updating PWA cache version...');

fs.readFile(swPath, 'utf8', (err, data) => {
  if (err) {
    console.error('❌ Error reading service worker:', err);
    process.exit(1);
  }

  // Replace the cache version with current timestamp
  const updatedData = data.replace(
    /const CACHE_VERSION = 'linkmind-v' \+ Date\.now\(\);/,
    `const CACHE_VERSION = 'linkmind-v${timestamp}';`
  );

  fs.writeFile(swPath, updatedData, 'utf8', (err) => {
    if (err) {
      console.error('❌ Error writing service worker:', err);
      process.exit(1);
    }
    
    console.log(`✅ Cache version updated to: linkmind-v${timestamp}`);
  });
});
