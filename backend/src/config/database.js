/**
 * SQLite 数据库配置 - 企业级存储
 * 使用 better-sqlite3，无需额外配置
 * 支持敏感数据加密存储
 */
const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('../utils/crypto');

// 数据库文件路径
// Render 持久化磁盘：/opt/render/project/.persist/data
// 本地开发：./data
var DB_PATH;
if (process.env.RENDER || process.env.NODE_ENV === 'production') {
  DB_PATH = '/opt/render/project/.persist/data/xinqing.db';
} else {
  DB_PATH = path.join(__dirname, '..', '..', 'data', 'xinqing.db');
}

// 确保 data 目录存在
const fs = require('fs');
var dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 创建数据库连接
const db = new Database(DB_PATH);

// 启用外键支持
db.pragma('foreign_keys = ON');

// 初始化数据表
function initTables() {
  // 用户表（添加学校字段）
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      nickname TEXT,
      avatar TEXT DEFAULT '👤',
      school_id INTEGER,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'counselor', 'admin', 'bot')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 私信表
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      is_anonymous INTEGER DEFAULT 0,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 关怀消息表
  db.exec(`
    CREATE TABLE IF NOT EXISTS care_messages (
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

  // 心情记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS moods (
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

  // 树洞分类表
  db.exec(`
    CREATE TABLE IF NOT EXISTS treehole_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT DEFAULT '📝',
      description TEXT,
      type TEXT DEFAULT 'general' CHECK(type IN ('general', 'campus')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 学校表
  db.exec(`
    CREATE TABLE IF NOT EXISTS schools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      province TEXT,
      city TEXT,
      type TEXT DEFAULT 'university' CHECK(type IN ('university', 'college', 'high_school')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 群组表
  db.exec(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      school_id INTEGER,
      category_id INTEGER,
      description TEXT,
      member_count INTEGER DEFAULT 0,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL,
      FOREIGN KEY (category_id) REFERENCES treehole_categories(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // 群组成员表
  db.exec(`
    CREATE TABLE IF NOT EXISTS group_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(group_id, user_id),
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 树洞表（扩展字段）
  db.exec(`
    CREATE TABLE IF NOT EXISTS treehole (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      category_id INTEGER,
      group_id INTEGER,
      school_id INTEGER,
      is_anonymous INTEGER DEFAULT 1,
      likes_count INTEGER DEFAULT 0,
      comment_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES treehole_categories(id) ON DELETE SET NULL,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL,
      FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL
    )
  `);

  // 树洞评论表
  db.exec(`
    CREATE TABLE IF NOT EXISTS treehole_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      is_anonymous INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES treehole(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 聊天消息表
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'ai')),
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 群聊消息表
  db.exec(`
    CREATE TABLE IF NOT EXISTS group_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      message_type TEXT DEFAULT 'text' CHECK(message_type IN ('text', 'image', 'system')),
      reply_to INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reply_to) REFERENCES group_messages(id) ON DELETE SET NULL
    )
  `);

  // 健康资源表
  db.exec(`
    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT,
      content TEXT,
      url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 初始化默认分类
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM treehole_categories').get();
  if (categoryCount.count === 0) {
    const insertCategory = db.prepare('INSERT INTO treehole_categories (name, icon, description, type) VALUES (?, ?, ?, ?)');
    insertCategory.run('心灵树洞', '🌳', '倾诉心事，分享感悟', 'general');
    insertCategory.run('校园心事', '🏫', '校园生活，青春故事', 'campus');
    insertCategory.run('情感交流', '💕', '关于爱与被爱', 'general');
    insertCategory.run('职场减压', '💼', '工作烦恼，职场成长', 'general');
    insertCategory.run('学习方法', '📚', '学习技巧，共同进步', 'general');
  }

  // 插入默认健康资源
  const resourceCount = db.prepare('SELECT COUNT(*) as count FROM resources').get();
  if (resourceCount.count === 0) {
    const insertResource = db.prepare('INSERT INTO resources (title, category, content) VALUES (?, ?, ?)');
    insertResource.run('正念冥想入门', 'exercise', '每天10分钟，找回内心平静');
    insertResource.run('如何应对焦虑情绪', 'article', '科学方法帮助你缓解焦虑');
    insertResource.run('情绪管理技巧', 'video', '学会调节和管理自己的情绪');
    insertResource.run('压力指数测试', 'test', '了解你目前的压力水平');
  }

  // 初始化学校数据
  const schoolCount = db.prepare('SELECT COUNT(*) as count FROM schools').get();
  if (schoolCount.count === 0) {
    const insertSchool = db.prepare('INSERT INTO schools (name, province, city, type) VALUES (?, ?, ?, ?)');
    const schools = require('../data/schools');
    for (const school of schools) {
      insertSchool.run(school.name, school.province, school.city, school.type);
    }
    console.log(`✅ 已初始化 ${schools.length} 所学校`);
  }

  // 初始化心晴小助手（bot用户）
  const botUser = db.prepare("SELECT * FROM users WHERE role = 'bot'").get();
  if (!botUser) {
    // 心晴小助手默认密码（系统内部使用）
    const bcrypt = require('bcryptjs');
    const botPasswordHash = bcrypt.hashSync('xinqing-bot-secret-2024', 10);
    db.prepare("INSERT INTO users (username, email, password_hash, nickname, avatar, role) VALUES (?, ?, ?, ?, ?, ?)").run(
      'xinqing_assistant',
      'bot@xinqing.local',
      botPasswordHash,
      '心晴小助手',
      '🌸',
      'bot'
    );
    console.log('✅ 已初始化心晴小助手');
  }

  // ====== 用户ID系统迁移 ======
  try {
    var userCols = db.prepare("PRAGMA table_info(users)").all();
    var hasDisplayId = userCols.some(function(c) { return c.name === 'display_id'; });
    if (!hasDisplayId) {
      db.exec('ALTER TABLE users ADD COLUMN display_id TEXT');
      db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_display_id ON users(display_id)');
      console.log('✅ 已添加 users.display_id 列');
      // 为现有用户分配 display_id（从 000001 开始）
      var existingUsers = db.prepare('SELECT id FROM users ORDER BY id ASC').all();
      for (var i = 0; i < existingUsers.length; i++) {
        var did = String(i + 1).padStart(6, '0');
        db.prepare('UPDATE users SET display_id = ? WHERE id = ?').run(did, existingUsers[i].id);
      }
      console.log('✅ 已为 ' + existingUsers.length + ' 位用户分配 display_id');
    }

    // 设置下一个用户ID的计数器
    var maxDisplayUser = db.prepare("SELECT MAX(CAST(display_id AS INTEGER)) as maxid FROM users WHERE display_id IS NOT NULL").get();
    db.nextDisplayUserId = (maxDisplayUser.maxid || 0) + 1;
  } catch(e) {
    console.log('⚠️ 用户ID迁移跳过:', e.message);
    db.nextDisplayUserId = 1;
  }

  // ====== 群组ID系统迁移 ======
  try {
    var groupCols = db.prepare("PRAGMA table_info(groups)").all();
    var hasGroupCode = groupCols.some(function(c) { return c.name === 'group_code'; });
    if (!hasGroupCode) {
      db.exec('ALTER TABLE groups ADD COLUMN group_code TEXT');
      db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_groups_group_code ON groups(group_code)');
      console.log('✅ 已添加 groups.group_code 列');
      // 为现有群组分配 group_code（从 00001 开始）
      var existingGroups = db.prepare('SELECT id FROM groups ORDER BY id ASC').all();
      for (var j = 0; j < existingGroups.length; j++) {
        var gc = String(j + 1).padStart(5, '0');
        db.prepare('UPDATE groups SET group_code = ? WHERE id = ?').run(gc, existingGroups[j].id);
      }
      console.log('✅ 已为 ' + existingGroups.length + ' 个群组分配 group_code');
    }
    var maxCodeGroup = db.prepare("SELECT MAX(CAST(group_code AS INTEGER)) as maxgc FROM groups WHERE group_code IS NOT NULL").get();
    db.nextGroupCode = (maxCodeGroup.maxgc || 0) + 1;
  } catch(e2) {
    console.log('⚠️ 群组ID迁移跳过:', e2.message);
    db.nextGroupCode = 1;
  }

  console.log('✅ SQLite 数据库初始化完成');
}

// 初始化表
initTables();

// 导出数据库实例和便捷方法
module.exports = {
  db,
  
  // 用户操作
  users: {
    create: function(username, email, passwordHash, nickname, schoolId) {
      schoolId = schoolId || null;
      var displayId = String(db.nextDisplayUserId++).padStart(6, '0');
      var stmt = db.prepare('INSERT INTO users (username, email, password_hash, nickname, school_id, display_id) VALUES (?, ?, ?, ?, ?, ?)');
      return stmt.run(username, email, passwordHash, nickname, schoolId, displayId);
    },
    findByEmail: function(email) { return db.prepare('SELECT * FROM users WHERE email = ?').get(email); },
    findByUsername: function(username) { return db.prepare('SELECT * FROM users WHERE username = ?').get(username); },
    findById: function(id) { return db.prepare('SELECT id, username, email, nickname, avatar, role, school_id, display_id, created_at FROM users WHERE id = ?').get(id); },
    findByDisplayId: function(displayId) { return db.prepare('SELECT id, username, email, nickname, avatar, role, school_id, display_id, created_at FROM users WHERE display_id = ?').get(displayId); },
    updateSchool: function(userId, schoolId) { return db.prepare('UPDATE users SET school_id = ? WHERE id = ?').run(schoolId, userId); },
  },

  // 心情记录操作（内容加密存储）
  moods: {
    create: (userId, mood, score, content, tags) => {
      const encryptedContent = content ? crypto.encrypt(content) : null;
      const stmt = db.prepare('INSERT INTO moods (user_id, mood, score, content, tags) VALUES (?, ?, ?, ?, ?)');
      return stmt.run(userId, mood, score, encryptedContent, tags ? JSON.stringify(tags) : null);
    },
    findByUser: (userId, limit = 30) => {
      const rows = db.prepare('SELECT * FROM moods WHERE user_id = ? ORDER BY created_at DESC LIMIT ?').all(userId, limit);
      return rows.map(r => ({
        ...r,
        content: r.content ? crypto.decrypt(r.content) : null,
        tags: r.tags ? JSON.parse(r.tags) : []
      }));
    },
  },

  // 树洞分类操作
  categories: {
    findAll: () => db.prepare('SELECT * FROM treehole_categories ORDER BY id').all(),
    findById: (id) => db.prepare('SELECT * FROM treehole_categories WHERE id = ?').get(id),
    findByType: (type) => db.prepare('SELECT * FROM treehole_categories WHERE type = ? OR type = ? ORDER BY id').all(type, 'general'),
  },

  // 学校操作
  schools: {
    findAll: (limit = 100) => db.prepare('SELECT * FROM schools ORDER BY name LIMIT ?').all(limit),
    findById: (id) => db.prepare('SELECT * FROM schools WHERE id = ?').get(id),
    search: (keyword) => db.prepare('SELECT * FROM schools WHERE name LIKE ? LIMIT 50').all(`%${keyword}%`),
    findByProvince: (province) => db.prepare('SELECT * FROM schools WHERE province = ? ORDER BY name').all(province),
  },

  // 群组操作
  groups: {
    create: function(name, schoolId, categoryId, description, createdBy) {
      var groupCode = String(db.nextGroupCode++).padStart(5, '0');
      var stmt = db.prepare('INSERT INTO groups (name, school_id, category_id, description, created_by, group_code) VALUES (?, ?, ?, ?, ?, ?)');
      return stmt.run(name, schoolId, categoryId, description, createdBy, groupCode);
    },
    findAll: function(limit) {
      limit = limit || 50;
      return db.prepare(`
        SELECT g.*, s.name as school_name, c.name as category_name,
               (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
        FROM groups g
        LEFT JOIN schools s ON g.school_id = s.id
        LEFT JOIN treehole_categories c ON g.category_id = c.id
        ORDER BY g.created_at DESC LIMIT ?
      `).all(limit);
    },
    findBySchool: function(schoolId) {
      return db.prepare(`
        SELECT g.*, c.name as category_name,
               (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
        FROM groups g
        LEFT JOIN treehole_categories c ON g.category_id = c.id
        WHERE g.school_id = ?
        ORDER BY member_count DESC
      `).all(schoolId);
    },
    findByUser: function(userId) {
      return db.prepare(`
        SELECT g.*, s.name as school_name, c.name as category_name, g.group_code
        FROM groups g
        LEFT JOIN schools s ON g.school_id = s.id
        LEFT JOIN treehole_categories c ON g.category_id = c.id
        INNER JOIN group_members gm ON g.id = gm.group_id
        WHERE gm.user_id = ?
      `).all(userId);
    },
    findByGroupCode: function(groupCode) {
      return db.prepare(`
        SELECT g.*, s.name as school_name, c.name as category_name,
               (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
        FROM groups g
        LEFT JOIN schools s ON g.school_id = s.id
        LEFT JOIN treehole_categories c ON g.category_id = c.id
        WHERE g.group_code = ?
      `).get(groupCode);
    },
    findById: function(id) {
      return db.prepare(`
        SELECT g.*, s.name as school_name, c.name as category_name,
               (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
        FROM groups g
        LEFT JOIN schools s ON g.school_id = s.id
        LEFT JOIN treehole_categories c ON g.category_id = c.id
        WHERE g.id = ?
      `).get(id);
    },
    addMember: (groupId, userId) => {
      try {
        db.prepare('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)').run(groupId, userId);
        db.prepare('UPDATE groups SET member_count = member_count + 1 WHERE id = ?').run(groupId);
        return true;
      } catch (e) {
        return false;
      }
    },
    removeMember: (groupId, userId) => {
      db.prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?').run(groupId, userId);
      db.prepare('UPDATE groups SET member_count = MAX(0, member_count - 1) WHERE id = ?').run(groupId);
    },
    isMember: (groupId, userId) => !!db.prepare('SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?').get(groupId, userId),
  },

  // 树洞操作（内容加密存储）
  treehole: {
    create: (userId, content, isAnonymous = true, categoryId = null, groupId = null, schoolId = null) => {
      const encryptedContent = crypto.encrypt(content);
      const stmt = db.prepare('INSERT INTO treehole (user_id, content, is_anonymous, category_id, group_id, school_id) VALUES (?, ?, ?, ?, ?, ?)');
      return stmt.run(userId, encryptedContent, isAnonymous ? 1 : 0, categoryId, groupId, schoolId);
    },
    findAll: (limit = 20, offset = 0, filters = {}) => {
      let sql = `
        SELECT t.*, u.nickname, u.avatar, u.school_id,
               c.name as category_name, c.icon as category_icon,
               s.name as school_name
        FROM treehole t 
        LEFT JOIN users u ON t.user_id = u.id 
        LEFT JOIN treehole_categories c ON t.category_id = c.id
        LEFT JOIN schools s ON t.school_id = s.id
      `;
      const params = [];
      
      if (filters.schoolId) {
        sql += ' WHERE t.school_id = ?';
        params.push(filters.schoolId);
      }
      if (filters.groupId) {
        sql += filters.schoolId ? ' AND' : ' WHERE';
        sql += ' t.group_id = ?';
        params.push(filters.groupId);
      }
      if (filters.categoryId) {
        sql += filters.schoolId || filters.groupId ? ' AND' : ' WHERE';
        sql += ' t.category_id = ?';
        params.push(filters.categoryId);
      }
      
      sql += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const rows = db.prepare(sql).all(...params);
      return rows.map(r => ({
        ...r,
        content: crypto.decrypt(r.content)
      }));
    },
    findById: (id) => {
      const row = db.prepare(`
        SELECT t.*, u.nickname, u.avatar, u.school_id,
               c.name as category_name, c.icon as category_icon,
               s.name as school_name
        FROM treehole t 
        LEFT JOIN users u ON t.user_id = u.id 
        LEFT JOIN treehole_categories c ON t.category_id = c.id
        LEFT JOIN schools s ON t.school_id = s.id
        WHERE t.id = ?
      `).get(id);
      if (row) {
        row.content = crypto.decrypt(row.content);
      }
      return row;
    },
    incrementComment: (id) => db.prepare('UPDATE treehole SET comment_count = comment_count + 1 WHERE id = ?').run(id),
  },

  // 树洞评论操作
  comments: {
    create: (postId, userId, content, isAnonymous = true) => {
      const encryptedContent = crypto.encrypt(content);
      const stmt = db.prepare('INSERT INTO treehole_comments (post_id, user_id, content, is_anonymous) VALUES (?, ?, ?, ?)');
      return stmt.run(postId, userId, encryptedContent, isAnonymous ? 1 : 0);
    },
    findByPost: (postId) => {
      const rows = db.prepare(`
        SELECT c.*, u.nickname, u.avatar
        FROM treehole_comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
      `).all(postId);
      return rows.map(r => ({
        ...r,
        content: crypto.decrypt(r.content)
      }));
    },
  },

  // 聊天消息操作（内容加密存储）
  chat: {
    create: (userId, role, content) => {
      const encryptedContent = crypto.encrypt(content);
      const stmt = db.prepare('INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)');
      return stmt.run(userId, role, encryptedContent);
    },
    findByUser: (userId, limit = 50) => {
      const rows = db.prepare('SELECT * FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ?').all(userId, limit);
      return rows.map(r => ({
        ...r,
        content: crypto.decrypt(r.content)
      }));
    },
    clear: (userId) => db.prepare('DELETE FROM chat_messages WHERE user_id = ?').run(userId),
  },

  // 群聊消息操作
  groupMessages: {
    create: (groupId, userId, content, messageType = 'text', replyTo = null) => {
      const encryptedContent = crypto.encrypt(content);
      const stmt = db.prepare('INSERT INTO group_messages (group_id, user_id, content, message_type, reply_to) VALUES (?, ?, ?, ?, ?)');
      return stmt.run(groupId, userId, encryptedContent, messageType, replyTo);
    },
    findByGroup: (groupId, limit = 100) => {
      const rows = db.prepare(`
        SELECT gm.*, u.nickname, u.avatar
        FROM group_messages gm
        LEFT JOIN users u ON gm.user_id = u.id
        WHERE gm.group_id = ?
        ORDER BY gm.created_at ASC
        LIMIT ?
      `).all(groupId, limit);
      return rows.map(r => ({
        ...r,
        content: crypto.decrypt(r.content)
      }));
    },
    findRecent: (groupId, sinceId = 0, limit = 50) => {
      const rows = db.prepare(`
        SELECT gm.*, u.nickname, u.avatar
        FROM group_messages gm
        LEFT JOIN users u ON gm.user_id = u.id
        WHERE gm.group_id = ? AND gm.id > ?
        ORDER BY gm.created_at ASC
        LIMIT ?
      `).all(groupId, sinceId, limit);
      return rows.map(r => ({
        ...r,
        content: crypto.decrypt(r.content)
      }));
    },
  },

  // 健康资源操作
  resources: {
    findAll: () => db.prepare('SELECT * FROM resources ORDER BY created_at DESC').all(),
  },

  // 私信操作
  messages: {
    create: (senderId, receiverId, content, isAnonymous = false) => {
      const encryptedContent = crypto.encrypt(content);
      const stmt = db.prepare('INSERT INTO messages (sender_id, receiver_id, content, is_anonymous) VALUES (?, ?, ?, ?)');
      return stmt.run(senderId, receiverId, encryptedContent, isAnonymous ? 1 : 0);
    },
    findConversation: (userId, otherUserId, limit = 50) => {
      const rows = db.prepare(`
        SELECT m.*, 
               CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END as other_user_id,
               u.nickname as other_nickname, u.avatar as other_avatar,
               sender.nickname as sender_nickname, sender.avatar as sender_avatar
        FROM messages m
        LEFT JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
        LEFT JOIN users sender ON sender.id = m.sender_id
        WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
        ORDER BY m.created_at DESC
        LIMIT ?
      `).all(userId, userId, userId, otherUserId, otherUserId, userId, limit);
      return rows.map(r => ({
        ...r,
        content: crypto.decrypt(r.content)
      })).reverse();
    },
    getConversations: (userId) => {
      const rows = db.prepare(`
        SELECT 
          CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END as other_user_id,
          u.nickname as other_nickname, u.avatar as other_avatar,
          MAX(m.created_at) as last_time,
          (SELECT content FROM messages m2 WHERE 
            (m2.sender_id = ? AND m2.receiver_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END)
            OR (m2.receiver_id = ? AND m2.sender_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END)
          ORDER BY m2.created_at DESC LIMIT 1) as last_message,
          (SELECT COUNT(*) FROM messages m3 WHERE m3.sender_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END AND m3.receiver_id = ? AND m3.is_read = 0) as unread_count
        FROM messages m
        LEFT JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
        WHERE m.sender_id = ? OR m.receiver_id = ?
        GROUP BY other_user_id
        ORDER BY last_time DESC
      `).all(userId, userId, userId, userId, userId, userId, userId, userId, userId, userId);
      return rows.map(r => ({
        ...r,
        last_message: r.last_message ? crypto.decrypt(r.last_message) : null
      }));
    },
    markAsRead: (userId, otherUserId) => {
      db.prepare('UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0').run(otherUserId, userId);
    },
    getUnreadCount: (userId) => {
      const result = db.prepare('SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0').get(userId);
      return result.count;
    },
  },

  // 关怀消息操作（系统自动发送）
  cares: {
    create: (userId, type, message, relatedMoodId = null) => {
      const stmt = db.prepare('INSERT INTO care_messages (user_id, type, message, related_mood_id) VALUES (?, ?, ?, ?)');
      return stmt.run(userId, type, message, relatedMoodId);
    },
    findByUser: (userId, limit = 20) => {
      return db.prepare('SELECT * FROM care_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ?').all(userId, limit);
    },
    markAsRead: (userId) => {
      db.prepare('UPDATE care_messages SET is_read = 1 WHERE user_id = ?').run(userId);
    },
    getUnreadCount: (userId) => {
      const result = db.prepare('SELECT COUNT(*) as count FROM care_messages WHERE user_id = ? AND is_read = 0').get(userId);
      return result.count;
    },
  },

  // 关怀消息表
  initCareTable: () => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS care_messages (
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
  },
};
