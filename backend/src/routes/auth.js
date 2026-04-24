const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { registerRules, loginRules, handleValidation } = require('../validators');

const router = express.Router();

// 注册
router.post('/register', registerRules, handleValidation, async (req, res) => {
  try {
    const { username, email, password, nickname } = req.body;

    // 检查用户是否存在
    const existingEmail = db.users.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: '该邮箱已被注册' });
    }

    const existingUsername = db.users.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ error: '该用户名已被使用' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const result = db.users.create(username, email, hashedPassword, nickname || username);
    const userId = result.lastInsertRowid;

    // 生成token
    const token = jwt.sign(
      { userId, email, username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: userId,
        username,
        email,
        nickname: nickname || username
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

// 登录
router.post('/login', loginRules, handleValidation, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = db.users.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// 获取当前用户信息
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

// 登出
router.post('/logout', (req, res) => {
  res.json({ message: '已退出登录' });
});

module.exports = router;
