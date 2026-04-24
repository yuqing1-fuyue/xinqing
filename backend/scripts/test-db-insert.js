const path = require('path');
const DB_PATH = path.join(__dirname, '..', 'data', 'xinqing.db');
console.log('数据库路径:', DB_PATH);
const fs = require('fs');
console.log('文件存在:', fs.existsSync(DB_PATH));

const Database = require('better-sqlite3');
const db = new Database(DB_PATH);
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('\n表列表:');
tables.forEach(t => console.log(' ', t.name));

// 检查是否有外键引用
console.log('\n检查外键约束...');
try {
  const fks = db.prepare("PRAGMA foreign_key_list('care_messages')").all();
  console.log('care_messages 外键:', JSON.stringify(fks));
} catch(e) {
  console.log('错误:', e.message);
}

// 测试插入
console.log('\n测试插入 mood...');
try {
  const result = db.prepare("INSERT INTO moods (user_id, mood, score, content) VALUES (?, ?, ?, ?)").run(38, 'happy', 3, '测试');
  console.log('插入成功, ID:', result.lastInsertRowid);
  db.prepare('DELETE FROM moods WHERE id = ?').run(result.lastInsertRowid);
  console.log('测试清理完成');
} catch(e) {
  console.log('插入失败:', e.message);
}

db.close();
