const fs = require('fs');
const path = require('path');

async function check() {
  const initSqlJs = await import('sql.js');
  const SQL = await initSqlJs.default();
  
  const buffer = fs.readFileSync(path.join(__dirname, 'public/peopledata.mybible'));
  const db = new SQL.Database(new Uint8Array(buffer));
  
  const tables = db.exec('SELECT name FROM sqlite_master WHERE type="table"');
  console.log('Tables:', tables[0]?.values?.flat());
  
  const pragma = db.exec('PRAGMA table_info("people")');
  console.log('Columns:', pragma[0]?.values?.map(r => r[1]));
  
  const sample = db.exec('SELECT verses FROM people LIMIT 5');
  console.log('Sample verses:', sample[0]?.values?.flat());
  
  const sample2 = db.exec('SELECT * FROM people LIMIT 1');
  console.log('Full row:', sample2[0]?.values?.[0]);
}

check().catch(console.error);