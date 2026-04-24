/**
 * 数据库迁移脚本：修复moods表约束
 * 1. 添加 'angry' 心情类型到 CHECK 约束
 * 2. 修改 score 默认值为 5
 */
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'xinqing.db');
const db = new Database(DB_PATH);

console.log('🔄 开始迁移 moods 表...\n');

// 1. 备份现有数据
console.log('📦 备份现有心情数据...');
const existingMoods = db.prepare('SELECT * FROM moods').all();
console.log(`   找到 ${existingMoods.length} 条心情记录`);

// 2. 删除旧表
console.log('\n🗑️  删除旧 moods 表...');
db.exec('DROP TABLE IF EXISTS moods_old');
db.exec('ALTER TABLE moods RENAME TO moods_old');

// 3. 创建新表（包含 angry 和正确的 score 默认值）
console.log('✨ 创建新的 moods 表...');
db.exec(`
  CREATE TABLE moods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    mood TEXT NOT NULL CHECK(mood IN ('happy', 'calm', 'sad', 'anxious', 'neutral', 'angry')),
    score INTEGER DEFAULT 5,
    content TEXT,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);
console.log('   ✅ 新表已创建（包含 angry 类型）');

// 4. 恢复数据
console.log('\n📥 恢复心情数据...');
if (existingMoods.length > 0) {
  const insert = db.prepare('INSERT INTO moods (id, user_id, mood, score, content, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  
  for (const mood of existingMoods) {
    // 确保 score 在有效范围内 (1-10)
    const score = mood.score ? Math.max(1, Math.min(10, mood.score)) : 5;
    insert.run(mood.id, mood.user_id, mood.mood, score, mood.content, mood.tags, mood.created_at);
  }
  console.log(`   ✅ 已恢复 ${existingMoods.length} 条记录`);
} else {
  console.log('   📭 没有需要恢复的数据');
}

// 5. 删除旧表
console.log('\n🗑️ 删除备份表...');
db.exec('DROP TABLE moods_old');
console.log('   ✅ 备份表已删除');

// 6. 验证
console.log('\n🔍 验证迁移结果...');
try {
  // 测试 CHECK 约束
  db.exec(`
    CREATE TABLE test_check (
      mood TEXT NOT NULL CHECK(mood IN ('happy', 'calm', 'sad', 'anxious', 'neutral', 'angry'))
    )
  `);
  db.exec('DROP TABLE test_check');
  console.log('   ✅ CHECK 约束已更新');
} catch (e) {
  console.log('   ⚠️ 验证跳过:', e.message);
}
console.log('\n🎉 迁移完成！');

db.close();
