const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { moodRules, handleValidation } = require('../validators');

const router = express.Router();

// 关怀消息内容库
const careMessages = {
  sad: [
    '亲爱的，我看到你今天心情不太好。无论发生了什么，请记住，你不是一个人。我在这里陪着你。💝',
    '难过的时候，允许自己难过也是一种勇敢。我在这里，随时愿意倾听你的心声。🌙',
    '今天的阴霾终会过去。你的感受很重要，如果想聊聊，我一直都在。🌻',
  ],
  anxious: [
    '焦虑是一种信号，说明你在乎。试着把注意力放在当下这一刻，深呼吸，你比自己想象的更强大。🌿',
    '我理解你现在的紧张。请相信，事情没有你想象的那么糟糕。慢慢来，你做得很好。🌊',
  ],
  tired: [
    '你今天看起来有点疲惫。请记得照顾好自己，休息也是一种努力。🛋️',
    '累了就休息一下吧。你已经做得很好了，不需要一直逞强。💤',
  ],
};

// 自动发送关怀（心情不佳时自动发送关怀消息）
function autoSendCare(userId, mood, score, moodId) {
  // score 1-10 范围，< 4 表示心情不佳
  if (score && score < 4) {
    const moodType = score < 2 ? 'sad' : score < 3 ? 'anxious' : 'tired';
    const messages = careMessages[moodType] || careMessages.tired;
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    
    // 获取心晴小助手
    const bot = db.db.prepare("SELECT id FROM users WHERE role = 'bot'").get();
    if (bot) {
      db.messages.create(bot.id, userId, randomMsg, false);
    }
    db.cares.create(userId, 'auto', randomMsg, moodId);
    return randomMsg;
  }
  return null;
}

// 创建心情打卡
router.post('/', authenticate, moodRules, handleValidation, async (req, res) => {
  try {
    const { mood, score, content, tags } = req.body;
    console.log('[/moods POST] userId:', req.userId, 'mood:', mood, 'score:', score);
    
    const result = db.moods.create(req.userId, mood, score || 5, content, tags);
    console.log('[/moods POST] 创建成功, lastId:', result.lastInsertRowid);
    
    const moodId = result.lastInsertRowid;
    
    // 自动关怀检测
    console.log('[/moods POST] 调用 autoSendCare, score:', score);
    const careMessage = autoSendCare(req.userId, mood, score, moodId);
    console.log('[/moods POST] 关怀消息:', careMessage ? '已发送' : '无');
    
    res.status(201).json({ 
      message: '打卡成功', 
      moodId,
      careMessage
    });
  } catch (error) {
    console.error('创建心情打卡错误:', error.message, error.stack);
    res.status(500).json({ error: '打卡失败: ' + error.message });
  }
});

// 获取用户心情记录
router.get('/', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const moods = db.moods.findByUser(req.userId, limit);
    res.json({ moods });
  } catch (error) {
    res.status(500).json({ error: '获取记录失败' });
  }
});

// 获取心情统计
router.get('/stats', authenticate, async (req, res) => {
  try {
    const moods = db.moods.findByUser(req.userId, 100);
    
    // 计算统计数据
    const stats = {};
    moods.forEach(m => {
      const date = m.created_at.split('T')[0];
      if (!stats[date]) {
        stats[date] = { count: 0, totalScore: 0, moods: [] };
      }
      stats[date].count++;
      stats[date].totalScore += m.score || 50;
      stats[date].moods.push(m.mood);
    });
    
    const result = Object.entries(stats).map(([date, data]) => ({
      date,
      avg_score: (data.totalScore / data.count).toFixed(1),
      count: data.count,
      dominant_mood: data.moods.sort((a, b) => 
        data.moods.filter(v => v === b).length - data.moods.filter(v => v === a).length
      )[0]
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    res.json({ stats: result });
  } catch (error) {
    res.status(500).json({ error: '获取统计失败' });
  }
});

// 获取心情趋势
router.get('/trend', authenticate, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const moods = db.moods.findByUser(req.userId, days * 3);
    
    // 计算趋势数据
    const stats = {};
    moods.forEach(m => {
      const date = m.created_at.split('T')[0];
      if (!stats[date]) {
        stats[date] = { totalScore: 0, count: 0 };
      }
      stats[date].totalScore += m.score || 50;
      stats[date].count++;
    });
    
    const data = Object.entries(stats)
      .map(([date, data]) => ({ date, avg_score: (data.totalScore / data.count).toFixed(1) }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-days);
    
    const avgScore = data.length > 0 
      ? (data.reduce((sum, d) => sum + parseFloat(d.avg_score), 0) / data.length).toFixed(1)
      : 0;
    
    const trend = data.length >= 2
      ? (parseFloat(data[data.length - 1].avg_score) - parseFloat(data[0].avg_score)).toFixed(1)
      : 0;

    res.json({ avgScore: parseFloat(avgScore), trend: parseFloat(trend), data });
  } catch (error) {
    res.status(500).json({ error: '获取趋势失败' });
  }
});

module.exports = router;
