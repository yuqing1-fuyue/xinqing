/**
 * 数据库初始化脚本
 * 运行方式: node src/scripts/init-db.js
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  let connection;
  
  // 尝试不同的连接方式
  const connectionOptions = [
    { user: 'root', password: '', host: 'localhost' },
    { user: 'root', password: 'root', host: 'localhost' },
    { user: 'root', password: 'password', host: 'localhost' },
  ];

  for (const options of connectionOptions) {
    try {
      console.log(`尝试连接: ${options.user}@${options.host}...`);
      connection = await mysql.createConnection(options);
      console.log('✅ 连接成功！');
      break;
    } catch (err) {
      console.log(`❌ 连接失败: ${err.message}`);
      connection = null;
    }
  }

  if (!connection) {
    console.error('\n❌ 无法连接到 MySQL，请检查：');
    console.error('1. MySQL 服务是否运行');
    console.error('2. 用户名和密码是否正确');
    console.error('3. 或手动运行 init-db.sql 创建数据库');
    process.exit(1);
  }

  try {
    // 创建数据库
    console.log('\n📦 创建数据库...');
    await connection.query('CREATE DATABASE IF NOT EXISTS xinqing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await connection.query('USE xinqing');
    console.log('✅ 数据库 xinqing 创建成功');

    // 读取并执行 SQL 脚本
    const sqlPath = path.join(__dirname, '..', '..', 'init-db.sql');
    let sql = fs.readFileSync(sqlPath, 'utf8');
    
    // 移除 CREATE DATABASE 和 USE 语句（已执行）
    sql = sql.replace(/CREATE DATABASE.*?;/gi, '');
    sql = sql.replace(/USE xinqing;/gi, '');
    
    // 分割并执行 SQL 语句
    const statements = sql.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.query(statement);
        } catch (err) {
          // 忽略表已存在的错误
          if (!err.message.includes('already exists')) {
            console.error(`执行失败: ${statement.substring(0, 50)}...`);
          }
        }
      }
    }
    
    console.log('✅ 数据表创建成功');

    // 验证
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n📋 当前数据表:');
    tables.forEach(t => console.log(`  - ${Object.values(t)[0]}`));

    console.log('\n✅ 数据库初始化完成！');
  } catch (err) {
    console.error('❌ 初始化失败:', err.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
