/**
 * 修复 care_messages 外键约束
 */
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'xinqing.db');
const db = new Database(DB_PATH);

console.log('🔄 修复 care_messages 外键约束...\n');

// 查看当前外键
console.log('当前外键:');
const fks = db.prepare("PRAGMA foreign_key_list('care_messages')").all();
console.log(JSON.stringify(fks, null, 2));

// 重建 care_messages 表
console.log('\n1. 备份现有数据...');
const existingCares = db.prepare('SELECT * FROM care_messages').all();
console.log(`   找到 ${existingCares.length} 条记录`);

console.log('\n2. 删除旧表...');
db.exec('DROP TABLE IF EXISTS care_messages_old');
db.exec('ALTER TABLE care_messages RENAME TO care_messages_old');

console.log('\n3. 创建新表 (外键指向 moods)...');
db.exec(`
  CREATE TABLE care_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT DEFAULT 'auto' CHECK(type IN ('auto', 'manual')),
    message TEXT NOT NULL,
    related_mood_id INTEGER,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_mood_id) REFERENCES moods(id) ON DELETE SET NULL
  )
`);
console.log('   ✅ 新表已创建');

console.log('\n4. 恢复数据...');
if (existingCares.length > 0) {
  const insert = db.prepare('INSERT INTO care_messages (id, user_id, type, message, related_mood_id, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const care of existingCares) {
    insert.run(care.id, care.user_id, care.type, care.message, care.related_mood_id, care.is_read, care.created_at);
  }
  console.log(`   ✅ 已恢复 ${existingCares.length} 条记录`);
}

console.log('\n5. 删除备份表...');
db.exec('DROP TABLE care_messages_old');

console.log('\n6. 验证...');
const newFks = db.prepare("PRAGMA foreign_key_list('care_messages')").all();
console.log('新外键:', JSON.stringify(newFks, null, 2));

console.log('\n🎉 修复完成！');
db.close();
