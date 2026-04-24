import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../store';
import styles from './AIAssistantPage.module.css';

const initMsgs = [
  { role: 'ai', text: '你好呀！我是心晴 AI 助手 🌤️ 作为一个温暖的倾听者，我会在这里陪伴你。你可以跟我聊聊今天的心情、工作中的困扰，或者任何你想说的话。', time: '刚刚' },
];

const quickQs = [
  { text: '今天心情有点低落 😔', icon: '😔' },
  { text: '工作压力好大', icon: '💼' },
  { text: '失眠了怎么办', icon: '🌙' },
  { text: '怎么缓解焦虑', icon: '🧘' },
];

const aiResponses = {
  '低落': '我理解你现在的心情。低落是每个人都会经历的正常情绪，你不需要因此责怪自己。\n\n你可以试试：\n1. 🌬️ 做 3 次深呼吸，慢慢吐气\n2. 📝 写下此刻的感受\n3. 🎵 听一首让你感到平静的歌\n\n想多聊聊是什么让你感到低落吗？我会认真听的。',
  '压力': '工作压力大是很常见的感受，你愿意跟我具体说说是什么让你感到压力吗？\n\n在聊之前，先教你一个简单的放松方法：\n\n🫁 **4-7-8 呼吸法**\n- 用鼻子吸气 4 秒\n- 屏住呼吸 7 秒\n- 用嘴巴慢慢呼气 8 秒\n- 重复 3-4 次\n\n这个方法可以帮助快速平复紧张情绪。试试看？',
  '失眠': '失眠确实很让人困扰。我先分享几个可能有帮助的方法：\n\n🌙 **改善睡眠的小建议：**\n1. 睡前 1 小时放下手机\n2. 把房间灯光调暗\n3. 尝试「身体扫描」放松法\n4. 泡一杯温热的牛奶或洋甘菊茶\n\n**身体扫描放松法：**\n闭上眼，从脚趾开始，慢慢关注身体每个部位，感受它的存在，然后让它放松。一路向上，直到头顶。\n\n你现在有尝试过什么助眠方法吗？',
  '焦虑': '焦虑是一种对未知的恐惧，你能够意识到自己的焦虑状态，这已经是很好的一步了。\n\n🧘 **试试「5-4-3-2-1」接地练习：**\n- 👀 看周围的 5 样东西\n- ✋ 触摸 4 样东西\n- 👂 听 3 种声音\n- 👃 闻 2 种气味\n- 👅 感受 1 种味道\n\n这个练习能帮你把注意力从焦虑的思绪中拉回到当下。\n\n你觉得是什么事情让你感到焦虑呢？',
  'default': '谢谢你愿意跟我分享。我能感受到你现在的感受，每个人的情绪都值得被认真对待。\n\n你可以试试：\n1. 🌬️ 做几次深呼吸\n2. 🚶 去散步几分钟\n3. 💬 跟信任的人聊聊\n\n如果你想继续聊，我随时都在这里倾听。你也可以试试去「心灵树洞」写下你的心声，那里有温暖的社区伙伴。😊',
};

function getAIReply(text) {
  if (text.includes('低落') || text.includes('难过') || text.includes('不开心') || text.includes('不好')) return aiResponses['低落'];
  if (text.includes('压力') || text.includes('累') || text.includes('加班') || text.includes('烦')) return aiResponses['压力'];
  if (text.includes('失眠') || text.includes('睡不着') || text.includes('睡眠')) return aiResponses['失眠'];
  if (text.includes('焦虑') || text.includes('紧张') || text.includes('担心') || text.includes('害怕')) return aiResponses['焦虑'];
  return aiResponses['default'];
}

// 简单的 HTML 格式化（移除所有 HTML 标签防止 XSS）
function formatText(text) {
  return text.split('\n').map((line, i) => {
    // 先将 **bold** 转换为安全标记，再全部转义
    const safe = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '');
    return <p key={i} className={styles.msgLine} dangerouslySetInnerHTML={{ __html: safe || '&nbsp;' }} />;
  });
}

export default function AIAssistantPage() {
  const navigate = useNavigate();
  const [storeInstance, userState] = store.useStore();
  const [msgs, setMsgs] = useState(initMsgs);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!userState.isAuthenticated) {
      navigate('/login');
      return;
    }
    // 加载聊天历史
    storeInstance.fetchChatHistory().then(() => {
      const history = storeInstance.getState().chatHistory;
      if (history && history.length > 0) {
        const converted = history.map(m => ({
          role: m.role === 'user' ? 'user' : 'ai',
          text: m.content,
          time: formatTime(m.created_at)
        }));
        setMsgs([...initMsgs, ...converted]);
      }
    });
  }, [userState.isAuthenticated, navigate, storeInstance]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const send = async (text) => {
    const t = text || input.trim();
    if (!t || typing) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setMsgs(p => [...p, { role: 'user', text: t, time }]);
    setInput('');
    setTyping(true);
    
    try {
      const data = await storeInstance.sendMessage(t);
      const now2 = new Date();
      const time2 = `${now2.getHours()}:${String(now2.getMinutes()).padStart(2, '0')}`;
      setMsgs(p => [...p, { role: 'ai', text: data.response, time: time2 }]);
    } catch (error) {
      // 如果API失败，使用本地响应
      const reply = getAIReply(t);
      const now2 = new Date();
      const time2 = `${now2.getHours()}:${String(now2.getMinutes()).padStart(2, '0')}`;
      setMsgs(p => [...p, { role: 'ai', text: reply, time: time2 }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* 聊天区域 */}
      <div className={styles.chatArea}>
        <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* 头部 */}
          <div className={styles.chatHeader}>
            <span className={styles.chatAvatar}>🤖</span>
            <div>
              <h1 className={styles.chatTitle}>AI 心理助手</h1>
              <p className={styles.chatStatus}>🟢 在线 · 随时为你倾听</p>
            </div>
          </div>

          {/* 消息列表 */}
          <div className={styles.msgList}>
            {msgs.map((m, i) => (
              <div key={i} className={`${styles.msg} ${m.role === 'user' ? styles.msgUser : styles.msgAI}`}>
                {m.role === 'ai' && <span className={styles.msgAvatar}>🤖</span>}
                <div className={styles.msgBubble}>
                  <div className={m.role === 'user' ? styles.bubbleUser : styles.bubbleAI}>
                    {formatText(m.text)}
                  </div>
                  <span className={styles.msgTime}>{m.time}</span>
                </div>
                {m.role === 'user' && <span className={styles.msgAvatarMe}>😊</span>}
              </div>
            ))}
            {typing && (
              <div className={`${styles.msg} ${styles.msgAI}`}>
                <span className={styles.msgAvatar}>🤖</span>
                <div className={styles.msgBubble}>
                  <div className={styles.bubbleAI}>
                    <div className={styles.typing}>
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* 快捷问题 */}
          {msgs.length <= 2 && (
            <div className={styles.quickBar}>
              <span className={styles.quickLabel}>你可以试试问我：</span>
              <div className={styles.quickList}>
                {quickQs.map(q => (
                  <button key={q.text} className={styles.quickBtn} onClick={() => send(q.text)}>
                    {q.icon} {q.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 输入区 */}
          <div className={styles.inputArea}>
            <div className={styles.inputBox}>
              <input
                ref={inputRef}
                className={styles.inputField}
                placeholder="说说你的心里话..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              />
              <button className={styles.sendBtn} onClick={() => send()} disabled={!input.trim() || typing}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
              </button>
            </div>
            <p className={styles.inputHint}>AI 助手提供陪伴支持，不替代专业心理咨询。如需帮助请拨打 400-161-9995</p>
          </div>
        </div>
      </div>
    </div>
  );
}
