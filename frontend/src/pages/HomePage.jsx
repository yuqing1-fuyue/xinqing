import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { store } from '../store';
import api from '../services/api';

export default function HomePage() {
  const navigate = useNavigate();
  const [user] = store.useStore();
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.isAuthenticated) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user.isAuthenticated]);

  const fetchData = async () => {
    try {
      const data = await api.getMoods(7);
      setMoods(data.moods || []);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      happy: '😊', calm: '😌', neutral: '😐',
      anxious: '😰', sad: '😢', angry: '😠'
    };
    return emojis[mood] || '😐';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">💜</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                心晴同行
              </span>
            </div>
            <div className="flex items-center gap-4">
              {user.isAuthenticated ? (
                <>
                  <span className="text-gray-600">欢迎，{user.user?.nickname || user.user?.username}</span>
                  <button
                    onClick={() => { store.logout(); navigate('/'); }}
                    className="px-4 py-2 text-pink-500 hover:bg-pink-50 rounded-lg transition"
                  >
                    退出
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-pink-500 hover:bg-pink-50 rounded-lg transition">
                    登录
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-lg hover:shadow-lg transition"
                  >
                    注册
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero区域 */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              你的专属心理关怀伙伴
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            在这里，你可以记录心情、倾诉心事、获取专业心理知识，让我们陪你一起走过每一个需要温暖的时刻。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/mood"
              className="px-8 py-4 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-2xl font-medium hover:shadow-xl hover:scale-105 transition-all"
            >
              🎯 开始心情打卡
            </Link>
            <Link
              to="/treehole"
              className="px-8 py-4 bg-white text-purple-600 rounded-2xl font-medium hover:shadow-xl hover:scale-105 transition-all border-2 border-purple-200"
            >
              🌳 进入树洞
            </Link>
          </div>
        </div>
      </section>

      {/* 功能卡片 */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">我们的服务</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* 心情打卡 */}
            <Link to="/mood" className="group">
              <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">心情打卡</h3>
                <p className="text-gray-500">记录每一天的情绪变化，关注内心健康，遇见更好的自己</p>
              </div>
            </Link>

            {/* 树洞 */}
            <Link to="/treehole" className="group">
              <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <span className="text-3xl">🌳</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">心灵树洞</h3>
                <p className="text-gray-500">在这里倾诉心事，释放压力，同伴的温暖陪伴左右</p>
              </div>
            </Link>

            {/* AI助手 */}
            <Link to="/ai" className="group">
              <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">AI陪伴</h3>
                <p className="text-gray-500">24小时在线的AI助手，随时倾听你的心声，温暖回应</p>
              </div>
            </Link>

            {/* 健康资源 */}
            <Link to="/health" className="group">
              <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <span className="text-3xl">📚</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">身心健康</h3>
                <p className="text-gray-500">丰富的心理学知识、专业测评，助你了解自己的内心世界</p>
              </div>
            </Link>

            {/* 紧急帮助 */}
            <Link to="/emergency" className="group">
              <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <span className="text-3xl">🆘</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">紧急帮助</h3>
                <p className="text-gray-500">当你需要帮助时，这里有专业的支持资源</p>
              </div>
            </Link>

            {/* 登录/个人中心 */}
            {user.isAuthenticated ? (
              <Link to="/profile" className="group">
                <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                    <span className="text-3xl">👤</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">个人中心</h3>
                  <p className="text-gray-500">查看打卡记录、管理个人信息、设置个性化偏好</p>
                </div>
              </Link>
            ) : (
              <Link to="/login" className="group">
                <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                    <span className="text-3xl">✨</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">开始探索</h3>
                  <p className="text-gray-500">登录后解锁更多功能，开启你的心理健康之旅</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 最近的的心情记录 */}
      {user.isAuthenticated && moods.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">最近的心情</h2>
              <Link to="/mood" className="text-pink-500 hover:text-pink-600">
                查看全部 →
              </Link>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {moods.slice(0, 7).map((mood, index) => (
                <div key={mood.id || index} className="bg-white rounded-2xl p-4 shadow text-center">
                  <div className="text-3xl mb-1">{getMoodEmoji(mood.mood)}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(mood.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 页脚 */}
      <footer className="py-8 px-4 bg-white/50 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 mb-2">
            心晴同行 © 2024 · 你的心理健康伙伴
          </p>
          <p className="text-sm text-gray-400">
            如遇紧急情况，请拨打心理援助热线：400-161-9995
          </p>
        </div>
      </footer>
    </div>
  );
}
