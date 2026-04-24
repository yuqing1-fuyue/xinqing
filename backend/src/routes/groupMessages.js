const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取群组消息列表
router.get('/:groupId/messages', authenticate, async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const { limit = 100 } = req.query;
    
    // 检查用户是否是群组成员
    const isMember = db.groups.isMember(groupId, req.userId);
    if (!isMember) {
      return res.status(403).json({ success: false, error: '你不是该群组的成员' });
    }
    
    const messages = db.groupMessages.findByGroup(groupId, parseInt(limit));
    res.json({ success: true, messages });
  } catch (error) {
    console.error('获取群消息错误:', error);
    res.status(500).json({ success: false, error: '获取消息失败' });
  }
});

// 发送群消息
router.post('/:groupId/messages', authenticate, async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const { content, replyTo } = req.body;
    
    // 检查是否为成员
    const isMember = db.groups.isMember(groupId, req.userId);
    if (!isMember) {
      return res.status(403).json({ success: false, error: '请先加入群组' });
    }
    
    if (!content || content.trim().length < 1) {
      return res.status(400).json({ success: false, error: '消息内容不能为空' });
    }
    
    if (content.length > 2000) {
      return res.status(400).json({ success: false, error: '消息长度不能超过2000字' });
    }
    
    const result = db.groupMessages.create(groupId, req.userId, content.trim(), 'text', replyTo || null);
    
    res.status(201).json({
      success: true,
      messageId: result.lastInsertRowid,
      message: '发送成功'
    });
  } catch (error) {
    console.error('发送群消息错误:', error);
    res.status(500).json({ success: false, error: '发送失败' });
  }
});

// 获取最新消息（轮询用）
router.get('/:groupId/messages/recent', authenticate, async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const { sinceId = 0, limit = 50 } = req.query;
    
    const isMember = db.groups.isMember(groupId, req.userId);
    if (!isMember) {
      return res.status(403).json({ success: false, error: '你不是该群组成员' });
    }
    
    const messages = db.groupMessages.findRecent(groupId, parseInt(sinceId), parseInt(limit));
    res.json({ success: true, messages });
  } catch (error) {
    console.error('获取最新消息错误:', error);
    res.status(500).json({ success: false, error: '获取失败' });
  }
});

module.exports = router;
