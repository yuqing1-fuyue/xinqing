const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取对话列表
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const conversations = db.messages.getConversations(req.userId);
    res.json({ conversations });
  } catch (error) {
    console.error('获取对话列表错误:', error);
    res.status(500).json({ error: '获取对话列表失败' });
  }
});

// 获取与某个用户的对话
router.get('/conversation/:userId', authenticate, async (req, res) => {
  try {
    const otherUserId = parseInt(req.params.userId);
    const messages = db.messages.findConversation(req.userId, otherUserId);
    
    // 标记为已读
    db.messages.markAsRead(req.userId, otherUserId);
    
    res.json({ messages });
  } catch (error) {
    console.error('获取对话错误:', error);
    res.status(500).json({ error: '获取对话失败' });
  }
});

// 发送私信
router.post('/', authenticate, async (req, res) => {
  try {
    const { receiverId, content, isAnonymous = false } = req.body;
    
    if (!receiverId || !content || content.trim().length === 0) {
      return res.status(400).json({ error: '收件人和内容不能为空' });
    }
    
    if (content.length > 2000) {
      return res.status(400).json({ error: '内容不能超过2000字' });
    }
    
    // 不能给自己发私信
    if (receiverId === req.userId) {
      return res.status(400).json({ error: '不能给自己发私信' });
    }
    
    const result = db.messages.create(req.userId, receiverId, content, isAnonymous);
    res.status(201).json({ success: true, messageId: result.lastInsertRowid });
  } catch (error) {
    console.error('发送私信错误:', error);
    res.status(500).json({ error: '发送失败' });
  }
});

// 获取未读消息数
router.get('/unread', authenticate, async (req, res) => {
  try {
    const count = db.messages.getUnreadCount(req.userId);
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: '获取未读数失败' });
  }
});

// 标记对话已读
router.put('/read/:userId', authenticate, async (req, res) => {
  try {
    const otherUserId = parseInt(req.params.userId);
    db.messages.markAsRead(req.userId, otherUserId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '标记已读失败' });
  }
});

// 获取用户列表（用于发起私信，包括心晴小助手）
router.get('/users', authenticate, async (req, res) => {
  try {
    // 排除当前用户，显示其他所有用户包括bot
    const users = db.db.prepare("SELECT id, nickname, avatar, role FROM users WHERE id <> ?").all(req.userId);
    res.json({ users });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

module.exports = router;
