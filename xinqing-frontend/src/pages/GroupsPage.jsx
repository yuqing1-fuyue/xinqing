import { useState, useEffect, useRef } from 'react';
import store from '../store';
import api from '../services/api';
import styles from './GroupsPage.module.css';

function GroupsList({ onEnterChat }) {
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', type: 'public' });
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [schoolList, setSchoolList] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allGroupsData, myGroupsData, schoolsData] = await Promise.all([
        api.getGroups(),
        store.fetchMyGroups ? store.fetchMyGroups() : [],
        store.fetchSchools()
      ]);
      setGroups(allGroupsData.groups || []);
      setMyGroups(myGroupsData || []);
      setSchools(schoolsData || []);
    } catch (error) {
      console.error('加载群组失败:', error);
    }
    setLoading(false);
  };

  const handleSearchSchools = async (keyword) => {
    setSchoolSearch(keyword);
    if (keyword.length >= 2) {
      const results = await store.searchSchools(keyword);
      setSchoolList(results || []);
    } else {
      setSchoolList([]);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) return;
    try {
      await api.createGroup({
        ...newGroup,
        schoolId: selectedSchool?.id || null
      });
      setShowCreate(false);
      setNewGroup({ name: '', description: '', type: 'public' });
      setSelectedSchool(null);
      loadData();
    } catch (error) {
      console.error('创建群组失败:', error);
      alert(error.message || '创建失败');
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await api.joinGroup(groupId);
      loadData();
    } catch (error) {
      alert(error.message || '加入失败');
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!confirm('确定要退出该群组吗？')) return;
    try {
      await api.leaveGroup(groupId);
      loadData();
    } catch (error) {
      alert(error.message || '退出失败');
    }
  };

  const displayGroups = filter === 'my' ? myGroups : groups;
  const myGroupIds = myGroups.map(g => g.id);

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>社群小组</h1>
        <p className={styles.subtitle}>加入志同道合的伙伴，一起成长</p>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${filter === 'all' ? styles.tabActive : ''}`} onClick={() => setFilter('all')}>发现群组</button>
        <button className={`${styles.tab} ${filter === 'my' ? styles.tabActive : ''}`} onClick={() => setFilter('my')}>我的群组 ({myGroups.length})</button>
      </div>

      <div className={styles.actions}>
        <button className={styles.createBtn} onClick={() => setShowCreate(true)}>
          <span className={styles.createIcon}>+</span> 创建群组
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>加载中...</div>
      ) : displayGroups.length === 0 ? (
        <div className={styles.empty}>{filter === 'my' ? '你还没有加入任何群组' : '暂无群组'}</div>
      ) : (
        <div className={styles.groupGrid}>
          {displayGroups.map(group => (
            <div key={group.id} className={styles.groupCard}>
              <div className={styles.groupHeader}>
                <div className={styles.groupAvatar}>{group.name.charAt(0)}</div>
                <div className={styles.groupInfo}>
                  <h3 className={styles.groupName}>{group.name}</h3>
                  <span className={styles.groupType}>
                    {group.type === 'public' ? '公开' : '私密'}
                    {group.school_name && ` · ${group.school_name}`}
                  </span>
                </div>
              </div>
              <p className={styles.groupDesc}>{group.description || '暂无描述'}</p>
              <div className={styles.groupStats}>
                <span>{group.member_count || 0} 成员</span>
                {group.group_code && <span className={styles.groupCode}>群号: {group.group_code}</span>}
              </div>
              <div className={styles.groupActions}>
                {myGroupIds.includes(group.id) ? (
                  <>
                    <button className={styles.chatBtn} onClick={() => onEnterChat(group)}>💬 进入聊天</button>
                    <button className={styles.leaveBtn} onClick={() => handleLeaveGroup(group.id)}>退出群组</button>
                  </>
                ) : (
                  <button className={styles.joinBtn} onClick={() => handleJoinGroup(group.id)}>加入群组</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 创建群组弹窗 */}
      {showCreate && (
        <div className={styles.modal} onClick={() => setShowCreate(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>创建群组</h2>
            <div className={styles.formGroup}>
              <label className={styles.label}>群组名称</label>
              <input type="text" className={styles.input} placeholder="给群组起个名字"
                value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>群组描述</label>
              <textarea className={styles.textarea} placeholder="介绍一下这个群组..."
                value={newGroup.description} onChange={e => setNewGroup({...newGroup, description: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>关联学校（可选）</label>
              <input type="text" className={styles.input} placeholder="搜索学校..."
                value={schoolSearch} onChange={e => handleSearchSchools(e.target.value)} />
              {schoolList.length > 0 && (
                <div className={styles.schoolList}>
                  {schoolList.map(school => (
                    <button key={school.id} className={styles.schoolOption}
                      onClick={() => { setSelectedSchool(school); setSchoolSearch(school.name); setSchoolList([]); }}>
                      {school.name} - {school.province} {school.city}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowCreate(false)}>取消</button>
              <button className={styles.submitBtn} onClick={handleCreateGroup}>创建</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function GroupChat({ group, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { loadMessages(); }, [group.id]);

  // 轮询新消息 - 每5秒
  useEffect(() => {
    const interval = setInterval(() => {
      if (messages.length > 0) {
        const lastId = messages[messages.length - 1].id || 0;
        api.getRecentGroupMessages(group.id, lastId).then(data => {
          if (data.messages && data.messages.length > 0) {
            setMessages(prev => [...prev, ...data.messages]);
          }
        }).catch(() => {});
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [group.id, messages.length]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const msgs = await store.fetchGroupMessages(group.id);
      setMessages(msgs || []);
    } catch (error) {
      console.error('加载消息失败:', error);
    }
    setLoading(false);
  };

  const sendMsg = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);
    try {
      await store.sendGroupMessage(group.id, text);
      // 追加乐观更新的消息
      setMessages(prev => [...prev, {
        id: Date.now(),
        nickname: store.getState().user?.nickname || '我',
        avatar: store.getState().user?.avatar || '😊',
        content: text,
        created_at: new Date().toISOString(),
      }]);
    } catch (error) {
      console.error('发送失败:', error);
      alert(error.message || '发送失败');
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const pad = n => String(n).padStart(2, '0');
    if (isToday) return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return `${pad(d.getMonth()+1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <div className={styles.chatContainer}>
      {/* 聊天头部 */}
      <div className={styles.chatHeader}>
        <button className={styles.backBtn} onClick={onBack}>← 返回</button>
        <div className={styles.chatHeaderInfo}>
          <span className={styles.chatAvatar}>{group.name.charAt(0)}</span>
          <div>
            <h3 className={styles.chatTitle}>{group.name}</h3>
            <span className={styles.chatMemberCount}>{group.member_count || 0} 名成员</span>
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div className={styles.messageList}>
        {loading ? (
          <div className={styles.loading}>加载消息...</div>
        ) : messages.length === 0 ? (
          <div className={styles.emptyChat}>
            <span className={styles.emptyEmoji}>💬</span>
            <p>还没有消息，来打个招呼吧~</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={msg.id || i} className={`${styles.messageItem} ${styles[msg.nickname === (store.getState().user?.nickname || '') ? 'mine' : 'other']}`}>
              <span className={styles.msgAvatar}>{msg.avatar || '👤'}</span>
              <div className={styles.msgBody}>
                <span className={styles.msgNickname}>{msg.nickname || '匿名'}</span>
                <div className={styles.msgBubble}>{msg.content}</div>
                <span className={styles.msgTime}>{formatTime(msg.created_at)}</span>
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* 输入区 */}
      <div className={styles.chatInputArea}>
        <input
          ref={inputRef}
          className={styles.chatInput}
          placeholder={`在 ${group.name} 说点什么...`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMsg()}
        />
        <button
          className={styles.sendBtn}
          onClick={sendMsg}
          disabled={!input.trim() || sending}
        >
          {sending ? '...' : '发送'}
        </button>
      </div>
    </div>
  );
}

function GroupsPage() {
  const [currentGroup, setCurrentGroup] = useState(null);

  if (currentGroup) {
    return <GroupChat group={currentGroup} onBack={() => setCurrentGroup(null)} />;
  }

  return (
    <div className={styles.container}>
      <GroupsList onEnterChat={(group) => setCurrentGroup(group)} />
    </div>
  );
}

export default GroupsPage;
