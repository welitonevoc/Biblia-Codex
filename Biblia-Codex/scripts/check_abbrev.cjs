const fs = require('fs');
const path = require('path');

async function check() {
  const initSqlJs = await import('sql.js');
  const SQL = await initSqlJs.default();
  
  const buffer = fs.readFileSync(path.join(__dirname, 'public/peopledata.mybible'));
  const db = new SQL.Database(new Uint8Array(buffer));
  
  console.log('=== Checking abbreviations ===');
  const tests = ['Ge', 'Gn', 'Ex', 'Genesis', 'Le', 'Lv', 'Ps', 'Sl'];
  for (const abbr of tests) {
    const r = db.exec(`SELECT COUNT(*) FROM people WHERE verses LIKE '%${abbr} %'`);
    console.log(`${abbr}:`, r[0]?.values?.[0]?.[0] || 0);
  }
}

check().catch(console.error);