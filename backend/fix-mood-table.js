const db = require('./src/config/database');

console.log('修改 moods 表 CHECK 约束（添加 angry）...');

// SQLite 不支持直接 ALTER CHECK，需要重建表
try {
  // 重命名旧表
  db.db.exec('ALTER TABLE moods RENAME TO moods_old');
  console.log('1. 旧表已重命名');
  
  // 创建新表（包含 angry）
  db.db.exec(`
    CREATE TABLE moods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      mood TEXT NOT NULL CHECK(mood IN ('happy', 'calm', 'sad', 'anxious', 'neutral', 'angry')),
      score INTEGER DEFAULT 50,
      content TEXT,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('2. 新表创建成功');
  
  // 复制数据
  db.db.exec('INSERT INTO moods (id, user_id, mood, score, content, tags, created_at) SELECT id, user_id, mood, score, content, tags, created_at FROM moods_old');
  console.log('3. 数据复制成功');
  
  // 删除旧表
  db.db.exec('DROP TABLE moods_old');
  console.log('4. 旧表已删除');
  
  console.log('\n✅ moods 表 CHECK 约束已更新');
} catch (e) {
  console.log('错误:', e.message);
}
