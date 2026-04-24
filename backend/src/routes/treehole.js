const express = require('express');
const db = require('../config/database');
const { filter } = require('../utils/sensitive');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ============ 树洞分类 ============

// 获取所有分类
router.get('/categories', async (req, res) => {
  try {
    const categories = db.categories.findAll();
    res.json({ success: true, categories });
  } catch (error) {
    console.error('获取分类错误:', error);
    res.status(500).json({ success: false, error: '获取分类失败' });
  }
});

// ============ 树洞列表 ============

// 获取树洞列表（支持分类筛选）
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { categoryId, schoolId, groupId, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const filters = {};
    if (categoryId) filters.categoryId = parseInt(categoryId);
    if (schoolId) filters.schoolId = parseInt(schoolId);
    if (groupId) filters.groupId = parseInt(groupId);
    
    const posts = db.treehole.findAll(parseInt(limit), offset, filters);
    
    res.json({ 
      success: true, 
      posts,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('获取树洞列表错误:', error);
    res.status(500).json({ success: false, error: '获取列表失败' });
  }
});

// ============ 发布树洞 ============

router.post('/', authenticate, async (req, res) => {
  try {
    const { content, categoryId, schoolId, groupId, isAnonymous = true } = req.body;
    
    // 敏感词过滤
    if (content) {
      const result = filter.check(content);
      if (result) {
        return res.status(400).json({ 
          success: false, 
          error: '内容包含敏感词，请修改后重试',
          filtered: filter.filter(content).filtered
        });
      }
    }
    
    if (!content || content.trim().length < 2) {
      return res.status(400).json({ success: false, error: '内容至少2个字符' });
    }
    
    const result = db.treehole.create(
      req.userId, 
      content.trim(), 
      isAnonymous !== false,
      categoryId || null,
      groupId || null,
      schoolId || null
    );
    
    res.status(201).json({ 
      success: true, 
      message: '发布成功', 
      postId: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('发布树洞错误:', error);
    res.status(500).json({ success: false, error: '发布失败' });
  }
});

// ============ 树洞详情 ============

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = db.treehole.findById(parseInt(req.params.id));
    
    if (!post) {
      return res.status(404).json({ success: false, error: '帖子不存在' });
    }
    
    // 获取评论
    const comments = db.comments.findByPost(post.id);
    
    res.json({ success: true, post, comments });
  } catch (error) {
    console.error('获取详情错误:', error);
    res.status(500).json({ success: false, error: '获取详情失败' });
  }
});

// ============ 树洞评论 ============

// 发布评论
router.post('/:id/comment', authenticate, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { content, isAnonymous = true } = req.body;
    
    // 敏感词过滤
    if (content) {
      const result = filter.check(content);
      if (result) {
        return res.status(400).json({ 
          success: false, 
          error: '内容包含敏感词，请修改后重试' 
        });
      }
    }
    
    if (!content || content.trim().length < 1) {
      return res.status(400).json({ success: false, error: '评论内容不能为空' });
    }
    
    // 检查帖子是否存在
    const post = db.treehole.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: '帖子不存在' });
    }
    
    const result = db.comments.create(postId, req.userId, content.trim(), isAnonymous !== false);
    db.treehole.incrementComment(postId);
    
    res.status(201).json({ 
      success: true, 
      message: '评论成功',
      commentId: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('评论错误详情:', error.message, error.stack);
    res.status(500).json({ success: false, error: '评论失败: ' + (error.message || '服务器错误') });
  }
});

// 获取评论列表
router.get('/:id/comments', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const comments = db.comments.findByPost(postId);
    res.json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取评论失败' });
  }
});

module.exports = router;
