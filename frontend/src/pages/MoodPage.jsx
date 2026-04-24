import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { store } from '../store';

export default function MoodPage() {
  const navigate = useNavigate();
  const [user] = store.useStore();
  const [moods, setMoods] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [score, setScore] = useState(5);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user.isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchMoods();
  }, [user.isAuthenticated]);

  const fetchMoods = async () => {
    try {
      const data = await store.fetchMoods();
      setMoods(store.getState().moods);
    } catch (error) {
      console.error('获取记录失败:', error);
    }
  };

  const moodOptions = [
    { id: 'happy', emoji: '😊', label: '开心', color: 'from-yellow-400 to-orange-400' },
    { id: 'calm', emoji: '😌', label: '平静', color: 'from-green-400 to-emerald-400' },
    { id: 'neutral', emoji: '😐', label: '一般', color: 'from-gray-400 to-gray-500' },
    { id: 'anxious', emoji: '😰', label: '焦虑', color: 'from-orange-400 to-amber-400' },
    { id: 'sad', emoji: '😢', label: '难过', color: 'from-blue-400 to-indigo-400' },
    { id: 'angry', emoji: '😠', label: '生气', color: 'from-red-400 to-rose-400' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMood) {
      alert('请选择你的心情');
      return;
    }

    setSubmitting(true);
    try {
      await store.createMood({
        mood: selectedMood,
        score,
        content
      });
      alert('打卡成功！');
      setSelectedMood(null);
      setScore(5);
      setContent('');
      fetchMoods();
    } catch (error) {
      alert(error.message || '打卡失败');
    } finally {
      setSubmitting(false);
    }
  };

  const getMoodInfo = (moodId) => moodOptions.find(m => m.id === moodId) || moodOptions[2];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-500 hover:text-pink-500 transition">
              ← 返回
            </Link>
            <h1 className="text-xl font-bold text-gray-800">心情打卡</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 打卡表单 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">今日心情怎么样？</h2>
          
          <form onSubmit={handleSubmit}>
            {/* 心情选择 */}
            <div className="mb-6">
              <div className="flex justify-center gap-4 flex-wrap">
                {moodOptions.map(mood => (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => setSelectedMood(mood.id)}
                    className={`flex flex-col items-center p-4 rounded-2xl transition-all ${
                      selectedMood === mood.id
                        ? `bg-gradient-to-br ${mood.color} text-white shadow-lg scale-110`
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-4xl mb-1">{mood.emoji}</span>
                    <span className={`text-sm ${selectedMood === mood.id ? 'text-white' : 'text-gray-600'}`}>
                      {mood.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 心情评分 */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2 text-center">
                心情指数：{score}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={score}
                onChange={(e) => setScore(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>很低落</span>
                <span>很开心</span>
              </div>
            </div>

            {/* 心情文字 */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                记录此刻（选填）
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="今天发生了什么让你有这样的心情..."
                rows="4"
                maxLength={500}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition resize-none"
              />
              <p className="text-right text-xs text-gray-400 mt-1">{content.length}/500</p>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={submitting || !selectedMood}
              className="w-full py-4 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-2xl font-medium text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '提交中...' : '✨ 记录今日心情'}
            </button>
          </form>
        </div>

        {/* 历史记录 */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">最近记录</h2>
          
          {moods.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-4">📝</div>
              <p>还没有打卡记录，开始记录你的心情吧！</p>
            </div>
          ) : (
            <div className="space-y-4">
              {moods.slice(0, 10).map((mood, index) => {
                const moodInfo = getMoodInfo(mood.mood);
                return (
                  <div key={mood.id || index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${moodInfo.color} flex items-center justify-center text-2xl`}>
                      {moodInfo.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800">{moodInfo.label}</span>
                        <span className="text-sm text-gray-400">评分：{mood.score}/10</span>
                      </div>
                      {mood.content && (
                        <p className="text-gray-600 text-sm mb-2">{mood.content}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(mood.created_at).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
