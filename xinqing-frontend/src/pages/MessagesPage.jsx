import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../store';
import styles from './MessagesPage.module.css';

export default function MessagesPage() {
  const navigate = useNavigate();
  const [storeInstance, userState] = store.useStore();
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  // ID 搜索相关
  const [idSearchQuery, setIdSearchQuery] = useState('');
  const [idSearchResult, setIdSearchResult] = useState(null);
  const [idSearchLoading, setIdSearchLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!userState.isAuthenticated) {
      navigate('/login');
      return;
    }
    loadConversations();
    loadUsers();
  }, [userState.isAuthenticated, navigate]);

  const loadConversations = async () => {
    const data = await storeInstance.fetchConversations();
    setConversations(data);
  };

  const loadUsers = async () => {
    try {
      const data = await storeInstance.api.getUsers();
      setUsers(data.users || []);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    }
  };

  // 通过用户ID搜索
  const handleSearchById = async function() {
    var query = idSearchQuery.trim();
    if (!query) return;
    if (!/^\d+$/.test(query)) { showMsgId('ID只能输入数字'); return; }
    setIdSearchLoading(true);
    try {
      var data = await storeInstance.api.searchUserByDisplayId(query);
      if (data.user) {
        if (data.user.id === userState.user?.id) {
          showMsgId('不能给自己发私信');
          setIdSearchResult(null);
        } else {
          setIdSearchResult(data.user);
          showMsgId('', 'success');
        }
      } else {
        showMsgId('未找到该用户');
        setIdSearchResult(null);
      }
    } catch (err) {
      showMsgId(err.message || '搜索失败');
      setIdSearchResult(null);
    }
    setIdSearchLoading(false);
  };

  const showMsgId = function(text, type) {
    type = type || 'error';
  };

  const openChat = async (userId) => {
    setCurrentChat(userId);
    const msgs = await storeInstance.fetchConversation(userId);
    setMessages(msgs);
    await storeInstance.api.markAsRead(userId);
    loadConversations();
  };

  const sendMsg = async () => {
    if (!newMessage.trim() || !currentChat) return;
    
    try {
      await storeInstance.sendPrivateMessage(currentChat, newMessage, isAnonymous);
      const msgs = await storeInstance.fetchConversation(currentChat);
      setMessages(msgs);
      setNewMessage('');
      loadConversations();
    } catch (error) {
      alert('发送失败，请重试');
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    const date = new Date(time);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className={styles.page}>
      <div className="page-container">
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>💬</span>
            <div>
              <h1 className={styles.title}>私信</h1>
              <p className={styles.subtitle}>与他人一对一交流</p>
            </div>
          </div>
          <button className="btn-primary" onClick={() => setShowUserList(true)}>
            ✉️ 新私信
          </button>
        </div>

        <div className={styles.container}>
          {/* 对话列表 */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>消息列表</div>
            {conversations.length === 0 ? (
              <div className={styles.emptyState}>暂无私信记录</div>
            ) : (
              <div className={styles.conversationList}>
                {conversations.map(conv => (
                  <div
                    key={conv.other_user_id}
                    className={`${styles.conversationItem} ${currentChat === conv.other_user_id ? styles.active : ''}`}
                    onClick={() => openChat(conv.other_user_id)}
                  >
                    <div className={styles.avatar}>{conv.other_avatar || '👤'}</div>
                    <div className={styles.convInfo}>
                      <div className={styles.convName}>{conv.other_nickname || '用户'}</div>
                      <div className={styles.convPreview}>{conv.last_message || '暂无消息'}</div>
                    </div>
                    <div className={styles.convMeta}>
                      <span className={styles.convTime}>{formatTime(conv.last_time)}</span>
                      {conv.unread_count > 0 && (
                        <span className={styles.badge}>{conv.unread_count}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 聊天区域 */}
          <div className={styles.chatArea}>
            {currentChat ? (
              <>
                <div className={styles.chatHeader}>
                  <span className={styles.chatAvatar}>
                    {users.find(u => u.id === currentChat)?.avatar || '👤'}
                  </span>
                  <span className={styles.chatName}>
                    {users.find(u => u.id === currentChat)?.nickname || '用户'}
                  </span>
                </div>

                <div className={styles.messages}>
                  {messages.map((msg, idx) => (
                    <div
                      key={msg.id || idx}
                      className={`${styles.message} ${msg.sender_id === userState.user?.id ? styles.mine : styles.other}`}
                    >
                      {msg.sender_id !== userState.user?.id && (
                        <span className={styles.msgAvatar}>{msg.sender_avatar || '👤'}</span>
                      )}
                      <div className={styles.msgContent}>
                        <div className={styles.msgBubble}>{msg.content}</div>
                        <span className={styles.msgTime}>{formatTime(msg.created_at)}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className={styles.inputArea}>
                  <label className={styles.anonymousToggle}>
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={e => setIsAnonymous(e.target.checked)}
                    />
                    匿名发送
                  </label>
                  <input
                    className={styles.messageInput}
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="输入消息..."
                    onKeyDown={e => e.key === 'Enter' && sendMsg()}
                  />
                  <button className={styles.sendBtn} onClick={sendMsg}>发送</button>
                </div>
              </>
            ) : (
              <div className={styles.noChat}>
                <span className={styles.noChatIcon}>💬</span>
                <p>选择一个对话开始聊天</p>
                <p>或点击"新私信"发起新对话</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 用户选择弹窗 */}
      {showUserList && (
        <div className={styles.overlay} onClick={() => setShowUserList(false)}>
          <div className={styles.userModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>选择联系人</h3>
              <button className={styles.closeBtn} onClick={() => setShowUserList(false)}>✕</button>
            </div>

            {/* 用户ID搜索区 */}
            <div className={styles.idSearchArea}>
              <p className={styles.idSearchLabel}>通过用户ID搜索好友</p>
              <div className={styles.idSearchRow}>
                <input
                  type="text"
                  className={styles.idSearchInput}
                  placeholder="输入对方用户ID（数字）"
                  value={idSearchQuery}
                  onChange={function(e) { setIdSearchQuery(e.target.value); setIdSearchResult(null); }}
                  onKeyDown={function(e) { if (e.key === 'Enter') handleSearchById(); }}
                />
                <button
                  className={'btn-primary ' + styles.idSearchBtn}
                  onClick={handleSearchById}
                  disabled={idSearchLoading || !idSearchQuery.trim()}
                >
                  {idSearchLoading ? '搜索中...' : '搜索'}
                </button>
              </div>

              {/* ID 搜索结果 */}
              {idSearchResult && (
                <div className={styles.idSearchResult}>
                  <span className={styles.resultAvatar}>{idSearchResult.avatar || '👤'}</span>
                  <span className={styles.resultName}>{idSearchResult.nickname || idSearchResult.username}</span>
                  <span className={styles.resultId}>ID: {idSearchResult.display_id}</span>
                  <button
                    className={'btn-primary ' + styles.chatNowBtn}
                    onClick={function() {
                      openChat(idSearchResult.id);
                      setShowUserList(false);
                      setIdSearchResult(null);
                      setIdSearchQuery('');
                    }}
                  >
                    发私信
                  </button>
                </div>
              )}
            </div>

            <div className={styles.dividerLine}>
              <span>或从列表中选择</span>
            </div>

            <div className={styles.userList}>
              {users.filter(u => u.id !== userState.user?.id).map(function(user) {
                return (
                  <div
                    key={user.id}
                    className={styles.userItem}
                    onClick={function() {
                      openChat(user.id);
                      setShowUserList(false);
                    }}
                  >
                    <span className={styles.userAvatar}>{user.avatar || '👤'}</span>
                    <span className={styles.userName}>{user.nickname || user.username}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
