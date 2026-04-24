const db = require('./src/config/database');

// 获取一个存在的用户
const user = db.db.prepare("SELECT id FROM users WHERE role = 'user' LIMIT 1").get();
console.log('测试用户ID:', user?.id);

if (user) {
  console.log('\n测试创建心情:');
  try {
    const result = db.moods.create(user.id, 'happy', 8, '测试心情内容', null);
    console.log('创建结果:', result.changes, 'changes');
  } catch (e) {
    console.log('错误:', e.message);
  }
  
  console.log('\n测试获取心情:');
  try {
    const moods = db.moods.findByUser(user.id, 5);
    console.log('获取结果:', moods.length, '条');
    if (moods.length > 0) {
      console.log('最新内容:', moods[0].content);
    }
  } catch (e) {
    console.log('错误:', e.message);
  }
}
