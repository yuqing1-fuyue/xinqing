const express = require('express');
const db = require('../config/database');

const router = express.Router();

// 获取推荐资源
router.get('/recommended', (req, res) => {
  try {
    const resources = db.resources.findAll();
    res.json({ resources, success: true });
  } catch (error) {
    console.error('获取推荐资源错误:', error);
    res.status(500).json({ error: '获取失败', success: false });
  }
});

// 获取健康资源列表
router.get('/resources', (req, res) => {
  try {
    const resources = db.resources.findAll();
    res.json({ resources, success: true });
  } catch (error) {
    console.error('获取资源列表错误:', error);
    res.status(500).json({ error: '获取列表失败', success: false });
  }
});

// 搜索资源
router.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ results: [], success: true });
    }
    const searchTerm = `%${q}%`;
    const results = db.db.prepare(`
      SELECT * FROM resources 
      WHERE title LIKE ? OR content LIKE ? OR category LIKE ?
      ORDER BY created_at DESC
    `).all(searchTerm, searchTerm, searchTerm);
    res.json({ results, success: true });
  } catch (error) {
    console.error('搜索资源错误:', error);
    res.status(500).json({ error: '搜索失败', success: false });
  }
});

// 获取单个资源
router.get('/resources/:id', (req, res) => {
  try {
    const resource = db.db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: '资源不存在', success: false });
    }
    res.json({ resource, success: true });
  } catch (error) {
    res.status(500).json({ error: '获取详情失败', success: false });
  }
});

module.exports = router;
