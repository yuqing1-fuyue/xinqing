const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 所有路由都需要认证 + admin权限
router.use(authenticate);
router.use(requireAdmin);

// ════════════════════════════════════════
//   仪表盘 - 数据统计
// ════════════════════════════════════════

router.get('/dashboard', (req, res) => {
  try {
    var userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    var todayUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = DATE('now', 'localtime')").get();
    var moodCount = db.prepare('SELECT COUNT(*) as count FROM moods').get();
    var treeholeCount = db.prepare('SELECT COUNT(*) as count FROM treehole').get();
    var groupCount = db.prepare('SELECT COUNT(*) as count FROM groups').get();
    var messageCount = db.prepare('SELECT COUNT(*) as count FROM messages').get();
    var commentCount = db.prepare('SELECT COUNT(*) as count FROM treehole_comments').get();
    var activeToday = db.prepare("SELECT COUNT(DISTINCT user_id) as count FROM moods WHERE DATE(created_at) = DATE('now', 'localtime')").get();

    res.json({
      stats: {
        totalUsers: userCount.count,
        newUsersToday: todayUsers.count,
        totalMoods: moodCount.count,
        totalPosts: treeholeCount.count,
        totalGroups: groupCount.count,
        totalMessages: messageCount.count,
        totalComments: commentCount.count,
        activeUsersToday: activeToday.count
      }
    });
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

// ════════════════════════════════════════
//   用户管理
// ════════════════════════════════════════

// 获取用户列表（分页，支持搜索）
router.get('/users', (req, res) => {
  try {
    var page = parseInt(req.query.page) || 1;
    var limit = parseInt(req.query.limit) || 20;
    var search = req.query.search || '';
    var offset = (page - 1) * limit;

    var whereClause = "WHERE role != 'bot'";
    var params = [];

    if (search) {
      whereClause += " AND (username LIKE ? OR nickname LIKE ? OR email LIKE ? OR display_id LIKE ?)";
      var searchTerm = '%' + search + '%';
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    var countSql = "SELECT COUNT(*) as total FROM users " + whereClause;
    var totalResult = db.prepare(countSql).apply(null, params);
    var total = totalResult.total;

    var sql = "SELECT id, username, email, nickname, avatar, role, school_id, display_id, created_at, updated_at FROM users " + whereClause + " ORDER BY id DESC LIMIT ? OFFSET ?";
    var users = db.prepare(sql).all(...params, limit, offset);

    res.json({ users, total, page, limit });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// 获取单个用户详情（含更多统计信息）
router.get('/users/:id', (req, res) => {
  try {
    var userId = parseInt(req.params.id);
    var user = db.users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 用户统计
    var moodStat = db.prepare('SELECT COUNT(*) as count FROM moods WHERE user_id = ?').get(userId);
    var postStat = db.prepare('SELECT COUNT(*) as count FROM treehole WHERE user_id = ?').get(userId);
    var commentStat = db.prepare('SELECT COUNT(*) as count FROM treehole_comments WHERE user_id = ?').get(userId);
    var msgSent = db.prepare('SELECT COUNT(*) as count FROM messages WHERE sender_id = ?').get(userId);
    var groupCount = db.prepare('SELECT COUNT(*) as count FROM group_members WHERE user_id = ?').get(userId);

    res.json({
      ...user,
      statistics: {
        moods: moodStat.count,
        posts: postStat.count,
        comments: commentStat.count,
        messagesSent: msgSent.count,
        groupsJoined: groupCount.count
      }
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({ error: '获取用户详情失败' });
  }
});

// 更新用户角色/状态
router.put('/users/:id', (req, res) => {
  try {
    var userId = parseInt(req.params.id);
    var { role, nickname, avatar } = req.body;

    var user = db.users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    var updates = [];
    var params = [];

    if (role && ['user', 'admin', 'counselor'].includes(role)) {
      updates.push('role = ?');
      params.push(role);
    }
    if (nickname !== undefined) {
      updates.push('nickname = ?');
      params.push(nickname);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      params.push(avatar);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(userId);
      db.prepare('UPDATE users SET ' + updates.join(', ') + ' WHERE id = ?').apply(null, params);
    }

    var updatedUser = db.users.findById(userId);
    res.json({ message: '更新成功', user: updatedUser });
  } catch (error) {
    console.error('更新用户失败:', error);
    res.status(500).json({ error: '更新用户失败' });
  }
});

// 删除用户
router.delete('/users/:id', (req, res) => {
  try {
    var userId = parseInt(req.params.id);

    if (userId === req.userId) {
      return res.status(400).json({ error: '不能删除自己的账号' });
    }

    var user = db.users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    if (user.role === 'bot') {
      return res.status(400).json({ error: '不能删除系统机器人账号' });
    }

    // 级联删除相关数据
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    res.json({ message: '用户已删除' });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ error: '删除用户失败' });
  }
});

// 重置用户密码
router.put('/users/:id/reset-password', async (req, res) => {
  try {
    var userId = parseInt(req.params.id);
    var { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: '新密码至少6位' });
    }

    var user = db.users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hashedPassword, userId);
    res.json({ message: '密码重置成功' });
  } catch (error) {
    console.error('重置密码失败:', error);
    res.status(500).json({ error: '重置密码失败' });
  }
});

// ════════════════════════════════════════
//   内容管理 - 树洞帖子
// ════════════════════════════════════════

router.get('/posts', (req, res) => {
  try {
    var page = parseInt(req.query.page) || 1;
    var limit = parseInt(req.query.limit) || 20;
    var offset = (page - 1) * limit;

    var totalResult = db.prepare('SELECT COUNT(*) as total FROM treehole').get();
    var posts = db.db.prepare(`
      SELECT t.*, u.nickname, u.display_id, c.name as category_name
      FROM treehole t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN treehole_categories c ON t.category_id = c.id
      ORDER BY t.created_at DESC LIMIT ? OFFSET ?
    `).all(limit, offset);

    res.json({ posts, total: totalResult.total, page, limit });
  } catch (error) {
    console.error('获取帖子列表失败:', error);
    res.status(500).json({ error: '获取帖子列表失败' });
  }
});

// 删除树洞帖子
router.delete('/posts/:id', (req, res) => {
  try {
    var postId = parseInt(req.params.id);
    var post = db.prepare('SELECT id FROM treehole WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }
    db.prepare('DELETE FROM treehole WHERE id = ?').run(postId);
    res.json({ message: '帖子已删除' });
  } catch (error) {
    console.error('删除帖子失败:', error);
    res.status(500).json({ error: '删除帖子失败' });
  }
});

// ════════════════════════════════════════
//   内容管理 - 评论
// ════════════════════════════════════════

router.get('/comments', (req, res) => {
  try {
    var page = parseInt(req.query.page) || 1;
    var limit = parseInt(req.query.limit) || 30;
    var offset = (page - 1) * limit;

    var totalResult = db.prepare('SELECT COUNT(*) as total FROM treehole_comments').get();
    var comments = db.db.prepare(`
      SELECT tc.*, u.nickname, u.display_id, t.content as post_preview
      FROM treehole_comments tc
      LEFT JOIN users u ON tc.user_id = u.id
      LEFT JOIN treehole t ON tc.post_id = t.id
      ORDER BY tc.created_at DESC LIMIT ? OFFSET?
    `).all(limit, offset);

    res.json({ comments, total: totalResult.total, page, limit });
  } catch (error) {
    console.error('获取评论列表失败:', error);
    res.status(500).json({ error: '获取评论列表失败' });
  }
});

// 删除评论
router.delete('/comments/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM treehole_comments WHERE id = ?').run(parseInt(req.params.id));
    res.json({ message: '评论已删除' });
  } catch (error) {
    console.error('删除评论失败:', error);
    res.status(500).json({ error: '删除评论失败' });
  }
});

// ════════════════════════════════════════
//   群组管理
// ════════════════════════════════════════

router.get('/groups', (req, res) => {
  try {
    var groups = db.groups.findAll(100);
    res.json({ groups });
  } catch (error) {
    console.error('获取群组列表失败:', error);
    res.status(500).json({ error: '获取群组列表失败' });
  }
});

// 删除群组
router.delete('/groups/:id', (req, res) => {
  try {
    var groupId = parseInt(req.params.id);
    db.prepare('DELETE FROM groups WHERE id = ?').run(groupId);
    res.json({ message: '群组已删除' });
  } catch (error) {
    console.error('删除群组失败:', error);
    res.status(500).json({ error: '删除群组失败' });
  }
});

module.exports = router;
