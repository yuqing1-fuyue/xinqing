require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const runSeed = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'xinqing_db'
  });

  try {
    // 创建测试用户
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    await connection.query(`
      INSERT IGNORE INTO users (username, email, password, nickname, role) VALUES
      ('testuser', 'test@example.com', ?, '测试用户', 'user'),
      ('admin', 'admin@example.com', ?, '管理员', 'admin')
    `, [hashedPassword, hashedPassword]);
    console.log('✅ 测试用户创建完成');

    // 插入健康资源
    await connection.query(`
      INSERT IGNORE INTO health_resources (id, title, category, description, duration) VALUES
      (1, '正念冥想入门', 'exercise', '每天10分钟，找回内心平静', '10分钟'),
      (2, '如何应对焦虑情绪', 'article', '科学方法帮助你缓解焦虑', '5分钟'),
      (3, '情绪管理技巧', 'video', '学会调节和管理自己的情绪', '15分钟'),
      (4, '压力指数测试', 'test', '了解你目前的压力水平', '3分钟'),
      (5, '睡眠放松引导', 'exercise', '帮助你更好地入睡', '20分钟'),
      (6, '自我接纳练习', 'article', '学会接受不完美的自己', '8分钟')
    `);
    console.log('✅ 健康资源创建完成');

    console.log('\n🎉 种子数据导入完成！');
    console.log('\n测试账号:');
    console.log('  邮箱: test@example.com');
    console.log('  密码: 123456');
  } catch (error) {
    console.error('种子数据导入失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
};

runSeed().catch(console.error);
