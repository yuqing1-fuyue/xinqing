const express = require('express');
const db = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// 通过 group_code 搜索群组
router.get('/search/:groupCode', (req, res) => {
  try {
    var groupCode = req.params.groupCode.trim();
    if (!groupCode || !/^\d+$/.test(groupCode)) {
      return res.status(400).json({ success: false, error: '群组ID格式不正确' });
    }
    // 补全为5位
    groupCode = groupCode.padStart(5, '0');
    var group = db.groups.findByGroupCode(groupCode);
    if (!group) {
      return res.status(404).json({ success: false, error: '未找到该群组ID对应的群组' });
    }
    res.json({ success: true, group: group });
  } catch (error) {
    console.error('搜索群组错误:', error);
    res.status(500).json({ success: false, error: '搜索失败' });
  }
});

// 获取群组列表
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { schoolId, limit = 50 } = req.query;
    
    let groups;
    if (schoolId) {
      groups = db.groups.findBySchool(parseInt(schoolId));
    } else {
      groups = db.groups.findAll(parseInt(limit));
    }
    
    res.json({ success: true, groups });
  } catch (error) {
    console.error('获取群组列表错误:', error);
    res.status(500).json({ success: false, error: '获取群组列表失败' });
  }
});

// 获取我的群组
router.get('/mine', authenticate, async (req, res) => {
  try {
    const groups = db.groups.findByUser(req.userId);
    res.json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取失败' });
  }
});

// 创建群组
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, schoolId, categoryId, description } = req.body;
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: '群组名称至少2个字符' });
    }
    
    const result = db.groups.create(
      name.trim(),
      schoolId || null,
      categoryId || null,
      description || null,
      req.userId
    );
    
    // 创建者自动加入
    db.groups.addMember(result.lastInsertRowid, req.userId);
    
    res.status(201).json({ 
      success: true, 
      message: '创建成功',
      groupId: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('创建群组错误:', error);
    res.status(500).json({ success: false, error: '创建失败' });
  }
});

// 加入群组
router.post('/:id/join', authenticate, async (req, res) => {
  try {
    const success = db.groups.addMember(parseInt(req.params.id), req.userId);
    
    if (success) {
      res.json({ success: true, message: '加入成功' });
    } else {
      res.status(400).json({ success: false, error: '已在群组中或加入失败' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: '操作失败' });
  }
});

// 退出群组
router.post('/:id/leave', authenticate, async (req, res) => {
  try {
    db.groups.removeMember(parseInt(req.params.id), req.userId);
    res.json({ success: true, message: '已退出群组' });
  } catch (error) {
    res.status(500).json({ success: false, error: '操作失败' });
  }
});

module.exports = router;
