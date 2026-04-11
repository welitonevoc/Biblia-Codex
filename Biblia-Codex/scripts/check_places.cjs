const fs = require('fs');
const path = require('path');

async function check() {
  const initSqlJs = await import('sql.js');
  const SQL = await initSqlJs.default();
  
  const buffer = fs.readFileSync(path.join(__dirname, 'public/mapgeodata.mybible'));
  const db = new SQL.Database(new Uint8Array(buffer));
  
  const tables = db.exec('SELECT name FROM sqlite_master WHERE type="table"');
  console.log('Tables:', tables[0]?.values?.flat());
  
  const pragma = db.exec('PRAGMA table_info("places")');
  console.log('Columns:', pragma[0]?.values?.map(r => r[1]));
  
  const sample = db.exec('SELECT book, chapter, verse, name FROM places LIMIT 5');
  console.log('Sample:', sample[0]?.values);
}

check().catch(console.error);