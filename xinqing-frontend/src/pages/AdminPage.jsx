import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../store';
import styles from './AdminPage.module.css';

export default function AdminPage() {
  const navigate = useNavigate();
  const [storeInstance, userState] = store.useStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  // 权限检查
  useEffect(function() {
    if (!userState.isAuthenticated) {
      navigate('/login');
      return;
    }
    if (userState.user && userState.user.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [userState.isAuthenticated, userState.user, navigate]);

  // 仪表盘数据
  const [stats, setStats] = useState(null);

  // 用户列表
  const [users, setUsers] = useState([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);

  // 帖子
  const [posts, setPosts] = useState([]);
  const [postTotal, setPostTotal] = useState(0);
  const [postPage, setPostPage] = useState(1);

  // 评论
  const [comments, setComments] = useState([]);
  const [commentTotal, setCommentTotal] = useState(0);
  const [commentPage, setCommentPage] = useState(1);

  // 群组
  const [groups, setGroups] = useState([]);

  // 操作状态
  const [msg, setMsg] = useState({ type: '', text: '' });
  let msgTimer = null;

  const showMsg = function(text, type) {
    type = type || 'success';
    setMsg({ type: type, text: text });
    if (msgTimer) clearTimeout(msgTimer);
    msgTimer = setTimeout(function() { setMsg({ type: '', text: '' }); }, 3000);
  };

  // 加载仪表盘
  useEffect(function() {
    if (userState.user && userState.user.role === 'admin') {
      loadDashboard();
    }
  }, [userState.user]);

  const loadDashboard = async function() {
    try {
      var data = await storeInstance.api.getDashboard();
      setStats(data.stats);
    } catch (e) { console.error(e); }
  };

  // 加载用户
  useEffect(function() {
    if (activeTab === 'users') loadUsers();
  }, [activeTab, userPage]);

  const loadUsers = async function() {
    try {
      var data = await storeInstance.api.getUsers(userPage, 20, userSearch);
      setUsers(data.users || []);
      setUserTotal(data.total || 0);
    } catch (e) { console.error(e); }
  };

  // 搜索用户（防抖）
  var searchTimer = null;
  const handleUserSearch = function(val) {
    setUserSearch(val);
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(function() {
      setUserPage(1);
      loadUsers();
    }, 400);
  };

  // 查看用户详情
  const viewUserDetail = async function(userId) {
    try {
      var data = await storeInstance.api.getUserDetail(userId);
      setSelectedUser(data);
      setShowUserDetail(true);
    } catch (e) { showMsg('获取用户详情失败', 'error'); }
  };

  // 删除用户
  const handleDeleteUser = async function(userId) {
    if (!confirm('确定要删除此用户吗？该操作不可撤销！')) return;
    try {
      await storeInstance.api.deleteUser(userId);
      showMsg('用户已删除');
      setShowUserDetail(false);
      loadUsers();
      loadDashboard();
    } catch (e) { showMsg(e.message || '删除失败', 'error'); }
  };

  // 更新用户角色
  const handleUpdateRole = async function(userId, role) {
    try {
      await storeInstance.api.updateUser(userId, { role: role });
      showMsg('角色已更新为: ' + role);
      loadUsers();
      if (selectedUser && selectedUser.id === userId) {
        selectedUser.role = role;
      }
    } catch (e) { showMsg(e.message || '更新失败', 'error'); }
  };

  // 加载帖子
  useEffect(function() {
    if (activeTab === 'posts') loadPosts();
  }, [activeTab, postPage]);

  const loadPosts = async function() {
    try {
      var data = await storeInstance.api.getPosts(postPage, 20);
      setPosts(data.posts || []);
      setPostTotal(data.total || 0);
    } catch (e) { console.error(e); }
  };

  const handleDeletePost = async function(postId) {
    if (!confirm('确定要删除此帖子吗？')) return;
    try {
      await storeInstance.api.deletePost(postId);
      showMsg('帖子已删除');
      loadPosts();
      loadDashboard();
    } catch (e) { showMsg(e.message || '删除失败', 'error'); }
  };

  // 加载评论
  useEffect(function() {
    if (activeTab === 'comments') loadComments();
  }, [activeTab, commentPage]);

  const loadComments = async function() {
    try {
      var data = await storeInstance.api.getComments(commentPage, 30);
      setComments(data.comments || []);
      setCommentTotal(data.total || 0);
    } catch (e) { console.error(e); }
  };

  const handleDeleteComment = async function(commentId) {
    if (!confirm('确定要删除此评论吗？')) return;
    try {
      await storeInstance.api.deleteComment(commentId);
      showMsg('评论已删除');
      loadComments();
    } catch (e) { showMsg(e.message || '删除失败', 'error'); }
  };

  // 加载群组
  useEffect(function() {
    if (activeTab === 'groups') loadGroups();
  }, [activeTab]);

  const loadGroups = async function() {
    try {
      var data = await storeInstance.api.getAllGroups();
      setGroups(data.groups || []);
    } catch (e) { console.error(e); }
  };

  const handleDeleteGroup = async function(groupId, groupName) {
    if (!confirm('确定要删除群组「' + groupName + '」吗？')) return;
    try {
      await storeInstance.api.deleteGroup(groupId);
      showMsg('群组已删除');
      loadGroups();
      loadDashboard();
    } catch (e) { showMsg(e.message || '删除失败', 'error'); }
  };

  // 格式化时间
  const fmtTime = function(t) {
    if (!t) return '-';
    return new Date(t).toLocaleString('zh-CN');
  };

  // 角色标签颜色
  const roleColor = function(role) {
    if (role === 'admin') return '#E74C3C';
    if (role === 'counselor') return '#9B8EC4';
    return '#52B69A';
  };
  const roleLabel = function(role) {
    if (role === 'admin') return '管理员';
    if (role === 'counselor') return '咨询师';
    if (role === 'bot') return '机器人';
    return '普通用户';
  };

  var tabs = [
    { key: 'dashboard', label: '仪表盘', icon: '📊' },
    { key: 'users', label: '用户管理', icon: '👥' },
    { key: 'posts', label: '帖子管理', icon: '📝' },
    { key: 'comments', label: '评论管理', icon: '💬' },
    { key: 'groups', label: '群组管理', icon: '🏘️' },
  ];

  return (
    <div className={styles.page}>
      <div className="page-container">
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span style={{ fontSize: 32 }}>🛡️</span>
            <div>
              <h1 className={styles.title}>管理后台</h1>
              <p className={styles.subtitle}>{userState.user?.nickname} · 管员操作面板</p>
            </div>
          </div>
          <button className="btn-secondary" onClick={function() { navigate('/profile'); }}>
            返回个人中心
          </button>
        </div>

        {msg.text && (
          <div className={styles.msgBar + ' ' + (msg.type === 'error' ? styles.msgError : styles.msgSuccess)}>
            {msg.text}
          </div>
        )}

        {/* Tab导航 */}
        <div className={styles.tabs}>
          {tabs.map(function(tab) {
            return (
              <button
                key={tab.key}
                className={styles.tab + ' ' + (activeTab === tab.key ? styles.tabActive : '')}
                onClick={() => setActiveTab(tab.key)}
              >
                <span>{tab.icon} {tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ═══ 仪表盘 ═══ */}
        {activeTab === 'dashboard' && stats && (
          <div className={styles.panelGrid}>
            {[
              { label: '总用户数', value: stats.totalUsers, icon: '👥', color: '#FF8C69' },
              { label: '今日新增', value: stats.newUsersToday, icon: '✨', color: '#52B69A' },
              { label: '心情打卡', value: stats.totalMoods, icon: '😊', color: '#F4A261' },
              { label: '树洞帖子', value: stats.totalPosts, icon: '🌳', color: '#7B9EA6' },
              { label: '群组数量', value: stats.totalGroups, icon: '🏘️', color: '#9B8EC4' },
              { label: '私信消息', value: stats.totalMessages, icon: '💬', color: '#E0724F' },
              { label: '评论总数', value: stats.totalComments, icon: '💭', color: '#76C9B0' },
              { label: '今日活跃', value: stats.activeUsersToday, icon: '🔥', color: '#E74C3C' },
            ].map(function(s, i) {
              return (
                <div key={i} className={styles.statCard} style={{ borderLeftColor: s.color }}>
                  <div className={styles.statIcon}>{s.icon}</div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>{s.value}</span>
                    <span className={styles.statLabel}>{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ 用户管理 ═══ */}
        {activeTab === 'users' && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>用户列表 ({userTotal})</h3>
              <input
                className={styles.searchInput}
                placeholder="搜索用户名/昵称/邮箱/ID..."
                value={userSearch}
                onChange={function(e) { handleUserSearch(e.target.value); }}
              />
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th><th>用户ID</th><th>用户名</th><th>昵称</th><th>邮箱</th><th>角色</th><th>注册时间</th><th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(function(u) {
                    return (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td className={styles.idCell}>{u.display_id}</td>
                        <td>{u.username}</td>
                        <td>{u.nickname || '-'}</td>
                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</td>
                        <td>
                          <span className={styles.roleBadge} style={{ background: roleColor(u.role) + '20', color: roleColor(u.role) }}>
                            {roleLabel(u.role)}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: '#999' }}>{fmtTime(u.created_at)}</td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button className={styles.btnSmall} onClick={() => viewUserDetail(u.id)}>详情</button>
                            {u.role !== 'admin' && u.role !== 'bot' && (
                              <select
                                className={styles.roleSelect}
                                defaultValue={u.role}
                                onChange={function(e) { handleUpdateRole(u.id, e.target.value); }}
                              >
                                <option value="user">设为用户</option>
                                <option value="counselor">设为咨询师</option>
                                <option value="admin">设为管理员</option>
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {userTotal > 20 && (
              <div className={styles.pagination}>
                <button disabled={userPage <= 1} onClick={() => setUserPage(userPage - 1)}>上一页</button>
                <span>第 {userPage} / {Math.ceil(userTotal / 20)} 页</span>
                <button disabled={userPage >= Math.ceil(userTotal / 20)} onClick={() => setUserPage(userPage + 1)}>下一页</button>
              </div>
            )}
          </div>
        )}

        {/* ═══ 帖子管理 ═══ */}
        {activeTab === 'posts' && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}><h3>树洞帖子 ({postTotal})</h3></div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th>ID</th><th>作者</th><th>内容预览</th><th>分类</th><th>发布时间</th><th>操作</th></tr>
                </thead>
                <tbody>
                  {posts.map(function(p) {
                    return (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.nickname || '-'}</td>
                        <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {(p.content || '').substring(0, 60)}...
                        </td>
                        <td><span className={styles.tag}>{p.category_name || '默认'}</span></td>
                        <td style={{ fontSize: 12, color: '#999' }}>{fmtTime(p.created_at)}</td>
                        <td>
                          <button className={styles.btnDanger} onClick={() => handleDeletePost(p.id)}>删除</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {postTotal > 20 && (
              <div className={styles.pagination}>
                <button disabled={postPage <= 1} onClick={() => setPostPage(postPage - 1)}>上一页</button>
                <span>第 {postPage} / {Math.ceil(postTotal / 20)} 页</span>
                <button disabled={postPage >= Math.ceil(postTotal / 20)} onClick={() => setPostPage(postPage + 1)}>下一页</button>
              </div>
            )}
          </div>
        )}

        {/* ═══ 评论管理 ═══ */}
        {activeTab === 'comments' && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}><h3>评论列表 ({commentTotal})</h3></div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th>ID</th><th>作者</th><th>内容预览</th><th>帖子ID</th><th>时间</th><th>操作</th></tr>
                </thead>
                <tbody>
                  {comments.map(function(c) {
                    return (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.nickname || '-'}</td>
                        <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {(c.content || '').substring(0, 50)}...
                        </td>
                        <td>{c.post_id}</td>
                        <td style={{ fontSize: 12, color: '#999' }}>{fmtTime(c.created_at)}</td>
                        <td>
                          <button className={styles.btnDanger} onClick={() => handleDeleteComment(c.id)}>删除</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {commentTotal > 30 && (
              <div className={styles.pagination}>
                <button disabled={commentPage <= 1} onClick={() => setCommentPage(commentPage - 1)}>上一页</button>
                <span>第 {commentPage} / {Math.ceil(commentTotal / 30)} 页</span>
                <button disabled={commentPage >= Math.ceil(commentTotal / 30)} onClick={() => setCommentPage(commentPage + 1)}>下一页</button>
              </div>
            )}
          </div>
        )}

        {/* ═══ 群组管理 ═══ */}
        {activeTab === 'groups' && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}><h3>群组列表 ({groups.length})</h3></div>
            <div className={styles.groupList}>
              {groups.map(function(g) {
                return (
                  <div key={g.id} className={styles.groupCard}>
                    <div className={styles.groupCardInfo}>
                      <h4>{g.name}</h4>
                      <span className={styles.groupCodeTag}>群号: {g.group_code}</span>
                      <p>创建者: {g.school_name || '-'} · 成员: {g.member_count || 0}</p>
                      <p className={styles.desc}>{g.description || '暂无描述'}</p>
                    </div>
                    <button className={styles.btnDanger} onClick={() => handleDeleteGroup(g.id, g.name)}>
                      删除群组
                    </button>
                  </div>
                );
              })}
              {groups.length === 0 && <div className={styles.emptyText}>暂无群组</div>}
            </div>
          </div>
        )}

        {/* 用户详情弹窗 */}
        {showUserDetail && selectedUser && (
          <div className={styles.overlay} onClick={() => setShowUserDetail(false)}>
            <div className={styles.detailModal} onClick={function(e) { e.stopPropagation(); }}>
              <div className={styles.detailHeader}>
                <h3>用户详情</h3>
                <button className={styles.closeBtn} onClick={() => setShowUserDetail(false)}>✕</button>
              </div>
              <div className={styles.detailBody}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>用户ID</span>
                  <span className={styles.idCell}>{selectedUser.display_id}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>用户名</span>
                  <span>{selectedUser.username}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>昵称</span>
                  <span>{selectedUser.nickname || '-'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>邮箱</span>
                  <span>{selectedUser.email}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>角色</span>
                  <span className={styles.roleBadge} style={{ background: roleColor(selectedUser.role) + '20', color: roleColor(selectedUser.role) }}>
                    {roleLabel(selectedUser.role)}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>注册时间</span>
                  <span>{fmtTime(selectedUser.created_at)}</span>
                </div>
                {selectedUser.statistics && (
                  <>
                    <div className={styles.divider}></div>
                    <h4 style={{ margin: '12px 0 8px', fontSize: 14 }}>数据统计</h4>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>心情打卡</span>
                      <span>{selectedUser.statistics.moods} 次</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>发帖数</span>
                      <span>{selectedUser.statistics.posts} 篇</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>评论数</span>
                      <span>{selectedUser.statistics.comments} 条</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>发送私信</span>
                      <span>{selectedUser.statistics.messagesSent} 条</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>加入群组</span>
                      <span>{selectedUser.statistics.groupsJoined} 个</span>
                    </div>
                  </>
                )}
              </div>
              <div className={styles.detailFooter}>
                {selectedUser.role !== 'admin' && selectedUser.id !== userState.user?.id && selectedUser.role !== 'bot' && (
                  <button className={styles.btnDanger} onClick={() => handleDeleteUser(selectedUser.id)}>
                    删除用户
                  </button>
                )}
                <button className="btn-secondary" onClick={() => setShowUserDetail(false)}>关闭</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
