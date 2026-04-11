const fs = require('fs');
const path = require('path');

async function check() {
  const initSqlJs = await import('sql.js');
  const SQL = await initSqlJs.default();
  
  const buffer = fs.readFileSync(path.join(__dirname, 'public/mapgeodata.mybible'));
  const db = new SQL.Database(new Uint8Array(buffer));
  
  console.log('=== All Places data ===');
  const all = db.exec('SELECT book, chapter, verse, name FROM places ORDER BY book, chapter, verse LIMIT 20');
  console.log('Sample:', all[0]?.values);
  
  console.log('\n=== Book 1 (Genesis) ===');
  const g1 = db.exec('SELECT chapter, verse, name FROM places WHERE book = 1 ORDER BY chapter, verse');
  console.log('Gn places:', g1[0]?.values?.slice(0, 10));
  
  console.log('\n=== Book 2 (Exodus) ===');
  const ex = db.exec('SELECT chapter, verse, name FROM places WHERE book = 2 ORDER BY chapter, verse');
  console.log('Ex places:', ex[0]?.values);
}

check().catch(console.error);