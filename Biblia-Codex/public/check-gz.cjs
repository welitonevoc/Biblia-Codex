const fs = require('fs');
const zlib = require('zlib');

const file = fs.readFileSync('./EnciclopediaMerril_clean.json.gz');
const decompressed = zlib.gunzipSync(file);

// Parse NDJSON (one JSON per line)
const lines = decompressed.toString('utf8').split('\n').filter(l => l.trim());

console.log('Total entries:', lines.length);
console.log('First entry:', lines[0]?.substring(0, 300));

// Check for specific terms
const search = 'Deus';
const matches = lines.filter(l => l.toLowerCase().includes(search.toLowerCase()));
console.log(`\nMatches for "${search}":`, matches.length);
if (matches[0]) {
  const parsed = JSON.parse(matches[0]);
  console.log('Sample:', JSON.parse(matches[0]).word || Object.keys(JSON.parse(matches[0]))[0]);
}