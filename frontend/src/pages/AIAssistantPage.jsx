import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { store } from '../store';

export default function AIAssistantPage() {
  const navigate = useNavigate();
  const [user] = store.useStore();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '你好！我是心晴AI助手，随时在这里倾听你的心声。无论是开心还是难过，我都会陪着你。今天想聊聊什么？'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user.isAuthenticated) {
      navigate('/login');
      return;
    }
    // 加载聊天历史
    store.fetchChatHistory().then(() => {
      const history = store.getState().chatHistory;
      if (history && history.length > 0) {
        const formatted = history.map(m => ({
          role: m.role,
          content: m.content
        }));
        setMessages(prev => [...prev, ...formatted]);
      }
    });
  }, [user.isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const data = await store.sendMessage(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '抱歉，我暂时无法回复，请稍后再试。' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickReplies = [
    '我最近感到很焦虑...',
    '今天心情不太好',
    '有人愿意听我倾诉吗',
    '有什么放松的方法吗'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-500 hover:text-blue-500 transition">
              ← 返回
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-sm">🤖</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">AI 陪伴</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 消息区域 */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 overflow-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                    : 'bg-white shadow-md text-gray-700'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white shadow-md rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </main>

      {/* 快捷回复 */}
      <div className="max-w-4xl mx-auto w-full px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => setInput(reply)}
              className="whitespace-nowrap px-4 py-2 bg-white/80 text-blue-600 rounded-full text-sm hover:bg-white transition"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* 输入框 */}
      <div className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你想说的话..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              发送
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
