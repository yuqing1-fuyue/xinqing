const db = require('better-sqlite3')('./data/xinqing.db');

console.log('数据库中的表:');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
tables.forEach(t => console.log('  -', t.name));

console.log('\nmoods表:');
try {
  const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='moods'").get();
  if (schema) {
    console.log(schema.sql);
  } else {
    console.log('不存在');
  }
} catch(e) {
  console.log('错误:', e.message);
}

console.log('\nmoods_old表:');
try {
  const old = db.prepare('SELECT COUNT(*) as c FROM moods_old').get();
  console.log('存在，行数:', old.c);
} catch(e) {
  console.log('不存在:', e.message);
}

db.close();
