const fs = require('fs');
const initSqlJs = require('sql.js');

initSqlJs().then(SQL => {
  const data = fs.readFileSync('public/mapgeodata.mybible');
  const db = new SQL.Database(data);
  
  console.log('Searching for Genesis chapter 3:');
  const r = db.exec("SELECT location, verses FROM location WHERE verses LIKE '%Gen 3:%' LIMIT 20");
  console.log(JSON.stringify(r, null, 2));
  
  console.log('\nAll Genesis verses in DB:');
  const r2 = db.exec("SELECT location, verses FROM location WHERE verses LIKE '%Gen %' ORDER BY verses");
  console.log('Total:', r2[0]?.values?.length || 0);
  console.log(JSON.stringify(r2.slice(0, 10), null, 2));
});