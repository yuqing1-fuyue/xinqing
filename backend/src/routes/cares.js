const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 关怀消息内容库
const careMessages = {
  sad: [
    '亲爱的，我看到你今天心情不太好。无论发生了什么，请记住，你不是一个人。我在这里陪着你。💝',
    '难过的时候，允许自己难过也是一种勇敢。我在这里，随时愿意倾听你的心声。🌙',
    '今天的阴霾终会过去。你的感受很重要，如果想聊聊，我一直都在。🌻',
    '心情低落的时候，可以试试深呼吸，或者听听喜欢的音乐。记住，你值得被温柔以待。🍵',
  ],
  anxious: [
    '焦虑是一种信号，说明你在乎。试着把注意力放在当下这一刻，深呼吸，你比自己想象的更强大。🌿',
    '我理解你现在的紧张。请相信，事情没有你想象的那么糟糕。慢慢来，你做得很好。🌊',
    '当思绪纷乱时，试着写下让你担心的事情，有时候把焦虑写下来，它就没那么可怕了。📝',
    '你正在经历的事情不会永远持续。请给自己一点时间和耐心，一切都会好起来的。🌈',
  ],
  tired: [
    '你今天看起来有点疲惫。请记得照顾好自己，休息也是一种努力。🛋️',
    '累了就休息一下吧。你已经做得很好了，不需要一直逞强。💤',
    '如果累了，就停下来休息一下。你不需要向任何人证明什么。🌸',
    '今天辛苦了。给自己泡杯热茶，或者听听喜欢的音乐，让身心都放松一下吧。☕',
  ],
  neutral: [
    '今天怎么样？无论发生什么，都请记得微笑，因为你值得拥有美好的一天。😊',
    '保持好心情哦！每天都是新的开始，带着希望前行吧。🌟',
    '愿你的今天比昨天更快乐。有什么想分享的，我在这里。🌈',
  ],
};

// 发送关怀消息
function sendCareMessage(userId, moodType, relatedMoodId = null) {
  const messages = careMessages[moodType] || careMessages.neutral;
  const randomMsg = messages[Math.floor(Math.random() * messages.length)];
  
  // 获取心晴小助手ID
  const bot = db.prepare("SELECT id FROM users WHERE role = 'bot'").get();
  if (bot) {
    // 通过私信发送关怀
    db.messages.create(bot.id, userId, randomMsg, false);
  }
  
  // 同时保存到关怀消息表
  db.cares.create(userId, 'auto', randomMsg, relatedMoodId);
  
  return randomMsg;
}

// 获取关怀消息
router.get('/', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const cares = db.cares.findByUser(req.userId, limit);
    
    // 标记已读
    db.cares.markAsRead(req.userId);
    
    res.json({ cares });
  } catch (error) {
    console.error('获取关怀消息错误:', error);
    res.status(500).json({ error: '获取关怀消息失败' });
  }
});

// 获取未读关怀数
router.get('/unread', authenticate, async (req, res) => {
  try {
    const count = db.cares.getUnreadCount(req.userId);
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: '获取未读数失败' });
  }
});

// 触发关怀检测（由心情打卡调用）
router.post('/check', authenticate, async (req, res) => {
  try {
    const { mood, score, moodId } = req.body;
    
    // 检测是否需要发送关怀：score < 40 表示心情不佳
    let careSent = null;
    if (score && score < 40) {
      const moodType = score < 25 ? 'sad' : score < 35 ? 'anxious' : 'tired';
      careSent = sendCareMessage(req.userId, moodType, moodId);
    }
    
    res.json({ success: true, careSent });
  } catch (error) {
    console.error('关怀检测错误:', error);
    res.status(500).json({ error: '关怀检测失败' });
  }
});

module.exports = router;
