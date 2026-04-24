import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { store } from '../store';

export default function TreeholePage() {
  const navigate = useNavigate();
  const [user] = store.useStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      await store.fetchTreehole();
      setPosts(store.getState().treehole);
    } catch (error) {
      console.error('获取树洞失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('请输入内容');
      return;
    }
    if (content.length < 10) {
      alert('内容至少10个字');
      return;
    }

    if (!user.isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      await store.createTreehole(content, isAnonymous);
      setContent('');
      setIsAnonymous(false);
      setShowForm(false);
      fetchPosts();
    } catch (error) {
      alert(error.message || '发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-500 hover:text-green-500 transition">
                ← 返回
              </Link>
              <h1 className="text-xl font-bold text-gray-800">🌳 心灵树洞</h1>
            </div>
            <button
              onClick={() => {
                if (!user.isAuthenticated) {
                  navigate('/login');
                } else {
                  setShowForm(!showForm);
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition"
            >
              {showForm ? '取消' : '发布'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 发布表单 */}
        {showForm && (
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">倾诉你的心事</h3>
            <form onSubmit={handleSubmit}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="在这里说出你的心里话...（10-2000字）"
                rows="6"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-300 focus:ring-2 focus:ring-green-100 outline-none transition resize-none"
              />
              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-green-500 rounded"
                  />
                  <span>匿名发布</span>
                </label>
                <div className="text-sm text-gray-400">{content.length}/2000</div>
              </div>
              <button
                type="submit"
                disabled={submitting || content.length < 10}
                className="w-full mt-4 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl font-medium hover:shadow-xl transition disabled:opacity-50"
              >
                {submitting ? '发布中...' : '🌱 倾诉心事'}
              </button>
            </form>
          </div>
        )}

        {/* 帖子列表 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl animate-bounce">🌳</div>
            <p className="text-gray-500 mt-4">加载中...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-4">🌳</div>
            <p>树洞空空如也，来做第一个倾诉者吧！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer" onClick={() => setSelectedPost(post)}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-200 to-emerald-300 flex items-center justify-center text-xl">
                    {post.is_anonymous ? '👤' : (post.avatar || '👤')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-800">
                        {post.is_anonymous ? '匿名用户' : (post.nickname || '用户')}
                      </span>
                      <span className="text-sm text-gray-400">{formatDate(post.created_at)}</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{post.content}</p>
                    <div className="flex items-center gap-4 mt-4 text-gray-400 text-sm">
                      <span>💬 {post.comment_count || 0} 评论</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 帖子详情弹窗 */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelectedPost(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-800">帖子详情</h3>
              <button onClick={() => setSelectedPost(null)} className="text-gray-500">✕</button>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-200 to-emerald-300 flex items-center justify-center text-xl">
                  {selectedPost.is_anonymous ? '👤' : (selectedPost.avatar || '👤')}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">
                    {selectedPost.is_anonymous ? '匿名用户' : (selectedPost.nickname || '用户')}
                  </div>
                  <div className="text-sm text-gray-400">{formatDate(selectedPost.created_at)}</div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedPost.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
