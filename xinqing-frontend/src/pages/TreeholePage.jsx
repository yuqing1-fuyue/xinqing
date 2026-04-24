import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../store';
import styles from './TreeholePage.module.css';

const defaultPosts = [
  {
    id: 1,
    avatar: '🍂',
    nickname: '秋风过客',
    time: '2 小时前',
    content: '最近压力好大，项目 deadline 一直在推。明明已经很努力了，但总感觉不够好。有时候真的很想放弃，但又觉得自己不应该这么轻易就认输。',
    tags: ['工作压力', '焦虑'],
    likes: 24,
    liked: false,
    comments: [
      { avatar: '🌿', nickname: '小草', time: '1 小时前', content: '我也是！最近加班到凌晨，感觉身体和精神都在透支。但请记住，你已经很棒了。' },
      { avatar: '🦋', nickname: '蝴蝶飞', time: '30 分钟前', content: '「不够好」这种感觉可能只是你的内心在苛责自己。试着对自己说一声「辛苦了」吧。' },
    ],
  },
  {
    id: 2,
    avatar: '🌙',
    nickname: '月下独行',
    time: '5 小时前',
    content: '今天鼓起勇气跟同事说了自己最近状态不好，没想到他们特别理解，还约我周末一起去爬山。原来开口求助没有那么难。',
    tags: ['人际交往', '成长'],
    likes: 56,
    liked: true,
    comments: [
      { avatar: '🌻', nickname: '向日葵', time: '4 小时前', content: '太棒了！迈出第一步就是最大的勇敢。祝福你 ❤️' },
    ],
  },
  {
    id: 3,
    avatar: '🌊',
    nickname: '海边散步',
    time: '昨天',
    content: '失眠第三天了，每次闭上眼脑子里就开始转各种事情。试了冥想、喝热牛奶、数羊，但都没什么用。有人有什么好的助眠方法吗？',
    tags: ['睡眠', '求助'],
    likes: 38,
    liked: false,
    comments: [
      { avatar: '📚', nickname: '书虫', time: '昨天', content: '推荐试试「4-7-8 呼吸法」：吸气4秒，屏住7秒，呼气8秒。连续做三组，亲测有效。' },
      { avatar: '🎵', nickname: '音符', time: '昨天', content: '听白噪音或者自然声音对我帮助很大。' },
    ],
  },
];

const hotTopics = ['工作压力', '人际关系', '睡眠困扰', '家庭关系', '自我成长', '情绪管理'];

export default function TreeholePage() {
  const navigate = useNavigate();
  const [storeInstance, userState] = store.useStore();
  const [posts, setPosts] = useState(defaultPosts);
  const [categories, setCategories] = useState([]);
  const [schools, setSchools] = useState([]);
  const [newContent, setNewContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showComposer, setShowComposer] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [postComments, setPostComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState('new');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isCampus, setIsCampus] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // 加载数据
  useEffect(() => {
    loadCategories();
    loadSchools();
    loadTreehole();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await storeInstance.fetchCategories();
      // 确保分类数据更新到组件状态
      if (cats && cats.length > 0) {
        setCategories(cats);
      } else {
        // 如果fetchCategories返回空，尝试从store state获取
        const currentCategories = storeInstance.getState().categories;
        if (currentCategories && currentCategories.length > 0) {
          setCategories(currentCategories);
        }
      }
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const loadSchools = async () => {
    const schs = await storeInstance.fetchSchools();
    if (schs && schs.length > 0) setSchools(schs);
  };

  const loadTreehole = async (categoryId = null) => {
    try {
      const treehole = await storeInstance.fetchTreehole(1, categoryId);
      if (treehole && treehole.length > 0) {
        const converted = treehole.map(p => convertPost(p));
        setPosts(converted);
      }
      // 即使没有数据也保持空列表（让默认posts只在初始状态显示）
    } catch (error) {
      console.error('加载树洞失败:', error);
    }
  };

  const convertPost = (p) => ({
    id: p.id,
    avatar: p.is_anonymous ? '👤' : (p.avatar || '👤'),
    nickname: p.is_anonymous ? '匿名用户' : (p.nickname || '用户'),
    time: formatTimeAgo(p.created_at),
    content: p.content,
    tags: [],
    likes: p.likes_count || 0,
    liked: false,
    comments: [],
    commentCount: p.comment_count || 0,
    category: p.category_name,
    categoryIcon: p.category_icon,
    school: p.school_name,
  });

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '刚刚';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return `${Math.floor(diff / 86400000)}天前`;
  };

  const handleSchoolSearch = (value) => {
    setSchoolSearch(value);
    if (value.length >= 1) {
      const filtered = schools.filter(s => s.name.includes(value)).slice(0, 10);
      setFilteredSchools(filtered);
    } else {
      setFilteredSchools([]);
    }
  };

  // 敏感词过滤
  const filterSensitiveWords = (content) => {
    const sensitivePatterns = [
      /[微信][你我他她它]*[信号]*[\u4e00-\u9fa5]*/gi,
      /[Qq][Qq]*/gi,
      /[电话][号码]*/gi,
      /[1-9]\d{6,11}/g,
      /http[s]?:\/\/[^\s]+/gi,
      /www\.[^\s]+/gi,
    ];
    let filtered = content;
    sensitivePatterns.forEach(pattern => {
      filtered = filtered.replace(pattern, '***');
    });
    return filtered;
  };

  const handleSubmitPost = async () => {
    if (!newContent.trim()) {
      alert('请输入内容');
      return;
    }
    
    if (newContent.trim().length < 2) {
      alert('内容至少需要2个字符');
      return;
    }
    
    if (!userState.isAuthenticated) {
      alert('请先登录');
      navigate('/login');
      return;
    }

    // 敏感词过滤
    const filteredContent = filterSensitiveWords(newContent.trim());

    setSubmitting(true);
    try {
      await storeInstance.createTreehole(
        filteredContent, 
        isAnonymous,
        selectedCategory,
        isCampus ? selectedSchool : null
      );
      // 切换到最新排序
      setSortBy('new');
      await loadTreehole(null); // 加载全部最新
      setNewContent('');
      setShowComposer(false);
      setSelectedCategory(null);
      setSelectedSchool(null);
      setSchoolSearch('');
      alert('发布成功！');
    } catch (error) {
      console.error('发布失败:', error);
      alert(error.message || '发布失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadComments = async (postId) => {
    if (postComments[postId]) return;
    const comments = await storeInstance.fetchComments(postId);
    const converted = comments.map(c => ({
      id: c.id,
      avatar: c.is_anonymous ? '👤' : (c.avatar || '👤'),
      nickname: c.is_anonymous ? '匿名用户' : (c.nickname || '用户'),
      time: formatTimeAgo(c.created_at),
      content: c.content,
    }));
    setPostComments(prev => ({ ...prev, [postId]: converted }));
  };

  const handleComment = async (postId) => {
    if (!newComment.trim()) return;
    if (!userState.isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await storeInstance.createComment(postId, newComment, isAnonymous);
      const newC = {
        id: Date.now(),
        avatar: isAnonymous ? '👤' : '🌸',
        nickname: isAnonymous ? '匿名用户' : (userState.user?.nickname || '我'),
        time: '刚刚',
        content: newComment,
      };
      setPostComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newC]
      }));
      setNewComment('');
    } catch (error) {
      console.error('评论错误:', error);
      alert(error.message || '评论失败，请检查网络或登录状态后重试');
    }
  };

  const handleLike = (postId) => {
    setPosts(posts.map(p =>
      p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    loadTreehole(categoryId || null);
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'hot') return b.likes - a.likes;
    return b.id - a.id;
  });

  return (
    <div className={styles.page}>
      <div className="page-container">
        {/* 头部 */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🌳</span>
            <div>
              <h1 className={styles.title}>心灵树洞</h1>
              <p className={styles.subtitle}>匿名倾诉，温暖相伴</p>
            </div>
          </div>
          <button className="btn-primary" onClick={() => setShowComposer(true)}>
            ✏️ 写心声
          </button>
        </div>

        {/* 分类标签 */}
        <div className={styles.categoryBar}>
          <button 
            className={`${styles.categoryBtn} ${!selectedCategory ? styles.categoryActive : ''}`}
            onClick={() => handleCategoryChange(null)}
          >
            全部
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`${styles.categoryBtn} ${selectedCategory === cat.id ? styles.categoryActive : ''}`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* 排序 */}
        <div className={styles.sortBar}>
          <button className={`${styles.sortBtn} ${sortBy === 'new' ? styles.sortActive : ''}`} onClick={() => setSortBy('new')}>
            🕐 最新
          </button>
          <button className={`${styles.sortBtn} ${sortBy === 'hot' ? styles.sortActive : ''}`} onClick={() => setSortBy('hot')}>
            🔥 最热
          </button>
        </div>

        {/* 帖子列表 */}
        <div className={styles.postList}>
          {sortedPosts.map(post => (
            <div key={post.id} className={styles.post}>
              <div className={styles.postHeader}>
                <span className={styles.postAvatar}>{post.avatar}</span>
                <div className={styles.postMeta}>
                  <span className={styles.postNickname}>{post.nickname}</span>
                  {post.category && (
                    <span className={styles.postCategory}>
                      {post.categoryIcon} {post.category}
                    </span>
                  )}
                  {post.school && (
                    <span className={styles.postSchool}>🏫 {post.school}</span>
                  )}
                  <span className={styles.postTime}>{post.time}</span>
                </div>
              </div>
              <p className={styles.postContent}>{post.content}</p>
              
              <div className={styles.postActions}>
                <button className={`${styles.actionBtn} ${post.liked ? styles.liked : ''}`} onClick={() => handleLike(post.id)}>
                  {post.liked ? '❤️' : '🤍'} {post.likes}
                </button>
                <button 
                  className={styles.actionBtn} 
                  onClick={() => {
                    setExpandedPost(expandedPost === post.id ? null : post.id);
                    if (expandedPost !== post.id) handleLoadComments(post.id);
                  }}
                >
                  💬 {post.commentCount || 0}
                </button>
              </div>

              {/* 评论区 */}
              {expandedPost === post.id && (
                <div className={styles.commentSection}>
                  {(postComments[post.id] || []).length > 0 && (
                    <div className={styles.commentList}>
                      {postComments[post.id].map((c, i) => (
                        <div key={c.id || i} className={styles.comment}>
                          <span className={styles.commentAvatar}>{c.avatar}</span>
                          <div className={styles.commentBody}>
                            <div className={styles.commentMeta}>
                              <span className={styles.commentName}>{c.nickname}</span>
                              <span className={styles.commentTime}>{c.time}</span>
                            </div>
                            <p className={styles.commentText}>{c.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={styles.commentInput}>
                    <input
                      className={styles.commentField}
                      placeholder="写一条温暖的回复..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleComment(post.id)}
                    />
                    <button className={styles.commentSend} onClick={() => handleComment(post.id)}>发送</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 发帖弹窗 */}
      {showComposer && (
        <div className={styles.overlay} onClick={() => setShowComposer(false)}>
          <div className={styles.composer} onClick={e => e.stopPropagation()}>
            <div className={styles.composerHeader}>
              <h3 className={styles.composerTitle}>写下你的心声</h3>
              <button className={styles.composerClose} onClick={() => setShowComposer(false)}>✕</button>
            </div>
            
            {/* 分类选择 */}
            <div className={styles.composerSection}>
              <label className={styles.composerLabel}>选择分类</label>
              <div className={styles.categoryGrid}>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`${styles.categoryOption} ${selectedCategory === cat.id ? styles.categoryOptionActive : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 校园模式 */}
            <div className={styles.composerSection}>
              <label className={styles.composerLabel}>
                <input
                  type="checkbox"
                  checked={isCampus}
                  onChange={e => setIsCampus(e.target.checked)}
                />
                🏫 关联学校（可选，不选则公开可见）
              </label>
              {isCampus && (
                <div className={styles.schoolSelect}>
                  <input
                    className={styles.schoolInput}
                    placeholder="搜索你的学校..."
                    value={schoolSearch}
                    onChange={e => handleSchoolSearch(e.target.value)}
                  />
                  {filteredSchools.length > 0 && (
                    <div className={styles.schoolList}>
                      {filteredSchools.map(s => (
                        <button
                          key={s.id}
                          className={styles.schoolOption}
                          onClick={() => {
                            setSelectedSchool(s.id);
                            setSchoolSearch(s.name);
                            setFilteredSchools([]);
                          }}
                        >
                          {s.name} - {s.city}
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedSchool && !filteredSchools.length && (
                    <span className={styles.schoolSelected}>✓ 已选择</span>
                  )}
                </div>
              )}
            </div>

            <textarea
              className={styles.composerTextarea}
              placeholder="说出你想说的话...可以是一段心事、一个困惑、或者一份感悟"
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              rows={5}
            />
            
            <div className={styles.composerFooter}>
              <label className={styles.anonymousToggle}>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                />
                匿名发布
              </label>
              <button
                className="btn-primary"
                onClick={handleSubmitPost}
                disabled={submitting || !newContent.trim() || newContent.trim().length < 2}
                style={{ opacity: (!newContent.trim() || newContent.trim().length < 2) ? 0.5 : 1 }}
              >
                {submitting ? '发布中...' : '发布心声'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
