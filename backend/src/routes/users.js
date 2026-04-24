const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 通过 display_id 搜索用户
router.get('/search/:displayId', (req, res) => {
  try {
    var displayId = req.params.displayId.trim();
    if (!displayId || !/^\d+$/.test(displayId)) {
      return res.status(400).json({ error: '用户ID格式不正确' });
    }
    // 补全为6位
    displayId = displayId.padStart(6, '0');
    var user = db.users.findByDisplayId(displayId);
    if (!user) {
      return res.status(404).json({ error: '未找到该用户ID对应的用户' });
    }
    // 不返回密码哈希
    res.json({ success: true, user: user });
  } catch (error) {
    res.status(500).json({ error: '搜索失败' });
  }
});

// 获取当前用户的 display_id
router.get('/my-id', authenticate, (req, res) => {
  try {
    var user = db.users.findById(req.userId);
    if (!user) return res.status(404).json({ error: '用户不存在' });
    res.json({ success: true, display_id: user.display_id });
  } catch (error) {
    res.status(500).json({ error: '获取失败' });
  }
});

// 获取用户信息
router.get('/:id', async (req, res) => {
  try {
    const user = db.users.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// 更新用户信息
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { nickname, avatar } = req.body;
    const stmt = db.db.prepare('UPDATE users SET nickname = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(nickname, avatar || '👤', req.userId);
    const user = db.users.findById(req.userId);
    res.json({ message: '更新成功', user });
  } catch (error) {
    res.status(500).json({ error: '更新失败' });
  }
});

// 修改密码
router.put('/password', authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    const user = db.users.findById(req.userId);
    const isValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: '原密码错误' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const stmt = db.db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(hashedPassword, req.userId);
    res.json({ message: '密码修改成功' });
  } catch (error) {
    res.status(500).json({ error: '修改密码失败' });
  }
});

module.exports = router;
