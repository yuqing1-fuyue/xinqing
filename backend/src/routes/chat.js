const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// AI回复模板（简单模拟，后续可接入真实AI）
const getAIResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // 情绪关键词识别
  if (lowerMessage.includes('焦虑') || lowerMessage.includes('紧张')) {
    return '我理解你现在感到焦虑。试着深呼吸，慢慢吸气4秒，屏住呼吸4秒，再慢慢呼气4秒。重复几次，让自己冷静下来。你愿意和我聊聊是什么让你感到焦虑吗？';
  }
  
  if (lowerMessage.includes('难过') || lowerMessage.includes('伤心')) {
    return '听到你难过，我很心疼。有时候把情绪表达出来会好受一些。你可以试着把心事写下来，或者告诉我发生了什么？记住，难过是正常的，悲伤会慢慢愈合的。';
  }
  
  if (lowerMessage.includes('孤独') || lowerMessage.includes('寂寞')) {
    return '孤独感确实不好受。你并不孤单，我在这里陪着你。要不要试试做一些让自己开心的事情？或者联系一下久未联系的朋友？';
  }
  
  if (lowerMessage.includes('压力') || lowerMessage.includes('累')) {
    return '辛苦了！面对压力时，记得给自己一些喘息的时间。可以试试站起来活动一下，喝杯温水，或者短暂休息几分钟。你现在遇到了什么压力呢？';
  }
  
  if (lowerMessage.includes('开心') || lowerMessage.includes('高兴') || lowerMessage.includes('快乐')) {
    return '太棒了！很高兴听到你心情不错！快乐是会传染的，你愿意和我分享一下是什么让你这么开心吗？';
  }
  
  // 默认回复
  return '谢谢你的分享。我在这里倾听你的心声。无论是开心还是难过，我都会陪着你。如果你想聊聊具体的事情，随时告诉我。或者你想尝试一些放松练习吗？';
};

// 发送消息
router.post('/', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    
    // 保存用户消息
    db.chat.create(req.userId, 'user', content);
    
    // 生成AI回复
    const response = getAIResponse(content);
    
    // 保存AI回复
    db.chat.create(req.userId, 'ai', response);
    
    res.json({ response, message: '发送成功' });
  } catch (error) {
    console.error('聊天错误:', error);
    res.status(500).json({ error: '发送消息失败' });
  }
});

// 获取聊天历史
router.get('/history', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = db.chat.findByUser(req.userId, limit);
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: '获取历史记录失败' });
  }
});

// 清除聊天历史
router.delete('/history', authenticate, async (req, res) => {
  try {
    db.chat.clear(req.userId);
    res.json({ message: '聊天记录已清除' });
  } catch (error) {
    res.status(500).json({ error: '清除失败' });
  }
});

module.exports = router;
