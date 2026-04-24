const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取学校列表
router.get('/', async (req, res) => {
  try {
    const { province, search, limit = 100 } = req.query;
    
    let schools;
    if (search) {
      schools = db.schools.search(search);
    } else if (province) {
      schools = db.schools.findByProvince(province);
    } else {
      schools = db.schools.findAll(parseInt(limit));
    }
    
    res.json({ success: true, schools });
  } catch (error) {
    console.error('获取学校列表错误:', error);
    res.status(500).json({ success: false, error: '获取学校列表失败' });
  }
});

// 获取单个学校
router.get('/:id', async (req, res) => {
  try {
    const school = db.schools.findById(parseInt(req.params.id));
    
    if (!school) {
      return res.status(404).json({ success: false, error: '学校不存在' });
    }
    
    res.json({ success: true, school });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取学校信息失败' });
  }
});

// 搜索学校
router.get('/search/:keyword', async (req, res) => {
  try {
    const schools = db.schools.search(req.params.keyword);
    res.json({ success: true, schools });
  } catch (error) {
    res.status(500).json({ success: false, error: '搜索失败' });
  }
});

module.exports = router;
